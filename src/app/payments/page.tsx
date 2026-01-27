import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { getPayments } from '@/actions/payments'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Wallet, Plus, User } from 'lucide-react'
import Link from 'next/link'

export default async function PaymentsPage() {
    const result = await getPayments()
    const payments = result.data || []

    const getPaymentBadgeVariant = (type: string) => {
        switch (type) {
            case 'SALARY': return 'success'
            case 'ADVANCE': return 'warning'
            case 'BONUS': return 'info'
            default: return 'default'
        }
    }

    return (
        <div className="animate-fade-in">
            <Header
                title="Payments"
                description="Track all salary, advances, and payments"
                actions={
                    <Link href="/payments/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Payment
                        </Button>
                    </Link>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    {payments.length === 0 ? (
                        <EmptyState
                            icon={<Wallet className="w-12 h-12" />}
                            title="No Payments Yet"
                            description="Record your first payment or advance"
                            action={
                                <Link href="/payments/new">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add First Payment
                                    </Button>
                                </Link>
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            {payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                            <Wallet className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white">
                                                    {payment.labor?.fullName}
                                                </span>
                                                <Badge variant={getPaymentBadgeVariant(payment.paymentType)}>
                                                    {payment.paymentType}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                                <span>{formatDate(payment.date)}</span>
                                                {payment.notes && (
                                                    <span className="truncate max-w-xs">{payment.notes}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-lg font-semibold text-emerald-400">
                                        {formatCurrency(payment.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
