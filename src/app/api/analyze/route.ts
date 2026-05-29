import { NextResponse } from 'next/server'
import { analyzeProduct } from '@/lib/utils/healthAnalyzer'
import { createClient } from '@/lib/supabase/server'
import { cleanupIngredientsWithGroq } from '@/lib/api/groq'
import { buildSyntheticProduct, extractAdditiveTagsFromText, extractAllergenTagsFromText } from '@/lib/utils/ingredientParser'
import type { ManualProductInput, OFFProduct, UserHealthProfile } from '@/types'

interface AnalyzeBody {
  product?: OFFProduct
  userId?: string
  profileOverride?: Partial<UserHealthProfile> | null
  manualInput?: ManualProductInput
}

function shouldUseGroq(product: OFFProduct, source?: string) {
  const ingredientText = product.ingredients_text || ''
  const looksMessy = ingredientText.length > 0 && ingredientText.split(/\s+/).length < 6
  const hasLittleStructure = !product.additives_tags.length && !product.allergens_tags.length
  return source === 'ocr' || looksMessy || (hasLittleStructure && ingredientText.length > 30)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeBody
    let { product } = body

    if (!product && body.manualInput) {
      product = buildSyntheticProduct({
        barcode: body.manualInput.barcode,
        productName: body.manualInput.productName,
        brand: body.manualInput.brand,
        category: body.manualInput.category,
        ingredientsText: body.manualInput.ingredientsText,
        nutriments: body.manualInput.nutriments,
        source: body.manualInput.source || 'manual',
      })
    }

    if (!product || !product.code) {
      return NextResponse.json({ error: 'Invalid product data' }, { status: 400 })
    }

    if (product.ingredients_text) {
      product = {
        ...product,
        additives_tags: Array.from(new Set([...product.additives_tags, ...extractAdditiveTagsFromText(product.ingredients_text)])),
        allergens_tags: Array.from(new Set([...product.allergens_tags, ...extractAllergenTagsFromText(product.ingredients_text)])),
      }
    }

    let userProfile: UserHealthProfile | null = null
    if (body.profileOverride) {
      userProfile = {
        conditions: body.profileOverride.conditions || [],
        allergies: body.profileOverride.allergies || [],
        dietary_restrictions: body.profileOverride.dietary_restrictions || [],
        daily_budgets: body.profileOverride.daily_budgets,
      }
    } else if (body.userId) {
      const supabase = await createClient()
      const { data } = await supabase.from('profiles').select('*').eq('id', body.userId).single()
      userProfile = (data as UserHealthProfile | null) || null
    }

    let aiCleanupSummary = ''
    if (product.ingredients_text && shouldUseGroq(product, body.manualInput?.source || product.source)) {
      const cleanup = await cleanupIngredientsWithGroq(product.ingredients_text)
      if (cleanup) {
        const cleanedText = cleanup.cleanedIngredients.join(', ').trim()
        if (cleanedText) {
          product = {
            ...product,
            ingredients_text: cleanedText,
            additives_tags: Array.from(new Set([...product.additives_tags, ...extractAdditiveTagsFromText(cleanedText), ...cleanup.detectedAdditives.map((item) => item.toLowerCase())])),
            allergens_tags: Array.from(new Set([...product.allergens_tags, ...extractAllergenTagsFromText(cleanedText), ...cleanup.allergens.map((item) => item.toLowerCase())])),
            source: product.source === 'ocr' ? 'groq_enhanced' : product.source,
          }
          aiCleanupSummary = cleanup.summary
        }
      }
    }

    const analysis = analyzeProduct(product, userProfile)
    if (aiCleanupSummary) {
      analysis.summary = `${analysis.summary} OCR cleanup note: ${aiCleanupSummary}`
      analysis.confidence = analysis.confidence === 'low' ? 'medium' : analysis.confidence
    }

    return NextResponse.json({ product, analysis })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
