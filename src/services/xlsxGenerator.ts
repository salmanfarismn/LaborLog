// XLSX (Excel) report generator using exceljs

import ExcelJS from 'exceljs'
import type { EmployeeReportData, ReportMetadata } from '@/types/reports'
import { format } from 'date-fns'

export async function generateXlsxReport(
    data: EmployeeReportData[],
    metadata: ReportMetadata
): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = metadata.companyName
    workbook.created = metadata.generatedAt

    const worksheet = workbook.addWorksheet('Employee Report')

    // Row offset for header metadata rows
    const METADATA_ROWS = 4
    const HEADER_ROW = METADATA_ROWS + 1 // Row 5
    const DATA_START_ROW = HEADER_ROW + 1 // Row 6

    // Add report metadata as header rows FIRST
    worksheet.addRow([metadata.companyName])
    worksheet.addRow([metadata.reportTitle])
    worksheet.addRow([`Report Period: ${metadata.dateRange.from} to ${metadata.dateRange.to}`])
    worksheet.addRow([]) // Empty row for spacing

    // Style metadata rows
    const row1 = worksheet.getRow(1)
    row1.font = { bold: true, size: 16, color: { argb: 'FF1F2937' } }
    worksheet.mergeCells(1, 1, 1, 13)

    const row2 = worksheet.getRow(2)
    row2.font = { bold: true, size: 14, color: { argb: 'FF374151' } }
    worksheet.mergeCells(2, 1, 2, 13)

    const row3 = worksheet.getRow(3)
    row3.font = { size: 11, color: { argb: 'FF6B7280' } }
    worksheet.mergeCells(3, 1, 3, 13)

    // Add column headers
    const headerRow = worksheet.addRow([
        'Employee ID',
        'Full Name',
        'Mobile',
        'Status',
        'Assigned Site',
        'Joining Date',
        'Days Present',
        'Days Absent',
        'Overtime (hrs)',
        'Wages Earned (₹)',
        'Amount Paid (₹)',
        'Pending (₹)',
        'Last Payment',
    ])

    // Set column widths
    worksheet.columns = [
        { width: 26 },  // A - Employee ID
        { width: 25 },  // B - Full Name
        { width: 15 },  // C - Mobile
        { width: 10 },  // D - Status
        { width: 20 },  // E - Assigned Site
        { width: 14 },  // F - Joining Date
        { width: 13 },  // G - Days Present
        { width: 12 },  // H - Days Absent
        { width: 14 },  // I - Overtime
        { width: 16 },  // J - Wages Earned
        { width: 15 },  // K - Amount Paid
        { width: 13 },  // L - Pending
        { width: 14 },  // M - Last Payment
    ]

    // Style header row
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' }, // Blue background
    }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
    headerRow.height = 24

    // Add data rows
    for (const employee of data) {
        const row = worksheet.addRow([
            employee.employeeId,
            employee.fullName,
            employee.phone || '-',
            employee.status,
            employee.assignedSite || '-',
            format(new Date(employee.joiningDate), 'dd/MM/yyyy'),
            employee.daysPresent,
            employee.daysAbsent,
            employee.overtimeHours,
            employee.totalWagesEarned,
            employee.totalAmountPaid,
            employee.pendingBalance,
            employee.lastPaymentDate
                ? format(new Date(employee.lastPaymentDate), 'dd/MM/yyyy')
                : '-',
        ])

        row.alignment = { vertical: 'middle' }
    }

    // Style data rows with alternating colors
    for (let i = DATA_START_ROW; i < DATA_START_ROW + data.length; i++) {
        const row = worksheet.getRow(i)
        if ((i - DATA_START_ROW) % 2 === 1) {
            row.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF3F4F6' }, // Light gray
            }
        }
    }

    // Format currency columns with INR
    for (let i = DATA_START_ROW; i <= DATA_START_ROW + data.length; i++) {
        const row = worksheet.getRow(i)
        // Columns J, K, L (10, 11, 12)
        for (const col of [10, 11, 12]) {
            const cell = row.getCell(col)
            if (typeof cell.value === 'number') {
                cell.numFmt = '₹#,##0'
            }
        }
    }

    // Add totals row with correct formulas
    const totalsRowNum = DATA_START_ROW + data.length
    const dataEndRow = totalsRowNum - 1

    const totalsRow = worksheet.addRow([
        'TOTALS',
        '', '', '', '', '',
        { formula: `SUM(G${DATA_START_ROW}:G${dataEndRow})` },
        { formula: `SUM(H${DATA_START_ROW}:H${dataEndRow})` },
        { formula: `SUM(I${DATA_START_ROW}:I${dataEndRow})` },
        { formula: `SUM(J${DATA_START_ROW}:J${dataEndRow})` },
        { formula: `SUM(K${DATA_START_ROW}:K${dataEndRow})` },
        { formula: `SUM(L${DATA_START_ROW}:L${dataEndRow})` },
        '',
    ])

    totalsRow.font = { bold: true }
    totalsRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' }, // Gray background
    }

    // Format currency in totals row
    for (const col of [10, 11, 12]) {
        totalsRow.getCell(col).numFmt = '₹#,##0'
    }

    // Add border to all data cells
    const borderStyle: Partial<ExcelJS.Borders> = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    }

    // Apply borders to header and data rows
    for (let i = HEADER_ROW; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i)
        row.eachCell((cell) => {
            cell.border = borderStyle
        })
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
}
