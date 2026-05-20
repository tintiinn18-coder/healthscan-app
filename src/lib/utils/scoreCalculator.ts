import type { DailyLog, ChemicalExposure, UserHealthProfile } from '@/types'

export interface WeeklyStats {
  week_start: string
  week_end: string
  total_scans: number
  average_health_score: number
  risk_distribution: { green: number; yellow: number; red: number }
  total_sodium_mg: number
  total_sugar_g: number
  total_saturated_fat_g: number
  total_additives: number
  unique_chemicals: string[]
  budget_adherence: Record<string, { target: number; actual: number; percentage: number; status: 'under' | 'near' | 'over' }>
  top_concerns: string[]
  improvements: string[]
  recommendations: string[]
}

export interface StreakData {
  current_streak_days: number
  longest_streak_days: number
  last_scan_date: string | null
  total_green_scans: number
  total_yellow_scans: number
  total_red_scans: number
}

export function calculateWeeklyStats(
  dailyLogs: DailyLog[],
  chemicalExposures: ChemicalExposure[],
  userProfile: UserHealthProfile
): WeeklyStats {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const weekLogs = dailyLogs.filter(log => {
    const logDate = new Date(log.log_date)
    return logDate >= weekStart && logDate <= weekEnd
  })

  const weekExposures = chemicalExposures.filter(exp => {
    const expDate = new Date(exp.week_start)
    return expDate.getTime() === weekStart.getTime()
  })

  const totalScans = weekLogs.reduce((sum, log) => sum + log.scan_count, 0)
  const avgScore = weekLogs.length > 0 
    ? weekLogs.reduce((sum, log) => sum + (100 - log.ultra_processed_score), 0) / weekLogs.length 
    : 0

  const riskDist = { green: 0, yellow: 0, red: 0 }
  // This would come from scan history in real implementation

  const totalSodium = weekLogs.reduce((sum, log) => sum + log.sodium_mg, 0)
  const totalSugar = weekLogs.reduce((sum, log) => sum + log.sugar_g, 0)
  const totalSatFat = weekLogs.reduce((sum, log) => sum + log.saturated_fat_g, 0)
  const totalAdditives = weekLogs.reduce((sum, log) => sum + log.additives_count, 0)

  const uniqueChems = [...new Set(weekExposures.map(e => e.chemical_name))]

  // Calculate budget adherence
  const budgets = userProfile.daily_budgets || {
    sodium_mg: 2300,
    sugar_g: 50,
    saturated_fat_g: 20,
    caffeine_mg: 400,
    alcohol_g: 0,
    custom_limits: {}
  }

  const adherence: WeeklyStats['budget_adherence'] = {
    sodium: {
      target: budgets.sodium_mg * 7,
      actual: totalSodium,
      percentage: Math.round((totalSodium / (budgets.sodium_mg * 7)) * 100),
      status: totalSodium > budgets.sodium_mg * 7 ? 'over' : totalSodium > budgets.sodium_mg * 7 * 0.8 ? 'near' : 'under'
    },
    sugar: {
      target: budgets.sugar_g * 7,
      actual: totalSugar,
      percentage: Math.round((totalSugar / (budgets.sugar_g * 7)) * 100),
      status: totalSugar > budgets.sugar_g * 7 ? 'over' : totalSugar > budgets.sugar_g * 7 * 0.8 ? 'near' : 'under'
    },
    saturated_fat: {
      target: budgets.saturated_fat_g * 7,
      actual: totalSatFat,
      percentage: Math.round((totalSatFat / (budgets.saturated_fat_g * 7)) * 100),
      status: totalSatFat > budgets.saturated_fat_g * 7 ? 'over' : totalSatFat > budgets.saturated_fat_g * 7 * 0.8 ? 'near' : 'under'
    }
  }

  // Generate insights
  const concerns: string[] = []
  const improvements: string[] = []
  const recommendations: string[] = []

  if (adherence.sodium.status === 'over') {
    concerns.push(`Sodium intake ${adherence.sodium.percentage}% of weekly limit`)
    recommendations.push('Choose "low sodium" or "no salt added" versions of your regular products')
  }
  if (adherence.sugar.status === 'over') {
    concerns.push(`Sugar intake ${adherence.sugar.percentage}% of weekly limit`)
    recommendations.push('Try swapping sugary snacks for fruit or nuts')
  }
  if (totalAdditives > 50) {
    concerns.push(`High additive exposure: ${totalAdditives} additives this week`)
    recommendations.push('Focus on whole foods with fewer than 5 ingredients')
  }
  if (uniqueChems.length > 10) {
    concerns.push(`Diverse chemical exposure: ${uniqueChems.length} different additives`)
    recommendations.push('Simplifying your diet to fewer processed foods reduces chemical diversity risk')
  }

  if (adherence.sodium.status === 'under' && adherence.sugar.status === 'under') {
    improvements.push('Great job staying under sodium and sugar limits!')
  }
  if (avgScore > 75) {
    improvements.push('Your average product score is excellent - keep choosing quality foods!')
  }

  return {
    week_start: weekStart.toISOString().split('T')[0],
    week_end: weekEnd.toISOString().split('T')[0],
    total_scans: totalScans,
    average_health_score: Math.round(avgScore),
    risk_distribution: riskDist,
    total_sodium_mg: totalSodium,
    total_sugar_g: totalSugar,
    total_saturated_fat_g: totalSatFat,
    total_additives: totalAdditives,
    unique_chemicals: uniqueChems,
    budget_adherence: adherence,
    top_concerns: concerns,
    improvements,
    recommendations
  }
}

export function calculateStreak(dailyLogs: DailyLog[]): StreakData {
  if (dailyLogs.length === 0) {
    return {
      current_streak_days: 0,
      longest_streak_days: 0,
      last_scan_date: null,
      total_green_scans: 0,
      total_yellow_scans: 0,
      total_red_scans: 0
    }
  }

  const sorted = [...dailyLogs].sort((a, b) => 
    new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
  )

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let lastDate: Date | null = null

  // Calculate current streak (consecutive days with scans)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const log of sorted) {
    const logDate = new Date(log.log_date)
    logDate.setHours(0, 0, 0, 0)

    if (!lastDate) {
      // First entry
      const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays <= 1) {
        currentStreak = 1
        tempStreak = 1
      }
      lastDate = logDate
    } else {
      const diffDays = Math.floor((lastDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        tempStreak++
        if (currentStreak > 0) currentStreak = tempStreak
      } else if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
      lastDate = logDate
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak)

  return {
    current_streak_days: currentStreak,
    longest_streak_days: longestStreak,
    last_scan_date: sorted[0]?.log_date || null,
    total_green_scans: 0, // Would need scan history
    total_yellow_scans: 0,
    total_red_scans: 0
  }
}

export function getBudgetStatusColor(status: 'under' | 'near' | 'over'): string {
  switch(status) {
    case 'under': return 'text-green-600 bg-green-100'
    case 'near': return 'text-yellow-600 bg-yellow-100'
    case 'over': return 'text-red-600 bg-red-100'
  }
}

export function formatPercentage(value: number): string {
  return `${Math.min(999, value)}%`
}
