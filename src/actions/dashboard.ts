'use server'

import prisma from '@/lib/prisma'
import type { DashboardStats } from '@/types'

// Get dashboard statistics
export async function getDashboardStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)

        // Get labor counts
        const [totalLabors, activeLabors] = await Promise.all([
            prisma.labor.count(),
            prisma.labor.count({ where: { status: 'ACTIVE' } }),
        ])

        // Get today's attendance
        const todayAttendance = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        })

        const presentToday = todayAttendance.filter(
            a => a.attendanceType === 'FULL_DAY' || a.attendanceType === 'HALF_DAY'
        ).length

        const absentToday = todayAttendance.filter(
            a => a.attendanceType === 'ABSENT'
        ).length

        // Get active sites count
        const totalSitesActive = await prisma.workSite.count({ where: { isActive: true } })

        // Calculate monthly salary payable (sum of all active labors' monthly salaries)
        const activeLaborsData = await prisma.labor.findMany({
            where: { status: 'ACTIVE' },
            select: { monthlySalary: true },
        })
        const monthlySalaryPayable = activeLaborsData.reduce((sum, l) => sum + l.monthlySalary, 0)

        // Get monthly payments
        const monthlyPayments = await prisma.payment.groupBy({
            by: ['paymentType'],
            where: {
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
            _sum: { amount: true },
        })

        const monthlyAdvancesGiven = monthlyPayments.find(p => p.paymentType === 'ADVANCE')?._sum.amount || 0
        const monthlyPaymentsMade = monthlyPayments.reduce((sum, p) => sum + (p._sum.amount || 0), 0)

        return {
            success: true,
            data: {
                totalLabors,
                activeLabors,
                presentToday,
                absentToday,
                totalSitesActive,
                monthlySalaryPayable,
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
        const [recentAttendances, recentPayments] = await Promise.all([
            prisma.attendance.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    labor: { select: { fullName: true } },
                    site: { select: { name: true } },
                },
            }),
            prisma.payment.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    labor: { select: { fullName: true } },
                },
            }),
        ])

        // Combine and sort by createdAt
        const activities = [
            ...recentAttendances.map(a => ({
                type: 'attendance' as const,
                id: a.id,
                date: a.createdAt,
                description: `${a.labor.fullName} - ${a.attendanceType.replace('_', ' ')}`,
                details: a.site?.name || 'No site',
            })),
            ...recentPayments.map(p => ({
                type: 'payment' as const,
                id: p.id,
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
