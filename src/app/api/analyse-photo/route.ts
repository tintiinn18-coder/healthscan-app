import { NextResponse } from 'next/server'
import type { AdditiveAnalysis, HealthAnalysis, OFFProduct } from '@/types'

export const runtime = 'nodejs'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

type GroqPhotoAnalysis = {
  productName?: string
  brand?: string
  ingredients?: string[]
  additives?: Array<{
    code?: string
    name?: string
    concernLevel?: 'low' | 'medium' | 'high'
    explanation?: string
  }>
  allergens?: string[]
  nutritionFacts?: {
    calories?: number | null
    protein_g?: number | null
    carbohydrates_g?: number | null
    sugar_g?: number | null
    fiber_g?: number | null
    total_fat_g?: number | null
    saturated_fat_g?: number | null
    trans_fat_g?: number | null
    sodium_mg?: number | null
    salt_g?: number | null
    serving_size?: string | null
    per?: string | null
  }
  processingLevel?: {
    novaGroup?: number | null
    label?: string
  }
  healthScore?: number
  riskLevel?: 'green' | 'yellow' | 'red'
  summary?: string
  recommendations?: string[]
  confidence?: 'low' | 'medium' | 'high'
  needsManualReview?: boolean
}

function extractJson(content: string): GroqPhotoAnalysis {
  try {
    return JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('AI response did not contain JSON')
    return JSON.parse(match[0])
  }
}

function numberOrUndefined(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function clampScore(value: unknown) {
  const score = numberOrUndefined(value)
  if (score === undefined) return 50
  return Math.max(0, Math.min(100, Math.round(score)))
}

function normalizeRisk(value: unknown): HealthAnalysis['risk_level'] {
  return value === 'green' || value === 'yellow' || value === 'red' ? value : 'yellow'
}

function normalizeConcern(value: unknown): AdditiveAnalysis['risk_level'] {
  return value === 'high' || value === 'medium' || value === 'low' ? value : 'medium'
}

function buildNutriments(nutrition: GroqPhotoAnalysis['nutritionFacts'] = {}) {
  const nutriments: Record<string, number> = {}

  const calories = numberOrUndefined(nutrition.calories)
  const protein = numberOrUndefined(nutrition.protein_g)
  const carbs = numberOrUndefined(nutrition.carbohydrates_g)
  const sugar = numberOrUndefined(nutrition.sugar_g)
  const fiber = numberOrUndefined(nutrition.fiber_g)
  const fat = numberOrUndefined(nutrition.total_fat_g)
  const saturatedFat = numberOrUndefined(nutrition.saturated_fat_g)
  const transFat = numberOrUndefined(nutrition.trans_fat_g)
  const sodiumMg = numberOrUndefined(nutrition.sodium_mg)
  const salt = numberOrUndefined(nutrition.salt_g)

  if (calories !== undefined) nutriments['energy-kcal_100g'] = calories
  if (protein !== undefined) nutriments.proteins_100g = protein
  if (carbs !== undefined) nutriments.carbohydrates_100g = carbs
  if (sugar !== undefined) nutriments.sugars_100g = sugar
  if (fiber !== undefined) nutriments.fiber_100g = fiber
  if (fat !== undefined) nutriments.fat_100g = fat
  if (saturatedFat !== undefined) nutriments['saturated-fat_100g'] = saturatedFat
  if (transFat !== undefined) nutriments['trans-fat_100g'] = transFat
  if (sodiumMg !== undefined) nutriments.sodium_100g = sodiumMg / 1000
  if (salt !== undefined) nutriments.salt_100g = salt

  return nutriments
}

function buildProduct(parsed: GroqPhotoAnalysis, imageDataUrl: string): OFFProduct {
  const ingredients = Array.isArray(parsed.ingredients) ? parsed.ingredients.map(String) : []
  const allergens = Array.isArray(parsed.allergens) ? parsed.allergens.map(String) : []
  const additives = Array.isArray(parsed.additives) ? parsed.additives : []

  return {
    code: `ai-photo-${Date.now()}`,
    product_name: parsed.productName || 'AI Photo Scan Product',
    brands: parsed.brand || 'Unknown brand',
    ingredients_text: ingredients.join(', '),
    ingredients_tags: ingredients.map((item) => item.toLowerCase()),
    additives_tags: additives
      .map((item) => item.code || item.name)
      .filter(Boolean)
      .map((item) => String(item).toLowerCase()),
    allergens_tags: allergens.map((item) => item.toLowerCase()),
    nutriments: buildNutriments(parsed.nutritionFacts),
    image_url: imageDataUrl,
    categories: parsed.processingLevel?.label || 'AI photo scan',
    labels_tags: [],
    nova_group: numberOrUndefined(parsed.processingLevel?.novaGroup),
    serving_size: parsed.nutritionFacts?.serving_size || undefined,
    source: 'groq_enhanced',
    source_label: 'AI photo analysis',
  }
}

function buildAnalysis(parsed: GroqPhotoAnalysis, product: OFFProduct): HealthAnalysis {
  const additives: AdditiveAnalysis[] = (parsed.additives || []).map((item) => ({
    code: item.code || item.name || 'Unknown',
    name: item.name || item.code || 'Unknown additive',
    explanation: item.explanation || 'Detected from product photo. Review the package label to confirm.',
    riskWording: item.explanation || 'This additive may need review depending on amount, product type, and overall diet.',
    risk_level: normalizeConcern(item.concernLevel),
    health_concerns: item.explanation ? [item.explanation] : [],
    conditions_affected: [],
  }))

  const nutriments = product.nutriments
  const sodiumMg = typeof nutriments.sodium_100g === 'number' ? Math.round(nutriments.sodium_100g * 1000) : 0
  const sugar = typeof nutriments.sugars_100g === 'number' ? nutriments.sugars_100g : 0
  const satFat = typeof nutriments['saturated-fat_100g'] === 'number' ? nutriments['saturated-fat_100g'] : 0
  const nova = product.nova_group || 0
  const warnings: string[] = []

  if (sugar >= 22.5) warnings.push(`High sugar estimate: ${sugar}g per label basis`)
  if (sodiumMg >= 600) warnings.push(`High sodium estimate: ${sodiumMg}mg per label basis`)
  if (satFat >= 5) warnings.push(`High saturated fat estimate: ${satFat}g per label basis`)
  if (nova === 4) warnings.push('NOVA 4 / ultra-processed estimate from photo analysis')

  return {
    overall_score: clampScore(parsed.healthScore),
    risk_level: normalizeRisk(parsed.riskLevel),
    personalized_risks: [],
    additives_of_concern: additives,
    nutritional_warnings: warnings,
    safe_for_conditions: [],
    caution_for_conditions: [],
    summary: parsed.summary || 'AI photo analysis completed. Please confirm key label details on the package.',
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map(String)
      : ['Review the product label directly before making a final choice.'],
    daily_budget_impact: {
      sodium_mg: sodiumMg,
      sugar_g: sugar,
      saturated_fat_g: satFat,
      additives_count: additives.length,
      ultra_processed_score: nova === 4 ? 40 : nova === 3 ? 20 : 0,
    },
    confidence: parsed.confidence || 'medium',
    needs_manual_review: Boolean(parsed.needsManualReview),
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Product image is required' }, { status: 400 })
    }

    const mimeType = file.type || 'image/jpeg'
    const bytes = Buffer.from(await file.arrayBuffer())
    const imageDataUrl = `data:${mimeType};base64,${bytes.toString('base64')}`

    const prompt = [
      'You are analyzing a packaged food product photo for educational wellness guidance, not medical diagnosis.',
      'Use cautious wording. Do not claim that an ingredient causes cancer, disease, or ADHD.',
      'If text is unclear, set confidence lower and needsManualReview true.',
      'Do not invent nutrition values. If nutrition facts are not visible, use null for missing nutrition fields.',
      'Return JSON only.',
      '',
      'Return this exact JSON shape:',
      '{',
      '  "productName": "",',
      '  "brand": "",',
      '  "ingredients": [],',
      '  "additives": [{ "code": "", "name": "", "concernLevel": "low|medium|high", "explanation": "" }],',
      '  "allergens": [],',
      '  "nutritionFacts": {',
      '    "calories": null,',
      '    "protein_g": null,',
      '    "carbohydrates_g": null,',
      '    "sugar_g": null,',
      '    "fiber_g": null,',
      '    "total_fat_g": null,',
      '    "saturated_fat_g": null,',
      '    "trans_fat_g": null,',
      '    "sodium_mg": null,',
      '    "salt_g": null,',
      '    "serving_size": null,',
      '    "per": null',
      '  },',
      '  "processingLevel": { "novaGroup": null, "label": "" },',
      '  "healthScore": 0,',
      '  "riskLevel": "green|yellow|red",',
      '  "summary": "",',
      '  "recommendations": [],',
      '  "confidence": "low|medium|high",',
      '  "needsManualReview": true',
      '}',
    ].join('\n')

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_VISION_MODEL,
        temperature: 0.1,
        max_tokens: 1800,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      return NextResponse.json({ error: 'Groq photo analysis failed', detail: errorText }, { status: 502 })
    }

    const groqData = await groqResponse.json()
    const content = groqData?.choices?.[0]?.message?.content
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Groq returned an invalid response' }, { status: 502 })
    }

    const parsed = extractJson(content)
    const product = buildProduct(parsed, imageDataUrl)
    const analysis = buildAnalysis(parsed, product)

    return NextResponse.json({ product, analysis, vision: parsed })
  } catch (error) {
    console.error('AI photo analysis error:', error)
    return NextResponse.json({ error: 'AI photo analysis failed' }, { status: 500 })
  }
}
