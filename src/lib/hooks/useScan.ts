'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { analyzeProduct } from '@/lib/utils/healthAnalyzer'
import { getProductByBarcode } from '@/lib/api/openfoodfacts'
import type { OFFProduct, HealthAnalysis, ScannedProduct, UserHealthProfile } from '@/types'

export type ConsumptionStatus = 'pending' | 'consumed' | 'not_consumed' | 'maybe_later'

export function useScan() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<OFFProduct | null>(null)
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null)
  const [consumptionStatus, setConsumptionStatus] = useState<ConsumptionStatus>('pending')
  const [scanId, setScanId] = useState<string | null>(null)
  const supabase = createClient()

  const scanBarcode = useCallback(async (
    barcode: string,
    profileOverride?: Partial<UserHealthProfile> | null
  ) => {
    setLoading(true)
    setError(null)
    setProduct(null)
    setAnalysis(null)
    setConsumptionStatus('pending')
    setScanId(null)

    try {
      const productData = await getProductByBarcode(barcode)
      if (!productData) {
        setError('Product not found. Try Manual Entry or Photo Scan.')
        return null
      }
      setProduct(productData)

      let userProfile: UserHealthProfile | null = null
      if (profileOverride) {
        userProfile = profileOverride as UserHealthProfile
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
          if (data) userProfile = data as UserHealthProfile
        }
      }

      const analysisData = analyzeProduct(productData, userProfile)
      setAnalysis(analysisData)

      // Save scan to history with status "pending" — NOT consumed yet
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const id = await saveScan(user.id, productData, analysisData, 'pending')
        setScanId(id)
      }

      return { product: productData, analysis: analysisData }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Called when user taps "Yes I ate this" / "No just checking" / "Maybe later"
  const markConsumption = useCallback(async (status: ConsumptionStatus) => {
    setConsumptionStatus(status)
    if (!product || !analysis) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Update scan record status
    if (scanId) {
      await supabase.from('scans').update({ consumption_status: status }).eq('id', scanId)
    }

    // Only track daily nutrition + chemical exposure if actually consumed
    if (status === 'consumed') {
      await updateDailyLog(user.id, analysis)
      await updateChemicalExposure(user.id, product, analysis)
    }
  }, [product, analysis, scanId, supabase])

  const saveScan = async (
    userId: string,
    product: OFFProduct,
    analysis: HealthAnalysis,
    status: ConsumptionStatus
  ): Promise<string | null> => {
    try {
      const scan = {
        user_id: userId,
        barcode: product.code,
        product_name: product.product_name || 'Unknown',
        product_image: product.image_url,
        brands: product.brands,
        health_score: analysis.overall_score,
        risk_level: analysis.risk_level,
        additives: analysis.additives_of_concern,
        nutritional_warnings: analysis.nutritional_warnings,
        consumption_status: status,
        scanned_at: new Date().toISOString(),
      }
      const { data } = await supabase.from('scans').insert(scan).select('id').single()
      return data?.id || null
    } catch { return null }
  }

  const updateDailyLog = async (userId: string, analysis: HealthAnalysis) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const impact = analysis.daily_budget_impact
      if (!impact) return

      const { data: existing } = await supabase
        .from('daily_logs').select('*').eq('user_id', userId).eq('log_date', today).single()

      if (existing) {
        await supabase.from('daily_logs').update({
          sodium_mg: (existing.sodium_mg || 0) + impact.sodium_mg,
          sugar_g: (existing.sugar_g || 0) + impact.sugar_g,
          saturated_fat_g: (existing.saturated_fat_g || 0) + impact.saturated_fat_g,
          additives_count: (existing.additives_count || 0) + impact.additives_count,
          scan_count: (existing.scan_count || 0) + 1,
          consumed_count: (existing.consumed_count || 0) + 1,
        }).eq('id', existing.id)
      } else {
        await supabase.from('daily_logs').insert({
          user_id: userId, log_date: today,
          sodium_mg: impact.sodium_mg, sugar_g: impact.sugar_g,
          saturated_fat_g: impact.saturated_fat_g,
          additives_count: impact.additives_count,
          scan_count: 1, consumed_count: 1,
        })
      }
    } catch { }
  }

  const updateChemicalExposure = async (userId: string, product: OFFProduct, analysis: HealthAnalysis) => {
    try {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekStartStr = weekStart.toISOString().split('T')[0]

      for (const additive of analysis.additives_of_concern) {
        const { data: existing } = await supabase
          .from('chemical_exposure').select('*')
          .eq('user_id', userId).eq('chemical_code', additive.code).eq('week_start', weekStartStr).single()

        if (existing) {
          await supabase.from('chemical_exposure').update({
            amount_mg: (existing.amount_mg || 0) + 100,
            source_products: [...(existing.source_products || []), product.product_name || 'Unknown']
          }).eq('id', existing.id)
        } else {
          await supabase.from('chemical_exposure').insert({
            user_id: userId, chemical_name: additive.name, chemical_code: additive.code,
            amount_mg: 100, week_start: weekStartStr,
            source_products: [product.product_name || 'Unknown']
          })
        }
      }
    } catch { }
  }

  return {
    scanBarcode, loading, error, product, analysis,
    setProduct, setAnalysis, consumptionStatus, markConsumption, scanId
  }
}
