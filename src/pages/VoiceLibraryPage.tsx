import React, { useState, useRef } from 'react';
import {
  Layers,
  Search,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Filter,
  Check,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVAILABLE_VOICES, SUPPORTED_LANGUAGES } from '../config/appConfig';
import { apiService } from '../services/api';

export const VoiceLibraryPage: React.FC = () => {
  const { setActiveTab, setStudioPreload, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Female' | 'Male'>('All');

  // Preview audio state
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePreview = async (voiceId: string) => {
    if (activePreviewId === voiceId && audioRef.current) {
      if (isPlayingPreview) {
        audioRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        audioRef.current.play();
        setIsPlayingPreview(true);
      }
      return;
    }

    setActivePreviewId(voiceId);
    try {
      const base64 = await apiService.getVoicePreview(voiceId);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const el = new Audio(`data:audio/wav;base64,${base64}`);
      audioRef.current = el;
      el.onended = () => {
        setIsPlayingPreview(false);
        setActivePreviewId(null);
      };
      el.play();
      setIsPlayingPreview(true);
    } catch {
      addToast('Voice preview unavailable', 'info');
      setActivePreviewId(null);
    }
  };

  const handleUseVoice = (voiceId: string) => {
    setStudioPreload({ voice: voiceId });
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter voices
  const filteredVoices = AVAILABLE_VOICES.filter((voice) => {
    const matchesSearch =
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.tone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.recommendedFor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGender = selectedGender === 'All' || voice.gender === selectedGender;
    const matchesLang =
      selectedLanguage === 'All' || voice.languages.includes(selectedLanguage);

    return matchesSearch && matchesGender && matchesLang;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Voice Library
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {AVAILABLE_VOICES.length} Gemini Neural Models
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Browse our curated roster of voices. Listen to samples and click "Use Voice" to start generating in Studio.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search voice name, style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Language Filter */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0">
            Language:
          </span>
          <button
            onClick={() => setSelectedLanguage('All')}
            className={`px-3 py-1 rounded-lg font-semibold transition shrink-0 ${
              selectedLanguage === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Languages
          </button>
          {['Urdu', 'English', 'Hindi', 'Arabic', 'Spanish', 'German'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1 rounded-lg font-medium transition shrink-0 ${
                selectedLanguage === lang
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Gender Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400">Gender:</span>
          {(['All', 'Female', 'Male'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => setSelectedGender(gender)}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                selectedGender === gender
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVoices.map((voice) => {
          const isThisPlaying = activePreviewId === voice.id && isPlayingPreview;

          return (
            <div
              key={voice.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${voice.avatarColor} text-white font-black text-base flex items-center justify-center shadow-md`}
                    >
                      {voice.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        {voice.name}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {voice.gender}
                        </span>
                      </h3>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {voice.style}
                      </p>
                    </div>
                  </div>

                  {/* Play preview button */}
                  <button
                    onClick={() => handlePreview(voice.id)}
                    className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 transition shadow-sm active:scale-95"
                    title="Listen to voice sample"
                  >
                    {isThisPlaying ? (
                      <Pause className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {voice.tone}
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
                  <p className="text-slate-500 dark:text-slate-400">
                    <strong className="text-slate-700 dark:text-slate-300">Ideal for:</strong>{' '}
                    {voice.recommendedFor}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 truncate">
                    <strong className="text-slate-700 dark:text-slate-300">Fluent:</strong>{' '}
                    {voice.languages.slice(0, 4).join(', ')} + {voice.languages.length - 4} more
                  </p>
                </div>
              </div>

              {/* Card Footer action: Use Voice */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Model: 24kHz Unary
                </span>
                <button
                  onClick={() => handleUseVoice(voice.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition active:scale-95"
                >
                  <span>Use Voice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
