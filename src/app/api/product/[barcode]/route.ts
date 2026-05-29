import { NextResponse } from 'next/server'
import { getProductByBarcode, userProductToOffProduct } from '@/lib/api/openfoodfacts'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  context: { params: Promise<{ barcode: string }> }
) {
  try {
    const { barcode } = await context.params

    if (!barcode || barcode.length < 8) {
      return NextResponse.json({ error: 'Invalid barcode' }, { status: 400 })
    }

    const offProduct = await getProductByBarcode(barcode)
    if (offProduct) {
      return NextResponse.json({
        product: offProduct,
        source: 'open_food_facts',
      })
    }

    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const currentUserId = userData.user?.id

    let userProduct = null

    const { data: verifiedProduct } = await supabase
      .from('user_products')
      .select('*')
      .eq('barcode', barcode)
      .eq('verified', true)
      .maybeSingle()

    userProduct = verifiedProduct

    if (!userProduct && currentUserId) {
      const { data: ownProduct } = await supabase
        .from('user_products')
        .select('*')
        .eq('barcode', barcode)
        .eq('submitted_by', currentUserId)
        .maybeSingle()
      userProduct = ownProduct
    }

    if (userProduct) {
      return NextResponse.json({
        product: userProductToOffProduct(userProduct),
        source: 'user_submission',
      })
    }

    return NextResponse.json(
      {
        error: 'Product not found in Open Food Facts. Add label details once and HealthScan can analyze it now.',
        needsManualEntry: true,
        barcode,
        hint: 'Many Indian packaged foods are not yet available in global barcode databases. You can still analyze the label by entering ingredients manually.',
      },
      { status: 404 }
    )
  } catch (error) {
    console.error('Product lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
