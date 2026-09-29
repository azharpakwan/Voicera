import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ActiveTab, GenerationItem, Project, UserProfile, UserUsage } from '../types';
import { APP_CONFIG } from '../config/appConfig';
import { apiService } from '../services/api';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  usage: UserUsage;
  refreshUsage: () => Promise<void>;
  history: GenerationItem[];
  addHistoryItem: (item: GenerationItem) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  projects: Project[];
  createProject: (name: string, description?: string) => Project;
  deleteProject: (id: string) => void;
  activeAudio: GenerationItem | null;
  isPlaying: boolean;
  playAudio: (item: GenerationItem) => void;
  pauseAudio: () => void;
  toggleAudioPlay: () => void;
  audioCurrentTime: number;
  audioDuration: number;
  setAudioCurrentTime: (time: number) => void;
  audioVolume: number;
  setAudioVolume: (volume: number) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'signup' | 'profile' | 'forgot';
  setAuthModalTab: (tab: 'login' | 'signup' | 'profile' | 'forgot') => void;
  setupGuideOpen: boolean;
  setSetupGuideOpen: (open: boolean) => void;
  studioPreload: { text?: string; voice?: string; language?: string } | null;
  setStudioPreload: (preload: { text?: string; voice?: string; language?: string } | null) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  downloadAudioFile: (item: GenerationItem) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_USER: UserProfile = {
  id: 'usr_guest',
  name: 'Mian Rehman',
  email: 'mianrehmanrauf777@gmail.com',
  plan: 'Free',
  defaultLanguage: 'Urdu',
  defaultVoice: 'Kore',
  themePreference: 'dark',
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    name: 'YouTube Tech Series',
    description: 'Weekly tech review and generative AI news voiceovers',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    itemCount: 2,
  },
  {
    id: 'proj_2',
    name: 'Urdu Audio Stories (کہانیاں)',
    description: 'Classic literature and folklore audio recordings in Urdu',
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    itemCount: 3,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('voicera_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark'; // Default dark for sleek AI look
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('voicera_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('voicera_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_USER;
  });

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('voicera_user', JSON.stringify(updated));
      return updated;
    });
    addToast('Profile updated successfully', 'success');
  };

  // Usage state
  const [usage, setUsage] = useState<UserUsage>({
    charactersUsed: 0,
    charactersLimit: APP_CONFIG.freeTierLimit,
    charactersRemaining: APP_CONFIG.freeTierLimit,
    generationsCount: 0,
    tier: 'Free',
  });

  const refreshUsage = useCallback(async () => {
    try {
      const data = await apiService.getUsage();
      setUsage(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  // History state
  const [history, setHistory] = useState<GenerationItem[]>(() => {
    const saved = localStorage.getItem('voicera_history');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('voicera_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Storage quota exceeded, trimming older history items', e);
      if (history.length > 5) {
        localStorage.setItem('voicera_history', JSON.stringify(history.slice(0, 5)));
      }
    }
  }, [history]);

  const addHistoryItem = (item: GenerationItem) => {
    setHistory((prev) => [item, ...prev]);
    refreshUsage();
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeAudio?.id === id) {
      pauseAudio();
      setActiveAudio(null);
    }
    addToast('Generation deleted from history', 'info');
  };

  const clearHistory = () => {
    setHistory([]);
    pauseAudio();
    setActiveAudio(null);
    localStorage.removeItem('voicera_history');
    addToast('All generation history cleared', 'info');
  };

  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('voicera_projects');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_PROJECTS;
  });

  useEffect(() => {
    localStorage.setItem('voicera_projects', JSON.stringify(projects));
  }, [projects]);

  const createProject = (name: string, description: string = '') => {
    const newProj: Project = {
      id: 'proj_' + Date.now(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemCount: 0,
    };
    setProjects((prev) => [newProj, ...prev]);
    addToast(`Project "${name}" created`, 'success');
    return newProj;
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    addToast('Project deleted', 'info');
  };

  // Audio Playback Engine
  const [activeAudio, setActiveAudio] = useState<GenerationItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(1.0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = new Audio();
    el.preload = 'auto';

    el.onplay = () => setIsPlaying(true);
    el.onpause = () => setIsPlaying(false);
    el.onended = () => {
      setIsPlaying(false);
      setAudioCurrentTime(0);
    };
    el.ontimeupdate = () => {
      setAudioCurrentTime(el.currentTime);
      if (el.duration && !isNaN(el.duration)) {
        setAudioDuration(el.duration);
      }
    };
    el.onloadedmetadata = () => {
      if (el.duration && !isNaN(el.duration)) {
        setAudioDuration(el.duration);
      }
    };

    setAudioElement(el);

    return () => {
      el.pause();
      el.src = '';
    };
  }, []);

  const playAudio = (item: GenerationItem) => {
    if (!audioElement) return;

    if (activeAudio?.id === item.id) {
      audioElement.play().catch(console.error);
      setIsPlaying(true);
      return;
    }

    setActiveAudio(item);
    audioElement.src = `data:audio/wav;base64,${item.audioBase64}`;
    audioElement.playbackRate = playbackSpeed;
    audioElement.volume = audioVolume;
    audioElement.play().then(() => {
      setIsPlaying(true);
    }).catch(console.error);
  };

  const pauseAudio = () => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  const toggleAudioPlay = () => {
    if (!audioElement || !activeAudio) return;
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(console.error);
    }
  };

  // Sync volume with element
  useEffect(() => {
    if (audioElement) {
      audioElement.volume = audioVolume;
    }
  }, [audioVolume, audioElement]);

  // Sync playback rate with element
  useEffect(() => {
    if (audioElement) {
      audioElement.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, audioElement]);

  // Download audio helper
  const downloadAudioFile = (item: GenerationItem) => {
    try {
      const byteCharacters = atob(item.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeTitle = (item.title || item.voice + '_' + item.language)
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, '_')
        .substring(0, 30);
      link.href = url;
      link.download = `voicera_${safeTitle}_${item.id}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('Download started (.wav format)', 'success');
    } catch (err) {
      console.error('Download error:', err);
      addToast('Failed to download audio file', 'error');
    }
  };

  // Modals & Preloads
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'profile' | 'forgot'>('login');
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);
  const [studioPreload, setStudioPreload] = useState<{ text?: string; voice?: string; language?: string } | null>(null);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        user,
        updateUserProfile,
        usage,
        refreshUsage,
        history,
        addHistoryItem,
        deleteHistoryItem,
        clearHistory,
        projects,
        createProject,
        deleteProject,
        activeAudio,
        isPlaying,
        playAudio,
        pauseAudio,
        toggleAudioPlay,
        audioCurrentTime,
        audioDuration,
        setAudioCurrentTime: (time: number) => {
          if (audioElement) audioElement.currentTime = time;
          setAudioCurrentTime(time);
        },
        audioVolume,
        setAudioVolume,
        playbackSpeed,
        setPlaybackSpeed,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        setupGuideOpen,
        setSetupGuideOpen,
        studioPreload,
        setStudioPreload,
        toasts,
        addToast,
        removeToast,
        downloadAudioFile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
