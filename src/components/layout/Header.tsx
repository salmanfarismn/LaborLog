import { formatDate } from '@/lib/utils'

interface HeaderProps {
    title: string
    description?: string
    actions?: React.ReactNode
}

export function Header({ title, description, actions }: HeaderProps) {
    const today = new Date()

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
                {description && (
                    <p className="text-slate-400 mt-1">{description}</p>
                )}
                <p className="text-sm text-slate-500 mt-1">{formatDate(today)}</p>
            </div>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    )
}
