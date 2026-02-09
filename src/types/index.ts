// Type definitions for the Labor Management application

export type LaborStatus = 'ACTIVE' | 'INACTIVE'

export type AttendanceType = 'FULL_DAY' | 'HALF_DAY' | 'ABSENT' | 'CUSTOM'

export type PaymentType = 'ADVANCE' | 'SALARY' | 'BONUS' | 'OTHER'

// Labor with relations
export interface LaborWithRelations {
    id: string
    fullName: string
    phone: string | null
    role: string | null
    defaultSiteId: string | null
    dailyWage: number
    joiningDate: Date
    status: string
    createdAt: Date
    updatedAt: Date
    defaultSite?: WorkSite | null
    attendances?: Attendance[]
    payments?: Payment[]
}

// WorkSite type
export interface WorkSite {
    id: string
    name: string
    address: string | null
    description: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    labors?: Partial<Labor>[]
    _count?: { attendances?: number; labors?: number }
}

// Labor type
export interface Labor {
    id: string
    fullName: string
    phone: string | null
    role: string | null
    defaultSiteId: string | null
    dailyWage: number
    joiningDate: Date
    status: string
    createdAt: Date
    updatedAt: Date
}

// Attendance type
export interface Attendance {
    id: string
    date: Date
    laborId: string
    siteId: string | null
    attendanceType: string
    checkIn: Date | null
    checkOut: Date | null
    totalHours: number | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    labor?: Labor
    site?: WorkSite | null
}

// Payment type
export interface Payment {
    id: string
    laborId: string
    date: Date
    amount: number
    paymentType: string
    notes: string | null
    createdAt: Date
    updatedAt: Date
    labor?: Labor
}

// Dashboard stats
export interface DashboardStats {
    totalLabors: number
    activeLabors: number
    presentToday: number
    absentToday: number
    totalSitesActive: number
    totalDailyWages: number
    monthlyAdvancesGiven: number
    monthlyPaymentsMade: number
}

// Ledger entry for per-labor view
export interface LedgerEntry {
    date: Date
    description: string
    type: 'SALARY' | 'ADVANCE' | 'BONUS' | 'OTHER' | 'ATTENDANCE'
    debit: number
    credit: number
    balance: number
}

// Form data types
export interface LaborFormData {
    fullName: string
    phone?: string
    role?: string
    defaultSiteId?: string
    dailyWage: number
    joiningDate: string
    status: LaborStatus
}

export interface SiteFormData {
    name: string
    address?: string
    description?: string
    isActive: boolean
}

export interface AttendanceFormData {
    date: string
    laborId: string
    siteId?: string
    attendanceType: AttendanceType
    checkIn?: string
    checkOut?: string
    totalHours?: number
    notes?: string
}

export interface PaymentFormData {
    laborId: string
    date: string
    amount: number
    paymentType: PaymentType
    notes?: string
}

// Monthly attendance summary
export interface MonthlyAttendanceSummary {
    laborId: string
    laborName: string
    fullDays: number
    halfDays: number
    absents: number
    customHours: number
    totalWorkDays: number
    dailyWage: number
    calculatedSalary: number
}
