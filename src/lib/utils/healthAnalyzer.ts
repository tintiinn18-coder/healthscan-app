import { getAdditiveInfo } from './additiveDatabase'
import type {
  OFFProduct,
  HealthAnalysis,
  PersonalizedRisk,
  AdditiveAnalysis,
  IngredientBreakdown,
  DailyBudgetImpact,
  UserHealthProfile,
} from '@/types'

const NOVA_PENALTY: Record<number, number> = { 1: 0, 2: -5, 3: -14, 4: -24 }

const CONDITION_ALIASES: Record<string, string[]> = {
  diabetes: ['diabetes', 'prediabetes', 'gestational diabetes'],
  hypertension: ['hypertension', 'high blood pressure'],
  cancer_history: ['cancer history', 'oncology', 'cancer'],
  pregnancy: ['pregnancy', 'pregnant'],
  adhd: ['adhd', 'attention deficit', 'hyperactivity'],
  asthma: ['asthma', 'breathing issues'],
  migraine: ['migraine', 'headache'],
  thyroid_issues: ['thyroid', 'hypothyroidism', 'hyperthyroidism'],
  kidney_issues: ['kidney', 'renal', 'ckd'],
  liver_issues: ['liver', 'hepatitis'],
  ibs: ['ibs', 'digestive', 'irritable bowel'],
  obesity: ['obesity', 'weight management', 'overweight'],
  autoimmune: ['autoimmune'],
  gluten_intolerance: ['gluten intolerance', 'celiac', 'gluten sensitivity'],
  lactose_intolerance: ['lactose intolerance', 'dairy intolerance'],
  cholesterol: ['cholesterol', 'high cholesterol'],
}

function normalizeConditions(raw: string[]): Set<string> {
  const result = new Set<string>()

  for (const item of raw) {
    const lower = item.toLowerCase().trim()
    const normalized = lower.replace(/[\s-]+/g, '_')
    result.add(normalized)

    for (const [canonical, aliases] of Object.entries(CONDITION_ALIASES)) {
      if (aliases.some((alias) => lower.includes(alias))) {
        result.add(canonical)
      }
    }
  }

  return result
}

function getDailyLimits(conditions: Set<string>) {
  return {
    sugar_g: conditions.has('diabetes') ? 15 : conditions.has('obesity') ? 25 : 50,
    sodium_mg: conditions.has('hypertension') || conditions.has('kidney_issues') ? 1500 : 2300,
    saturated_fat_g: conditions.has('cholesterol') || conditions.has('hypertension') ? 13 : 20,
  }
}

function mapToIngredientCategory(category: string): IngredientBreakdown['category'] {
  switch (category) {
    case 'preservative':
    case 'sweetener':
    case 'color':
    case 'emulsifier':
      return category
    default:
      return 'additive'
  }
}

function addRisk(
  risks: PersonalizedRisk[],
  condition: string,
  severity: 'low' | 'medium' | 'high',
  explanation: string,
  source: string,
  recommendation?: string
) {
  risks.push({ condition, severity, explanation, source, recommendation })
}

export function analyzeProduct(product: OFFProduct, userProfile: UserHealthProfile | null): HealthAnalysis {
  const nutriments = product.nutriments || {}
  const additives = product.additives_tags || []
  const allergens = product.allergens_tags || []
  const labels = product.labels_tags || []
  const normalizedConditions = normalizeConditions(userProfile?.conditions || [])
  const limits = getDailyLimits(normalizedConditions)

  let score = 78
  const scoreNotes: string[] = []
  const personalizedRisks: PersonalizedRisk[] = []
  const additivesOfConcern: AdditiveAnalysis[] = []
  const nutritionalWarnings: string[] = []
  const ingredientBreakdown: IngredientBreakdown[] = []
  const cautionConditions = new Set<string>()
  const safeConditions = new Set<string>(userProfile?.conditions || [])

  const sugar = nutriments.sugars_100g
  const sodiumMg = nutriments.sodium_100g !== undefined ? nutriments.sodium_100g * 1000 : undefined
  const satFat = nutriments['saturated-fat_100g'] ?? nutriments.saturated_fat_100g
  const transFat = nutriments['trans-fat_100g']
  const calories = nutriments['energy-kcal_100g'] ?? nutriments.energy_kcal_100g
  const fiber = nutriments.fiber_100g
  const protein = nutriments.proteins_100g
  const nova = product.nova_group

  if (nova && NOVA_PENALTY[nova] !== undefined) {
    score += NOVA_PENALTY[nova]
    scoreNotes.push(`${NOVA_PENALTY[nova]} pts: NOVA ${nova}`)
  }

  if (typeof sugar === 'number') {
    if (sugar > 22.5) {
      score -= 12
      scoreNotes.push(`-12 pts: Sugar (${sugar}g)`)
      nutritionalWarnings.push(`High sugar: ${sugar}g per 100g/ml.`)
    } else if (sugar > 10) {
      score -= 6
      scoreNotes.push(`-6 pts: Sugar (${sugar}g)`)
      nutritionalWarnings.push(`Moderate sugar: ${sugar}g per 100g/ml.`)
    }

    if (normalizedConditions.has('diabetes') && sugar > 5) {
      cautionConditions.add('Diabetes')
      safeConditions.delete('Diabetes')
      addRisk(
        personalizedRisks,
        'Diabetes',
        sugar > 10 ? 'high' : 'medium',
        `This product provides ${sugar}g sugar per 100g/ml. That may need extra caution if you are tracking blood sugar.`,
        'General nutrition guidance',
        'Look for products with lower added sugar and compare serving sizes carefully.'
      )
    }
  }

  if (typeof sodiumMg === 'number') {
    if (sodiumMg > 600) {
      score -= 12
      scoreNotes.push(`-12 pts: Sodium (${Math.round(sodiumMg)}mg)`)
      nutritionalWarnings.push(`High sodium: ${Math.round(sodiumMg)}mg per 100g/ml.`)
    } else if (sodiumMg > 300) {
      score -= 6
      scoreNotes.push(`-6 pts: Sodium (${Math.round(sodiumMg)}mg)`)
      nutritionalWarnings.push(`Moderate sodium: ${Math.round(sodiumMg)}mg per 100g/ml.`)
    }

    if ((normalizedConditions.has('hypertension') || normalizedConditions.has('kidney_issues')) && sodiumMg > 300) {
      cautionConditions.add('Hypertension')
      addRisk(
        personalizedRisks,
        'Hypertension / Kidney Health',
        sodiumMg > 600 ? 'high' : 'medium',
        `This product provides ${Math.round(sodiumMg)}mg sodium per 100g/ml. That is worth reviewing if you are limiting sodium.`,
        'General nutrition guidance',
        `Your daily sodium target may be closer to ${limits.sodium_mg}mg depending on your clinician's advice.`
      )
    }
  }

  if (typeof satFat === 'number' && satFat > 5) {
    score -= 8
    scoreNotes.push(`-8 pts: Saturated fat (${satFat}g)`)
    nutritionalWarnings.push(`High saturated fat: ${satFat}g per 100g/ml.`)
  }

  if (typeof transFat === 'number' && transFat > 0.1) {
    score -= 12
    scoreNotes.push('-12 pts: Trans fat')
    nutritionalWarnings.push(`Trans fat listed: ${transFat}g per 100g/ml.`)
  }

  if (typeof calories === 'number' && calories > 450) {
    score -= 4
    scoreNotes.push(`-4 pts: Energy density (${Math.round(calories)} kcal)`)
  }

  if (typeof fiber === 'number' && fiber >= 3) {
    score += 4
    scoreNotes.push(`+4 pts: Fiber (${fiber}g)`)
  }

  if (typeof protein === 'number' && protein >= 8) {
    score += 3
    scoreNotes.push(`+3 pts: Protein (${protein}g)`)
  }

  if (labels.some((label) => label.includes('organic'))) {
    score += 3
    scoreNotes.push('+3 pts: Organic label')
  }

  for (const tag of additives) {
    const info = getAdditiveInfo(tag)
    if (!info) {
      ingredientBreakdown.push({
        name: tag.replace('en:', '').toUpperCase(),
        category: 'unknown',
        description: 'Ingredient marker found, but not yet matched to a curated additive record.',
        safety_rating: 'caution',
      })
      continue
    }

    const additiveAnalysis: AdditiveAnalysis = {
      code: info.code,
      name: info.name,
      explanation: info.description,
      risk_level: info.risk_level,
      health_concerns: info.health_concerns,
      conditions_affected: info.conditions_affected,
      daily_limit: info.daily_limit,
      amount: 'Exact quantity not available from label data.',
      sourceName: info.sourceName,
      sourceUrl: info.sourceUrl,
      evidenceNote: info.evidenceNote,
      riskWording: info.riskWording,
    }

    if (info.risk_level === 'high') {
      score -= 8
      scoreNotes.push(`-8 pts: ${info.code}`)
    } else if (info.risk_level === 'medium') {
      score -= 4
      scoreNotes.push(`-4 pts: ${info.code}`)
    } else {
      score -= 1
    }

    const matchedConditions = info.conditions_affected.filter((condition) => normalizedConditions.has(condition))
    if (matchedConditions.length > 0) {
      const label = userProfile?.conditions.find((condition) =>
        matchedConditions.some((matched) => normalizeCondition(condition) === matched)
      ) || matchedConditions[0]

      cautionConditions.add(label)
      safeConditions.delete(label)
      additiveAnalysis.your_risk = `May need extra caution for: ${label}.`
      additiveAnalysis.matched_conditions = matchedConditions

      addRisk(
        personalizedRisks,
        label,
        info.risk_level,
        info.riskWording || info.health_concerns[0] || `${info.name} may be worth reviewing for your condition.`,
        info.sourceName || 'Public food-safety sources',
        'This is informational only and not medical advice.'
      )
    }

    additivesOfConcern.push(additiveAnalysis)
    ingredientBreakdown.push({
      name: info.name,
      category: mapToIngredientCategory(info.category),
      description: info.description,
      safety_rating: info.risk_level === 'high' ? 'avoid' : info.risk_level === 'medium' ? 'caution' : 'safe',
    })
  }

  const lowerIngredients = (product.ingredients_text || '').toLowerCase()
  const listedAllergies = userProfile?.allergies || []
  for (const allergenTag of allergens) {
    const normalizedAllergen = allergenTag.replace('en:', '').toLowerCase()
    for (const allergy of listedAllergies) {
      if (normalizedAllergen.includes(allergy.toLowerCase()) || allergy.toLowerCase().includes(normalizedAllergen)) {
        score -= 18
        cautionConditions.add('Allergy')
        nutritionalWarnings.push(`Allergen match: label data suggests ${normalizedAllergen}.`)
        addRisk(
          personalizedRisks,
          allergy,
          'high',
          `This product appears to include ${normalizedAllergen}, which may matter for your listed allergy.`,
          'Label ingredient data',
          'Double-check the package label before consuming.'
        )
      }
    }
  }

  if (normalizedConditions.has('gluten_intolerance') && (lowerIngredients.includes('wheat') || lowerIngredients.includes('gluten'))) {
    score -= 18
    cautionConditions.add('Gluten Intolerance')
    nutritionalWarnings.push('Contains gluten-related ingredients according to label text.')
  }

  if (normalizedConditions.has('lactose_intolerance') && (lowerIngredients.includes('milk') || lowerIngredients.includes('lactose') || lowerIngredients.includes('whey'))) {
    score -= 12
    cautionConditions.add('Lactose Intolerance')
    nutritionalWarnings.push('Contains dairy-related ingredients according to label text.')
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)))
  const riskLevel: 'green' | 'yellow' | 'red' =
    finalScore < 40 ? 'red' : finalScore < 65 || cautionConditions.size > 0 ? 'yellow' : 'green'

  const summary = generateSummary(product, finalScore, riskLevel, scoreNotes)
  const recommendations = generateRecommendations({
    additivesOfConcern,
    sugar,
    sodiumMg,
    nova,
    cautionConditions,
  })

  const budgetImpact: DailyBudgetImpact = {
    sodium_mg: typeof sodiumMg === 'number' ? Math.round(sodiumMg) : 0,
    sugar_g: typeof sugar === 'number' ? Math.round(sugar * 10) / 10 : 0,
    saturated_fat_g: typeof satFat === 'number' ? Math.round(satFat * 10) / 10 : 0,
    additives_count: additives.length,
    ultra_processed_score: nova === 4 ? 100 : nova === 3 ? 60 : nova === 2 ? 25 : 0,
  }

  return {
    overall_score: finalScore,
    risk_level: riskLevel,
    personalized_risks: personalizedRisks,
    additives_of_concern: additivesOfConcern,
    nutritional_warnings: nutritionalWarnings,
    safe_for_conditions: Array.from(safeConditions),
    caution_for_conditions: Array.from(cautionConditions),
    summary,
    recommendations,
    ingredient_breakdown: ingredientBreakdown,
    daily_budget_impact: budgetImpact,
    confidence: product.ingredients_text ? 'medium' : 'low',
    needs_manual_review: !product.ingredients_text,
  }
}

function generateSummary(
  product: OFFProduct,
  score: number,
  riskLevel: 'green' | 'yellow' | 'red',
  scoreNotes: string[]
): string {
  const name = product.product_name || 'This product'
  const novaText =
    product.nova_group === 4
      ? ' It is classified as NOVA 4 (ultra-processed).'
      : product.nova_group === 3
      ? ' It is classified as NOVA 3 (processed).'
      : ''

  if (riskLevel === 'green') {
    return `${name} scores ${score}/100.${novaText} Based on available public food-safety sources, this looks relatively lower concern overall. ${scoreNotes.length ? `Key factors: ${scoreNotes.slice(0, 2).join(', ')}.` : ''} This is informational only and not medical advice.`
  }

  if (riskLevel === 'yellow') {
    return `${name} scores ${score}/100.${novaText} A few ingredients or nutrition markers may need caution depending on your goals or conditions. ${scoreNotes.length ? `Key factors: ${scoreNotes.slice(0, 3).join(', ')}.` : ''} This is informational only and not medical advice.`
  }

  return `${name} scores ${score}/100.${novaText} Several nutrition or additive markers may need extra caution, especially with frequent intake. ${scoreNotes.length ? `Key factors: ${scoreNotes.slice(0, 3).join(', ')}.` : ''} This is informational only and not medical advice.`
}

function generateRecommendations(input: {
  additivesOfConcern: AdditiveAnalysis[]
  sugar?: number
  sodiumMg?: number
  nova?: number
  cautionConditions: Set<string>
}): string[] {
  const recommendations: string[] = []

  if (input.additivesOfConcern.some((item) => item.risk_level === 'high')) {
    recommendations.push('Compare with a version that has fewer additives of concern.')
  }
  if (typeof input.sugar === 'number' && input.sugar > 10) {
    recommendations.push('Check the serving size and compare with a lower-sugar option.')
  }
  if (typeof input.sodiumMg === 'number' && input.sodiumMg > 300) {
    recommendations.push('Look for a lower-sodium option if you are watching salt intake.')
  }
  if (input.nova === 4) {
    recommendations.push('A less processed alternative may fit better for regular use.')
  }
  if (input.cautionConditions.size > 0) {
    recommendations.push('Review the ingredient list with your own clinician or dietitian if this product is a regular part of your diet.')
  }
  if (recommendations.length === 0) {
    recommendations.push('Use this as a quick label guide alongside the package nutrition panel.')
  }

  return recommendations
}

export function getHealthScoreColor(score: number): string {
  if (score >= 70) return 'text-green-700 bg-green-50 border-green-200'
  if (score >= 45) return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-red-700 bg-red-50 border-red-200'
}

export function getRiskLevelDescription(level: 'green' | 'yellow' | 'red'): string {
  switch (level) {
    case 'green':
      return 'Lower concern based on available label data.'
    case 'yellow':
      return 'Some parts of this label may need caution.'
    case 'red':
      return 'Several parts of this label may need extra caution.'
  }
}

export function getNutriScoreGrade(product: OFFProduct): string {
  return (product.nutriscore_grade || product.nutrition_grades || '').toUpperCase() || 'N/A'
}

export function normalizeCondition(condition: string): string {
  return condition.toLowerCase().replace(/[\s-]+/g, '_')
}
