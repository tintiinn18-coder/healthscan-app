'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DailyLog, ChemicalExposure } from '@/types'
import { calculateWeeklyStats, calculateStreak } from '@/lib/utils/scoreCalculator'
import type { WeeklyStats, StreakData } from '@/lib/utils/scoreCalculator'

export function useTracker() {
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [chemicalExposure, setChemicalExposure] = useState<ChemicalExposure[]>([])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Load daily logs for last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('log_date', { ascending: false })

      setDailyLogs(logs || [])

      // Load chemical exposure for current week
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())

      const { data: exposures } = await supabase
        .from('chemical_exposure')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart.toISOString().split('T')[0])

      setChemicalExposure(exposures || [])

      // Calculate stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        const stats = calculateWeeklyStats(logs || [], exposures || [], profile)
        setWeeklyStats(stats)
      }

      const streak = calculateStreak(logs || [])
      setStreakData(streak)
    } catch (error) {
      console.error('Tracker load error:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    dailyLogs,
    chemicalExposure,
    weeklyStats,
    streakData,
    loading,
    refresh: loadData
  }
}
