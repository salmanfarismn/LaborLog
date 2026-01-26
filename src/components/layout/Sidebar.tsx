'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Users,
    MapPin,
    Calendar,
    Wallet,
    BookOpen,
    Menu,
    X,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/labors', label: 'Labors', icon: Users },
    { href: '/sites', label: 'Work Sites', icon: MapPin },
    { href: '/attendance', label: 'Attendance', icon: Calendar },
    { href: '/payments', label: 'Payments', icon: Wallet },
    { href: '/ledger', label: 'Ledger', icon: BookOpen },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white lg:hidden"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-40 h-screen w-64',
                    'bg-gradient-to-b from-slate-900 to-slate-950',
                    'border-r border-slate-800',
                    'transform transition-transform duration-300 ease-in-out',
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            LaborLog
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-6 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href))

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl',
                                    'text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white border border-indigo-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                )}
                            >
                                <item.icon className={cn(
                                    'w-5 h-5',
                                    isActive ? 'text-indigo-400' : ''
                                )} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
                    <div className="text-xs text-slate-500 text-center">
                        Labor Management System
                        <br />
                        <span className="text-slate-600">v1.0.0</span>
                    </div>
                </div>
            </aside>
        </>
    )
}
