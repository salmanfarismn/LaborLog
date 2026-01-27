'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createPayment } from '@/actions/payments'
import { getLabors } from '@/actions/labors'
import { getTodayString } from '@/lib/utils'
import type { Labor, PaymentFormData, PaymentType } from '@/types'

export default function NewPaymentPage() {
    const router = useRouter()
    const [labors, setLabors] = useState<Labor[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState<PaymentFormData>({
        laborId: '',
        date: getTodayString(),
        amount: 0,
        paymentType: 'SALARY',
        notes: '',
    })

    useEffect(() => {
        async function loadLabors() {
            const result = await getLabors()
            if (result.success && result.data) {
                setLabors(result.data.filter(l => l.status === 'ACTIVE'))
            }
        }
        loadLabors()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!formData.laborId) {
            setError('Please select a labor')
            setLoading(false)
            return
        }

        if (formData.amount <= 0) {
            setError('Amount must be greater than 0')
            setLoading(false)
            return
        }

        const result = await createPayment(formData)

        if (result.success) {
            router.push('/payments')
        } else {
            setError(result.error || 'Failed to create payment')
        }
        setLoading(false)
    }

    const paymentTypes: { value: PaymentType; label: string }[] = [
        { value: 'SALARY', label: 'Salary' },
        { value: 'ADVANCE', label: 'Advance' },
        { value: 'BONUS', label: 'Bonus' },
        { value: 'OTHER', label: 'Other' },
    ]

    return (
        <div className="animate-fade-in">
            <Header
                title="Add Payment"
                description="Record a new payment or advance"
            />

            <Card className="max-w-2xl">
                <CardContent className="py-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm">
                                {error}
                            </div>
                        )}

                        <Select
                            label="Select Labor *"
                            options={labors.map(l => ({ value: l.id, label: l.fullName }))}
                            value={formData.laborId}
                            onChange={(e) => setFormData({ ...formData, laborId: e.target.value })}
                            placeholder="Choose a labor"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Amount (₹) *"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                placeholder="0"
                            />
                            <Input
                                label="Date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <Select
                            label="Payment Type"
                            options={paymentTypes}
                            value={formData.paymentType}
                            onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as PaymentType })}
                        />

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Optional notes about this payment"
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" isLoading={loading}>
                                Create Payment
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
