'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { createSite, updateSite, deleteSite } from '@/actions/sites'
import type { SiteFormData } from '@/types'

interface SiteFormProps {
    site?: {
        id: string
        name: string
        address: string | null
        description: string | null
        isActive: boolean
    }
}

export function SiteForm({ site }: SiteFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<SiteFormData>({
        name: site?.name || '',
        address: site?.address || '',
        description: site?.description || '',
        isActive: site?.isActive ?? true,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = site
                ? await updateSite(site.id, formData)
                : await createSite(formData)

            if (result.success) {
                router.push('/sites')
                router.refresh()
            } else {
                setError(result.error || 'Something went wrong')
            }
        } catch {
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!site || !confirm('Are you sure you want to delete this site?')) return

        setIsDeleting(true)
        try {
            const result = await deleteSite(site.id)
            if (result.success) {
                router.push('/sites')
                router.refresh()
            } else {
                setError(result.error || 'Failed to delete')
            }
        } catch {
            setError('An unexpected error occurred')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400">
                    {error}
                </div>
            )}

            <Input
                label="Site Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter site name"
                required
            />

            <Input
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter site address"
            />

            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter site description"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg text-white placeholder-slate-500 bg-slate-800/50 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                />
            </div>

            <Select
                label="Status"
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                ]}
            />

            <div className="flex gap-4 pt-4">
                <Button type="submit" isLoading={isLoading}>
                    {site ? 'Update Site' : 'Create Site'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                {site && (
                    <Button
                        type="button"
                        variant="danger"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                        className="ml-auto"
                    >
                        Delete
                    </Button>
                )}
            </div>
        </form>
    )
}
