'use server'

import connectDB from '@/lib/mongodb'
import Labor from '@/models/Labor'
import WorkSite from '@/models/WorkSite'
import Attendance from '@/models/Attendance'
import Payment from '@/models/Payment'
import type { DashboardStats } from '@/types'
import mongoose from 'mongoose'

// Interface for population results
interface LaborPopulated {
    _id: mongoose.Types.ObjectId
    fullName: string
}

interface SitePopulated {
    _id: mongoose.Types.ObjectId
    name: string
}

interface AttendanceLeanResult {
    _id: mongoose.Types.ObjectId
    date: Date
    attendanceType: string
    createdAt: Date
    labor: LaborPopulated
    site?: SitePopulated | null
}

interface PaymentLeanResult {
    _id: mongoose.Types.ObjectId
    amount: number
    paymentType: string
    createdAt: Date
    labor: LaborPopulated
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
    try {
        await connectDB()

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)

        // Get labor counts
        const [totalLabors, activeLabors] = await Promise.all([
            Labor.countDocuments(),
            Labor.countDocuments({ status: 'ACTIVE' }),
        ])

        // Get today's attendance
        const todayAttendance = await Attendance.find({
            date: {
                $gte: today,
                $lt: tomorrow,
            },
        }).lean()

        const presentToday = todayAttendance.filter(
            a => a.attendanceType === 'FULL_DAY' || a.attendanceType === 'HALF_DAY'
        ).length

        const absentToday = todayAttendance.filter(
            a => a.attendanceType === 'ABSENT'
        ).length

        // Get active sites count
        const totalSitesActive = await WorkSite.countDocuments({ isActive: true })

        // Calculate sum of all active labors' daily wages
        const activeLaborsData = await Labor.find({ status: 'ACTIVE' })
            .select('dailyWage')
            .lean()
        const totalDailyWages = activeLaborsData.reduce((sum, l) => sum + (l.dailyWage || 0), 0)

        // Get monthly payments using aggregation (replaces Prisma groupBy)
        const monthlyPayments = await Payment.aggregate([
            {
                $match: {
                    date: { $gte: startOfMonth, $lte: endOfMonth },
                },
            },
            {
                $group: {
                    _id: '$paymentType',
                    total: { $sum: '$amount' },
                },
            },
        ])

        const monthlyAdvancesGiven = monthlyPayments.find(p => p._id === 'ADVANCE')?.total || 0
        const monthlyPaymentsMade = monthlyPayments.reduce((sum, p) => sum + (p.total || 0), 0)

        return {
            success: true,
            data: {
                totalLabors,
                activeLabors,
                presentToday,
                absentToday,
                totalSitesActive,
                totalDailyWages,
                monthlyAdvancesGiven,
                monthlyPaymentsMade,
            },
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return { success: false, error: 'Failed to fetch dashboard stats' }
    }
}

// Get recent activities
export async function getRecentActivities(limit: number = 10) {
    try {
        await connectDB()

        const [recentAttendances, recentPayments] = await Promise.all([
            Attendance.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('labor', '_id fullName')
                .populate('site', '_id name')
                .lean() as unknown as AttendanceLeanResult[],
            Payment.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('labor', '_id fullName')
                .lean() as unknown as PaymentLeanResult[],
        ])

        // Combine and sort by createdAt
        const activities = [
            ...recentAttendances.map(a => ({
                type: 'attendance' as const,
                id: a._id.toString(),
                date: a.createdAt,
                description: `${a.labor.fullName} - ${a.attendanceType.replace('_', ' ')}`,
                details: a.site?.name || 'No site',
            })),
            ...recentPayments.map(p => ({
                type: 'payment' as const,
                id: p._id.toString(),
                date: p.createdAt,
                description: `${p.labor.fullName} - ₹${p.amount}`,
                details: p.paymentType,
            })),
        ].sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, limit)

        return { success: true, data: activities }
    } catch (error) {
        console.error('Error fetching recent activities:', error)
        return { success: false, error: 'Failed to fetch activities' }
    }
}
