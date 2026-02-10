'use server'

import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import '@/models/Labor' // Required: registers Labor model for populate('labor')
import { revalidatePath } from 'next/cache'
import type { PaymentFormData } from '@/types'
import mongoose from 'mongoose'

// Interface for lean result with populated labor
interface PaymentLeanResult {
    _id: mongoose.Types.ObjectId
    laborId: mongoose.Types.ObjectId
    date: Date
    amount: number
    paymentType: string
    notes?: string | null
    createdAt: Date
    updatedAt: Date
    labor?: {
        _id: mongoose.Types.ObjectId
        fullName: string
    } | null
}

// Get all payments with optional filtering
export async function getPayments(laborId?: string, startDate?: string, endDate?: string) {
    try {
        await connectDB()

        const filter: Record<string, unknown> = {}

        if (laborId) {
            filter.laborId = laborId
        }

        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            }
        }

        const payments = await Payment.find(filter)
            .populate('labor', '_id fullName')
            .sort({ date: -1 })
            .lean() as PaymentLeanResult[]

        // Transform to match expected format
        const transformed = payments.map(pmt => ({
            ...pmt,
            id: pmt._id.toString(),
            laborId: pmt.laborId.toString(),
            labor: pmt.labor ? {
                id: pmt.labor._id.toString(),
                fullName: pmt.labor.fullName,
            } : null,
        }))

        return { success: true, data: transformed }
    } catch (error) {
        console.error('Error fetching payments:', error)
        return { success: false, error: 'Failed to fetch payments' }
    }
}

// Get payments for a specific labor
export async function getLaborPayments(laborId: string) {
    try {
        await connectDB()

        const payments = await Payment.find({ laborId })
            .sort({ date: -1 })
            .lean() as PaymentLeanResult[]

        // Transform to match expected format
        const transformed = payments.map(pmt => ({
            ...pmt,
            id: pmt._id.toString(),
            laborId: pmt.laborId.toString(),
        }))

        return { success: true, data: transformed }
    } catch (error) {
        console.error('Error fetching labor payments:', error)
        return { success: false, error: 'Failed to fetch payments' }
    }
}

// Get monthly payment summary
export async function getMonthlyPaymentSummary(year: number, month: number) {
    try {
        await connectDB()

        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

        // Use MongoDB aggregation pipeline (replaces Prisma groupBy)
        const payments = await Payment.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: '$paymentType',
                    total: { $sum: '$amount' },
                },
            },
        ])

        const summary = {
            advance: payments.find(p => p._id === 'ADVANCE')?.total || 0,
            salary: payments.find(p => p._id === 'SALARY')?.total || 0,
            bonus: payments.find(p => p._id === 'BONUS')?.total || 0,
            other: payments.find(p => p._id === 'OTHER')?.total || 0,
            total: payments.reduce((sum, p) => sum + (p.total || 0), 0),
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
        await connectDB()

        const payment = await Payment.create({
            laborId: data.laborId,
            date: new Date(data.date),
            amount: data.amount,
            paymentType: data.paymentType,
            notes: data.notes || null,
        })

        revalidatePath('/payments')
        revalidatePath(`/labors/${data.laborId}`)
        revalidatePath('/ledger')
        revalidatePath('/')

        return {
            success: true,
            data: {
                ...payment.toJSON(),
                id: payment._id.toString(),
            },
        }
    } catch (error) {
        console.error('Error creating payment:', error)
        return { success: false, error: 'Failed to create payment' }
    }
}

// Update a payment
export async function updatePayment(id: string, data: PaymentFormData) {
    try {
        await connectDB()

        const payment = await Payment.findByIdAndUpdate(
            id,
            {
                laborId: data.laborId,
                date: new Date(data.date),
                amount: data.amount,
                paymentType: data.paymentType,
                notes: data.notes || null,
            },
            { new: true, runValidators: true }
        )

        if (!payment) {
            return { success: false, error: 'Payment not found' }
        }

        revalidatePath('/payments')
        revalidatePath(`/labors/${data.laborId}`)
        revalidatePath('/ledger')

        return {
            success: true,
            data: {
                ...payment.toJSON(),
                id: payment._id.toString(),
            },
        }
    } catch (error) {
        console.error('Error updating payment:', error)
        return { success: false, error: 'Failed to update payment' }
    }
}

// Delete a payment
export async function deletePayment(id: string) {
    try {
        await connectDB()

        const payment = await Payment.findById(id)

        if (!payment) {
            return { success: false, error: 'Payment not found' }
        }

        const laborId = payment.laborId.toString()
        await Payment.findByIdAndDelete(id)

        revalidatePath('/payments')
        revalidatePath(`/labors/${laborId}`)
        revalidatePath('/ledger')
        revalidatePath('/')

        return { success: true }
    } catch (error) {
        console.error('Error deleting payment:', error)
        return { success: false, error: 'Failed to delete payment' }
    }
}
