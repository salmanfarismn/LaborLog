'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'w-full px-4 py-2.5 rounded-lg',
                        'bg-slate-800/50 border border-slate-700',
                        'text-white placeholder-slate-500',
                        'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
                        'transition-all duration-200',
                        error && 'border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-rose-400">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
