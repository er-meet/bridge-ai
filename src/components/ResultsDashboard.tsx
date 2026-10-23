import React, { useState } from 'react';
import {
  BridgeAnalysisResult,
  ExtractedFact,
  RecommendedAction,
  FactStatus,
} from '../types/index.js';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  MapPin,
  HelpCircle,
  FileText,
  Copy,
  Download,
  FileCode,
  Edit2,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Info,
  RotateCcw,
} from 'lucide-react';
import {
  formatReportAsMarkdown,
  formatReportAsPlainText,
  downloadFile,
  copyToClipboard,
} from '../utils/exportUtils.js';

interface ResultsDashboardProps {
  result: BridgeAnalysisResult;
  onUpdateResult: (updated: BridgeAnalysisResult) => void;
  onNewAnalysis: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  onUpdateResult,
  onNewAnalysis,
}) => {
  const [copied, setCopied] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [editingFactIndex, setEditingFactIndex] = useState<number | null>(null);
  const [tempFactValue, setTempFactValue] = useState('');
  const [showAddFact, setShowAddFact] = useState(false);
  const [newFactField, setNewFactField] = useState('');
  const [newFactValue, setNewFactValue] = useState('');
  const [newFactSource, setNewFactSource] = useState('Manual verification');
  const [newFactStatus, setNewFactStatus] = useState<FactStatus>('observed');

  // Copy report handler
  const handleCopy = async () => {
    const md = formatReportAsMarkdown(result);
    const success = await copyToClipboard(md);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Download Markdown handler
  const handleDownloadMarkdown = () => {
    const md = formatReportAsMarkdown(result);
    downloadFile(md, `${result.id}-report.md`, 'text/markdown;charset=utf-8');
  };

  // Download Plain Text handler
  const handleDownloadText = () => {
    const txt = formatReportAsPlainText(result);
    downloadFile(txt, `${result.id}-report.txt`, 'text/plain;charset=utf-8');
  };

  // Download JSON handler
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(result, null, 2);
    downloadFile(jsonStr, `${result.id}-data.json`, 'application/json;charset=utf-8');
  };

  // Toggle action completion checkbox
  const toggleActionComplete = (actionId: string) => {
    const updatedActions = result.recommended_actions.map((act) => {
      if (act.id === actionId) {
        return { ...act, completed: !act.completed };
      }
      return act;
    });
    onUpdateResult({ ...result, recommended_actions: updatedActions });
  };

  // Edit Fact Value
  const startEditingFact = (index: number, currentValue: string | null) => {
    setEditingFactIndex(index);
    setTempFactValue(currentValue || '');
  };

  const saveEditedFact = (index: number) => {
    const updatedFacts = [...result.extracted_facts];
    updatedFacts[index] = {
      ...updatedFacts[index],
      value: tempFactValue.trim() || null,
      source: `${updatedFacts[index].source} (edited by human reviewer)`,
    };
    onUpdateResult({ ...result, extracted_facts: updatedFacts });
    setEditingFactIndex(null);
  };

  const deleteFact = (index: number) => {
    const updatedFacts = result.extracted_facts.filter((_, idx) => idx !== index);
    onUpdateResult({ ...result, extracted_facts: updatedFacts });
  };

  const handleAddNewFact = () => {
    if (!newFactField.trim()) return;
    const newFact: ExtractedFact = {
      field: newFactField.trim(),
      value: newFactValue.trim() || null,
      source: newFactSource.trim() || 'Manual human entry',
      status: newFactStatus,
    };
    onUpdateResult({
      ...result,
      extracted_facts: [...result.extracted_facts, newFact],
    });
    setNewFactField('');
    setNewFactValue('');
    setShowAddFact(false);
  };

  // Status Badge Helper
  const renderStatusBadge = (status: FactStatus) => {
    switch (status) {
      case 'observed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Observed in Evidence
          </span>
        );
      case 'reported':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            Citizen Reported
          </span>
        );
      case 'inferred':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            AI Inferred
          </span>
        );
      case 'unknown':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            Unknown / Absent
          </span>
        );
    }
  };

  // Priority Card Styling
  const getPriorityStyle = (level: string) => {
    switch (level) {
      case 'urgent':
        return {
          bg: 'bg-red-50',
          text: 'text-red-800',
          border: 'border-red-200',
          badge: 'bg-red-600 text-white',
          icon: AlertTriangle,
        };
      case 'moderate':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          badge: 'bg-amber-500 text-white',
          icon: Clock,
        };
      case 'low':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-800',
          border: 'border-emerald-200',
          badge: 'bg-emerald-600 text-white',
          icon: CheckCircle2,
        };
      case 'needs_review':
      default:
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-800',
          border: 'border-purple-200',
          badge: 'bg-purple-600 text-white',
          icon: HelpCircle,
        };
    }
  };

  const priorityStyle = getPriorityStyle(result.priority.level);
  const PriorityIcon = priorityStyle.icon;
  const factStatusOrder: FactStatus[] = ['observed', 'reported', 'inferred', 'unknown'];
  const factStatusStyles: Record<FactStatus, { label: string; color: string; dot: string }> = {
    observed: { label: 'Observed', color: 'bg-emerald-500', dot: 'bg-emerald-500' },
    reported: { label: 'Reported', color: 'bg-blue-500', dot: 'bg-blue-500' },
    inferred: { label: 'Inferred', color: 'bg-violet-500', dot: 'bg-violet-500' },
    unknown: { label: 'Unknown', color: 'bg-stone-300', dot: 'bg-stone-400' },
  };
  const factCounts = factStatusOrder.reduce((counts, status) => {
    counts[status] = result.extracted_facts.filter((fact) => fact.status === status).length;
    return counts;
  }, {} as Record<FactStatus, number>);
  const completedActions = result.recommended_actions.filter((action) => action.completed).length;
  const actionProgress = result.recommended_actions.length
    ? Math.round((completedActions / result.recommended_actions.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action & Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink-border">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Analysis Report
          </span>
          <span className="text-xs text-ink-muted">&bull;</span>
          <span className="font-mono text-xs text-ink-secondary">{result.id}</span>
          {result.is_demo && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Demo Scenario</span>
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Copy Report */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-ink bg-white hover:bg-canvas-subtle border border-ink-border rounded-lg transition-colors shadow-subtle"
            title="Copy structured report as Markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-ink-muted" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Export Text / Markdown */}
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-ink bg-white hover:bg-canvas-subtle border border-ink-border rounded-lg transition-colors shadow-subtle"
            title="Download report as Markdown file"
          >
            <Download className="w-3.5 h-3.5 text-ink-muted" />
            <span>Markdown</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadText}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-ink bg-white hover:bg-canvas-subtle border border-ink-border rounded-lg transition-colors shadow-subtle"
            title="Download report as plain text"
          >
            <FileText className="w-3.5 h-3.5 text-ink-muted" />
            <span>Text</span>
          </button>

          {/* JSON Schema Viewer */}
          <button
            type="button"
            onClick={() => setShowJsonModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-ink bg-white hover:bg-canvas-subtle border border-ink-border rounded-lg transition-colors shadow-subtle"
            title="Inspect raw validated JSON payload"
          >
            <FileCode className="w-3.5 h-3.5 text-brand-600" />
            <span>JSON</span>
          </button>

          {/* New Analysis */}
          <button
            type="button"
            onClick={onNewAnalysis}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-ink hover:bg-ink-secondary rounded-lg transition-colors shadow-subtle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Emergency Warning Banner (if detected) */}
      {result.emergency_detected && result.emergency_guidance && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-red-950 flex items-start space-x-3.5 shadow-sm animate-pulse">
          <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold tracking-tight text-red-900 uppercase">
              Immediate Life Safety Advisory
            </h4>
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-red-800">
              {result.emergency_guidance}
            </p>
          </div>
        </div>
      )}

      {/* Header Cards: Category & Priority */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category & Request Type Card */}
        <div className="md:col-span-2 p-5 bg-white rounded-2xl border border-ink-border shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Identified Category
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-100">
                {result.category_tag}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-ink">
              {result.request_type}
            </h2>
          </div>

          <div className="mt-4 pt-3 border-t border-ink-border/60 flex items-center justify-between text-xs text-ink-secondary">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Human-in-the-Loop Verification Required</span>
            </span>
            <span className="text-ink-muted font-mono text-[11px]">
              {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Assessed Priority Card */}
        <div className={`p-5 rounded-2xl border shadow-card flex flex-col justify-between ${priorityStyle.bg} ${priorityStyle.border}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
                Assessed Urgency
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityStyle.badge}`}>
                {result.priority.level}
              </span>
            </div>
            <div className="flex items-start space-x-2 mt-2">
              <PriorityIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${priorityStyle.text}`} />
              <p className={`text-xs font-medium leading-relaxed ${priorityStyle.text}`}>
                {result.priority.reason}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-black/5 text-[11px] text-ink-muted">
            Priority assessed based on active bodily risk, property damage, and time sensitivity.
          </div>
        </div>
      </div>

      {/* Plain Language Summary Card */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-ink-border shadow-card space-y-2">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Plain-Language Summary
          </h3>
        </div>
        <p className="text-sm sm:text-base text-ink leading-relaxed font-normal">
          {result.summary}
        </p>
      </div>

      {/* Visual overview of evidence quality and action progress */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4" aria-label="Analysis visual summary">
        <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl border border-ink-border bg-white shadow-card">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-brand-50 blur-2xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Evidence map</p>
                <h3 className="mt-1 text-base font-semibold text-ink">What the input supports</h3>
              </div>
              <span className="rounded-full border border-ink-border bg-canvas-subtle px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
                {result.extracted_facts.length} {result.extracted_facts.length === 1 ? 'signal' : 'signals'}
              </span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-stone-100 flex" role="img" aria-label={factStatusOrder.map((status) => `${factCounts[status]} ${factStatusStyles[status].label.toLowerCase()}`).join(', ')}>
              {factStatusOrder.map((status) => factCounts[status] > 0 && (
                <div key={status} className={factStatusStyles[status].color} style={{ width: `${(factCounts[status] / Math.max(result.extracted_facts.length, 1)) * 100}%` }} />
              ))}
              {result.extracted_facts.length === 0 && <div className="w-full bg-stone-200" />}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              {factStatusOrder.map((status) => (
                <div key={status} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-2 text-ink-secondary"><span className={`h-2 w-2 rounded-full ${factStatusStyles[status].dot}`} />{factStatusStyles[status].label}</span>
                  <span className="font-mono font-semibold text-ink">{factCounts[status]}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-ink-border pt-3 text-[11px] leading-relaxed text-ink-muted">Reported details are claims from the submission; observed details are visible in the supplied evidence.</p>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl border border-ink-border bg-white shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Action plan</p>
              <h3 className="mt-1 text-base font-semibold text-ink">Human-reviewed next steps</h3>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">{completedActions}/{result.recommended_actions.length} complete</span>
          </div>
          <div className="mt-5">
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-ink-secondary">Progress</span>
              <span className="font-mono text-2xl font-semibold tracking-tight text-ink">{actionProgress}<span className="text-sm text-ink-muted">%</span></span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-canvas-muted" role="progressbar" aria-label="Recommended actions completed" aria-valuenow={actionProgress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${actionProgress}%` }} />
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-ink-muted">Progress updates as you check off steps below. BridgeAI does not submit reports or contact services.</p>
          </div>
        </div>
      </section>

      {/* Extracted Facts & Evidence Grid */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-ink-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Extracted Facts & Verification Status ({result.extracted_facts.length})
            </h3>
            <span className="text-[10px] text-ink-muted hidden sm:inline">
              (Click any fact to edit)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddFact((prev) => !prev)}
            className="inline-flex items-center space-x-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Fact</span>
          </button>
        </div>

        {/* Add Fact Form */}
        {showAddFact && (
          <div className="p-4 bg-canvas-subtle border border-ink-border rounded-xl space-y-3">
            <div className="text-xs font-bold text-ink">Add Verified Fact to Report</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-ink-secondary mb-1">
                  Field / Attribute
                </label>
                <input
                  type="text"
                  value={newFactField}
                  onChange={(e) => setNewFactField(e.target.value)}
                  placeholder="e.g., Road Closure Status"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-ink-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink-secondary mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={newFactValue}
                  onChange={(e) => setNewFactValue(e.target.value)}
                  placeholder="e.g., Blocked in both directions"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-ink-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink-secondary mb-1">
                  Source Reference
                </label>
                <input
                  type="text"
                  value={newFactSource}
                  onChange={(e) => setNewFactSource(e.target.value)}
                  placeholder="e.g., Police scanner / Dispatch call"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-ink-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink-secondary mb-1">
                  Verification Status
                </label>
                <select
                  value={newFactStatus}
                  onChange={(e) => setNewFactStatus(e.target.value as FactStatus)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-ink-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="observed">Observed (Direct visual/text)</option>
                  <option value="reported">Reported (Citizen statement)</option>
                  <option value="inferred">Inferred (Logical deduction)</option>
                  <option value="unknown">Unknown / Speculative</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddFact(false)}
                className="text-xs text-ink-muted hover:text-ink px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewFact}
                className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Save Fact
              </button>
            </div>
          </div>
        )}

        {/* Fact Cards Table */}
        <div className="divide-y divide-ink-border/70 border border-ink-border rounded-xl overflow-hidden">
          {result.extracted_facts.map((fact, idx) => (
            <div
              key={idx}
              className="p-3.5 hover:bg-canvas-subtle/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-ink">{fact.field}</span>
                  {renderStatusBadge(fact.status)}
                </div>

                {editingFactIndex === idx ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={tempFactValue}
                      onChange={(e) => setTempFactValue(e.target.value)}
                      className="text-xs px-2.5 py-1 bg-white border border-brand-500 rounded-md flex-1 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => saveEditedFact(idx)}
                      className="p-1 rounded bg-brand-500 text-white hover:bg-brand-600"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-ink-secondary leading-relaxed font-normal">
                    {fact.value || <span className="italic text-ink-muted">Not specified / Unknown</span>}
                  </p>
                )}

                <div className="text-[11px] text-ink-muted flex items-center space-x-1">
                  <span>Source:</span>
                  <span className="font-mono text-[10px] text-ink-secondary">{fact.source}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => startEditingFact(idx, fact.value)}
                  className="p-1 text-ink-muted hover:text-brand-600 rounded hover:bg-white transition-colors"
                  title="Edit fact value"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteFact(idx)}
                  className="p-1 text-ink-muted hover:text-red-600 rounded hover:bg-white transition-colors"
                  title="Remove fact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Location & Missing Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Location Verification Card */}
        <div className="p-5 bg-white rounded-2xl border border-ink-border shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Location Analysis
              </h3>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                result.location.status === 'confirmed_from_input'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : result.location.status === 'reported'
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              {result.location.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="text-sm font-medium text-ink bg-canvas-subtle p-3 rounded-xl border border-ink-border">
            {result.location.value || 'No physical location or geographic entities detected.'}
          </div>

          <p className="text-[11px] text-ink-muted leading-relaxed">
            {result.location.status === 'confirmed_from_input'
              ? 'Address or coordinates verified directly against official documentation.'
              : result.location.status === 'reported'
              ? 'Location provided in citizen text/voice, awaiting municipal GPS confirmation.'
              : 'Precise coordinates missing. Responders should verify before dispatch.'}
          </p>
        </div>

        {/* Critical Missing Information Card */}
        <div className="p-5 bg-white rounded-2xl border border-ink-border shadow-card space-y-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Critical Information Gaps ({result.missing_information.length})
            </h3>
          </div>

          {result.missing_information.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-ink-secondary">
              {result.missing_information.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              No critical information gaps identified. Inputs appear complete.
            </p>
          )}

          <p className="text-[11px] text-ink-muted">
            Obtaining these missing data points ensures faster dispatch and reduces responder ambiguity.
          </p>
        </div>
      </div>

      {/* Uncertainty & Limitations */}
      {result.uncertainty_notes.length > 0 && (
        <div className="p-4 sm:p-5 bg-canvas-subtle rounded-2xl border border-ink-border space-y-2">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-ink-muted" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Model Uncertainty & Grounding Disclosures
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-secondary">
            {result.uncertainty_notes.map((note, idx) => (
              <div key={idx} className="flex items-start space-x-2 bg-white/60 p-2.5 rounded-lg border border-ink-border/50">
                <span className="text-brand-600 font-bold">&bull;</span>
                <span className="leading-relaxed">{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Action Plan (Interactive Checklist) */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-ink-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Recommended Action Plan ({result.recommended_actions.filter((a) => a.completed).length}/
              {result.recommended_actions.length} Completed)
            </h3>
          </div>
          <span className="text-[11px] text-ink-muted">
            Mark actions as you complete or confirm them
          </span>
        </div>

        <div className="space-y-3">
          {result.recommended_actions.map((action, idx) => (
            <div
              key={action.id || idx}
              onClick={() => toggleActionComplete(action.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                action.completed
                  ? 'bg-emerald-50/50 border-emerald-200 opacity-75'
                  : 'bg-canvas-subtle hover:bg-canvas-muted/40 border-ink-border'
              }`}
            >
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  checked={Boolean(action.completed)}
                  onChange={() => {}} // handled by parent onClick
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-ink-border cursor-pointer"
                />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4
                    className={`text-xs sm:text-sm font-bold ${
                      action.completed ? 'line-through text-ink-muted' : 'text-ink'
                    }`}
                  >
                    {action.title}
                  </h4>
                  {action.requires_confirmation && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      Requires Human Confirmation
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    action.completed ? 'text-ink-muted' : 'text-ink-secondary'
                  }`}
                >
                  {action.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-center space-x-2">
          <Info className="w-4 h-4 flex-shrink-0 text-amber-700" />
          <span>
            <strong>Safety Mandate:</strong> BridgeAI recommendations are generated algorithmically. No external agencies, municipal hotlines, or medical services have been contacted automatically.
          </span>
        </div>
      </div>

      {/* Raw JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-ink-border max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-ink-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-ink">Structured JSON Schema Output</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="px-2.5 py-1 text-xs font-medium text-ink bg-canvas-subtle hover:bg-canvas-muted rounded-md border border-ink-border flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowJsonModal(false)}
                  className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-canvas-subtle text-xs"
                >
                  Close &times;
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1 font-mono text-xs bg-stone-900 text-stone-100 rounded-b-2xl">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
