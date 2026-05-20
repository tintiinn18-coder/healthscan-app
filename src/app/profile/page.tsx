'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { HealthProfileForm } from '@/components/profile/HealthProfileForm'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Shield, Info } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Loading profile...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Profile</h1>
        <p className="text-gray-600">Customize your health conditions, allergies, and daily limits</p>
      </div>

      <Alert variant="info" title="Why This Matters">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Your health profile powers personalized risk analysis. When you scan products, 
            we cross-reference ingredients against your conditions to flag specific dangers. 
            All data is encrypted and only visible to you.
          </p>
        </div>
      </Alert>

      <HealthProfileForm />

      <Card className="bg-gray-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-400" />
            <CardTitle className="text-sm text-gray-500">Privacy & Security</CardTitle>
          </div>
        </CardHeader>
        <div className="text-xs text-gray-400 space-y-2">
          <p>• Your health data is encrypted and stored securely in Supabase</p>
          <p>• We never share your personal health information with third parties</p>
          <p>• You can delete your account and all data at any time</p>
          <p>• Health analysis runs locally or via secure edge functions</p>
        </div>
      </Card>
    </div>
  )
}
