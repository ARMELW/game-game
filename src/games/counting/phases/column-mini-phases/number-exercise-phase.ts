import { SequencePhase } from "../../../core/phases/sequence-phase";
import { PhaseBase } from "../../../core/phases/abstract-phase";
import { ColumnFillPhase } from "./column-fill-phase";
import { NUMBER_INTRO_DELAY, NUMBER_COMPLETION_DELAY } from "./timing-constants";

/**
 * Mini-phase: Exercice pour un nombre complet
 * Orchestre le remplissage de toutes les colonnes pour un seul nombre
 */
export class NumberExercisePhase extends SequencePhase {
  constructor(
    exerciseNumber: number, // 1, 2, or 3
    targetNumber: string,
    maxPosition: number,
    stageNumber: number,
    totalExercises: number = 3
  ) {
    super(
      `number-exercise-${stageNumber}-${exerciseNumber}`,
      buildNumberPhases(exerciseNumber, targetNumber, maxPosition, stageNumber, totalExercises),
      `Exercice ${exerciseNumber}/${totalExercises}`
    );

  // stageNumber is only used to build the phase id and for child phases, no stored field required
  }
}

function buildNumberPhases(
  exerciseNumber: number,
  targetNumber: string,
  maxPosition: number,
  stageNumber: number,
  totalExercises: number = 3
): PhaseBase[] {
  const phases: PhaseBase[] = [];

  phases.push(new NumberIntroPhase(
    exerciseNumber,
    targetNumber,
    maxPosition,
    stageNumber,
    totalExercises
  ));

  for (let columnIndex = 0; columnIndex <= maxPosition; columnIndex++) {
    phases.push(new ColumnFillPhase(
      columnIndex,
      targetNumber,
      maxPosition
    ));
  }

  phases.push(new NumberCompletionPhase(
    exerciseNumber,
    targetNumber,
    maxPosition,
    totalExercises
  ));

  return phases;
}

/**
 * Mini-phase: Introduction d'un exercice de nombre
 */
class NumberIntroPhase extends PhaseBase {
  constructor(
    private exerciseNumber: number,
    private targetNumber: string,
    private maxPosition: number,
    stageNumber: number,
    private totalExercises: number = 3
  ) {
    super(`number-intro-${stageNumber}-${exerciseNumber}`, `Introduction Exercice ${exerciseNumber}`);
  }

  async execute(): Promise<void> {
    console.log(`🎯 Exercice ${this.exerciseNumber}/${this.totalExercises}: ${this.targetNumber}`);

    const lockCommands = ['LockUnit:', 'LockTen:', 'LockHundred:', 'LockThousand:'];
    for (let i = 0; i < lockCommands.length; i++) {
      const lockValue = i <= this.maxPosition ? 0 : 1;
      this.sendToUnity(lockCommands[i], lockValue);
    }

    this.sendToUnity('SetValue', '0000');

    console.log('Sending ChangeList ->', this.targetNumber);
    this.sendToUnity('ChangeList', this.targetNumber);

    // Vary the introduction based on exercise number to make it more natural
    const introMessages = [
      `C'est parti ! Essayons de former le nombre ${Number(this.targetNumber)}.`,
      `Super ! Maintenant, créons ensemble le nombre ${Number(this.targetNumber)}.`,
      `Parfait ! À ton tour de faire le nombre ${Number(this.targetNumber)}.`
    ];
    
    const guideMessages = [
      `Je te guide pas à pas, une colonne après l'autre.`,
      `Je débloque une colonne à la fois pour t'aider.`,
      `On y va doucement, colonne par colonne.`
    ];
    
    const introIndex = (this.exerciseNumber - 1) % introMessages.length;
    const guideIndex = (this.exerciseNumber - 1) % guideMessages.length;
    
    await this.speak(introMessages[introIndex]);
    if (this.exerciseNumber === 1) {
      // Only explain the guidance on the first exercise
      await this.speak(guideMessages[guideIndex]);
    }
    
    this.updateGameState({
      message: `Nombre ${this.exerciseNumber}/${this.totalExercises} : ${Number(this.targetNumber)}`,
      targetNumber: this.targetNumber,
      instruction: `Nombre à former : ${Number(this.targetNumber)}. Je vais débloquer les colonnes une par une en commençant par les Unités.`,
      showValidateButton: false
    });

    // Pause avant de commencer
    await new Promise(resolve => setTimeout(resolve, NUMBER_INTRO_DELAY));

    this.complete();
  }
}

/**
 * Mini-phase: Complétion d'un exercice de nombre
 */
class NumberCompletionPhase extends PhaseBase {
  private readonly lockCommands = ['LockUnit:', 'LockTen:', 'LockHundred:', 'LockThousand:'];

  constructor(
    private exerciseNumber: number,
    private targetNumber: string,
    private maxPosition: number,
    private totalExercises: number = 3
  ) {
    super(
      `number-completion-${exerciseNumber}`,
      `Complétion Exercice ${exerciseNumber}`
    );
  }

  async execute(): Promise<void> {
    console.log(`✅ Exercice ${this.exerciseNumber}/${this.totalExercises} complété`);

    // Vary completion messages to be more natural and encouraging
    const completionMessages = [
      'Génial ! Tu as bien réussi !',
      'Bravo ! C\'est exactement ça !',
      'Parfait ! Tu as tout compris !'
    ];
    
    const completionIndex = (this.exerciseNumber - 1) % completionMessages.length;
    await this.speak(completionMessages[completionIndex]);

    this.updateGameState({
      message: `✓ Nombre ${this.exerciseNumber}/${this.totalExercises} complété !`,
      instruction: `Bravo ! Tu as réussi à former le nombre ${Number(this.targetNumber)}.`
    });

    // Restore the stage's allowed column unlocks (do NOT unlock all)
    for (let i = 0; i < this.lockCommands.length; i++) {
      const lockValue = i <= this.maxPosition ? 0 : 1; // 0 = unlock, 1 = lock
      this.sendToUnity(this.lockCommands[i], lockValue);
    }

    // Pause before the next number
    await new Promise(resolve => setTimeout(resolve, NUMBER_COMPLETION_DELAY));

    this.complete();
  }
}
