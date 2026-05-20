import type { OFFProduct, AlternativeProduct } from '@/types'

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2'
const USER_AGENT = 'HealthScanApp/1.0 (contact@healthscan.app)'

export async function getProductByBarcode(barcode: string): Promise<OFFProduct | null> {
  try {
    const res = await fetch(`${OFF_API_BASE}/product/${barcode}.json`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!res.ok) {
      console.error(`OFF API error: ${res.status} for barcode ${barcode}`)
      return null
    }

    const data = await res.json()

    if (data.status !== 1 || !data.product) {
      console.warn(`Product not found: ${barcode}`)
      return null
    }

    return data.product as OFFProduct
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function searchAlternatives(
  category: string, 
  excludeBrands: string[] = [],
  limit: number = 5
): Promise<AlternativeProduct[]> {
  try {
    const fields = [
      'product_name',
      'brands',
      'image_url',
      'nutriscore_grade',
      'nutrition_grades',
      'code',
      'nutriments'
    ].join(',')

    const params = new URLSearchParams({
      categories_tags: category,
      fields: fields,
      page_size: String(limit * 2), // Fetch extra to filter
      sort_by: 'nutrition_grades',
      nutriscore_grade: 'a,b', // Only A or B grade products
      labels_tags: 'en:organic,en:no-additives' // Prefer organic/no-additives
    })

    const res = await fetch(`${OFF_API_BASE}/search?${params}`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      }
    })

    if (!res.ok) return []

    const data = await res.json()
    const products = data.products || []

    // Filter out excluded brands and map to AlternativeProduct
    return products
      .filter((p: any) => !excludeBrands.some(b => p.brands?.toLowerCase().includes(b.toLowerCase())))
      .slice(0, limit)
      .map((p: any) => ({
        code: p.code,
        product_name: p.product_name || 'Unknown Product',
        brands: p.brands || 'Unknown Brand',
        image_url: p.image_url || '',
        health_score: calculateQuickScore(p),
        nutrition_grades: p.nutriscore_grade || p.nutrition_grades,
        price_estimate: 'Price varies by store',
        availability: 'Check local retailers'
      }))
  } catch (error) {
    console.error('Error searching alternatives:', error)
    return []
  }
}

export async function searchByName(query: string, limit: number = 10): Promise<OFFProduct[]> {
  try {
    const params = new URLSearchParams({
      search_terms: query,
      fields: 'code,product_name,brands,image_url,nutriments,additives_tags,ingredients_text',
      page_size: String(limit),
      sort_by: 'popularity'
    })

    const res = await fetch(`${OFF_API_BASE}/search?${params}`, {
      headers: { 'User-Agent': USER_AGENT }
    })

    if (!res.ok) return []

    const data = await res.json()
    return data.products || []
  } catch (error) {
    console.error('Error searching by name:', error)
    return []
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${OFF_API_BASE}/categories?limit=100`, {
      headers: { 'User-Agent': USER_AGENT }
    })

    if (!res.ok) return []

    const data = await res.json()
    return data.tags?.map((t: any) => t.id) || []
  } catch (error) {
    return []
  }
}

function calculateQuickScore(product: any): number {
  let score = 70 // Base score

  const nutriments = product.nutriments || {}
  const grade = (product.nutriscore_grade || product.nutrition_grades || '').toLowerCase()

  // Nutri-Score bonus
  if (grade === 'a') score += 20
  else if (grade === 'b') score += 10
  else if (grade === 'd') score -= 10
  else if (grade === 'e') score -= 20

  // Nutrition penalties
  if (nutriments.sugars_100g > 20) score -= 15
  if (nutriments.sodium_100g > 0.6) score -= 15
  if (nutriments.saturated_fat_100g > 5) score -= 10

  // Additive penalty
  const additives = product.additives_tags || []
  score -= additives.length * 3

  return Math.max(0, Math.min(100, score))
}

export function extractCategory(product: OFFProduct): string {
  const categories = product.categories_tags || []
  if (categories.length > 0) {
    // Get the most specific category (usually last in array)
    return categories[categories.length - 1].replace('en:', '')
  }
  return 'general'
}

export function getProductImageUrl(product: OFFProduct, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (size === 'small' && product.image_small_url) {
    return product.image_small_url
  }
  return product.image_url || '/icons/placeholder-product.png'
}
