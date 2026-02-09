'use client'

import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { FileSpreadsheet, Download, Loader2, Filter, X } from 'lucide-react'
import { generateEmployeeReport, getReportFilterOptions } from '@/actions/reports'
import type { ReportFilters } from '@/types/reports'

interface FilterOptions {
    sites: Array<{ id: string; name: string }>
    labors: Array<{ id: string; name: string }>
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({ sites: [], labors: [] })
    const [filtersOpen, setFiltersOpen] = useState(false)

    // Filter state
    const [filters, setFilters] = useState<ReportFilters>({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'ALL',
    })

    useEffect(() => {
        async function loadFilterOptions() {
            const result = await getReportFilterOptions()
            if (result.success && result.data) {
                setFilterOptions(result.data)
            }
        }
        loadFilterOptions()
    }, [])

    const handleDownload = async () => {
        setLoading(true)
        setError(null)

        try {
            const result = await generateEmployeeReport(filters)

            if (!result.success || !result.data) {
                setError(result.error || 'Failed to generate report')
                return
            }

            // Decode base64 and trigger download
            const byteCharacters = atob(result.data.data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: result.data.mimeType })

            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = result.data.filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Download error:', err)
            setError('Failed to download report')
        } finally {
            setLoading(false)
        }
    }

    const clearFilters = () => {
        setFilters({
            startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd'),
            status: 'ALL',
            siteId: undefined,
            laborId: undefined,
        })
    }

    const hasActiveFilters = filters.siteId || filters.laborId || filters.status !== 'ALL'

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
                <p className="text-slate-400">
                    Download employee attendance and payment reports in Excel format
                </p>
            </div>

            {/* Report Card */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                {/* Card Header */}
                <div className="p-6 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Employee Report</h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Attendance and payment summary for selected period
                            </p>
                        </div>
                        <button
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${filtersOpen || hasActiveFilters
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-white" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                {filtersOpen && (
                    <div className="p-6 bg-slate-800/30 border-b border-slate-700/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {/* Site Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Site
                                </label>
                                <select
                                    value={filters.siteId || ''}
                                    onChange={(e) => setFilters({ ...filters, siteId: e.target.value || undefined })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">All Sites</option>
                                    {filterOptions.sites.map((site) => (
                                        <option key={site.id} value={site.id}>
                                            {site.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Employee Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Employee
                                </label>
                                <select
                                    value={filters.laborId || ''}
                                    onChange={(e) => setFilters({ ...filters, laborId: e.target.value || undefined })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">All Employees</option>
                                    {filterOptions.labors.map((labor) => (
                                        <option key={labor.id} value={labor.id}>
                                            {labor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Status
                                </label>
                                <select
                                    value={filters.status || 'ALL'}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'ALL' })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* Card Body */}
                <div className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Period Display */}
                    <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
                        <p className="text-sm text-slate-400">
                            Report Period:{' '}
                            <span className="text-white font-medium">
                                {format(new Date(filters.startDate), 'dd MMM yyyy')} — {format(new Date(filters.endDate), 'dd MMM yyyy')}
                            </span>
                        </p>
                    </div>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-600 disabled:to-slate-600 rounded-xl text-white font-medium transition-all duration-200 shadow-lg shadow-emerald-600/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Generating Report...</span>
                            </>
                        ) : (
                            <>
                                <FileSpreadsheet className="w-5 h-5" />
                                <span>Download Excel Report</span>
                                <Download className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </button>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500">
                        Reports include employee details, attendance summary, and payment information for the selected period.
                    </p>
                </div>
            </div>

            {/* Excel Info */}
            <div className="mt-8 p-6 bg-slate-800/30 rounded-xl border border-slate-700/30">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-white">Excel Report Contents</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li>• Employee ID, Name, and Contact</li>
                        <li>• Status and Assigned Site</li>
                        <li>• Days Present / Absent</li>
                    </ul>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li>• Wages Earned (₹ INR format)</li>
                        <li>• Amount Paid and Pending Balance</li>
                        <li>• Auto-calculated Totals Row</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
