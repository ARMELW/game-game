import { PhaseBase } from "../../core/phases/abstract-phase";

/**
 * Phase 1: Découverte des boutons
 * L'utilisateur doit cliquer 3 fois sur ↑ et 3 fois sur ↓
 */
export class DiscoveryPhase extends PhaseBase {
  private upClicks = 0;
  private downClicks = 0;
  private readonly requiredClicks = 3;
  private validationShown = false;

  constructor() {
    super('discovery', 'Découverte des boutons');
  }

  execute(): void {
    console.log('🎮 Phase 1: Découverte des boutons');

    // Initialisation - Réinitialiser la machine
    this.sendToUnity('SetValue', '0000');

    // Bloquer milliers, centaines, dizaines
    this.sendToUnity('LockThousand', 1);
    this.sendToUnity('LockHundred', 1);
    this.sendToUnity('LockTen', 1);

    // Débloquer unités
    this.sendToUnity('LockUnit', 0);

    // Mettre à jour l'état UI
    this.updateGameState({
      message: 'Cliquez 3 fois sur ↑ et 3 fois sur ↓',
      progress: this.getProgressText(),
      showValidateButton: false
    });

    // Écouter les messages de Unity (SetValue)
    this.onUnityEvent('SetValueUpdate', (data: any) => {
      this.handleUnityClick(data);
    });
  }

  private handleUnityClick(data: any): void {
    console.log('Unity click received:', data);

    // Extraire la valeur du payload
    const valueStr = data.value || data.toString();
    const currentValue = parseInt(valueStr, 10);
    const lastValue = this.getGameState()?.lastValue || 0;

    if (currentValue > lastValue) {
      this.upClicks++;
      console.log(`↑ Click detected. Total: ${this.upClicks}/${this.requiredClicks}`);
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

  private checkCompletion(): void {
    if (this.upClicks >= this.requiredClicks && this.downClicks >= this.requiredClicks && !this.validationShown) {
      this.validationShown = true;
      this.updateGameState({
        message: 'Bravo ! Cliquez sur Valider pour continuer',
        showValidateButton: true
      });

      // Écouter le clic sur le bouton Valider
      this.onEvent('validateClick', () => {
        this.complete();
      });
    }
  }
}
