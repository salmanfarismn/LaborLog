import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { SiteForm } from '@/components/forms/SiteForm'
import { getSiteById } from '@/actions/sites'
import { notFound } from 'next/navigation'
import type { WorkSite } from '@/types'

interface EditSitePageProps {
    params: Promise<{ id: string }>
}

export default async function EditSitePage({ params }: EditSitePageProps) {
    const { id } = await params
    const result = await getSiteById(id)

    if (!result.success || !result.data) {
        notFound()
    }

    // Cast to expected type
    const site = result.data as unknown as WorkSite

    return (
        <div className="animate-fade-in max-w-2xl">
            <Header
                title="Edit Site"
                description={`Editing ${site.name}`}
            />

            <Card>
                <CardContent className="py-6">
                    <SiteForm site={site} />
                </CardContent>
            </Card>
        </div>
    )
}

