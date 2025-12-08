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

    // Lock all columns, then unlock allowed ones
    this.lockAll();
    for (let i = 0; i <= this.maxPosition; i++) {
      this.sendToUnity(this.lockCommands[i], 0);
    }

    // Instructions vocales
    await this.speak(`Remplis maintenant la colonne des ${positionName}.`);
    await this.speak(`Pour le nombre ${this.targetNumber}, la colonne des ${positionName} doit afficher ${targetDigit}.`);
    await this.speak(`Utilise les boutons pour mettre ${targetDigit} dans la colonne des ${positionName}.`);

    this.updateGameState({
      message: `Colonne: ${positionName} → ${targetDigit}`,
      currentDigit: positionName,
      instruction: `Remplis la colonne des ${positionName} avec le chiffre ${targetDigit}. Utilise les boutons ↑ et ↓ pour ajuster la valeur.`,
      showValidateButton: false
    });

    // Listen for value updates
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
      if (this.validationHandled) {
        this.advanceToNext();
      }
    });
  }

  private lockAll(): void {
    this.sendToUnity('LockThousand:', 1);
    this.sendToUnity('LockHundred:', 1);
    this.sendToUnity('LockTen:', 1);
    this.sendToUnity('LockUnit:', 1);
  }

  private checkProgress(autoAdvance = false): void {
    // Check if previous columns are still correct
    for (let i = 0; i < this.columnIndex; i++) {
      const targetDigit = this.targetNumber[3 - i];
      const currentDigit = this.currentValue[3 - i];
      if (currentDigit !== targetDigit) {
        this.handlePreviousColumnError(i);
        return;
      }
    }

    // Check current column
    const targetDigit = this.targetNumber[3 - this.columnIndex];
    const currentDigit = this.currentValue[3 - this.columnIndex];

    if (currentDigit === targetDigit) {
      this.handleColumnCorrect(autoAdvance);
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
      showValidateButton: !autoAdvance
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

    await this.speak('Très bien ! Passons à la colonne suivante.');

    this.complete();
  }
}
