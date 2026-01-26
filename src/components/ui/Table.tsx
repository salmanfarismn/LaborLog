import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface Column<T> {
    key: string
    header: string
    className?: string
    render?: (item: T) => ReactNode
}

interface TableProps<T> {
    columns: Column<T>[]
    data: T[]
    keyExtractor: (item: T) => string
    onRowClick?: (item: T) => void
    className?: string
    emptyMessage?: string
}

export function Table<T>({
    columns,
    data,
    keyExtractor,
    onRowClick,
    className,
    emptyMessage = 'No data available'
}: TableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <p>{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-700/50">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={cn(
                                    'px-4 py-3 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider',
                                    column.className
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                    {data.map((item) => (
                        <tr
                            key={keyExtractor(item)}
                            className={cn(
                                'transition-colors hover:bg-slate-700/30',
                                onRowClick && 'cursor-pointer'
                            )}
                            onClick={() => onRowClick?.(item)}
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={cn(
                                        'px-4 py-4 text-sm text-slate-300',
                                        column.className
                                    )}
                                >
                                    {column.render
                                        ? column.render(item)
                                        : String((item as Record<string, unknown>)[column.key] ?? '')
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
