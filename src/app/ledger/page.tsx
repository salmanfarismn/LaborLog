'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { getLabors } from '@/actions/labors'
import { getLaborLedger } from '@/actions/ledger'
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils'
import { FileText, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import type { Labor, LedgerEntry } from '@/types'

interface LedgerData {
    labor: { id: string; fullName: string; monthlySalary: number }
    entries: LedgerEntry[]
    summary: {
        totalEarned: number
        totalPaid: number
        balance: number
    }
}

export default function LedgerPage() {
    const [labors, setLabors] = useState<Labor[]>([])
    const [selectedLaborId, setSelectedLaborId] = useState<string>('')
    const [ledger, setLedger] = useState<LedgerData | null>(null)
    const [loading, setLoading] = useState(false)
    const [month, setMonth] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })

    useEffect(() => {
        async function loadLabors() {
            const result = await getLabors()
            if (result.success && result.data) {
                setLabors(result.data)
            }
        }
        loadLabors()
    }, [])

    useEffect(() => {
        async function loadLedger() {
            if (!selectedLaborId) {
                setLedger(null)
                return
            }

            setLoading(true)
            const [year, monthNum] = month.split('-').map(Number)
            const startDate = new Date(year, monthNum - 1, 1)
            const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999)

            const result = await getLaborLedger(
                selectedLaborId,
                startDate.toISOString(),
                endDate.toISOString()
            )

            if (result.success && result.data) {
                setLedger(result.data)
            }
            setLoading(false)
        }
        loadLedger()
    }, [selectedLaborId, month])

    const months = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push({
            value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: getMonthName(d),
        })
    }

    // Calculate advances from entries
    const totalAdvance = ledger?.entries
        .filter(e => e.type === 'ADVANCE' || e.type === 'advance')
        .reduce((sum, e) => sum + e.debit, 0) || 0

    return (
        <div className="animate-fade-in">
            <Header
                title="Ledger"
                description="View detailed financial records for each labor"
            />

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Select
                                label="Select Labor"
                                options={labors.map(l => ({ value: l.id, label: l.fullName }))}
                                value={selectedLaborId}
                                onChange={(e) => setSelectedLaborId(e.target.value)}
                                placeholder="Choose a labor"
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                label="Month"
                                options={months}
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {!selectedLaborId ? (
                <Card>
                    <CardContent>
                        <EmptyState
                            icon={<FileText className="w-12 h-12" />}
                            title="Select a Labor"
                            description="Choose a labor from the dropdown to view their ledger"
                        />
                    </CardContent>
                </Card>
            ) : loading ? (
                <Card>
                    <CardContent>
                        <div className="py-12 text-center text-slate-400">Loading ledger...</div>
                    </CardContent>
                </Card>
            ) : ledger ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                        <Card gradient>
                            <CardContent className="py-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-500/20">
                                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Total Earned</p>
                                        <p className="text-xl font-bold text-white">
                                            {formatCurrency(ledger.summary.totalEarned)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card gradient>
                            <CardContent className="py-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/20">
                                        <Wallet className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Total Paid</p>
                                        <p className="text-xl font-bold text-white">
                                            {formatCurrency(ledger.summary.totalPaid)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card gradient>
                            <CardContent className="py-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/20">
                                        <TrendingDown className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Advances</p>
                                        <p className="text-xl font-bold text-white">
                                            {formatCurrency(totalAdvance)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card gradient>
                            <CardContent className="py-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/20">
                                        <FileText className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Balance</p>
                                        <p className={`text-xl font-bold ${ledger.summary.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {formatCurrency(Math.abs(ledger.summary.balance))}
                                            {ledger.summary.balance < 0 ? ' (Due)' : ''}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ledger.entries.length === 0 ? (
                                <EmptyState
                                    icon={<FileText className="w-8 h-8" />}
                                    title="No Transactions"
                                    description="No transactions found for this period"
                                />
                            ) : (
                                <div className="space-y-2">
                                    {ledger.entries.map((entry, index) => (
                                        <div
                                            key={entry.id || index}
                                            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant={
                                                        entry.type === 'salary' ? 'success' :
                                                            entry.type === 'SALARY' ? 'success' :
                                                                entry.type === 'ADVANCE' || entry.type === 'advance' ? 'warning' :
                                                                    entry.type === 'BONUS' || entry.type === 'bonus' ? 'info' : 'default'
                                                    }
                                                >
                                                    {entry.type.toUpperCase()}
                                                </Badge>
                                                <div>
                                                    <p className="text-sm text-white">{entry.description}</p>
                                                    <p className="text-xs text-slate-500">{formatDate(entry.date)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-medium ${entry.credit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {entry.credit > 0 ? '+' : '-'}{formatCurrency(entry.credit > 0 ? entry.credit : entry.debit)}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Bal: {formatCurrency(entry.balance)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : null}
        </div>
    )
}
