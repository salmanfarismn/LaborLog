import { clsx, type ClassValue } from 'clsx'

// Utility function to merge class names
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

// Format currency in INR
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount)
}

// Format date to readable string
export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

// Format time
export function formatTime(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

// Get month name from date
export function getMonthName(date: Date): string {
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

// Get start of month
export function getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

// Get end of month
export function getEndOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

// Calculate working days in a month
export function getWorkingDaysInMonth(year: number, month: number): number {
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    let workingDays = 0

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay()
        if (day !== 0) { // Exclude only Sundays
            workingDays++
        }
    }

    return workingDays
}

// Calculate daily salary from monthly
export function calculateDailySalary(monthlySalary: number, workingDays: number = 26): number {
    return Math.round(monthlySalary / workingDays)
}

// Calculate salary based on attendance
export function calculateSalaryFromAttendance(
    monthlySalary: number,
    fullDays: number,
    halfDays: number,
    workingDays: number = 26
): number {
    const dailySalary = calculateDailySalary(monthlySalary, workingDays)
    return Math.round((fullDays + halfDays * 0.5) * dailySalary)
}

// Get today's date in YYYY-MM-DD format
export function getTodayString(): string {
    const today = new Date()
    return today.toISOString().split('T')[0]
}
