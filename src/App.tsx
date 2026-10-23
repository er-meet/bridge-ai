import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { WorkspaceInput } from './components/WorkspaceInput.js';
import { ResultsDashboard } from './components/ResultsDashboard.js';
import { HistoryDrawer } from './components/HistoryDrawer.js';
import { HowItWorksModal } from './components/HowItWorksModal.js';
import { BridgeAnalysisResult, BridgeAnalysisResultSchema, SystemHealth } from './types/index.js';

const STORAGE_KEY = 'bridge_ai_history_v1';

export const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [activeResult, setActiveResult] = useState<BridgeAnalysisResult | null>(null);
  const [history, setHistory] = useState<BridgeAnalysisResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [maxFileSizeMB, setMaxFileSizeMB] = useState(20);

  // Load history from localStorage & check system health
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read saved history from localStorage', e);
    }

    // Check backend health
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: SystemHealth) => {
        setHasApiKey(Boolean(data.hasApiKey));
        if (data.maxFileSizeMB) {
          setMaxFileSizeMB(data.maxFileSizeMB);
        }
        // If server has no API key, default to Demo Mode
        if (!data.hasApiKey) {
          setIsDemoMode(true);
        } else {
          // If server has API key, default to Live Mode
          setIsDemoMode(false);
        }
      })
      .catch((err) => {
        console.warn('Backend /api/health check failed (might still be spinning up):', err);
        setIsDemoMode(true);
      });
  }, []);

  // Save history to localStorage
  const saveHistoryToStorage = (updatedHistory: BridgeAnalysisResult[]) => {
    setHistory(updatedHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  };

  const handleToggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const handleNewAnalysis = () => {
    setActiveResult(null);
    setSelectedScenarioId(null);
  };

  const handleUpdateResult = (updated: BridgeAnalysisResult) => {
    setActiveResult(updated);
    const updatedHistory = history.map((h) => (h.id === updated.id ? updated : h));
    saveHistoryToStorage(updatedHistory);
  };

  const handleClearHistory = () => {
    saveHistoryToStorage([]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    saveHistoryToStorage(updated);
    if (activeResult?.id === id) {
      setActiveResult(null);
    }
  };

  const handleAnalyze = async (
    text: string,
    files: File[],
    scenarioId?: string
  ): Promise<void> => {
    setIsAnalyzing(true);
    setAnalysisStage('Preparing multimodal inputs...');

    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('isDemo', String(isDemoMode));
      if (scenarioId) {
        formData.append('scenarioId', scenarioId);
      }

      for (const file of files) {
        formData.append('files', file);
      }

      // Simulated realistic progress updates
      const t1 = setTimeout(() => {
        setAnalysisStage('Extracting multimodal evidence & entities...');
      }, 700);

      const t2 = setTimeout(() => {
        setAnalysisStage('Reasoning and structuring actionable plan...');
      }, 1600);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(t1);
      clearTimeout(t2);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server responded with status ${response.status}: ${response.statusText}`
        );
      }

      const rawJson = await response.json();
      const validated = BridgeAnalysisResultSchema.parse(rawJson);

      setActiveResult(validated);

      // Prepend to history
      const newHistory = [validated, ...history.filter((h) => h.id !== validated.id)].slice(0, 30);
      saveHistoryToStorage(newHistory);
    } catch (err: any) {
      console.error('Analysis error:', err);
      throw err;
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Global Navigation Header */}
      <Header
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        hasApiKey={hasApiKey}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onNewAnalysis={handleNewAnalysis}
        activeResultId={activeResult?.id}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeResult ? (
          <ResultsDashboard
            result={activeResult}
            onUpdateResult={handleUpdateResult}
            onNewAnalysis={handleNewAnalysis}
          />
        ) : (
          <WorkspaceInput
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            analysisStage={analysisStage}
            isDemoMode={isDemoMode}
            onSelectScenario={(id) => setSelectedScenarioId(id)}
            maxFileSizeMB={maxFileSizeMB}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-border bg-canvas-subtle/60 py-6 text-center text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-ink">BridgeAI</span>
            <span>&bull;</span>
            <span>From human chaos to meaningful action</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Powered by Google Gemini</span>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setIsHowItWorksOpen(true)}
              className="hover:text-ink underline"
            >
              Responsible AI Principles
            </button>
          </div>
        </div>
      </footer>

      {/* Slide-over History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectResult={(res) => setActiveResult(res)}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
      />

      {/* How It Works & Responsible AI Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
};
