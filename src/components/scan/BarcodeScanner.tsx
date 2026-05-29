'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Camera, X, ScanLine, Keyboard, Image as ImageIcon, Loader2, PenLine } from 'lucide-react'
import { ManualProductEntry } from './ManualProductEntry'
import type { ManualProductInput, UserHealthProfile } from '@/types'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
  onAnalyzeInput: (input: ManualProductInput) => Promise<void>
  userProfile?: Partial<UserHealthProfile> | null
}

type Tab = 'camera' | 'manual' | 'ocr' | 'ingredients'

export function BarcodeScanner({ onScan, onClose, onAnalyzeInput }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [tab, setTab] = useState<Tab>('camera')
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrText, setOcrText] = useState('')
  const [scanError, setScanError] = useState<string | null>(null)

  const initScanner = useCallback(() => {
    if (scannerRef.current) return

    try {
      const scanner = new Html5QrcodeScanner(
        'hs-reader',
        { fps: 10, qrbox: { width: 260, height: 120 }, aspectRatio: 1.5 },
        false
      )

      scanner.render(
        (decoded) => {
          scanner.clear().catch(() => {})
          onScan(decoded)
        },
        (errorMessage) => {
          if (
            errorMessage &&
            !errorMessage.includes('NotFoundException') &&
            !errorMessage.includes('No MultiFormat Readers')
          ) {
            setScanError('Camera unavailable. Try barcode typing, photo OCR, or manual ingredients instead.')
          }
        }
      )

      scannerRef.current = scanner
    } catch {
      setScanError('Could not start camera. Try the other scan options below.')
    }
  }, [onScan])

  useEffect(() => {
    if (tab === 'camera') {
      const timer = setTimeout(initScanner, 150)
      return () => clearTimeout(timer)
    }

    scannerRef.current?.clear().catch(() => {})
    scannerRef.current = null
  }, [tab, initScanner])

  useEffect(() => {
    return () => {
      scannerRef.current?.clear().catch(() => {})
    }
  }, [])

  const handleManualBarcode = () => {
    const code = manualInput.trim()
    if (code.length >= 8) {
      onScan(code)
    }
  }

  const handleOCRUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setOcrLoading(true)
    setOcrText('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ocr', { method: 'POST', body: formData })
      const data = await response.json()
      setOcrText(data.text || '')
    } catch {
      setOcrText('')
      setScanError('Could not read the photo clearly. Try another image or paste ingredients manually.')
    } finally {
      setOcrLoading(false)
    }
  }

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'camera', label: 'Camera', icon: <Camera className="h-4 w-4" /> },
    { id: 'manual', label: 'Barcode', icon: <Keyboard className="h-4 w-4" /> },
    { id: 'ocr', label: 'Photo OCR', icon: <ImageIcon className="h-4 w-4" /> },
    { id: 'ingredients', label: 'Ingredients', icon: <PenLine className="h-4 w-4" /> },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-blue-400" />
          <h2 className="text-white text-base font-semibold">Scan Product</h2>
        </div>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1 px-4 pt-4 pb-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setTab(item.id)
              setScanError(null)
            }}
            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all ${
              tab === item.id ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {tab === 'camera' && (
          <>
            <div id="hs-reader" className="rounded-2xl overflow-hidden bg-black w-full" />
            {scanError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-200 text-sm text-center">{scanError}</p>
              </div>
            )}
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-white/70 text-sm text-center leading-relaxed">
                Point your camera at the barcode. If the product is missing, you can still add the label details and analyze it.
              </p>
            </div>
          </>
        )}

        {tab === 'manual' && (
          <>
            <div className="bg-white rounded-2xl p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter Barcode Number</label>
                <input
                  type="number"
                  value={manualInput}
                  onChange={(event) => setManualInput(event.target.value)}
                  placeholder="e.g. 8901058850015"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg text-gray-900 bg-gray-50"
                  onKeyDown={(event) => event.key === 'Enter' && handleManualBarcode()}
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">Use the 8 to 14 digit code printed below the barcode.</p>
              </div>
              <button
                onClick={handleManualBarcode}
                disabled={manualInput.trim().length < 8}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <ScanLine className="h-5 w-5" />
                Search Product
              </button>
            </div>
          </>
        )}

        {tab === 'ocr' && (
          <>
            <div className="bg-white rounded-2xl p-5 space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                  <ImageIcon className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="font-semibold text-gray-800">Photo Scan Ingredients</h3>
                <p className="text-gray-500 text-sm">Take a clear photo of the ingredients or nutrition label.</p>
              </div>
              <label className="block w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-center cursor-pointer hover:bg-blue-600 transition-colors">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleOCRUpload} />
                {ocrLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Reading photo...
                  </span>
                ) : (
                  'Take Photo / Upload'
                )}
              </label>
            </div>

            {ocrText && (
              <ManualProductEntry
                initialValues={{
                  productName: 'Photo Scan Product',
                  ingredientsText: ocrText,
                }}
                helperText="Edit the extracted text until it looks right, then analyze it."
                buttonLabel="Analyze These Ingredients"
                submitSource="ocr"
                onAnalyze={async (input) => {
                  await onAnalyzeInput(input)
                  onClose()
                }}
              />
            )}

            <div className="bg-white/5 rounded-xl px-4 py-3">
              <p className="text-white/50 text-xs text-center">
                Best results: steady phone, good lighting, ingredients fully in frame.
              </p>
            </div>
          </>
        )}

        {tab === 'ingredients' && (
          <ManualProductEntry
            helperText="Type the ingredient list directly when the barcode database does not have your product."
            buttonLabel="Analyze Ingredients"
            submitSource="manual"
            onAnalyze={async (input) => {
              await onAnalyzeInput(input)
              onClose()
            }}
          />
        )}
      </div>

      <div className="px-4 pb-4 pt-2">
        <p className="text-white/40 text-xs text-center">For general information only. Not medical advice.</p>
      </div>
    </div>
  )
}
