import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { LaborForm } from '@/components/forms/LaborForm'
import { getLaborById } from '@/actions/labors'
import { getSites } from '@/actions/sites'
import { notFound } from 'next/navigation'

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

    return (
        <div className="animate-fade-in max-w-3xl">
            <Header
                title="Edit Labor"
                description={`Editing ${laborResult.data.fullName}`}
            />

            <Card>
                <CardContent className="py-6">
                    <LaborForm labor={laborResult.data} sites={sitesResult.data || []} />
                </CardContent>
            </Card>
        </div>
    )
}
