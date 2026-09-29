import React, { useState } from 'react';
import {
  Mic2,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Download,
  CheckCircle2,
  ChevronDown,
  Volume2,
  Layers,
  ShieldCheck,
  Video,
  Headphones,
  BookOpen,
  GraduationCap,
  Megaphone,
  Radio,
  FileText,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVAILABLE_VOICES, FAQ_ITEMS, SAMPLE_SCRIPTS, SUPPORTED_LANGUAGES, USE_CASES } from '../config/appConfig';
import { AudioWaveform } from '../components/AudioWaveform';
import { apiService } from '../services/api';

export const LandingPage: React.FC = () => {
  const { setActiveTab, playAudio, setStudioPreload, addToast, addHistoryItem } = useApp();

  // Mini tryout in hero
  const [demoText, setDemoText] = useState('وائیسیرا اے آئی کے ساتھ اپنی تحریر کو انتہائی قدرتی اور دلکش آواز میں تبدیل کریں۔');
  const [demoVoice, setDemoVoice] = useState('Kore');
  const [demoLanguage, setDemoLanguage] = useState('Urdu');
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [demoAudio, setDemoAudio] = useState<{ base64: string; voice: string } | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [previewAudioEl, setPreviewAudioEl] = useState<HTMLAudioElement | null>(null);

  // Active FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Quick voice sample previewing
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  const handleGenerateHeroTTS = async () => {
    if (!demoText.trim()) {
      addToast('Please enter some text first.', 'error');
      return;
    }

    setIsGeneratingDemo(true);
    try {
      const result = await apiService.generateSpeech({
        text: demoText,
        voice: demoVoice,
        language: demoLanguage,
        style: 'Natural and expressive',
      });

      setDemoAudio({ base64: result.audioBase64, voice: demoVoice });
      addHistoryItem({
        id: result.id,
        text: demoText,
        voice: demoVoice,
        language: demoLanguage,
        style: result.style,
        speed: 1,
        audioBase64: result.audioBase64,
        format: 'wav',
        duration: result.durationEstimate,
        characters: result.characters,
        words: result.words,
        createdAt: result.createdAt,
      });

      // Play audio automatically
      if (previewAudioEl) {
        previewAudioEl.src = `data:audio/wav;base64,${result.audioBase64}`;
        previewAudioEl.play();
        setIsPlayingDemo(true);
      } else {
        const el = new Audio(`data:audio/wav;base64,${result.audioBase64}`);
        el.onended = () => setIsPlayingDemo(false);
        el.play();
        setPreviewAudioEl(el);
        setIsPlayingDemo(true);
      }
      addToast('Speech generated successfully!', 'success');
    } catch (err: unknown) {
      const error = err as Error;
      addToast(error.message || 'We could not generate your voice right now.', 'error');
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  const handleVoicePreview = async (voiceId: string) => {
    if (previewingVoiceId === voiceId && previewAudioEl) {
      if (isPlayingDemo) {
        previewAudioEl.pause();
        setIsPlayingDemo(false);
      } else {
        previewAudioEl.play();
        setIsPlayingDemo(true);
      }
      return;
    }

    setPreviewingVoiceId(voiceId);
    try {
      const base64 = await apiService.getVoicePreview(voiceId);
      if (previewAudioEl) previewAudioEl.pause();

      const el = new Audio(`data:audio/wav;base64,${base64}`);
      el.onended = () => {
        setIsPlayingDemo(false);
        setPreviewingVoiceId(null);
      };
      setPreviewAudioEl(el);
      el.play();
      setIsPlayingDemo(true);
    } catch {
      addToast('Voice preview currently unavailable', 'info');
      setPreviewingVoiceId(null);
    }
  };

  const openStudioWithPreset = (text: string, voice: string, language: string) => {
    setStudioPreload({ text, voice, language });
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200 dark:border-slate-800">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          {/* Trust line badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Powered by modern AI voice technology</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-[1.12]">
            Turn Text Into <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">Natural Voice</span>
          </h1>

          {/* Subheading */}
          <p className="mt-5 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Create realistic AI voices from your text in seconds. Perfect for YouTube videos, podcasts, stories, education, advertisements, and more.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setActiveTab('studio')}
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95"
            >
              <Mic2 className="w-5 h-5" />
              <span>Start Creating</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('voices')}
              className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-semibold text-sm sm:text-base border border-slate-200 dark:border-slate-700 shadow-sm hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Layers className="w-5 h-5 text-indigo-500" />
              <span>Explore Voices</span>
            </button>
          </div>

          {/* LIVE MINI TRYOUT CARD IN HERO */}
          <div className="w-full max-w-3xl mt-12 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Live Voice Preview
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Ready
                </span>
              </div>

              {/* Sample script pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setDemoText('وائیسیرا اے آئی کے ساتھ اپنی تحریر کو انتہائی قدرتی اور دلکش آواز میں تبدیل کریں۔');
                    setDemoLanguage('Urdu');
                    setDemoVoice('Kore');
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 font-medium transition shrink-0"
                >
                  🇵🇰 Urdu Sample
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoText("Welcome to Voicera AI. Turn your video scripts and audiobooks into natural human voice.");
                    setDemoLanguage('English');
                    setDemoVoice('Puck');
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 font-medium transition shrink-0"
                >
                  🇬🇧 English Sample
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoText('Voicera AI में आपका स्वागत है। अपनी किसी भी कहानी को स्वाभाविक आवाज़ में बदलें।');
                    setDemoLanguage('Hindi');
                    setDemoVoice('Kore');
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 font-medium transition shrink-0"
                >
                  🇮🇳 Hindi Sample
                </button>
              </div>
            </div>

            {/* Input area */}
            <div className="mt-4">
              <textarea
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                rows={3}
                dir={demoLanguage === 'Urdu' || demoLanguage === 'Arabic' ? 'rtl' : 'ltr'}
                placeholder="Type or paste your text here..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-normal leading-relaxed resize-none"
              />
            </div>

            {/* Controls row */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Language Select */}
                <select
                  value={demoLanguage}
                  onChange={(e) => setDemoLanguage(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.name}>
                      {l.flag} {l.name} ({l.nativeName})
                    </option>
                  ))}
                </select>

                {/* Voice Select */}
                <select
                  value={demoVoice}
                  onChange={(e) => setDemoVoice(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {AVAILABLE_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.gender} • {v.style})
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateHeroTTS}
                  disabled={isGeneratingDemo}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition flex items-center gap-2 active:scale-95"
                >
                  {isGeneratingDemo ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating your voice...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Generate Speech</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated demo player */}
            {demoAudio && (
              <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (!previewAudioEl) return;
                      if (isPlayingDemo) {
                        previewAudioEl.pause();
                        setIsPlayingDemo(false);
                      } else {
                        previewAudioEl.play();
                        setIsPlayingDemo(true);
                      }
                    }}
                    className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 hover:scale-105 active:scale-95 transition"
                  >
                    {isPlayingDemo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Generated Audio ({demoAudio.voice})
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      WAV 24kHz • Crystal Clear Neural Speech
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      openStudioWithPreset(demoText, demoVoice, demoLanguage);
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2"
                  >
                    Open in Studio →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (SECTION 25) */}
      <section className="w-full py-16 md:py-24 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Workflow
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              How Voicera AI Works
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Transform written content into natural spoken voice in four intuitive steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: '1. Write', desc: 'Enter or paste your script, dialogue, or story into the professional text editor.' },
              { step: '02', title: '2. Choose', desc: 'Select a supported language (Urdu, English, Hindi, Arabic, etc.) and an AI voice persona.' },
              { step: '03', title: '3. Generate', desc: 'Create studio-quality AI speech powered by modern Google AI neural models.' },
              { step: '04', title: '4. Download', desc: 'Listen, adjust playback speed, and download your clean WAV audio file instantly.' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all group"
              >
                <span className="text-2xl font-black text-indigo-600/30 dark:text-indigo-400/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.step}
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. VOICE PERSONAS HIGHLIGHT (SECTION 9 & 24) */}
      <section className="w-full py-16 md:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                AI Voice Personas
              </h2>
              <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Human-Grade Vocal Diversity
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                Every voice is distinctively calibrated for tone, resonance, and cadence across multilingual contexts.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('voices')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 self-start md:self-auto"
            >
              <span>Explore all voice details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_VOICES.map((voice) => (
              <div
                key={voice.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600/60 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${voice.avatarColor} text-white font-black text-sm flex items-center justify-center shadow-md`}>
                        {voice.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                          {voice.name}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {voice.gender}
                          </span>
                        </h4>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          {voice.style}
                        </p>
                      </div>
                    </div>

                    {/* Preview button */}
                    <button
                      onClick={() => handleVoicePreview(voice.id)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                      title="Preview voice"
                    >
                      {previewingVoiceId === voice.id && isPlayingDemo ? (
                        <Pause className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {voice.tone}
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Best for: </span>
                    {voice.recommendedFor}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Multilingual</span>
                  </div>
                  <button
                    onClick={() => {
                      setStudioPreload({ voice: voice.id });
                      setActiveTab('studio');
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Use in Studio →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. USE CASES (SECTION 26) */}
      <section className="w-full py-16 md:py-24 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Applications
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Built for Modern Creators & Businesses
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              From fast YouTube shorts to deep Urdu audiobooks, Voicera AI powers limitless vocal projects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {USE_CASES.map((uc) => {
              const icons: Record<string, React.ReactNode> = {
                youtube: <Video className="w-5 h-5 text-rose-500" />,
                podcasts: <Radio className="w-5 h-5 text-indigo-500" />,
                'urdu-stories': <BookOpen className="w-5 h-5 text-emerald-500" />,
                audiobooks: <Headphones className="w-5 h-5 text-violet-500" />,
                education: <GraduationCap className="w-5 h-5 text-amber-500" />,
                ads: <Megaphone className="w-5 h-5 text-cyan-500" />,
              };

              return (
                <div
                  key={uc.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    {icons[uc.id] || <Sparkles className="w-5 h-5 text-indigo-500" />}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {uc.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {uc.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION (SECTION 27) */}
      <section className="w-full py-16 md:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Questions & Answers
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isExpanded ? 'rotate-180 text-indigo-600' : ''
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="w-full py-16 md:py-20 bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-5">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
            Start Right Away
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Turn Your Words Into Natural Voice Today
          </h2>
          <p className="text-sm sm:text-base text-indigo-200 max-w-xl mx-auto leading-relaxed">
            Join thousands of creators using Voicera AI for studio-grade voiceovers, podcasts, and Urdu narrations.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('studio')}
              className="px-8 py-3.5 rounded-xl bg-white text-indigo-950 hover:bg-slate-100 font-extrabold text-sm sm:text-base shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Mic2 className="w-5 h-5 text-indigo-600" />
              <span>Open AI Voice Studio</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
