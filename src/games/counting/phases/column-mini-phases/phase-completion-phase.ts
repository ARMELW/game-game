import { PhaseBase } from "../../../core/phases/abstract-phase";

/**
 * Mini-phase: Complétion finale de toute la phase
 */
export class PhaseCompletionPhase extends PhaseBase {
  constructor() {
    super('phase-completion', 'Complétion Phase 2');
  }

  async execute(): Promise<void> {
    console.log('🎉 Phase 2 complétée !');

    await this.speak('Fantastique ! Tu as terminé tous les exercices !');
    await this.speak('Tu sais maintenant former n\'importe quel nombre en remplissant les colonnes une par une !');
    await this.speak('Tu es prêt pour la suite !');

    this.updateGameState({
      message: '🎉 Phase terminée avec succès !',
      instruction: 'Félicitations ! Tu maîtrises maintenant toutes les colonnes et peux former n\'importe quel nombre.',
      showValidateButton: false
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    this.complete();
  }
}
