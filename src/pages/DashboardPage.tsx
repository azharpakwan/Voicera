import React from 'react';
import {
  Mic2,
  FolderOpen,
  History,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Play,
  Pause,
  Download,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AVAILABLE_VOICES } from '../config/appConfig';

export const DashboardPage: React.FC = () => {
  const {
    user,
    usage,
    history,
    projects,
    setActiveTab,
    playAudio,
    activeAudio,
    isPlaying,
    downloadAudioFile,
    setStudioPreload,
  } = useApp();

  const percentUsed = Math.min(100, Math.round((usage.charactersUsed / usage.charactersLimit) * 100));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>{user.plan} Account Active</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome to Voicera AI, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Monitor real-time TTS character consumption, manage project scripts, and generate lifelike Urdu and English voices.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('studio')}
          className="px-6 py-3 rounded-xl bg-white text-indigo-950 hover:bg-slate-100 font-extrabold text-xs sm:text-sm shadow-lg transition active:scale-95 flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <Mic2 className="w-4 h-4 text-indigo-600" />
          <span>Create New Voice</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Characters Used */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Characters Used</span>
            <span className="font-bold text-indigo-600">{percentUsed}%</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {usage.charactersUsed.toLocaleString()}
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {usage.charactersRemaining.toLocaleString()} remaining in {user.plan} tier
          </p>
        </div>

        {/* 2. Generations Count */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Generations
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white pt-2">
            {history.length}
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            Lifetime session speech synthesis outputs
          </p>
        </div>

        {/* 3. Projects Count */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Projects
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white pt-2">
            {projects.length}
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            Organized audio project workspaces
          </p>
        </div>

        {/* 4. Available Voices */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Available Voices
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white pt-2">
            {AVAILABLE_VOICES.length}
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            Prebuilt Gemini 3.8 neural models
          </p>
        </div>
      </div>

      {/* Recent Generations & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Generations (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Generations
            </h3>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {history.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-500">
              No generations created yet. Start in the Voice Studio!
            </p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((item) => {
                const isThisPlaying = activeAudio?.id === item.id && isPlaying;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => playAudio(item)}
                        className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm"
                      >
                        {isThisPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          "{item.text}"
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Voice: {item.voice} • {item.language} • {item.characters} chars
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadAudioFile(item)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Projects (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Projects
            </h3>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => setActiveTab('projects')}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-indigo-400 cursor-pointer transition text-xs"
              >
                <h4 className="font-bold text-slate-900 dark:text-white truncate">
                  {proj.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {proj.description || 'No description'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
