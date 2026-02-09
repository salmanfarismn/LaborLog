// Report-related type definitions

export interface ReportFilters {
    startDate: string
    endDate: string
    siteId?: string
    laborId?: string
    status?: 'ACTIVE' | 'INACTIVE' | 'ALL'
}

export interface EmployeeReportData {
    // Basic Details
    employeeId: string
    fullName: string
    phone: string | null
    status: string
    assignedSite: string | null
    joiningDate: Date

    // Attendance Summary
    daysPresent: number
    daysAbsent: number
    overtimeHours: number

    // Payment Summary
    totalWagesEarned: number
    totalAmountPaid: number
    pendingBalance: number
    lastPaymentDate: Date | null
}

export interface ReportMetadata {
    companyName: string
    reportTitle: string
    dateRange: {
        from: string
        to: string
    }
    generatedAt: Date
}

export interface GeneratedReport {
    data: string // base64 encoded
    filename: string
    mimeType: string
}
