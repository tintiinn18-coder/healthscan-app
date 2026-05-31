'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { History, Trash2, ScanLine, CheckCircle, XCircle, Clock, TrendingUp, Filter, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import type { ScannedProduct } from '@/types'
import type { ConsumptionStatus } from '@/lib/hooks/useScan'

type FilterType = 'all' | 'consumed' | 'scanned_only'

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [scans, setScans] = useState<ScannedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [showFilter, setShowFilter] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return }
    if (user) loadScans()
  }, [user, authLoading])

  const loadScans = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('scans').select('*')
        .order('created_at', { ascending: false }).limit(100)
      setScans(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const updateConsumption = async (id: string, status: ConsumptionStatus) => {
    await supabase.from('scans').update({ consumption_status: status }).eq('id', id)
    setScans(scans.map(s => s.id === id ? { ...s, consumption_status: status } as any : s))
  }

  const deleteScan = async (id: string) => {
    setDeleting(id)
    await supabase.from('scans').delete().eq('id', id)
    setScans(scans.filter(s => s.id !== id))
    setDeleting(null)
  }

  const filtered = scans.filter(s => {
    const status = (s as any).consumption_status
    if (filter === 'consumed') return status === 'consumed'
    if (filter === 'scanned_only') return status === 'not_consumed' || status === 'pending' || !status
    return true
  })

  // Stats
  const consumed = scans.filter(s => (s as any).consumption_status === 'consumed')
  const avgScore = consumed.length > 0 ? Math.round(consumed.reduce((a, s) => a + s.health_score, 0) / consumed.length) : 0
  const redCount = consumed.filter(s => s.risk_level === 'red').length

  const scoreColor = (score: number) =>
    score >= 70 ? 'text-green-600 bg-green-50' : score >= 45 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    consumed: { label: 'Consumed', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
    not_consumed: { label: 'Scan only', icon: XCircle, color: 'text-gray-500 bg-gray-50 border-gray-200' },
    maybe_later: { label: 'Maybe later', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    pending: { label: 'Not set', icon: ScanLine, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    const today = new Date()
    const diff = Math.floor((today.getTime() - date.getTime()) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  if (authLoading || loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading history...</p>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>
          <p className="text-gray-500 text-sm mt-0.5">{scans.length} total scans</p>
        </div>
        <Link href="/scan">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
            <ScanLine className="h-4 w-4" /> Scan
          </button>
        </Link>
      </div>

      {/* Stats row */}
      {consumed.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{consumed.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Consumed</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
            <p className={`text-2xl font-bold ${avgScore >= 70 ? 'text-green-600' : avgScore >= 45 ? 'text-yellow-600' : 'text-red-600'}`}>{avgScore}</p>
            <p className="text-xs text-gray-400 mt-0.5">Avg score</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{redCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">High risk</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="relative">
        <button onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-blue-300 transition-colors">
          <Filter className="h-4 w-4" />
          {filter === 'all' ? 'All scans' : filter === 'consumed' ? 'Consumed only' : 'Scan-only'}
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
        </button>
        {showFilter && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden min-w-[160px]">
            {(['all', 'consumed', 'scanned_only'] as FilterType[]).map(f => (
              <button key={f} onClick={() => { setFilter(f); setShowFilter(false) }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${filter === f ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                {f === 'all' ? 'All scans' : f === 'consumed' ? 'Consumed only' : 'Scan-only'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scan list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <History className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-500">No scans yet</p>
          <p className="text-sm text-gray-400 mt-1">Start scanning products to see your history here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(scan => {
            const status = ((scan as any).consumption_status || 'pending') as string
            const cfg = statusConfig[status] || statusConfig.pending
            const StatusIcon = cfg.icon
            return (
              <div key={scan.id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                {/* Product row */}
                <div className="flex gap-3">
                  {scan.product_image ? (
                    <img src={scan.product_image} alt={scan.product_name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <ScanLine className="h-5 w-5 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{scan.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{(scan as any).brands || 'Unknown brand'}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(scan.health_score)}`}>{scan.health_score}/100</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${scan.risk_level === 'green' ? 'bg-green-50 text-green-600' : scan.risk_level === 'yellow' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>{scan.risk_level}</span>
                      <span className="text-xs text-gray-400 ml-auto">{formatDate((scan as any).created_at || '')}</span>
                    </div>
                  </div>
                </div>

                {/* Consumption status row */}
                <div className="border-t border-gray-50 pt-3">
                  {status === 'consumed' ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium text-green-700">Logged as consumed</span>
                      </div>
                      <button onClick={() => updateConsumption(scan.id!, 'not_consumed')}
                        className="text-xs text-gray-400 hover:text-gray-600 underline">Undo</button>
                    </div>
                  ) : status === 'not_consumed' ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Scan only — not tracked</span>
                      </div>
                      <button onClick={() => updateConsumption(scan.id!, 'consumed')}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium">Mark consumed</button>
                    </div>
                  ) : (
                    // pending or maybe_later — ask the question
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">Did you eat / drink this?</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button onClick={() => updateConsumption(scan.id!, 'consumed')}
                          className="py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl text-xs font-semibold text-green-700 transition-colors flex items-center justify-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Yes
                        </button>
                        <button onClick={() => updateConsumption(scan.id!, 'not_consumed')}
                          className="py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 transition-colors flex items-center justify-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> No
                        </button>
                        <button onClick={() => updateConsumption(scan.id!, 'maybe_later')}
                          className="py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-semibold text-amber-700 transition-colors flex items-center justify-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> Later
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete */}
                <div className="flex justify-end">
                  <button onClick={() => scan.id && deleteScan(scan.id)} disabled={deleting === scan.id}
                    className="flex items-center gap-1 text-xs text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />{deleting === scan.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tracker tip */}
      {consumed.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-4 flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Your nutrition tracker is running</p>
            <p className="text-xs text-blue-600 mt-0.5">Only consumed products affect your daily budget. Visit the <Link href="/tracker" className="underline font-medium">Tracker page</Link> to see today's totals.</p>
          </div>
        </div>
      )}
    </div>
  )
}
