'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const BarcodeScanner = dynamic(
  () => import('@/components/scan/BarcodeScanner').then(m => m.BarcodeScanner),
  { ssr: false }
)
import { ScanResult } from '@/components/scan/ScanResult'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useScan } from '@/lib/hooks/useScan'
import { ScanLine, Camera, Loader2, AlertTriangle, Info } from 'lucide-react'

export default function ScanPage() {
  const [showScanner, setShowScanner] = useState(false)
  const { scanBarcode, loading, error, product, analysis, setProduct, setAnalysis } = useScan()

  const handleScan = async (barcode: string) => {
    setShowScanner(false)
    await scanBarcode(barcode)
  }

  const handleReset = () => {
    setProduct(null)
    setAnalysis(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan a Product</h1>
        <p className="text-gray-600">Point your camera at any food barcode or enter it manually</p>
      </div>

      {/* Scan Button or Loading */}
      {!product && !loading && (
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ScanLine className="h-10 w-10 text-health-blue" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to Scan</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Use your camera to scan barcodes or type them in manually. 
            Works with EAN-13, UPC-A, and most common formats.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setShowScanner(true)}>
              <Camera className="h-5 w-5" />
              Open Camera Scanner
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Try scanning: 5449000000996 (Coca-Cola) or 3017620422003 (Nutella)
          </p>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="text-center py-16">
          <Loader2 className="h-12 w-12 text-health-blue animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Analyzing Product...</h3>
          <p className="text-gray-500 mt-2">Fetching data from Open Food Facts and running health analysis</p>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-health-red mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan Failed</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setShowScanner(true)}>
              <Camera className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Clear
            </Button>
          </div>
        </Card>
      )}

      {/* Scan Result */}
      {product && analysis && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="secondary" size="sm" onClick={handleReset}>
              ← Scan Another
            </Button>
            <Button size="sm" onClick={() => setShowScanner(true)}>
              <Camera className="h-4 w-4" />
              New Scan
            </Button>
          </div>

          <ScanResult product={product} analysis={analysis} />

          {/* Quick Actions */}
          <Card className="bg-blue-50/50">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" size="sm" className="justify-center">
                <Info className="h-4 w-4" />
                View Full Details
              </Button>
              <Button variant="secondary" size="sm" className="justify-center">
                <ScanLine className="h-4 w-4" />
                Find Alternatives
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
