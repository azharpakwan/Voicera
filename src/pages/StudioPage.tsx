import React, { useState, useEffect, useRef } from 'react';
import {
  Mic2,
  Copy,
  Trash2,
  ClipboardPaste,
  Sparkles,
  Volume2,
  Download,
  RotateCcw,
  Check,
  Search,
  Play,
  Pause,
  Sliders,
  Settings,
  AlertCircle,
  FolderPlus,
  Radio,
  BookOpen,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVAILABLE_VOICES, SUPPORTED_LANGUAGES, STYLE_PRESETS, SAMPLE_SCRIPTS, APP_CONFIG } from '../config/appConfig';
import { AudioWaveform } from '../components/AudioWaveform';
import { apiService } from '../services/api';
import { GenerationItem } from '../types';

export const StudioPage: React.FC = () => {
  const {
    playAudio,
    addHistoryItem,
    downloadAudioFile,
    usage,
    projects,
    addToast,
    studioPreload,
    setStudioPreload,
  } = useApp();

  // Editor state with localStorage auto-save
  const [text, setText] = useState(() => {
    return localStorage.getItem('voicera_draft_text') || 'وائیسیرا اے آئی کے ساتھ اپنی تحریر کو دلکش اور قدرتی آواز میں تبدیل کریں۔';
  });

  // Language & Voice State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Urdu');
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [selectedStyle, setSelectedStyle] = useState<string>('natural');
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Search & Filter for Voices
  const [voiceSearch, setVoiceSearch] = useState<string>('');
  const [voiceGenderFilter, setVoiceGenderFilter] = useState<'All' | 'Female' | 'Male'>('All');

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastGenerated, setLastGenerated] = useState<GenerationItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Studio Player Audio Element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Voice preview playing
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-save draft text
  useEffect(() => {
    localStorage.setItem('voicera_draft_text', text);
  }, [text]);

  // Handle preloaded values if passed from Voice Library or Landing Page
  useEffect(() => {
    if (studioPreload) {
      if (studioPreload.text) setText(studioPreload.text);
      if (studioPreload.voice) setSelectedVoice(studioPreload.voice);
      if (studioPreload.language) setSelectedLanguage(studioPreload.language);
      setStudioPreload(null);
    }
  }, [studioPreload, setStudioPreload]);

  // Text metrics
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const maxChars = APP_CONFIG.maxCharactersPerRequest;
  const isOverLimit = charCount > maxChars;

  // Detect script direction
  const isRtl = selectedLanguage === 'Urdu' || selectedLanguage === 'Arabic';

  // Filtered Voices
  const filteredVoices = AVAILABLE_VOICES.filter((voice) => {
    const matchesSearch =
      voice.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
      voice.style.toLowerCase().includes(voiceSearch.toLowerCase()) ||
      voice.recommendedFor.toLowerCase().includes(voiceSearch.toLowerCase());
    const matchesGender = voiceGenderFilter === 'All' || voice.gender === voiceGenderFilter;
    return matchesSearch && matchesGender;
  });

  const activeVoiceObj = AVAILABLE_VOICES.find((v) => v.id === selectedVoice) || AVAILABLE_VOICES[0];

  // Actions
  const handleClear = () => {
    setText('');
    addToast('Editor cleared', 'info');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    addToast('Text copied to clipboard', 'info');
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText((prev) => (prev ? `${prev}\n${clipboardText}` : clipboardText));
      addToast('Text pasted from clipboard', 'info');
    } catch {
      addToast('Clipboard access was blocked by browser', 'error');
    }
  };

  const handleApplySample = (sample: typeof SAMPLE_SCRIPTS[0]) => {
    setText(sample.text);
    setSelectedLanguage(sample.language);
    setSelectedVoice(sample.voice);
    addToast(`Applied sample: ${sample.title}`, 'info');
  };

  // Preview Voice Sample
  const handlePreviewVoice = async (voiceId: string) => {
    if (previewVoiceId === voiceId && previewAudioRef.current) {
      if (!previewAudioRef.current.paused) {
        previewAudioRef.current.pause();
        setPreviewVoiceId(null);
        return;
      }
    }

    setPreviewVoiceId(voiceId);
    try {
      const base64 = await apiService.getVoicePreview(voiceId);
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const el = new Audio(`data:audio/wav;base64,${base64}`);
      previewAudioRef.current = el;
      el.onended = () => setPreviewVoiceId(null);
      el.play();
    } catch {
      addToast('Voice preview not available right now', 'info');
      setPreviewVoiceId(null);
    }
  };

  // GENERATE SPEECH HANDLER
  const handleGenerateSpeech = async () => {
    setErrorMessage(null);

    // 1. Validate text
    if (!text.trim()) {
      setErrorMessage('Please enter some text first.');
      addToast('Please enter some text first.', 'error');
      return;
    }

    if (charCount > maxChars) {
      setErrorMessage(`Your script exceeds the maximum limit of ${maxChars.toLocaleString()} characters.`);
      addToast('Text exceeds limit.', 'error');
      return;
    }

    // 2. Validate usage
    if (usage.charactersRemaining < charCount) {
      setErrorMessage("You've reached your current usage limit. Please upgrade or try again after your limit resets.");
      addToast("You've reached your usage limit.", 'error');
      return;
    }

    setIsGenerating(true);

    try {
      const styleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
      const stylePrompt = styleObj ? styleObj.prompt : 'Natural human cadence';

      const response = await apiService.generateSpeech({
        text,
        voice: selectedVoice,
        language: selectedLanguage,
        style: stylePrompt,
        speed: speechSpeed,
      });

      const newItem: GenerationItem = {
        id: response.id,
        text,
        voice: selectedVoice,
        language: selectedLanguage,
        style: response.style,
        speed: speechSpeed,
        audioBase64: response.audioBase64,
        format: 'wav',
        duration: response.durationEstimate,
        characters: response.characters,
        words: response.words,
        createdAt: response.createdAt,
        projectId: selectedProjectId || undefined,
        title: text.substring(0, 35) + '...',
      };

      setLastGenerated(newItem);
      addHistoryItem(newItem);

      // Setup audio element
      if (audioRef.current) {
        audioRef.current.src = `data:audio/wav;base64,${response.audioBase64}`;
        audioRef.current.playbackRate = speechSpeed;
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }

      addToast('Speech generated successfully!', 'success');
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "We couldn't generate your voice right now. Please try again.");
      addToast(error.message || "We couldn't generate your voice right now.", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Audio Player Controls
  const togglePlay = () => {
    if (!audioRef.current || !lastGenerated) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (ratio: number) => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = ratio * duration;
      setCurrentTime(ratio * duration);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Sync volume & speed on audioRef
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speechSpeed;
    }
  }, [speechSpeed]);

  const formatSecs = (s: number) => {
    if (isNaN(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hidden audio element for studio player */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              AI Voice Studio
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Gemini 3.8 Neural TTS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Turn your script into authentic, studio-grade speech with full multilingual inflection.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            Samples:
          </span>
          {SAMPLE_SCRIPTS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleApplySample(s)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 font-medium transition shrink-0 border border-slate-200/60 dark:border-slate-700/60"
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN TWO-COLUMN STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: TEXT EDITOR (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Editor Toolbar */}
          <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Script Editor
              </span>
              {isRtl && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  RTL Mode
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePaste}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                title="Copy text"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Clear editor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              dir={isRtl ? 'rtl' : 'ltr'}
              className={`w-full min-h-[340px] sm:min-h-[380px] p-2 bg-transparent text-slate-900 dark:text-white text-base sm:text-lg focus:outline-none resize-y leading-relaxed font-normal ${
                isRtl ? 'font-serif text-right' : ''
              }`}
            />
          </div>

          {/* Footer Bar: Metrics & Limits */}
          <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
              <span className="font-medium">
                Characters: <strong className={isOverLimit ? 'text-rose-500' : 'text-slate-900 dark:text-white'}>{charCount.toLocaleString()}</strong> / {maxChars.toLocaleString()}
              </span>
              <span className="font-medium">
                Words: <strong className="text-slate-900 dark:text-white">{wordCount.toLocaleString()}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Optional Project Assignment */}
              {projects.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Project:</span>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="">No Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: VOICE & GENERATION SETTINGS (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Settings Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-5">
            {/* 1. Language Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                1. Select Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang.name;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLanguage(lang.name)}
                      className={`p-2 rounded-xl text-left border text-xs transition flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Voice Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Choose Voice Persona
                </label>
                {/* Gender toggle */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                  {(['All', 'Female', 'Male'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setVoiceGenderFilter(g)}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        voiceGenderFilter === g
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Cards */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredVoices.map((voice) => {
                  const isSelected = selectedVoice === voice.id;
                  const isPlayingThisPreview = previewVoiceId === voice.id;

                  return (
                    <div
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${voice.avatarColor} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm`}
                        >
                          {voice.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {voice.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {voice.gender}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {voice.style} • {voice.recommendedFor}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Voice preview button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewVoice(voice.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
                          title="Preview voice sample"
                        >
                          {isPlayingThisPreview ? (
                            <Pause className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Style Presets */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                3. Speaking Style Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2 rounded-xl text-left border text-xs transition ${
                      selectedStyle === style.id
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="truncate font-medium">{style.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Fine-Tuning Controls (Speed, Volume) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Speech Speed
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {speechSpeed.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={speechSpeed}
                onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>0.5x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>

            {/* ERROR DISPLAY IF ANY */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/80 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-800 dark:text-rose-200 font-medium">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* PRIMARY GENERATE BUTTON */}
            <button
              onClick={handleGenerateSpeech}
              disabled={isGenerating || isOverLimit}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating your voice...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Speech</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* EMBEDDED GENERATED AUDIO PLAYER (SECTION 12 & 13) */}
      {lastGenerated && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-4 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Your Generated Voice</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Ready • WAV 24kHz
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Voice: <strong>{lastGenerated.voice}</strong> • Language: <strong>{lastGenerated.language}</strong> • {lastGenerated.characters.toLocaleString()} characters
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateSpeech}
                disabled={isGenerating}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                onClick={() => downloadAudioFile(lastGenerated)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Audio (.wav)</span>
              </button>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              onClick={handleRestart}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              title="Restart"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Waveform Scrubber */}
            <div className="flex-1 w-full flex items-center gap-3">
              <span className="font-mono text-xs text-slate-500 w-10 text-right">
                {formatSecs(currentTime)}
              </span>
              <div className="flex-1">
                <AudioWaveform
                  isPlaying={isPlaying}
                  progress={duration > 0 ? currentTime / duration : 0}
                  height={36}
                  barCount={48}
                  onClickSeek={handleSeek}
                />
              </div>
              <span className="font-mono text-xs text-slate-500 w-10">
                {formatSecs(duration || lastGenerated.duration)}
              </span>
            </div>

            {/* Playback speed selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Speed:</span>
              <select
                value={speechSpeed}
                onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="0.75">0.75x</option>
                <option value="1.0">1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2.0">2.0x</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
