'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Camera, X, ScanLine, Keyboard, Image as ImageIcon, Loader2, PenLine } from 'lucide-react'
import { ManualProductEntry } from './ManualProductEntry'
import type { OFFProduct, HealthAnalysis, UserHealthProfile } from '@/types'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
  onManualResult?: (product: OFFProduct, analysis: HealthAnalysis) => void
  userProfile?: Partial<UserHealthProfile> | null
}

type Tab = 'camera' | 'manual' | 'ocr' | 'ingredients'

export function BarcodeScanner({ onScan, onClose, onManualResult, userProfile }: BarcodeScannerProps) {
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
        (decoded) => { scanner.clear().catch(() => {}); onScan(decoded) },
        (err) => {
          if (err && !err.includes('NotFoundException') && !err.includes('No MultiFormat')) {
            setScanError('Camera unavailable. Try Manual Entry or type the barcode number.')
          }
        }
      )
      scannerRef.current = scanner
    } catch { setScanError('Could not start camera. Use Manual Entry instead.') }
  }, [onScan])

  useEffect(() => {
    if (tab === 'camera') {
      const t = setTimeout(initScanner, 150)
      return () => clearTimeout(t)
    } else {
      scannerRef.current?.clear().catch(() => {})
      scannerRef.current = null
    }
  }, [tab, initScanner])

  useEffect(() => () => { scannerRef.current?.clear().catch(() => {}) }, [])

  const handleManual = () => {
    const code = manualInput.trim()
    if (code.length >= 8) onScan(code)
  }

  const handleOCRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setOcrLoading(true); setOcrText('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/ocr', { method: 'POST', body: formData })
      const data = await res.json()
      setOcrText(data.text || 'Could not read text. Try a clearer, well-lit photo.')
    } catch { setOcrText('OCR failed. Try Manual Entry.') }
    finally { setOcrLoading(false) }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'camera', label: 'Camera', icon: <Camera className="h-4 w-4" /> },
    { id: 'manual', label: 'Barcode', icon: <Keyboard className="h-4 w-4" /> },
    { id: 'ocr', label: 'Photo OCR', icon: <ImageIcon className="h-4 w-4" /> },
    { id: 'ingredients', label: 'Ingredients', icon: <PenLine className="h-4 w-4" /> },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.97)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-blue-400" />
          <h2 className="text-white text-base font-semibold">Scan Product</h2>
        </div>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 px-4 pt-4 pb-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setScanError(null) }}
            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all ${
              tab === t.id ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Camera */}
        {tab === 'camera' && (
          <>
            <div id="hs-reader" className="rounded-2xl overflow-hidden bg-black w-full" />
            {scanError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-300 text-sm text-center">{scanError}</p>
              </div>
            )}
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-white/70 text-sm text-center leading-relaxed">
                Point camera at barcode. Works with biscuits, drinks, snacks, namkeen, Maggi, chocolates and more.
              </p>
            </div>
          </>
        )}

        {/* Manual barcode entry */}
        {tab === 'manual' && (
          <>
            <div className="bg-white rounded-2xl p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter Barcode Number</label>
                <input
                  type="number"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  placeholder="e.g. 8901058850015"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg text-gray-900 bg-gray-50"
                  onKeyDown={e => e.key === 'Enter' && handleManual()}
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">Find the 8–14 digit number printed below the barcode</p>
              </div>
              <button
                onClick={handleManual}
                disabled={manualInput.trim().length < 8}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <ScanLine className="h-5 w-5" /> Search Product
              </button>
            </div>
            <div className="bg-white/5 rounded-xl px-4 py-3 space-y-1">
              <p className="text-white/60 text-xs font-medium mb-2">Quick test barcodes:</p>
              {[
                ['5449000000996', 'Coca-Cola 330ml', '🥤'],
                ['8901058850015', 'Maggi 2-Minute Noodles', '🍜'],
                ['8904004400779', "Haldiram's Aloo Bhujia", '🥨'],
                ['3017620422003', 'Nutella 400g', '🍫'],
              ].map(([code, name, emoji]) => (
                <button key={code} onClick={() => setManualInput(code)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-white/80 text-sm">{emoji} {name}</span>
                  <span className="text-white/40 text-xs font-mono">{code}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* OCR Photo */}
        {tab === 'ocr' && (
          <>
            <div className="bg-white rounded-2xl p-5 space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                  <ImageIcon className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="font-semibold text-gray-800">Photo of Barcode / Label</h3>
                <p className="text-gray-500 text-sm">Take a photo of the barcode or ingredients label</p>
              </div>
              <label className="block w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-center cursor-pointer hover:bg-blue-600 transition-colors">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleOCRUpload} />
                {ocrLoading
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Reading...</span>
                  : '📷 Take Photo / Upload'}
              </label>
            </div>
            {ocrText && (
              <div className="bg-white rounded-2xl p-5 space-y-3">
                <h4 className="font-semibold text-gray-800 text-sm">Extracted Text:</h4>
                <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{ocrText}</p>
                </div>
                <p className="text-xs text-gray-400">If you can see the ingredients here, switch to the &quot;Ingredients&quot; tab and paste them for a full health analysis.</p>
              </div>
            )}
            <div className="bg-white/5 rounded-xl px-4 py-3">
              <p className="text-white/50 text-xs text-center">Best results: hold phone steady, good lighting, label fully in frame</p>
            </div>
          </>
        )}

        {/* Manual ingredient entry */}
        {tab === 'ingredients' && (
          <ManualProductEntry
            userProfile={userProfile}
            onResult={(product, analysis) => {
              onClose()
              onManualResult?.(product, analysis)
            }}
          />
        )}
      </div>

      <div className="px-4 pb-4 pt-2">
        <p className="text-white/30 text-xs text-center">For general information only. Not medical advice.</p>
      </div>
    </div>
  )
}
