'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { User, Heart, AlertCircle, Apple, Activity } from 'lucide-react'

const COMMON_CONDITIONS = [
  'Diabetes', 'Hypertension', 'Cancer History', 'Pregnancy',
  'ADHD', 'Asthma', 'Migraine', 'Autoimmune',
  'IBS', 'Thyroid Issues', 'Liver Disease', 'Kidney Disease',
  'Obesity', 'Metabolic Syndrome', 'Depression', 'Anxiety',
  'Phenylketonuria (PKU)', 'Gluten Intolerance', 'Lactose Intolerance'
]

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat',
  'Soy', 'Fish', 'Shellfish', 'Sesame', 'Sulfites'
]

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
  'Kosher', 'Halal', 'Keto', 'Paleo', 'Low-FODMAP'
]

export function HealthProfileForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    activity_level: '',
    conditions: [] as string[],
    allergies: [] as string[],
    dietary_restrictions: [] as string[],
    sodium_limit: '2300',
    sugar_limit: '50',
    sat_fat_limit: '20'
  })

  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          age: data.age?.toString() || '',
          weight: data.weight?.toString() || '',
          height: data.height?.toString() || '',
          gender: data.gender || '',
          activity_level: data.activity_level || '',
          conditions: data.conditions?.map((c: any) => c.name) || [],
          allergies: data.allergies || [],
          dietary_restrictions: data.dietary_restrictions || [],
          sodium_limit: data.daily_budgets?.sodium_mg?.toString() || '2300',
          sugar_limit: data.daily_budgets?.sugar_g?.toString() || '50',
          sat_fat_limit: data.daily_budgets?.saturated_fat_g?.toString() || '20'
        })
      }
    } catch (error) {
      console.error('Load profile error:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const conditionsFormatted = profile.conditions.map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        severity: 'managed'
      }))

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          age: profile.age ? parseInt(profile.age) : null,
          weight: profile.weight ? parseInt(profile.weight) : null,
          height: profile.height ? parseInt(profile.height) : null,
          gender: profile.gender || null,
          activity_level: profile.activity_level || null,
          conditions: conditionsFormatted,
          allergies: profile.allergies,
          dietary_restrictions: profile.dietary_restrictions,
          daily_budgets: {
            sodium_mg: parseInt(profile.sodium_limit) || 2300,
            sugar_g: parseInt(profile.sugar_limit) || 50,
            saturated_fat_g: parseInt(profile.sat_fat_limit) || 20,
            caffeine_mg: 400,
            alcohol_g: 0,
            custom_limits: {}
          }
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile saved successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const toggleItem = (item: string, list: string[]) => {
    if (list.includes(item)) {
      return list.filter(i => i !== item)
    }
    return [...list, item]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-400">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-health-blue" />
            <CardTitle>Personal Information</CardTitle>
          </div>
          <CardDescription>This helps us personalize your health analysis</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="25"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              value={profile.weight}
              onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="70"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input
              type="number"
              value={profile.height}
              onChange={(e) => setProfile({ ...profile, height: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="175"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
            <select
              value={profile.activity_level}
              onChange={(e) => setProfile({ ...profile, activity_level: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary (little to no exercise)</option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="active">Active (exercise 6-7 days/week)</option>
              <option value="very_active">Very Active (physical job + exercise)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Health Conditions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-health-red" />
            <CardTitle>Health Conditions</CardTitle>
          </div>
          <CardDescription>Select conditions for personalized risk alerts</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {COMMON_CONDITIONS.map(condition => (
            <button
              key={condition}
              onClick={() => setProfile({
                ...profile,
                conditions: toggleItem(condition, profile.conditions)
              })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                profile.conditions.includes(condition)
                  ? 'bg-red-100 text-red-700 border-2 border-red-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-health-yellow" />
            <CardTitle>Allergies</CardTitle>
          </div>
          <CardDescription>We&apos;ll warn you when products contain these</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.map(allergy => (
            <button
              key={allergy}
              onClick={() => setProfile({
                ...profile,
                allergies: toggleItem(allergy, profile.allergies)
              })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                profile.allergies.includes(allergy)
                  ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {allergy}
            </button>
          ))}
        </div>
      </Card>

      {/* Dietary Restrictions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-health-green" />
            <CardTitle>Dietary Restrictions</CardTitle>
          </div>
          <CardDescription>Filter products based on your diet</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map(diet => (
            <button
              key={diet}
              onClick={() => setProfile({
                ...profile,
                dietary_restrictions: toggleItem(diet, profile.dietary_restrictions)
              })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                profile.dietary_restrictions.includes(diet)
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {diet}
            </button>
          ))}
        </div>
      </Card>

      {/* Daily Budgets */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-health-blue" />
            <CardTitle>Daily Limits</CardTitle>
          </div>
          <CardDescription>Customize your daily nutritional targets</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sodium (mg)</label>
            <input
              type="number"
              value={profile.sodium_limit}
              onChange={(e) => setProfile({ ...profile, sodium_limit: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sugar (g)</label>
            <input
              type="number"
              value={profile.sugar_limit}
              onChange={(e) => setProfile({ ...profile, sugar_limit: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sat. Fat (g)</label>
            <input
              type="number"
              value={profile.sat_fat_limit}
              onChange={(e) => setProfile({ ...profile, sat_fat_limit: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      {message && (
        <Alert variant={message.type}>
          {message.text}
        </Alert>
      )}

      <Button
        onClick={saveProfile}
        loading={saving}
        fullWidth
        size="lg"
      >
        Save Health Profile
      </Button>
    </div>
  )
}
