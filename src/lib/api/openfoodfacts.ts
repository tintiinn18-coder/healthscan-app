import type { OFFProduct, AlternativeProduct } from '@/types'

const USER_AGENT = 'HealthScanApp/1.0 (tintiinn18@gmail.com)'
const OFF_ENDPOINTS = [
  'https://world.openfoodfacts.org/api/v2',
  'https://in.openfoodfacts.org/api/v2',
]

export async function getProductByBarcode(barcode: string): Promise<OFFProduct | null> {
  for (const base of OFF_ENDPOINTS) {
    try {
      const response = await fetch(`${base}/product/${barcode}.json`, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        next: { revalidate: 3600 },
      })

      if (!response.ok) continue

      const data = await response.json()
      if (data?.status === 1 && data?.product) {
        return normalizeProduct(data.product, barcode)
      }
    } catch {
      continue
    }
  }

  return null
}

export function normalizeProduct(product: any, barcode: string): OFFProduct {
  return {
    ...product,
    code: product.code || barcode,
    product_name: product.product_name || product.product_name_en || product.product_name_hi || 'Unknown Product',
    brands: product.brands || product.brand_owner || '',
    ingredients_text: product.ingredients_text || product.ingredients_text_en || '',
    additives_tags: product.additives_tags || [],
    allergens_tags: product.allergens_tags || [],
    nutriments: product.nutriments || {},
    image_url: product.image_front_url || product.image_url || product.image_small_url || '',
    image_small_url: product.image_small_url || '',
    categories: product.categories || '',
    categories_tags: product.categories_tags || [],
    labels_tags: product.labels_tags || [],
    nutrition_grades: product.nutrition_grades || product.nutriscore_grade || '',
    nova_group: product.nova_group,
    ecoscore_grade: product.ecoscore_grade,
    quantity: product.quantity || '',
    serving_size: product.serving_size || '',
    source: 'open_food_facts',
    source_label: 'Open Food Facts',
  }
}

export function userProductToOffProduct(product: {
  barcode?: string | null
  product_name: string
  brand?: string | null
  category?: string | null
  ingredients_text: string
  nutriments?: Record<string, number> | null
}): OFFProduct {
  const category = product.category || 'Other'

  return {
    code: product.barcode || `user_${Date.now()}`,
    product_name: product.product_name,
    brands: product.brand || '',
    ingredients_text: product.ingredients_text,
    additives_tags: [],
    allergens_tags: [],
    nutriments: product.nutriments || {},
    image_url: '',
    categories: category,
    categories_tags: [`en:${category.toLowerCase().replace(/\s+/g, '-')}`],
    labels_tags: [],
    source: 'user_submission',
    source_label: 'HealthScan user label entry',
  }
}

export async function searchAlternatives(
  category: string,
  excludeBrands: string[] = [],
  limit: number = 5
): Promise<AlternativeProduct[]> {
  try {
    const params = new URLSearchParams({
      categories_tags: category,
      fields: 'product_name,brands,image_url,nutriscore_grade,nutrition_grades,code,nutriments,additives_tags',
      page_size: String(limit * 2),
      sort_by: 'nutriscore_score',
    })

    const response = await fetch(`https://world.openfoodfacts.org/api/v2/search?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
    })

    if (!response.ok) return []

    const data = await response.json()
    return (data.products || [])
      .filter(
        (item: any) =>
          item.product_name &&
          !excludeBrands.some((brand) => item.brands?.toLowerCase().includes(brand.toLowerCase()))
      )
      .slice(0, limit)
      .map((item: any) => ({
        code: item.code,
        product_name: item.product_name,
        brands: item.brands || '',
        image_url: item.image_url || '',
        health_score: calculateQuickScore(item),
        nutrition_grades: item.nutriscore_grade || item.nutrition_grades || '',
        categories: item.categories || '',
        price_estimate: 'Price varies by store',
        availability: 'Check local retailers',
      }))
  } catch {
    return []
  }
}

function calculateQuickScore(product: any): number {
  let score = 70
  const nutriments = product.nutriments || {}
  const grade = (product.nutriscore_grade || product.nutrition_grades || '').toLowerCase()

  if (grade === 'a') score += 18
  else if (grade === 'b') score += 10
  else if (grade === 'd') score -= 10
  else if (grade === 'e') score -= 18

  if (nutriments.sugars_100g > 20) score -= 12
  if (nutriments.sodium_100g > 0.6) score -= 12
  if ((nutriments['saturated-fat_100g'] ?? nutriments.saturated_fat_100g) > 5) score -= 8
  score -= (product.additives_tags || []).length * 2

  return Math.max(0, Math.min(100, score))
}

export function extractCategory(product: OFFProduct): string {
  const categories = product.categories_tags || []
  return categories.length > 0 ? categories[categories.length - 1].replace('en:', '') : 'general'
}

export function getProductImageUrl(product: OFFProduct): string {
  return product.image_url || product.image_small_url || ''
}
