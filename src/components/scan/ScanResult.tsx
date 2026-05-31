'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Info, Zap, AlertCircle } from 'lucide-react'
import type { OFFProduct, HealthAnalysis } from '@/types'

interface ScanResultProps { product: OFFProduct; analysis: HealthAnalysis }

export function ScanResult({ product, analysis }: ScanResultProps) {
  const [showAdditives, setShowAdditives] = useState(true)
  const [showNutrition, setShowNutrition] = useState(true)
  const [showRisks, setShowRisks] = useState(true)

  const score = analysis.overall_score
  const scoreConfig =
    score >= 70 ? { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-500', label: 'Good' }
    : score >= 45 ? { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', bar: 'bg-yellow-500', label: 'Moderate' }
    : { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500', label: 'Poor' }

  const nova = product.nova_group
  const novaLabel: Record<number, { label: string; color: string }> = {
    1: { label: 'NOVA 1 · Unprocessed', color: 'bg-green-100 text-green-700' },
    2: { label: 'NOVA 2 · Culinary ingredient', color: 'bg-green-100 text-green-700' },
    3: { label: 'NOVA 3 · Processed food', color: 'bg-yellow-100 text-yellow-700' },
    4: { label: 'NOVA 4 · Ultra-processed', color: 'bg-red-100 text-red-700' },
  }

  const nutriscore = (product.nutrition_grades || product.nutriscore_grade || '').toUpperCase()
  const nutriscoreColors: Record<string, string> = { A: 'bg-green-500', B: 'bg-green-400', C: 'bg-yellow-400', D: 'bg-orange-400', E: 'bg-red-500' }

  return (
    <div className="space-y-4">
      {/* Product header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3">
        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.product_name || 'Product'} width={80} height={80} className="w-full h-full object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Info className="h-7 w-7 text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{product.product_name || 'Unknown Product'}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{product.brands || 'Unknown Brand'}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {nova && novaLabel[nova] && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${novaLabel[nova].color}`}>{novaLabel[nova].label}</span>
            )}
            {nutriscore && nutriscoreColors[nutriscore] && (
              <span className={`text-xs px-2 py-0.5 rounded-full text-white font-bold ${nutriscoreColors[nutriscore]}`}>Nutri-Score {nutriscore}</span>
            )}
          </div>
        </div>
      </div>

      {/* Health Score Card */}
      <div className={`bg-white rounded-2xl border-2 ${scoreConfig.border} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Health Score</p>
            <div className="flex items-end gap-2 mt-1">
              <span className={`text-5xl font-bold ${scoreConfig.color}`}>{score}</span>
              <span className="text-gray-400 text-lg mb-1">/ 100</span>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${scoreConfig.bg} ${scoreConfig.color} mb-1`}>{scoreConfig.label}</span>
            </div>
          </div>
          <div className={`w-16 h-16 rounded-2xl ${scoreConfig.bg} flex items-center justify-center`}>
            {score >= 70 ? <CheckCircle className={`h-8 w-8 ${scoreConfig.color}`} />
              : score >= 45 ? <AlertCircle className={`h-8 w-8 ${scoreConfig.color}`} />
              : <XCircle className={`h-8 w-8 ${scoreConfig.color}`} />}
          </div>
        </div>

        {/* Score bar */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className={`h-full rounded-full transition-all ${scoreConfig.bar}`} style={{ width: `${score}%` }} />
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">{analysis.summary}</p>

        {/* Score explanation callout for ultra-processed */}
        {nova === 4 && (
          <div className="mt-3 flex items-start gap-2 bg-red-50 rounded-xl p-3">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-relaxed"><strong>Score reduced: Ultra-processed food (NOVA 4).</strong> Ultra-processed foods are linked to higher risks of obesity, heart disease, and cancer by WHO research.</p>
          </div>
        )}
        {nova === 3 && (
          <div className="mt-3 flex items-start gap-2 bg-yellow-50 rounded-xl p-3">
            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700"><strong>Score reduced: Processed food (NOVA 3).</strong> Minimally processed alternatives are healthier.</p>
          </div>
        )}
      </div>

      {/* Daily Budget Impact */}
      {analysis.daily_budget_impact && (() => {
        const imp = analysis.daily_budget_impact
        const items = [
          { label: 'Sodium', value: imp.sodium_mg, unit: 'mg', max: 2300, decimals: 0 },
          { label: 'Sugar', value: imp.sugar_g, unit: 'g', max: 50, decimals: 1 },
          { label: 'Sat. Fat', value: imp.saturated_fat_g, unit: 'g', max: 20, decimals: 1 },
          { label: 'Additives', value: imp.additives_count, unit: '', max: 10, decimals: 0 },
        ]
        return (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Daily Budget Impact <span className="text-xs font-normal text-gray-400">per 100g serving</span></p>
            <div className="grid grid-cols-2 gap-3">
              {items.map(item => {
                const pct = Math.min(100, (item.value / item.max) * 100)
                const isHigh = pct > 40
                const displayVal = item.decimals === 0 ? Math.round(item.value) : item.value.toFixed(1)
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{item.label}</span>
                      <span className={`font-semibold ${isHigh ? 'text-red-500' : 'text-gray-800'}`}>{displayVal}{item.unit}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct > 60 ? 'bg-red-400' : pct > 30 ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{Math.round(pct)}% of daily limit</p>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Personalized Risks */}
      {analysis.personalized_risks.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button onClick={() => setShowRisks(!showRisks)} className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-gray-900">Personalised Risks ({analysis.personalized_risks.length})</span>
            </div>
            {showRisks ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          {showRisks && (
            <div className="divide-y divide-gray-50">
              {analysis.personalized_risks.map((risk, i) => (
                <div key={i} className={`p-4 ${risk.severity === 'high' ? 'bg-red-50' : risk.severity === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${risk.severity === 'high' ? 'bg-red-200 text-red-700' : risk.severity === 'medium' ? 'bg-yellow-200 text-yellow-700' : 'bg-blue-200 text-blue-700'}`}>{risk.severity.toUpperCase()}</span>
                    <span className="text-sm font-semibold text-gray-900">{risk.condition}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{risk.explanation}</p>
                  {risk.recommendation && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 font-medium">{risk.recommendation}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Source: {risk.source}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nutritional Warnings */}
      {analysis.nutritional_warnings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button onClick={() => setShowNutrition(!showNutrition)} className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">Nutritional Warnings ({analysis.nutritional_warnings.length})</span>
            </div>
            {showNutrition ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          {showNutrition && (
            <div className="p-4 space-y-2">
              {analysis.nutritional_warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Additives */}
      {analysis.additives_of_concern.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button onClick={() => setShowAdditives(!showAdditives)} className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-900">Additives ({analysis.additives_of_concern.length})</span>
            </div>
            {showAdditives ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          {showAdditives && (
            <div className="divide-y divide-gray-50">
              {analysis.additives_of_concern.map((a, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{a.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{a.code}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.risk_level === 'high' ? 'bg-red-100 text-red-700' : a.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {a.risk_level.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{a.explanation}</p>
                  {a.your_risk && (
                    <div className="bg-orange-50 rounded-lg px-3 py-2 text-xs text-orange-700 font-medium">{a.your_risk}</div>
                  )}
                  {a.health_concerns.slice(0, 2).map((c, j) => (
                    <p key={j} className="text-xs text-gray-500 pl-2 border-l-2 border-gray-200">{c}</p>
                  ))}
                  {a.daily_limit && <p className="text-xs text-gray-400">📊 Safe daily limit: {a.daily_limit}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Safe for conditions */}
      {analysis.safe_for_conditions.length > 0 && (
        <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">No specific concerns for:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.safe_for_conditions.map((c, i) => (
              <span key={i} className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-800 flex items-center gap-2"><Zap className="h-4 w-4" /> Recommendations</p>
          {analysis.recommendations.map((r, i) => (
            <p key={i} className="text-xs text-blue-700 leading-relaxed pl-2 border-l-2 border-blue-200">{r}</p>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-gray-50 rounded-xl p-3">
        <p className="text-xs text-gray-400 text-center leading-relaxed">⚕️ General information only. Not medical advice. Data from Open Food Facts (crowd-sourced — may be incomplete). Always check product labels and consult a healthcare professional.</p>
      </div>
    </div>
  )
}
