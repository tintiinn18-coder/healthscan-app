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
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  healthConcerns: string[];
  conditions: string[];
  dailyLimit?: string;
  amount?: string;
  yourRisk?: string;
  matchedConditions?: string[];
}

export interface PersonalizedRisk {
  condition: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  source: string;
}

export interface NutritionalWarning {
  nutrient: string;
  value: number;
  threshold: number;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface HealthAnalysis {
  overallScore: number;
  riskLevel: 'green' | 'yellow' | 'red';
  personalizedRisks: PersonalizedRisk[];
  additivesOfConcern: AdditiveAnalysis[];
  nutritionalWarnings: NutritionalWarning[];
  safeForConditions: string[];
  unsafeForConditions: string[];
  summary: string;
  recommendations: string[];
}

// User types
export interface UserHealthProfile {
  id: string;
  conditions: string[];
  allergies: string[];
  dietaryRestrictions: string[];
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  familyMembers?: FamilyMember[];
  dailyBudgets?: DailyBudgets;
  createdAt?: string;
  updatedAt?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'self' | 'child' | 'spouse' | 'parent' | 'pet';
  age?: number;
  weight?: number;
  conditions: string[];
  allergies: string[];
  isActive: boolean;
}

export interface DailyBudgets {
  sodiumMg: number;
  sugarG: number;
  saturatedFatG: number;
  fiberG: number;
  proteinG: number;
  calories: number;
  customLimits: Record<string, number>;
}

// Scan history types
export interface ScanRecord {
  id: string;
  userId: string;
  barcode: string;
  productName: string;
  productImage?: string;
  brand?: string;
  healthScore: number;
  riskLevel: 'green' | 'yellow' | 'red';
  additives: AdditiveAnalysis[];
  nutritionalWarnings: NutritionalWarning[];
  servingSize?: string;
  quantity?: string;
  createdAt: string;
  familyMemberId?: string;
}

// Cumulative tracking types
export interface ChemicalExposure {
  id: string;
  userId: string;
  familyMemberId?: string;
  chemicalName: string;
  chemicalCode: string;
  amountMg: number;
  logDate: string;
  weekStart: string;
  productName?: string;
}

export interface DailyLog {
  id: string;
  userId: string;
  familyMemberId?: string;
  logDate: string;
  sodiumMg: number;
  sugarG: number;
  saturatedFatG: number;
  fiberG: number;
  proteinG: number;
  calories: number;
  additiveExposure: Record<string, number>;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalScans: number;
  averageScore: number;
  chemicalExposures: ChemicalExposure[];
  dailyLogs: DailyLog[];
  budgetStatus: BudgetStatus[];
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
  productName: string;
  brand: string;
  imageUrl?: string;
  healthScore: number;
  riskLevel: 'green' | 'yellow' | 'red';
  price?: number;
  store?: string;
  distance?: number;
  reason: string;
  improvement: string;
}

// Challenge types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'clean_label' | 'sugar_detox' | 'additive_free' | 'custom';
  duration: number; // days
  rules: ChallengeRule[];
  reward: string;
  participants: number;
  startDate?: string;
  endDate?: string;
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
  currentUser: UserHealthProfile | null;
  activeFamilyMember: string;
  recentScans: ScanRecord[];
  toasts: Toast[];
  isLoading: boolean;
}