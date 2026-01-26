'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { LaborFormData } from '@/types'

// Get all labors with optional filtering
export async function getLabors(status?: string) {
    try {
        const labors = await prisma.labor.findMany({
            where: status ? { status } : undefined,
            include: {
                defaultSite: true,
            },
            orderBy: { createdAt: 'desc' },
        })
        return { success: true, data: labors }
    } catch (error) {
        console.error('Error fetching labors:', error)
        return { success: false, error: 'Failed to fetch labors' }
    }
}

// Get a single labor by ID with all relations
export async function getLaborById(id: string) {
    try {
        const labor = await prisma.labor.findUnique({
            where: { id },
            include: {
                defaultSite: true,
                attendances: {
                    orderBy: { date: 'desc' },
                    take: 30,
                    include: { site: true },
                },
                payments: {
                    orderBy: { date: 'desc' },
                    take: 20,
                },
            },
        })

        if (!labor) {
            return { success: false, error: 'Labor not found' }
        }

        return { success: true, data: labor }
    } catch (error) {
        console.error('Error fetching labor:', error)
        return { success: false, error: 'Failed to fetch labor' }
    }
}

// Create a new labor
export async function createLabor(data: LaborFormData) {
    try {
        const labor = await prisma.labor.create({
            data: {
                fullName: data.fullName,
                phone: data.phone || null,
                role: data.role || null,
                defaultSiteId: data.defaultSiteId || null,
                monthlySalary: data.monthlySalary,
                joiningDate: new Date(data.joiningDate),
                status: data.status,
            },
        })

        revalidatePath('/labors')
        revalidatePath('/')
        return { success: true, data: labor }
    } catch (error) {
        console.error('Error creating labor:', error)
        return { success: false, error: 'Failed to create labor' }
    }
}

// Update an existing labor
export async function updateLabor(id: string, data: LaborFormData) {
    try {
        const labor = await prisma.labor.update({
            where: { id },
            data: {
                fullName: data.fullName,
                phone: data.phone || null,
                role: data.role || null,
                defaultSiteId: data.defaultSiteId || null,
                monthlySalary: data.monthlySalary,
                joiningDate: new Date(data.joiningDate),
                status: data.status,
            },
        })

        revalidatePath('/labors')
        revalidatePath(`/labors/${id}`)
        revalidatePath('/')
        return { success: true, data: labor }
    } catch (error) {
        console.error('Error updating labor:', error)
        return { success: false, error: 'Failed to update labor' }
    }
}

// Delete a labor
export async function deleteLabor(id: string) {
    try {
        await prisma.labor.delete({
            where: { id },
        })

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
        const labor = await prisma.labor.findUnique({ where: { id } })
        if (!labor) {
            return { success: false, error: 'Labor not found' }
        }

        const updatedLabor = await prisma.labor.update({
            where: { id },
            data: {
                status: labor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
            },
        })

        revalidatePath('/labors')
        revalidatePath(`/labors/${id}`)
        return { success: true, data: updatedLabor }
    } catch (error) {
        console.error('Error toggling labor status:', error)
        return { success: false, error: 'Failed to toggle status' }
    }
}
