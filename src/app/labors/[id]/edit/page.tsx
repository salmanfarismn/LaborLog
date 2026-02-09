import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { LaborForm } from '@/components/forms/LaborForm'
import { getLaborById } from '@/actions/labors'
import { getSites } from '@/actions/sites'
import { notFound } from 'next/navigation'
import type { WorkSite, Labor } from '@/types'

interface EditLaborPageProps {
    params: Promise<{ id: string }>
}

export default async function EditLaborPage({ params }: EditLaborPageProps) {
    const { id } = await params
    const [laborResult, sitesResult] = await Promise.all([
        getLaborById(id),
        getSites(true),
    ])

    if (!laborResult.success || !laborResult.data) {
        notFound()
    }

    // Cast to expected types (server action returns compatible but slightly different structure)
    const labor = laborResult.data as unknown as Labor & { defaultSite?: WorkSite | null }
    const sites = (sitesResult.data || []) as WorkSite[]

    return (
        <div className="animate-fade-in max-w-3xl">
            <Header
                title="Edit Labor"
                description={`Editing ${labor.fullName}`}
            />

            <Card>
                <CardContent className="py-6">
                    <LaborForm labor={labor} sites={sites} />
                </CardContent>
            </Card>
        </div>
    )
}

