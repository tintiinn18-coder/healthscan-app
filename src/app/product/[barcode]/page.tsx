'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getProductByBarcode } from '@/lib/api/openfoodfacts'
import { analyzeProduct } from '@/lib/utils/healthAnalyzer'
import { createClient } from '@/lib/supabase/client'
import { ScanResult } from '@/components/scan/ScanResult'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import type { OFFProduct, HealthAnalysis } from '@/types'
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProductDetailPage() {
  const params = useParams()
  const barcode = params.barcode as string
  const [product, setProduct] = useState<OFFProduct | null>(null)
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (barcode) loadProduct()
  }, [barcode])

  const loadProduct = async () => {
    setLoading(true)
    setError('')

    try {
      const productData = await getProductByBarcode(barcode)
      if (!productData) {
        setError('Product not found in database')
        setLoading(false)
        return
      }

      setProduct(productData)

      // Get user profile for personalized analysis
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      let userProfile = null
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        userProfile = data
      }

      const analysisData = analyzeProduct(productData, userProfile)
      setAnalysis(analysisData)
    } catch (err) {
      setError('Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-health-blue animate-spin" />
      </div>
    )
  }

  if (error || !product || !analysis) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <AlertTriangle className="h-12 w-12 text-health-red mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'Unable to load product details'}</p>
        <Link href="/scan">
          <Button>
            <ArrowLeft className="h-4 w-4" />
            Back to Scanner
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/scan">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <Link href="/scan">
          <Button size="sm">Scan Another</Button>
        </Link>
      </div>

      <ScanResult product={product} analysis={analysis} />

      {/* Product Metadata */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Barcode:</span>
            <span className="ml-2 font-medium">{product.code}</span>
          </div>
          <div>
            <span className="text-gray-500">Brand:</span>
            <span className="ml-2 font-medium">{product.brands || 'Unknown'}</span>
          </div>
          <div>
            <span className="text-gray-500">Quantity:</span>
            <span className="ml-2 font-medium">{product.quantity || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Categories:</span>
            <span className="ml-2 font-medium">{product.categories || 'N/A'}</span>
          </div>
          {product.nutriscore_grade && (
            <div>
              <span className="text-gray-500">Nutri-Score:</span>
              <span className={`ml-2 font-bold ${
                product.nutriscore_grade === 'a' ? 'text-green-600' :
                product.nutriscore_grade === 'b' ? 'text-green-500' :
                product.nutriscore_grade === 'c' ? 'text-yellow-500' :
                product.nutriscore_grade === 'd' ? 'text-orange-500' : 'text-red-500'
              }`}>
                {product.nutriscore_grade.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Raw Ingredients */}
      {product.ingredients_text && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Ingredients</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{product.ingredients_text}</p>
        </Card>
      )}

      {/* Nutrition Facts */}
      {product.nutriments && Object.keys(product.nutriments).length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Nutrition Facts (per 100g)</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(product.nutriments)
              .filter(([_, value]) => typeof value === 'number')
              .map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-medium">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}
