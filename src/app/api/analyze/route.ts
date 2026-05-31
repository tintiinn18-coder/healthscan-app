import { NextResponse } from 'next/server'
import { analyzeProduct } from '@/lib/utils/healthAnalyzer'
import { createClient } from '@/lib/supabase/server'
import type { OFFProduct } from '@/types'

export async function POST(request: Request) {
  try {
    const { product, userId } = await request.json()

    if (!product || !product.code) {
      return NextResponse.json(
        { error: 'Invalid product data' },
        { status: 400 }
      )
    }

    // Get user profile if authenticated
    let userProfile = null
    if (userId) {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      userProfile = data
    }

    const analysis = analyzeProduct(product as OFFProduct, userProfile)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}
