export type ProductSource =
  | 'open_food_facts'
  | 'user_submission'
  | 'manual'
  | 'ocr'
  | 'groq_enhanced'

export interface OFFProduct {
  code: string
  product_name: string
  brands: string
  ingredients_text: string
  ingredients_tags?: string[]
  additives_tags: string[]
  allergens_tags: string[]
  nutriments: Record<string, number>
  image_url: string
  image_small_url?: string
  categories: string
  categories_tags?: string[]
  labels_tags: string[]
  nutrition_grades?: string
  nova_group?: number
  ecoscore_grade?: string
  quantity?: string
  serving_size?: string
  packaging?: string
  manufacturing_places?: string
  stores?: string
  countries_tags?: string[]
  nutriscore_grade?: string
  origins?: string
  countries?: string
  lang?: string
  source?: ProductSource
  source_label?: string
}

export interface OFFSearchResponse {
  products: OFFProduct[]
  count: number
  page: number
  page_count: number
  page_size: number
}

export interface AdditiveAnalysis {
  code: string
  name: string
  explanation: string
  risk_level: 'low' | 'medium' | 'high'
  health_concerns: string[]
  conditions_affected: string[]
  daily_limit?: string
  amount?: string
  your_risk?: string
  matched_conditions?: string[]
  sourceName?: string
  sourceUrl?: string
  evidenceNote?: string
  riskWording?: string
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

export interface PersonalizedRisk {
  condition: string
  severity: 'low' | 'medium' | 'high'
  explanation: string
  source: string
  recommendation?: string
}

export interface HealthAnalysis {
  overall_score: number
  risk_level: 'green' | 'yellow' | 'red'
  personalized_risks: PersonalizedRisk[]
  additives_of_concern: AdditiveAnalysis[]
  nutritional_warnings: string[]
  safe_for_conditions: string[]
  caution_for_conditions: string[]
  summary: string
  recommendations: string[]
  ingredient_breakdown?: IngredientBreakdown[]
  daily_budget_impact?: DailyBudgetImpact
  confidence?: 'low' | 'medium' | 'high'
  needs_manual_review?: boolean
}

export interface HealthCondition {
  id: string
  name: string
  severity: 'managed' | 'monitored' | 'critical'
  diagnosed_date?: string
  notes?: string
}

export type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'kosher'
  | 'halal'
  | 'keto'
  | 'paleo'
  | 'low_fodmap'
  | 'none'

export interface FamilyMember {
  id: string
  name: string
  relation: 'self' | 'child' | 'spouse' | 'parent' | 'pet'
  relationship?: string
  age?: number
  weight?: number
  conditions: string[]
  allergies: string[]
  is_active: boolean
}

export interface DailyBudgets {
  sodium_mg: number
  sugar_g: number
  saturated_fat_g: number
  fiber_g: number
  protein_g: number
  calories: number
  caffeine_mg?: number
  alcohol_g?: number
  custom_limits: Record<string, number>
}

export interface UserHealthProfile {
  id?: string
  user_id?: string
  conditions: string[]
  allergies: string[]
  dietary_restrictions: string[]
  age?: number
  weight?: number
  height?: number
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  family_members?: FamilyMember[]
  daily_budgets?: DailyBudgets
  created_at?: string
  updated_at?: string
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
  additives?: AdditiveAnalysis[]
  nutritional_warnings?: string[]
  created_at?: string
}

export interface ScanRecord {
  id: string
  user_id: string
  barcode: string
  product_name: string
  product_image?: string
  brand?: string
  health_score: number
  risk_level: 'green' | 'yellow' | 'red'
  additives: AdditiveAnalysis[]
  nutritional_warnings: string[]
  serving_size?: string
  quantity?: string
  created_at: string
  family_member_id?: string
}

export interface ChemicalExposure {
  id?: string
  user_id: string
  family_member_id?: string
  chemical_name: string
  chemical_code: string
  amount_mg?: number | null
  estimated_amount_mg?: number | null
  estimatedAmountMg?: number | null
  quantity_known?: boolean
  quantityKnown?: boolean
  exposure_events?: number
  exposureEvents?: number
  log_date?: string
  week_start: string
  product_name?: string
  source_products?: string[]
  warning_triggered?: boolean
  created_at?: string
  updated_at?: string
  last_seen_at?: string
}

export interface DailyLog {
  id?: string
  user_id: string
  family_member_id?: string
  log_date: string
  sodium_mg: number
  sugar_g: number
  saturated_fat_g: number
  fiber_g: number
  protein_g: number
  calories: number
  additive_exposure?: Record<string, number>
  additives_count?: number
  ultra_processed_score?: number
  scan_count?: number
  created_at?: string
}

export interface WeeklySummary {
  week_start: string
  week_end: string
  total_scans: number
  average_score: number
  chemical_exposures: ChemicalExposure[]
  daily_logs: DailyLog[]
  budget_status: BudgetStatus[]
}

export interface BudgetStatus {
  nutrient: string
  consumed: number
  limit: number
  percentage: number
  status: 'under' | 'near' | 'over'
}

export interface AlternativeProduct {
  code: string
  product_name: string
  brands?: string
  image_url?: string
  health_score?: number
  risk_level?: string
  additives?: string[]
  categories?: string
  nutrition_grades?: string
  price_estimate?: string
  availability?: string
}

export interface ManualProductInput {
  barcode?: string
  productName: string
  brand?: string
  category?: string
  ingredientsText: string
  nutriments?: Record<string, number>
  source?: ProductSource
  saveToDatabase?: boolean
}

export interface UserProductRecord {
  id?: string
  barcode?: string
  product_name: string
  brand?: string
  category?: string
  ingredients_text: string
  nutriments?: Record<string, number>
  submitted_by?: string | null
  verified?: boolean
  source?: string
  created_at?: string
  updated_at?: string
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface AppState {
  current_user: UserHealthProfile | null
  active_family_member: string
  recent_scans: ScanRecord[]
  toasts: Toast[]
  is_loading: boolean
}
