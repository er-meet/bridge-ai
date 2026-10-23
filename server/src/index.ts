import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GeminiService, MultimodalFile } from './geminiService.js';
import { DEMO_SCENARIOS } from './demoData.js';
import { BridgeAnalysisResultSchema } from './schema.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Supported MIME types map
const SUPPORTED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  // Documents
  'application/pdf',
  'text/plain',
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/aac',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
]);

// Memory storage for secure, temporary in-memory processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024,
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    // Some browsers or webm audio recorders send audio/webm;codecs=opus
    const cleanMime = file.mimetype.split(';')[0].trim().toLowerCase();
    if (SUPPORTED_MIME_TYPES.has(cleanMime)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file format "${file.mimetype}". Supported types: JPG, PNG, WEBP, PDF, MP3, WAV, WEBM, OGG, M4A.`
        )
      );
    }
  },
});

const geminiService = new GeminiService();

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check & configuration endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: geminiService.hasValidKey(),
    model: geminiService.getModelName(),
    demoModeAvailable: true,
    supportedMimeTypes: Array.from(SUPPORTED_MIME_TYPES),
    maxFileSizeMB,
  });
});

// 2. Demo scenarios catalog
app.get('/api/demo/scenarios', (_req: Request, res: Response) => {
  const catalog = Object.values(DEMO_SCENARIOS).map((scenario) => ({
    id: scenario.id,
    title: scenario.title,
    category: scenario.category,
    badge: scenario.badge,
    shortDescription: scenario.shortDescription,
    sampleInputText: scenario.sampleInputText,
    sampleFileDetails: scenario.sampleFileDetails,
  }));
  res.json(catalog);
});

// 3. Demo scenario details
app.get('/api/demo/scenario/:id', (req: Request, res: Response) => {
  const scenario = DEMO_SCENARIOS[req.params.id];
  if (!scenario) {
    return res.status(404).json({ error: `Demo scenario "${req.params.id}" not found.` });
  }
  res.json(scenario);
});

// 4. Main Multimodal Analysis Endpoint
app.post(
  '/api/analyze',
  upload.array('files', 5),
  async (req: Request, res: Response) => {
    try {
      const { text = '', isDemo = 'false', scenarioId = '' } = req.body;
      const forceDemo = isDemo === 'true' || isDemo === true;
      const uploadedFiles = (req.files as Express.Multer.File[]) || [];

      console.log(
        `[POST /api/analyze] Incoming request: textLen=${text.length}, files=${uploadedFiles.length}, forceDemo=${forceDemo}, scenarioId=${scenarioId}`
      );

      // Handle Scenario Demo / Fallback Demo Mode
      if (forceDemo || !geminiService.hasValidKey()) {
        if (scenarioId && DEMO_SCENARIOS[scenarioId]) {
          console.log(`[POST /api/analyze] Serving preset demo scenario: ${scenarioId}`);
          return res.json(DEMO_SCENARIOS[scenarioId].analysisResult);
        }

        // If no specific scenario selected but demo requested with custom input:
        if (forceDemo) {
          // Find the best matching demo scenario based on keywords, or default to road-hazard
          const lowerText = text.toLowerCase();
          let matchedScenario = DEMO_SCENARIOS['road-hazard'];
          if (lowerText.includes('flood') || lowerText.includes('water') || lowerText.includes('evacuat')) {
            matchedScenario = DEMO_SCENARIOS['disaster-assistance'];
          } else if (
            lowerText.includes('hospital') ||
            lowerText.includes('doctor') ||
            lowerText.includes('medicat') ||
            lowerText.includes('health') ||
            lowerText.includes('discharge')
          ) {
            matchedScenario = DEMO_SCENARIOS['healthcare-paperwork'];
          }

          const responseData = {
            ...matchedScenario.analysisResult,
            id: `demo-${Date.now()}`,
            timestamp: new Date().toISOString(),
            is_demo: true,
            summary: text.trim()
              ? `[DEMO MODE SYNTHESIS] ${text.trim().substring(0, 160)}...`
              : matchedScenario.analysisResult.summary,
          };
          return res.json(responseData);
        }

        // If not forceDemo but no API key configured, return actionable error
        return res.status(401).json({
          error:
            'GEMINI_API_KEY is not configured or is a placeholder in the server .env file. Please add a valid Gemini API key from Google AI Studio or enable Demo Mode to test with instant structured reports.',
          code: 'MISSING_API_KEY',
          canFallbackToDemo: true,
          demoAvailable: true,
        });
      }

      // Live mode validation: must have text or at least one file
      if (!text.trim() && uploadedFiles.length === 0) {
        return res.status(400).json({
          error: 'Please provide either a text description, upload a file, or record a voice note to analyze.',
          code: 'EMPTY_SUBMISSION',
        });
      }

      // Prepare multimodal files for Gemini
      const multimodalFiles: MultimodalFile[] = uploadedFiles.map((f) => ({
        buffer: f.buffer,
        mimeType: f.mimetype.split(';')[0].trim().toLowerCase(),
        originalName: f.originalname,
        size: f.size,
      }));

      // Call Gemini multimodal service
      const analysisResult = await geminiService.analyzeMultimodal(text, multimodalFiles);

      // Return strictly validated result
      return res.json(analysisResult);
    } catch (err: any) {
      console.error('[POST /api/analyze] Error during analysis:', err);
      return res.status(500).json({
        error: err.message || 'An unexpected error occurred during multimodal analysis.',
        code: 'GEMINI_CALL_FAILED',
        canFallbackToDemo: true,
        demoAvailable: true,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      });
    }
  }
);

// Global multer / express error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `Uploaded file exceeds the maximum limit of ${maxFileSizeMB}MB. Please upload a smaller file.`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files uploaded. Maximum 5 files per analysis.',
      });
    }
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }

  if (err) {
    return res.status(400).json({ error: err.message || 'Unknown request error' });
  }

  return res.status(500).json({ error: 'Internal server error' });
});

// Serve frontend in production if built
const distPath = path.resolve(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
  console.log(`[Server] Serving production static assets from: ${distPath}`);
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start listener
app.listen(port, () => {
  console.log(`\n=================================================`);
  console.log(` BridgeAI Backend Server Running`);
  console.log(` URL: http://localhost:${port}`);
  console.log(` Model: ${geminiService.getModelName()}`);
  console.log(` API Key Status: ${geminiService.hasValidKey() ? 'CONFIGURED' : 'NOT SET (Demo Mode Active)'}`);
  console.log(` Max File Size: ${maxFileSizeMB}MB`);
  console.log(`=================================================\n`);
});
