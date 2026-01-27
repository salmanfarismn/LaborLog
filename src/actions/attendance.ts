'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { AttendanceFormData } from '@/types'

// Get attendance for a specific date
export async function getAttendanceByDate(date: string) {
    try {
        const targetDate = new Date(date)
        targetDate.setHours(0, 0, 0, 0)

        const nextDay = new Date(targetDate)
        nextDay.setDate(nextDay.getDate() + 1)

        const attendances = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: targetDate,
                    lt: nextDay,
                },
            },
            include: {
                labor: true,
                site: true,
            },
            orderBy: { labor: { fullName: 'asc' } },
        })

        return { success: true, data: attendances }
    } catch (error) {
        console.error('Error fetching attendance:', error)
        return { success: false, error: 'Failed to fetch attendance' }
    }
}

// Get attendance for a labor in a date range
export async function getLaborAttendance(laborId: string, startDate: string, endDate: string) {
    try {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)

        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)

        const attendances = await prisma.attendance.findMany({
            where: {
                laborId,
                date: {
                    gte: start,
                    lte: end,
                },
            },
            include: { site: true },
            orderBy: { date: 'desc' },
        })

        return { success: true, data: attendances }
    } catch (error) {
        console.error('Error fetching labor attendance:', error)
        return { success: false, error: 'Failed to fetch attendance' }
    }
}

// Create or update attendance (upsert)
export async function saveAttendance(data: AttendanceFormData) {
    try {
        const date = new Date(data.date)
        date.setHours(0, 0, 0, 0)

        const attendance = await prisma.attendance.upsert({
            where: {
                date_laborId: {
                    date,
                    laborId: data.laborId,
                },
            },
            update: {
                siteId: data.siteId || null,
                attendanceType: data.attendanceType,
                checkIn: data.checkIn ? new Date(`${data.date}T${data.checkIn}`) : null,
                checkOut: data.checkOut ? new Date(`${data.date}T${data.checkOut}`) : null,
                totalHours: data.totalHours || null,
                notes: data.notes || null,
            },
            create: {
                date,
                laborId: data.laborId,
                siteId: data.siteId || null,
                attendanceType: data.attendanceType,
                checkIn: data.checkIn ? new Date(`${data.date}T${data.checkIn}`) : null,
                checkOut: data.checkOut ? new Date(`${data.date}T${data.checkOut}`) : null,
                totalHours: data.totalHours || null,
                notes: data.notes || null,
            },
        })

        revalidatePath('/attendance')
        revalidatePath('/')
        return { success: true, data: attendance }
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
        await prisma.attendance.delete({
            where: { id },
        })

        revalidatePath('/attendance')
        return { success: true }
    } catch (error) {
        console.error('Error deleting attendance:', error)
        return { success: false, error: 'Failed to delete attendance' }
    }
}
