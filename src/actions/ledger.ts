'use server'

import connectDB from '@/lib/mongodb'
import Labor from '@/models/Labor'
import Attendance from '@/models/Attendance'
import Payment from '@/models/Payment'
import type { LedgerEntry } from '@/types'
import mongoose from 'mongoose'

// Interface for lean results
interface AttendanceLeanResult {
    _id: mongoose.Types.ObjectId
    date: Date
    attendanceType: string
    totalHours?: number | null
}

interface PaymentLeanResult {
    _id: mongoose.Types.ObjectId
    date: Date
    amount: number
    paymentType: string
    notes?: string | null
}

interface LaborLeanResult {
    _id: mongoose.Types.ObjectId
    fullName: string
    monthlySalary: number
}

// Get ledger for a specific labor
export async function getLaborLedger(
    laborId: string,
    startDate?: string,
    endDate?: string
): Promise<{ success: boolean; data?: { labor: { id: string; fullName: string; monthlySalary: number }; entries: LedgerEntry[]; summary: { totalEarned: number; totalPaid: number; balance: number } }; error?: string }> {
    try {
        await connectDB()

        const labor = await Labor.findById(laborId)
            .select('fullName monthlySalary')
            .lean() as LaborLeanResult | null

        if (!labor) {
            return { success: false, error: 'Labor not found' }
        }

        // Default to last 3 months if no dates provided
        const end = endDate ? new Date(endDate) : new Date()
        end.setHours(23, 59, 59, 999)

        const start = startDate
            ? new Date(startDate)
            : new Date(end.getFullYear(), end.getMonth() - 2, 1)
        start.setHours(0, 0, 0, 0)

        // Get attendance and payments
        const [attendances, payments] = await Promise.all([
            Attendance.find({
                laborId,
                date: { $gte: start, $lte: end },
            })
                .sort({ date: 1 })
                .lean() as Promise<AttendanceLeanResult[]>,
            Payment.find({
                laborId,
                date: { $gte: start, $lte: end },
            })
                .sort({ date: 1 })
                .lean() as Promise<PaymentLeanResult[]>,
        ])

        // Calculate daily rate
        const dailyRate = labor.monthlySalary / 26

        // Build ledger entries
        const entries: LedgerEntry[] = []
        let runningBalance = 0

        // Add attendance entries (credits - money earned)
        for (const att of attendances) {
            let credit = 0
            let description = ''

            switch (att.attendanceType) {
                case 'FULL_DAY':
                    credit = dailyRate
                    description = 'Full Day Work'
                    break
                case 'HALF_DAY':
                    credit = dailyRate * 0.5
                    description = 'Half Day Work'
                    break
                case 'CUSTOM':
                    credit = (att.totalHours || 0) * (dailyRate / 8)
                    description = `Custom Hours (${att.totalHours}h)`
                    break
                case 'ABSENT':
                    description = 'Absent'
                    break
            }

            if (credit > 0) {
                runningBalance += credit
                entries.push({
                    date: att.date,
                    description,
                    type: 'ATTENDANCE',
                    debit: 0,
                    credit: Math.round(credit),
                    balance: Math.round(runningBalance),
                })
            }
        }

        // Add payment entries (debits - money paid out)
        for (const pmt of payments) {
            runningBalance -= pmt.amount
            entries.push({
                date: pmt.date,
                description: pmt.notes || pmt.paymentType,
                type: pmt.paymentType as LedgerEntry['type'],
                debit: pmt.amount,
                credit: 0,
                balance: Math.round(runningBalance),
            })
        }

        // Sort by date
        entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Recalculate running balance after sorting
        let balance = 0
        for (const entry of entries) {
            balance += entry.credit - entry.debit
            entry.balance = Math.round(balance)
        }

        // Calculate summary
        const totalEarned = entries.reduce((sum, e) => sum + e.credit, 0)
        const totalPaid = entries.reduce((sum, e) => sum + e.debit, 0)

        return {
            success: true,
            data: {
                labor: {
                    id: labor._id.toString(),
                    fullName: labor.fullName,
                    monthlySalary: labor.monthlySalary,
                },
                entries,
                summary: {
                    totalEarned,
                    totalPaid,
                    balance: totalEarned - totalPaid,
                },
            },
        }
    } catch (error) {
        console.error('Error fetching ledger:', error)
        return { success: false, error: 'Failed to fetch ledger' }
    }
}

// Get all labors with their current balance
export async function getAllLaborsBalance() {
    try {
        await connectDB()

        const labors = await Labor.find({ status: 'ACTIVE' })
            .select('fullName monthlySalary')
            .lean() as LaborLeanResult[]

        const today = new Date()
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        const balances = await Promise.all(
            labors.map(async (labor) => {
                const laborIdStr = labor._id.toString()

                // Get this month's attendance
                const attendances = await Attendance.find({
                    laborId: labor._id,
                    date: { $gte: startOfMonth },
                }).lean() as AttendanceLeanResult[]

                // Get this month's payments
                const payments = await Payment.find({
                    laborId: labor._id,
                    date: { $gte: startOfMonth },
                }).lean() as PaymentLeanResult[]

                const dailyRate = labor.monthlySalary / 26

                let earned = 0
                for (const att of attendances) {
                    if (att.attendanceType === 'FULL_DAY') earned += dailyRate
                    else if (att.attendanceType === 'HALF_DAY') earned += dailyRate * 0.5
                    else if (att.attendanceType === 'CUSTOM') earned += (att.totalHours || 0) * (dailyRate / 8)
                }

                const paid = payments.reduce((sum, p) => sum + p.amount, 0)

                return {
                    laborId: laborIdStr,
                    laborName: labor.fullName,
                    monthlySalary: labor.monthlySalary,
                    earned: Math.round(earned),
                    paid: Math.round(paid),
                    balance: Math.round(earned - paid),
                }
            })
        )

        return { success: true, data: balances }
    } catch (error) {
        console.error('Error fetching balances:', error)
        return { success: false, error: 'Failed to fetch balances' }
    }
}
