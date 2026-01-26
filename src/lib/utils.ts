import { type ClassValue, clsx } from 'clsx'

// Utility function to merge class names
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

// Format currency in INR
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

// Format date to readable string
export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

// Format date for input fields (YYYY-MM-DD)
export function formatDateForInput(date: Date | string): string {
    const d = new Date(date)
    return d.toISOString().split('T')[0]
}

// Get month name from date
export function getMonthName(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

// Calculate working days in a month
export function getWorkingDaysInMonth(year: number, month: number): number {
    const date = new Date(year, month, 1)
    let workingDays = 0

    while (date.getMonth() === month) {
        const dayOfWeek = date.getDay()
        if (dayOfWeek !== 0) { // Exclude Sundays
            workingDays++
        }
        date.setDate(date.getDate() + 1)
    }

    return workingDays
}

// Calculate daily rate from monthly salary
export function calculateDailyRate(monthlySalary: number, workingDays: number = 26): number {
    return monthlySalary / workingDays
}

// Calculate salary based on attendance
export function calculateSalaryFromAttendance(
    monthlySalary: number,
    fullDays: number,
    halfDays: number,
    workingDaysInMonth: number = 26
): number {
    const dailyRate = monthlySalary / workingDaysInMonth
    return (fullDays * dailyRate) + (halfDays * dailyRate * 0.5)
}

// Get start and end of month
export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
    return { start, end }
}

// Get today's date at midnight
export function getToday(): Date {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
}
