'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  OFFProduct,
  HealthAnalysis,
  ScannedProduct,
  UserHealthProfile,
  ManualProductInput,
} from '@/types'

interface ProductLookupResponse {
  product?: OFFProduct
  source?: string
  error?: string
  hint?: string
  needsManualEntry?: boolean
  barcode?: string
}

export function useScan() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<OFFProduct | null>(null)
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null)
  const [missingBarcode, setMissingBarcode] = useState<string | null>(null)
  const [missingProductHint, setMissingProductHint] = useState<string | null>(null)
  const supabase = createClient()

  const resolveUserContext = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return { userId: user?.id || null }
  }, [supabase])

  const runAnalysis = useCallback(
    async (payload: {
      product?: OFFProduct
      manualInput?: ManualProductInput
      profileOverride?: Partial<UserHealthProfile> | null
    }) => {
      const { userId } = await resolveUserContext()
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: payload.product,
          manualInput: payload.manualInput,
          userId,
          profileOverride: payload.profileOverride || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      return data as { product: OFFProduct; analysis: HealthAnalysis }
    },
    [resolveUserContext]
  )

  const scanBarcode = useCallback(
    async (barcode: string, profileOverride?: Partial<UserHealthProfile> | null) => {
      setLoading(true)
      setError(null)
      setProduct(null)
      setAnalysis(null)
      setMissingBarcode(null)
      setMissingProductHint(null)

      try {
        const productResponse = await fetch(`/api/product/${barcode}`)
        const productData = (await productResponse.json()) as ProductLookupResponse

        if (!productResponse.ok || !productData.product) {
          setMissingBarcode(productData.barcode || barcode)
          setMissingProductHint(productData.hint || null)
          setError(productData.error || 'Product not found.')
          return null
        }

        const result = await runAnalysis({
          product: productData.product,
          profileOverride,
        })

        setProduct(result.product)
        setAnalysis(result.analysis)

        const { userId } = await resolveUserContext()
        if (userId) {
          await saveScan(userId, result.product, result.analysis)
          await updateDailyLog(userId, result.analysis)
          await updateChemicalExposure(userId, result.product, result.analysis)
        }

        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        return null
      } finally {
        setLoading(false)
      }
    },
    [resolveUserContext, runAnalysis]
  )

  const analyzeManualProduct = useCallback(
    async (manualInput: ManualProductInput, profileOverride?: Partial<UserHealthProfile> | null) => {
      setLoading(true)
      setError(null)
      setProduct(null)
      setAnalysis(null)

      try {
        const result = await runAnalysis({ manualInput, profileOverride })
        setProduct(result.product)
        setAnalysis(result.analysis)
        setMissingBarcode(null)
        setMissingProductHint(null)

        const { userId } = await resolveUserContext()
        if (manualInput.saveToDatabase && userId && manualInput.barcode) {
          await supabase.from('user_products').upsert({
            barcode: manualInput.barcode,
            product_name: manualInput.productName,
            brand: manualInput.brand || null,
            category: manualInput.category || null,
            ingredients_text: manualInput.ingredientsText,
            nutriments: manualInput.nutriments || {},
            submitted_by: userId,
            source: 'user_submission',
          })
        }

        if (userId) {
          await saveScan(userId, result.product, result.analysis)
          await updateDailyLog(userId, result.analysis)
          await updateChemicalExposure(userId, result.product, result.analysis)
        }

        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not analyze extracted text. Please edit the ingredients and try again.')
        return null
      } finally {
        setLoading(false)
      }
    },
    [resolveUserContext, runAnalysis, supabase]
  )

  const saveScan = async (userId: string, productData: OFFProduct, analysisData: HealthAnalysis) => {
    const scan: Partial<ScannedProduct> = {
      user_id: userId,
      barcode: productData.code,
      product_name: productData.product_name || 'Unknown',
      product_image: productData.image_url,
      brands: productData.brands,
      health_score: analysisData.overall_score,
      risk_level: analysisData.risk_level,
      additives: analysisData.additives_of_concern,
      nutritional_warnings: analysisData.nutritional_warnings,
    }

    await supabase.from('scans').insert(scan)
  }

  const updateDailyLog = async (userId: string, analysisData: HealthAnalysis) => {
    const today = new Date().toISOString().split('T')[0]
    const impact = analysisData.daily_budget_impact
    if (!impact) return

    const { data: existing } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('daily_logs')
        .update({
          sodium_mg: (existing.sodium_mg || 0) + impact.sodium_mg,
          sugar_g: (existing.sugar_g || 0) + impact.sugar_g,
          saturated_fat_g: (existing.saturated_fat_g || 0) + impact.saturated_fat_g,
          additives_count: (existing.additives_count || 0) + impact.additives_count,
          ultra_processed_score: Math.max(existing.ultra_processed_score || 0, impact.ultra_processed_score),
          scan_count: (existing.scan_count || 0) + 1,
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('daily_logs').insert({
        user_id: userId,
        log_date: today,
        sodium_mg: impact.sodium_mg,
        sugar_g: impact.sugar_g,
        saturated_fat_g: impact.saturated_fat_g,
        additives_count: impact.additives_count,
        ultra_processed_score: impact.ultra_processed_score,
        scan_count: 1,
        calories: 0,
        protein_g: 0,
        fiber_g: 0,
      })
    }
  }

  const updateChemicalExposure = async (userId: string, productData: OFFProduct, analysisData: HealthAnalysis) => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().split('T')[0]

    for (const additive of analysisData.additives_of_concern) {
      const { data: existing } = await supabase
        .from('chemical_exposure')
        .select('*')
        .eq('user_id', userId)
        .eq('chemical_code', additive.code)
        .eq('week_start', weekStartStr)
        .maybeSingle()

      const nextProducts = Array.from(
        new Set([...(existing?.source_products || []), productData.product_name || 'Unknown Product'])
      )

      if (existing) {
        await supabase
          .from('chemical_exposure')
          .update({
            source_products: nextProducts,
            exposure_events: (existing.exposure_events || existing.exposureEvents || 0) + 1,
            quantity_known: false,
            estimated_amount_mg: null,
            amount_mg: null,
            last_seen_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
      } else {
        await supabase.from('chemical_exposure').insert({
          user_id: userId,
          chemical_name: additive.name,
          chemical_code: additive.code,
          week_start: weekStartStr,
          source_products: nextProducts,
          exposure_events: 1,
          quantity_known: false,
          estimated_amount_mg: null,
          amount_mg: null,
          last_seen_at: new Date().toISOString(),
        })
      }
    }
  }

  return {
    scanBarcode,
    analyzeManualProduct,
    loading,
    error,
    product,
    analysis,
    missingBarcode,
    missingProductHint,
    setProduct,
    setAnalysis,
    setError,
  }
}
