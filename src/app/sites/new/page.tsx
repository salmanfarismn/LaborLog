import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { SiteForm } from '@/components/forms/SiteForm'

export default function NewSitePage() {
    return (
        <div className="animate-fade-in max-w-2xl">
            <Header
                title="Add New Site"
                description="Enter the details of the new work site"
            />

            <Card>
                <CardContent className="py-6">
                    <SiteForm />
                </CardContent>
            </Card>
        </div>
    )
}
