import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client securely on the server
// User-Agent must be set to 'aistudio-build' as per guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Official Prebuilt Gemini Voices supported by gemini-3.8-flash-lite-tts & gemini-3.8-flash-tts
const AVAILABLE_VOICES = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Female',
    tone: 'Warm, clear, and soothing',
    style: 'Articulate & Empathetic',
    recommendedFor: 'Audiobooks, Urdu/English Stories, Explanations & Meditation',
    languages: ['Urdu', 'English', 'Hindi', 'Arabic', 'Spanish', 'French', 'German', 'Turkish', 'Japanese'],
    previewText: 'Hello! I am Kore. Welcome to Voicera AI, turning your words into lifelike voice.',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    tone: 'Energetic, dynamic, and youthful',
    style: 'Casual & Upbeat',
    recommendedFor: 'YouTube Videos, Social Media, Gaming & Podcasts',
    languages: ['Urdu', 'English', 'Hindi', 'Arabic', 'Spanish', 'French', 'German', 'Turkish', 'Portuguese'],
    previewText: 'Hey there! Puck here. Let us make your YouTube and social media scripts come alive!',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    tone: 'Deep, resonant, and authoritative',
    style: 'Documentary & Serious',
    recommendedFor: 'Documentaries, Movie Trailers, Corporate Presentations & News',
    languages: ['Urdu', 'English', 'Hindi', 'Arabic', 'Spanish', 'French', 'German', 'Russian'],
    previewText: 'Greetings. I am Charon. Ready to deliver deep, commanding narration for your projects.',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    tone: 'Bold, cinematic, and captivating',
    style: 'Dramatic & Storyteller',
    recommendedFor: 'Storytelling, Cinematic Dialogues, Commercials & Trailers',
    languages: ['Urdu', 'English', 'Hindi', 'Arabic', 'Spanish', 'French', 'German', 'Italian'],
    previewText: 'I am Fenrir. Bring power, weight, and vivid emotion to every sentence you write.',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Female',
    tone: 'Gentle, friendly, and balanced',
    style: 'Conversational & Approachable',
    recommendedFor: 'Customer Support, Daily News, Educational Content & IVR',
    languages: ['Urdu', 'English', 'Hindi', 'Arabic', 'Spanish', 'French', 'German', 'Turkish', 'Bengali'],
    previewText: 'Hi, I am Zephyr. I bring a calm, friendly tone to your educational scripts and apps.',
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    gender: 'Female',
    tone: 'Sophisticated, expressive, and melodic',
    style: 'Poetic & Creative',
    recommendedFor: 'Urdu Poetry, Expressive Podcasts, Literary Arts & High-Emotion',
    languages: ['Urdu', 'English', 'Hindi', 'Arabic', 'Spanish', 'French', 'German', 'Punjabi'],
    previewText: 'Welcome. I am Aoede. Let us turn your poetry, essays, and stories into melodious speech.',
  },
];

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', flag: '🇵🇰' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ / پنجابی', dir: 'ltr', flag: '🇵🇰' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', flag: '🇧🇩' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr', flag: '🇹🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr', flag: '🇨🇳' },
];

// In-memory usage tracker per session / IP
const usageMap = new Map<string, { charactersUsed: number; generationsCount: number; lastReset: number }>();
const FREE_LIMIT_CHARACTERS = 10000;
const MAX_REQUEST_CHARS = 3000;

function getClientUsage(clientId: string) {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  let usage = usageMap.get(clientId);

  if (!usage || (now - usage.lastReset > ONE_DAY)) {
    usage = { charactersUsed: 0, generationsCount: 0, lastReset: now };
    usageMap.set(clientId, usage);
  }
  return usage;
}

// ================= API ROUTES =================

// 1. Health check & model status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Voicera AI',
    model: 'gemini-3.8-flash-lite-tts',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 2. Public configuration
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    appName: 'Voicera AI',
    tagline: 'Turn Your Text Into Natural Voice',
    maxCharactersPerRequest: MAX_REQUEST_CHARS,
    freeTierMonthlyChars: FREE_LIMIT_CHARACTERS,
    supportedLanguages: SUPPORTED_LANGUAGES,
    voicesCount: AVAILABLE_VOICES.length,
  });
});

// 3. Voices catalog
app.get('/api/voices', (_req: Request, res: Response) => {
  res.json({
    voices: AVAILABLE_VOICES,
  });
});

// 4. Usage check
app.get('/api/usage', (req: Request, res: Response) => {
  const clientId = (req.headers['x-client-id'] as string) || req.ip || 'anonymous';
  const usage = getClientUsage(clientId);

  res.json({
    charactersUsed: usage.charactersUsed,
    charactersLimit: FREE_LIMIT_CHARACTERS,
    charactersRemaining: Math.max(0, FREE_LIMIT_CHARACTERS - usage.charactersUsed),
    generationsCount: usage.generationsCount,
    tier: 'Free',
  });
});

// 5. Generate Speech (TTS)
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore', language = 'English', style = 'Natural and clear', speed = 1.0 } = req.body;

    // Validation
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please enter some text first.' });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > MAX_REQUEST_CHARS) {
      return res.status(400).json({
        error: `Text exceeds the maximum length of ${MAX_REQUEST_CHARS} characters. Currently ${trimmedText.length} characters.`,
      });
    }

    const clientId = (req.headers['x-client-id'] as string) || req.ip || 'anonymous';
    const usage = getClientUsage(clientId);

    if (usage.charactersUsed + trimmedText.length > FREE_LIMIT_CHARACTERS) {
      return res.status(429).json({
        error: "You've reached your current usage limit. Please upgrade or try again after your limit resets.",
        usage: {
          charactersUsed: usage.charactersUsed,
          charactersLimit: FREE_LIMIT_CHARACTERS,
        },
      });
    }

    // Verify API Key
    const currentApiKey = process.env.GEMINI_API_KEY;
    if (!currentApiKey) {
      return res.status(503).json({
        error: 'Google AI API key is not configured on the server. Please check the Secrets panel in AI Studio.',
      });
    }

    // Initialize AI instance if not already ready
    if (!ai) {
      ai = new GoogleGenAI({
        apiKey: currentApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    // Check voice validity
    const matchedVoice = AVAILABLE_VOICES.find(
      (v) => v.id.toLowerCase() === String(voice).toLowerCase()
    );
    const selectedVoiceName = matchedVoice ? matchedVoice.id : 'Kore';

    // Construct prompt part with language & style instruction
    // For languages like Urdu, Hindi, Arabic, specifying the language context ensures native pronunciation
    let promptPartText = trimmedText;
    if (language && language !== 'English') {
      promptPartText = `[Speak fluently in ${language} with accurate pronunciation]: ${trimmedText}`;
    }

    // Call gemini-3.8-flash-lite-tts
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: promptPartText,
              speechMetadata: {
                style: style ? `${style}. Natural human cadence.` : 'Clear, expressive speech',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoiceName },
          },
        },
      },
    });

    const candidates = response.candidates;
    const base64Audio = candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      console.error('No audio data returned from Gemini TTS model');
      return res.status(500).json({
        error: "We couldn't generate your voice right now. Please try again in a moment.",
      });
    }

    // Update usage on server
    usage.charactersUsed += trimmedText.length;
    usage.generationsCount += 1;

    // Estimate duration based on word count (~150 words per minute)
    const wordCount = trimmedText.split(/\s+/).filter(Boolean).length;
    const durationEstimate = Math.max(1, Math.round((wordCount / 150) * 60));

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      format: 'wav',
      sampleRate: 24000,
      characters: trimmedText.length,
      words: wordCount,
      durationEstimate,
      voice: selectedVoiceName,
      language,
      style,
      speed,
      id: 'gen_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      usage: {
        charactersUsed: usage.charactersUsed,
        charactersRemaining: Math.max(0, FREE_LIMIT_CHARACTERS - usage.charactersUsed),
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('TTS Generation error:', error?.message || error);

    // Provide safe, user-friendly error messages without revealing internal stack traces
    if (error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('403')) {
      return res.status(403).json({
        error: 'Google AI API key is invalid or lacks necessary permissions.',
      });
    }
    if (error?.message?.includes('429') || error?.message?.includes('Resource has been exhausted')) {
      return res.status(429).json({
        error: 'Google AI quota limit exceeded. Please wait a moment and try again.',
      });
    }

    return res.status(500).json({
      error: "We couldn't generate your voice right now. Please try again.",
    });
  }
});

// Cache for voice previews to avoid regenerating each time
const previewCache = new Map<string, string>();

// 6. Voice preview endpoint
app.post('/api/voices/:voiceId/preview', async (req: Request, res: Response) => {
  try {
    const { voiceId } = req.params;
    const voice = AVAILABLE_VOICES.find((v) => v.id.toLowerCase() === voiceId.toLowerCase());

    if (!voice) {
      return res.status(404).json({ error: 'This voice is not available.' });
    }

    if (previewCache.has(voice.id)) {
      return res.json({
        success: true,
        audioBase64: previewCache.get(voice.id),
        mimeType: 'audio/wav',
        voice: voice.id,
      });
    }

    const currentApiKey = process.env.GEMINI_API_KEY;
    if (!currentApiKey) {
      return res.status(503).json({
        error: 'API key not configured for voice preview.',
      });
    }

    if (!ai) {
      ai = new GoogleGenAI({
        apiKey: currentApiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: voice.previewText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice.id },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      previewCache.set(voice.id, base64Audio);
      return res.json({
        success: true,
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
        voice: voice.id,
      });
    } else {
      return res.status(500).json({ error: 'Failed to generate voice preview.' });
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Voice preview error:', error?.message);
    return res.status(500).json({ error: 'Unable to load preview.' });
  }
});

// Vite dev server middleware or static production serve
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`[Voicera AI Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
