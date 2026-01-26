'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { createPayment } from '@/actions/payments'
import type { PaymentFormData, PaymentType, Labor } from '@/types'
import { formatDateForInput } from '@/lib/utils'

interface PaymentFormProps {
    labors: Pick<Labor, 'id' | 'fullName'>[]
    defaultLaborId?: string
}

export function PaymentForm({ labors, defaultLaborId }: PaymentFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<PaymentFormData>({
        laborId: defaultLaborId || '',
        date: formatDateForInput(new Date()),
        amount: 0,
        paymentType: 'SALARY',
        notes: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (!formData.laborId) {
            setError('Please select a labor')
            setIsLoading(false)
            return
        }

        if (formData.amount <= 0) {
            setError('Amount must be greater than 0')
            setIsLoading(false)
            return
        }

        try {
            const result = await createPayment(formData)

            if (result.success) {
                router.push('/payments')
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

    const laborOptions = labors.map(labor => ({
        value: labor.id,
        label: labor.fullName,
    }))

    const paymentTypeOptions = [
        { value: 'SALARY', label: 'Salary Payment' },
        { value: 'ADVANCE', label: 'Advance' },
        { value: 'BONUS', label: 'Bonus' },
        { value: 'OTHER', label: 'Other' },
    ]

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400">
                    {error}
                </div>
            )}

            <Select
                label="Labor *"
                value={formData.laborId}
                onChange={(e) => setFormData({ ...formData, laborId: e.target.value })}
                options={laborOptions}
                placeholder="Select a labor"
            />

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <Input
                    label="Amount *"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    required
                />

                <Input
                    label="Date *"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    type="date"
                    required
                />
            </div>

            <Select
                label="Payment Type *"
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as PaymentType })}
                options={paymentTypeOptions}
            />

            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Notes</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes about this payment"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg text-white placeholder-slate-500 bg-slate-800/50 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                />
            </div>

            <div className="flex gap-4 pt-4">
                <Button type="submit" isLoading={isLoading}>
                    Add Payment
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}
