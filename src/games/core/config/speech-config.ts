export const SPEECH_CONFIG = {
  provider:  'web', //'elevenlabs',
  elevenlabs: {
    apiKey: '',
    voiceId: '',
  },
  defaultConfig: {
    lang: 'fr-FR',
    rate: 0.85, // Un peu plus lent pour une voix de professeur
    pitch: 1.1, // Un peu plus aigu pour être plus engageant
    volume: 1.0,
  },
};