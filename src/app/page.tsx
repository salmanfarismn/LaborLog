import { Header } from '@/components/layout/Header'
import { StatsCard, StatsGrid } from '@/components/ui/Stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getDashboardStats, getRecentActivities } from '@/actions/dashboard'
import { formatCurrency } from '@/lib/utils'
import { Users, UserCheck, MapPin, Wallet, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const [statsResult, activitiesResult] = await Promise.all([
    getDashboardStats(),
    getRecentActivities(5),
  ])

  const stats = statsResult.data
  const activities = activitiesResult.data || []

  return (
    <div className="animate-fade-in">
      <Header
        title="Dashboard"
        description="Overview of your labor management system"
        actions={
          <Link href="/attendance">
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <StatsGrid className="mb-8">
        <StatsCard
          title="Total Labors"
          value={stats?.totalLabors || 0}
          icon={Users}
        />
        <StatsCard
          title="Present Today"
          value={stats?.presentToday || 0}
          icon={UserCheck}
          iconClassName="from-emerald-500/20 to-green-500/20"
        />
        <StatsCard
          title="Active Sites"
          value={stats?.totalSitesActive || 0}
          icon={MapPin}
          iconClassName="from-cyan-500/20 to-teal-500/20"
        />
        <StatsCard
          title="Total Daily Wages"
          value={formatCurrency(stats?.totalDailyWages || 0)}
          icon={Wallet}
          iconClassName="from-amber-500/20 to-orange-500/20"
        />
      </StatsGrid>

      {/* Quick Stats Row */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card gradient>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-500/20">
                <TrendingUp className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Advances This Month</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(stats?.monthlyAdvancesGiven || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card gradient>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Payments Made</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(stats?.monthlyPaymentsMade || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card gradient>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Absent Today</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.absentToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Links */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30"
                  >
                    <div className={`p-2 rounded-lg ${activity.type === 'payment'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-indigo-500/20 text-indigo-400'
                      }`}>
                      {activity.type === 'payment' ? (
                        <Wallet className="w-4 h-4" />
                      ) : (
                        <Calendar className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{activity.description}</p>
                      <p className="text-xs text-slate-500">{activity.details}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2">
              <Link href="/labors/new">
                <div className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer text-center">
                  <Users className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Add Labor</p>
                </div>
              </Link>
              <Link href="/sites/new">
                <div className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer text-center">
                  <MapPin className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Add Site</p>
                </div>
              </Link>
              <Link href="/attendance">
                <div className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer text-center">
                  <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Attendance</p>
                </div>
              </Link>
              <Link href="/payments/new">
                <div className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer text-center">
                  <Wallet className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Add Payment</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
