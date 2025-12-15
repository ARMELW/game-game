import { PhaseBase } from "../../core/phases/abstract-phase";
import type { TutorialGameState } from "./index";

/**
 * Phase 1: Découverte des boutons
 * L'utilisateur doit cliquer 3 fois sur ↑ et 3 fois sur ↓
 */
export class DiscoveryPhase extends PhaseBase {
  private upClicks = 0;
  private downClicks = 0;
  private readonly requiredClicks = 3;
  private readonly maxUnitsValue = 3;
  private validationShown = false;

  constructor() {
    super('discovery', 'Découverte des boutons');
  }

  async execute(): Promise<void> {
    console.log('🎮 Phase 1: Découverte des boutons');

    // Initialisation - Réinitialiser la machine
    this.sendToUnity('SetValue', '0000');

    // Bloquer milliers, centaines, dizaines
    this.sendToUnity('LockThousand:', 1);
    this.sendToUnity('LockHundred:', 1);
    this.sendToUnity('LockTen:', 1);

    // Débloquer unités
    this.sendToUnity('LockUnit:', 0);

    // Message vocal d'introduction
    await this.speak('Bonjour !, Bienvenue dans l\'aventure des nombres ! Aujourd\'hui, nous allons apprendre ensemble comment fonctionne cette machine magique.');
    await this.speak('Pour commencer, regarde les deux boutons : le bouton vert avec l"icone plus pour augmenter, et le bouton rouge avec l"iconee moins vers le bas pour diminuer.');
    await this.speak('Clique 3 fois sur le bouton vert, puis 3 fois sur le bouton rouge. Allons-y !');

    // Mettre à jour l'état UI
    this.updateGameState({
      message: 'Cliquez 3 fois sur ↑ et 3 fois sur ↓',
      progress: this.getProgressText(),
      showValidateButton: false
    });

    // Écouter les messages de Unity (SetValue)
    this.onUnityEvent('SetValueUpdate', (data: { value?: string }) => {
      this.handleUnityClick(data);
    });
  }

  private async handleUnityClick(data: { value?: string }): Promise<void> {
    console.log('Unity click received:', data);

    // Extraire la valeur du payload
    const valueStr = data.value || '0';
    const currentValue = parseInt(valueStr, 10);
    const gameState = this.getGameState() as TutorialGameState;
    const lastValue = gameState.lastValue || 0;

    // Vérifier les limites (ne pas dépasser maxUnitsValue)
    if (currentValue > this.maxUnitsValue) {
      console.log('⚠️ Dépassement de la limite, retour à', this.maxUnitsValue);
      this.sendToUnity('SetValue', `000${this.maxUnitsValue}`);
      this.speakNonBlocking('Attention ! Pour cet exercice, nous ne dépassons pas 3. Descendons maintenant avec le bouton rouge.');
      this.updateGameState({ lastValue: this.maxUnitsValue });
      return;
    }

    if (currentValue > lastValue) {
      this.upClicks++;
      console.log(`↑ Click detected. Total: ${this.upClicks}/${this.requiredClicks}`);
      
      // Encouragement vocal (non-bloquant pour éviter les ralentissements)
      if (this.upClicks === 3) {
        this.speakNonBlocking('Parfait ! Maintenant, essayons le bouton rouge pour descendre.');
      }
    } else if (currentValue < lastValue) {
      this.downClicks++;
      console.log(`↓ Click detected. Total: ${this.downClicks}/${this.requiredClicks}`);
    }

    // Sauvegarder la dernière valeur
    this.updateGameState({ lastValue: currentValue });

    // Mettre à jour l'affichage de progression
    this.updateGameState({
      progress: this.getProgressText()
    });

    // Vérifier si l'utilisateur a atteint l'objectif
    this.checkCompletion();
  }

  private getProgressText(): string {
    return `↑ ${this.upClicks}/${this.requiredClicks}  ↓ ${this.downClicks}/${this.requiredClicks}`;
  }

  private async checkCompletion(): Promise<void> {
    if (this.upClicks >= this.requiredClicks && this.downClicks >= this.requiredClicks && !this.validationShown) {
      this.validationShown = true;
      
      await this.speak('Fantastique ! Tu as réussi ! Clique sur le bouton Valider pour passer à la suite.');
      
      this.updateGameState({
        message: 'Bravo ! Cliquez sur Valider pour continuer',
        showValidateButton: true,
        disableValidateButton: true, // Block the button initially
        instruction: 'Bravo ! Tu as complété la première étape. Lis bien ce message, puis clique sur **Valider** pour continuer.'
      });

      // Listen for instruction typing completion to enable the button
      this.onEvent('instructionTypingComplete', () => {
        this.updateGameState({
          disableValidateButton: false // Enable the button after typing completes
        });
      });

      // Écouter le clic sur le bouton Valider
      this.onEvent('validateClick', () => {
        this.complete();
      });
    }
  }
}
