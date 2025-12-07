// providers/web-speech-provider.ts
import type { ISpeechProvider, SpeechConfig, SpeechCallbacks } from '../types/speech.types';

class WebSpeechProvider implements ISpeechProvider {
  private synthesis: SpeechSynthesis;
  private _currentUtterance: SpeechSynthesisUtterance | null = null;
  private config: SpeechConfig = {
    lang: 'fr-FR',
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
  };
  private callbacks: SpeechCallbacks = {};
  private speaking: boolean = false;
  private _voicesLoaded: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices(): void {
    // Charger les voix immédiatement
    const voices = this.synthesis.getVoices();
    if (voices.length > 0) {
      this._voicesLoaded = true;
    }

    // Écouter le chargement asynchrone des voix (pour Chrome/Edge)
    if ('onvoiceschanged' in this.synthesis) {
      this.synthesis.onvoiceschanged = () => {
        this._voicesLoaded = true;
      };
    }
  }

  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Nettoyer toute synthèse en cours
      this.synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.config.lang;
      utterance.rate = this.config.rate;
      utterance.pitch = this.config.pitch;
      utterance.volume = this.config.volume;

      // Sélectionner la voix si spécifiée
      if (this.config.voice) {
        const voices = this.synthesis.getVoices();
        const voice = voices.find(v => v.name === this.config.voice);
        if (voice) {
          utterance.voice = voice;
        }
      } else {
        // Sélectionner automatiquement une voix française si disponible
        const voices = this.synthesis.getVoices();
        const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
        if (frenchVoice) {
          utterance.voice = frenchVoice;
        }
      }

      utterance.onstart = () => {
        this.speaking = true;
        this.callbacks.onStart?.();
      };

      utterance.onend = () => {
        this.speaking = false;
        this._currentUtterance = null;
        this.callbacks.onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        this.speaking = false;
        this._currentUtterance = null;
        this.callbacks.onError?.(new Error(event.error));
        
        // Ne pas rejeter sur 'interrupted' ou 'canceled' car c'est normal
        if (event.error === 'interrupted' || event.error === 'canceled') {
          resolve();
        } else {
          reject(new Error(event.error));
        }
      };

      this._currentUtterance = utterance;
      
      // Workaround pour Chrome: reprendre la synthèse si elle est en pause
      if (this.synthesis.paused) {
        this.synthesis.resume();
      }
      
      this.synthesis.speak(utterance);
    });
  }

  stop(): void {
    this.synthesis.cancel();
    this.speaking = false;
    this._currentUtterance = null;
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

  setConfig(config: Partial<SpeechConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setCallbacks(callbacks: SpeechCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Getter to check if voices are loaded
  areVoicesLoaded(): boolean {
    return this._voicesLoaded;
  }

  // Getter to check current utterance
  getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this._currentUtterance;
  }

  async getVoices(): Promise<string[]> {
    return new Promise((resolve) => {
      const getVoiceList = () => {
        const voices = this.synthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices.map(v => v.name));
          return true;
        }
        return false;
      };

      // Essayer immédiatement
      if (getVoiceList()) return;

      // Attendre le chargement des voix
      const timeout = setTimeout(() => {
        resolve([]);
      }, 1000);

      this.synthesis.onvoiceschanged = () => {
        if (getVoiceList()) {
          clearTimeout(timeout);
        }
      };
    });
  }

  async isAvailable(): Promise<boolean> {
    return 'speechSynthesis' in window;
  }

  isSpeaking(): boolean {
    return this.speaking || this.synthesis.speaking;
  }
}

export { WebSpeechProvider };