import { getAdditiveInfo } from './additiveDatabase'
import type {
  OFFProduct,
  HealthAnalysis,
  PersonalizedRisk,
  AdditiveAnalysis,
  IngredientBreakdown,
  DailyBudgetImpact,
  UserHealthProfile
} from '@/types'

// ─── NOVA classification ─────────────────────────────────────────────────────
// NOVA 1 = unprocessed, 2 = culinary, 3 = processed, 4 = ultra-processed
const NOVA_PENALTY: Record<number, number> = { 1: 0, 2: -5, 3: -20, 4: -40 }
const NOVA_LABEL: Record<number, string> = {
  1: 'Unprocessed food',
  2: 'Culinary ingredient',
  3: 'Processed food',
  4: 'Ultra-processed food'
}

// ─── Category baseline scores ─────────────────────────────────────────────────
function getCategoryBaseline(product: OFFProduct): number {
  const cats = (product.categories_tags || []).join(' ').toLowerCase()
  const name = (product.product_name || '').toLowerCase()
  if (cats.includes('fresh') || cats.includes('vegetable') || cats.includes('fruit') || cats.includes('raw')) return 90
  if (cats.includes('dairy') || cats.includes('milk') || cats.includes('yogurt') || cats.includes('cheese')) return 72
  if (cats.includes('bread') || cats.includes('cereals') || cats.includes('oat')) return 65
  if (cats.includes('instant') || name.includes('maggi') || name.includes('noodle') || cats.includes('ready-meal')) return 38
  if (cats.includes('snack') || cats.includes('chips') || cats.includes('crisps') || cats.includes('namkeen') || cats.includes('bhujia')) return 42
  if (cats.includes('soft-drink') || cats.includes('soda') || cats.includes('cola') || cats.includes('carbonated')) return 22
  if (cats.includes('energy-drink') || cats.includes('energy drink')) return 18
  if (cats.includes('chocolate') || cats.includes('candy') || cats.includes('confection') || cats.includes('sweet')) return 35
  if (cats.includes('biscuit') || cats.includes('cookie') || cats.includes('cracker')) return 45
  if (cats.includes('juice') && !cats.includes('sugar')) return 55
  if (cats.includes('water') || cats.includes('mineral-water')) return 98
  if (cats.includes('sauce') || cats.includes('condiment') || cats.includes('ketchup')) return 48
  if (cats.includes('processed-meat') || cats.includes('sausage') || cats.includes('salami')) return 30
  if (cats.includes('frozen') || cats.includes('deep-fried') || cats.includes('fried')) return 40
  if (cats.includes('protein') || cats.includes('whey') || cats.includes('supplement')) return 60
  return 62 // default
}

// ─── Condition normalizer ────────────────────────────────────────────────────
const CONDITION_ALIASES: Record<string, string[]> = {
  diabetes: ['diabetes', 'type 1 diabetes', 'type 2 diabetes', 'prediabetes', 'diabetic', 'gestational diabetes'],
  hypertension: ['hypertension', 'high blood pressure', 'high bp', 'cardiovascular'],
  cancer_history: ['cancer', 'cancer history', 'oncology', 'tumor history'],
  pcos: ['pcos', 'polycystic', 'pcod'],
  thyroid_issues: ['thyroid', 'hypothyroidism', 'hyperthyroidism', 'hashimotos'],
  pregnancy: ['pregnancy', 'pregnant', 'breastfeeding', 'nursing'],
  adhd: ['adhd', 'add', 'attention deficit', 'hyperactivity'],
  asthma: ['asthma', 'breathing issues', 'copd', 'respiratory'],
  migraine: ['migraine', 'chronic headache'],
  cholesterol: ['cholesterol', 'high cholesterol', 'hypercholesterolemia'],
  kidney_issues: ['kidney', 'kidney disease', 'ckd', 'renal'],
  liver_issues: ['liver', 'liver disease', 'hepatitis'],
  ibs: ['ibs', 'irritable bowel', 'digestive issues', 'crohns'],
  gluten_intolerance: ['gluten intolerance', 'celiac', 'gluten sensitivity'],
  lactose_intolerance: ['lactose intolerance', 'dairy intolerance'],
  obesity: ['obesity', 'overweight', 'weight management'],
  autoimmune: ['autoimmune', 'lupus', 'rheumatoid'],
}

function normalizeConditions(raw: string[]): Set<string> {
  const result = new Set<string>()
  raw.forEach(r => {
    const lower = r.toLowerCase().trim()
    for (const [key, aliases] of Object.entries(CONDITION_ALIASES)) {
      if (aliases.some(a => lower.includes(a))) result.add(key)
    }
    result.add(lower.replace(/\s+/g, '_'))
  })
  return result
}

// ─── Personalized thresholds ──────────────────────────────────────────────────
function getPersonalizedLimits(conditions: Set<string>): {
  sugar_g: number
  sodium_mg: number
  sat_fat_g: number
  caffeine_mg: number
} {
  let sugar_g = 50
  let sodium_mg = 2300
  let sat_fat_g = 20
  let caffeine_mg = 400

  if (conditions.has('diabetes')) { sugar_g = 15; sodium_mg = 2000 }
  if (conditions.has('hypertension') || conditions.has('cholesterol')) { sodium_mg = 1500; sat_fat_g = 13 }
  if (conditions.has('kidney_issues')) { sodium_mg = 1500; sat_fat_g = 13 }
  if (conditions.has('pregnancy')) { caffeine_mg = 200; sodium_mg = 2000 }
  if (conditions.has('obesity')) { sugar_g = 25; sat_fat_g = 15 }
  if (conditions.has('ibs')) { sodium_mg = 2000 }

  return { sugar_g, sodium_mg, sat_fat_g, caffeine_mg }
}

type IngredientCategory = IngredientBreakdown['category']
function mapToIngredientCategory(cat: string): IngredientCategory {
  const allowed: IngredientCategory[] = ['natural', 'additive', 'preservative', 'sweetener', 'color', 'emulsifier', 'unknown']
  return (allowed.includes(cat as IngredientCategory) ? cat : 'additive') as IngredientCategory
}

// ─── Main Analysis ────────────────────────────────────────────────────────────
export function analyzeProduct(product: OFFProduct, userProfile: UserHealthProfile | null): HealthAnalysis {
  const nutriments = product.nutriments || {}
  const additives = product.additives_tags || []
  const allergens = product.allergens_tags || []

  const conditions = normalizeConditions(userProfile?.conditions || [])
  const limits = getPersonalizedLimits(conditions)

  // ── Start from category baseline ──────────────────────────────────────────
  let score = getCategoryBaseline(product)
  const scoreBreakdown: string[] = []

  // ── NOVA penalty ──────────────────────────────────────────────────────────
  const nova = product.nova_group
  if (nova && NOVA_PENALTY[nova] !== undefined) {
    const pen = NOVA_PENALTY[nova]
    score += pen
    if (pen < 0) scoreBreakdown.push(`${pen} pts: ${NOVA_LABEL[nova]} (NOVA ${nova})`)
  }

  const personalizedRisks: PersonalizedRisk[] = []
  const additivesOfConcern: AdditiveAnalysis[] = []
  const nutritionalWarnings: string[] = []
  const ingredientBreakdown: IngredientBreakdown[] = []
  const unsafeConditions = new Set<string>()
  const safeConditions = new Set<string>(userProfile?.conditions || [])

  // ── Nutrient scoring (realistic, personalized) ────────────────────────────
  const sugar = nutriments.sugars_100g || 0
  const sodium_mg = (nutriments.sodium_100g || 0) * 1000
  const sat_fat = nutriments.saturated_fat_100g || 0
  const trans_fat = nutriments['trans-fat_100g'] || 0
  const fiber = nutriments.fiber_100g || 0
  const protein = nutriments.proteins_100g || 0
  const calories = nutriments['energy-kcal_100g'] || nutriments.energy_kcal_100g || 0

  // Sugar — -1.5 pts per %DV (personalized limit)
  if (sugar > 0) {
    const pct = (sugar / limits.sugar_g) * 100
    const pen = Math.round(pct * 1.5 * 0.4) // scaled to 100g portion
    if (pen > 0) {
      const capped = Math.min(pen, 30)
      score -= capped
      if (sugar > 5) {
        const label = conditions.has('diabetes')
          ? `🔴 HIGH SUGAR for Diabetes: ${sugar}g per 100g (your limit: ${limits.sugar_g}g/day)`
          : sugar > 22.5
          ? `🔴 HIGH SUGAR: ${sugar}g per 100g — ${Math.round(pct)}% of daily limit`
          : `🟡 MODERATE SUGAR: ${sugar}g per 100g`
        nutritionalWarnings.push(label)
        scoreBreakdown.push(`-${capped} pts: Sugar (${sugar}g)`)
      }
      if (conditions.has('diabetes') && sugar > 5) {
        unsafeConditions.add('diabetes')
        safeConditions.delete('Diabetes')
        personalizedRisks.push({
          condition: 'Diabetes',
          severity: sugar > 10 ? 'high' : 'medium',
          explanation: `Contains ${sugar}g sugar per 100g. Your personalised daily limit is ${limits.sugar_g}g (standard is 50g). This single serving uses ${Math.round((sugar / limits.sugar_g) * 100)}% of your limit.`,
          source: 'American Diabetes Association',
          recommendation: 'Choose products with <5g sugar per serving. Look for "no added sugar" labels.'
        })
      }
    }
  }

  // Sodium — -0.8 pts per %DV
  if (sodium_mg > 0) {
    const pct = (sodium_mg / limits.sodium_mg) * 100
    const pen = Math.round(pct * 0.8 * 0.35)
    if (pen > 0) {
      const capped = Math.min(pen, 25)
      score -= capped
      if (sodium_mg > 300) {
        const label = (conditions.has('hypertension') || conditions.has('cholesterol'))
          ? `🔴 HIGH SODIUM for your condition: ${Math.round(sodium_mg)}mg (your limit: ${limits.sodium_mg}mg/day)`
          : sodium_mg > 600
          ? `🔴 HIGH SODIUM: ${Math.round(sodium_mg)}mg — ${Math.round(pct)}% of daily limit`
          : `🟡 MODERATE SODIUM: ${Math.round(sodium_mg)}mg per 100g`
        nutritionalWarnings.push(label)
        scoreBreakdown.push(`-${capped} pts: Sodium (${Math.round(sodium_mg)}mg)`)
      }
      if ((conditions.has('hypertension') || conditions.has('cholesterol')) && sodium_mg > 300) {
        unsafeConditions.add('hypertension')
        personalizedRisks.push({
          condition: 'Hypertension / Cholesterol',
          severity: sodium_mg > 600 ? 'high' : 'medium',
          explanation: `${Math.round(sodium_mg)}mg sodium per 100g. For your condition the AHA recommends max ${limits.sodium_mg}mg/day — this is ${Math.round(pct)}% of that.`,
          source: 'American Heart Association',
          recommendation: 'Look for "low sodium" or "no salt added" alternatives.'
        })
      }
    }
  }

  // Saturated fat — -1.0 pts per %DV
  if (sat_fat > 0) {
    const pct = (sat_fat / limits.sat_fat_g) * 100
    const pen = Math.round(pct * 0.9 * 0.3)
    if (pen > 0) {
      const capped = Math.min(pen, 20)
      score -= capped
      if (sat_fat > 3) {
        nutritionalWarnings.push(
          sat_fat > 5
            ? `🔴 HIGH SATURATED FAT: ${sat_fat}g per 100g — ${Math.round(pct)}% of daily limit`
            : `🟡 MODERATE SATURATED FAT: ${sat_fat}g per 100g`
        )
        scoreBreakdown.push(`-${capped} pts: Saturated fat (${sat_fat}g)`)
      }
    }
  }

  // Trans fat — -5 for any amount (zero tolerance)
  if (trans_fat > 0.1) {
    score -= 15
    nutritionalWarnings.push(`🚨 TRANS FAT DETECTED: ${trans_fat}g — WHO recommends ZERO trans fat`)
    scoreBreakdown.push('-15 pts: Trans fat detected')
  }

  // Calories penalty (high energy density snacks)
  if (calories > 500) {
    score -= 5
    nutritionalWarnings.push(`⚠️ HIGH CALORIE DENSITY: ${Math.round(calories)} kcal per 100g`)
    scoreBreakdown.push('-5 pts: High calorie density')
  }

  // Fiber bonus — +0.5 per %DV
  if (fiber > 3) {
    const bonus = Math.min(Math.round(fiber * 1.5), 8)
    score += bonus
    scoreBreakdown.push(`+${bonus} pts: Good fiber content (${fiber}g)`)
  }

  // Protein bonus
  if (protein > 10) {
    const bonus = Math.min(Math.round(protein * 0.5), 6)
    score += bonus
    scoreBreakdown.push(`+${bonus} pts: Good protein content (${protein}g)`)
  }

  // Organic / no-additive bonus
  const labels = product.labels_tags || []
  if (labels.some(l => l.includes('organic'))) {
    score += 5
    scoreBreakdown.push('+5 pts: Organic certified')
  }

  // ── Additive analysis ───────────────────────────────────────────────────────
  additives.forEach((tag: string) => {
    const info = getAdditiveInfo(tag)
    if (info) {
      const analysis: AdditiveAnalysis = {
        code: info.code,
        name: info.name,
        risk_level: info.risk_level,
        explanation: info.description,
        health_concerns: info.health_concerns,
        daily_limit: info.daily_limit,
        conditions_affected: info.conditions_affected,
        amount: 'Amount not specified on label',
      }

      // Personalized matching
      if (conditions.size > 0) {
        const matchedConditions = info.conditions_affected.filter(c => {
          return conditions.has(c) || Array.from(conditions).some(uc => c.includes(uc.split('_')[0]))
        })
        if (matchedConditions.length > 0) {
          const conditionNames = matchedConditions.map(c =>
            userProfile?.conditions.find(uc => uc.toLowerCase().replace(/\s/g, '_').includes(c.split('_')[0])) || c
          )
          analysis.your_risk = `⚠️ Risk for your condition: ${conditionNames.join(', ')}`
          analysis.matched_conditions = conditionNames
          matchedConditions.forEach(c => unsafeConditions.add(c))
          personalizedRisks.push({
            condition: conditionNames[0],
            severity: info.risk_level,
            explanation: `${info.name} (${info.code}): ${info.health_concerns[0]}`,
            source: 'EFSA / JECFA Safety Database',
            recommendation: info.health_concerns.length > 1 ? `Consider products without ${info.name}.` : undefined
          })
        }
      }

      if (info.risk_level === 'high') score -= 15
      else if (info.risk_level === 'medium') score -= 7
      else score -= 2

      additivesOfConcern.push(analysis)
      ingredientBreakdown.push({
        name: info.name,
        category: mapToIngredientCategory(info.category),
        description: info.description,
        safety_rating: info.risk_level === 'high' ? 'avoid' : info.risk_level === 'medium' ? 'caution' : 'safe'
      })
    }
  })

  // ── Allergen check ───────────────────────────────────────────────────────────
  const userAllergies = userProfile?.allergies || []
  if (userAllergies.length > 0) {
    allergens.forEach((tag: string) => {
      const allergen = tag.replace('en:', '').toLowerCase()
      userAllergies.forEach(ua => {
        if (allergen.includes(ua.toLowerCase()) || ua.toLowerCase().includes(allergen)) {
          score -= 25
          nutritionalWarnings.push(`🚨 ALLERGEN ALERT: Contains ${allergen} — you listed ${ua} as an allergy`)
          unsafeConditions.add('allergy')
        }
      })
    })
  }

  // ── Condition-specific extra checks ──────────────────────────────────────────
  const ingredients = (product.ingredients_text || '').toLowerCase()

  // Pregnancy flags
  if (conditions.has('pregnancy')) {
    const flags: string[] = []
    if (ingredients.includes('alcohol') || ingredients.includes('wine') || ingredients.includes('beer')) flags.push('Alcohol')
    if (ingredients.includes('raw') && (ingredients.includes('fish') || ingredients.includes('meat'))) flags.push('Raw meat/fish')
    if (ingredients.includes('liver') || ingredients.includes('pâté')) flags.push('Liver/Pâté (excess Vitamin A)')
    const caffeine = nutriments.caffeine_100g || 0
    if (caffeine > 2) flags.push(`High caffeine (${caffeine}mg)`)
    if (flags.length > 0) {
      score -= 20
      personalizedRisks.push({
        condition: 'Pregnancy',
        severity: 'high',
        explanation: `This product contains items flagged during pregnancy: ${flags.join(', ')}`,
        source: 'NHS / WHO Pregnancy Nutrition Guidelines',
        recommendation: 'Avoid during pregnancy. Consult your OB/GYN.'
      })
      unsafeConditions.add('pregnancy')
    }
  }

  // PCOS
  if (conditions.has('pcos')) {
    if (sugar > 10 || (nova && nova >= 4)) {
      score -= 10
      personalizedRisks.push({
        condition: 'PCOS',
        severity: sugar > 15 ? 'high' : 'medium',
        explanation: `High sugar and ultra-processed foods worsen insulin resistance common in PCOS. Sugar: ${sugar}g`,
        source: 'Endocrine Society PCOS Guidelines',
        recommendation: 'Choose low-GI, high-fiber alternatives. Avoid refined carbs and added sugars.'
      })
      unsafeConditions.add('pcos')
    }
  }

  // Thyroid
  if (conditions.has('thyroid_issues')) {
    const hasSoy = ingredients.includes('soy') || ingredients.includes('tofu') || ingredients.includes('soybean')
    if (hasSoy) {
      score -= 8
      personalizedRisks.push({
        condition: 'Thyroid',
        severity: 'medium',
        explanation: 'Contains soy, which can interfere with thyroid hormone absorption if consumed in large amounts.',
        source: 'Journal of Clinical Endocrinology & Metabolism',
        recommendation: 'Avoid soy for at least 4 hours around thyroid medication. Moderate consumption otherwise.'
      })
      unsafeConditions.add('thyroid_issues')
    }
  }

  // Asthma / breathing
  if (conditions.has('asthma')) {
    const hasSulfites = additives.some(a => ['e220', 'e221', 'e222', 'e223', 'e224', 'e225', 'e226', 'e227', 'e228'].includes(a.replace('en:', '')))
    const hasMsg = additives.some(a => a.includes('e621'))
    if (hasSulfites || hasMsg) {
      score -= 15
      personalizedRisks.push({
        condition: 'Asthma / Breathing',
        severity: 'high',
        explanation: `Contains ${hasSulfites ? 'sulfites (known asthma trigger)' : ''}${hasSulfites && hasMsg ? ' and ' : ''}${hasMsg ? 'MSG (can trigger asthma attacks in sensitive individuals)' : ''}.`,
        source: 'British Thoracic Society',
        recommendation: 'Avoid products with sulfites (E220-E228) and MSG (E621) if you have asthma.'
      })
      unsafeConditions.add('asthma')
    }
  }

  // Gluten intolerance
  if (conditions.has('gluten_intolerance')) {
    const hasGluten = allergens.some(a => a.includes('gluten') || a.includes('wheat') || a.includes('barley') || a.includes('rye'))
    if (hasGluten) {
      score -= 30
      nutritionalWarnings.push('🚨 CONTAINS GLUTEN — Not safe for celiac / gluten intolerance')
      unsafeConditions.add('gluten_intolerance')
    }
  }

  // Lactose intolerance
  if (conditions.has('lactose_intolerance')) {
    const hasDairy = allergens.some(a => a.includes('milk')) || ingredients.includes('lactose')
    if (hasDairy) {
      score -= 20
      nutritionalWarnings.push('🚨 CONTAINS LACTOSE/DAIRY — May cause digestive discomfort')
      unsafeConditions.add('lactose_intolerance')
    }
  }

  // ── Final score clamping ──────────────────────────────────────────────────────
  const finalScore = Math.max(0, Math.min(100, Math.round(score)))

  let riskLevel: 'green' | 'yellow' | 'red' = 'green'
  if (finalScore < 40 || unsafeConditions.size > 2) riskLevel = 'red'
  else if (finalScore < 65 || unsafeConditions.size > 0) riskLevel = 'yellow'

  const budgetImpact: DailyBudgetImpact = {
    sodium_mg: Math.round(sodium_mg),
    sugar_g: Math.round(sugar),
    saturated_fat_g: Math.round(sat_fat),
    additives_count: additives.length,
    ultra_processed_score: nova === 4 ? 100 : nova === 3 ? 60 : nova === 2 ? 20 : 0
  }

  return {
    overall_score: finalScore,
    risk_level: riskLevel,
    personalized_risks: personalizedRisks,
    additives_of_concern: additivesOfConcern,
    nutritional_warnings: nutritionalWarnings,
    safe_for_conditions: Array.from(safeConditions).filter(c => !unsafeConditions.has(c.toLowerCase().replace(/\s/g, '_'))),
    unsafe_for_conditions: Array.from(unsafeConditions),
    summary: generateSummary(finalScore, riskLevel, nova, scoreBreakdown, product.product_name || ''),
    recommendations: generateRecommendations(additivesOfConcern, nutritionalWarnings, conditions),
    ingredient_breakdown: ingredientBreakdown,
    daily_budget_impact: budgetImpact
  }
}

function generateSummary(score: number, risk: string, nova: number | undefined, breakdown: string[], name: string): string {
  const novaNote = nova === 4 ? ' It is ultra-processed (NOVA 4).' : nova === 3 ? ' It is a processed food (NOVA 3).' : ''
  if (risk === 'green') return `${name} scores ${score}/100.${novaNote} Generally acceptable for occasional consumption. ${breakdown.length > 0 ? 'Key factors: ' + breakdown.slice(0, 2).join(', ') : ''}`
  if (risk === 'yellow') return `${name} scores ${score}/100.${novaNote} Moderate consumption recommended. ${breakdown.length > 0 ? 'Key deductions: ' + breakdown.slice(0, 3).join(', ') : ''}`
  return `${name} scores ${score}/100.${novaNote} Significant health concerns found. ${breakdown.length > 0 ? 'Key issues: ' + breakdown.slice(0, 3).join(', ') : ''}`
}

function generateRecommendations(additives: AdditiveAnalysis[], warnings: string[], conditions: Set<string>): string[] {
  const recs: string[] = []
  if (additives.some(a => a.risk_level === 'high')) recs.push('Consider alternatives with fewer high-risk additives.')
  if (warnings.some(w => w.includes('SUGAR'))) recs.push('Look for "no added sugar" or "sugar-free" versions.')
  if (warnings.some(w => w.includes('SODIUM'))) recs.push('Try "low sodium" or "no salt added" variants.')
  if (warnings.some(w => w.includes('TRANS FAT'))) recs.push('Avoid this product — trans fat has no safe level.')
  if (warnings.some(w => w.includes('ultra-processed') || w.includes('NOVA 4'))) recs.push('Switch to a minimally processed alternative.')
  if (conditions.has('diabetes')) recs.push('Track your blood sugar after consuming to understand your personal response.')
  if (recs.length === 0) recs.push('Enjoy as part of a balanced diet. Monitor portion sizes.')
  return recs
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getHealthScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 45) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

export function getRiskLevelDescription(level: 'green' | 'yellow' | 'red'): string {
  switch (level) {
    case 'green': return 'Generally safe for regular consumption.'
    case 'yellow': return 'Some concerns. Moderate consumption recommended. Review warnings below.'
    case 'red': return 'Significant health concerns. Consider alternatives or limit consumption.'
  }
}

export function getNutriScoreGrade(product: OFFProduct): string {
  return (product.nutriscore_grade || product.nutrition_grades || '').toUpperCase() || 'N/A'
}

export function normalizeCondition(c: string): string {
  return c.toLowerCase().replace(/[\s-]/g, '_')
}
