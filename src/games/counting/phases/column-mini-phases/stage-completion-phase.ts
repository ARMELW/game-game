import { PhaseBase } from "../../../core/phases/abstract-phase";

/**
 * Mini-phase: Complétion d'un stage
 * Célèbre la fin d'un stage avec un message vocal et visuel
 */
export class StageCompletionPhase extends PhaseBase {
  constructor(
    private stageNumber: number,
    private stageName: string,
    private isLastStage: boolean = false
  ) {
    super(`stage-completion-${stageNumber}`, `Complétion Stage ${stageNumber}`);
  }

  async execute(): Promise<void> {
    console.log(`✅ Stage ${this.stageNumber} complété: ${this.stageName}`);

    if (this.isLastStage) {
      // Dernière étape - félicitations finales
      await this.speak('Bravo ! Tu as maîtrisé toutes les colonnes !');
    } else {
      // Stage intermédiaire - encouragements
      await this.speak(`Excellent ! Tu maîtrises maintenant ${this.stageName} !`);
      await this.speak('Passons à l\'étape suivante !');
    }

    this.updateGameState({
      message: `✓ Étape ${this.stageNumber} terminée !`,
      instruction: this.isLastStage 
        ? 'Félicitations ! Tu peux maintenant former n\'importe quel nombre !'
        : 'Préparation de l\'étape suivante...'
    });

    // Pause avant la transition
    await new Promise(resolve => setTimeout(resolve, 3000));

    this.complete();
  }
}
