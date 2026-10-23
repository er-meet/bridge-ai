import React from 'react';
import { BridgeAnalysisResult } from '../types/index.js';
import { X, Trash2, Clock, Sparkles, ChevronRight, AlertTriangle, Layers } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: BridgeAnalysisResult[];
  onSelectResult: (result: BridgeAnalysisResult) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onClearHistory,
  onDeleteHistoryItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-ink-border shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-ink-border flex items-center justify-between bg-canvas-subtle">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-ink">Analysis History</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-100">
                {history.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-xs text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                  title="Clear all saved history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-ink-muted hover:text-ink rounded-lg hover:bg-canvas-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Layers className="w-8 h-8 text-ink-muted mx-auto" />
                <p className="text-xs font-semibold text-ink">No saved analyses yet</p>
                <p className="text-[11px] text-ink-muted max-w-xs mx-auto">
                  When you run analyses or load scenarios, they will be saved here in your browser.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-ink-border hover:border-brand-500 bg-white hover:bg-canvas-subtle/50 transition-all cursor-pointer group relative flex flex-col justify-between"
                  onClick={() => {
                    onSelectResult(item);
                    onClose();
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                        {item.category_tag}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {item.is_demo && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Demo
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            item.priority.level === 'urgent'
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : item.priority.level === 'moderate'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {item.priority.level}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-ink group-hover:text-brand-600 transition-colors mb-1">
                      {item.request_type}
                    </h4>

                    <p className="text-[11px] text-ink-secondary line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-ink-border/50 flex items-center justify-between text-[10px] text-ink-muted">
                    <span>
                      {new Date(item.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHistoryItem(item.id);
                        }}
                        className="p-1 text-ink-muted hover:text-red-600 rounded hover:bg-white"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <ChevronRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
