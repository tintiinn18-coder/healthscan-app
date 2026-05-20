export interface UserHealthProfile {
  id?: string
  user_id?: string
  conditions: HealthCondition[]
  allergies: string[]
  dietary_restrictions: DietaryRestriction[]
  age?: number
  weight?: number
  height?: number
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  family_members?: FamilyProfile[]
  daily_budgets?: DailyBudgets
  created_at?: string
  updated_at?: string
}

export interface HealthCondition {
  id: string
  name: string
  severity: 'managed' | 'monitored' | 'critical'
  diagnosed_date?: string
  notes?: string
}

export interface FamilyProfile {
  id: string
  name: string
  relationship: 'child' | 'spouse' | 'parent' | 'pet' | 'other'
  age?: number
  conditions: string[]
  allergies: string[]
  is_active: boolean
}

export interface DailyBudgets {
  sodium_mg: number
  sugar_g: number
  saturated_fat_g: number
  caffeine_mg: number
  alcohol_g: number
  custom_limits: Record<string, number>
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

export interface DailyLog {
  id?: string
  user_id: string
  log_date: string
  sodium_mg: number
  sugar_g: number
  saturated_fat_g: number
  protein_g: number
  fiber_g: number
  calories: number
  additives_count: number
  ultra_processed_score: number
  scan_count: number
  created_at?: string
}

export interface ChemicalExposure {
  id?: string
  user_id: string
  chemical_name: string
  chemical_code: string
  amount_mg: number
  week_start: string
  source_products: string[]
  warning_triggered: boolean
  created_at?: string
}
