import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onAudioRecorded: (file: File) => void;
  onCancel?: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine supported audio mime type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop all audio tracks to release microphone hardware indicator
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // collect chunks every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. Please allow microphone permission in your browser.');
      } else {
        setErrorMessage('Could not access microphone. Ensure a recording device is connected.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (!audioElementRef.current || !audioUrl) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleSaveAndAttach = () => {
    if (audioChunksRef.current.length === 0) return;
    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    const ext = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : 'webm';
    const blob = new Blob(audioChunksRef.current, { type: mimeType });
    const filename = `voice_note_${new Date().toISOString().replace(/[:.]/g, '-')}.${ext}`;
    const file = new File([blob], filename, { type: mimeType });
    
    onAudioRecorded(file);
    discardRecording();
  };

  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    setIsRecording(false);
    if (onCancel) onCancel();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-canvas-subtle border border-ink-border rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-brand-500'}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            {isRecording ? 'Recording Voice Note' : audioUrl ? 'Voice Note Ready' : 'Record Audio Evidence'}
          </span>
        </div>
        {isRecording && (
          <span className="font-mono text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            {formatTime(recordingSeconds)}
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Recording State Controls */}
      {!audioUrl && (
        <div className="flex items-center space-x-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium rounded-lg transition-colors shadow-subtle"
            >
              <Mic className="w-4 h-4" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors shadow-subtle animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Recording</span>
            </button>
          )}

          {onCancel && !isRecording && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-ink-muted hover:text-ink-secondary px-2 py-1"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Audio Playback & Confirmation Preview */}
      {audioUrl && (
        <div className="space-y-3">
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
            className="hidden"
          />

          <div className="flex items-center space-x-3 bg-white p-2.5 rounded-lg border border-ink-border">
            <button
              type="button"
              onClick={togglePlayback}
              className="p-2 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="flex-1">
              <div className="text-xs font-medium text-ink">Recorded Audio Clip</div>
              <div className="text-[11px] text-ink-muted">{formatTime(recordingSeconds)} duration</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={discardRecording}
              className="inline-flex items-center space-x-1.5 text-xs text-ink-muted hover:text-red-600 px-2 py-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndAttach}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium rounded-lg transition-colors shadow-subtle"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Attach Voice Note</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
