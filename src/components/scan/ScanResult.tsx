'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { getRiskLevelDescription, getHealthScoreColor } from '@/lib/utils/healthAnalyzer'
import { getProductImageUrl } from '@/lib/api/openfoodfacts'
import type { OFFProduct, HealthAnalysis } from '@/types'
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { useState } from 'react'

interface ScanResultProps {
  product: OFFProduct
  analysis: HealthAnalysis
}

export function ScanResult({ product, analysis }: ScanResultProps) {
  const [showAdditives, setShowAdditives] = useState(true)
  const [showNutrition, setShowNutrition] = useState(true)
  const [showRisks, setShowRisks] = useState(true)

  const scoreColor = getHealthScoreColor(analysis.overall_score)
  const riskDesc = getRiskLevelDescription(analysis.risk_level)

  return (
   <div className="space-y-4 animate-slide-up">
      {/* Product Header */}
      <Card className="overflow-hidden">
        <div className="flex gap-4">
          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
            {product.image_url ? (
              <img
                src={getProductImageUrl(product)}
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Info className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {product.product_name || 'Unknown Product'}
            </h3>
            <p className="text-sm text-gray-500">{product.brands || 'Unknown Brand'}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={analysis.risk_level === 'green' ? 'green' : analysis.risk_level === 'yellow' ? 'yellow' : 'red'}>
                {analysis.risk_level.toUpperCase()}
              </Badge>
              <span className="text-xs text-gray-500">Code: {product.code}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Health Score */}
      <Card className={`border-2 ${scoreColor}`}>
        <div className="text-center py-4">
          <div className="text-5xl font-bold mb-2">{analysis.overall_score}</div>
          <div className="text-sm font-medium opacity-80">/ 100 Health Score</div>
          <p className="text-sm mt-3 opacity-90">{riskDesc}</p>
        </div>
      </Card>

      {/* Daily Budget Impact */}
      {analysis.daily_budget_impact && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Budget Impact</CardTitle>
            <CardDescription>Per 100g serving</CardDescription>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            <BudgetItem label="Sodium" value={analysis.daily_budget_impact.sodium_mg} unit="mg" max={2300} />
            <BudgetItem label="Sugar" value={analysis.daily_budget_impact.sugar_g} unit="g" max={50} />
            <BudgetItem label="Sat. Fat" value={analysis.daily_budget_impact.saturated_fat_g} unit="g" max={20} />
            <BudgetItem label="Additives" value={analysis.daily_budget_impact.additives_count} unit="" max={10} />
          </div>
        </Card>
      )}

      {/* Personalized Risks */}
      {analysis.personalized_risks.length > 0 && (
        <Card>
          <button
            onClick={() => setShowRisks(!showRisks)}
            className="w-full flex items-center justify-between p-1"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-health-red" />
              <CardTitle>Personalized Risks ({analysis.personalized_risks.length})</CardTitle>
            </div>
            {showRisks ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {showRisks && (
            <div className="space-y-3 mt-3">
              {analysis.personalized_risks.map((risk, i) => (
                <Alert
                  key={i}
                  variant={risk.severity === 'high' ? 'error' : risk.severity === 'medium' ? 'warning' : 'info'}
                  title={risk.condition}
                >
                  <p>{risk.explanation}</p>
                  {risk.recommendation && (
                    <p className="mt-2 text-sm font-medium">💡 {risk.recommendation}</p>
                  )}
                  <p className="mt-1 text-xs opacity-70">Source: {risk.source}</p>
                </Alert>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Nutritional Warnings */}
      {analysis.nutritional_warnings.length > 0 && (
        <Card>
          <button
            onClick={() => setShowNutrition(!showNutrition)}
            className="w-full flex items-center justify-between p-1"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-health-yellow" />
              <CardTitle>Nutritional Warnings ({analysis.nutritional_warnings.length})</CardTitle>
            </div>
            {showNutrition ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {showNutrition && (
            <div className="space-y-2 mt-3">
              {analysis.nutritional_warnings.map((warning, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-health-red flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{warning}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Additives Deep Dive */}
      {analysis.additives_of_concern.length > 0 && (
        <Card>
          <button
            onClick={() => setShowAdditives(!showAdditives)}
            className="w-full flex items-center justify-between p-1"
          >
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-health-blue" />
              <CardTitle>Additives Deep Dive ({analysis.additives_of_concern.length})</CardTitle>
            </div>
            {showAdditives ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {showAdditives && (
            <div className="space-y-3 mt-3">
              {analysis.additives_of_concern.map((additive, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{additive.name}</h4>
                      <span className="text-sm text-gray-500">{additive.code}</span>
                    </div>
                    <Badge
                      variant={additive.risk_level === 'high' ? 'red' : additive.risk_level === 'medium' ? 'yellow' : 'green'}
                    >
                      {additive.risk_level.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{additive.explanation}</p>
                  {additive.your_risk && (
                    <<Alert variant="warning">
                      {additive.your_risk}
                    </Alert>
                  )}
                  {additive.daily_limit && (
                    <p className="text-xs text-gray-500">📊 Daily Limit: {additive.daily_limit}</p>
                  )}
                  {additive.health_concerns.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700">Health Concerns:</p>
                      {additive.health_concerns.slice(0, 3).map((concern, j) => (
                        <p key={j} className="text-xs text-gray-600 pl-2">• {concern}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Safe For */}
      {analysis.safe_for_conditions.length > 0 && (
        <Card className="bg-green-50/50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-health-green" />
            <CardTitle>Safe For Your Conditions</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.safe_for_conditions.map((condition, i) => (
              <Badge key={i} variant="green">{condition}</Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function BudgetItem({ label, value, unit, max }: { label: string; value: number; unit: string; max: number }) {
  const percentage = Math.min(100, (value / max) * 100)
  const isHigh = percentage > 50

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${isHigh ? 'text-health-red' : 'text-gray-900'}`}>
          {value}{unit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isHigh ? 'bg-health-red' : percentage > 25 ? 'bg-health-yellow' : 'bg-health-green'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">{Math.round(percentage)}% of daily limit</p>
    </div>
  )
}
