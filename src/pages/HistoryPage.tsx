import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Trash2,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GenerationItem } from '../types';

export const HistoryPage: React.FC = () => {
  const {
    history,
    deleteHistoryItem,
    clearHistory,
    playAudio,
    pauseAudio,
    activeAudio,
    isPlaying,
    downloadAudioFile,
    setActiveTab,
    setStudioPreload,
  } = useApp();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const filteredHistory = history.filter((item) =>
    item.text.toLowerCase().includes(filterQuery.toLowerCase()) ||
    item.voice.toLowerCase().includes(filterQuery.toLowerCase()) ||
    item.language.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleRegenerateInStudio = (item: GenerationItem) => {
    setStudioPreload({
      text: item.text,
      voice: item.voice,
      language: item.language,
    });
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Generation History
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {history.length} records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Access, replay, and download all past speech generations stored in your local session.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfirmClearOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All History</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Clear all generation history?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will permanently delete all {history.length} generated audio records from your browser storage.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setConfirmClearOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No generations recorded yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Your voice generations will appear here automatically with instant replay and download options.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('studio')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5"
          >
            <span>Create First Voice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isThisPlaying = activeAudio?.id === item.id && isPlaying;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left text & metadata */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => {
                      if (isThisPlaying) {
                        pauseAudio();
                      } else {
                        playAudio(item);
                      }
                    }}
                    className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 active:scale-95 transition"
                    title={isThisPlaying ? 'Pause' : 'Play audio'}
                  >
                    {isThisPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                      "{item.text}"
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        Voice: {item.voice}
                      </span>
                      <span>•</span>
                      <span>{item.language}</span>
                      <span>•</span>
                      <span>{item.characters.toLocaleString()} chars</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    onClick={() => handleRegenerateInStudio(item)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition"
                    title="Open and regenerate in Studio"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => downloadAudioFile(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition"
                    title="Download WAV file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
