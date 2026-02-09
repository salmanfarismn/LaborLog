// Report data aggregation service
// Fetches and aggregates data from MongoDB for report generation

import connectDB from '@/lib/mongodb'
import Labor from '@/models/Labor'
import Attendance from '@/models/Attendance'
import Payment from '@/models/Payment'
import WorkSite from '@/models/WorkSite'
import type { ReportFilters, EmployeeReportData } from '@/types/reports'
import mongoose from 'mongoose'

// Interface for lean labor result
interface LaborLeanResult {
    _id: mongoose.Types.ObjectId
    fullName: string
    phone?: string | null
    status: string
    defaultSiteId?: mongoose.Types.ObjectId | null
    dailyWage: number
    joiningDate: Date
}

// Interface for site lean result
interface SiteLeanResult {
    _id: mongoose.Types.ObjectId
    name: string
}

// Interface for attendance aggregation result
interface AttendanceAggResult {
    _id: {
        laborId: mongoose.Types.ObjectId
        attendanceType: string
    }
    count: number
    totalHours: number
}

// Interface for payment aggregation result
interface PaymentAggResult {
    _id: mongoose.Types.ObjectId
    totalPaid: number
    lastPaymentDate: Date | null
}

export async function getEmployeeReportData(
    filters: ReportFilters
): Promise<EmployeeReportData[]> {
    await connectDB()

    const startDate = new Date(filters.startDate)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(filters.endDate)
    endDate.setHours(23, 59, 59, 999)

    // Build labor filter
    const laborFilter: Record<string, unknown> = {}
    if (filters.status && filters.status !== 'ALL') {
        laborFilter.status = filters.status
    }
    if (filters.laborId) {
        laborFilter._id = new mongoose.Types.ObjectId(filters.laborId)
    }
    if (filters.siteId) {
        laborFilter.defaultSiteId = new mongoose.Types.ObjectId(filters.siteId)
    }

    // Fetch all matching labors
    const labors = await Labor.find(laborFilter)
        .select('fullName phone status defaultSiteId dailyWage joiningDate')
        .lean() as LaborLeanResult[]

    if (labors.length === 0) {
        return []
    }

    const laborIds = labors.map(l => l._id)

    // Fetch site names for mapping
    const siteIds = labors
        .filter(l => l.defaultSiteId)
        .map(l => l.defaultSiteId!)

    const sites = siteIds.length > 0
        ? await WorkSite.find({ _id: { $in: siteIds } })
            .select('name')
            .lean() as SiteLeanResult[]
        : []

    const siteMap = new Map(sites.map(s => [s._id.toString(), s.name]))

    // Aggregate attendance data
    const attendanceAgg = await Attendance.aggregate<AttendanceAggResult>([
        {
            $match: {
                laborId: { $in: laborIds },
                date: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: { laborId: '$laborId', attendanceType: '$attendanceType' },
                count: { $sum: 1 },
                totalHours: { $sum: { $ifNull: ['$totalHours', 0] } },
            },
        },
    ])

    // Aggregate payment data
    const paymentAgg = await Payment.aggregate<PaymentAggResult>([
        {
            $match: {
                laborId: { $in: laborIds },
                date: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: '$laborId',
                totalPaid: { $sum: '$amount' },
                lastPaymentDate: { $max: '$date' },
            },
        },
    ])

    // Build attendance map: laborId -> { present, absent, overtimeHours }
    const attendanceMap = new Map<string, { present: number; absent: number; overtimeHours: number }>()
    for (const agg of attendanceAgg) {
        const laborIdStr = agg._id.laborId.toString()
        if (!attendanceMap.has(laborIdStr)) {
            attendanceMap.set(laborIdStr, { present: 0, absent: 0, overtimeHours: 0 })
        }
        const entry = attendanceMap.get(laborIdStr)!

        switch (agg._id.attendanceType) {
            case 'FULL_DAY':
            case 'HALF_DAY':
                entry.present += agg.count
                break
            case 'ABSENT':
                entry.absent += agg.count
                break
            case 'CUSTOM':
                entry.present += agg.count
                entry.overtimeHours += agg.totalHours
                break
        }
    }

    // Build payment map: laborId -> { totalPaid, lastPaymentDate }
    const paymentMap = new Map(
        paymentAgg.map(p => [
            p._id.toString(),
            { totalPaid: p.totalPaid, lastPaymentDate: p.lastPaymentDate },
        ])
    )

    // Calculate report data for each labor
    const reportData: EmployeeReportData[] = labors.map(labor => {
        const laborIdStr = labor._id.toString()
        const attendance = attendanceMap.get(laborIdStr) || { present: 0, absent: 0, overtimeHours: 0 }
        const payment = paymentMap.get(laborIdStr) || { totalPaid: 0, lastPaymentDate: null }

        // Use daily wage directly
        const dailyRate = labor.dailyWage

        // Get detailed attendance for wage calculation
        const fullDays = attendanceAgg.find(
            a => a._id.laborId.toString() === laborIdStr && a._id.attendanceType === 'FULL_DAY'
        )?.count || 0

        const halfDays = attendanceAgg.find(
            a => a._id.laborId.toString() === laborIdStr && a._id.attendanceType === 'HALF_DAY'
        )?.count || 0

        const customHours = attendanceAgg.find(
            a => a._id.laborId.toString() === laborIdStr && a._id.attendanceType === 'CUSTOM'
        )?.totalHours || 0

        const totalWagesEarned = Math.round(
            (fullDays * dailyRate) +
            (halfDays * dailyRate * 0.5) +
            (customHours * (dailyRate / 8))
        )

        return {
            employeeId: laborIdStr,
            fullName: labor.fullName,
            phone: labor.phone || null,
            status: labor.status,
            assignedSite: labor.defaultSiteId
                ? siteMap.get(labor.defaultSiteId.toString()) || null
                : null,
            joiningDate: labor.joiningDate,
            daysPresent: attendance.present,
            daysAbsent: attendance.absent,
            overtimeHours: attendance.overtimeHours,
            totalWagesEarned,
            totalAmountPaid: payment.totalPaid,
            pendingBalance: totalWagesEarned - payment.totalPaid,
            lastPaymentDate: payment.lastPaymentDate,
        }
    })

    return reportData
}
