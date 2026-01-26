import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LaborLog - Labor Management System',
  description: 'Manage laborers, attendance, salary, and payments efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-950">
          <Sidebar />
          <main className="lg:pl-64">
            <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
