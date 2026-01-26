import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { SiteForm } from '@/components/forms/SiteForm'
import { getSiteById } from '@/actions/sites'
import { notFound } from 'next/navigation'

interface EditSitePageProps {
    params: Promise<{ id: string }>
}

export default async function EditSitePage({ params }: EditSitePageProps) {
    const { id } = await params
    const result = await getSiteById(id)

    if (!result.success || !result.data) {
        notFound()
    }

    return (
        <div className="animate-fade-in max-w-2xl">
            <Header
                title="Edit Site"
                description={`Editing ${result.data.name}`}
            />

            <Card>
                <CardContent className="py-6">
                    <SiteForm site={result.data} />
                </CardContent>
            </Card>
        </div>
    )
}
