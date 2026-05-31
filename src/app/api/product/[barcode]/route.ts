import { NextResponse } from 'next/server'
import { getProductByBarcode } from '@/lib/api/openfoodfacts'

export async function GET(
  request: Request,
  context: { params: Promise<{ barcode: string }> }
) {
  try {
    const { barcode } = await context.params

    if (!barcode || barcode.length < 8) {
      return NextResponse.json({ error: 'Invalid barcode' }, { status: 400 })
    }

    const product = await getProductByBarcode(barcode)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found in database. Try manual entry or search by name.' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
