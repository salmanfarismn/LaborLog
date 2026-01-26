import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, type = 'text', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    className={cn(
                        'w-full px-4 py-2.5 rounded-lg text-white placeholder-slate-500',
                        'bg-slate-800/50 border border-slate-700',
                        'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
                        'transition-all duration-200',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error && 'border-rose-500 focus:ring-rose-500/50 focus:border-rose-500',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-rose-400">{error}</p>
                )}
                {helperText && !error && (
                    <p className="text-sm text-slate-500">{helperText}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export { Input }
