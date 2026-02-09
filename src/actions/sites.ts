'use server'

import connectDB from '@/lib/mongodb'
import WorkSite from '@/models/WorkSite'
import Labor from '@/models/Labor'
import Attendance from '@/models/Attendance'
import { revalidatePath } from 'next/cache'
import type { SiteFormData } from '@/types'

// Get all work sites
export async function getSites(activeOnly: boolean = false) {
    try {
        await connectDB()

        const filter = activeOnly ? { isActive: true } : {}

        const sites = await WorkSite.find(filter)
            .sort({ createdAt: -1 })
            .lean()

        // Get labor counts for each site
        const sitesWithCount = await Promise.all(
            sites.map(async site => {
                const laborCount = await Labor.countDocuments({ defaultSiteId: site._id })
                return {
                    ...site,
                    id: site._id.toString(),
                    _count: {
                        labors: laborCount,
                    },
                }
            })
        )

        return { success: true, data: sitesWithCount }
    } catch (error) {
        console.error('Error fetching sites:', error)
        return { success: false, error: 'Failed to fetch sites' }
    }
}

// Get a single site by ID
export async function getSiteById(id: string) {
    try {
        await connectDB()

        const site = await WorkSite.findById(id).lean()

        if (!site) {
            return { success: false, error: 'Site not found' }
        }

        // Get active labors assigned to this site
        const labors = await Labor.find({ defaultSiteId: id, status: 'ACTIVE' })
            .select('_id fullName role')
            .lean()

        // Get attendance count for this site
        const attendanceCount = await Attendance.countDocuments({ siteId: id })

        // Transform to match expected format
        const siteData = {
            ...site,
            id: site._id.toString(),
            labors: labors.map(l => ({
                id: l._id.toString(),
                fullName: l.fullName,
                role: l.role,
            })),
            _count: {
                attendances: attendanceCount,
            },
        }

        return { success: true, data: siteData }
    } catch (error) {
        console.error('Error fetching site:', error)
        return { success: false, error: 'Failed to fetch site' }
    }
}

// Create a new site
export async function createSite(data: SiteFormData) {
    try {
        await connectDB()

        const site = await WorkSite.create({
            name: data.name,
            address: data.address || null,
            description: data.description || null,
            isActive: data.isActive,
        })

        revalidatePath('/sites')
        revalidatePath('/')

        return {
            success: true,
            data: {
                ...site.toJSON(),
                id: site._id.toString(),
            },
        }
    } catch (error) {
        console.error('Error creating site:', error)
        return { success: false, error: 'Failed to create site' }
    }
}

// Update an existing site
export async function updateSite(id: string, data: SiteFormData) {
    try {
        await connectDB()

        const site = await WorkSite.findByIdAndUpdate(
            id,
            {
                name: data.name,
                address: data.address || null,
                description: data.description || null,
                isActive: data.isActive,
            },
            { new: true, runValidators: true }
        )

        if (!site) {
            return { success: false, error: 'Site not found' }
        }

        revalidatePath('/sites')
        revalidatePath(`/sites/${id}`)

        return {
            success: true,
            data: {
                ...site.toJSON(),
                id: site._id.toString(),
            },
        }
    } catch (error) {
        console.error('Error updating site:', error)
        return { success: false, error: 'Failed to update site' }
    }
}

// Delete a site
export async function deleteSite(id: string) {
    try {
        await connectDB()

        // Clear defaultSiteId for labors that have this as their default site
        await Labor.updateMany(
            { defaultSiteId: id },
            { $set: { defaultSiteId: null } }
        )

        const result = await WorkSite.findByIdAndDelete(id)

        if (!result) {
            return { success: false, error: 'Site not found' }
        }

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
        await connectDB()

        const site = await WorkSite.findById(id)

        if (!site) {
            return { success: false, error: 'Site not found' }
        }

        site.isActive = !site.isActive
        await site.save()

        revalidatePath('/sites')

        return {
            success: true,
            data: {
                ...site.toJSON(),
                id: site._id.toString(),
            },
        }
    } catch (error) {
        console.error('Error toggling site status:', error)
        return { success: false, error: 'Failed to toggle status' }
    }
}
