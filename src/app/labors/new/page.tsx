import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { LaborForm } from '@/components/forms/LaborForm'
import { getSites } from '@/actions/sites'
import type { WorkSite } from '@/types'

export default async function NewLaborPage() {
    const sitesResult = await getSites(true)
    const sites = (sitesResult.data || []) as WorkSite[]

    return (
        <div className="animate-fade-in max-w-3xl">
            <Header
                title="Add New Labor"
                description="Enter the details of the new labor"
            />

            <Card>
                <CardContent className="py-6">
                    <LaborForm sites={sites} />
                </CardContent>
            </Card>
        </div>
    )
}

