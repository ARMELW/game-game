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
    maxPosition: number, // Max column index for this stage (0=units only, 1=units+tens, etc.)
    stageNumber: number
  ) {
    super(
      `number-exercise-${stageNumber}-${exerciseNumber}`,
      buildNumberPhases(exerciseNumber, targetNumber, maxPosition, stageNumber),
      `Exercice ${exerciseNumber}/3`
    );
  }
}

function buildNumberPhases(
  exerciseNumber: number,
  targetNumber: string,
  maxPosition: number,
  stageNumber: number
): PhaseBase[] {
  const phases: PhaseBase[] = [];

  // Introduction de l'exercice avec annonce du nombre
  phases.push(new NumberIntroPhase(
    exerciseNumber,
    targetNumber,
    stageNumber
  ));

  // Pour chaque colonne à remplir (de 0 à maxPosition)
  for (let columnIndex = 0; columnIndex <= maxPosition; columnIndex++) {
    phases.push(new ColumnFillPhase(
      columnIndex,
      targetNumber,
      maxPosition
    ));
  }

  // Complétion de l'exercice
  phases.push(new NumberCompletionPhase(
    exerciseNumber,
    targetNumber
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
    private stageNumber: number
  ) {
    super(
      `number-intro-${stageNumber}-${exerciseNumber}`,
      `Introduction Exercice ${exerciseNumber}`
    );
  }

  async execute(): Promise<void> {
    console.log(`🎯 Exercice ${this.exerciseNumber}/3: ${this.targetNumber}`);

    // Réinitialiser la machine
    this.sendToUnity('SetValue', '0000');

    // Envoyer le nombre cible à Unity
    console.log('Sending ChangeList ->', this.targetNumber);
    this.sendToUnity('ChangeList', this.targetNumber);

    // Annonce vocale
    await this.speak(`Nombre ${this.exerciseNumber} sur 3 : forme le nombre ${this.targetNumber}`);

    this.updateGameState({
      message: `Nombre ${this.exerciseNumber}/3 : ${this.targetNumber}`,
      targetNumber: this.targetNumber,
      instruction: `Nombre à former : ${this.targetNumber}. Commence par la colonne des Unités.`,
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
  constructor(
    private exerciseNumber: number,
    private targetNumber: string
  ) {
    super(
      `number-completion-${exerciseNumber}`,
      `Complétion Exercice ${exerciseNumber}`
    );
  }

  async execute(): Promise<void> {
    console.log(`✅ Exercice ${this.exerciseNumber}/3 complété`);

    await this.speak('Excellent ! Tu as formé le nombre correctement !');

    this.updateGameState({
      message: `✓ Nombre ${this.exerciseNumber}/3 complété !`,
      instruction: `Bravo ! Tu as réussi à former le nombre ${this.targetNumber}.`
    });

    // Unlock all before next number
    this.sendToUnity('LockThousand:', 0);
    this.sendToUnity('LockHundred:', 0);
    this.sendToUnity('LockTen:', 0);
    this.sendToUnity('LockUnit:', 0);

    // Pause avant le prochain nombre
    await new Promise(resolve => setTimeout(resolve, NUMBER_COMPLETION_DELAY));

    this.complete();
  }
}
