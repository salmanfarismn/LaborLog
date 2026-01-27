import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getLabor } from '@/actions/labors'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Edit, Phone, MapPin, Calendar, Wallet, Clock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function LaborDetailPage({ params }: PageProps) {
    const { id } = await params
    const result = await getLabor(id)

    if (!result.success || !result.data) {
        notFound()
    }

    const labor = result.data

    return (
        <div className="animate-fade-in">
            <Header
                title={labor.fullName}
                description={labor.role || 'Labor'}
                actions={
                    <Link href={`/labors/${id}/edit`}>
                        <Button variant="secondary">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                }
            />

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Main Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Personal Details
                            <Badge variant={labor.status === 'ACTIVE' ? 'success' : 'error'}>
                                {labor.status}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                            {labor.phone && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Phone</p>
                                        <p className="text-white">{labor.phone}</p>
                                    </div>
                                </div>
                            )}
                            {labor.defaultSite && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                                    <MapPin className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Default Site</p>
                                        <p className="text-white">{labor.defaultSite.name}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Joining Date</p>
                                    <p className="text-white">{formatDate(labor.joiningDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                                <Wallet className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Monthly Salary</p>
                                    <p className="text-white font-semibold">{formatCurrency(labor.monthlySalary)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">Attendance this month</span>
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    {labor.attendances?.length || 0} days
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                                    <Wallet className="w-4 h-4" />
                                    <span className="text-sm">Payments received</span>
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    {formatCurrency(labor.payments?.reduce((sum, p) => sum + p.amount, 0) || 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Attendance */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!labor.attendances || labor.attendances.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No attendance records yet</p>
                        ) : (
                            <div className="space-y-2">
                                {labor.attendances.slice(0, 10).map((att) => (
                                    <div
                                        key={att.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant={
                                                    att.attendanceType === 'FULL_DAY' ? 'success' :
                                                        att.attendanceType === 'HALF_DAY' ? 'warning' : 'error'
                                                }
                                            >
                                                {att.attendanceType.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-white">{formatDate(att.date)}</span>
                                        </div>
                                        {att.site && (
                                            <span className="text-slate-400 text-sm">{att.site.name}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Payments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!labor.payments || labor.payments.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No payments yet</p>
                        ) : (
                            <div className="space-y-2">
                                {labor.payments.slice(0, 5).map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
                                    >
                                        <div>
                                            <Badge variant={payment.paymentType === 'ADVANCE' ? 'warning' : 'success'}>
                                                {payment.paymentType}
                                            </Badge>
                                            <p className="text-xs text-slate-500 mt-1">{formatDate(payment.date)}</p>
                                        </div>
                                        <span className="font-semibold text-emerald-400">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
