import { describe, it, expect } from 'vitest';
import { GeminiService } from '../server/src/geminiService.js';
import { BridgeAnalysisResultSchema } from '../server/src/schema.js';

describe('Error Handling and Fallback Guardrails', () => {
  it('detects missing Gemini API key when environment variable is unset', async () => {
    // Instantiate with no key
    const prevKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const service = new GeminiService();
    expect(service.hasValidKey()).toBe(false);

    // Calling analyze without key throws clear actionable error
    await expect(service.analyzeMultimodal('Road damaged')).rejects.toThrow(
      /GEMINI_API_KEY is not configured on the server/
    );

    if (prevKey) process.env.GEMINI_API_KEY = prevKey;
  });

  it('rejects malformed model output that violates the Zod contract', () => {
    const malformedOutput = {
      request_type: 'Unknown',
      // missing summary, missing priority, missing extracted_facts
    };

    const parsed = BridgeAnalysisResultSchema.safeParse(malformedOutput);
    expect(parsed.success).toBe(false);
  });

  it('cleans markdown code fences around raw model JSON responses', () => {
    const rawFencedJson = `\`\`\`json
{
  "id": "bridge-fenced-1",
  "timestamp": "2026-10-23T06:00:00.000Z",
  "is_demo": false,
  "request_type": "Water Main Break",
  "category_tag": "Public Safety & Infrastructure",
  "summary": "Pressurized water main fractured on 5th Ave.",
  "extracted_facts": [],
  "location": { "value": "5th Ave", "status": "reported" },
  "missing_information": [],
  "uncertainty_notes": [],
  "priority": { "level": "urgent", "reason": "Water pressure loss and roadway undermining." },
  "recommended_actions": [
    { "id": "act-1", "title": "Shut Off Gate Valve", "description": "Dispatch water utility emergency crew.", "requires_confirmation": true }
  ],
  "human_review_required": true,
  "emergency_detected": false,
  "emergency_guidance": null
}
\`\`\``;

    let cleaned = rawFencedJson.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    const parsed = JSON.parse(cleaned);
    const validated = BridgeAnalysisResultSchema.safeParse(parsed);
    expect(validated.success).toBe(true);
    if (validated.success) {
      expect(validated.data.request_type).toBe('Water Main Break');
    }
  });
});
