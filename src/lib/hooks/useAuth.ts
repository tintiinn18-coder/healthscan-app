'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

function getAuthRedirectUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) {
    return `${configured.replace(/\/$/, '')}/auth/callback`
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`
  }

  return 'http://localhost:3000/auth/callback'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)

  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : 'Supabase is not configured.')
      return null
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error(configError || 'Supabase is not configured.') }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: new Error(configError || 'Supabase is not configured.') }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: getAuthRedirectUrl(),
      },
    })

    return { error }
  }

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    if (!supabase) {
      return { error: new Error(configError || 'Supabase is not configured.') }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getAuthRedirectUrl() },
    })

    return { error }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
  }

  return {
    user,
    loading,
    configError,
    signInWithEmail,
    signUp,
    signInWithOAuth,
    signOut,
  }
}
