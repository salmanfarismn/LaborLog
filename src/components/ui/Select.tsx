import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef } from 'react'

export interface SelectOption {
    value: string
    label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    options: SelectOption[]
    placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, placeholder, id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-slate-300">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={cn(
                        'w-full px-4 py-2.5 rounded-lg text-white',
                        'bg-slate-800/50 border border-slate-700',
                        'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
                        'transition-all duration-200',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'cursor-pointer',
                        error && 'border-rose-500 focus:ring-rose-500/50 focus:border-rose-500',
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" className="bg-slate-800 text-slate-400">
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-800">
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="text-sm text-rose-400">{error}</p>
                )}
            </div>
        )
    }
)

Select.displayName = 'Select'

export { Select }
