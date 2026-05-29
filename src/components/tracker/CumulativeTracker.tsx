'use client'

import type { ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { useTracker } from '@/lib/hooks/useTracker'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, Zap } from 'lucide-react'

export function CumulativeTracker() {
  const { weeklyStats, streakData, chemicalExposure, loading } = useTracker()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-400">Loading your health data...</div>
      </div>
    )
  }

  if (!weeklyStats) {
    return (
      <Card className="text-center py-12">
        <CardTitle>No Data Yet</CardTitle>
        <CardDescription className="mt-2">Start scanning products to see your weekly label tracking.</CardDescription>
      </Card>
    )
  }

  const budgetData = Object.entries(weeklyStats.budget_adherence).map(([key, data]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
    percentage: data.percentage,
    status: data.status,
    actual: data.actual,
    target: data.target,
  }))

  const chemicalData = chemicalExposure.map((exp) => ({
    code: exp.chemical_code,
    name: exp.chemical_name,
    quantityKnown: exp.quantity_known ?? exp.quantityKnown ?? false,
    estimatedAmount: exp.estimated_amount_mg ?? exp.estimatedAmountMg ?? exp.amount_mg ?? null,
    exposureEvents: exp.exposure_events ?? exp.exposureEvents ?? 0,
    sourceProducts: exp.source_products || [],
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Health Report</h2>
          <p className="text-sm text-gray-500">
            {weeklyStats.week_start} to {weeklyStats.week_end}
          </p>
        </div>
        {streakData && (
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
            <Zap className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">{streakData.current_streak_days} day streak</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Scans" value={weeklyStats.total_scans} icon={<TrendingUp className="h-5 w-5 text-blue-500" />} />
        <StatCard label="Avg Score" value={weeklyStats.average_health_score} suffix="/100" icon={<TrendingUp className="h-5 w-5 text-green-500" />} />
        <StatCard label="Additives" value={weeklyStats.total_additives} icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />} />
        <StatCard label="Tracked Items" value={weeklyStats.unique_chemicals.length} icon={<TrendingDown className="h-5 w-5 text-red-500" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Budget Adherence</CardTitle>
          <CardDescription>Weekly totals vs. your personalized limits</CardDescription>
        </CardHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData} layout="vertical">
              <XAxis type="number" domain={[0, 150]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value: number, _name: string, props: any) => [`${props.payload.actual} / ${props.payload.target} (${value}%)`, 'Progress']} />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {budgetData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.status === 'over' ? '#ef4444' : entry.status === 'near' ? '#f59e0b' : '#22c55e'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {chemicalData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exposure Events This Week</CardTitle>
            <CardDescription>Recorded whenever an additive of concern appears in a scanned product</CardDescription>
          </CardHeader>
          <div className="space-y-3">
            {chemicalData.map((chemical, index) => (
              <div key={index} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{chemical.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">{chemical.code}</span>
                  </div>
                  {chemical.quantityKnown && chemical.estimatedAmount !== null ? (
                    <p className="text-sm text-gray-500">{chemical.estimatedAmount}mg estimated from label data</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Exposure event recorded: {chemical.name} found in {chemical.exposureEvents || 1} scanned product{(chemical.exposureEvents || 1) > 1 ? 's' : ''}. Exact quantity not available from label data.
                    </p>
                  )}
                  {chemical.sourceProducts.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">Products: {chemical.sourceProducts.slice(0, 3).join(', ')}</p>
                  )}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{chemical.exposureEvents || 1} event(s)</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {weeklyStats.top_concerns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>This Week&apos;s Concerns</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {weeklyStats.top_concerns.map((concern, index) => (
              <Alert key={index} variant="warning">
                {concern}
              </Alert>
            ))}
          </div>
        </Card>
      )}

      {weeklyStats.improvements.length > 0 && (
        <Card className="bg-green-50/50">
          <CardHeader>
            <CardTitle>Wins This Week</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {weeklyStats.improvements.map((improvement, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-green-800">
                <TrendingUp className="h-4 w-4" />
                {improvement}
              </div>
            ))}
          </div>
        </Card>
      )}

      {weeklyStats.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {weeklyStats.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-700 p-3 bg-blue-50 rounded-xl">
                <Zap className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                {recommendation}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function StatCard({ label, value, suffix = '', icon }: { label: string; value: number; suffix?: string; icon: ReactNode }) {
  return (
    <Card className="text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">
        {value}
        {suffix}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </Card>
  )
}
