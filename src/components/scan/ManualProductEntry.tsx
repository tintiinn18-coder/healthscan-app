'use client'

import { useState } from 'react'
import { Loader2, Search, ChevronDown } from 'lucide-react'
import { analyzeProduct } from '@/lib/utils/healthAnalyzer'
import type { OFFProduct, HealthAnalysis, UserHealthProfile } from '@/types'

interface ManualProductEntryProps {
  onResult: (product: OFFProduct, analysis: HealthAnalysis) => void
  userProfile?: Partial<UserHealthProfile> | null
}

const CATEGORIES = ['Snacks', 'Beverages', 'Dairy', 'Bakery', 'Instant Food', 'Sweets / Chocolate', 'Condiments', 'Breakfast Cereal', 'Frozen Food', 'Other']

export function ManualProductEntry({ onResult, userProfile }: ManualProductEntryProps) {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [category, setCategory] = useState('Snacks')
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!name.trim() || !ingredients.trim()) return
    setLoading(true)
    try {
      // Build a synthetic OFFProduct from manual input
      const syntheticProduct: OFFProduct = {
        code: `manual_${Date.now()}`,
        product_name: name.trim(),
        brands: brand.trim(),
        ingredients_text: ingredients.trim(),
        additives_tags: extractAdditiveTagsFromText(ingredients),
        allergens_tags: extractAllergenTagsFromText(ingredients),
        nutriments: {},
        image_url: '',
        categories: category,
        categories_tags: [`en:${category.toLowerCase().replace(/\s/g, '-')}`],
        labels_tags: [],
      }

      const analysis = analyzeProduct(syntheticProduct, userProfile as UserHealthProfile || null)
      onResult(syntheticProduct, analysis)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-0.5">Enter Product Manually</h3>
        <p className="text-xs text-gray-400">For products not found by barcode scan</p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Product Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Parle-G Biscuits"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Brand</label>
            <input
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder="e.g. Parle"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
          <div className="relative">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 appearance-none pr-8"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Ingredients List * <span className="font-normal text-gray-400">(copy from the packet)</span></label>
          <textarea
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            placeholder="e.g. Wheat flour, Sugar, Vegetable oil, Salt, Baking soda, Artificial flavour (E621), Colour (E102)..."
            rows={4}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">Tip: Include any E-numbers you see (e.g. E621, E102) for better analysis</p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!name.trim() || !ingredients.trim() || loading}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analysing...</> : <><Search className="h-4 w-4" /> Analyse Ingredients</>}
        </button>
      </div>
    </div>
  )
}

// Extract E-number additive tags from raw ingredient text
function extractAdditiveTagsFromText(text: string): string[] {
  const tags: string[] = []
  const eNumRegex = /\bE\s*(\d{3}[a-z]?)\b/gi
  let match
  while ((match = eNumRegex.exec(text)) !== null) {
    tags.push(`en:e${match[1].toLowerCase()}`)
  }
  // Common name mappings
  const commonNames: Record<string, string> = {
    'msg': 'en:e621', 'monosodium glutamate': 'en:e621',
    'aspartame': 'en:e951', 'saccharin': 'en:e954',
    'tartrazine': 'en:e102', 'sunset yellow': 'en:e110',
    'carmoisine': 'en:e122', 'allura red': 'en:e129',
    'sodium benzoate': 'en:e211', 'potassium sorbate': 'en:e202',
    'bha': 'en:e320', 'bht': 'en:e321',
    'carrageenan': 'en:e407', 'xanthan gum': 'en:e415',
  }
  const lower = text.toLowerCase()
  for (const [name, tag] of Object.entries(commonNames)) {
    if (lower.includes(name) && !tags.includes(tag)) tags.push(tag)
  }
  return Array.from(new Set(tags))
}

function extractAllergenTagsFromText(text: string): string[] {
  const tags: string[] = []
  const lower = text.toLowerCase()
  const allergenMap: Record<string, string> = {
    'wheat': 'en:gluten', 'gluten': 'en:gluten', 'barley': 'en:gluten', 'rye': 'en:gluten',
    'milk': 'en:milk', 'dairy': 'en:milk', 'lactose': 'en:milk', 'whey': 'en:milk',
    'egg': 'en:eggs', 'peanut': 'en:peanuts', 'soy': 'en:soybeans',
    'tree nut': 'en:nuts', 'almond': 'en:nuts', 'cashew': 'en:nuts',
    'fish': 'en:fish', 'shellfish': 'en:crustaceans', 'sesame': 'en:sesame-seeds',
    'sulfite': 'en:sulphur-dioxide-and-sulphites', 'sulphite': 'en:sulphur-dioxide-and-sulphites',
  }
  for (const [word, tag] of Object.entries(allergenMap)) {
    if (lower.includes(word) && !tags.includes(tag)) tags.push(tag)
  }
  return tags
}
