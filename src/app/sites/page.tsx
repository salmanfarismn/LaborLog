import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { getSites } from '@/actions/sites'
import { MapPin, Plus, Users } from 'lucide-react'
import Link from 'next/link'

export default async function SitesPage() {
    const result = await getSites()
    const sites = result.data || []

    return (
        <div className="animate-fade-in">
            <Header
                title="Work Sites"
                description="Manage your project locations"
                actions={
                    <Link href="/sites/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Site
                        </Button>
                    </Link>
                }
            />

            {sites.length === 0 ? (
                <Card>
                    <CardContent>
                        <EmptyState
                            icon={<MapPin className="w-12 h-12" />}
                            title="No Sites Yet"
                            description="Start by adding your first work site"
                            action={
                                <Link href="/sites/new">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add First Site
                                    </Button>
                                </Link>
                            }
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {sites.map((site) => (
                        <Link key={site.id} href={`/sites/${site.id}`}>
                            <Card className="h-full hover:border-indigo-500/50 transition-colors cursor-pointer">
                                <CardContent className="py-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                                                <MapPin className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{site.name}</h3>
                                                {site.address && (
                                                    <p className="text-sm text-slate-400 line-clamp-1">{site.address}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant={site.isActive ? 'success' : 'error'}>
                                            {site.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    {site.description && (
                                        <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                                            {site.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Users className="w-4 h-4" />
                                        <span>{(site as unknown as { _count: { labors: number } })._count?.labors || 0} assigned labors</span>
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
