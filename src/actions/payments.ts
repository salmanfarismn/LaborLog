'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { PaymentFormData } from '@/types'

// Get all payments with optional filtering
export async function getPayments(laborId?: string, startDate?: string, endDate?: string) {
    try {
        const where: Record<string, unknown> = {}

        if (laborId) {
            where.laborId = laborId
        }

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            }
        }

        const payments = await prisma.payment.findMany({
            where,
            include: {
                labor: {
                    select: { id: true, fullName: true },
                },
            },
            orderBy: { date: 'desc' },
        })

        return { success: true, data: payments }
    } catch (error) {
        console.error('Error fetching payments:', error)
        return { success: false, error: 'Failed to fetch payments' }
    }
}

// Get payments for a specific labor
export async function getLaborPayments(laborId: string) {
    try {
        const payments = await prisma.payment.findMany({
            where: { laborId },
            orderBy: { date: 'desc' },
        })

        return { success: true, data: payments }
    } catch (error) {
        console.error('Error fetching labor payments:', error)
        return { success: false, error: 'Failed to fetch payments' }
    }
}

// Get monthly payment summary
export async function getMonthlyPaymentSummary(year: number, month: number) {
    try {
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

        const payments = await prisma.payment.groupBy({
            by: ['paymentType'],
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                amount: true,
            },
        })

        const summary = {
            advance: payments.find(p => p.paymentType === 'ADVANCE')?._sum.amount || 0,
            salary: payments.find(p => p.paymentType === 'SALARY')?._sum.amount || 0,
            bonus: payments.find(p => p.paymentType === 'BONUS')?._sum.amount || 0,
            other: payments.find(p => p.paymentType === 'OTHER')?._sum.amount || 0,
            total: payments.reduce((sum, p) => sum + (p._sum.amount || 0), 0),
        }

        return { success: true, data: summary }
    } catch (error) {
        console.error('Error fetching payment summary:', error)
        return { success: false, error: 'Failed to fetch summary' }
    }
}

// Create a new payment
export async function createPayment(data: PaymentFormData) {
    try {
        const payment = await prisma.payment.create({
            data: {
                laborId: data.laborId,
                date: new Date(data.date),
                amount: data.amount,
                paymentType: data.paymentType,
                notes: data.notes || null,
            },
        })

        revalidatePath('/payments')
        revalidatePath(`/labors/${data.laborId}`)
        revalidatePath('/ledger')
        revalidatePath('/')
        return { success: true, data: payment }
    } catch (error) {
        console.error('Error creating payment:', error)
        return { success: false, error: 'Failed to create payment' }
    }
}

// Update a payment
export async function updatePayment(id: string, data: PaymentFormData) {
    try {
        const payment = await prisma.payment.update({
            where: { id },
            data: {
                laborId: data.laborId,
                date: new Date(data.date),
                amount: data.amount,
                paymentType: data.paymentType,
                notes: data.notes || null,
            },
        })

        revalidatePath('/payments')
        revalidatePath(`/labors/${data.laborId}`)
        revalidatePath('/ledger')
        return { success: true, data: payment }
    } catch (error) {
        console.error('Error updating payment:', error)
        return { success: false, error: 'Failed to update payment' }
    }
}

// Delete a payment
export async function deletePayment(id: string) {
    try {
        const payment = await prisma.payment.findUnique({ where: { id } })

        await prisma.payment.delete({
            where: { id },
        })

        revalidatePath('/payments')
        if (payment) {
            revalidatePath(`/labors/${payment.laborId}`)
        }
        revalidatePath('/ledger')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error deleting payment:', error)
        return { success: false, error: 'Failed to delete payment' }
    }
}
