import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

serve(async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const { ingredients, userConditions, productName } = await req.json()

    if (!ingredients || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No ingredients provided' }),
        { status: 400, headers }
      )
    }

    const prompt = `You are a food safety and nutrition analyst. Analyze these ingredients for a product called "${productName || 'Unknown Product'}".

User health conditions: ${userConditions?.join(', ') || 'None specified'}
Ingredients: ${ingredients}

Provide a JSON response with this exact structure:
{
  "summary": "Brief 2-sentence summary of overall product quality",
  "concerns": [
    {
      "ingredient": "ingredient name",
      "risk": "low|medium|high",
      "explanation": "Why this might be concerning in 1-2 sentences",
      "relevantConditions": ["condition1", "condition2"],
      "scientificBasis": "Reference to study or agency (EFSA, FDA, IARC, WHO)"
    }
  ],
  "recommendations": ["specific actionable recommendation 1", "recommendation 2"],
  "overallRisk": "low|medium|high",
  "processingLevel": "minimally_processed|processed|ultra_processed",
  "nutritionalHighlights": ["positive aspect 1", "positive aspect 2"]
}

Rules:
- Be factual and cautious. Use "associated with" or "may increase risk" rather than "causes".
- Cite EFSA, FDA, IARC, WHO, or JECFA when possible.
- If no major concerns, say so clearly.
- For user conditions, explain WHY the ingredient is relevant to their specific condition.
- Keep explanations accessible to non-scientists.`

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'AI analysis failed', details: errorText }),
        { status: 502, headers }
      )
    }

    const data = await response.json()
    const analysisText = data.choices?.[0]?.message?.content

    if (!analysisText) {
      return new Response(
        JSON.stringify({ error: 'Empty AI response' }),
        { status: 502, headers }
      )
    }

    return new Response(analysisText, { headers })
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers }
    )
  }
})