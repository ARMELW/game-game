// providers/elevenlabs-provider.ts
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import type { ISpeechProvider, SpeechConfig, SpeechCallbacks } from '../types/speech.types';

export class ElevenLabsProvider implements ISpeechProvider {
  private client: ElevenLabsClient;
  private config: SpeechConfig = {
    lang: 'fr-FR',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  };
  private callbacks: SpeechCallbacks = {};
  private speaking: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private voiceId: string = ''; // ID de la voix ElevenLabs par défaut

  constructor(apiKey: string, voiceId?: string) {
    this.client = new ElevenLabsClient({
      apiKey: apiKey,

    });
    if (voiceId) this.voiceId = voiceId;
  }

  async speak(text: string): Promise<void> {
    this.stop();
    this.speaking = true;
    this.callbacks.onStart?.();

    try {
      // Conversion du texte en audio avec ElevenLabs SDK
      const audio = await this.client.textToSpeech.convert(
        this.voiceId,
        {
          text: text,
          modelId: 'eleven_multilingual_v2',
          outputFormat: 'mp3_44100_128',
          voiceSettings: {
            stability: 0.5,
            similarityBoost: 0.75,
            style: 0.0,
            useSpeakerBoost: true,
          },
        }
      );

      // Convertir le stream en blob
      const chunks: Uint8Array[] = [];
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      
      const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Créer et jouer l'audio
      return new Promise((resolve, reject) => {
        const audioElement = new Audio(audioUrl);
        audioElement.playbackRate = this.config.rate;
        audioElement.volume = this.config.volume;

        audioElement.onended = () => {
          this.speaking = false;
          this.currentAudio = null;
          URL.revokeObjectURL(audioUrl);
          this.callbacks.onEnd?.();
          resolve();
        };

        audioElement.onerror = () => {
          this.speaking = false;
          this.currentAudio = null;
          URL.revokeObjectURL(audioUrl);
          const err = new Error('Audio playback error');
          this.callbacks.onError?.(err);
          reject(err);
        };

        audioElement.ontimeupdate = () => {
          if (audioElement.duration > 0) {
            const progress = (audioElement.currentTime / audioElement.duration) * 100;
            this.callbacks.onProgress?.(progress);
          }
        };

        this.currentAudio = audioElement;
        audioElement.play().catch(reject);
      });
    } catch (error) {
      this.speaking = false;
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.callbacks.onError?.(err);
      throw err;
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.speaking = false;
  }

  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
  }

  setConfig(config: Partial<SpeechConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.voice) {
      this.voiceId = config.voice;
    }
  }

  setCallbacks(callbacks: SpeechCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  async getVoices(): Promise<string[]> {
    try {
      const voices = await this.client.voices.getAll();
      return voices.voices.map((v) => v.voice_id);
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.user.get();
      return true;
    } catch {
      return false;
    }
  }

  isSpeaking(): boolean {
    return this.speaking;
  }
}