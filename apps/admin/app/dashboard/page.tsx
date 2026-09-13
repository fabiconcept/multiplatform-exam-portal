'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import {
  Users,
  UserCheck,
  UserPlus,
  Calendar,
  BookOpen,
  HelpCircle,
  Key,
  KeyRound,
  Shield,
  Activity,
  TrendingUp,
  ArrowUpRight,
  Clock,
  BarChart3,
  Settings,
  Upload,
  Plus,
  DollarSign,
  CreditCard,
  Clock3,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface DashboardStats {
  total_users: number
  new_users_today: number
  new_users_week: number
  total_questions: number
  total_exams: number
  total_keys: number
  used_keys: number
  active_users: number
  total_revenue: number
  successful_payments: number
  pending_payments: number
  revenue_today: number
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  const { token, admin } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    adminApi
      .dashboard(token)
      .then(setStats)
      .catch((err) => {
        console.error(err)
        toast.error('Failed to load dashboard')
      })
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <LoadingSkeleton />

  const activeKeys = (stats?.total_keys ?? 0) - (stats?.used_keys ?? 0)
  const activePercent = stats?.total_users
    ? Math.round(((stats.active_users ?? 0) / stats.total_users) * 100)
    : 0
  const usedKeysPercent = stats?.total_keys
    ? Math.round(((stats.used_keys ?? 0) / stats.total_keys) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, {admin?.name ?? 'Admin'}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening on your platform today.</p>
                {admin?.role && (
                  <Badge variant="secondary" className="capitalize">
                    <Shield className="mr-1 h-3 w-3" />
                    {admin.role}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild size="sm">
                <Link href="/dashboard/keys">
                  <Plus className="h-4 w-4" />
                  Generate Keys
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/questions">
                  <Upload className="h-4 w-4" />
                  Import Questions
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold tracking-tight">{stats?.total_users?.toLocaleString() ?? 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold tracking-tight">{stats?.active_users?.toLocaleString() ?? 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-muted-foreground">
                {activePercent}% of total users
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">New This Week</p>
                <p className="text-2xl font-bold tracking-tight">{stats?.new_users_week?.toLocaleString() ?? 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                Weekly growth
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <UserPlus className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Signups</p>
                <p className="text-2xl font-bold tracking-tight">{stats?.new_users_today?.toLocaleString() ?? 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Since midnight
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold tracking-tight">
                  N{((stats?.total_revenue ?? 0) / 100).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                N{((stats?.revenue_today ?? 0) / 100).toLocaleString()} today
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Successful Payments</p>
                <p className="text-2xl font-bold tracking-tight">{stats?.successful_payments?.toLocaleString() ?? 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/payments"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all payments
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock3 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold tracking-tight">{stats?.pending_payments?.toLocaleString() ?? 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-muted-500">
                Awaiting verification
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Avg. Payment</p>
                <p className="text-2xl font-bold tracking-tight">
                  N{stats?.successful_payments
                    ? Math.round((stats.total_revenue ?? 0) / stats.successful_payments / 100).toLocaleString()
                    : '0'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-xs text-muted-500">
                Per successful transaction
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              Platform Overview
            </CardTitle>
            <CardDescription>Key metrics for your exam platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Total Exams */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Exams</span>
                  </div>
                  <span className="text-sm font-bold">{stats?.total_exams ?? 0}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(((stats?.total_exams ?? 0) / Math.max(stats?.total_exams ?? 1, 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Total Questions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Questions</span>
                  </div>
                  <span className="text-sm font-bold">{stats?.total_questions ?? 0}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(((stats?.total_questions ?? 0) / Math.max(stats?.total_questions ?? 1, 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Active Keys */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Active Keys</span>
                  </div>
                  <span className="text-sm font-bold">{activeKeys}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-500/10">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${100 - usedKeysPercent}%` }}
                  />
                </div>
              </div>

              {/* Used Keys */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Used Keys</span>
                  </div>
                  <span className="text-sm font-bold">{stats?.used_keys ?? 0}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-amber-500/10">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${usedKeysPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard/keys">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Key className="h-4 w-4 text-primary" />
                  Generate Keys
                  <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/dashboard/questions">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Upload className="h-4 w-4 text-primary" />
                  Import Questions
                  <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/dashboard/users">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Users className="h-4 w-4 text-primary" />
                  Manage Users
                  <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/dashboard/exams">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Manage Exams
                  <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/dashboard/audit">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Activity className="h-4 w-4 text-primary" />
                  Audit Log
                  <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest actions on your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
            <Activity className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">No recent activity</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Actions like user signups and exam submissions will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
