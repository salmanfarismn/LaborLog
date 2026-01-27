'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { getSite, updateSite, deleteSite } from '@/actions/sites'
import type { WorkSiteFormData } from '@/types'

interface PageProps {
    params: Promise<{ id: string }>
}

export default function EditSitePage({ params }: PageProps) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState<WorkSiteFormData>({
        name: '',
        address: '',
        description: '',
        isActive: true,
    })

    useEffect(() => {
        async function loadData() {
            const result = await getSite(id)

            if (result.success && result.data) {
                const site = result.data
                setFormData({
                    name: site.name,
                    address: site.address || '',
                    description: site.description || '',
                    isActive: site.isActive,
                })
            }

            setLoading(false)
        }
        loadData()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        if (!formData.name.trim()) {
            setError('Site name is required')
            setSaving(false)
            return
        }

        const result = await updateSite(id, formData)

        if (result.success) {
            router.push(`/sites/${id}`)
        } else {
            setError(result.error || 'Failed to update site')
        }
        setSaving(false)
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this site? This action cannot be undone.')) {
            return
        }

        setDeleting(true)
        const result = await deleteSite(id)

        if (result.success) {
            router.push('/sites')
        } else {
            setError(result.error || 'Failed to delete site')
        }
        setDeleting(false)
    }

    if (loading) {
        return <div className="text-center py-12 text-slate-400">Loading...</div>
    }

    return (
        <div className="animate-fade-in">
            <Header
                title="Edit Site"
                description="Update site information"
            />

            <Card className="max-w-2xl">
                <CardContent className="py-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Site Name *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter site name"
                        />

                        <Input
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Site address"
                        />

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Additional details about this site"
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                            />
                        </div>

                        <Select
                            label="Status"
                            options={[
                                { value: 'true', label: 'Active' },
                                { value: 'false', label: 'Inactive' },
                            ]}
                            value={String(formData.isActive)}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                        />

                        <div className="flex justify-between gap-3 pt-4">
                            <div className="flex gap-3">
                                <Button type="submit" isLoading={saving}>
                                    Save Changes
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                            </div>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleDelete}
                                isLoading={deleting}
                            >
                                Delete
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
