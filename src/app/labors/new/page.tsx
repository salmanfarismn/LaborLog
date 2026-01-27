'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createLabor } from '@/actions/labors'
import { getSites } from '@/actions/sites'
import { getTodayString } from '@/lib/utils'
import { useEffect } from 'react'
import type { WorkSite, LaborFormData } from '@/types'

export default function NewLaborPage() {
    const router = useRouter()
    const [sites, setSites] = useState<WorkSite[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState<LaborFormData>({
        fullName: '',
        phone: '',
        role: '',
        defaultSiteId: '',
        monthlySalary: 0,
        joiningDate: getTodayString(),
        status: 'ACTIVE',
    })

    useEffect(() => {
        async function loadSites() {
            const result = await getSites()
            if (result.success && result.data) {
                setSites(result.data.filter(s => s.isActive))
            }
        }
        loadSites()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!formData.fullName.trim()) {
            setError('Name is required')
            setLoading(false)
            return
        }

        const result = await createLabor(formData)

        if (result.success) {
            router.push('/labors')
        } else {
            setError(result.error || 'Failed to create labor')
        }
        setLoading(false)
    }

    return (
        <div className="animate-fade-in">
            <Header
                title="Add New Labor"
                description="Create a new worker record"
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

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" isLoading={loading}>
                                Create Labor
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
