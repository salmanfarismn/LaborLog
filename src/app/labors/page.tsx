import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { getLabors } from '@/actions/labors'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, Plus, Phone, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function LaborsPage() {
    const result = await getLabors()
    const labors = result.data || []

    return (
        <div className="animate-fade-in">
            <Header
                title="Labors"
                description="Manage your workers and employees"
                actions={
                    <Link href="/labors/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Labor
                        </Button>
                    </Link>
                }
            />

            {labors.length === 0 ? (
                <Card>
                    <CardContent>
                        <EmptyState
                            icon={<Users className="w-12 h-12" />}
                            title="No Labors Yet"
                            description="Start by adding your first labor to the system"
                            action={
                                <Link href="/labors/new">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add First Labor
                                    </Button>
                                </Link>
                            }
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {labors.map((labor) => (
                        <Link key={labor.id} href={`/labors/${labor.id}`}>
                            <Card className="h-full hover:border-indigo-500/50 transition-colors cursor-pointer">
                                <CardContent className="py-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                                <span className="text-lg font-bold text-indigo-400">
                                                    {labor.fullName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{labor.fullName}</h3>
                                                {labor.role && (
                                                    <p className="text-sm text-slate-400">{labor.role}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant={labor.status === 'ACTIVE' ? 'success' : 'error'}>
                                            {labor.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {labor.phone && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Phone className="w-4 h-4" />
                                                <span>{labor.phone}</span>
                                            </div>
                                        )}
                                        {labor.defaultSite && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <MapPin className="w-4 h-4" />
                                                <span>{labor.defaultSite.name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>Joined {formatDate(labor.joiningDate)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-700">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">Monthly Salary</span>
                                            <span className="font-semibold text-white">
                                                {formatCurrency(labor.monthlySalary)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
