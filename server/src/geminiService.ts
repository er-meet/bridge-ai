import { GoogleGenAI, Schema, Type } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BridgeAnalysisResult, BridgeAnalysisResultSchema } from './schema.js';

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

export class GeminiService {
  private apiKey: string | null;
  private modelName: string;
  private genAIClient: GoogleGenAI | null = null;
  private legacyGenAIClient: GoogleGenerativeAI | null = null;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY?.trim() || null;
    this.modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

    if (this.apiKey) {
      try {
        this.genAIClient = new GoogleGenAI({ apiKey: this.apiKey });
        this.legacyGenAIClient = new GoogleGenerativeAI(this.apiKey);
      } catch (err) {
        console.error('[GeminiService] Error initializing SDK clients:', err);
      }
    }
  }

  public hasValidKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  public getModelName(): string {
    return this.modelName;
  }

  public async analyzeMultimodal(
    textDescription: string,
    files: MultimodalFile[] = []
  ): Promise<BridgeAnalysisResult> {
    if (!this.hasValidKey()) {
      throw new Error(
        'GEMINI_API_KEY is not configured on the server. Please provide a key or switch to Demo Mode.'
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

    // Strategy 1: Attempt with @google/genai SDK
    if (this.genAIClient) {
      try {
        console.log(`[GeminiService] Calling @google/genai with model ${this.modelName}...`);
        
        const contents: any[] = [];
        
        // Add files as inlineData
        for (const file of files) {
          contents.push({
            inlineData: {
              mimeType: file.mimeType,
              data: file.buffer.toString('base64'),
            },
          });
        }
        
        // Add text prompt
        contents.push(promptText);

        const response = await this.genAIClient.models.generateContent({
          model: this.modelName,
          contents: contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: GEMINI_RESPONSE_SCHEMA,
            temperature: 0.1, // low temperature for precise factual extraction
          },
        });

        rawJsonText = response.text || null;
      } catch (sdkError: any) {
        console.warn(
          `[GeminiService] @google/genai call encountered an error: ${sdkError?.message || sdkError}. Trying fallback client...`
        );
      }
    }

    // Strategy 2: Fallback with @google/generative-ai SDK if Strategy 1 failed or returned null
    if (!rawJsonText && this.legacyGenAIClient) {
      try {
        console.log(`[GeminiService] Calling @google/generative-ai fallback with model ${this.modelName}...`);
        const model = this.legacyGenAIClient.getGenerativeModel({
          model: this.modelName,
          systemInstruction: SYSTEM_INSTRUCTION,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const parts: any[] = [];
        for (const file of files) {
          parts.push({
            inlineData: {
              mimeType: file.mimeType,
              data: file.buffer.toString('base64'),
            },
          });
        }
        parts.push({ text: promptText });

        const result = await model.generateContent(parts);
        const response = await result.response;
        rawJsonText = response.text();
      } catch (fallbackError: any) {
        console.error('[GeminiService] Fallback SDK call also failed:', fallbackError);
        throw new Error(`Gemini API call failed: ${fallbackError?.message || 'Unknown error'}`);
      }
    }

    if (!rawJsonText) {
      throw new Error('Gemini API returned an empty response. Please verify inputs and retry.');
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
      console.error('[GeminiService] JSON parse error on raw output:', cleanedJson);
      throw new Error(`Model returned malformed JSON: ${parseError.message}`);
    }

    // Inject metadata fields if absent
    if (!parsedData.id) {
      parsedData.id = `bridge-${Date.now()}`;
    }
    parsedData.timestamp = new Date().toISOString();
    parsedData.is_demo = false;

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
