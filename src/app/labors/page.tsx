import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { getLabors } from '@/actions/labors'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Users } from 'lucide-react'
import Link from 'next/link'

export default async function LaborsPage() {
    const result = await getLabors()
    const labors = result.data || []

    return (
        <div className="animate-fade-in">
            <Header
                title="Labors"
                description="Manage your workforce"
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
                    <EmptyState
                        icon={Users}
                        title="No labors yet"
                        description="Start by adding your first labor to the system"
                        action={{ label: 'Add Labor', href: '/labors/new' }}
                    />
                </Card>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {labors.map((labor) => (
                        <Link key={labor.id} href={`/labors/${labor.id}`}>
                            <Card hover className="h-full">
                                <CardContent className="py-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                                                {labor.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{labor.fullName}</h3>
                                                <p className="text-sm text-slate-400">{labor.role || 'Worker'}</p>
                                            </div>
                                        </div>
                                        <Badge variant={labor.status === 'ACTIVE' ? 'success' : 'danger'}>
                                            {labor.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Daily Wage</span>
                                            <span className="text-white font-medium">
                                                {formatCurrency(labor.dailyWage)}/day
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Joined</span>
                                            <span className="text-slate-300">{formatDate(labor.joiningDate)}</span>
                                        </div>
                                        {labor.defaultSite && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Site</span>
                                                <span className="text-slate-300">{labor.defaultSite.name}</span>
                                            </div>
                                        )}
                                        {labor.phone && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Phone</span>
                                                <span className="text-slate-300">{labor.phone}</span>
                                            </div>
                                        )}
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
