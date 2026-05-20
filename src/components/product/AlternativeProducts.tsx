'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { AlternativeProduct } from '@/types'
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface AlternativeProductsProps {
  category: string
  excludeBrands: string[]
}

export function AlternativeProducts({ category, excludeBrands }: AlternativeProductsProps) {
  const [alternatives, setAlternatives] = useState<AlternativeProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadAlternatives()
  }, [category, excludeBrands.join(',')])

  const loadAlternatives = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, excludeBrands, limit: showAll ? 10 : 3 })
      })

      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setAlternatives(data)
    } catch (error) {
      console.error('Load alternatives error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="text-center py-8">
        <Loader2 className="h-8 w-8 text-health-blue animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-500">Finding healthier alternatives...</p>
      </Card>
    )
  }

  if (alternatives.length === 0) {
    return (
      <Card className="text-center py-8">
        <Sparkles className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No healthier alternatives found in this category</p>
      </Card>
    )
  }

  const displayItems = showAll ? alternatives : alternatives.slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-health-green" />
          <CardTitle>Better Alternatives</CardTitle>
        </div>
        <CardDescription>Healthier options in the same category</CardDescription>
      </CardHeader>
      <div className="space-y-3">
        {displayItems.map((alt, i) => (
          <Link key={alt.code} href={`/product/${alt.code}`}>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors cursor-pointer">
              <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                {alt.image_url ? (
                  <img src={alt.image_url} alt={alt.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Sparkles className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 line-clamp-1">{alt.product_name}</h4>
                  {i === 0 && (
                    <Badge variant="green" size="sm">BEST</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{alt.brands}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-sm font-bold ${
                    alt.health_score >= 80 ? 'text-green-600' :
                    alt.health_score >= 60 ? 'text-yellow-600' : 'text-orange-600'
                  }`}>
                    {alt.health_score}/100
                  </span>
                  {alt.nutrition_grades && (
                    <Badge variant="gray" size="sm">Nutri-Score {alt.nutrition_grades.toUpperCase()}</Badge>
                  )}
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
      {alternatives.length > 3 && (
        <Button
          variant="ghost"
          fullWidth
          className="mt-3"
          onClick={() => { setShowAll(!showAll); loadAlternatives(); }}
        >
          {showAll ? 'Show Less' : `Show All ${alternatives.length} Alternatives`}
        </Button>
      )}
    </Card>
  )
}
