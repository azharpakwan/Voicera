import React from 'react';
import { Mic2, ShieldCheck, Heart, BookOpen, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const Footer: React.FC = () => {
  const { setActiveTab, setSetupGuideOpen } = useApp();

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors pt-12 pb-24 md:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="17" y1="5" x2="17" y2="19" />
                  <line x1="7" y1="5" x2="7" y2="19" />
                  <line x1="22" y1="10" x2="22" y2="14" />
                  <line x1="2" y1="10" x2="2" y2="14" />
                </svg>
              </div>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                Voicera <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
            </div>

            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Turn Your Text Into Natural Voice
            </p>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Voicera AI brings your scripts, stories, and educational content to life with lifelike neural speech in Urdu, English, Hindi, Arabic, and 11+ languages.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Google AI Studio Powered</span>
              </div>
              <button
                onClick={() => setSetupGuideOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition"
              >
                <BookOpen className="w-3 h-3" />
                <span>Setup Guide (1-10)</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('studio')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Text to Speech Studio
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('voices')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Voice Library
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('history')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Generation History
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('projects')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Projects Workspace
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('pricing')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Pricing Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Security & Legal
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition">
                  Commercial License
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition">
                  Security & API Boundaries
                </span>
              </li>
              <li>
                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition">
                  Contact Support
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Voicera AI. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Powered by modern AI voice technology</span>
            <span>•</span>
            <span className="text-emerald-500 font-medium">Server Status: 100% Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
