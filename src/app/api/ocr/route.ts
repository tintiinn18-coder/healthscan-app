import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    // Convert to base64 for OCR.space free API (free tier: 500 requests/month)
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const ocrFormData = new FormData()
    ocrFormData.append('base64Image', `data:${mimeType};base64,${base64}`)
    ocrFormData.append('language', 'eng')
    ocrFormData.append('isOverlayRequired', 'false')
    ocrFormData.append('detectOrientation', 'true')
    ocrFormData.append('scale', 'true')
    ocrFormData.append('OCREngine', '2')

    const res = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { 'apikey': process.env.OCR_SPACE_API_KEY || 'helloworld' },
      body: ocrFormData
    })

    const data = await res.json()
    const text = data?.ParsedResults?.[0]?.ParsedText || ''

    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    console.error('OCR error:', error)
    return NextResponse.json({ error: 'OCR failed' }, { status: 500 })
  }
}
