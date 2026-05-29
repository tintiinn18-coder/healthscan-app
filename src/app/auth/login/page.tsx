'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import Link from 'next/link'
import { ScanLine, Mail, Lock, Chrome, Github, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signInWithEmail, signUp, signInWithOAuth, configError } = useAuth()
  const callbackError = searchParams.get('error')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = isSignUp ? await signUp(email, password, fullName) : await signInWithEmail(email, password)
      if (result.error) {
        setError(result.error.message)
      } else if (isSignUp) {
        setError('Check your email for a confirmation link if your project requires email verification.')
      }
    } catch {
      setError('An unexpected auth error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-health-blue rounded-xl flex items-center justify-center mx-auto mb-4">
              <ScanLine className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="text-gray-500 mt-2">{isSignUp ? 'Create a HealthScan account to save scans and label entries.' : 'Sign in to access your saved scans and profile.'}</p>
          </div>

          {(configError || callbackError) && (
            <Alert variant="warning" className="mb-6">
              {configError || 'Authentication callback failed. Check NEXT_PUBLIC_SITE_URL and your Supabase redirect settings.'}
            </Alert>
          )}

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg" disabled={Boolean(configError)}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => signInWithOAuth('google')} className="flex items-center gap-2" disabled={Boolean(configError)}>
              <Chrome className="h-4 w-4" />
              Google
            </Button>
            <Button variant="secondary" onClick={() => signInWithOAuth('github')} className="flex items-center gap-2" disabled={Boolean(configError)}>
              <Github className="h-4 w-4" />
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError('') }} className="text-health-blue font-medium hover:underline">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </Card>
      </div>
    </div>
  )
}

function LoginSkeleton() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="p-8 w-full max-w-md">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-gray-100 rounded mx-auto" />
          <div className="h-11 bg-gray-100 rounded-xl" />
          <div className="h-11 bg-gray-100 rounded-xl" />
          <div className="h-11 bg-gray-100 rounded-xl" />
        </div>
      </Card>
    </div>
  )
}
