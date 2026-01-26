import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { getSites } from '@/actions/sites'
import { Plus, MapPin, Users } from 'lucide-react'
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
                    <EmptyState
                        icon={MapPin}
                        title="No sites yet"
                        description="Start by adding your first work site"
                        action={{ label: 'Add Site', href: '/sites/new' }}
                    />
                </Card>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {sites.map((site) => (
                        <Link key={site.id} href={`/sites/${site.id}/edit`}>
                            <Card hover className="h-full">
                                <CardContent className="py-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                                                <MapPin className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{site.name}</h3>
                                                <p className="text-sm text-slate-400 line-clamp-1">
                                                    {site.address || 'No address'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={site.isActive ? 'success' : 'danger'}>
                                            {site.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Users className="w-4 h-4" />
                                        <span>{site._count?.labors || 0} laborers assigned</span>
                                    </div>

                                    {site.description && (
                                        <p className="mt-3 text-sm text-slate-500 line-clamp-2">
                                            {site.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
