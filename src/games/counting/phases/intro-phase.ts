import { PhaseBase } from "../../core/phases/abstract-phase";

/**
 * Phase d'introduction du quiz
 */
export class IntroPhase extends PhaseBase {
  private static readonly DEFAULT_VALUE = '0000';
  private static readonly VALUE_LENGTH = 4;
  private static readonly PAD_CHARACTER = '0';
  
  private currentValue = IntroPhase.DEFAULT_VALUE;

  constructor() {
    super('interactive', 'Phase Interactive');
  }

  execute(): void | Promise<void> {
    console.log('state manager', this.getState());

    // Listen for Unity messages using the centralized event system
    // This prevents memory leaks and conflicts with other phases
    this.onUnityEvent('SetValueUpdate', (data: { value?: string }) => {
      console.log('Unity message received:', data);
      
      // Extract and format the value
      const valueStr = data.value || IntroPhase.PAD_CHARACTER;
      this.currentValue = valueStr.padStart(IntroPhase.VALUE_LENGTH, IntroPhase.PAD_CHARACTER);
      
      console.log('Current value updated:', this.currentValue);
    });

    // Send initial value to Unity
    this.sendToUnity('SetValue', 5);
    
    // Uncomment to enable speech
    // this.speak('Bonjour, bienvenue dans ce jeu de comptage')

    // Uncomment to complete the phase automatically
    // this.whenComplete();
    // this.complete();
  }
}