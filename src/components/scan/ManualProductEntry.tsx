'use client'

import { useMemo, useState } from 'react'
import { Loader2, Search, ChevronDown, Save } from 'lucide-react'
import type { ManualProductInput } from '@/types'

interface ManualProductEntryProps {
  onAnalyze: (input: ManualProductInput) => Promise<void>
  initialValues?: Partial<ManualProductInput>
  buttonLabel?: string
  helperText?: string
  showBarcodeField?: boolean
  showSaveOption?: boolean
  submitSource?: ManualProductInput['source']
}

const CATEGORIES = ['Snacks', 'Beverages', 'Dairy', 'Bakery', 'Instant Food', 'Sweets / Chocolate', 'Condiments', 'Breakfast Cereal', 'Frozen Food', 'Other']

export function ManualProductEntry({
  onAnalyze,
  initialValues,
  buttonLabel = 'Analyze Ingredients',
  helperText = 'Copy the ingredient list from the packet for the most useful result.',
  showBarcodeField = false,
  showSaveOption = false,
  submitSource = 'manual',
}: ManualProductEntryProps) {
  const [name, setName] = useState(initialValues?.productName || '')
  const [brand, setBrand] = useState(initialValues?.brand || '')
  const [barcode, setBarcode] = useState(initialValues?.barcode || '')
  const [ingredients, setIngredients] = useState(initialValues?.ingredientsText || '')
  const [category, setCategory] = useState(initialValues?.category || 'Snacks')
  const [saveToDatabase, setSaveToDatabase] = useState(Boolean(initialValues?.saveToDatabase))
  const [loading, setLoading] = useState(false)

  const [energyKcal, setEnergyKcal] = useState(String(initialValues?.nutriments?.['energy-kcal_100g'] ?? ''))
  const [protein, setProtein] = useState(String(initialValues?.nutriments?.proteins_100g ?? ''))
  const [carbs, setCarbs] = useState(String(initialValues?.nutriments?.carbohydrates_100g ?? ''))
  const [sugar, setSugar] = useState(String(initialValues?.nutriments?.sugars_100g ?? ''))
  const [fiber, setFiber] = useState(String(initialValues?.nutriments?.fiber_100g ?? ''))
  const [fat, setFat] = useState(String(initialValues?.nutriments?.fat_100g ?? ''))
  const [satFat, setSatFat] = useState(String(initialValues?.nutriments?.['saturated-fat_100g'] ?? ''))
  const [transFat, setTransFat] = useState(String(initialValues?.nutriments?.['trans-fat_100g'] ?? ''))
  const [sodium, setSodium] = useState(String(initialValues?.nutriments?.sodium_100g ?? ''))
  const [salt, setSalt] = useState(String(initialValues?.nutriments?.salt_100g ?? ''))

  const nutriments = useMemo(() => {
    const entries: Array<[string, string]> = [
      ['energy-kcal_100g', energyKcal],
      ['proteins_100g', protein],
      ['carbohydrates_100g', carbs],
      ['sugars_100g', sugar],
      ['fiber_100g', fiber],
      ['fat_100g', fat],
      ['saturated-fat_100g', satFat],
      ['trans-fat_100g', transFat],
      ['sodium_100g', sodium],
      ['salt_100g', salt],
    ]

    return entries.reduce<Record<string, number>>((acc, [key, value]) => {
      const parsed = Number(value)
      if (!Number.isNaN(parsed) && value !== '') {
        acc[key] = parsed
      }
      return acc
    }, {})
  }, [energyKcal, protein, carbs, sugar, fiber, fat, satFat, transFat, sodium, salt])

  const handleAnalyze = async () => {
    if (!ingredients.trim()) return
    setLoading(true)
    try {
      await onAnalyze({
        barcode: barcode.trim() || undefined,
        productName: name.trim() || (submitSource === 'ocr' ? 'Photo Scan Product' : 'Manual Product'),
        brand: brand.trim() || undefined,
        category,
        ingredientsText: ingredients.trim(),
        nutriments,
        source: submitSource,
        saveToDatabase,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-0.5">
          {submitSource === 'ocr' ? 'Review Extracted Ingredients' : 'Enter Product Details'}
        </h3>
        <p className="text-xs text-gray-500">{helperText}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={showBarcodeField ? '' : 'col-span-2'}>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Product Name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={submitSource === 'ocr' ? 'Photo Scan Product' : 'e.g. Haldiram Aloo Bhujia'}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
          />
        </div>

        {showBarcodeField && (
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Barcode</label>
            <input
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              placeholder="Prefilled if scanned"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            />
          </div>
        )}

        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Brand</label>
          <input
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            placeholder="Optional brand"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
        <div className="relative">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 appearance-none pr-8"
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Ingredients List</label>
        <textarea
          value={ingredients}
          onChange={(event) => setIngredients(event.target.value)}
          rows={6}
          placeholder="e.g. Wheat flour, edible vegetable oil, salt, flavour enhancer (E621), colour (E102)"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 resize-y"
        />
        <p className="text-xs text-gray-400 mt-1">Include E-numbers or additive names if they appear on the label.</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-600">Optional nutrition per 100g/ml</p>
        <div className="grid grid-cols-2 gap-3">
          <NutrientField label="Calories" value={energyKcal} onChange={setEnergyKcal} />
          <NutrientField label="Protein (g)" value={protein} onChange={setProtein} />
          <NutrientField label="Carbohydrates (g)" value={carbs} onChange={setCarbs} />
          <NutrientField label="Sugar (g)" value={sugar} onChange={setSugar} />
          <NutrientField label="Fiber (g)" value={fiber} onChange={setFiber} />
          <NutrientField label="Total fat (g)" value={fat} onChange={setFat} />
          <NutrientField label="Sat. fat (g)" value={satFat} onChange={setSatFat} />
          <NutrientField label="Trans fat (g)" value={transFat} onChange={setTransFat} />
          <NutrientField label="Sodium (g)" value={sodium} onChange={setSodium} />
          <NutrientField label="Salt (g)" value={salt} onChange={setSalt} />
        </div>
      </div>

      {showSaveOption && (
        <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
          <input
            type="checkbox"
            checked={saveToDatabase}
            onChange={(event) => setSaveToDatabase(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-700 flex items-center gap-2">
            <Save className="h-4 w-4 text-gray-500" />
            Save this product to your HealthScan label library
          </span>
        </label>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!ingredients.trim() || loading}
        className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {submitSource === 'ocr' ? 'Analyzing ingredients...' : 'Analyzing...'}
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            {buttonLabel}
          </>
        )}
      </button>
    </div>
  )
}

function NutrientField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
      />
    </div>
  )
}
