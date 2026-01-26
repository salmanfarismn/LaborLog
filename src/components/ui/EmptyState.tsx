import { cn } from '@/lib/utils'
import { LucideIcon, FileX } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description?: string
    action?: {
        label: string
        href?: string
        onClick?: () => void
    }
    className?: string
}

export function EmptyState({
    icon: Icon = FileX,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center py-16 px-4 text-center',
            className
        )}>
            <div className="p-4 rounded-full bg-slate-800/50 mb-4">
                <Icon className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            {description && (
                <p className="text-slate-400 max-w-sm mb-6">{description}</p>
            )}
            {action && (
                action.href ? (
                    <a href={action.href}>
                        <Button>{action.label}</Button>
                    </a>
                ) : (
                    <Button onClick={action.onClick}>{action.label}</Button>
                )
            )}
        </div>
    )
}
