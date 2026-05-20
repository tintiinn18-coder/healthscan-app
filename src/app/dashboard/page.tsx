'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { CumulativeTracker } from '@/components/tracker/CumulativeTracker'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ScanLine, TrendingUp, Shield, Zap, ChevronRight } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Loading your dashboard...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Health Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your nutrition, chemical exposure, and health trends</p>
        </div>
        <Link href="/scan">
          <Button size="lg">
            <ScanLine className="h-5 w-5" />
            Scan Product
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStatCard
          icon={<ScanLine className="h-5 w-5 text-blue-500" />}
          label="This Week's Scans"
          value="0"
          href="/history"
        />
        <QuickStatCard
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          label="Avg Health Score"
          value="--"
          href="/history"
        />
        <QuickStatCard
          icon={<Shield className="h-5 w-5 text-yellow-500" />}
          label="Risk Alerts"
          value="--"
          href="/profile"
        />
        <QuickStatCard
          icon={<Zap className="h-5 w-5 text-orange-500" />}
          label="Day Streak"
          value="0"
          href="/history"
        />
      </div>

      {/* Main Tracker */}
      <CumulativeTracker />

      {/* Getting Started Guide */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Complete these steps to get the most from HealthScan</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          <SetupStep
            number={1}
            title="Set Your Health Profile"
            description="Add your conditions, allergies, and dietary restrictions for personalized alerts"
            href="/profile"
            completed={false}
          />
          <SetupStep
            number={2}
            title="Scan Your First Product"
            description="Point your camera at any food barcode to see instant health analysis"
            href="/scan"
            completed={false}
          />
          <SetupStep
            number={3}
            title="Check Weekly Reports"
            description="Review your cumulative exposure and health trends every week"
            href="/dashboard"
            completed={false}
          />
        </div>
      </Card>
    </div>
  )
}

function QuickStatCard({ icon, label, value, href }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <span className="text-2xl font-bold text-gray-900">{value}</span>
        </div>
        <p className="text-xs text-gray-500">{label}</p>
      </Card>
    </Link>
  )
}

function SetupStep({ number, title, description, href, completed }: {
  number: number;
  title: string;
  description: string;
  href: string;
  completed: boolean;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl hover:shadow-sm transition-shadow cursor-pointer">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
          completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {completed ? '✓' : number}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Link>
  )
}
