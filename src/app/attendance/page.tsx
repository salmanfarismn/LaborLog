'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { getLabors } from '@/actions/labors'
import { getSites } from '@/actions/sites'
import { getAttendanceByDate, bulkSaveAttendance } from '@/actions/attendance'
import { formatDateForInput } from '@/lib/utils'
import { Calendar, Save, Users } from 'lucide-react'
import type { AttendanceFormData, AttendanceType } from '@/types'

interface LaborWithAttendance {
    id: string
    fullName: string
    role: string | null
    defaultSiteId: string | null
    attendanceType: AttendanceType
    siteId: string
    notes: string
}

export default function AttendancePage() {
    const [date, setDate] = useState(formatDateForInput(new Date()))
    const [labors, setLabors] = useState<LaborWithAttendance[]>([])
    const [sites, setSites] = useState<{ value: string; label: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        loadData()
    }, [date])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [laborsResult, sitesResult, attendanceResult] = await Promise.all([
                getLabors('ACTIVE'),
                getSites(true),
                getAttendanceByDate(date),
            ])

            const laborList = laborsResult.data || []
            const siteList = sitesResult.data || []
            const attendanceList = attendanceResult.data || []

            setSites(siteList.map(s => ({ value: s.id, label: s.name })))

            // Map labors with their existing attendance
            const laborsWithAttendance = laborList.map(labor => {
                const existing = attendanceList.find(a => a.laborId === labor.id)
                return {
                    id: labor.id,
                    fullName: labor.fullName,
                    role: labor.role ?? null,
                    defaultSiteId: labor.defaultSiteId ?? null,
                    attendanceType: (existing?.attendanceType as AttendanceType) || 'FULL_DAY',
                    siteId: existing?.siteId ?? labor.defaultSiteId ?? '',
                    notes: existing?.notes ?? '',
                }
            })

            setLabors(laborsWithAttendance)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const updateLabor = (id: string, field: keyof LaborWithAttendance, value: string) => {
        setLabors(prev => prev.map(l =>
            l.id === id ? { ...l, [field]: value } : l
        ))
    }

    const handleSave = async () => {
        setIsSaving(true)
        setMessage(null)

        try {
            const attendances: AttendanceFormData[] = labors.map(labor => ({
                date,
                laborId: labor.id,
                siteId: labor.siteId || undefined,
                attendanceType: labor.attendanceType,
                notes: labor.notes || undefined,
            }))

            const result = await bulkSaveAttendance(attendances)

            if (result.success) {
                setMessage({ type: 'success', text: 'Attendance saved successfully!' })
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to save attendance' })
            }
        } catch {
            setMessage({ type: 'error', text: 'An unexpected error occurred' })
        } finally {
            setIsSaving(false)
        }
    }

    const markAllAs = (type: AttendanceType) => {
        setLabors(prev => prev.map(l => ({ ...l, attendanceType: type })))
    }

    const attendanceOptions = [
        { value: 'FULL_DAY', label: 'Full Day' },
        { value: 'HALF_DAY', label: 'Half Day' },
        { value: 'ABSENT', label: 'Absent' },
        { value: 'CUSTOM', label: 'Custom' },
    ]

    return (
        <div className="animate-fade-in">
            <Header
                title="Attendance"
                description="Mark daily attendance for all labors"
                actions={
                    <Button onClick={handleSave} isLoading={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        Save All
                    </Button>
                }
            />

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <Card className="mb-6">
                <CardContent className="py-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-auto"
                            />
                        </div>
                        <div className="flex gap-2 ml-auto">
                            <Button size="sm" variant="ghost" onClick={() => markAllAs('FULL_DAY')}>
                                All Present
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => markAllAs('ABSENT')}>
                                All Absent
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        Labors ({labors.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12 text-slate-400">Loading...</div>
                    ) : labors.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            No active labors found. Add some labors first.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {labors.map((labor) => (
                                <div
                                    key={labor.id}
                                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50"
                                >
                                    <div className="flex items-center gap-3 min-w-[200px]">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                            {labor.fullName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{labor.fullName}</p>
                                            <p className="text-xs text-slate-500">{labor.role || 'Worker'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 flex-1">
                                        <div className="flex gap-2">
                                            {(['FULL_DAY', 'HALF_DAY', 'ABSENT'] as AttendanceType[]).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => updateLabor(labor.id, 'attendanceType', type)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${labor.attendanceType === type
                                                        ? type === 'FULL_DAY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                                            : type === 'HALF_DAY' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                                                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                                                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {type.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>

                                        <select
                                            value={labor.siteId}
                                            onChange={(e) => updateLabor(labor.id, 'siteId', e.target.value)}
                                            className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        >
                                            <option value="">No Site</option>
                                            {sites.map(site => (
                                                <option key={site.value} value={site.value}>{site.label}</option>
                                            ))}
                                        </select>
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
