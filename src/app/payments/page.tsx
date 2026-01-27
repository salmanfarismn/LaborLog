import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { getPayments } from '@/actions/payments'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Wallet } from 'lucide-react'
import Link from 'next/link'

export default async function PaymentsPage() {
    const result = await getPayments()
    const payments = result.data || []

    // Group payments by month
    const groupedPayments: Record<string, typeof payments> = {}
    payments.forEach(payment => {
        const monthKey = new Date(payment.date).toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric'
        })
        if (!groupedPayments[monthKey]) {
            groupedPayments[monthKey] = []
        }
        groupedPayments[monthKey].push(payment)
    })

    return (
        <div className="animate-fade-in">
            <Header
                title="Payments"
                description="Track all salary and advance payments"
                actions={
                    <Link href="/payments/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Payment
                        </Button>
                    </Link>
                }
            />

            {payments.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={Wallet}
                        title="No payments yet"
                        description="Start by adding your first payment"
                        action={{ label: 'Add Payment', href: '/payments/new' }}
                    />
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedPayments).map(([month, monthPayments]) => {
                        const total = monthPayments.reduce((sum, p) => sum + p.amount, 0)

                        return (
                            <Card key={month}>
                                <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                                    <h3 className="font-semibold text-white">{month}</h3>
                                    <span className="text-emerald-400 font-medium">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                                <CardContent className="py-0">
                                    <div className="divide-y divide-slate-700/30">
                                        {monthPayments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="flex items-center justify-between py-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                                        <Wallet className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {payment.labor?.fullName || 'Unknown'}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            {formatDate(payment.date)} • {payment.notes || 'No notes'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-white">
                                                        {formatCurrency(payment.amount)}
                                                    </p>
                                                    <Badge
                                                        size="sm"
                                                        variant={
                                                            payment.paymentType === 'SALARY' ? 'success' :
                                                                payment.paymentType === 'ADVANCE' ? 'warning' :
                                                                    payment.paymentType === 'BONUS' ? 'info' : 'default'
                                                        }
                                                    >
                                                        {payment.paymentType}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
