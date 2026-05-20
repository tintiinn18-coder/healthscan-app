import { ADDITIVE_DATABASE, getAdditiveInfo } from './additiveDatabase'
import type { 
  OFFProduct, 
  HealthAnalysis, 
  PersonalizedRisk, 
  AdditiveAnalysis, 
  IngredientBreakdown,
  DailyBudgetImpact,
  UserHealthProfile 
} from '@/types'

// Condition mapping for additive matching
const CONDITION_MAP: Record<string, string[]> = {
  'diabetes': ['diabetes', 'type_1_diabetes', 'type_2_diabetes', 'prediabetes', 'gestational_diabetes'],
  'cancer_history': ['cancer', 'cancer_history', 'oncology', 'tumor_history', 'remission'],
  'hypertension': ['hypertension', 'high_blood_pressure', 'bp', 'cardiovascular'],
  'digestive_issues': ['ibs', 'crohns', 'ulcerative_colitis', 'gerd', 'digestive_issues', 'celiac', 'leaky_gut'],
  'pregnancy': ['pregnancy', 'pregnant', 'breastfeeding', 'nursing', 'fertility'],
  'infants': ['infant', 'baby', 'toddler', 'children_under_2'],
  'adhd': ['adhd', 'add', 'attention_deficit', 'hyperactivity', 'behavioral_issues'],
  'asthma': ['asthma', 'copd', 'respiratory', 'breathing_issues', 'allergic_asthma'],
  'allergies': ['allergies', 'food_allergies', 'seasonal_allergies', 'anaphylaxis'],
  'migraine': ['migraine', 'chronic_headaches', 'cluster_headaches'],
  'thyroid_issues': ['hypothyroidism', 'hyperthyroidism', 'hashimotos', 'graves', 'goiter'],
  'liver_issues': ['liver_disease', 'hepatitis', 'cirrhosis', 'fatty_liver', 'nafld'],
  'kidney_issues': ['kidney_disease', 'ckd', 'renal', 'dialysis'],
  'obesity': ['obesity', 'overweight', 'weight_management', 'metabolic_syndrome'],
  'autoimmune': ['autoimmune', 'lupus', 'rheumatoid_arthritis', 'ms', 'hashimotos', 'psoriasis'],
  'neurological_disorders': ['epilepsy', 'parkinsons', 'alzheimers', 'ms', 'neuropathy', 'seizures'],
  'depression': ['depression', 'anxiety', 'bipolar', 'mood_disorders', 'mental_health'],
  'phenylketonuria': ['pku', 'phenylketonuria'],
  'sulfite_sensitivity': ['sulfite_sensitivity', 'sulfite_allergy'],
  'aspirin_allergy': ['aspirin_allergy', 'salicylate_sensitivity'],
  'inflammatory_conditions': ['inflammation', 'chronic_inflammation', 'arthritis', 'fibromyalgia'],
  'hormone_disorders': ['pcos', 'endometriosis', 'hormone_imbalance', 'estrogen_dominance'],
  'vegan': ['vegan', 'plant_based'],
  'vegetarian': ['vegetarian', 'lacto_vegetarian', 'ovo_vegetarian'],
  'gerd': ['gerd', 'acid_reflux', 'heartburn'],
  'dental_erosion': ['dental_erosion', 'tooth_decay', 'enamel_loss'],
  'kidney_stones_history': ['kidney_stones', 'renal_stones', 'nephrolithiasis'],
  'ibs': ['ibs', 'irritable_bowel', 'spastic_colon'],
  'metabolic_syndrome': ['metabolic_syndrome', 'insulin_resistance', 'prediabetes']
}

// Reverse mapping for quick lookup
const REVERSE_CONDITION_MAP: Record<string, string> = {}
Object.entries(CONDITION_MAP).forEach(([key, values]) => {
  values.forEach(v => REVERSE_CONDITION_MAP[v] = key)
})

export function normalizeCondition(condition: string): string {
  const normalized = condition.toLowerCase().replace(/[\s-]/g, '_')
  return REVERSE_CONDITION_MAP[normalized] || normalized
}

// Score calculation weights
const SCORE_WEIGHTS = {
  high_risk_additive: -20,
  medium_risk_additive: -10,
  low_risk_additive: -3,
  high_sugar: -15,
  medium_sugar: -8,
  high_sodium: -15,
  medium_sodium: -8,
  high_saturated_fat: -12,
  high_ultra_processed: -15,
  allergen_match: -20,
  dietary_violation: -15,
  condition_risk: -10,
  natural_bonus: 5,
  organic_bonus: 5,
  fiber_bonus: 3,
  protein_bonus: 2
}

export function analyzeProduct(
  product: OFFProduct,
  userProfile: UserHealthProfile | null
): HealthAnalysis {
  const additives = product.additives_tags || []
  const ingredientText = product.ingredients_text || ''
  const nutriments = product.nutriments || {}
  const allergens = product.allergens_tags || []
  const categories = product.categories_tags || []

  let score = 100
  const personalizedRisks: PersonalizedRisk[] = []
  const additivesOfConcern: AdditiveAnalysis[] = []
  const nutritionalWarnings: string[] = []
  const ingredientBreakdown: IngredientBreakdown[] = []
  const unsafeConditions = new Set<string>()
  const safeConditions = new Set<string>(userProfile?.conditions?.map(c => c.id) || [])

  // Track daily budget impact
  const budgetImpact: DailyBudgetImpact = {
    sodium_mg: Math.round((nutriments.sodium_100g || 0) * 1000),
    sugar_g: Math.round(nutriments.sugars_100g || 0),
    saturated_fat_g: Math.round(nutriments.saturated_fat_100g || 0),
    additives_count: additives.length,
    ultra_processed_score: calculateUltraProcessedScore(product)
  }

  // Analyze each additive
  additives.forEach((tag: string) => {
    const info = getAdditiveInfo(tag)

    if (info) {
      const analysis: AdditiveAnalysis = {
        code: info.code,
        name: info.name,
        amount: 'Amount not specified on label',
        risk_level: info.risk_level,
        explanation: info.description,
        health_concerns: info.health_concerns,
        daily_limit: info.daily_limit,
        conditions_affected: info.conditions_affected
      }

      // Check against user conditions
      if (userProfile?.conditions) {
        const matchingConditions = info.conditions_affected.filter(condition => {
          const normalizedUserConditions = userProfile.conditions.map(c => normalizeCondition(c.id))
          return normalizedUserConditions.includes(condition)
        })

        if (matchingConditions.length > 0) {
          const conditionNames = matchingConditions.map(c => 
            userProfile.conditions.find(uc => normalizeCondition(uc.id) === c)?.name || c
          )

          analysis.your_risk = `⚠️ HIGH RISK for your conditions: ${conditionNames.join(', ')}`

          matchingConditions.forEach(c => {
            unsafeConditions.add(c)
            const userCondition = userProfile.conditions.find(uc => normalizeCondition(uc.id) === c)
            if (userCondition) safeConditions.delete(userCondition.id)

            personalizedRisks.push({
              condition: userCondition?.name || c,
              severity: info.risk_level,
              explanation: `${info.name} (${info.code}) is flagged for ${userCondition?.name || c}: ${info.health_concerns[0]}`,
              source: 'EFSA/JECFA/IARC Safety Assessments',
              recommendation: getRecommendationForCondition(c, info.code)
            })
          })
        }
      }

      // Score penalty
      if (info.risk_level === 'high') score += SCORE_WEIGHTS.high_risk_additive
      else if (info.risk_level === 'medium') score += SCORE_WEIGHTS.medium_risk_additive
      else score += SCORE_WEIGHTS.low_risk_additive

      additivesOfConcern.push(analysis)

      // Add to ingredient breakdown
      ingredientBreakdown.push({
        name: info.name,
        category: info.category,
        description: info.description,
        safety_rating: info.risk_level === 'high' ? 'avoid' : info.risk_level === 'medium' ? 'caution' : 'safe'
      })
    } else {
      // Unknown additive
      ingredientBreakdown.push({
        name: tag.replace('en:', '').toUpperCase(),
        category: 'unknown',
        description: 'This additive is not in our database. Consider researching it independently.',
        safety_rating: 'caution'
      })
    }
  })

  // Nutritional analysis
  analyzeNutrition(nutriments, userProfile, score, nutritionalWarnings, personalizedRisks, unsafeConditions, safeConditions)

  // Allergen check
  if (userProfile?.allergies && userProfile.allergies.length > 0) {
    allergens.forEach((allergen: string) => {
      const normalizedAllergen = allergen.replace('en:', '').toLowerCase()
      userProfile.allergies.forEach(userAllergy => {
        if (normalizedAllergen.includes(userAllergy.toLowerCase()) || 
            userAllergy.toLowerCase().includes(normalizedAllergen)) {
          score += SCORE_WEIGHTS.allergen_match
          nutritionalWarnings.push(`🚨 ALLERGEN ALERT: Contains ${normalizedAllergen} - you listed ${userAllergy} as an allergy`)
          unsafeConditions.add('allergies')
        }
      })
    })
  }

  // Dietary restriction check
  if (userProfile?.dietary_restrictions) {
    checkDietaryRestrictions(product, userProfile.dietary_restrictions, score, nutritionalWarnings, unsafeConditions)
  }

  // Organic/natural bonuses
  if (product.labels_tags?.includes('en:organic') || product.labels_tags?.includes('en:eu-organic')) {
    score += SCORE_WEIGHTS.organic_bonus
  }
  if (categories.some(c => c.includes('unprocessed') || c.includes('raw'))) {
    score += SCORE_WEIGHTS.natural_bonus
  }

  // Fiber bonus
  if ((nutriments.fiber_100g || 0) > 3) {
    score += SCORE_WEIGHTS.fiber_bonus
  }

  // Determine risk level
  let riskLevel: 'green' | 'yellow' | 'red' = 'green'
  if (score < 40 || unsafeConditions.size > 2) riskLevel = 'red'
  else if (score < 70 || unsafeConditions.size > 0) riskLevel = 'yellow'

  return {
    overall_score: Math.max(0, Math.min(100, Math.round(score))),
    risk_level: riskLevel,
    personalized_risks: personalizedRisks,
    additives_of_concern: additivesOfConcern,
    nutritional_warnings: nutritionalWarnings,
    safe_for_conditions: Array.from(safeConditions),
    unsafe_for_conditions: Array.from(unsafeConditions),
    ingredient_breakdown: ingredientBreakdown,
    daily_budget_impact: budgetImpact
  }
}

function analyzeNutrition(
  nutriments: any,
  userProfile: UserHealthProfile | null,
  currentScore: number,
  warnings: string[],
  risks: PersonalizedRisk[],
  unsafeConditions: Set<string>,
  safeConditions: Set<string>
): number {
  let score = currentScore

  // Sugar analysis
  const sugar = nutriments.sugars_100g || 0
  if (sugar > 22.5) {
    score += SCORE_WEIGHTS.high_sugar
    warnings.push(`🔴 HIGH SUGAR: ${sugar}g per 100g (WHO recommends <25g/day total)`)

    if (userProfile?.conditions?.some(c => ['diabetes', 'prediabetes', 'gestational_diabetes'].includes(normalizeCondition(c.id)))) {
      const condition = userProfile.conditions.find(c => ['diabetes', 'prediabetes', 'gestational_diabetes'].includes(normalizeCondition(c.id)))
      risks.push({
        condition: condition?.name || 'Diabetes',
        severity: 'high',
        explanation: `This product contains ${sugar}g sugar per 100g. For diabetes management, aim for <5g per serving.`,
        source: 'American Diabetes Association',
        recommendation: 'Choose products with <5g sugar per serving. Consider sugar-free alternatives.'
      })
      unsafeConditions.add('diabetes')
      safeConditions.delete(condition?.id || 'diabetes')
    }
  } else if (sugar > 10) {
    score += SCORE_WEIGHTS.medium_sugar
    warnings.push(`🟡 MODERATE SUGAR: ${sugar}g per 100g`)
  }

  // Sodium analysis
  const sodium = (nutriments.sodium_100g || 0) * 1000 // Convert to mg
  if (sodium > 600) {
    score += SCORE_WEIGHTS.high_sodium
    warnings.push(`🔴 HIGH SODIUM: ${Math.round(sodium)}mg per 100g (AHA recommends <2300mg/day)`)

    if (userProfile?.conditions?.some(c => ['hypertension', 'cardiovascular', 'kidney_disease'].includes(normalizeCondition(c.id)))) {
      const condition = userProfile.conditions.find(c => ['hypertension', 'cardiovascular', 'kidney_disease'].includes(normalizeCondition(c.id)))
      risks.push({
        condition: condition?.name || 'Hypertension',
        severity: 'high',
        explanation: `High sodium (${Math.round(sodium)}mg/100g) directly elevates blood pressure. AHA limit: 1500mg/day for your condition.`,
        source: 'American Heart Association',
        recommendation: 'Look for "low sodium" (<140mg/serving) or "no salt added" alternatives.'
      })
      unsafeConditions.add('hypertension')
      safeConditions.delete(condition?.id || 'hypertension')
    }
  } else if (sodium > 300) {
    score += SCORE_WEIGHTS.medium_sodium
    warnings.push(`🟡 MODERATE SODIUM: ${Math.round(sodium)}mg per 100g`)
  }

  // Saturated fat
  const satFat = nutriments.saturated_fat_100g || 0
  if (satFat > 5) {
    score += SCORE_WEIGHTS.high_saturated_fat
    warnings.push(`🔴 HIGH SATURATED FAT: ${satFat}g per 100g (WHO recommends <10% of daily calories)`)

    if (userProfile?.conditions?.some(c => ['cardiovascular', 'obesity', 'high_cholesterol'].includes(normalizeCondition(c.id)))) {
      risks.push({
        condition: 'Cardiovascular Health',
        severity: 'medium',
        explanation: `High saturated fat increases LDL cholesterol. Current: ${satFat}g/100g. Limit: <2g per serving for heart health.`,
        source: 'American Heart Association',
        recommendation: 'Choose products with <1.5g saturated fat per serving.'
      })
    }
  }

  // Ultra-processed indicators
  const ingredients = (nutriments.ingredients_text || '').split(/[,;]/).length
  if (ingredients > 15) {
    score += SCORE_WEIGHTS.high_ultra_processed
    warnings.push(`⚠️ ULTRA-PROCESSED: ${ingredients} ingredients detected. NOVA classification suggests limiting ultra-processed foods.`)
  }

  return score
}

function calculateUltraProcessedScore(product: OFFProduct): number {
  let score = 0
  const additives = product.additives_tags || []
  const ingredients = (product.ingredients_text || '').split(/[,;]/).length

  // NOVA classification indicators
  if (additives.length > 5) score += 30
  else if (additives.length > 2) score += 15

  if (ingredients > 15) score += 25
  else if (ingredients > 10) score += 15

  if (product.nutriments?.energy_kcal_100g && product.nutriments.energy_kcal_100g > 400) score += 10

  return Math.min(100, score)
}

function checkDietaryRestrictions(
  product: OFFProduct,
  restrictions: string[],
  score: number,
  warnings: string[],
  unsafeConditions: Set<string>
): number {
  const categories = product.categories_tags || []
  const labels = product.labels_tags || []
  const ingredients = product.ingredients_text?.toLowerCase() || ''

  restrictions.forEach(restriction => {
    switch(restriction) {
      case 'vegan':
        if (ingredients.includes('milk') || ingredients.includes('egg') || ingredients.includes('honey') ||
            ingredients.includes('whey') || ingredients.includes('casein') || ingredients.includes('lactose') ||
            ingredients.includes('gelatin') || ingredients.includes('shellac')) {
          score += SCORE_WEIGHTS.dietary_violation
          warnings.push(`🚫 NOT VEGAN: Contains animal-derived ingredients`)
          unsafeConditions.add('vegan')
        }
        break
      case 'vegetarian':
        if (ingredients.includes('meat') || ingredients.includes('fish') || ingredients.includes('gelatin') ||
            ingredients.includes('rennet') || ingredients.includes('carmine')) {
          score += SCORE_WEIGHTS.dietary_violation
          warnings.push(`🚫 NOT VEGETARIAN: Contains meat/fish products`)
          unsafeConditions.add('vegetarian')
        }
        break
      case 'gluten_free':
        if (!labels.includes('en:gluten-free') && (ingredients.includes('wheat') || ingredients.includes('barley') || 
            ingredients.includes('rye') || ingredients.includes('malt') || ingredients.includes('gluten'))) {
          score += SCORE_WEIGHTS.dietary_violation
          warnings.push(`🚫 CONTAINS GLUTEN: Not safe for celiac disease or gluten sensitivity`)
          unsafeConditions.add('gluten_free')
        }
        break
      case 'dairy_free':
        if (ingredients.includes('milk') || ingredients.includes('whey') || ingredients.includes('casein') ||
            ingredients.includes('lactose') || ingredients.includes('butter') || ingredients.includes('cream')) {
          score += SCORE_WEIGHTS.dietary_violation
          warnings.push(`🚫 CONTAINS DAIRY: Contains milk-derived ingredients`)
          unsafeConditions.add('dairy_free')
        }
        break
      case 'kosher':
        if (!labels.includes('en:kosher') && (ingredients.includes('pork') || ingredients.includes('shellfish') ||
            ingredients.includes('crab') || ingredients.includes('lobster'))) {
          warnings.push(`⚠️ Not certified kosher. Check for non-kosher ingredients.`)
        }
        break
      case 'halal':
        if (!labels.includes('en:halal') && (ingredients.includes('pork') || ingredients.includes('lard') ||
            ingredients.includes('gelatin') || ingredients.includes('alcohol') || ingredients.includes('wine'))) {
          warnings.push(`⚠️ Not certified halal. Check for pork, alcohol, or non-halal gelatin.`)
        }
        break
      case 'keto':
        const carbs = product.nutriments?.carbohydrates_100g || 0
        if (carbs > 10) {
          score += SCORE_WEIGHTS.dietary_violation
          warnings.push(`🚫 NOT KETO-FRIENDLY: ${carbs}g carbs per 100g (keto typically <20-50g/day)`)
          unsafeConditions.add('keto')
        }
        break
    }
  })

  return score
}

function getRecommendationForCondition(condition: string, additiveCode: string): string {
  const recommendations: Record<string, Record<string, string>> = {
    'diabetes': {
      'default': 'Choose products with <5g sugar per serving. Look for whole food ingredients.',
      'E951': 'Consider natural sweeteners like stevia or monk fruit instead of aspartame.',
      'E955': 'Try erythritol or allulose as lower-impact alternatives.'
    },
    'cancer_history': {
      'default': 'Prioritize organic, minimally processed foods. Avoid nitrites and artificial colors.',
      'E250': 'Choose uncured meats or plant-based alternatives. Look for "no nitrites added."',
      'E320': 'Avoid products with BHA/BHT. Choose natural vitamin E (tocopherols) as preservative.',
      'E129': 'Select products with natural colors (beet juice, turmeric, spirulina).'
    },
    'hypertension': {
      'default': 'Aim for <140mg sodium per serving. Choose "no salt added" or "low sodium" options.',
      'E250': 'Sodium nitrite adds sodium. Choose fresh or frozen unprocessed meats.'
    },
    'pregnancy': {
      'default': 'Avoid all artificial sweeteners, high-mercury fish, and unpasteurized products.',
      'E951': 'AVOID during pregnancy. Use small amounts of honey, maple syrup, or fruit.',
      'E250': 'Limit processed meats. Choose fresh-cooked proteins.',
      'E129': 'Avoid artificial colors. Choose naturally colored foods.'
    },
    'adhd': {
      'default': 'Eliminate artificial colors, flavors, and preservatives. Focus on whole foods.',
      'E102': 'AVOID completely. Choose products with natural coloring.',
      'E129': 'AVOID completely. This is strongly linked to hyperactivity.',
      'E211': 'Minimize exposure. Choose fresh or frozen over shelf-stable products.'
    },
    'migraine': {
      'default': 'Avoid MSG, artificial sweeteners, nitrates, and aged cheeses.',
      'E621': 'AVOID MSG completely. Check for "hydrolyzed protein" and "yeast extract" too.',
      'E951': 'Avoid aspartame - common migraine trigger.',
      'E250': 'Nitrates are common migraine triggers. Choose fresh meats.'
    },
    'autoimmune': {
      'default': 'Follow anti-inflammatory diet. Avoid processed foods, gluten, and nightshades if sensitive.',
      'E407': 'Carrageenan may increase inflammation. Choose products without it.',
      'E320': 'BHA may disrupt immune function. Choose natural antioxidants.'
    }
  }

  const conditionRecs = recommendations[condition]
  if (conditionRecs) {
    return conditionRecs[additiveCode] || conditionRecs['default'] || 'Consult your healthcare provider for personalized advice.'
  }

  return 'Consider alternatives without this ingredient. Consult your healthcare provider.'
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

export function getRiskLevelDescription(level: 'green' | 'yellow' | 'red'): string {
  switch(level) {
    case 'green': return 'This product aligns well with your health profile. Safe to consume regularly.'
    case 'yellow': return 'This product has some concerns. Moderate consumption recommended. Review the warnings below.'
    case 'red': return 'This product poses significant risks for your health profile. Consider alternatives.'
  }
}

export function getNutriScoreGrade(product: OFFProduct): string {
  return product.nutriscore_grade?.toUpperCase() || product.nutrition_grades?.toUpperCase() || 'N/A'
}
