'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { WorkSiteFormData } from '@/types'

// Get all work sites
export async function getSites(activeOnly: boolean = false) {
    try {
        const sites = await prisma.workSite.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            include: {
                _count: {
                    select: { labors: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
        return { success: true, data: sites }
    } catch (error) {
        console.error('Error fetching sites:', error)
        return { success: false, error: 'Failed to fetch sites' }
    }
}

// Get a single site by ID
export async function getSiteById(id: string) {
    try {
        const site = await prisma.workSite.findUnique({
            where: { id },
            include: {
                labors: {
                    where: { status: 'ACTIVE' },
                    select: { id: true, fullName: true, role: true },
                },
                _count: {
                    select: { attendances: true },
                },
            },
        })

        if (!site) {
            return { success: false, error: 'Site not found' }
        }

        return { success: true, data: site }
    } catch (error) {
        console.error('Error fetching site:', error)
        return { success: false, error: 'Failed to fetch site' }
    }
}

// Alias for backward compatibility
export const getSite = getSiteById

// Create a new site
export async function createSite(data: WorkSiteFormData) {
    try {
        const site = await prisma.workSite.create({
            data: {
                name: data.name,
                address: data.address || null,
                description: data.description || null,
                isActive: data.isActive,
            },
        })

        revalidatePath('/sites')
        revalidatePath('/')
        return { success: true, data: site }
    } catch (error) {
        console.error('Error creating site:', error)
        return { success: false, error: 'Failed to create site' }
    }
}

// Update an existing site
export async function updateSite(id: string, data: WorkSiteFormData) {
    try {
        const site = await prisma.workSite.update({
            where: { id },
            data: {
                name: data.name,
                address: data.address || null,
                description: data.description || null,
                isActive: data.isActive,
            },
        })

        revalidatePath('/sites')
        revalidatePath(`/sites/${id}`)
        return { success: true, data: site }
    } catch (error) {
        console.error('Error updating site:', error)
        return { success: false, error: 'Failed to update site' }
    }
}

// Delete a site
export async function deleteSite(id: string) {
    try {
        // First update all labors that have this as default site
        await prisma.labor.updateMany({
            where: { defaultSiteId: id },
            data: { defaultSiteId: null },
        })

        await prisma.workSite.delete({
            where: { id },
        })

        revalidatePath('/sites')
        revalidatePath('/labors')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error deleting site:', error)
        return { success: false, error: 'Failed to delete site' }
    }
}

// Toggle site active status
export async function toggleSiteStatus(id: string) {
    try {
        const site = await prisma.workSite.findUnique({ where: { id } })
        if (!site) {
            return { success: false, error: 'Site not found' }
        }

        const updatedSite = await prisma.workSite.update({
            where: { id },
            data: {
                isActive: !site.isActive,
            },
        })

        revalidatePath('/sites')
        return { success: true, data: updatedSite }
    } catch (error) {
        console.error('Error toggling site status:', error)
        return { success: false, error: 'Failed to toggle status' }
    }
}
