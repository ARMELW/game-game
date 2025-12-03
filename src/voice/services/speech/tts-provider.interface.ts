/**
 * Text-to-Speech Provider Interface
 * 
 * This interface defines the contract for TTS providers.
 * Allows switching between different TTS implementations (Native Web Speech, ElevenLabs, etc.)
 */

export interface TTSCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onPause?: () => void;
  onResume?: () => void;
}

export interface TTSConfig {
  voice?: string;
  rate?: number;    // Speaking rate (0.1 to 10)
  pitch?: number;   // Pitch (0 to 2)
  volume?: number;  // Volume (0 to 1)
  language?: string;
}

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  isLocal?: boolean;
}

export interface TTSStatus {
  speaking: boolean;
  paused: boolean;
  pending: boolean;
  hasCurrentUtterance: boolean;
}

/**
 * TTS Provider Type enum
 */
export enum TTSProviderType {
  Native = 'native',
  ElevenLabs = 'elevenlabs'
}

/**
 * Interface for TTS providers
 */
export interface ITTSProvider {
  /**
   * Provider name/type
   */
  readonly providerType: TTSProviderType;
  
  /**
   * Speak text
   */
  speak(text: string): void;
  
  /**
   * Pause current speech
   */
  pause(): void;
  
  /**
   * Resume paused speech
   */
  resume(): void;
  
  /**
   * Stop speech completely
   */
  stop(): void;
  
  /**
   * Get available voices
   */
  getVoices(): TTSVoice[];
  
  /**
   * Get current status
   */
  getStatus(): TTSStatus;
  
  /**
   * Check if provider is supported in current environment
   */
  isSupported(): boolean;
  
  /**
   * Set callbacks for speech events
   */
  setCallbacks(callbacks: TTSCallbacks): void;
  
  /**
   * Set voice configuration
   */
  setConfig(config: Partial<TTSConfig>): void;
  
  /**
   * Get current configuration
   */
  getConfig(): TTSConfig;
}
