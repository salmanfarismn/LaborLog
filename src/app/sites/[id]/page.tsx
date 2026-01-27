import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getSite } from '@/actions/sites'
import { formatDate } from '@/lib/utils'
import { Edit, MapPin, Users, Calendar } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function SiteDetailPage({ params }: PageProps) {
    const { id } = await params
    const result = await getSite(id)

    if (!result.success || !result.data) {
        notFound()
    }

    const site = result.data

    return (
        <div className="animate-fade-in">
            <Header
                title={site.name}
                description={site.address || 'Work Site'}
                actions={
                    <Link href={`/sites/${id}/edit`}>
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
                            Site Details
                            <Badge variant={site.isActive ? 'success' : 'error'}>
                                {site.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {site.address && (
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30">
                                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500">Address</p>
                                        <p className="text-white">{site.address}</p>
                                    </div>
                                </div>
                            )}
                            {site.description && (
                                <div className="p-3 rounded-lg bg-slate-800/30">
                                    <p className="text-xs text-slate-500 mb-1">Description</p>
                                    <p className="text-white">{site.description}</p>
                                </div>
                            )}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Created</p>
                                    <p className="text-white">{formatDate(site.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <div className="flex items-center gap-2 text-cyan-400 mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-sm">Assigned Labors</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {site.labors?.length || 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Assigned Labors */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Assigned Labors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!site.labors || site.labors.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No labors assigned to this site</p>
                        ) : (
                            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {site.labors.map((labor) => (
                                    <Link key={labor.id} href={`/labors/${labor.id}`}>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-700/30 transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                                <span className="text-indigo-400 font-semibold">
                                                    {labor.fullName.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{labor.fullName}</p>
                                                <p className="text-xs text-slate-400">{labor.role || 'Labor'}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
