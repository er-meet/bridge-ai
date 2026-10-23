import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  FileText,
  Music,
  Mic,
  X,
  ArrowRight,
  AlertTriangle,
  Waves,
  FileHeart,
  Loader2,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { UploadedFileItem } from '../types/index.js';
import { SCENARIO_PRESETS } from '../data/demoScenarios.js';
import { AudioRecorder } from './AudioRecorder.js';

interface WorkspaceInputProps {
  onAnalyze: (text: string, files: File[], scenarioId?: string, overrideDemo?: boolean) => Promise<void>;
  isAnalyzing: boolean;
  analysisStage: string;
  isDemoMode: boolean;
  onSelectScenario: (scenarioId: string) => void;
  onSwitchToDemo?: () => void;
  maxFileSizeMB?: number;
}

export const WorkspaceInput: React.FC<WorkspaceInputProps> = ({
  onAnalyze,
  isAnalyzing,
  analysisStage,
  isDemoMode,
  onSelectScenario,
  onSwitchToDemo,
  maxFileSizeMB = 10,
}) => {
  const [inputText, setInputText] = useState('');
  const [fileList, setFileList] = useState<UploadedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to categorize files
  const getFileCategory = (type: string, name: string): 'image' | 'pdf' | 'audio' | 'document' => {
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) return 'pdf';
    if (type.startsWith('audio/') || name.toLowerCase().match(/\.(mp3|wav|ogg|m4a|aac|webm)$/)) return 'audio';
    return 'document';
  };

  const handleFilesAdded = (files: FileList | File[]) => {
    setErrorMessage(null);
    const addedFiles: UploadedFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate size limit
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the ${maxFileSizeMB}MB size limit.`);
        continue;
      }

      const category = getFileCategory(file.type, file.name);
      let previewUrl: string | undefined = undefined;
      if (category === 'image') {
        previewUrl = URL.createObjectURL(file);
      }

      addedFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        category,
        previewUrl,
        isPresetSample: false,
      });
    }

    if (addedFiles.length + fileList.length > 5) {
      setErrorMessage('Maximum 5 files can be submitted in one analysis.');
      return;
    }

    setFileList((prev) => [...prev, ...addedFiles]);
    setActivePresetId(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFileList((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleScenarioClick = (presetId: string) => {
    const scenario = SCENARIO_PRESETS.find((s) => s.id === presetId);
    if (!scenario) return;

    setActivePresetId(presetId);
    setInputText(scenario.sampleInputText);
    setErrorMessage(null);

    // Clean up old preview URLs
    fileList.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });

    // Create chip representations of the sample files
    const simulatedFiles: UploadedFileItem[] = scenario.sampleFiles.map((sf, idx) => ({
      id: `preset-file-${presetId}-${idx}`,
      name: sf.name,
      size: sf.size,
      type: sf.type === 'image' ? 'image/jpeg' : sf.type === 'pdf' ? 'application/pdf' : 'audio/mp3',
      category: sf.type,
      isPresetSample: true,
    }));

    setFileList(simulatedFiles);
    onSelectScenario(presetId);
  };

  const handleSubmit = async (overrideDemo?: boolean) => {
    if (!inputText.trim() && fileList.length === 0) {
      setErrorMessage('Please provide a text description or attach at least one piece of evidence.');
      return;
    }

    setErrorMessage(null);

    // Extract actual File objects
    const rawFiles: File[] = fileList.filter((f) => f.file).map((f) => f.file as File);

    try {
      await onAnalyze(inputText, rawFiles, activePresetId || undefined, overrideDemo);
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis request failed. Please check inputs and retry.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Hero Headline & Instructions */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Turn complex information into clear next steps.
        </h1>
        <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
          Describe a situation, upload evidence, or combine multiple inputs. BridgeAI will organize the information
          and help you determine what to do next.
        </p>
      </div>

      {/* Preset Scenarios Carousel */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Try a real-world scenario
          </span>
          {isDemoMode && (
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Preset Demo Ready
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SCENARIO_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleScenarioClick(preset.id)}
                className={`text-left p-3.5 rounded-xl border transition-all relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-brand-50/50 border-brand-500 ring-1 ring-brand-500 shadow-sm'
                    : 'bg-white hover:bg-canvas-subtle border-ink-border hover:border-ink-borderHover shadow-subtle'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        preset.id === 'road-hazard'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : preset.id === 'disaster-assistance'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {preset.badge}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                  </div>
                  <h3 className="text-xs font-bold text-ink mb-1 group-hover:text-brand-600 transition-colors">
                    {preset.title}
                  </h3>
                  <p className="text-[11px] text-ink-secondary line-clamp-2 leading-relaxed">
                    {preset.shortDescription}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-ink-border/50 flex items-center justify-between text-[11px] text-ink-muted">
                  <span>{preset.sampleFiles.length} sample evidence file(s)</span>
                  <span className="font-medium text-brand-600 group-hover:underline">Load &rarr;</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Input Box */}
      <div className="bg-white rounded-2xl border border-ink-border shadow-card overflow-hidden">
        {/* Multiline Text Area */}
        <div className="p-4 sm:p-5">
          <label htmlFor="situation-description" className="sr-only">
            Situation description
          </label>
          <textarea
            id="situation-description"
            rows={4}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setActivePresetId(null);
            }}
            placeholder="Describe the situation in your own words... (e.g., 'A tree limb collapsed on power lines on 4th Street, sparking near parked cars...')"
            className="w-full text-sm text-ink placeholder-ink-muted resize-none border-0 focus:ring-0 focus:outline-none p-0 leading-relaxed min-h-[96px]"
          />
        </div>

        {/* In-Browser Audio Recorder Panel */}
        {showRecorder && (
          <div className="px-4 sm:px-5 pb-4">
            <AudioRecorder
              onAudioRecorded={(audioFile) => {
                handleFilesAdded([audioFile]);
                setShowRecorder(false);
              }}
              onCancel={() => setShowRecorder(false)}
            />
          </div>
        )}

        {/* Attached Files List */}
        {fileList.length > 0 && (
          <div className="px-4 sm:px-5 pb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
              Attached Evidence ({fileList.length}/5)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {fileList.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 bg-canvas-subtle border border-ink-border rounded-xl text-xs"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {file.category === 'image' ? (
                      file.previewUrl ? (
                        <img
                          src={file.previewUrl}
                          alt={file.name}
                          className="w-8 h-8 rounded object-cover flex-shrink-0 border border-ink-border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-200">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )
                    ) : file.category === 'pdf' ? (
                      <div className="w-8 h-8 rounded bg-red-50 text-red-700 flex items-center justify-center flex-shrink-0 border border-red-200">
                        <FileText className="w-4 h-4" />
                      </div>
                    ) : file.category === 'audio' ? (
                      <div className="w-8 h-8 rounded bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 border border-purple-200">
                        <Music className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-stone-100 text-stone-700 flex items-center justify-center flex-shrink-0 border border-stone-200">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">{file.name}</p>
                      <p className="text-[11px] text-ink-muted">
                        {formatFileSize(file.size)} &bull; {file.category.toUpperCase()}
                        {file.isPresetSample && ' (Preset sample)'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="p-1 rounded-md text-ink-muted hover:text-red-600 hover:bg-white transition-colors"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drag-and-Drop Area & Action Bar */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-t border-ink-border px-4 py-3 sm:px-5 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
            isDragging ? 'bg-brand-50/70 border-brand-500' : 'bg-canvas-subtle/50'
          }`}
        >
          {/* Multimodal Quick Attach Buttons */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            {/* Hidden native inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
            />
            <input
              ref={docInputRef}
              type="file"
              accept="application/pdf,text/plain"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
            />

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink bg-white hover:bg-canvas-subtle border border-ink-border transition-colors shadow-subtle"
              title="Upload photo evidence (JPG, PNG, WEBP)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Photo</span>
            </button>

            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink bg-white hover:bg-canvas-subtle border border-ink-border transition-colors shadow-subtle"
              title="Upload document or report (PDF, TXT)"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Document</span>
            </button>

            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink bg-white hover:bg-canvas-subtle border border-ink-border transition-colors shadow-subtle"
              title="Upload audio file (MP3, WAV, OGG, M4A)"
            >
              <Music className="w-3.5 h-3.5 text-purple-600" />
              <span>Audio File</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRecorder((prev) => !prev)}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-subtle ${
                showRecorder
                  ? 'bg-brand-50 text-brand-700 border-brand-300'
                  : 'bg-white text-ink-secondary hover:text-ink hover:bg-canvas-subtle border-ink-border'
              }`}
              title="Record voice note directly via browser microphone"
            >
              <Mic className="w-3.5 h-3.5 text-red-600" />
              <span>Record Voice</span>
            </button>

            <span className="hidden lg:inline text-[11px] text-ink-muted ml-2">
              or drop files here
            </span>
          </div>

          {/* Primary Analyze Action Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isAnalyzing || (!inputText.trim() && fileList.length === 0)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-ink text-white hover:bg-ink-secondary disabled:bg-stone-300 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-subtle ml-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{analysisStage || 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <span>Analyze & Structure</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start space-x-2.5 shadow-subtle animate-in fade-in">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div>
              <span className="font-semibold">Analysis Warning: </span>
              <span>{errorMessage}</span>
            </div>
            {onSwitchToDemo && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onSwitchToDemo();
                    setErrorMessage(null);
                    handleSubmit(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-subtle transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Switch to Demo Mode & Analyze Immediately</span>
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
