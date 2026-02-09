import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getLaborById } from '@/actions/labors'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Edit, Calendar, Wallet, MapPin, Phone, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface LaborProfilePageProps {
    params: Promise<{ id: string }>
}

export default async function LaborProfilePage({ params }: LaborProfilePageProps) {
    const { id } = await params
    const result = await getLaborById(id)

    if (!result.success || !result.data) {
        notFound()
    }

    const labor = result.data
    const attendances = labor.attendances || []
    const payments = labor.payments || []

    // Calculate attendance summary
    const fullDays = attendances.filter(a => a.attendanceType === 'FULL_DAY').length
    const halfDays = attendances.filter(a => a.attendanceType === 'HALF_DAY').length
    const absents = attendances.filter(a => a.attendanceType === 'ABSENT').length

    // Calculate payment summary
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
    const advances = payments.filter(p => p.paymentType === 'ADVANCE').reduce((sum, p) => sum + p.amount, 0)

    return (
        <div className="animate-fade-in">
            <Header
                title={labor.fullName}
                description={labor.role || 'Worker'}
                actions={
                    <Link href={`/labors/${id}/edit`}>
                        <Button variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                }
            />

            {/* Profile Overview */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-8">
                <Card className="lg:col-span-1">
                    <CardContent className="py-6">
                        <div className="text-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                                {labor.fullName.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold text-white">{labor.fullName}</h2>
                            <p className="text-slate-400">{labor.role || 'Worker'}</p>
                            <Badge
                                variant={labor.status === 'ACTIVE' ? 'success' : 'danger'}
                                className="mt-2"
                            >
                                {labor.status}
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Wallet className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-400">Daily Wage:</span>
                                <span className="text-white font-medium ml-auto">
                                    {formatCurrency(labor.dailyWage)}/day
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-400">Joined:</span>
                                <span className="text-white ml-auto">{formatDate(labor.joiningDate)}</span>
                            </div>
                            {labor.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    <span className="text-slate-400">Phone:</span>
                                    <span className="text-white ml-auto">{labor.phone}</span>
                                </div>
                            )}
                            {labor.defaultSite && (
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-5 h-5 text-slate-400" />
                                    <span className="text-slate-400">Site:</span>
                                    <span className="text-white ml-auto">{labor.defaultSite.name}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 grid gap-4 grid-cols-2 sm:grid-cols-4">
                    <Card gradient>
                        <CardContent className="py-4 text-center">
                            <p className="text-2xl font-bold text-white">{fullDays}</p>
                            <p className="text-sm text-slate-400">Full Days</p>
                        </CardContent>
                    </Card>
                    <Card gradient>
                        <CardContent className="py-4 text-center">
                            <p className="text-2xl font-bold text-white">{halfDays}</p>
                            <p className="text-sm text-slate-400">Half Days</p>
                        </CardContent>
                    </Card>
                    <Card gradient>
                        <CardContent className="py-4 text-center">
                            <p className="text-2xl font-bold text-white">{absents}</p>
                            <p className="text-sm text-slate-400">Absents</p>
                        </CardContent>
                    </Card>
                    <Card gradient>
                        <CardContent className="py-4 text-center">
                            <p className="text-2xl font-bold text-emerald-400">
                                {formatCurrency(totalPayments)}
                            </p>
                            <p className="text-sm text-slate-400">Total Paid</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Attendance & Payments */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                            Recent Attendance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {attendances.length === 0 ? (
                            <p className="text-slate-400 text-center py-4">No attendance records</p>
                        ) : (
                            <div className="space-y-2">
                                {attendances.slice(0, 10).map((att) => (
                                    <div
                                        key={att.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
                                    >
                                        <div>
                                            <p className="text-sm text-white">{formatDate(att.date)}</p>
                                            <p className="text-xs text-slate-500">{att.site?.name || 'No site'}</p>
                                        </div>
                                        <Badge
                                            variant={
                                                att.attendanceType === 'FULL_DAY' ? 'success' :
                                                    att.attendanceType === 'HALF_DAY' ? 'warning' :
                                                        att.attendanceType === 'ABSENT' ? 'danger' : 'info'
                                            }
                                        >
                                            {att.attendanceType.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-emerald-400" />
                            Recent Payments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {payments.length === 0 ? (
                            <p className="text-slate-400 text-center py-4">No payment records</p>
                        ) : (
                            <div className="space-y-2">
                                {payments.slice(0, 10).map((pmt) => (
                                    <div
                                        key={pmt.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
                                    >
                                        <div>
                                            <p className="text-sm text-white">{formatDate(pmt.date)}</p>
                                            <p className="text-xs text-slate-500">{pmt.notes || pmt.paymentType}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-emerald-400">
                                                {formatCurrency(pmt.amount)}
                                            </p>
                                            <Badge size="sm" variant={
                                                pmt.paymentType === 'SALARY' ? 'success' :
                                                    pmt.paymentType === 'ADVANCE' ? 'warning' :
                                                        pmt.paymentType === 'BONUS' ? 'info' : 'default'
                                            }>
                                                {pmt.paymentType}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-slate-700">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Total Advances:</span>
                                <span className="text-amber-400 font-medium">{formatCurrency(advances)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
