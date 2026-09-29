import { UserUsage } from '../types';

export interface TTSRequestPayload {
  text: string;
  voice: string;
  language: string;
  style?: string;
  speed?: number;
}

export interface TTSResponseData {
  success: boolean;
  audioBase64: string;
  mimeType: string;
  format: 'wav';
  sampleRate: number;
  characters: number;
  words: number;
  durationEstimate: number;
  voice: string;
  language: string;
  style: string;
  speed: number;
  id: string;
  createdAt: string;
  usage?: {
    charactersUsed: number;
    charactersRemaining: number;
  };
}

class ApiService {
  private getClientId(): string {
    let id = localStorage.getItem('voicera_client_id');
    if (!id) {
      id = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem('voicera_client_id', id);
    }
    return id;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-client-id': this.getClientId(),
    };
  }

  async checkHealth(): Promise<{ status: string; appName: string; hasApiKey: boolean; model: string }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'offline', appName: 'Voicera AI', hasApiKey: false, model: 'gemini-3.8-flash-lite-tts' };
    }
  }

  async getUsage(): Promise<UserUsage> {
    try {
      const res = await fetch('/api/usage', {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch usage');
      return await res.json();
    } catch {
      return {
        charactersUsed: 0,
        charactersLimit: 10000,
        charactersRemaining: 10000,
        generationsCount: 0,
        tier: 'Free',
      };
    }
  }

  async generateSpeech(payload: TTSRequestPayload): Promise<TTSResponseData> {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate speech. Please try again.');
    }

    return data;
  }

  async getVoicePreview(voiceId: string): Promise<string> {
    const res = await fetch(`/api/voices/${encodeURIComponent(voiceId)}/preview`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Voice preview unavailable');
    }

    return data.audioBase64;
  }
}

export const apiService = new ApiService();
