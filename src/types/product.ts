export interface OFFProduct {
  code: string
  product_name: string
  brands: string
  ingredients_text: string
  ingredients_tags?: string[]
  additives_tags: string[]
  allergens_tags: string[]
  nutriments: {
    sugars_100g?: number
    sodium_100g?: number
    salt_100g?: number
    fat_100g?: number
    saturated_fat_100g?: number
    proteins_100g?: number
    carbohydrates_100g?: number
    energy_kcal_100g?: number
    fiber_100g?: number
    [key: string]: number | undefined
  }
  image_url: string
  image_small_url?: string
  categories: string
  categories_tags?: string[]
  labels_tags: string[]
  nutrition_grades?: string
  nutriscore_grade?: string
  quantity?: string
  serving_size?: string
  packaging?: string
  manufacturing_places?: string
  origins?: string
  stores?: string
  countries?: string
  lang?: string
}

export interface ScannedProduct {
  id?: string
  user_id?: string
  barcode: string
  product_name: string
  product_image?: string
  brands?: string
  health_score: number
  risk_level: 'green' | 'yellow' | 'red'
  additives: AdditiveAnalysis[]
  nutritional_warnings: string[]
  created_at?: string
}

export interface AdditiveAnalysis {
  code: string
  name: string
  amount?: string
  risk_level: 'low' | 'medium' | 'high'
  explanation: string
  your_risk?: string
  health_concerns: string[]
  daily_limit?: string
  conditions_affected: string[]
}

export interface AlternativeProduct {
  code: string
  product_name: string
  brands: string
  image_url: string
  health_score: number
  nutrition_grades?: string
  price_estimate?: string
  availability?: string
}

export interface HealthAnalysis {
  overall_score: number
  risk_level: 'green' | 'yellow' | 'red'
  personalized_risks: PersonalizedRisk[]
  additives_of_concern: AdditiveAnalysis[]
  nutritional_warnings: string[]
  safe_for_conditions: string[]
  unsafe_for_conditions: string[]
  ingredient_breakdown: IngredientBreakdown[]
  daily_budget_impact: DailyBudgetImpact
}

export interface PersonalizedRisk {
  condition: string
  severity: 'low' | 'medium' | 'high'
  explanation: string
  source: string
  recommendation?: string
}

export interface IngredientBreakdown {
  name: string
  category: 'natural' | 'additive' | 'preservative' | 'sweetener' | 'color' | 'emulsifier' | 'unknown'
  description: string
  safety_rating: 'safe' | 'caution' | 'avoid'
}

export interface DailyBudgetImpact {
  sodium_mg: number
  sugar_g: number
  saturated_fat_g: number
  additives_count: number
  ultra_processed_score: number
}
