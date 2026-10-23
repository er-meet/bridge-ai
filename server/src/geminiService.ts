import { GoogleGenAI, Schema, ThinkingLevel, Type } from '@google/genai';
import { BridgeAnalysisResult, BridgeAnalysisResultSchema } from './schema.js';

const DEFAULT_GEMINI_TIMEOUT_MS = 120_000;

export interface MultimodalFile {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  size: number;
}

export const SYSTEM_INSTRUCTION = `You are BridgeAI, a responsible multimodal AI analysis engine designed for high-stakes societal benefit (incident reporting, disaster assistance, healthcare paperwork, public infrastructure, and accessibility).

Your mission is to act as a rigorous, universal bridge between human intent and complex response systems.
You transform messy, unstructured real-world inputs (text descriptions, photographs, voice recordings, official PDF documents) into structured, verifiable, and actionable intelligence.

STRICT OPERATIONAL PRINCIPLES:
1. TRUTHFULNESS & GROUNDING:
   - Extract ONLY facts directly supported by the provided text, imagery, audio, or document.
   - NEVER hallucinate or invent addresses, GPS coordinates, people, dates, medication dosages, or clinical diagnoses.
   - If an essential detail is not explicitly provided or visible, explicitly list it as "unknown" and flag it in "missing_information".
2. FACT STATUS CLASSIFICATION:
   Every extracted fact MUST have a status:
   - 'observed': Directly visible in an uploaded photograph or directly legible in an uploaded document.
   - 'reported': Stated by the human reporter in their text or audio recording, but not independently verified.
   - 'inferred': A logical conclusion derived from evidence (e.g. wet asphalt inferring rain).
   - 'unknown': Expected information that could not be determined from the inputs.
3. LOCATION RIGOR:
   - Location status:
     * 'confirmed_from_input': Explicit, validated address or coordinates clearly documented in official paperwork or verifiable metadata.
     * 'reported': Stated colloquially by user (e.g., "Oakridge near Elm").
     * 'inferred': Estimated from landmarks.
     * 'unknown': No location given.
4. UNCERTAINTY & LIMITATIONS:
   - Be brutally honest about what the input CANNOT prove.
   - A photograph of a pothole proves a road defect exists, but DOES NOT prove subsurface soil stability, nor does it verify that someone's tire ruptured there.
5. RESPONSIBLE AI & SAFETY GUARDRAILS:
   - NEVER pretend you contacted the police, fire department, hospital, or municipality.
   - All recommended actions must require human review/confirmation before consequential real-world dispatch.
   - IMMEDIATE DANGER: If input indicates imminent bodily peril, active structural collapse, or high-risk electrocution, set "emergency_detected" to true and provide urgent emergency guidance advising immediate dialing of local emergency services (e.g., 911).
   - HEALTHCARE BOUNDARIES: If analyzing medical paperwork, provide educational, plain-language comprehension only. Explicitly disclaim medical advice, do not diagnose, and advise consulting licensed healthcare practitioners.
6. PRACTICAL ACTIONS:
   - Provide concrete, prioritized next steps with clear titles and descriptions.

OUTPUT FORMAT:
You MUST output valid, parseable JSON conforming strictly to the requested schema. Do not include markdown code block backticks unless returning pure JSON.`;

// JSON schema for Gemini structured output
const GEMINI_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    request_type: {
      type: Type.STRING,
      description: 'The specific category and sub-category of the request (e.g. "Road Hazard", "Disaster Evacuation", "Discharge Summary Simplification")',
    },
    category_tag: {
      type: Type.STRING,
      description: 'High-level domain category: Public Safety & Infrastructure, Disaster Relief, Healthcare, or Municipal Service',
    },
    summary: {
      type: Type.STRING,
      description: 'Concise, plain-language synthesis of the situation and core human intent in 2-3 sentences.',
    },
    extracted_facts: {
      type: Type.ARRAY,
      description: 'List of granular facts extracted from the inputs with evidence sources and status.',
      items: {
        type: Type.OBJECT,
        properties: {
          field: { type: Type.STRING, description: 'Aspect or attribute name' },
          value: { type: Type.STRING, nullable: true, description: 'Extracted value or null if undetermined' },
          source: { type: Type.STRING, description: 'Specific input source where this was derived (e.g., "User audio recording", "Uploaded image", "PDF section 2")' },
          status: {
            type: Type.STRING,
            enum: ['observed', 'reported', 'inferred', 'unknown'],
            description: 'Whether directly observed, reported by citizen, inferred, or unknown',
          },
        },
        required: ['field', 'value', 'source', 'status'],
      },
    },
    location: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, nullable: true, description: 'Location string or null if absent' },
        status: {
          type: Type.STRING,
          enum: ['confirmed_from_input', 'reported', 'inferred', 'unknown'],
          description: 'Validation confidence level of the location',
        },
      },
      required: ['value', 'status'],
    },
    missing_information: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Key details absent from input that are vital for complete resolution.',
    },
    uncertainty_notes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Limitations, visual ambiguities, or unverified claims.',
    },
    priority: {
      type: Type.OBJECT,
      properties: {
        level: {
          type: Type.STRING,
          enum: ['low', 'moderate', 'urgent', 'needs_review'],
          description: 'Assessed urgency of response required',
        },
        reason: {
          type: Type.STRING,
          description: 'Clear, grounded justification for this priority level',
        },
      },
      required: ['level', 'reason'],
    },
    recommended_actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Short unique action identifier' },
          title: { type: Type.STRING, description: 'Actionable step title' },
          description: { type: Type.STRING, description: 'Operational instruction for the user or dispatcher' },
          requires_confirmation: { type: Type.BOOLEAN, description: 'True if human approval or manual dispatch is mandatory' },
        },
        required: ['id', 'title', 'description', 'requires_confirmation'],
      },
    },
    human_review_required: {
      type: Type.BOOLEAN,
      description: 'Must always be true for consequential safety or medical actions',
    },
    emergency_detected: {
      type: Type.BOOLEAN,
      description: 'True if the scenario poses immediate life safety or active hazard risks',
    },
    emergency_guidance: {
      type: Type.STRING,
      nullable: true,
      description: 'Explicit life safety warning text directing user to dial local emergency services if immediate peril exists',
    },
  },
  required: [
    'request_type',
    'category_tag',
    'summary',
    'extracted_facts',
    'location',
    'missing_information',
    'uncertainty_notes',
    'priority',
    'recommended_actions',
    'human_review_required',
    'emergency_detected',
  ],
};

/**
 * Check if the provided key is a placeholder or invalid format
 */
export function isPlaceholderKey(key: string | null | undefined): boolean {
  if (!key) return true;
  const trimmed = key.trim();
  if (trimmed.length < 20) return true;
  if (
    trimmed.includes('your_') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('TODO') ||
    trimmed.includes('xxx') ||
    trimmed === 'your_gemini_api_key_here' ||
    trimmed.endsWith('...')
  ) {
    return true;
  }
  return false;
}

export class GeminiService {
  private apiKey: string | null;
  private modelName: string;
  private genAIClient: GoogleGenAI | null = null;
  private timeoutMs: number;

  constructor() {
    const rawKey = process.env.GEMINI_API_KEY?.trim() || null;
    this.apiKey = isPlaceholderKey(rawKey) ? null : rawKey;
    
    this.modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';
    const configuredTimeout = Number.parseInt(process.env.GEMINI_TIMEOUT_MS || '', 10);
    this.timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : DEFAULT_GEMINI_TIMEOUT_MS;

    if (this.apiKey) {
      try {
        this.genAIClient = new GoogleGenAI({
          apiKey: this.apiKey,
          httpOptions: {
            timeout: this.timeoutMs,
            // A single retry helps recover from intermittent Gemini 5xx/504
            // deadline errors without multiplying the wait through many retries.
            retryOptions: { attempts: 2, initialDelay: 1, maxDelay: 2, jitter: 0.2 },
          },
        });
      } catch (err) {
        console.error('[GeminiService] Error initializing SDK clients:', err);
      }
    }
  }

  public hasValidKey(): boolean {
    return Boolean(this.apiKey && !isPlaceholderKey(this.apiKey));
  }

  public getModelName(): string {
    return this.modelName;
  }

  /**
   * Helper to format human-readable errors
   */
  private formatApiError(error: any): string {
    const msg = error?.message || String(error);
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
      return 'The configured GEMINI_API_KEY is invalid or unauthorized. Please verify your API key in the .env file or use Demo Mode.';
    }
    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
      return 'Gemini API quota or rate limit exceeded. Please wait a moment before retrying, or switch to Demo Mode.';
    }
    if (msg.includes('models/') && msg.includes('not found')) {
      return `The requested Gemini model "${this.modelName}" was not found or is unavailable. Please check your GEMINI_MODEL setting.`;
    }
    if (msg.includes('ENOTFOUND') || msg.includes('ETIMEDOUT') || msg.includes('fetch failed')) {
      return 'Could not establish connection to the Google Gemini API. Please check your internet connection or use Demo Mode.';
    }
    if (/timeout|timed out|abort/i.test(msg)) {
      return `Gemini did not respond within ${Math.round(this.timeoutMs / 1000)} seconds. Check the connection, model availability, and API quota, then retry.`;
    }
    if (msg.includes('DEADLINE_EXCEEDED') || /\b504\b/.test(msg)) {
      return 'Gemini timed out while processing this request, even after one retry. Please try again shortly or use Demo Mode.';
    }
    return msg;
  }

  public async analyzeMultimodal(
    textDescription: string,
    files: MultimodalFile[] = []
  ): Promise<BridgeAnalysisResult> {
    if (!this.hasValidKey()) {
      throw new Error(
        'GEMINI_API_KEY is not configured or is set to a placeholder in .env. Please provide a valid Gemini API key from Google AI Studio, or switch to Demo Mode.'
      );
    }

    const promptText = `USER SUBMITTED INCIDENT DESCRIPTION:\n"""\n${
      textDescription.trim() || '(No accompanying text provided. Analyze uploaded multimodal evidence)'
    }\n"""\n\nUPLOADED EVIDENCE FILES COUNT: ${files.length}\n${files
      .map(
        (f, idx) =>
          `File #${idx + 1}: Name="${f.originalName}", Type="${f.mimeType}", Size=${(
            f.size / 1024
          ).toFixed(1)} KB`
      )
      .join('\n')}\n\nPlease analyze all provided text and multimodal attachments according to your instructions and return the structured JSON report.`;

    let rawJsonText: string | null = null;
    let lastError: any = null;

    // Keep requests on the configured model. Silent model fallback can change
    // behavior and hide configuration errors from the person operating the app.
    const candidateModels = [this.modelName];

    // Make one request using the official SDK and configured model. The SDK
    // timeout prevents a stalled upstream request from leaving the UI loading.
    if (this.genAIClient) {
      for (const modelToTry of candidateModels) {
        try {
          console.log(`[GeminiService] Calling @google/genai with model: ${modelToTry}...`);
          
          const contents: any[] = [];
          for (const file of files) {
            contents.push({
              inlineData: {
                mimeType: file.mimeType,
                data: file.buffer.toString('base64'),
              },
            });
          }
          contents.push(promptText);

          const response = await this.genAIClient.models.generateContent({
            model: modelToTry,
            contents: contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              responseSchema: GEMINI_RESPONSE_SCHEMA,
              temperature: 0.1,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          });

          rawJsonText = response.text || null;
          if (rawJsonText) {
            console.log(`[GeminiService] Successfully generated structured output with model: ${modelToTry}`);
            break;
          }
        } catch (sdkError: any) {
          lastError = sdkError;
          console.warn(
            `[GeminiService] @google/genai model ${modelToTry} failed: ${sdkError?.message || sdkError}`
          );
          // If invalid API key, no candidate model will work; break early
          if (String(sdkError?.message).includes('API_KEY_INVALID') || String(sdkError?.message).includes('API key not valid')) {
            break;
          }
        }
      }
    }

    if (!rawJsonText) {
      const friendlyExplanation = this.formatApiError(lastError);
      throw new Error(`Gemini API call failed: ${friendlyExplanation}`);
    }

    // Clean JSON text if wrapped in markdown code blocks
    let cleanedJson = rawJsonText.trim();
    if (cleanedJson.startsWith('```json')) {
      cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(cleanedJson);
    } catch (parseError: any) {
      console.error('[GeminiService] Model returned malformed JSON.');
      throw new Error(`Model returned malformed JSON: ${parseError.message}`);
    }

    // Ensure required structure fields
    if (!parsedData.id) {
      parsedData.id = `bridge-${Date.now()}`;
    }
    parsedData.timestamp = new Date().toISOString();
    parsedData.is_demo = false;
    if (!parsedData.category_tag) {
      parsedData.category_tag = parsedData.request_type || 'General Incident';
    }
    if (!Array.isArray(parsedData.extracted_facts)) {
      parsedData.extracted_facts = [];
    }
    if (!parsedData.location) {
      parsedData.location = { value: null, status: 'unknown' };
    }
    if (!Array.isArray(parsedData.missing_information)) {
      parsedData.missing_information = [];
    }
    if (!Array.isArray(parsedData.uncertainty_notes)) {
      parsedData.uncertainty_notes = [];
    }
    if (!Array.isArray(parsedData.recommended_actions)) {
      parsedData.recommended_actions = [];
    }

    // Validate strictly with Zod
    const validationResult = BridgeAnalysisResultSchema.safeParse(parsedData);
    if (!validationResult.success) {
      console.error('[GeminiService] Zod validation failed:', validationResult.error.format());
      throw new Error(
        `Gemini output did not conform to BridgeAI schema: ${validationResult.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join(', ')}`
      );
    }

    return validationResult.data;
  }
}
