'use server'

import connectDB from '@/lib/mongodb'
import Attendance from '@/models/Attendance'
import Labor from '@/models/Labor'
import { revalidatePath } from 'next/cache'
import type { AttendanceFormData } from '@/types'
import mongoose from 'mongoose'

// Interface for lean result with populated labor and site
interface AttendanceLeanResult {
    _id: mongoose.Types.ObjectId
    date: Date
    laborId: mongoose.Types.ObjectId
    siteId?: mongoose.Types.ObjectId | null
    attendanceType: string
    checkIn?: Date | null
    checkOut?: Date | null
    totalHours?: number | null
    notes?: string | null
    createdAt: Date
    updatedAt: Date
    labor?: {
        _id: mongoose.Types.ObjectId
        fullName: string
    } | null
    site?: {
        _id: mongoose.Types.ObjectId
        name: string
    } | null
}

// Get attendance for a specific date
export async function getAttendanceByDate(date: string) {
    try {
        await connectDB()

        const targetDate = new Date(date)
        targetDate.setHours(0, 0, 0, 0)

        const nextDay = new Date(targetDate)
        nextDay.setDate(nextDay.getDate() + 1)

        const attendances = await Attendance.find({
            date: {
                $gte: targetDate,
                $lt: nextDay,
            },
        })
            .populate('labor', '_id fullName')
            .populate('site', '_id name')
            .sort({ 'labor.fullName': 1 })
            .lean() as AttendanceLeanResult[]

        // Transform to match expected format
        const transformed = attendances.map(att => ({
            ...att,
            id: att._id.toString(),
            laborId: att.laborId.toString(),
            siteId: att.siteId?.toString() || null,
            labor: att.labor ? {
                ...att.labor,
                id: att.labor._id.toString(),
            } : null,
            site: att.site ? {
                ...att.site,
                id: att.site._id.toString(),
            } : null,
        }))

        return { success: true, data: transformed }
    } catch (error) {
        console.error('Error fetching attendance:', error)
        return { success: false, error: 'Failed to fetch attendance' }
    }
}

// Get attendance for a labor in a date range
export async function getLaborAttendance(laborId: string, startDate: string, endDate: string) {
    try {
        await connectDB()

        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)

        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)

        const attendances = await Attendance.find({
            laborId,
            date: {
                $gte: start,
                $lte: end,
            },
        })
            .populate('site', '_id name')
            .sort({ date: -1 })
            .lean() as AttendanceLeanResult[]

        // Transform to match expected format
        const transformed = attendances.map(att => ({
            ...att,
            id: att._id.toString(),
            laborId: att.laborId.toString(),
            siteId: att.siteId?.toString() || null,
            site: att.site ? {
                ...att.site,
                id: att.site._id.toString(),
            } : null,
        }))

        return { success: true, data: transformed }
    } catch (error) {
        console.error('Error fetching labor attendance:', error)
        return { success: false, error: 'Failed to fetch attendance' }
    }
}

// Get monthly attendance summary for all labors
export async function getMonthlyAttendanceSummary(year: number, month: number) {
    try {
        await connectDB()

        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

        // Use MongoDB aggregation pipeline (replaces Prisma groupBy)
        const attendanceAgg = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: { laborId: '$laborId', attendanceType: '$attendanceType' },
                    count: { $sum: 1 },
                },
            },
        ])

        // Get all active labors
        const labors = await Labor.find({ status: 'ACTIVE' })
            .select('_id fullName dailyWage')
            .lean()

        // Calculate summary for each labor
        const summary = labors.map(labor => {
            const laborIdStr = labor._id.toString()
            const laborAttendances = attendanceAgg.filter(
                a => a._id.laborId.toString() === laborIdStr
            )

            const fullDays = laborAttendances.find(a => a._id.attendanceType === 'FULL_DAY')?.count || 0
            const halfDays = laborAttendances.find(a => a._id.attendanceType === 'HALF_DAY')?.count || 0
            const absents = laborAttendances.find(a => a._id.attendanceType === 'ABSENT')?.count || 0

            const effectiveDays = fullDays + (halfDays * 0.5)
            const dailyRate = labor.dailyWage // Direct daily wage
            const calculatedSalary = effectiveDays * dailyRate

            return {
                laborId: laborIdStr,
                laborName: labor.fullName,
                fullDays,
                halfDays,
                absents,
                customHours: 0,
                totalWorkDays: fullDays + halfDays,
                dailyWage: labor.dailyWage,
                calculatedSalary: Math.round(calculatedSalary),
            }
        })

        return { success: true, data: summary }
    } catch (error) {
        console.error('Error fetching monthly summary:', error)
        return { success: false, error: 'Failed to fetch summary' }
    }
}

// Create or update attendance (upsert)
export async function saveAttendance(data: AttendanceFormData) {
    try {
        await connectDB()

        const date = new Date(data.date)
        date.setHours(0, 0, 0, 0)

        // Use findOneAndUpdate with upsert for atomic operation
        const attendance = await Attendance.findOneAndUpdate(
            {
                date,
                laborId: data.laborId,
            },
            {
                $set: {
                    siteId: data.siteId || null,
                    attendanceType: data.attendanceType,
                    checkIn: data.checkIn ? new Date(`${data.date}T${data.checkIn}`) : null,
                    checkOut: data.checkOut ? new Date(`${data.date}T${data.checkOut}`) : null,
                    totalHours: data.totalHours || null,
                    notes: data.notes || null,
                },
                $setOnInsert: {
                    date,
                    laborId: data.laborId,
                },
            },
            { upsert: true, new: true, runValidators: true }
        )

        revalidatePath('/attendance')
        revalidatePath('/')

        return {
            success: true,
            data: {
                ...attendance.toJSON(),
                id: attendance._id.toString(),
            },
        }
    } catch (error) {
        console.error('Error saving attendance:', error)
        return { success: false, error: 'Failed to save attendance' }
    }
}

// Bulk save attendance for multiple labors
export async function bulkSaveAttendance(attendances: AttendanceFormData[]) {
    try {
        const results = await Promise.all(
            attendances.map(data => saveAttendance(data))
        )

        const failed = results.filter(r => !r.success)
        if (failed.length > 0) {
            return { success: false, error: `${failed.length} records failed to save` }
        }

        revalidatePath('/attendance')
        revalidatePath('/')

        return { success: true, data: results.map(r => r.data) }
    } catch (error) {
        console.error('Error bulk saving attendance:', error)
        return { success: false, error: 'Failed to save attendance' }
    }
}

// Delete attendance record
export async function deleteAttendance(id: string) {
    try {
        await connectDB()

        const result = await Attendance.findByIdAndDelete(id)

        if (!result) {
            return { success: false, error: 'Attendance record not found' }
        }

        revalidatePath('/attendance')

        return { success: true }
    } catch (error) {
        console.error('Error deleting attendance:', error)
        return { success: false, error: 'Failed to delete attendance' }
    }
}
