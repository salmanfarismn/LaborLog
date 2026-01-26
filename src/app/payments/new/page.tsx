import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { PaymentForm } from '@/components/forms/PaymentForm'
import { getLabors } from '@/actions/labors'

export default async function NewPaymentPage() {
    const laborsResult = await getLabors('ACTIVE')
    const labors = (laborsResult.data || []).map(l => ({ id: l.id, fullName: l.fullName }))

    return (
        <div className="animate-fade-in max-w-2xl">
            <Header
                title="Add Payment"
                description="Record a new salary or advance payment"
            />

            <Card>
                <CardContent className="py-6">
                    <PaymentForm labors={labors} />
                </CardContent>
            </Card>
        </div>
    )
}
