# BridgeAI — From Chaos to Action

> **Universal Multimodal Bridge Between Human Intent and Complex Systems**  
> *"From human chaos to meaningful action."*  
> *One interface. Multiple forms of human intent. Clearer decisions and actionable outcomes.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Gemini](https://img.shields.io/badge/AI-Google%20Gemini%203.8%20Flash-4285F4.svg)](https://aistudio.google.com/)
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg)](https://react.dev/)
[![Node.js & Express](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg)](https://nodejs.org/)
[![Validation](https://img.shields.io/badge/Validation-Zod%20Schema-3E67B1.svg)](https://zod.dev/)

---

## 1. Product Vision & Societal Impact

In real-world crises, citizens, patients, and frontline responders communicate in messy, fragmented, and emotionally charged ways:
- A frantic voice recording of rising floodwaters
- A cell phone photograph of a collapsed asphalt road
- A photo of a dense, jargon-filled hospital discharge summary
- A quick typed message sent while evacuating

Traditional public service portals and municipal reporting tools force users into rigid bureaucratic dropdowns and forms, resulting in delayed reports, misclassified priorities, and critical information lost in translation.

**BridgeAI** solves this fundamental bottleneck. It acts as an empathetic, universal bridge that ingests unstructured multimodal evidence (text, photos, audio notes, and PDFs) simultaneously. Powered by Google Gemini, it synthesizes the input into structured, categorized, and actionable intelligence with strict human-in-the-loop oversight.

### Core Capabilities
- **Multimodal Ingestion**: Accepts text descriptions, photographic evidence (JPG, PNG, WEBP), official PDF documents, and audio recordings (MP3, WAV, OGG, M4A) in a single unified analysis.
- **In-Browser Voice Recorder**: Record audio notes directly inside the application using the browser's microphone with real-time timers and instant playback.
- **Fact Categorization & Grounding**: Every extracted fact is strictly tagged as `Observed` (seen in photo/document), `Reported` (claimed by citizen), `Inferred` (logical deduction), or `Unknown`.
- **Location Verification**: Assesses location reliability (`confirmed_from_input`, `reported`, `inferred`, or `unknown`).
- **Critical Gap Detection**: Explicitly identifies missing information required before emergency responders or dispatchers can take action.
- **Uncertainty & Transparency**: Discloses model limitations and evidence boundaries rather than hallucinating certainty.
- **Interactive Action Plan**: Generates concrete next steps that users and dispatchers can check off as completed.
- **Responsible AI Guardrails**: Prominently displays emergency advisories (e.g. 911 dispatch) when immediate danger is detected; enforces educational-only disclaimers on medical paperwork.
- **Export & Integration**: One-click Markdown copy, plain text dispatch format, and raw JSON export.

---

## 2. Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (Browser)                      │
│   React 18 + TypeScript + Vite + Tailwind CSS + Lucide     │
│   - Multi-input Workspace (Text, Drag & Drop, Camera, Mic) │
│   - Real-time Audio Recorder (MediaRecorder API)           │
│   - Results Dashboard with Editable Facts & Action Items    │
│   - Persistent Local History & Preset Demo Scenarios        │
└──────────────────────────────┬──────────────────────────────┘
                               │  POST /api/analyze (multipart/form-data)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Server (Node.js + Express)                │
│   - Secure In-Memory File Processing (Multer)               │
│   - MIME Type & File Size Validation (up to 10MB)           │
│   - Responsible AI Safety Filter & Emergency Detector       │
│   - Gemini Multimodal Service (@google/genai SDK)           │
│   - Strict Runtime Validation with Zod Schema               │
│   - Preset Demo Mode Engine (works offline / keyless)       │
└──────────────────────────────┬──────────────────────────────┘
                               │  Multimodal JSON Schema Request
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Gemini 3.8 Flash                  │
│   - Multimodal Context Processing (Images + Audio + PDFs)   │
│   - Low-temperature Factual Extraction                     │
│   - Strictly Enforced JSON Schema Output                    │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, TypeScript, Multer (memory storage), CORS, Helmet
- **AI SDK**: Official Google Gen AI SDK (`@google/genai` and `@google/generative-ai` fallback)
- **Validation**: Zod for end-to-end schema validation on both server and client
- **Testing**: Vitest test runner with automated schema, demo mode, and error handling suites

---

## 3. Visual Design System

The application adheres to a clean, restrained, human-centric design language:
- **Canvas Background**: Warm off-white (`#fbfaf8`) preventing screen fatigue
- **Typography**: Dark charcoal ink (`#1c1b18`) with Inter and JetBrains Mono
- **Surfaces**: Crisp white cards with subtle borders (`#e4e2db`) and soft natural shadows
- **Accent**: Restrained indigo (`#4f46e5`) for focal interactions
- **Urgency Accents**: 
  - Urgent: Warm crimson (`bg-red-50`, `text-red-800`, `border-red-200`)
  - Moderate: Amber (`bg-amber-50`, `text-amber-800`, `border-amber-200`)
  - Low: Sage Green (`bg-emerald-50`, `text-emerald-800`, `border-emerald-200`)
  - Needs Review: Muted Purple (`bg-purple-50`, `text-purple-800`)

---

## 4. Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### Installation

1. **Clone or navigate to the repository:**
   ```bash
   cd "e:\H2S Project"
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Add your Gemini API Key:**
   Open `.env` in your editor:
   ```env
   # Google Gemini API Key from Google AI Studio
   GEMINI_API_KEY=AIzaSy...your_actual_key_here

   # Gemini Model (default: gemini-3.8-flash)
   GEMINI_MODEL=gemini-3.8-flash

   # Gemini request timeout (default: 90 seconds)
   GEMINI_TIMEOUT_MS=90000

   # Port configuration
   PORT=3001

   # File upload limit (in MB)
   MAX_FILE_SIZE_MB=10
   ```

> [!NOTE]  
> **No API Key? No Problem!**  
> If `GEMINI_API_KEY` is not provided, BridgeAI runs in clearly labelled **Demo Mode**. Preset scenarios return fictional sample reports. Custom submissions are not analyzed by Gemini while Demo Mode is active.

---

## 5. Running the Application

### Development Mode (Concurrent Client + Server HMR)
Run both the Vite dev server and the Express backend with hot reloading:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- Vite automatically proxies `/api` calls to the backend!

### Production Build & Run
Build both the optimized client and compiled server:
```bash
npm run build
npm start
```
The server will host the full application on `http://localhost:3001`.

---

## 6. How to Obtain a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **"Get API key"** in the top navigation.
4. Click **"Create API key"** and choose a project or create a new one.
5. Copy the generated key and paste it into your `.env` file as `GEMINI_API_KEY=...`.
6. Restart the server (`npm run dev` or `npm start`).

---

## 7. Interactive Scenarios Included

BridgeAI includes three built-in real-world scenarios:

### 1. Damaged Road Hazard (Infrastructure & Public Safety)
- **Inputs**: High-resolution photo of a 3-foot asphalt crater in the rain + citizen incident description.
- **Output**: Classifies hazard as urgent, extracts wet weather conditions, flags missing street coordinates, highlights blowout risks, and provides a 3-step municipal mitigation plan.

### 2. Neighborhood Flash Flooding (Disaster Relief)
- **Inputs**: Flood photograph showing submerged sidewalks + citizen voice recording.
- **Output**: Identifies a trapped elderly resident with mobility limitations and low-hanging electrical power lines. Immediately activates the **Immediate Life Safety Advisory** instructing the user to dial 911.

### 3. Hospital Discharge Summary (Healthcare Paperwork)
- **Inputs**: Sample fictional inpatient discharge summary PDF with clinical jargon (CHF exacerbation, diuresis, Furosemide, Lisinopril).
- **Output**: Simplifies instructions into plain English, outlines morning medication timing, establishes daily weight monitoring triggers, and disclaims medical advice in accordance with Responsible AI safety standards.

---

## 8. Responsible AI & Safety Guardrails

- **Zero Hallucination Policy**: If a detail is not explicitly present in the multimodal input, it is classified as `unknown` and listed under `missing_information`.
- **No Automated Emergency Calls**: BridgeAI never claims to have contacted emergency services. It empowers the human operator and explicitly tells them when to dial 911.
- **Medical Paperwork Boundaries**: For medical documents, summaries are strictly educational. BridgeAI never alters prescriptions or diagnoses conditions.
- **Evidence Provenance**: Facts are attributed directly to their origin (e.g. `Photo evidence`, `User audio note`, `Document section 2`).
- **Ephemeral Processing**: Files are processed in memory and never persisted indefinitely to unmonitored storage.

---

## 9. Automated Testing

The project includes automated tests covering validation schemas, demo mode fidelity, export formatting, and error guardrails:

```bash
npm test
```

### Test Coverage Highlights:
- `tests/schemaValidation.test.ts`: Zod validation of complete objects, enums, nullables, and invalid schemas.
- `tests/demoMode.test.ts`: Verification of all 3 preset scenarios, emergency advisory triggers, and healthcare disclaimers.
- `tests/exportFormatting.test.ts`: Markdown table formatting, plain text conversion, and emergency notices.
- `tests/errorHandling.test.ts`: Missing API key recovery, empty submission rejection, and markdown code fence cleaning.

---

## 10. API Reference

### `GET /api/health`
Returns server status, model configuration, and API key availability.
```json
{
  "status": "ok",
  "hasApiKey": true,
  "model": "gemini-3.8-flash",
  "demoModeAvailable": true,
  "maxFileSizeMB": 10
}
```

### `POST /api/analyze`
Accepts `multipart/form-data`:
- `text` (string): Incident description
- `isDemo` (boolean): Force demo mode
- `scenarioId` (string, optional): Preset scenario identifier (`road-hazard`, `disaster-assistance`, `healthcare-paperwork`)
- `files` (File[], optional, up to 5 files): Uploaded images, PDFs, or audio recordings.

Returns typed, validated `BridgeAnalysisResult` conforming to the JSON schema.

---

## 11. License

Released under the **MIT License**. Created for the Gemini Societal Benefit Hackathon Challenge.
