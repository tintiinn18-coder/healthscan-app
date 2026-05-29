'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Info, Zap, AlertCircle, ExternalLink } from 'lucide-react'
import type { OFFProduct, HealthAnalysis } from '@/types'
import { getProductImageUrl } from '@/lib/api/openfoodfacts'

interface ScanResultProps {
  product: OFFProduct
  analysis: HealthAnalysis
}

type NutrientRow = {
  label: string
  value?: number
  unit: string
}

export function ScanResult({ product, analysis }: ScanResultProps) {
  const [showAdditives, setShowAdditives] = useState(true)
  const [showNutrition, setShowNutrition] = useState(true)
  const [showRisks, setShowRisks] = useState(true)

  const score = analysis.overall_score
  const scoreConfig =
    score >= 70
      ? { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-500', label: 'Lower concern' }
      : score >= 45
      ? { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500', label: 'Needs review' }
      : { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500', label: 'Higher caution' }

  const nutriments = product.nutriments || {}
  const nutrientRows = useMemo<NutrientRow[]>(
    () => [
      { label: 'Calories / energy', value: nutriments['energy-kcal_100g'] ?? nutriments.energy_kcal_100g, unit: 'kcal' },
      { label: 'Protein', value: nutriments.proteins_100g, unit: 'g' },
      { label: 'Carbohydrates', value: nutriments.carbohydrates_100g, unit: 'g' },
      { label: 'Sugar', value: nutriments.sugars_100g, unit: 'g' },
      { label: 'Fiber', value: nutriments.fiber_100g, unit: 'g' },
      { label: 'Total fat', value: nutriments.fat_100g, unit: 'g' },
      { label: 'Saturated fat', value: nutriments['saturated-fat_100g'] ?? nutriments.saturated_fat_100g, unit: 'g' },
      { label: 'Trans fat', value: nutriments['trans-fat_100g'], unit: 'g' },
      { label: 'Sodium', value: nutriments.sodium_100g !== undefined ? nutriments.sodium_100g * 1000 : undefined, unit: 'mg' },
      { label: 'Salt', value: nutriments.salt_100g, unit: 'g' },
    ],
    [nutriments]
  )

  const novaLabel =
    product.nova_group === 4
      ? 'NOVA 4 · Ultra-processed'
      : product.nova_group === 3
      ? 'NOVA 3 · Processed'
      : product.nova_group === 2
      ? 'NOVA 2 · Culinary ingredient'
      : product.nova_group === 1
      ? 'NOVA 1 · Unprocessed'
      : null

  const nutriScore = (product.nutriscore_grade || product.nutrition_grades || '').toUpperCase()
  const resultBasis = product.source === 'open_food_facts' ? 'Per 100g/ml from Open Food Facts label data' : 'Per 100g/ml when provided in label data'

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3">
        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
          {product.image_url ? (
            <img src={getProductImageUrl(product)} alt={product.product_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Info className="h-7 w-7 text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{product.product_name || 'Unknown Product'}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{product.brands || 'Unknown brand'}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {novaLabel && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">{novaLabel}</span>}
            {nutriScore && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">Nutri-Score {nutriScore}</span>}
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-50 text-slate-600">{product.source_label || 'Label analysis'}</span>
          </div>
        </div>
      </div>

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
            {score >= 70 ? <CheckCircle className={`h-8 w-8 ${scoreConfig.color}`} /> : score >= 45 ? <AlertCircle className={`h-8 w-8 ${scoreConfig.color}`} /> : <XCircle className={`h-8 w-8 ${scoreConfig.color}`} />}
          </div>
        </div>

        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className={`h-full rounded-full transition-all ${scoreConfig.bar}`} style={{ width: `${score}%` }} />
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>

        {product.nova_group === 4 && (
          <div className="mt-3 flex items-start gap-2 bg-amber-50 rounded-xl p-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              NOVA 4 products are usually more processed. That may be a useful comparison point if you are choosing everyday foods.
            </p>
          </div>
        )}
      </div>

      {analysis.daily_budget_impact && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Daily Budget Impact <span className="text-xs font-normal text-gray-400">{resultBasis}</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <BudgetItem label="Sodium" value={analysis.daily_budget_impact.sodium_mg} unit="mg" max={2300} />
            <BudgetItem label="Sugar" value={analysis.daily_budget_impact.sugar_g} unit="g" max={50} />
            <BudgetItem label="Sat. fat" value={analysis.daily_budget_impact.saturated_fat_g} unit="g" max={20} />
            <BudgetItem label="Additives" value={analysis.daily_budget_impact.additives_count} unit="" max={10} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button onClick={() => setShowNutrition(!showNutrition)} className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-900">Nutrition Snapshot</span>
          </div>
          {showNutrition ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        {showNutrition && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {nutrientRows.map((row) => (
                <div key={row.label} className="rounded-xl bg-gray-50 px-3 py-3">
                  <p className="text-xs text-gray-500">{row.label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{formatValue(row.value, row.unit)}</p>
                </div>
              ))}
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-xs text-gray-500">Additives count</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{analysis.additives_of_concern.length}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-xs text-gray-500">NOVA group</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{novaLabel || 'Not available'}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-xs text-gray-500">Nutri-Score</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{nutriScore || 'Not available'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {analysis.personalized_risks.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button onClick={() => setShowRisks(!showRisks)} className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-gray-900">Profile-aware Notes ({analysis.personalized_risks.length})</span>
            </div>
            {showRisks ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          {showRisks && (
            <div className="divide-y divide-gray-50">
              {analysis.personalized_risks.map((risk, index) => (
                <div key={index} className="p-4 bg-amber-50/40">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{risk.severity.toUpperCase()}</span>
                    <span className="text-sm font-semibold text-gray-900">{risk.condition}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{risk.explanation}</p>
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

      {analysis.nutritional_warnings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-gray-900">Nutrition Notes</span>
          </div>
          <div className="p-4 space-y-2">
            {analysis.nutritional_warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.additives_of_concern.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button onClick={() => setShowAdditives(!showAdditives)} className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-900">Additives of Concern ({analysis.additives_of_concern.length})</span>
            </div>
            {showAdditives ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          {showAdditives && (
            <div className="divide-y divide-gray-50">
              {analysis.additives_of_concern.map((item, index) => (
                <div key={index} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{item.code}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.risk_level.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed">{item.riskWording || item.explanation}</p>

                  {item.evidenceNote && (
                    <div className="rounded-xl bg-gray-50 px-3 py-3 text-xs text-gray-600 leading-relaxed">{item.evidenceNote}</div>
                  )}

                  {item.your_risk && (
                    <div className="bg-amber-50 rounded-lg px-3 py-2 text-xs text-amber-700 font-medium">{item.your_risk}</div>
                  )}

                  {item.sourceName && item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline"
                    >
                      Source: {item.sourceName}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  {item.daily_limit && <p className="text-xs text-gray-400">Reference intake: {item.daily_limit}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {analysis.safe_for_conditions.length > 0 && (
        <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">No extra caution flags found for:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.safe_for_conditions.map((condition, index) => (
              <span key={index} className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Recommendations
          </p>
          {analysis.recommendations.map((recommendation, index) => (
            <p key={index} className="text-xs text-blue-700 leading-relaxed pl-2 border-l-2 border-blue-200">
              {recommendation}
            </p>
          ))}
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-3">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Based on available public food-safety and label data. Informational only and not medical advice.
        </p>
      </div>
    </div>
  )
}

function BudgetItem({ label, value, unit, max }: { label: string; value: number; unit: string; max: number }) {
  const percentage = Math.min(100, (value / max) * 100)
  const isHigh = percentage > 50
  const display = Number.isInteger(value) ? value.toString() : value.toFixed(1)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${isHigh ? 'text-red-600' : 'text-gray-900'}`}>
          {display}
          {unit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isHigh ? 'bg-red-400' : percentage > 25 ? 'bg-amber-400' : 'bg-green-400'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">{Math.round(percentage)}% of daily limit</p>
    </div>
  )
}

function formatValue(value: number | undefined, unit: string) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'Not available'
  }

  const display = unit === 'mg' ? Math.round(value).toString() : value.toFixed(value % 1 === 0 ? 0 : 1)
  return `${display} ${unit}`.trim()
}
