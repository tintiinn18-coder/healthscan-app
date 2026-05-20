'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Camera, X, ScanLine, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!showManual) {
      const scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          formatsToSupport: [
            0, // QR_CODE
            1, // AZTEC
            2, // CODE_39
            3, // CODE_93
            4, // CODE_128
            5, // DATA_MATRIX
            6, // MAXICODE
            7, // ITF
            8, // EAN_13
            9, // EAN_8
            10, // PDF_417
            11, // RSS_14
            12, // RSS_EXPANDED
            13, // SMS
            14, // UPC_A
            15, // UPC_E
          ]
        },
        false
      )

      scanner.render(
        (decodedText) => {
          onScan(decodedText)
          scanner.clear().catch(console.error)
        },
        (errorMessage) => {
          // Ignore scan errors (no code found in frame)
          if (!errorMessage.includes('NotFoundException')) {
            setError(errorMessage)
          }
        }
      )

      scannerRef.current = scanner

      return () => {
        scanner.clear().catch(console.error)
      }
    }
  }, [showManual, onScan])

  const handleManualSubmit = () => {
    if (manualInput.trim().length >= 8) {
      onScan(manualInput.trim())
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-white text-lg font-semibold flex items-center gap-2">
          <ScanLine className="h-5 w-5" />
          Scan Product Barcode
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Toggle */}
      <div className="flex justify-center gap-2 px-4 pb-4">
        <button
          onClick={() => setShowManual(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !showManual ? 'bg-white text-black' : 'bg-white/20 text-white'
          }`}
        >
          <Camera className="h-4 w-4" />
          Camera
        </button>
        <button
          onClick={() => setShowManual(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            showManual ? 'bg-white text-black' : 'bg-white/20 text-white'
          }`}
        >
          <Keyboard className="h-4 w-4" />
          Manual Entry
        </button>
      </div>

      {/* Scanner or Manual Input */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {showManual ? (
          <div className="w-full max-w-sm space-y-4">
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Enter Barcode Number
              </label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="e.g., 5449000000996"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              />
              <Button
                onClick={handleManualSubmit}
                fullWidth
                disabled={manualInput.trim().length < 8}
              >
                <ScanLine className="h-4 w-4" />
                Scan This Code
              </Button>
            </div>
            <p className="text-white/60 text-sm text-center">
              Find the barcode (EAN-13 or UPC) on the product packaging
            </p>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <div id="reader" className="rounded-2xl overflow-hidden" />
            {error && (
              <p className="text-red-400 text-sm text-center mt-4">{error}</p>
            )}
            <p className="text-white/60 text-sm text-center mt-4">
              Point camera at product barcode
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
