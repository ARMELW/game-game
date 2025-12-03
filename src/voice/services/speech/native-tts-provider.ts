/**
 * Native Web Speech API TTS Provider
 * 
 * Uses the browser's built-in Speech Synthesis API
 */

import type { 
  ITTSProvider, 
  TTSCallbacks, 
  TTSConfig, 
  TTSVoice, 
  TTSStatus
} from './tts-provider.interface';
import { TTSProviderType } from './tts-provider.interface';

export class NativeTTSProvider implements ITTSProvider {
  readonly providerType = TTSProviderType.Native;
  
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private callbacks: TTSCallbacks = {};
  private config: TTSConfig = {
    rate: 1,
    pitch: 1,
    volume: 1,
    language: 'fr-FR'
  };

  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Log voice loading status
    console.log('[NativeTTS] Constructor - Voices available:', this.getVoices().length);
    
    // Wait for voices to load
    setTimeout(() => {
      console.log('[NativeTTS] After 1s - Voices available:', this.getVoices().length);
    }, 1000);
    
    this.synthesis.onvoiceschanged = () => {
      console.log('[NativeTTS] onvoiceschanged - Voices available:', this.getVoices().length);
    };
  }

  private createUtterance(text: string): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);

    // Apply configuration
    utterance.lang = this.config.language || 'fr-FR';
    utterance.rate = this.config.rate || 1;
    utterance.pitch = this.config.pitch || 1;
    utterance.volume = this.config.volume || 1;

    // Select voice if specified
    if (this.config.voice) {
      const voices = this.synthesis.getVoices();
      const selectedVoice = voices.find(
        voice =>
          voice.name === this.config.voice ||
          voice.lang === this.config.voice
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Capture callbacks in closure to avoid race condition
    const capturedCallbacks = { ...this.callbacks };

    // Set up events
    utterance.onstart = () => {
      capturedCallbacks.onStart?.();
    };

    utterance.onend = () => {
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
        this.callbacks = {};
      }
      capturedCallbacks.onEnd?.();
    };

    utterance.onerror = (event) => {
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
        this.callbacks = {};
      }
      capturedCallbacks.onError?.(event.error);
    };

    utterance.onpause = () => {
      capturedCallbacks.onPause?.();
    };

    utterance.onresume = () => {
      capturedCallbacks.onResume?.();
    };

    return utterance;
  }

  speak(text: string): void {
    if (!text.trim()) {
      console.warn('[NativeTTS] Empty text, nothing to speak.');
      this.callbacks.onError?.('Empty text');
      return;
    }
    
    if (!this.isSupported()) {
      console.error('[NativeTTS] Speech synthesis not supported.');
      this.callbacks.onError?.('Speech synthesis not supported');
      return;
    }
    
    console.log('[NativeTTS] speak() called with:', text);
    
    // Stop current speech
    this.stop();

    // Create and start new speech
    this.currentUtterance = this.createUtterance(text);
    this.synthesis.speak(this.currentUtterance);
  }

  pause(): void {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  getVoices(): TTSVoice[] {
    return this.synthesis.getVoices().map(voice => ({
      id: voice.name,
      name: voice.name,
      language: voice.lang,
      isLocal: voice.localService
    }));
  }

  getStatus(): TTSStatus {
    return {
      speaking: this.synthesis.speaking,
      paused: this.synthesis.paused,
      pending: this.synthesis.pending,
      hasCurrentUtterance: this.currentUtterance !== null
    };
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  setCallbacks(callbacks: TTSCallbacks): void {
    this.callbacks = callbacks;
  }

  setConfig(config: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): TTSConfig {
    return { ...this.config };
  }
}
