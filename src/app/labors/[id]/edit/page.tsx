'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { getLabor, updateLabor, deleteLabor } from '@/actions/labors'
import { getSites } from '@/actions/sites'
import type { WorkSite, LaborFormData } from '@/types'

interface PageProps {
    params: Promise<{ id: string }>
}

export default function EditLaborPage({ params }: PageProps) {
    const { id } = use(params)
    const router = useRouter()
    const [sites, setSites] = useState<WorkSite[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState<LaborFormData>({
        fullName: '',
        phone: '',
        role: '',
        defaultSiteId: '',
        monthlySalary: 0,
        joiningDate: '',
        status: 'ACTIVE',
    })

    useEffect(() => {
        async function loadData() {
            const [laborResult, sitesResult] = await Promise.all([
                getLabor(id),
                getSites(),
            ])

            if (laborResult.success && laborResult.data) {
                const labor = laborResult.data
                setFormData({
                    fullName: labor.fullName,
                    phone: labor.phone || '',
                    role: labor.role || '',
                    defaultSiteId: labor.defaultSiteId || '',
                    monthlySalary: labor.monthlySalary,
                    joiningDate: new Date(labor.joiningDate).toISOString().split('T')[0],
                    status: labor.status as 'ACTIVE' | 'INACTIVE',
                })
            }

            if (sitesResult.success && sitesResult.data) {
                setSites(sitesResult.data)
            }

            setLoading(false)
        }
        loadData()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        if (!formData.fullName.trim()) {
            setError('Name is required')
            setSaving(false)
            return
        }

        const result = await updateLabor(id, formData)

        if (result.success) {
            router.push(`/labors/${id}`)
        } else {
            setError(result.error || 'Failed to update labor')
        }
        setSaving(false)
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this labor? This action cannot be undone.')) {
            return
        }

        setDeleting(true)
        const result = await deleteLabor(id)

        if (result.success) {
            router.push('/labors')
        } else {
            setError(result.error || 'Failed to delete labor')
        }
        setDeleting(false)
    }

    if (loading) {
        return <div className="text-center py-12 text-slate-400">Loading...</div>
    }

    return (
        <div className="animate-fade-in">
            <Header
                title="Edit Labor"
                description="Update worker information"
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
                            label="Full Name *"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Enter full name"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Phone number"
                            />
                            <Input
                                label="Role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="e.g., Mason, Helper"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Monthly Salary (₹)"
                                type="number"
                                value={formData.monthlySalary}
                                onChange={(e) => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
                                placeholder="0"
                            />
                            <Input
                                label="Joining Date"
                                type="date"
                                value={formData.joiningDate}
                                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select
                                label="Default Site"
                                options={sites.map(s => ({ value: s.id, label: s.name }))}
                                value={formData.defaultSiteId}
                                onChange={(e) => setFormData({ ...formData, defaultSiteId: e.target.value })}
                                placeholder="Select a site"
                            />
                            <Select
                                label="Status"
                                options={[
                                    { value: 'ACTIVE', label: 'Active' },
                                    { value: 'INACTIVE', label: 'Inactive' },
                                ]}
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                            />
                        </div>

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
