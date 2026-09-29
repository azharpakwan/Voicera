import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2, Copy, Check, Terminal, ExternalLink, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SetupGuideModal: React.FC = () => {
  const { setupGuideOpen, setSetupGuideOpen } = useApp();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!setupGuideOpen) return null;

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      step: 1,
      title: 'How to install dependencies',
      desc: 'Voicera AI requires Node.js 18+ and installs all runtime and development packages via npm.',
      code: 'npm install',
    },
    {
      step: 2,
      title: 'How to configure environment variables',
      desc: 'Create or inspect your .env file. The GEMINI_API_KEY must be kept strictly on the server.',
      code: '# .env\nGEMINI_API_KEY="your_actual_gemini_api_key_here"\nPORT=3000\nNODE_ENV=development',
    },
    {
      step: 3,
      title: 'Where to put the Google AI API key',
      desc: 'In Google AI Studio, open the Secrets panel on the left sidebar and configure GEMINI_API_KEY, or place it into your local .env file. The backend reads process.env.GEMINI_API_KEY securely in server.ts and never exposes it to client browsers.',
      code: 'process.env.GEMINI_API_KEY // Read only in server.ts',
    },
    {
      step: 4,
      title: 'How to start the development server',
      desc: 'Run the full-stack tsx development server which mounts both the Express API routes (/api/*) and Vite dev middleware simultaneously on port 3000.',
      code: 'npm run dev\n# Or directly: tsx server.ts',
    },
    {
      step: 5,
      title: 'How to test Text-to-Speech',
      desc: 'Navigate to "Text to Speech" Studio in the navbar. Select Urdu or English, pick a voice persona (e.g., Kore, Puck, Charon), paste a script or pick a sample, and click "Generate Speech". You will hear the 24kHz natural audio and can download the WAV file immediately.',
      code: '// Test via cURL:\ncurl -X POST http://localhost:3000/api/tts \\\n  -H "Content-Type: application/json" \\\n  -d \'{"text":"Hello from Voicera AI!","voice":"Kore","language":"English"}\'',
    },
    {
      step: 6,
      title: 'How to build the production version',
      desc: 'Compile client assets and types into the dist directory using Vite.',
      code: 'npm run build',
    },
    {
      step: 7,
      title: 'How to deploy',
      desc: 'Voicera AI is optimized for Cloud Run, Docker, or Node.js hosting. Set start script to "tsx server.ts" with NODE_ENV=production.',
      code: 'NODE_ENV=production npm start',
    },
    {
      step: 8,
      title: 'How to change Voicera AI branding',
      desc: 'Open src/config/appConfig.ts. You can change app name, tagline, subtitle, logo colors, and default voice personas in one central place.',
      code: '// src/config/appConfig.ts\nexport const APP_CONFIG = {\n  name: "Voicera AI",\n  tagline: "Turn Your Text Into Natural Voice",\n  ...\n};',
    },
    {
      step: 9,
      title: 'How to add/remove supported languages',
      desc: 'In src/config/appConfig.ts, modify the SUPPORTED_LANGUAGES array. You can add new languages with their language code, native script, text direction (ltr/rtl), and flag.',
      code: 'export const SUPPORTED_LANGUAGES: Language[] = [\n  { code: "ur", name: "Urdu", nativeName: "اردو", dir: "rtl", flag: "🇵🇰" },\n  ...\n];',
    },
    {
      step: 10,
      title: 'How to configure pricing and usage limits',
      desc: 'Adjust free character tiers, monthly caps, and pricing tiers in src/config/appConfig.ts (PRICING_PLANS array) and server-side enforcement variables in server.ts (FREE_LIMIT_CHARACTERS & MAX_REQUEST_CHARS).',
      code: '// server.ts & appConfig.ts\nconst FREE_LIMIT_CHARACTERS = 10000;\nconst MAX_REQUEST_CHARS = 3000;',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Voicera AI — Complete Setup & Architecture Guide
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Steps 1 – 10
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Production architecture, secure API keys, and deployment checklist
              </p>
            </div>
          </div>
          <button
            onClick={() => setSetupGuideOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <p className="font-semibold">Security Architecture Note</p>
              <p>
                Voicera AI uses the modern <strong>gemini-3.8-flash-lite-tts</strong> model via the official <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">@google/genai</code> SDK on the Express server. The client browser communicates exclusively via <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">/api/tts</code>. Your secret key is never exposed to the frontend!
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((s, idx) => (
              <div
                key={s.step}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {s.step}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {s.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => copyCode(s.code, idx)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 transition"
                    title="Copy code"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="mt-3 relative rounded-lg bg-slate-950 p-3 text-slate-200 font-mono text-xs overflow-x-auto">
                  <pre className="whitespace-pre">{s.code}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Voicera AI • Production AI Studio Architecture
          </span>
          <button
            onClick={() => setSetupGuideOpen(false)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
