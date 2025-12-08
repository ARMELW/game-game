import { PhaseBase } from "../../../core/phases/abstract-phase";

/**
 * Mini-phase: Introduction d'un stage
 * Annonce vocalement le début d'un stage (Unités, Unités+Dizaines, etc.)
 */
export class StageIntroPhase extends PhaseBase {
  constructor(
    private stageNumber: number,
    private stageName: string,
    private stageDescription: string
  ) {
    super(`stage-intro-${stageNumber}`, `Introduction Stage ${stageNumber}`);
  }

  async execute(): Promise<void> {
    console.log(`📢 Stage ${this.stageNumber}: ${this.stageName}`);

    // Annonce vocale du stage
    await this.speak(`Étape ${this.stageNumber}: ${this.stageName}`);
    await this.speak(this.stageDescription);

    // Mettre à jour l'interface
    this.updateGameState({
      message: `Étape ${this.stageNumber}/4: ${this.stageName}`,
      instruction: this.stageDescription
    });

    // Petite pause pour laisser le temps de lire
    await new Promise(resolve => setTimeout(resolve, 2000));

    this.complete();
  }
}
