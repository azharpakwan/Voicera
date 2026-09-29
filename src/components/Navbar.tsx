import React, { useState } from 'react';
import {
  Mic2,
  FolderOpen,
  History,
  Sparkles,
  CreditCard,
  Sun,
  Moon,
  Menu,
  X,
  User,
  BookOpen,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    usage,
    history,
    setAuthModalOpen,
    setAuthModalTab,
    setSetupGuideOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'studio', label: 'Text to Speech', icon: <Mic2 className="w-4 h-4" /> },
    { id: 'voices', label: 'Voices', icon: <Layers className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" />, badge: history.length },
    { id: 'projects', label: 'Projects', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'pricing', label: 'Pricing', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <svg
              className="w-5 h-5 text-white"
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
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800 dark:from-white dark:via-slate-100 dark:to-indigo-300 bg-clip-text text-transparent">
                Voicera
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-600 text-white shadow-sm shadow-indigo-500/30">
                AI
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline -mt-0.5">
              Turn Text Into Natural Voice
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side tools: Usage, Theme toggle, Guide, Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Usage pill */}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 cursor-pointer transition border border-slate-200/60 dark:border-slate-700/60"
            title="View Usage & Dashboard"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">
              {usage.charactersUsed.toLocaleString()} / {usage.charactersLimit.toLocaleString()} chars
            </span>
          </div>

          {/* Setup Guide Icon */}
          <button
            onClick={() => setSetupGuideOpen(true)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Setup & Integration Guide (Step 1-10)"
            aria-label="Setup guide"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Sign In / Profile button */}
          <button
            onClick={() => {
              setAuthModalTab('profile');
              setAuthModalOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
          >
            <User className="w-3.5 h-3.5 text-indigo-500" />
            <span>Profile</span>
          </button>

          {/* Primary CTA: Start Creating */}
          <button
            onClick={() => handleNavClick('studio')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition active:scale-95"
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-1 shadow-xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          ))}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Usage: {usage.charactersUsed.toLocaleString()} / {usage.charactersLimit.toLocaleString()} chars
            </span>
            <button
              onClick={() => {
                setAuthModalTab('profile');
                setAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
            >
              My Account
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
