/**
 * TTS Manager
 * 
 * Manages TTS providers and allows switching between them.
 * Provides a unified interface for text-to-speech functionality.
 */

import type { 
  ITTSProvider, 
  TTSCallbacks, 
  TTSConfig, 
  TTSVoice, 
  TTSStatus
} from './tts-provider.interface';
import { TTSProviderType } from './tts-provider.interface';
import { NativeTTSProvider } from './native-tts-provider';
import type { ElevenLabsConfig } from './elevenlabs-tts-provider';
import { ElevenLabsTTSProvider } from './elevenlabs-tts-provider';

/**
 * Storage key for persisting provider preference
 */
const TTS_PROVIDER_STORAGE_KEY = 'tts_provider_preference';

/**
 * TTS Manager class
 * Singleton pattern for global access
 */
class TTSManager {
  private static instance: TTSManager;
  
  private providers: Map<TTSProviderType, ITTSProvider> = new Map();
  private currentProvider: ITTSProvider;
  private currentProviderType: TTSProviderType;
  private callbacks: TTSCallbacks = {};

  private constructor() {
    // Initialize providers
    this.providers.set(TTSProviderType.Native, new NativeTTSProvider());
    this.providers.set(TTSProviderType.ElevenLabs, new ElevenLabsTTSProvider());
    
    // Load saved preference or default to Native
    const savedPreference = this.loadSavedPreference();
    
    // Default to Native if ElevenLabs is not supported
    const elevenLabsProvider = this.providers.get(TTSProviderType.ElevenLabs);
    if (savedPreference === TTSProviderType.ElevenLabs && elevenLabsProvider?.isSupported()) {
      this.currentProviderType = TTSProviderType.ElevenLabs;
      this.currentProvider = elevenLabsProvider;
    } else {
      this.currentProviderType = TTSProviderType.Native;
      this.currentProvider = this.providers.get(TTSProviderType.Native)!;
    }
    
    console.log('[TTSManager] Initialized with provider:', this.currentProviderType);
  }

  static getInstance(): TTSManager {
    if (!TTSManager.instance) {
      TTSManager.instance = new TTSManager();
    }
    return TTSManager.instance;
  }

  /**
   * Load saved provider preference from localStorage
   */
  private loadSavedPreference(): TTSProviderType | null {
    try {
      const saved = localStorage.getItem(TTS_PROVIDER_STORAGE_KEY);
      if (saved && Object.values(TTSProviderType).includes(saved as TTSProviderType)) {
        return saved as TTSProviderType;
      }
    } catch (e) {
      console.warn('[TTSManager] Failed to load saved preference:', e);
    }
    return null;
  }

  /**
   * Save provider preference to localStorage
   */
  private savePreference(providerType: TTSProviderType): void {
    try {
      localStorage.setItem(TTS_PROVIDER_STORAGE_KEY, providerType);
    } catch (e) {
      console.warn('[TTSManager] Failed to save preference:', e);
    }
  }

  /**
   * Get current provider type
   */
  getCurrentProviderType(): TTSProviderType {
    return this.currentProviderType;
  }

  /**
   * Get current provider
   */
  getCurrentProvider(): ITTSProvider {
    return this.currentProvider;
  }

  /**
   * Switch to a different TTS provider
   */
  switchProvider(providerType: TTSProviderType): boolean {
    const provider = this.providers.get(providerType);
    
    if (!provider) {
      console.error('[TTSManager] Provider not found:', providerType);
      return false;
    }
    
    if (!provider.isSupported()) {
      console.error('[TTSManager] Provider not supported:', providerType);
      return false;
    }
    
    // Stop current speech before switching
    this.currentProvider.stop();
    
    // Switch provider
    this.currentProvider = provider;
    this.currentProviderType = providerType;
    
    // Apply current callbacks to new provider
    this.currentProvider.setCallbacks(this.callbacks);
    
    // Save preference
    this.savePreference(providerType);
    
    console.log('[TTSManager] Switched to provider:', providerType);
    return true;
  }

  /**
   * Get available provider types
   */
  getAvailableProviders(): TTSProviderType[] {
    const available: TTSProviderType[] = [];
    this.providers.forEach((provider, type) => {
      if (provider.isSupported()) {
        available.push(type);
      }
    });
    return available;
  }

  /**
   * Check if a specific provider is available
   */
  isProviderAvailable(providerType: TTSProviderType): boolean {
    const provider = this.providers.get(providerType);
    return provider ? provider.isSupported() : false;
  }

  // =============================================
  // Delegate methods to current provider
  // =============================================

  speak(text: string): void {
    this.currentProvider.setCallbacks(this.callbacks);
    this.currentProvider.speak(text);
  }

  pause(): void {
    this.currentProvider.pause();
  }

  resume(): void {
    this.currentProvider.resume();
  }

  stop(): void {
    this.currentProvider.stop();
  }

  getVoices(): TTSVoice[] {
    return this.currentProvider.getVoices();
  }

  getStatus(): TTSStatus {
    return this.currentProvider.getStatus();
  }

  isSupported(): boolean {
    return this.currentProvider.isSupported();
  }

  setCallbacks(callbacks: TTSCallbacks): void {
    this.callbacks = callbacks;
    this.currentProvider.setCallbacks(callbacks);
  }

  setConfig(config: Partial<TTSConfig>): void {
    this.currentProvider.setConfig(config);
  }

  getConfig(): TTSConfig {
    return this.currentProvider.getConfig();
  }

  // =============================================
  // Provider-specific methods
  // =============================================

  /**
   * Configure ElevenLabs provider
   */
  configureElevenLabs(config: Partial<ElevenLabsConfig>): void {
    const elevenLabsProvider = this.providers.get(TTSProviderType.ElevenLabs) as ElevenLabsTTSProvider | undefined;
    if (elevenLabsProvider) {
      elevenLabsProvider.setConfig(config);
    }
  }

  /**
   * Set ElevenLabs API key
   */
  setElevenLabsApiKey(apiKey: string): void {
    const elevenLabsProvider = this.providers.get(TTSProviderType.ElevenLabs) as ElevenLabsTTSProvider | undefined;
    if (elevenLabsProvider) {
      elevenLabsProvider.setApiKey(apiKey);
    }
  }

  /**
   * Set ElevenLabs voice
   */
  setElevenLabsVoice(voiceId: string): void {
    const elevenLabsProvider = this.providers.get(TTSProviderType.ElevenLabs) as ElevenLabsTTSProvider | undefined;
    if (elevenLabsProvider) {
      elevenLabsProvider.setVoiceId(voiceId);
    }
  }
}

// Export singleton instance
export const ttsManager = TTSManager.getInstance();

// Export types
export { TTSProviderType } from './tts-provider.interface';
export type { ITTSProvider, TTSCallbacks, TTSConfig, TTSVoice, TTSStatus } from './tts-provider.interface';
export type { ElevenLabsConfig } from './elevenlabs-tts-provider';
