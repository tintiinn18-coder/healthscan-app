import { NextResponse } from 'next/server'
import { searchAlternatives } from '@/lib/api/openfoodfacts'

export async function POST(request: Request) {
  try {
    const { category, excludeBrands, limit = 3 } = await request.json()

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    const alternatives = await searchAlternatives(category, excludeBrands || [], limit)

    return NextResponse.json(alternatives)
  } catch (error) {
    console.error('Alternatives API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alternatives' },
      { status: 500 }
    )
  }
}
