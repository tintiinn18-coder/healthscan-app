import type { HealthAnalysis } from '@/types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

class GroqClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GROQ_API_KEY not set. AI analysis will be disabled.');
    }
  }

  async analyzeIngredients(
    ingredients: string[],
    additives: string[],
    userConditions: string[] = [],
    userAllergies: string[] = []
  ): Promise<Partial<HealthAnalysis>> {
    if (!this.apiKey) {
      return {
        summary: 'AI analysis unavailable. Using local database only.',
        recommendations: ['Enable AI analysis for deeper insights.'],
      };
    }

    const prompt = `You are a food safety and nutrition analyst. Analyze these ingredients for health risks.

INGREDIENTS: ${ingredients.join(', ')}
ADDITIVES: ${additives.join(', ')}
USER HEALTH CONDITIONS: ${userConditions.join(', ') || 'None'}
USER ALLERGIES: ${userAllergies.join(', ') || 'None'}

Provide a JSON response with this exact structure:
{
  "summary": "Brief 2-sentence summary of overall health impact",
  "concerns": [
    {
      "ingredient": "ingredient name",
      "risk": "low|medium|high",
      "explanation": "Why this might be concerning, with cautious language",
      "relevantConditions": ["condition1", "condition2"]
    }
  ],
  "recommendations": ["recommendation1", "recommendation2"],
  "overallRisk": "low|medium|high",
  "nutritionalNotes": "Any important nutritional considerations"
}

Rules:
- Use cautious language: "associated with" or "may increase risk" not "causes"
- Reference scientific consensus where possible
- Be specific about which conditions are affected
- Keep explanations factual and educational
- Do not make definitive medical diagnoses`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from Groq');
      }

      const parsed = JSON.parse(content);

      return {
        summary: parsed.summary,
        recommendations: parsed.recommendations,
        // Map AI concerns to our format
        personalized_risks: parsed.concerns?.map((c: any) => ({
          condition: c.relevantConditions?.[0] || 'general',
          severity: c.risk,
          explanation: `${c.ingredient}: ${c.explanation}`,
          source: 'AI Analysis (Groq)',
        })) || [],
      };
    } catch (error) {
      console.error('Groq analysis error:', error);
      return {
        summary: 'AI analysis failed. Using local database only.',
        recommendations: ['Try again later for AI-powered insights.'],
      };
    }
  }

  async generateAlternativeSuggestions(
    productName: string,
    category: string,
    healthConcerns: string[]
  ): Promise<string[]> {
    if (!this.apiKey) return [];

    const prompt = `Suggest 3 healthier alternatives to "${productName}" in the "${category}" category.

Health concerns to avoid: ${healthConcerns.join(', ')}

Return ONLY a JSON array of objects:
[
  {
    "suggestion": "What to look for instead",
    "reason": "Why this is better"
  }
]`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 800,
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      const parsed = JSON.parse(content);

      return parsed.map((s: any) => `${s.suggestion}: ${s.reason}`);
    } catch {
      return [];
    }
  }
}

export const groqClient = new GroqClient();
