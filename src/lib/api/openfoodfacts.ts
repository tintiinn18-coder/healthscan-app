import type { OFFProduct, AlternativeProduct } from '@/types'

const USER_AGENT = 'HealthScanApp/1.0 (tintiinn18@gmail.com)'

// Try multiple OFF regional APIs for better India coverage
const OFF_ENDPOINTS = [
  'https://world.openfoodfacts.org/api/v2',
  'https://in.openfoodfacts.org/api/v2',
]

export async function getProductByBarcode(barcode: string): Promise<OFFProduct | null> {
  for (const base of OFF_ENDPOINTS) {
    try {
      const res = await fetch(`${base}/product/${barcode}.json`, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
        next: { revalidate: 3600 }
      })
      if (!res.ok) continue
      const data = await res.json()
      if (data.status === 1 && data.product && data.product.product_name) {
        return normalizeProduct(data.product, barcode)
      }
    } catch { continue }
  }
  return null
}

function normalizeProduct(p: any, barcode: string): OFFProduct {
  return {
    ...p,
    code: p.code || barcode,
    product_name: p.product_name || p.product_name_en || p.product_name_hi || 'Unknown Product',
    brands: p.brands || p.brand_owner || '',
    ingredients_text: p.ingredients_text || p.ingredients_text_en || '',
    additives_tags: p.additives_tags || [],
    allergens_tags: p.allergens_tags || [],
    nutriments: p.nutriments || {},
    image_url: p.image_front_url || p.image_url || p.image_small_url || '',
    categories: p.categories || '',
    categories_tags: p.categories_tags || [],
    labels_tags: p.labels_tags || [],
    nutrition_grades: p.nutrition_grades || p.nutriscore_grade || '',
    nova_group: p.nova_group,
    ecoscore_grade: p.ecoscore_grade,
    quantity: p.quantity || '',
    serving_size: p.serving_size || '',
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
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/search?${params}`, {
      headers: { 'User-Agent': USER_AGENT }
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.products || [])
      .filter((p: any) => p.product_name && !excludeBrands.some(b => p.brands?.toLowerCase().includes(b.toLowerCase())))
      .slice(0, limit)
      .map((p: any) => ({
        code: p.code,
        product_name: p.product_name,
        brands: p.brands || '',
        image_url: p.image_url || '',
        health_score: calculateQuickScore(p),
        nutrition_grades: p.nutriscore_grade || p.nutrition_grades || '',
        categories: p.categories || '',
        price_estimate: 'Price varies by store',
        availability: 'Check local retailers'
      }))
  } catch { return [] }
}

export async function searchByName(query: string, limit: number = 10): Promise<OFFProduct[]> {
  try {
    const params = new URLSearchParams({
      search_terms: query,
      fields: 'code,product_name,brands,image_url,nutriments,additives_tags,ingredients_text',
      page_size: String(limit),
      sort_by: 'popularity'
    })
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/search?${params}`, {
      headers: { 'User-Agent': USER_AGENT }
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.products || []).map((p: any) => normalizeProduct(p, p.code))
  } catch { return [] }
}

function calculateQuickScore(product: any): number {
  let score = 70
  const nutriments = product.nutriments || {}
  const grade = (product.nutriscore_grade || product.nutrition_grades || '').toLowerCase()
  if (grade === 'a') score += 20
  else if (grade === 'b') score += 10
  else if (grade === 'd') score -= 10
  else if (grade === 'e') score -= 20
  if (nutriments.sugars_100g > 20) score -= 15
  if (nutriments.sodium_100g > 0.6) score -= 15
  if (nutriments.saturated_fat_100g > 5) score -= 10
  score -= (product.additives_tags || []).length * 3
  return Math.max(0, Math.min(100, score))
}

export function extractCategory(product: OFFProduct): string {
  const categories = product.categories_tags || []
  return categories.length > 0 ? categories[categories.length - 1].replace('en:', '') : 'general'
}

export function getProductImageUrl(product: OFFProduct): string {
  return product.image_url || product.image_small_url || ''
}
