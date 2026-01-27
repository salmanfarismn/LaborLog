'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface HeaderProps {
    title: string
    description?: string
    actions?: ReactNode
    className?: string
}

export function Header({ title, description, actions, className }: HeaderProps) {
    return (
        <div className={cn('mb-8', className)}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
                    {description && (
                        <p className="mt-1 text-slate-400">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
        </div>
    )
}
