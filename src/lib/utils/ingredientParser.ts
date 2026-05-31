import type { OFFProduct } from '@/types'

export function extractAdditiveTagsFromText(text: string): string[] {
  const tags: string[] = []
  const eNumberRegex = /\bE\s*(\d{3}[a-z]?)\b/gi
  let match: RegExpExecArray | null

  while ((match = eNumberRegex.exec(text)) !== null) {
    tags.push(`en:e${match[1].toLowerCase()}`)
  }

  const commonNames: Record<string, string> = {
    msg: 'en:e621',
    'monosodium glutamate': 'en:e621',
    aspartame: 'en:e951',
    saccharin: 'en:e954',
    sucralose: 'en:e955',
    'acesulfame k': 'en:e950',
    tartrazine: 'en:e102',
    quinoline: 'en:e104',
    'sunset yellow': 'en:e110',
    carmoisine: 'en:e122',
    ponceau: 'en:e124',
    'allura red': 'en:e129',
    'sodium benzoate': 'en:e211',
    'potassium sorbate': 'en:e202',
    bha: 'en:e320',
    bht: 'en:e321',
    carrageenan: 'en:e407',
    'xanthan gum': 'en:e415',
    'sodium nitrite': 'en:e250',
    'sodium nitrate': 'en:e251',
    'calcium propionate': 'en:e282',
  }

  const lower = text.toLowerCase()
  for (const [name, tag] of Object.entries(commonNames)) {
    if (lower.includes(name) && !tags.includes(tag)) {
      tags.push(tag)
    }
  }

  return Array.from(new Set(tags))
}

export function extractAllergenTagsFromText(text: string): string[] {
  const tags: string[] = []
  const lower = text.toLowerCase()

  const allergenMap: Record<string, string> = {
    wheat: 'en:gluten',
    gluten: 'en:gluten',
    barley: 'en:gluten',
    rye: 'en:gluten',
    milk: 'en:milk',
    dairy: 'en:milk',
    lactose: 'en:milk',
    whey: 'en:milk',
    casein: 'en:milk',
    egg: 'en:eggs',
    peanut: 'en:peanuts',
    soy: 'en:soybeans',
    'tree nut': 'en:nuts',
    almond: 'en:nuts',
    cashew: 'en:nuts',
    pistachio: 'en:nuts',
    fish: 'en:fish',
    shellfish: 'en:crustaceans',
    sesame: 'en:sesame-seeds',
    sulfite: 'en:sulphur-dioxide-and-sulphites',
    sulphite: 'en:sulphur-dioxide-and-sulphites',
  }

  for (const [word, tag] of Object.entries(allergenMap)) {
    if (lower.includes(word) && !tags.includes(tag)) {
      tags.push(tag)
    }
  }

  return tags
}

export function buildSyntheticProduct(input: {
  barcode?: string
  productName: string
  brand?: string
  category?: string
  ingredientsText: string
  nutriments?: Record<string, number>
  source?: string
}): OFFProduct {
  const category = input.category || 'Other'

  return {
    code: input.barcode || `manual_${Date.now()}`,
    product_name: input.productName.trim() || 'Manual Product',
    brands: input.brand?.trim() || '',
    ingredients_text: input.ingredientsText.trim(),
    additives_tags: extractAdditiveTagsFromText(input.ingredientsText),
    allergens_tags: extractAllergenTagsFromText(input.ingredientsText),
    nutriments: input.nutriments || {},
    image_url: '',
    categories: category,
    categories_tags: [`en:${category.toLowerCase().replace(/\s+/g, '-')}`],
    labels_tags: [],
    source: input.source || 'manual',
  }
}
