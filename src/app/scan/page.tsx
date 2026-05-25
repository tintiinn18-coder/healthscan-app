'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ScanResult } from '@/components/scan/ScanResult'
import { useScan } from '@/lib/hooks/useScan'
import { useAuth } from '@/lib/hooks/useAuth'
import type { OFFProduct, HealthAnalysis } from '@/types'
import {
  Camera, Loader2, AlertTriangle, RefreshCw,
  Share2, ChevronRight, ChevronDown, Zap, Shield,
  Heart, User, Users, ScanLine
} from 'lucide-react'

const BarcodeScanner = dynamic(
  () => import('@/components/scan/BarcodeScanner').then(m => m.BarcodeScanner),
  { ssr: false }
)

interface FamilyMember {
  id: string; name: string; relation: string
  conditions: string[]; allergies: string[]
}

export default function ScanPage() {
  const [showScanner, setShowScanner] = useState(false)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)
  const [showMemberPicker, setShowMemberPicker] = useState(false)
  const [manualProduct, setManualProduct] = useState<OFFProduct | null>(null)
  const [manualAnalysis, setManualAnalysis] = useState<HealthAnalysis | null>(null)
  const { scanBarcode, loading, error, product, analysis, setProduct, setAnalysis } = useScan()
  const { user } = useAuth()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hs_family_members')
      if (stored) {
        const members = JSON.parse(stored) as FamilyMember[]
        setFamilyMembers(members)
        setSelectedMember(members[0] || null)
      }
    } catch {}
  }, [])

  const activeProduct = manualProduct || product
  const activeAnalysis = manualAnalysis || analysis

  const handleScan = async (barcode: string) => {
    setShowScanner(false)
    setManualProduct(null); setManualAnalysis(null)
    await scanBarcode(barcode, selectedMember ? {
      conditions: selectedMember.conditions,
      allergies: selectedMember.allergies,
      dietary_restrictions: [],
    } : null)
  }

  const handleManualResult = (p: OFFProduct, a: HealthAnalysis) => {
    setManualProduct(p); setManualAnalysis(a)
    setProduct(null); setAnalysis(null)
  }

  const handleReset = () => {
    setProduct(null); setAnalysis(null)
    setManualProduct(null); setManualAnalysis(null)
  }

  const handleShare = async () => {
    if (!activeProduct || !activeAnalysis) return
    const score = activeAnalysis.overall_score
    const emoji = score >= 70 ? '🟢' : score >= 45 ? '🟡' : '🔴'
    const text = `${emoji} I scanned ${activeProduct.product_name} with HealthScan!\n\nHealth Score: ${score}/100\n${activeAnalysis.summary}\n\nScan your food free 👉 https://healthscan-app.vercel.app\n\n⚠️ General information only. Not medical advice.`
    if (navigator.share) {
      await navigator.share({ title: 'HealthScan Result', text })
    } else {
      await navigator.clipboard.writeText(text)
      alert('Result copied to clipboard!')
    }
  }

  const popularScans = [
    { name: 'Maggi 2-Minute Noodles', barcode: '8901058850015', emoji: '🍜' },
    { name: 'Coca-Cola 330ml', barcode: '5449000000996', emoji: '🥤' },
    { name: "Haldiram's Aloo Bhujia", barcode: '8904004400779', emoji: '🥨' },
    { name: 'Nutella 400g', barcode: '3017620422003', emoji: '🍫' },
    { name: "Lay's Classic", barcode: '4009900006200', emoji: '🍟' },
    { name: 'KitKat', barcode: '7622210951052', emoji: '🍫' },
  ]

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scan a Product</h1>
        <p className="text-gray-500 text-sm mt-0.5">Barcode · Manual · Photo · Ingredients</p>
      </div>

      {/* Family selector */}
      {familyMembers.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowMemberPicker(!showMemberPicker)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-gray-500">Scanning for:</span>
              <span className="font-semibold text-gray-900">{selectedMember?.name || 'Select'}</span>
              {selectedMember?.conditions.length ? (
                <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full">{selectedMember.conditions[0]}{selectedMember.conditions.length > 1 ? ` +${selectedMember.conditions.length - 1}` : ''}</span>
              ) : null}
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showMemberPicker ? 'rotate-180' : ''}`} />
          </button>
          {showMemberPicker && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {familyMembers.map(m => (
                <button key={m.id} onClick={() => { setSelectedMember(m); setShowMemberPicker(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${selectedMember?.id === m.id ? 'bg-blue-50' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.name} <span className="text-gray-400 capitalize">({m.relation})</span></p>
                    {m.conditions.length > 0 && <p className="text-xs text-red-500">{m.conditions.join(', ')}</p>}
                    {m.allergies.length > 0 && <p className="text-xs text-amber-500">Allergies: {m.allergies.join(', ')}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!user && (
        <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-3">
          <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700"><a href="/auth/login" className="font-semibold underline">Sign in</a> to get personalised health alerts for your specific conditions, allergies & family.</p>
        </div>
      )}

      {/* Scan button */}
      {!loading && (
        <button
          onClick={() => setShowScanner(true)}
          className="w-full flex items-center justify-between px-5 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Camera className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Open Scanner</p>
              <p className="text-blue-100 text-xs">Camera · Barcode · Photo scan · Ingredients</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">Analysing{selectedMember ? ` for ${selectedMember.name}` : ''}...</h3>
          <p className="text-gray-400 text-sm mt-1">Checking ingredients, additives & nutrition</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-white rounded-2xl border border-red-100 p-5 space-y-3">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">Product Not Found</h3>
              <p className="text-gray-500 text-sm mt-0.5">{error}</p>
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <p className="text-xs text-amber-700 leading-relaxed"><strong>💡 Tip:</strong> Many Indian local brands aren't in the global database yet. Use the <strong>"Ingredients"</strong> tab to type the ingredients list directly for a full health analysis — no barcode needed.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowScanner(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
            <button onClick={handleReset} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-colors">Clear</button>
          </div>
        </div>
      )}

      {/* Result */}
      {activeProduct && activeAnalysis && !loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">← Scan Another</button>
            <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-600 font-medium transition-colors">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
          {selectedMember && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl">
              <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700 font-medium">Personalised for <strong>{selectedMember.name}</strong>{selectedMember.conditions.length > 0 ? ` · ${selectedMember.conditions.join(', ')}` : ''}</p>
            </div>
          )}
          <ScanResult product={activeProduct} analysis={activeAnalysis} />
        </div>
      )}

      {/* Empty state */}
      {!activeProduct && !loading && !error && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Zap, label: 'Instant AI analysis', color: 'text-amber-500', bg: 'bg-amber-50' },
              { icon: Shield, label: 'Additive risk check', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Heart, label: 'Personalised results', color: 'text-rose-500', bg: 'bg-rose-50' },
            ].map(f => {
              const Icon = f.icon
              return (
                <div key={f.label} className={`${f.bg} rounded-xl p-3 text-center`}>
                  <Icon className={`h-5 w-5 ${f.color} mx-auto mb-1`} />
                  <p className="text-xs font-medium text-gray-700">{f.label}</p>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Try popular products</p>
              <p className="text-xs text-gray-400">tap to scan</p>
            </div>
            {popularScans.map(item => (
              <button key={item.barcode} onClick={() => handleScan(item.barcode)}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.emoji}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{item.barcode}</p>
                  </div>
                </div>
                <ScanLine className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
              </button>
            ))}
          </div>

          <div className="bg-amber-50 rounded-xl p-3">
            <p className="text-xs text-amber-700 text-center leading-relaxed">⚕️ <strong>Disclaimer:</strong> For general information only. Not medical advice. Always consult a qualified healthcare professional.</p>
          </div>
        </div>
      )}

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          onManualResult={handleManualResult}
          userProfile={selectedMember ? { conditions: selectedMember.conditions, allergies: selectedMember.allergies, dietary_restrictions: [] } : null}
        />
      )}
    </div>
  )
}
