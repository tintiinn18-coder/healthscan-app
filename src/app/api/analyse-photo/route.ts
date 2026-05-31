import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const conditions = formData.get('conditions') as string || ''
    const allergies = formData.get('allergies') as string || ''

    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 })

    // Convert image to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const userContext = [
      conditions ? `Health conditions: ${conditions}` : '',
      allergies ? `Allergies: ${allergies}` : '',
    ].filter(Boolean).join('\n')

    const prompt = `You are an expert food safety analyst. Analyse this food product image thoroughly.

${userContext ? `IMPORTANT - User profile:\n${userContext}\n` : ''}

Look at the product packaging and extract ALL visible information:
- Product name and brand
- Ingredients list (read every ingredient carefully)
- Nutritional information (per 100g if visible)
- E-numbers / food additives
- Allergen warnings
- Any health claims or certifications

Then provide a comprehensive health analysis.

Respond ONLY with this exact JSON structure (no markdown, no extra text):
{
  "product_name": "Full product name",
  "brand": "Brand name",
  "ingredients_found": ["ingredient1", "ingredient2"],
  "additives_found": [{"code": "E102", "name": "Tartrazine", "risk": "medium", "concern": "Linked to hyperactivity in children"}],
  "nutrition_per_100g": {
    "calories": 0,
    "sugar_g": 0,
    "sodium_mg": 0,
    "fat_g": 0,
    "saturated_fat_g": 0,
    "fiber_g": 0,
    "protein_g": 0
  },
  "allergens_detected": ["milk", "wheat"],
  "processing_level": "ultra-processed",
  "nova_group": 4,
  "health_score": 45,
  "risk_level": "yellow",
  "personalized_warnings": ["Warning specific to user conditions if any"],
  "nutritional_warnings": ["🔴 HIGH SUGAR: 28g per 100g"],
  "summary": "2-sentence honest health summary. Do NOT use company marketing language.",
  "recommendations": ["Specific actionable recommendation"],
  "safe_for": [],
  "unsafe_for": [],
  "image_quality": "good"
}

Rules:
- health_score: 0-100. Be REALISTIC. Ultra-processed snacks: 25-50. Soft drinks: 10-25. Fresh food: 80-95.
- Do NOT repeat company health claims as facts
- If image is blurry or ingredients not visible, set image_quality to "poor" and do your best
- For Indian products: recognise common Indian brands (Haldiram's, Parle, Britannia, Amul, ITC, Nestle India, MDH, Everest, Dabur, Patanjali, Bisleri, Maaza, Frooti, Paper Boat)
- Flag MSG (ajinomoto), artificial colours (Sunset Yellow, Tartrazine), preservatives (sodium benzoate)
- For packaged Indian snacks: always apply NOVA 4 unless clearly unprocessed`

    // Use Groq Llama vision model
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
          ]
        }],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq vision error:', err)
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''

    // Parse JSON from response
    let parsed
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    } catch {
      return NextResponse.json({ error: 'Could not parse AI response', raw: content }, { status: 500 })
    }

    return NextResponse.json({ success: true, result: parsed })
  } catch (error) {
    console.error('Photo analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
