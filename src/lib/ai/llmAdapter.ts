import { FDPGeneratorAgent, type GeneratedFDP } from './fdpGenerator';

export class LLMAdapter {
  static isLLMEnabled(): boolean {
    return (
      process.env.ENABLE_LLM === 'true' &&
      !!process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
    );
  }

  static async generateFDPWithFallback(
    prompt: string,
    departmentCode: string = 'CSE',
    durationDays: number = 3
  ): Promise<GeneratedFDP> {
    if (!this.isLLMEnabled()) {
      // Deterministic expert engine
      return FDPGeneratorAgent.generateFromPrompt(prompt, departmentCode, durationDays);
    }

    try {
      // If LLM enabled, call Google Gemini API
      const apiKey = process.env.GEMINI_API_KEY;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const systemPrompt = `You are Agent 27: Faculty Development Programme & Workshop Agent.
Synthesize an accreditation-compliant, outcome-based academic FDP proposal based on the prompt.
Respond ONLY with valid JSON matching:
{
  "title": string,
  "description": string,
  "event_type": "FDP" | "WORKSHOP",
  "objectives": string,
  "target_audience": string,
  "eligibility": string,
  "duration_hours": number,
  "capacity": number,
  "delivery_mode": "HYBRID",
  "venue": string,
  "expected_outcomes": string,
  "learning_outcomes": string,
  "estimated_budget": number,
  "sessions": [
    {
      "day_number": number,
      "title": string,
      "description": string,
      "start_time": string,
      "end_time": string,
      "learning_objective": string
    }
  ]
}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt} for Department ${departmentCode}, duration: ${durationDays} days.` }] }],
        }),
      });

      if (!res.ok) {
        console.warn('[LLMAdapter] Gemini API request failed, falling back to deterministic engine.');
        return FDPGeneratorAgent.generateFromPrompt(prompt, departmentCode, durationDays);
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return FDPGeneratorAgent.generateFromPrompt(prompt, departmentCode, durationDays);
      }

      // Clean JSON markers if present
      const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        ...parsed,
        source_engine: 'GEMINI_LLM',
      };
    } catch (err) {
      console.warn('[LLMAdapter] Error in LLM generation, falling back to deterministic engine:', err);
      return FDPGeneratorAgent.generateFromPrompt(prompt, departmentCode, durationDays);
    }
  }
}
