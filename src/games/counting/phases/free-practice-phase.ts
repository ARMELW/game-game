import { PhaseBase } from "../../core/phases/abstract-phase";

/**
 * Phase 3: Exercices libres
 * L'utilisateur s'entraîne librement avec des nombres aléatoires
 */
export class FreePracticePhase extends PhaseBase {
  private currentTarget = '';
  private successCount = 0;
  private currentValue = '0000';

  constructor() {
    super('free-practice', 'Exercices libres');
  }

  async execute(): Promise<void> {
    console.log('🔄 Phase 3: Exercices libres');

    // Débloquer tous les rouleaux
    this.sendToUnity('LockThousand:', 0);
    this.sendToUnity('LockHundred:', 0);
    this.sendToUnity('LockTen:', 0);
    this.sendToUnity('LockUnit:', 0);

    // Message vocal d'introduction
    await this.speak('Bravo ! Maintenant, c\'est l\'heure de t\'entraîner librement ! Je vais te donner des nombres à former, et tu utiliseras tout ce que tu as appris.');
    await this.speak('Prends ton temps, et amuse-toi bien !');

    // Afficher l'interface
    this.updateGameState({
      message: 'Entraînez-vous librement !',
      successCount: 0,
      showValidateButton: true,
      showQuitButton: true
    });

    // Écouter les changements de valeur pour tracker la valeur actuelle
    this.onUnityEvent('SetValueUpdate', (data: { value?: string }) => {
      const valueStr = data.value || '0';
      this.currentValue = valueStr.padStart(4, '0');
      console.log('Current value updated:', this.currentValue);
    });

    // Écouter le clic sur Quitter
    this.onEvent('quitClick', () => {
      this.exitTutorial();
    });

    // Écouter le clic sur Valider
    this.onEvent('validateClick', () => {
      this.validateExercise();
    });

    // Commencer le premier exercice
    this.startNewExercise();
  }

  private startNewExercise(): void {
    // Générer un nombre aléatoire
    const randomNum = Math.floor(Math.random() * 10000);
    this.currentTarget = randomNum.toString().padStart(4, '0');

    console.log(`Nouvel exercice: ${this.currentTarget}`);

    // Créer la liste avec ce nombre
    this.sendToUnity('ChangeList', this.currentTarget);

    // Réinitialiser la valeur
    this.sendToUnity('SetValue', '0000');
    this.currentValue = '0000';

    // Afficher l'objectif
    this.updateGameState({
      message: `Formez le nombre : ${this.currentTarget}`,
      targetNumber: this.currentTarget,
      showValidateButton: true,
      showQuitButton: true
    });
  }

  private validateExercise(): void {
    console.log(`Validation: ${this.currentValue} vs ${this.currentTarget}`);

    if (this.currentValue === this.currentTarget) {
      // Correct !
      this.successCount++;
      console.log(`✓ Bravo! Succès: ${this.successCount}`);

      // Messages vocaux variés selon le nombre de succès (non-bloquant)
      if (this.successCount === 1) {
        this.speakNonBlocking('Bravo ! Tu as réussi ton premier exercice !');
      } else if (this.successCount === 3) {
        this.speakNonBlocking('Excellent ! Trois exercices de suite ! Tu es en pleine forme !');
      } else if (this.successCount === 5) {
        this.speakNonBlocking('Incroyable ! Cinq exercices ! Tu es vraiment doué !');
      } else if (this.successCount % 5 === 0) {
        this.speakNonBlocking(`Fantastique ! ${this.successCount} exercices réussis ! Continue comme ça !`);
      } else {
        this.speakNonBlocking('Parfait !');
      }

      this.updateGameState({
        message: '✓ Bravo !',
        successCount: this.successCount,
        showValidateButton: false,
        showQuitButton: true
      });

      // Attendre 2 secondes puis nouveau nombre
      setTimeout(() => {
        this.startNewExercise();
      }, 2000);
    } else {
      // Incorrect
      console.log('✗ Pas correct, réessayez');

      this.speakNonBlocking('Hmmm, ce n\'est pas tout à fait ça. Regarde bien le nombre demandé et réessaie !');

      this.updateGameState({
        message: '✗ Pas tout à fait... Réessayez !',
        showValidateButton: true,
        showQuitButton: true
      });
    }
  }

  private async exitTutorial(): Promise<void> {
    console.log(`Fin du tutoriel. Exercices réussis: ${this.successCount}`);

    await this.speak(`Félicitations ! Tu as réussi ${this.successCount} exercice${this.successCount > 1 ? 's' : ''} ! Tu as fait un excellent travail ! À bientôt pour de nouvelles aventures !`);

    this.updateGameState({
      message: `Félicitations ! Vous avez réussi ${this.successCount} exercice(s).`,
      showValidateButton: false,
      showQuitButton: false
    });

    // Débloquer tous les rouleaux
    this.sendToUnity('LockThousand:', 0);
    this.sendToUnity('LockHundred:', 0);
    this.sendToUnity('LockTen:', 0);
    this.sendToUnity('LockUnit:', 0);

    // Compléter la phase après 3 secondes
    setTimeout(() => {
      this.complete();
    }, 3000);
  }
}
