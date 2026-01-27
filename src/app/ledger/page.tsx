'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { getLabors } from '@/actions/labors'
import { getLaborLedger, getAllLaborsBalance } from '@/actions/ledger'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BookOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface LaborBalance {
    laborId: string
    laborName: string
    monthlySalary: number
    earned: number
    paid: number
    balance: number
}

interface LedgerEntry {
    date: Date
    description: string
    type: string
    debit: number
    credit: number
    balance: number
}

export default function LedgerPage() {
    const [labors, setLabors] = useState<{ value: string; label: string }[]>([])
    const [balances, setBalances] = useState<LaborBalance[]>([])
    const [selectedLabor, setSelectedLabor] = useState<string>('')
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
    const [summary, setSummary] = useState<{ totalEarned: number; totalPaid: number; balance: number } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadInitialData()
    }, [])

    useEffect(() => {
        if (selectedLabor) {
            loadLedger(selectedLabor)
        } else {
            setLedgerEntries([])
            setSummary(null)
        }
    }, [selectedLabor])

    const loadInitialData = async () => {
        setIsLoading(true)
        try {
            const [laborsResult, balancesResult] = await Promise.all([
                getLabors('ACTIVE'),
                getAllLaborsBalance(),
            ])

            const laborList = laborsResult.data || []
            setLabors(laborList.map(l => ({ value: l.id, label: l.fullName })))
            setBalances(balancesResult.data || [])
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadLedger = async (laborId: string) => {
        try {
            const result = await getLaborLedger(laborId)
            if (result.success && result.data) {
                setLedgerEntries(result.data.entries)
                setSummary(result.data.summary)
            }
        } catch (error) {
            console.error('Error loading ledger:', error)
        }
    }

    return (
        <div className="animate-fade-in">
            <Header
                title="Money Ledger"
                description="Track earnings and payments per labor"
            />

            {/* Balance Overview */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                        Monthly Balance Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-400">Loading...</div>
                    ) : balances.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">No active labors found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700/50">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Labor</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">M. Salary</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Earned</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Paid</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {balances.map((b) => (
                                        <tr
                                            key={b.laborId}
                                            className="hover:bg-slate-800/30 cursor-pointer"
                                            onClick={() => setSelectedLabor(b.laborId)}
                                        >
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-white">{b.laborName}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-400">
                                                {formatCurrency(b.monthlySalary)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-emerald-400">
                                                {formatCurrency(b.earned)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-amber-400">
                                                {formatCurrency(b.paid)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={b.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                                    {formatCurrency(Math.abs(b.balance))}
                                                    {b.balance < 0 && ' (Due)'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detailed Ledger */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle>Detailed Ledger</CardTitle>
                        <Select
                            value={selectedLabor}
                            onChange={(e) => setSelectedLabor(e.target.value)}
                            options={labors}
                            placeholder="Select a labor"
                            className="w-64"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {!selectedLabor ? (
                        <div className="text-center py-12 text-slate-400">
                            Select a labor to view their detailed ledger
                        </div>
                    ) : ledgerEntries.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            No transactions found for this period
                        </div>
                    ) : (
                        <>
                            {/* Summary */}
                            {summary && (
                                <div className="grid gap-4 grid-cols-3 mb-6">
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                                        <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-emerald-400">{formatCurrency(summary.totalEarned)}</p>
                                        <p className="text-sm text-slate-400">Total Earned</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                                        <TrendingDown className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-amber-400">{formatCurrency(summary.totalPaid)}</p>
                                        <p className="text-sm text-slate-400">Total Paid</p>
                                    </div>
                                    <div className={`p-4 rounded-xl text-center ${summary.balance >= 0
                                            ? 'bg-cyan-500/10 border border-cyan-500/30'
                                            : 'bg-rose-500/10 border border-rose-500/30'
                                        }`}>
                                        <Minus className={`w-6 h-6 mx-auto mb-2 ${summary.balance >= 0 ? 'text-cyan-400' : 'text-rose-400'}`} />
                                        <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                                            {formatCurrency(Math.abs(summary.balance))}
                                        </p>
                                        <p className="text-sm text-slate-400">{summary.balance >= 0 ? 'Balance Due' : 'Overpaid'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Transactions */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700/50">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Date</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Description</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Type</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Credit</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Debit</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-300">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {ledgerEntries.map((entry, idx) => (
                                            <tr key={idx} className="hover:bg-slate-800/30">
                                                <td className="px-4 py-3 text-sm text-slate-300">
                                                    {formatDate(entry.date)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-white">
                                                    {entry.description}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        size="sm"
                                                        variant={
                                                            entry.type === 'ATTENDANCE' ? 'success' :
                                                                entry.type === 'SALARY' ? 'info' :
                                                                    entry.type === 'ADVANCE' ? 'warning' : 'default'
                                                        }
                                                    >
                                                        {entry.type}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-emerald-400">
                                                    {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-rose-400">
                                                    {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-medium text-white">
                                                    {formatCurrency(entry.balance)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
