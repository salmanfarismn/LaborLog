'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { createLabor, updateLabor } from '@/actions/labors'
import type { LaborFormData, WorkSite, Labor } from '@/types'
import { formatDateForInput } from '@/lib/utils'

interface LaborFormProps {
    labor?: Labor & { defaultSite?: WorkSite | null }
    sites: WorkSite[]
}

export function LaborForm({ labor, sites }: LaborFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<LaborFormData>({
        fullName: labor?.fullName || '',
        phone: labor?.phone || '',
        role: labor?.role || '',
        defaultSiteId: labor?.defaultSiteId || '',
        monthlySalary: labor?.monthlySalary || 0,
        joiningDate: labor ? formatDateForInput(labor.joiningDate) : formatDateForInput(new Date()),
        status: (labor?.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = labor
                ? await updateLabor(labor.id, formData)
                : await createLabor(formData)

            if (result.success) {
                router.push('/labors')
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

    const siteOptions = sites.map(site => ({
        value: site.id,
        label: site.name,
    }))

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400">
                    {error}
                </div>
            )}

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <Input
                    label="Full Name *"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    required
                />

                <Input
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    type="tel"
                />

                <Input
                    label="Role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Mason, Helper, Driver"
                />

                <Select
                    label="Default Site"
                    value={formData.defaultSiteId}
                    onChange={(e) => setFormData({ ...formData, defaultSiteId: e.target.value })}
                    options={siteOptions}
                    placeholder="Select a site"
                />

                <Input
                    label="Monthly Salary *"
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
                    type="number"
                    min="0"
                    required
                />

                <Input
                    label="Joining Date *"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    type="date"
                    required
                />

                <Select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    options={[
                        { value: 'ACTIVE', label: 'Active' },
                        { value: 'INACTIVE', label: 'Inactive' },
                    ]}
                />
            </div>

            <div className="flex gap-4 pt-4">
                <Button type="submit" isLoading={isLoading}>
                    {labor ? 'Update Labor' : 'Create Labor'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}
