const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export interface GroqIngredientCleanup {
  cleanedIngredients: string[]
  detectedAdditives: string[]
  allergens: string[]
  concerns: string[]
  summary: string
  confidence: 'low' | 'medium' | 'high'
  needsManualReview: boolean
}

function safeParseCleanup(content: string): GroqIngredientCleanup | null {
  try {
    const parsed = JSON.parse(content)
    if (
      !Array.isArray(parsed.cleanedIngredients) ||
      !Array.isArray(parsed.detectedAdditives) ||
      !Array.isArray(parsed.allergens) ||
      !Array.isArray(parsed.concerns) ||
      typeof parsed.summary !== 'string' ||
      !['low', 'medium', 'high'].includes(parsed.confidence)
    ) {
      return null
    }

    return {
      cleanedIngredients: parsed.cleanedIngredients.map(String),
      detectedAdditives: parsed.detectedAdditives.map(String),
      allergens: parsed.allergens.map(String),
      concerns: parsed.concerns.map(String),
      summary: parsed.summary,
      confidence: parsed.confidence,
      needsManualReview: Boolean(parsed.needsManualReview),
    }
  } catch {
    return null
  }
}

export async function cleanupIngredientsWithGroq(rawText: string): Promise<GroqIngredientCleanup | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || !rawText.trim()) {
    return null
  }

  const prompt = [
    'You are analyzing a packaged food label for informational wellness guidance, not medical diagnosis.',
    'Use cautious language.',
    'Avoid definitive disease claims.',
    'Say "associated with", "may be a concern", or "check with a clinician" when appropriate.',
    'Return JSON only.',
    '',
    'Extract likely ingredients from this OCR or manual text.',
    'Ignore obvious packaging noise where possible, but preserve uncertainty.',
    '',
    'Return this exact JSON shape:',
    '{',
    '  "cleanedIngredients": [],',
    '  "detectedAdditives": [],',
    '  "allergens": [],',
    '  "concerns": [],',
    '  "summary": "",',
    '  "confidence": "low|medium|high",',
    '  "needsManualReview": true',
    '}',
    '',
    `RAW_TEXT: ${rawText}`,
  ].join('\n')

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        max_tokens: 900,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (typeof content !== 'string') {
      return null
    }

    return safeParseCleanup(content)
  } catch {
    return null
  }
}
