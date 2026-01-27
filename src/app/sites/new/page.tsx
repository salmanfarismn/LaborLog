'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createSite } from '@/actions/sites'
import type { WorkSiteFormData } from '@/types'

export default function NewSitePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState<WorkSiteFormData>({
        name: '',
        address: '',
        description: '',
        isActive: true,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!formData.name.trim()) {
            setError('Site name is required')
            setLoading(false)
            return
        }

        const result = await createSite(formData)

        if (result.success) {
            router.push('/sites')
        } else {
            setError(result.error || 'Failed to create site')
        }
        setLoading(false)
    }

    return (
        <div className="animate-fade-in">
            <Header
                title="Add New Site"
                description="Create a new work location"
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

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" isLoading={loading}>
                                Create Site
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
