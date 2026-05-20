import { NextResponse } from 'next/server'
import { getProductByBarcode } from '@/lib/api/openfoodfacts'

export async function GET(
  request: Request,
  { params }: { params: { barcode: string } }
) {
  try {
    const { barcode } = params

    if (!barcode || barcode.length < 8) {
      return NextResponse.json(
        { error: 'Invalid barcode' },
        { status: 400 }
      )
    }

    const product = await getProductByBarcode(barcode)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
