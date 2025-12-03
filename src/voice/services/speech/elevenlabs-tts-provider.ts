/**
 * ElevenLabs TTS Provider
 * 
 * Uses the official ElevenLabs JavaScript SDK for high-quality text-to-speech.
 * This is a browser-compatible implementation that uses the SDK's textToSpeech.convert()
 * method and plays audio using HTMLAudioElement (since SDK's play() is Node.js only).
 * 
 * @see https://github.com/elevenlabs/elevenlabs-js
 */

import { ElevenLabsClient, ElevenLabs } from '@elevenlabs/elevenlabs-js';
import type { 
  ITTSProvider, 
  TTSCallbacks, 
  TTSConfig, 
  TTSVoice, 
  TTSStatus
} from './tts-provider.interface';
import { TTSProviderType } from './tts-provider.interface';

/**
 * Output format type from ElevenLabs SDK
 */
type OutputFormat = ElevenLabs.TextToSpeechConvertRequestOutputFormat;

/**
 * ElevenLabs specific configuration
 */
export interface ElevenLabsConfig extends TTSConfig {
  apiKey?: string;
  voiceId?: string;
  modelId?: string;
  outputFormat?: OutputFormat;
  stability?: number;      // 0 to 1
  similarityBoost?: number; // 0 to 1
  style?: number;          // 0 to 1
  useSpeakerBoost?: boolean;
}

export class ElevenLabsTTSProvider implements ITTSProvider {
  readonly providerType = TTSProviderType.ElevenLabs;
  
  // Default voice: This is a sample voice ID. Users should configure their own voice
  // via setVoiceId() or environment variable VITE_ELEVENLABS_VOICE_ID
  // Find available voices at: https://elevenlabs.io/app/voice-library
  private static readonly DEFAULT_VOICE_ID = 'nPczCjzI2devNBz1zQrb';
  private static readonly DEFAULT_MODEL = 'eleven_multilingual_v2';
  private static readonly DEFAULT_OUTPUT_FORMAT: OutputFormat = 'mp3_44100_128';
  
  private client: ElevenLabsClient | null = null;
  private callbacks: TTSCallbacks = {};
  private config: ElevenLabsConfig = {
    rate: 1,
    pitch: 1,
    volume: 1,
    language: 'fr-FR',
    voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID || ElevenLabsTTSProvider.DEFAULT_VOICE_ID,
    modelId: ElevenLabsTTSProvider.DEFAULT_MODEL,
    outputFormat: ElevenLabsTTSProvider.DEFAULT_OUTPUT_FORMAT,
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
    const key = apiKey || import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (key) {
      this.config.apiKey = key;
      this.client = new ElevenLabsClient({ apiKey: key });
    }
    
    console.log('[ElevenLabsTTS] Constructor - Using official SDK, API Key configured:', !!this.config.apiKey);
    
    // Preload voices if API key is available
    if (this.client) {
      this.loadVoices();
    }
  }

  private async loadVoices(): Promise<void> {
    if (!this.client) {
      console.warn('[ElevenLabsTTS] No client configured, cannot load voices');
      return;
    }
    
    try {
      const response = await this.client.voices.getAll();
      
      this.cachedVoices = response.voices.map(voice => ({
        id: voice.voiceId,
        name: voice.name ?? 'Unknown',
        language: voice.labels?.language || 'multilingual',
        isLocal: false
      }));
      
      console.log('[ElevenLabsTTS] Loaded', this.cachedVoices.length, 'voices using SDK');
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
    
    if (!this.isSupported() || !this.client) {
      console.error('[ElevenLabsTTS] ElevenLabs not configured.');
      this.callbacks.onError?.('ElevenLabs not configured - missing API key');
      return;
    }
    
    console.log('[ElevenLabsTTS] speak() called with:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
    
    // Stop current speech
    this.stop();
    
    try {
      this.isSpeaking = true;
      this.callbacks.onStart?.();
      
      const voiceId = this.config.voiceId || ElevenLabsTTSProvider.DEFAULT_VOICE_ID;
      
      // Use the official SDK's textToSpeech.convert() method
      const audioStream = await this.client.textToSpeech.convert(voiceId, {
        text,
        modelId: this.config.modelId || ElevenLabsTTSProvider.DEFAULT_MODEL,
        outputFormat: this.config.outputFormat || ElevenLabsTTSProvider.DEFAULT_OUTPUT_FORMAT,
        voiceSettings: {
          stability: this.config.stability ?? 0.5,
          similarityBoost: this.config.similarityBoost ?? 0.75,
          style: this.config.style ?? 0,
          useSpeakerBoost: this.config.useSpeakerBoost ?? true
        }
      });
      
      // Convert the ReadableStream to a Blob for browser playback
      const audioBlob = await this.streamToBlob(audioStream);
      await this.playAudioBlob(audioBlob);
      
    } catch (error) {
      console.error('[ElevenLabsTTS] Error:', error);
      this.isSpeaking = false;
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Convert a ReadableStream to a Blob for browser playback
   * (SDK's play() function is Node.js only, so we need browser-compatible playback)
   */
  private async streamToBlob(stream: ReadableStream<Uint8Array>): Promise<Blob> {
    // Use Response API to convert stream to blob - this is the most browser-compatible approach
    const response = new Response(stream);
    return await response.blob();
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
    // Reinitialize client with new key
    this.client = new ElevenLabsClient({ apiKey });
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
