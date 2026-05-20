export interface ScannedProduct {
  id: string
  barcode: string
  product_name: string
  product_image?: string
  health_score: number
  risk_level: 'green' | 'yellow' | 'red'
  created_at: string
  brands?: string
  additives?: any[]
}

// Product types from Open Food Facts
export interface OFFProduct {
  code: string;
  product_name: string;
  brands: string;
  ingredients_text: string;
  ingredients_tags?: string[];
  additives_tags: string[];
  allergens_tags: string[];
  nutriments: Record<string, number>;
  image_url: string;
  image_small_url?: string;
  categories: string;
  categories_tags?: string[];
  labels_tags: string[];
  nutrition_grades?: string;
  nova_group?: number;
  ecoscore_grade?: string;
  quantity?: string;
  serving_size?: string;
  packaging?: string;
  manufacturing_places?: string;
  stores?: string;
  countries_tags?: string[];
  nutriscore_grade?: string;
}

export interface OFFSearchResponse {
  products: OFFProduct[];
  count: number;
  page: number;
  page_count: number;
  page_size: number;
}

// Health analysis types
export interface AdditiveAnalysis {
  code: string;
  name: string;
  explanation: string;  // CHANGED FROM description
  risk_level: 'low' | 'medium' | 'high';
  health_concerns: string[];
  conditions: string[];
  daily_limit?: string;
  amount?: string;
  your_risk?: string;
  matched_conditions?: string[];
}

export interface PersonalizedRisk {
  condition: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  source: string;
  recommendation?: string;
}

export interface NutritionalWarning {
  nutrient: string;
  value: number;
  threshold: number;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface HealthAnalysis {
  overall_score: number;
  risk_level: 'green' | 'yellow' | 'red';
  personalized_risks: PersonalizedRisk[];
  additives_of_concern: AdditiveAnalysis[];
  nutritional_warnings: string[];
  safe_for_conditions: string[];
  unsafe_for_conditions: string[];
  summary: string;
  recommendations: string[];
  daily_budget_impact?: any;
}

// User types
export interface UserHealthProfile {
  id: string;
  conditions: string[];
  allergies: string[];
  dietary_restrictions: string[];
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female' | 'other';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  family_members?: FamilyMember[];
  daily_budgets?: DailyBudgets;
  created_at?: string;
  updated_at?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'self' | 'child' | 'spouse' | 'parent' | 'pet';
  age?: number;
  weight?: number;
  conditions: string[];
  allergies: string[];
  is_active: boolean;
}

export interface DailyBudgets {
  sodium_mg: number;
  sugar_g: number;
  saturated_fat_g: number;
  fiber_g: number;
  protein_g: number;
  calories: number;
  custom_limits: Record<string, number>;
}

// Scan history types
export interface ScanRecord {
  id: string;
  user_id: string;
  barcode: string;
  product_name: string;
  product_image?: string;
  brand?: string;
  health_score: number;
  risk_level: 'green' | 'yellow' | 'red';
  additives: AdditiveAnalysis[];
  nutritional_warnings: NutritionalWarning[];
  serving_size?: string;
  quantity?: string;
  created_at: string;
  family_member_id?: string;
}

// Cumulative tracking types
export interface ChemicalExposure {
  id: string;
  user_id: string;
  family_member_id?: string;
  chemical_name: string;
  chemical_code: string;
  amount_mg: number;
  log_date: string;
  week_start: string;
  product_name?: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  family_member_id?: string;
  log_date: string;
  sodium_mg: number;
  sugar_g: number;
  saturated_fat_g: number;
  fiber_g: number;
  protein_g: number;
  calories: number;
  additive_exposure: Record<string, number>;
}

export interface WeeklySummary {
  week_start: string;
  week_end: string;
  total_scans: number;
  average_score: number;
  chemical_exposures: ChemicalExposure[];
  daily_logs: DailyLog[];
  budget_status: BudgetStatus[];
}

export interface BudgetStatus {
  nutrient: string;
  consumed: number;
  limit: number;
  percentage: number;
  status: 'under' | 'near' | 'over';
}

// Alternative product types
export interface AlternativeProduct {
  code: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  health_score?: number;
  risk_level?: string;
  additives?: string[];
  categories?: string;
  nutrition_grades?: string;
}

// Challenge types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'clean_label' | 'sugar_detox' | 'additive_free' | 'custom';
  duration: number;
  rules: ChallengeRule[];
  reward: string;
  participants: number;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'completed' | 'failed';
  progress: number;
}

export interface ChallengeRule {
  type: 'no_additives' | 'max_sugar' | 'max_sodium' | 'min_score' | 'custom';
  value: number;
  description: string;
}

// UI types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface AppState {
  current_user: UserHealthProfile | null;
  active_family_member: string;
  recent_scans: ScanRecord[];
  toasts: Toast[];
  is_loading: boolean;
}
