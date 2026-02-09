'use server'

import connectDB from '@/lib/mongodb'
import Labor from '@/models/Labor'
import Attendance from '@/models/Attendance'
import Payment from '@/models/Payment'
import { revalidatePath } from 'next/cache'
import type { LaborFormData } from '@/types'
import mongoose from 'mongoose'

// Interface for lean result with populated defaultSite
interface LaborLeanResult {
    _id: mongoose.Types.ObjectId
    fullName: string
    phone?: string | null
    role?: string | null
    defaultSiteId?: mongoose.Types.ObjectId | null
    monthlySalary: number
    joiningDate: Date
    status: 'ACTIVE' | 'INACTIVE'
    createdAt: Date
    updatedAt: Date
    defaultSite?: {
        _id: mongoose.Types.ObjectId
        name: string
        address?: string | null
        description?: string | null
        isActive: boolean
    } | null
}

// Interface for attendance lean result with populated site
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
    site?: {
        _id: mongoose.Types.ObjectId
        name: string
    } | null
}

// Interface for payment lean result
interface PaymentLeanResult {
    _id: mongoose.Types.ObjectId
    laborId: mongoose.Types.ObjectId
    date: Date
    amount: number
    paymentType: string
    notes?: string | null
    createdAt: Date
    updatedAt: Date
}

// Get all labors with optional filtering
export async function getLabors(status?: string) {
    try {
        await connectDB()

        const filter = status ? { status } : {}

        const labors = await Labor.find(filter)
            .populate('defaultSite')
            .sort({ createdAt: -1 })
            .lean() as LaborLeanResult[]

        // Transform to match expected format
        const transformedLabors = labors.map(labor => ({
            ...labor,
            id: labor._id.toString(),
            defaultSiteId: labor.defaultSiteId?.toString() || null,
            defaultSite: labor.defaultSite ? {
                ...labor.defaultSite,
                id: (labor.defaultSite as { _id: { toString(): string } })._id.toString(),
            } : null,
        }))

        return { success: true, data: transformedLabors }
    } catch (error) {
        console.error('Error fetching labors:', error)
        return { success: false, error: 'Failed to fetch labors' }
    }
}

// Get a single labor by ID with all relations
export async function getLaborById(id: string) {
    try {
        await connectDB()

        const labor = await Labor.findById(id)
            .populate('defaultSite')
            .lean() as LaborLeanResult | null

        if (!labor) {
            return { success: false, error: 'Labor not found' }
        }

        // Fetch recent attendances for this labor
        const attendances = await Attendance.find({ laborId: id })
            .populate('site', '_id name')
            .sort({ date: -1 })
            .limit(30)
            .lean() as AttendanceLeanResult[]

        // Fetch recent payments for this labor
        const payments = await Payment.find({ laborId: id })
            .sort({ date: -1 })
            .limit(30)
            .lean() as PaymentLeanResult[]

        // Transform to match expected format
        const laborData = {
            ...labor,
            id: labor._id.toString(),
            defaultSiteId: labor.defaultSiteId?.toString() || null,
            defaultSite: labor.defaultSite ? {
                ...labor.defaultSite,
                id: labor.defaultSite._id.toString(),
            } : null,
            attendances: attendances.map(att => ({
                ...att,
                id: att._id.toString(),
                laborId: att.laborId.toString(),
                siteId: att.siteId ? att.siteId.toString() : null,
                site: att.site ? {
                    ...att.site,
                    id: att.site._id.toString(),
                } : null,
            })),
            payments: payments.map(pmt => ({
                ...pmt,
                id: pmt._id.toString(),
                laborId: pmt.laborId.toString(),
            })),
        }

        return { success: true, data: laborData }
    } catch (error) {
        console.error('Error fetching labor:', error)
        return { success: false, error: 'Failed to fetch labor' }
    }
}

// Create a new labor
export async function createLabor(data: LaborFormData) {
    try {
        await connectDB()

        const labor = await Labor.create({
            fullName: data.fullName,
            phone: data.phone || null,
            role: data.role || null,
            defaultSiteId: data.defaultSiteId || null,
            monthlySalary: data.monthlySalary,
            joiningDate: new Date(data.joiningDate),
            status: data.status,
        })

        revalidatePath('/labors')
        revalidatePath('/')

        return {
            success: true,
            data: {
                ...labor.toJSON(),
                id: labor._id.toString(),
            },
        }
    } catch (error) {
        console.error('Error creating labor:', error)
        return { success: false, error: 'Failed to create labor' }
    }
}

// Update an existing labor
export async function updateLabor(id: string, data: LaborFormData) {
    try {
        await connectDB()

        const labor = await Labor.findByIdAndUpdate(
            id,
            {
                fullName: data.fullName,
                phone: data.phone || null,
                role: data.role || null,
                defaultSiteId: data.defaultSiteId || null,
                monthlySalary: data.monthlySalary,
                joiningDate: new Date(data.joiningDate),
                status: data.status,
            },
            { new: true, runValidators: true }
        )

        if (!labor) {
            return { success: false, error: 'Labor not found' }
        }

        revalidatePath('/labors')
        revalidatePath(`/labors/${id}`)
        revalidatePath('/')

        return {
            success: true,
            data: {
                ...labor.toJSON(),
                id: labor._id.toString(),
            },
        }
    } catch (error) {
        console.error('Error updating labor:', error)
        return { success: false, error: 'Failed to update labor' }
    }
}

// Delete a labor
export async function deleteLabor(id: string) {
    try {
        await connectDB()

        // Note: When Attendance and Payment models are migrated,
        // cascade delete behavior will be handled there
        const result = await Labor.findByIdAndDelete(id)

        if (!result) {
            return { success: false, error: 'Labor not found' }
        }

        revalidatePath('/labors')
        revalidatePath('/')

        return { success: true }
    } catch (error) {
        console.error('Error deleting labor:', error)
        return { success: false, error: 'Failed to delete labor' }
    }
}

// Toggle labor status
export async function toggleLaborStatus(id: string) {
    try {
        await connectDB()

        const labor = await Labor.findById(id)

        if (!labor) {
            return { success: false, error: 'Labor not found' }
        }

        labor.status = labor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        await labor.save()

        revalidatePath('/labors')
        revalidatePath(`/labors/${id}`)

        return {
            success: true,
            data: {
                ...labor.toJSON(),
                id: labor._id.toString(),
            },
        }
    } catch (error) {
        console.error('Error toggling labor status:', error)
        return { success: false, error: 'Failed to toggle status' }
    }
}
