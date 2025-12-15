import { PhaseBase } from "../../../core/phases/abstract-phase";
import { AUTO_ADVANCE_DELAY } from "./timing-constants";

const positionNames = ['Unité', 'Dizaine', 'Centaine', 'Millième'];

/**
 * Mini-phase: Remplissage d'une colonne
 * Gère le remplissage et la validation d'une seule colonne
 */
export class ColumnFillPhase extends PhaseBase {
  private readonly positionNames = positionNames;
  private readonly lockCommands = ['LockUnit:', 'LockTen:', 'LockHundred:', 'LockThousand:'];

  private currentValue = '0000';
  private validationHandled = false;

  constructor(
    private columnIndex: number,
    private targetNumber: string,
    private maxPosition: number // Max column index for this stage
  ) {
    super(
      `column-fill-${columnIndex}`,
      `Remplir ${positionNames[columnIndex]}`
    );
  }

  async execute(): Promise<void> {
    const positionName = this.positionNames[this.columnIndex];
    const targetDigit = this.targetNumber[3 - this.columnIndex];

    console.log(`📝 Remplir colonne: ${positionName}, chiffre cible: ${targetDigit}`);

    // Reset validation flag
    this.validationHandled = false;

    // Ensure this column is within the allowed stage range
    if (this.columnIndex > this.maxPosition) {
      console.warn(`Column ${this.columnIndex} is beyond allowed stage max ${this.maxPosition}. Skipping.`);
      this.complete();
      return;
    }

    for (let i = 0; i < this.lockCommands.length; i++) {
      const cmd = this.lockCommands[i];
      const lockValue = (i <= this.maxPosition && i <= this.columnIndex) ? 0 : 1; // 0 = unlock, 1 = lock
      this.sendToUnity(cmd, lockValue);
    }

    // Vary the messages to make them more natural and child-friendly
    const introMessages = [
      `Maintenant, occupons-nous de la colonne des ${positionName}.`,
      `C'est au tour de la colonne des ${positionName}.`,
      `Passons à la colonne des ${positionName}.`
    ];
    
    const instructionMessages = [
      `Pour faire ${Number(this.targetNumber)}, mets ${targetDigit} ici.`,
      `Il faut placer ${targetDigit} dans cette colonne pour obtenir ${Number(this.targetNumber)}.`,
      `Tu dois mettre ${targetDigit} pour arriver à ${Number(this.targetNumber)}.`
    ];
    
    const introIndex = this.columnIndex % introMessages.length;
    const instructionIndex = this.columnIndex % instructionMessages.length;
    
    await this.speak(introMessages[introIndex]);
    await this.speak(instructionMessages[instructionIndex]);

    this.updateGameState({
      message: `Colonne: ${positionName} → ${targetDigit}`,
      currentDigit: positionName,
      instruction: `Seule la colonne des ${positionName} est débloquée. Remplis-la avec le chiffre ${targetDigit} en utilisant les boutons ↑ et ↓.`,
      showValidateButton: false
    });


    this.onUnityEvent('SetValueUpdate', (data: { value?: string }) => {
      const valueStr = data.value || '0';
      this.currentValue = valueStr.padStart(4, '0');
      this.checkProgress();
    });

    // Listen for Unity validation
    this.onUnityEvent('CorrectValue', () => {
      this.checkProgress(true);
    });

    this.onUnityEvent('WrongValue', () => {
      this.checkProgress(false);
    });

    // Listen for manual validation button
    this.onEvent('validateClick', () => {
      console.log('ici leka')
      if (this.validationHandled) {
        this.advanceToNext();
      }
    });

    this.onUnityEvent('ValidButtonClicked', () => {
      console.log('Received ValidButtonClicked from Unity oui');
      if (this.validationHandled) {
        this.advanceToNext();
      }
    });
  }


  private checkProgress(autoAdvance = false): void {
    for (let i = 0; i < this.columnIndex; i++) {
      const targetDigit = this.targetNumber[3 - i];
      const currentDigit = this.currentValue[3 - i];
      if (currentDigit !== targetDigit) {
        this.handlePreviousColumnError(i);
        return;
      }
    }

    const targetDigit = this.targetNumber[3 - this.columnIndex];
    const currentDigit = this.currentValue[3 - this.columnIndex];

    if (currentDigit === targetDigit) {
      this.handleColumnCorrect(autoAdvance);
    } else if (autoAdvance === false && currentDigit !== targetDigit) {
      // User entered wrong value - provide helpful feedback
      this.handleCurrentColumnError();
    }
  }

  private async handlePreviousColumnError(columnIndex: number): Promise<void> {
    const columnName = this.positionNames[columnIndex];
    const targetDigit = this.targetNumber[3 - columnIndex];

    await this.speak(`Attention ! Tu as modifié la colonne des ${columnName}.`);
    await this.speak(`Elle doit rester à ${targetDigit}.`);

    this.updateGameState({
      instruction: `⚠️ Attention : Tu as modifié une colonne précédente (${columnName}). Elle doit rester à ${targetDigit}. Corrige-la avant de continuer.`
    });
  }

  private async handleCurrentColumnError(): Promise<void> {
    const positionName = this.positionNames[this.columnIndex];
    const targetDigit = this.targetNumber[3 - this.columnIndex];
    const currentDigit = this.currentValue[3 - this.columnIndex];

    // Provide helpful guidance based on whether to increase or decrease
    const helpMessages = [
      `Ce n'est pas tout à fait ça. Pour obtenir ${Number(this.targetNumber)}, tu as besoin de ${targetDigit} dans la colonne des ${positionName}.`,
      `Pas encore ! Il faut mettre ${targetDigit} dans les ${positionName} pour avoir ${Number(this.targetNumber)}.`,
      `Oups ! Pour faire ${Number(this.targetNumber)}, tu dois placer ${targetDigit} ici.`
    ];

    // Choose a message based on column index for variety
    const messageIndex = this.columnIndex % helpMessages.length;
    await this.speak(helpMessages[messageIndex]);

    // Give specific direction if needed
    if (currentDigit < targetDigit) {
      await this.speak(`Utilise le bouton vert pour augmenter jusqu'à ${targetDigit}.`);
    } else if (currentDigit > targetDigit) {
      await this.speak(`Utilise le bouton rouge pour diminuer jusqu'à ${targetDigit}.`);
    }

    this.updateGameState({
      instruction: `⚠️ La colonne des ${positionName} doit avoir ${targetDigit}, pas ${currentDigit}. ${currentDigit < targetDigit ? 'Augmente' : 'Diminue'} avec les boutons.`
    });
  }

  private handleColumnCorrect(autoAdvance = false): void {
    if (this.validationHandled) {
      return;
    }
    this.validationHandled = true;

    const positionName = this.positionNames[this.columnIndex];
    const targetDigit = this.targetNumber[3 - this.columnIndex];

    console.log(`✓ Colonne ${positionName} correcte: ${targetDigit}`);

    this.speakNonBlocking('Parfait !');

    this.updateGameState({
      message: `✓ ${positionName} : ${targetDigit} - Correct !`,
      instruction: `Excellent ! La colonne des ${positionName} est correcte.`,
      showValidateButton:  !autoAdvance
    });

    if (autoAdvance) {
      setTimeout(() => {
        this.advanceToNext();
      }, AUTO_ADVANCE_DELAY);
    }
  }

  private async advanceToNext(): Promise<void> {
    this.updateGameState({
      showValidateButton: false
    });

    //await this.speak('Très bien ! Je débloque maintenant la colonne suivante.');

    this.complete();
  }
}
