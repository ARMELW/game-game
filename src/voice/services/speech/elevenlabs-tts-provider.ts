/**
 * ElevenLabs TTS Provider
 * 
 * Uses the ElevenLabs API for high-quality text-to-speech
 * This is a browser-compatible implementation using the REST API
 */

import type { 
  ITTSProvider, 
  TTSCallbacks, 
  TTSConfig, 
  TTSVoice, 
  TTSStatus
} from './tts-provider.interface';
import { TTSProviderType } from './tts-provider.interface';

/**
 * ElevenLabs specific configuration
 */
export interface ElevenLabsConfig extends TTSConfig {
  apiKey?: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;      // 0 to 1
  similarityBoost?: number; // 0 to 1
  style?: number;          // 0 to 1
  useSpeakerBoost?: boolean;
}

/**
 * ElevenLabs voice response structure
 */
interface ElevenLabsVoiceResponse {
  voices: Array<{
    voice_id: string;
    name: string;
    category?: string;
    labels?: Record<string, string>;
    preview_url?: string;
  }>;
}

export class ElevenLabsTTSProvider implements ITTSProvider {
  readonly providerType = TTSProviderType.ElevenLabs;
  
  private static readonly API_BASE = 'https://api.elevenlabs.io/v1';
  private static readonly DEFAULT_VOICE_ID = 'nPczCjzI2devNBz1zQrb'; // Brian - French voice
  private static readonly DEFAULT_MODEL = 'eleven_multilingual_v2';
  
  private callbacks: TTSCallbacks = {};
  private config: ElevenLabsConfig = {
    rate: 1,
    pitch: 1,
    volume: 1,
    language: 'fr-FR',
    voiceId: ElevenLabsTTSProvider.DEFAULT_VOICE_ID,
    modelId: ElevenLabsTTSProvider.DEFAULT_MODEL,
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0,
    useSpeakerBoost: true
  };
  
  private currentAudio: HTMLAudioElement | null = null;
  private isPaused = false;
  private isSpeaking = false;
  private cachedVoices: TTSVoice[] = [];

  constructor(apiKey?: string) {
    if (apiKey) {
      this.config.apiKey = apiKey;
    } else {
      // Try to get from environment variable
      this.config.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || import.meta.env.ELEVENLABS_TOKEN;
    }
    
    console.log('[ElevenLabsTTS] Constructor - API Key configured:', !!this.config.apiKey);
    
    // Preload voices
    this.loadVoices();
  }

  private async loadVoices(): Promise<void> {
    if (!this.config.apiKey) {
      console.warn('[ElevenLabsTTS] No API key, cannot load voices');
      return;
    }
    
    try {
      const response = await fetch(`${ElevenLabsTTSProvider.API_BASE}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.config.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }
      
      const data: ElevenLabsVoiceResponse = await response.json();
      
      this.cachedVoices = data.voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        language: voice.labels?.language || 'multilingual',
        isLocal: false
      }));
      
      console.log('[ElevenLabsTTS] Loaded', this.cachedVoices.length, 'voices');
    } catch (error) {
      console.error('[ElevenLabsTTS] Failed to load voices:', error);
    }
  }

  async speak(text: string): Promise<void> {
    if (!text.trim()) {
      console.warn('[ElevenLabsTTS] Empty text, nothing to speak.');
      this.callbacks.onError?.('Empty text');
      return;
    }
    
    if (!this.isSupported()) {
      console.error('[ElevenLabsTTS] ElevenLabs not configured.');
      this.callbacks.onError?.('ElevenLabs not configured - missing API key');
      return;
    }
    
    console.log('[ElevenLabsTTS] speak() called with:', text.substring(0, 50) + '...');
    
    // Stop current speech
    this.stop();
    
    try {
      this.isSpeaking = true;
      this.callbacks.onStart?.();
      
      const voiceId = this.config.voiceId || ElevenLabsTTSProvider.DEFAULT_VOICE_ID;
      const response = await fetch(
        `${ElevenLabsTTSProvider.API_BASE}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.config.apiKey!
          },
          body: JSON.stringify({
            text,
            model_id: this.config.modelId || ElevenLabsTTSProvider.DEFAULT_MODEL,
            voice_settings: {
              stability: this.config.stability ?? 0.5,
              similarity_boost: this.config.similarityBoost ?? 0.75,
              style: this.config.style ?? 0,
              use_speaker_boost: this.config.useSpeakerBoost ?? true
            }
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }
      
      // Get audio blob and play it
      const audioBlob = await response.blob();
      await this.playAudioBlob(audioBlob);
      
    } catch (error) {
      console.error('[ElevenLabsTTS] Error:', error);
      this.isSpeaking = false;
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async playAudioBlob(blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(blob);
      this.currentAudio = new Audio(audioUrl);
      
      // Apply volume
      this.currentAudio.volume = this.config.volume ?? 1;
      
      // Apply playback rate (for rate control)
      this.currentAudio.playbackRate = this.config.rate ?? 1;
      
      this.currentAudio.onended = () => {
        this.cleanupAudio(audioUrl);
        this.isSpeaking = false;
        this.callbacks.onEnd?.();
        resolve();
      };
      
      this.currentAudio.onerror = (e) => {
        this.cleanupAudio(audioUrl);
        this.isSpeaking = false;
        const errorMsg = 'Audio playback error';
        this.callbacks.onError?.(errorMsg);
        reject(new Error(errorMsg + ': ' + e));
      };
      
      this.currentAudio.play().catch((error) => {
        this.cleanupAudio(audioUrl);
        this.isSpeaking = false;
        this.callbacks.onError?.('Failed to play audio: ' + error.message);
        reject(error);
      });
    });
  }

  private cleanupAudio(audioUrl: string): void {
    URL.revokeObjectURL(audioUrl);
    this.currentAudio = null;
  }

  pause(): void {
    if (this.currentAudio && !this.isPaused) {
      this.currentAudio.pause();
      this.isPaused = true;
      this.callbacks.onPause?.();
    }
  }

  resume(): void {
    if (this.currentAudio && this.isPaused) {
      this.currentAudio.play();
      this.isPaused = false;
      this.callbacks.onResume?.();
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPaused = false;
    this.isSpeaking = false;
  }

  getVoices(): TTSVoice[] {
    return this.cachedVoices;
  }

  getStatus(): TTSStatus {
    return {
      speaking: this.isSpeaking,
      paused: this.isPaused,
      pending: false,
      hasCurrentUtterance: this.currentAudio !== null
    };
  }

  isSupported(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }

  setCallbacks(callbacks: TTSCallbacks): void {
    this.callbacks = callbacks;
  }

  setConfig(config: Partial<ElevenLabsConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): ElevenLabsConfig {
    return { ...this.config };
  }

  /**
   * Set the ElevenLabs API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    // Reload voices with new key
    this.loadVoices();
  }

  /**
   * Set the voice to use by ID
   */
  setVoiceId(voiceId: string): void {
    this.config.voiceId = voiceId;
  }

  /**
   * Set the model to use
   */
  setModel(modelId: string): void {
    this.config.modelId = modelId;
  }
}
