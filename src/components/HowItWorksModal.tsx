import React from 'react';
import { X, ShieldCheck, Cpu, Eye, FileText, AlertTriangle, Layers, HeartPulse } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-ink-border max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-ink-border flex items-center justify-between bg-canvas-subtle">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink">How BridgeAI Works</h2>
              <p className="text-[11px] text-ink-muted">
                Multimodal synthesis & Responsible AI architecture
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-canvas-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs sm:text-sm text-ink-secondary leading-relaxed">
          {/* Mission */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-brand-600" />
              <span>Universal Bridge Between Human Intent & Complex Systems</span>
            </h3>
            <p>
              In real-world crises, citizens and patients communicate in messy, fragmented ways: voice notes recorded in a panic, cell phone photos of broken roads or rising water, or photos of dense discharge paperwork.
              Traditional intake forms force users into rigid bureaucratic boxes. <strong>BridgeAI</strong> flips this paradigm: users communicate naturally using whatever media is accessible, and Google Gemini extracts grounded facts and structures actionable next steps.
            </p>
          </div>

          {/* Multimodal Pipeline */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-brand-600" />
              <span>Multimodal Ingestion & Verification Pipeline</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-canvas-subtle rounded-xl border border-ink-border">
                <span className="font-bold text-ink block mb-1">1. Multimodal Evidence</span>
                <span className="text-[11px] text-ink-muted">
                  Passes text, high-resolution imagery, raw audio waveforms, and PDF documents to Gemini simultaneously.
                </span>
              </div>
              <div className="p-3 bg-canvas-subtle rounded-xl border border-ink-border">
                <span className="font-bold text-ink block mb-1">2. Fact Grounding</span>
                <span className="text-[11px] text-ink-muted">
                  Categorizes each piece of information as <em>Observed</em>, <em>Reported</em>, <em>Inferred</em>, or <em>Unknown</em>.
                </span>
              </div>
              <div className="p-3 bg-canvas-subtle rounded-xl border border-ink-border">
                <span className="font-bold text-ink block mb-1">3. Structured Schema</span>
                <span className="text-[11px] text-ink-muted">
                  Gemini generates structured JSON conforming to a strict schema, validated at runtime with Zod.
                </span>
              </div>
              <div className="p-3 bg-canvas-subtle rounded-xl border border-ink-border">
                <span className="font-bold text-ink block mb-1">4. Human-in-the-Loop</span>
                <span className="text-[11px] text-ink-muted">
                  Users and dispatchers can edit extracted facts and check off action items with human oversight.
                </span>
              </div>
            </div>
          </div>

          {/* Responsible AI Guarantees */}
          <div className="space-y-3 pt-2 border-t border-ink-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Responsible AI & Safety Commitments</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Zero Automated Emergency Calls:</strong> BridgeAI never automatically dials 911 or claims to have alerted authorities. If imminent life danger is detected, it immediately provides prominent emergency guidance instructing the human to call 911.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Explicit Uncertainty:</strong> The system explicitly discloses what evidence cannot prove (e.g., photo of floodwater does not prove electrical grid status).
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Healthcare Guardrails:</strong> For medical paperwork, summaries are purely educational and plain-language. BridgeAI does not provide clinical diagnoses or adjust medical prescriptions.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Data Privacy:</strong> Uploads are processed securely in memory and never written permanently to unmonitored disks or exposed in server logs.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ink-border bg-canvas-subtle flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-ink hover:bg-ink-secondary text-white text-xs font-semibold rounded-xl transition-colors shadow-subtle"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
