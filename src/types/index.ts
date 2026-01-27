// Type definitions for the Labor Management application

export type LaborStatus = 'ACTIVE' | 'INACTIVE'

export type AttendanceType = 'FULL_DAY' | 'HALF_DAY' | 'ABSENT' | 'CUSTOM'

export type PaymentType = 'ADVANCE' | 'SALARY' | 'BONUS' | 'OTHER'

// Labor types
export interface Labor {
    id: string
    fullName: string
    phone: string | null
    role: string | null
    defaultSiteId: string | null
    monthlySalary: number
    joiningDate: Date
    status: string
    createdAt: Date
    updatedAt: Date
    defaultSite?: WorkSite | null
    attendances?: Attendance[]
    payments?: Payment[]
}

export interface LaborFormData {
    fullName: string
    phone?: string
    role?: string
    defaultSiteId?: string
    monthlySalary: number
    joiningDate: string
    status: LaborStatus
}

// Work Site types
export interface WorkSite {
    id: string
    name: string
    address: string | null
    description: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    labors?: Labor[]
    attendances?: Attendance[]
}

export interface WorkSiteFormData {
    name: string
    address?: string
    description?: string
    isActive: boolean
}

// Attendance types
export interface Attendance {
    id: string
    date: Date
    laborId: string
    siteId: string | null
    attendanceType: AttendanceType
    checkIn: Date | null
    checkOut: Date | null
    totalHours: number | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    labor?: Labor
    site?: WorkSite | null
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

// Payment types
export interface Payment {
    id: string
    laborId: string
    date: Date
    amount: number
    paymentType: PaymentType
    notes: string | null
    createdAt: Date
    updatedAt: Date
    labor?: Labor
}

export interface PaymentFormData {
    laborId: string
    date: string
    amount: number
    paymentType: PaymentType
    notes?: string
}

// Dashboard types
export interface DashboardStats {
    totalLabors: number
    activeLabors: number
    presentToday: number
    absentToday: number
    totalSitesActive: number
    monthlySalaryPayable: number
    monthlyAdvancesGiven: number
    monthlyPaymentsMade: number
}

// Ledger types
export interface LedgerEntry {
    id?: string
    date: Date
    type: 'salary' | 'payment' | 'advance' | 'bonus' | 'ADVANCE' | 'SALARY' | 'BONUS' | 'OTHER'
    description: string
    debit: number
    credit: number
    balance: number
}

export interface LaborLedger {
    labor: Labor
    entries: LedgerEntry[]
    totalSalary: number
    totalPaid: number
    totalAdvance: number
    balance: number
}
