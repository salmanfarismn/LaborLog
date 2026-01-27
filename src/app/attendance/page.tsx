'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { getAttendanceByDate, saveAttendance } from '@/actions/attendance'
import { getLabors } from '@/actions/labors'
import { getSites } from '@/actions/sites'
import { getTodayString, formatDate } from '@/lib/utils'
import { Calendar, CheckCircle, XCircle, Clock, Save, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Labor, WorkSite, AttendanceType } from '@/types'

interface AttendanceEntry {
    laborId: string
    laborName: string
    siteId?: string
    attendanceType: AttendanceType
    existing?: boolean
}

export default function AttendancePage() {
    const [date, setDate] = useState(getTodayString())
    const [labors, setLabors] = useState<Labor[]>([])
    const [sites, setSites] = useState<WorkSite[]>([])
    const [attendance, setAttendance] = useState<Map<string, AttendanceEntry>>(new Map())
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Load labors and sites
    useEffect(() => {
        async function loadData() {
            const [laborsRes, sitesRes] = await Promise.all([
                getLabors(),
                getSites(),
            ])
            if (laborsRes.success && laborsRes.data) {
                setLabors(laborsRes.data.filter(l => l.status === 'ACTIVE'))
            }
            if (sitesRes.success && sitesRes.data) {
                setSites(sitesRes.data.filter(s => s.isActive))
            }
        }
        loadData()
    }, [])

    // Load attendance for selected date
    useEffect(() => {
        async function loadAttendance() {
            setLoading(true)
            const result = await getAttendanceByDate(date)

            const newAttendance = new Map<string, AttendanceEntry>()

            // Initialize with all labors as unmarked
            labors.forEach(labor => {
                newAttendance.set(labor.id, {
                    laborId: labor.id,
                    laborName: labor.fullName,
                    siteId: labor.defaultSiteId || undefined,
                    attendanceType: 'FULL_DAY',
                    existing: false,
                })
            })

            // Update with existing attendance
            if (result.success && result.data) {
                result.data.forEach((att: { laborId: string; siteId?: string | null; labor: { fullName: string }; attendanceType: string }) => {
                    newAttendance.set(att.laborId, {
                        laborId: att.laborId,
                        laborName: att.labor.fullName,
                        siteId: att.siteId || undefined,
                        attendanceType: att.attendanceType as AttendanceType,
                        existing: true,
                    })
                })
            }

            setAttendance(newAttendance)
            setLoading(false)
        }

        if (labors.length > 0) {
            loadAttendance()
        }
    }, [date, labors])

    const handleAttendanceChange = (laborId: string, type: AttendanceType) => {
        const entry = attendance.get(laborId)
        if (entry) {
            setAttendance(new Map(attendance.set(laborId, { ...entry, attendanceType: type })))
        }
    }

    const handleSiteChange = (laborId: string, siteId: string) => {
        const entry = attendance.get(laborId)
        if (entry) {
            setAttendance(new Map(attendance.set(laborId, { ...entry, siteId })))
        }
    }

    const handleSaveAll = async () => {
        setSaving(true)
        for (const entry of attendance.values()) {
            await saveAttendance({
                date,
                laborId: entry.laborId,
                siteId: entry.siteId,
                attendanceType: entry.attendanceType,
            })
        }
        setSaving(false)

        // Refresh attendance to show as saved
        const result = await getAttendanceByDate(date)
        if (result.success && result.data) {
            const newAttendance = new Map<string, AttendanceEntry>()
            attendance.forEach((entry, laborId) => {
                newAttendance.set(laborId, { ...entry, existing: true })
            })
            setAttendance(newAttendance)
        }
    }

    const changeDate = (days: number) => {
        const current = new Date(date)
        current.setDate(current.getDate() + days)
        setDate(current.toISOString().split('T')[0])
    }

    const attendanceTypes: { value: AttendanceType; label: string; color: string }[] = [
        { value: 'FULL_DAY', label: 'Full Day', color: 'success' },
        { value: 'HALF_DAY', label: 'Half Day', color: 'warning' },
        { value: 'ABSENT', label: 'Absent', color: 'error' },
    ]

    return (
        <div className="animate-fade-in">
            <Header
                title="Attendance"
                description="Mark daily attendance for all labors"
                actions={
                    <Button onClick={handleSaveAll} isLoading={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        Save All
                    </Button>
                }
            />

            {/* Date Selector */}
            <Card className="mb-6">
                <CardContent className="py-4">
                    <div className="flex items-center justify-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => changeDate(-1)}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent text-white font-medium text-lg focus:outline-none"
                            />
                            <span className="text-slate-400 text-sm">
                                ({formatDate(date)})
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => changeDate(1)}>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Mark Attendance
                        <span className="ml-2 text-sm font-normal text-slate-400">
                            ({labors.length} labors)
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-12 text-center text-slate-400">Loading...</div>
                    ) : labors.length === 0 ? (
                        <EmptyState
                            icon={<Calendar className="w-8 h-8" />}
                            title="No Active Labors"
                            description="Add labors first to mark their attendance"
                        />
                    ) : (
                        <div className="space-y-3">
                            {Array.from(attendance.values()).map((entry) => (
                                <div
                                    key={entry.laborId}
                                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white">{entry.laborName}</span>
                                            {entry.existing && (
                                                <Badge variant="success" className="text-xs">Saved</Badge>
                                            )}
                                        </div>
                                        <Select
                                            options={sites.map(s => ({ value: s.id, label: s.name }))}
                                            value={entry.siteId || ''}
                                            onChange={(e) => handleSiteChange(entry.laborId, e.target.value)}
                                            placeholder="Select site"
                                            className="mt-2 sm:hidden"
                                        />
                                    </div>

                                    <div className="hidden sm:block w-48">
                                        <Select
                                            options={sites.map(s => ({ value: s.id, label: s.name }))}
                                            value={entry.siteId || ''}
                                            onChange={(e) => handleSiteChange(entry.laborId, e.target.value)}
                                            placeholder="Select site"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        {attendanceTypes.map((type) => (
                                            <button
                                                key={type.value}
                                                onClick={() => handleAttendanceChange(entry.laborId, type.value)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${entry.attendanceType === type.value
                                                        ? type.value === 'FULL_DAY'
                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                            : type.value === 'HALF_DAY'
                                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                {type.value === 'FULL_DAY' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                                                {type.value === 'HALF_DAY' && <Clock className="w-4 h-4 inline mr-1" />}
                                                {type.value === 'ABSENT' && <XCircle className="w-4 h-4 inline mr-1" />}
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
