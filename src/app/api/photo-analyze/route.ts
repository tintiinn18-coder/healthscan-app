import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const profileJson = formData.get('profile') as string | null

    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    // Convert to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const profileContext = profileJson
      ? `\n\nUser health profile: ${profileJson}. Tailor risks to these conditions specifically.`
      : ''

    // Call Groq Vision API - free, fast, supports image reading
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64}` }
              },
              {
                type: 'text',
                text: `You are a food health analyst. Analyze this food product image.

Extract and analyze everything visible: product name, brand, ingredients list, nutrition facts, E-numbers, additives, serving size, and any health claims.

Then provide a complete health analysis in this EXACT JSON format (no markdown, no extra text):
{
  "product_name": "detected product name or 'Unknown Product'",
  "brand": "detected brand or ''",
  "ingredients_found": ["list", "of", "ingredients"],
  "additives_found": [
    {
      "code": "E621 or name",
      "name": "Monosodium Glutamate",
      "risk_level": "high|medium|low",
      "concern": "brief health concern"
    }
  ],
  "nutrition_per_100g": {
    "calories": 0,
    "sugar_g": 0,
    "sodium_mg": 0,
    "fat_g": 0,
    "saturated_fat_g": 0,
    "fiber_g": 0,
    "protein_g": 0
  },
  "health_score": 0,
  "risk_level": "green|yellow|red",
  "nova_group": 1,
  "warnings": ["list of specific health warnings"],
  "personalized_risks": ["condition-specific risks if profile provided"],
  "recommendations": ["actionable recommendations"],
  "summary": "2-3 sentence plain English summary of health impact",
  "is_vegetarian": true,
  "is_vegan": false,
  "allergens": ["list of detected allergens"],
  "indian_product_detected": true,
  "fssai_number": "detected FSSAI number or null"
}

Health score guide: 
- Start at 70, subtract for ultra-processing (NOVA4=-40, NOVA3=-20), high sugar (-15), high sodium (-15), high sat fat (-12), each high-risk additive (-15), each medium-risk additive (-7)
- Add for organic (+5), high fiber (+5), high protein (+3)
- Clamp to 0-100. Be realistic: chips/namkeen should score 35-50, cola 15-25, fresh juice 60-75.${profileContext}

IMPORTANT: If you cannot clearly read the label or it's not a food product, still return valid JSON with what you can determine, and note limitations in the summary.`
              }
            ]
          }
        ]
      })
    })

    if (!groqRes.ok) {
      const err = await groqRes.text()
      console.error('Groq vision error:', err)
      return NextResponse.json({ error: 'AI analysis failed. Check your GROQ_API_KEY.' }, { status: 500 })
    }

    const groqData = await groqRes.json()
    const rawText = groqData.choices?.[0]?.message?.content || ''

    // Parse JSON from response
    let analysis
    try {
      // Strip any markdown code blocks if present
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleaned)
    } catch {
      // If JSON parse fails, return the raw text for debugging
      return NextResponse.json({
        error: 'Could not parse AI response',
        raw: rawText.slice(0, 500)
      }, { status: 500 })
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Photo analyze error:', error)
    return NextResponse.json({ error: 'Server error during analysis' }, { status: 500 })
  }
}

export const maxDuration = 30
