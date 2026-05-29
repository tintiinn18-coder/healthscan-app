import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  return new URL(request.url).origin
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/dashboard'
  const baseUrl = getBaseUrl(request)

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=missing_code`)
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  } catch (error) {
    console.error('Auth callback error:', error)
  }

  return NextResponse.redirect(`${baseUrl}/auth/login?error=auth_callback_error`)
}
