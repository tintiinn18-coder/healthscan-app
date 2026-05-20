'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { getHealthScoreColor } from '@/lib/utils/healthAnalyzer'
import type { ScannedProduct } from '@/types'
import { History, Trash2, ExternalLink, AlertTriangle, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [scans, setScans] = useState<ScannedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user) loadScans()
  }, [user, authLoading, router])

  const loadScans = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setScans(data || [])
    } catch (error) {
      console.error('Load scans error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteScan = async (id: string) => {
    setDeleting(id)
    try {
      await supabase.from('scans').delete().eq('id', id)
      setScans(scans.filter(s => s.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeleting(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Loading scan history...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan History</h1>
          <p className="text-gray-600">Review all your previous product scans and health analyses</p>
        </div>
        <Link href="/scan">
          <Button>
            <History className="h-4 w-4" />
            New Scan
          </Button>
        </Link>
      </div>

      {scans.length === 0 ? (
        <Card className="text-center py-16">
          <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scans Yet</h3>
          <p className="text-gray-500 mb-6">Start scanning products to build your health history</p>
          <Link href="/scan">
            <Button>Scan Your First Product</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {scans.map((scan) => (
            <Card key={scan.id} className="hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                  {scan.product_image ? (
                    <img
                      src={scan.product_image}
                      alt={scan.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {scan.product_name || 'Unknown Product'}
                      </h3>
                      <p className="text-sm text-gray-500">{scan.brands || 'Unknown Brand'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={scan.risk_level === 'green' ? 'green' : scan.risk_level === 'yellow' ? 'yellow' : 'red'}
                        >
                          {scan.risk_level?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                        <span className={`text-sm font-bold ${
                          scan.health_score >= 80 ? 'text-green-600' :
                          scan.health_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {scan.health_score}/100
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/product/${scan.barcode}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => scan.id && deleteScan(scan.id)}
                        loading={deleting === scan.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Date & Additives */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {scan.created_at ? new Date(scan.created_at).toLocaleDateString() : 'Unknown date'}
                    </span>
                    {scan.additives && Array.isArray(scan.additives) && (
                      <span>{scan.additives.length} additives detected</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
