import { defaultPersonaConfig, type PersonaConfig } from './persona.types';
import { ttsManager, TTSProviderType } from './tts-manager';
import type { TTSVoice } from './tts-provider.interface';

/**
 * Service global de synthèse vocale (Text-to-Speech)
 * 
 * This is a facade that uses TTSManager internally.
 * It maintains backward compatibility with existing code while
 * allowing provider switching between Native and ElevenLabs.
 */

export interface TextToSpeechConfig {
  voice?: string;
  rate?: number; // Vitesse (0.1 à 10)
  pitch?: number; // Hauteur (0 à 2)
  volume?: number; // Volume (0 à 1)
}

export interface TextToSpeechCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onPause?: () => void;
  onResume?: () => void;
}

class TextToSpeechService {
  private personaConfig: PersonaConfig = defaultPersonaConfig;
  private voiceConfig: TextToSpeechConfig = {
    rate: 1,
    pitch: 1,
    volume: 1
  };

  constructor() {
    console.log('[TTS] Constructor - Using TTSManager with provider:', ttsManager.getCurrentProviderType());
    
    // Log voice loading status
    setTimeout(() => {
      console.log('[TTS] After 1s - Voices available:', this.getVoices().length);
    }, 1000);
  }

  /**
   * Test simple de synthèse vocale
   */
  testSpeak(): void {
    console.log('[TTS] testSpeak() appelé');
    this.speak('Bonjour test');
    console.log('[TTS] speak() appelé pour test');
  }

  setCallbacks(callbacks: TextToSpeechCallbacks) {
    ttsManager.setCallbacks(callbacks);
  }

  setVoiceConfig(config: Partial<TextToSpeechConfig>) {
    this.voiceConfig = { ...this.voiceConfig, ...config };
    ttsManager.setConfig({
      voice: config.voice,
      rate: config.rate,
      pitch: config.pitch,
      volume: config.volume,
      language: this.personaConfig.language
    });
  }

  setPersona(config: Partial<PersonaConfig>) {
    this.personaConfig = { ...this.personaConfig, ...config };
    ttsManager.setConfig({
      language: this.personaConfig.language
    });
  }

  getPersona(): PersonaConfig {
    return this.personaConfig;
  }

  /**
   * Fait lire un texte par le navigateur
   */
  speak(text: string): void {
    if (!text.trim()) {
      console.warn('[TTS] Texte vide, rien à lire.');
      return;
    }
    console.log('[TTS] speak() appelé avec :', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
    ttsManager.speak(text);
  }

  /**
   * Met en pause la lecture en cours
   */
  pause(): void {
    ttsManager.pause();
  }

  /**
   * Reprend la lecture en pause
   */
  resume(): void {
    ttsManager.resume();
  }

  /**
   * Arrête complètement la lecture
   */
  stop(): void {
    ttsManager.stop();
  }

  /**
   * Récupère les voix disponibles
   * Returns in the format expected by existing code
   */
  getVoices(): SpeechSynthesisVoice[] {
    // For backward compatibility, return native voices if using native provider
    // or map TTSVoice to a compatible format
    if (ttsManager.getCurrentProviderType() === TTSProviderType.Native) {
      return window.speechSynthesis?.getVoices() || [];
    }
    
    // For ElevenLabs, return empty array (or map TTSVoice to SpeechSynthesisVoice-like objects)
    const voices = ttsManager.getVoices();
    // Create a compatible structure
    return voices.map((voice: TTSVoice) => ({
      name: voice.name,
      lang: voice.language,
      voiceURI: voice.id,
      localService: voice.isLocal ?? false,
      default: false
    })) as unknown as SpeechSynthesisVoice[];
  }

  /**
   * Récupère les voix pour une langue donnée
   */
  getVoicesForLanguage(language: string): SpeechSynthesisVoice[] {
    return this.getVoices().filter(voice => voice.lang.startsWith(language));
  }

  /**
   * État de la synthèse vocale
   */
  getStatus() {
    return ttsManager.getStatus();
  }

  /**
   * Vérifie si la synthèse vocale est supportée
   */
  isSupported(): boolean {
    return ttsManager.isSupported();
  }

  // =============================================
  // New methods for provider management
  // =============================================

  /**
   * Get current TTS provider type
   */
  getCurrentProviderType(): TTSProviderType {
    return ttsManager.getCurrentProviderType();
  }

  /**
   * Switch to a different TTS provider
   */
  switchProvider(providerType: TTSProviderType): boolean {
    return ttsManager.switchProvider(providerType);
  }

  /**
   * Get available TTS providers
   */
  getAvailableProviders(): TTSProviderType[] {
    return ttsManager.getAvailableProviders();
  }

  /**
   * Check if a specific provider is available
   */
  isProviderAvailable(providerType: TTSProviderType): boolean {
    return ttsManager.isProviderAvailable(providerType);
  }

  /**
   * Configure ElevenLabs provider
   */
  configureElevenLabs(config: { apiKey?: string; voiceId?: string; modelId?: string }): void {
    ttsManager.configureElevenLabs(config);
  }

  /**
   * Set ElevenLabs API key
   */
  setElevenLabsApiKey(apiKey: string): void {
    ttsManager.setElevenLabsApiKey(apiKey);
  }

  /**
   * Set ElevenLabs voice
   */
  setElevenLabsVoice(voiceId: string): void {
    ttsManager.setElevenLabsVoice(voiceId);
  }
}

// Instance globale
export const textToSpeechService = new TextToSpeechService();

// Re-export TTSProviderType for convenience
export { TTSProviderType };
