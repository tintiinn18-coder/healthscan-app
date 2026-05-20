'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { OFFProduct, HealthAnalysis, ScannedProduct } from '@/types'

export function useScan() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<OFFProduct | null>(null)
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null)
  const supabase = createClient()

  const scanBarcode = useCallback(async (barcode: string) => {
    setLoading(true)
    setError(null)
    setProduct(null)
    setAnalysis(null)

    try {
      // 1. Fetch product from Open Food Facts
      const productRes = await fetch(`/api/product/${barcode}`)
      if (!productRes.ok) {
        throw new Error('Product not found in database')
      }
      const productData: OFFProduct = await productRes.json()
      setProduct(productData)

      // 2. Get current user for personalized analysis
      const { data: { user } } = await supabase.auth.getUser()

      // 3. Analyze product
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: productData,
          userId: user?.id
        })
      })

      if (!analyzeRes.ok) {
        throw new Error('Analysis failed')
      }

      const analysisData: HealthAnalysis = await analyzeRes.json()
      setAnalysis(analysisData)

      // 4. Save to history if logged in
      if (user) {
        await saveScan(user.id, productData, analysisData)
        await updateDailyLog(user.id, analysisData)
        await updateChemicalExposure(user.id, productData, analysisData)
      }

      return { product: productData, analysis: analysisData }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const saveScan = async (userId: string, product: OFFProduct, analysis: HealthAnalysis) => {
    const scan: ScannedProduct = {
      user_id: userId,
      barcode: product.code,
      product_name: product.product_name || 'Unknown',
      product_image: product.image_url,
      brands: product.brands,
      health_score: analysis.overall_score,
      risk_level: analysis.risk_level,
      additives: analysis.additives_of_concern,
      nutritional_warnings: analysis.nutritional_warnings,
      personalized_risks: analysis.personalized_risks,
      daily_budget_impact: analysis.daily_budget_impact
    }

    await supabase.from('scans').insert(scan)
  }

  const updateDailyLog = async (userId: string, analysis: HealthAnalysis) => {
    const today = new Date().toISOString().split('T')[0]
    const impact = analysis.daily_budget_impact

    const { data: existing } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today)
      .single()

    if (existing) {
      await supabase.from('daily_logs').update({
        sodium_mg: existing.sodium_mg + impact.sodium_mg,
        sugar_g: existing.sugar_g + impact.sugar_g,
        saturated_fat_g: existing.saturated_fat_g + impact.saturated_fat_g,
        additives_count: existing.additives_count + impact.additives_count,
        ultra_processed_score: Math.max(existing.ultra_processed_score, impact.ultra_processed_score),
        scan_count: existing.scan_count + 1
      }).eq('id', existing.id)
    } else {
      await supabase.from('daily_logs').insert({
        user_id: userId,
        log_date: today,
        sodium_mg: impact.sodium_mg,
        sugar_g: impact.sugar_g,
        saturated_fat_g: impact.saturated_fat_g,
        additives_count: impact.additives_count,
        ultra_processed_score: impact.ultra_processed_score,
        scan_count: 1
      })
    }
  }

  const updateChemicalExposure = async (userId: string, product: OFFProduct, analysis: HealthAnalysis) => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().split('T')[0]

    for (const additive of analysis.additives_of_concern) {
      const { data: existing } = await supabase
        .from('chemical_exposure')
        .select('*')
        .eq('user_id', userId)
        .eq('chemical_code', additive.code)
        .eq('week_start', weekStartStr)
        .single()

      if (existing) {
        await supabase.from('chemical_exposure').update({
          amount_mg: existing.amount_mg + 100, // Estimated
          source_products: [...existing.source_products, product.product_name || 'Unknown']
        }).eq('id', existing.id)
      } else {
        await supabase.from('chemical_exposure').insert({
          user_id: userId,
          chemical_name: additive.name,
          chemical_code: additive.code,
          amount_mg: 100,
          week_start: weekStartStr,
          source_products: [product.product_name || 'Unknown']
        })
      }
    }
  }

  return {
    scanBarcode,
    loading,
    error,
    product,
    analysis,
    setProduct,
    setAnalysis
  }
}
