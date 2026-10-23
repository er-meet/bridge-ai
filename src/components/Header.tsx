import React from 'react';
import { Layers, RotateCcw, History, HelpCircle, Sparkles, AlertCircle } from 'lucide-react';

interface HeaderProps {
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  hasApiKey: boolean;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenHowItWorks: () => void;
  onNewAnalysis: () => void;
  activeResultId?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  isDemoMode,
  onToggleDemoMode,
  hasApiKey,
  historyCount,
  onOpenHistory,
  onOpenHowItWorks,
  onNewAnalysis,
  activeResultId,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-ink-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onNewAnalysis}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-sm ring-1 ring-brand-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight text-ink">BridgeAI</span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-100">
                  Multimodal
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-ink-muted leading-none mt-0.5">
                From human chaos to meaningful action
              </p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Demo / Live Indicator & Toggle */}
            <button
              type="button"
              onClick={onToggleDemoMode}
              title={
                isDemoMode
                  ? 'Currently in Demo Mode (using deterministic sample responses). Click to switch to Live API Mode.'
                  : hasApiKey
                  ? 'Currently in Live API Mode (calling Gemini). Click to switch to Demo Mode.'
                  : 'No GEMINI_API_KEY detected in .env. Click to view status.'
              }
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                isDemoMode
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : hasApiKey
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              {isDemoMode ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Demo Mode</span>
                </>
              ) : hasApiKey ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Gemini Live</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-stone-500" />
                  <span>Demo (No Key)</span>
                </>
              )}
            </button>

            {/* History Button */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink hover:bg-canvas-subtle transition-colors border border-transparent hover:border-ink-border"
              title="View past analysis history"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-canvas-muted text-ink-secondary rounded-full font-mono font-semibold">
                  {historyCount}
                </span>
              )}
            </button>

            {/* How It Works Button */}
            <button
              type="button"
              onClick={onOpenHowItWorks}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink hover:bg-canvas-subtle transition-colors border border-transparent hover:border-ink-border"
              title="Learn how BridgeAI works & safety principles"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">How It Works</span>
            </button>

            {/* New Analysis Action */}
            {activeResultId && (
              <button
                type="button"
                onClick={onNewAnalysis}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-ink text-white hover:bg-ink-secondary text-xs font-medium rounded-lg transition-colors shadow-subtle"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Analysis</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
