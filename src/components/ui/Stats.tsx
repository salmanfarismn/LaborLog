import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    icon?: LucideIcon
    trend?: {
        value: number
        isPositive: boolean
    }
    className?: string
    iconClassName?: string
}

export function StatsCard({ title, value, icon: Icon, trend, className, iconClassName }: StatsCardProps) {
    return (
        <div
            className={cn(
                'rounded-xl p-6 border border-slate-700/50',
                'bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm',
                'transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/50',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
                    {trend && (
                        <p className={cn(
                            'mt-2 text-sm font-medium flex items-center gap-1',
                            trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                        )}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-slate-500">vs last month</span>
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={cn(
                        'p-3 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
                        iconClassName
                    )}>
                        <Icon className="w-6 h-6 text-indigo-400" />
                    </div>
                )}
            </div>
        </div>
    )
}

interface StatsGridProps {
    children: ReactNode
    className?: string
}

export function StatsGrid({ children, className }: StatsGridProps) {
    return (
        <div className={cn('grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', className)}>
            {children}
        </div>
    )
}
