export interface AdditiveInfo {
  code: string
  name: string
  description: string
  risk_level: 'low' | 'medium' | 'high'
  health_concerns: string[]
  conditions_affected: string[]
  daily_limit?: string
  category: 'preservative' | 'sweetener' | 'color' | 'emulsifier' | 'antioxidant' | 'flavor_enhancer' | 'stabilizer' | 'other'
  aliases: string[]
  banned_in?: string[]
  acceptable_in?: string[]
}

export interface ConditionGuideline {
  condition_id: string
  condition_name: string
  avoid_additives: string[]
  limit_nutrients: Record<string, { max_daily: number; unit: string; reason: string }>
  recommended_additives: string[]
  general_advice: string[]
  sources: string[]
}

export interface NutrientGuideline {
  nutrient: string
  unit: string
  general_max: number
  condition_limits: Record<string, number>
  health_effects: string[]
  food_sources: string[]
}

export interface WeeklyReport {
  week_start: string
  week_end: string
  total_scans: number
  average_health_score: number
  risk_distribution: { green: number; yellow: number; red: number }
  top_concerns: string[]
  chemical_exposure: ChemicalExposure[]
  budget_adherence: Record<string, { target: number; actual: number; percentage: number }>
  improvements: string[]
  recommendations: string[]
}

export interface ScanSession {
  id: string
  user_id: string
  session_date: string
  products: ScannedProduct[]
  session_score: number
  total_additives: number
  created_at: string
}
