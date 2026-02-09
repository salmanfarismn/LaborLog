'use server'

// Server Actions for report generation

import { getEmployeeReportData } from '@/services/reportData'
import { generateXlsxReport } from '@/services/xlsxGenerator'
import type { ReportFilters, GeneratedReport, ReportMetadata } from '@/types/reports'
import { format } from 'date-fns'

const COMPANY_NAME = 'Manarath Engineers'

export async function generateEmployeeReport(
    filters: ReportFilters
): Promise<{ success: boolean; data?: GeneratedReport; error?: string }> {
    try {
        // Validate filters
        if (!filters.startDate || !filters.endDate) {
            return { success: false, error: 'Date range is required' }
        }

        const startDate = new Date(filters.startDate)
        const endDate = new Date(filters.endDate)

        if (startDate > endDate) {
            return { success: false, error: 'Start date must be before end date' }
        }

        // Fetch aggregated data
        const reportData = await getEmployeeReportData(filters)

        if (reportData.length === 0) {
            return { success: false, error: 'No employees found for the selected filters' }
        }

        // Build metadata
        const metadata: ReportMetadata = {
            companyName: COMPANY_NAME,
            reportTitle: 'Employee Report',
            dateRange: {
                from: format(startDate, 'dd/MM/yyyy'),
                to: format(endDate, 'dd/MM/yyyy'),
            },
            generatedAt: new Date(),
        }

        // Generate Excel file
        const buffer = await generateXlsxReport(reportData, metadata)
        const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        const extension = 'xlsx'

        // Generate filename
        const dateStr = format(new Date(), 'yyyy-MM-dd')
        const filename = `employee_report_${dateStr}.${extension}`

        return {
            success: true,
            data: {
                data: buffer.toString('base64'),
                filename,
                mimeType,
            },
        }
    } catch (error) {
        console.error('Error generating report:', error)
        return { success: false, error: 'Failed to generate report' }
    }
}

// Get available sites and labors for filter dropdowns
export async function getReportFilterOptions(): Promise<{
    success: boolean
    data?: {
        sites: Array<{ id: string; name: string }>
        labors: Array<{ id: string; name: string }>
    }
    error?: string
}> {
    try {
        // Import here to avoid circular dependencies
        const { getSites } = await import('@/actions/sites')
        const { getLabors } = await import('@/actions/labors')

        const [sitesResult, laborsResult] = await Promise.all([
            getSites(),
            getLabors(),
        ])

        if (!sitesResult.success || !laborsResult.success) {
            return { success: false, error: 'Failed to fetch filter options' }
        }

        return {
            success: true,
            data: {
                sites: (sitesResult.data || []).map((s: { id: string; name: string }) => ({
                    id: s.id,
                    name: s.name,
                })),
                labors: (laborsResult.data || []).map((l: { id: string; fullName: string }) => ({
                    id: l.id,
                    name: l.fullName,
                })),
            },
        }
    } catch (error) {
        console.error('Error fetching filter options:', error)
        return { success: false, error: 'Failed to fetch filter options' }
    }
}
