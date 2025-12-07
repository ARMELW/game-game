import { PhaseBase } from "../../core/phases/abstract-phase";

/**
 * Phase 3: Exercices libres
 * L'utilisateur s'entraîne librement avec des nombres aléatoires
 */
export class FreePracticePhase extends PhaseBase {
  private currentTarget = '';
  private successCount = 0;
  private isWaitingForValidation = false;

  constructor() {
    super('free-practice', 'Exercices libres');
  }

  execute(): void {
    console.log('🔄 Phase 3: Exercices libres');

    // Débloquer tous les rouleaux
    this.sendToUnity('LockThousand', 0);
    this.sendToUnity('LockHundred', 0);
    this.sendToUnity('LockTen', 0);
    this.sendToUnity('LockUnit', 0);

    // Afficher l'interface
    this.updateGameState({
      message: 'Entraînez-vous librement !',
      successCount: 0,
      showValidateButton: true,
      showQuitButton: true
    });

    // Écouter le clic sur Quitter
    this.onEvent('quitClick', () => {
      this.exitTutorial();
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

    // Afficher l'objectif
    this.updateGameState({
      message: `Formez le nombre : ${this.currentTarget}`,
      targetNumber: this.currentTarget,
      showValidateButton: true,
      showQuitButton: true
    });

    this.isWaitingForValidation = true;

    // Écouter le clic sur Valider
    this.onEvent('validateClick', () => {
      if (this.isWaitingForValidation) {
        this.validateExercise();
      }
    });
  }

  private validateExercise(): void {
    this.isWaitingForValidation = false;

    // Écouter la valeur actuelle de Unity
    this.onUnityEvent('SetValueUpdate', (data: any) => {
      const valueStr = data.value || data.toString();
      const currentValue = valueStr.padStart(4, '0');
      console.log(`Validation: ${currentValue} vs ${this.currentTarget}`);

      if (currentValue === this.currentTarget) {
        // Correct !
        this.successCount++;
        console.log(`✓ Bravo! Succès: ${this.successCount}`);

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

        this.updateGameState({
          message: '✗ Pas tout à fait... Réessayez !',
          showValidateButton: true,
          showQuitButton: true
        });

        // Permettre de réessayer
        this.isWaitingForValidation = true;
      }
    });

    // Demander la valeur actuelle à Unity
    // Note: Dans une vraie implémentation, Unity devrait envoyer la valeur automatiquement
    // ou nous devrions avoir un moyen de la récupérer
  }

  private exitTutorial(): void {
    console.log(`Fin du tutoriel. Exercices réussis: ${this.successCount}`);

    this.updateGameState({
      message: `Félicitations ! Vous avez réussi ${this.successCount} exercice(s).`,
      showValidateButton: false,
      showQuitButton: false
    });

    // Débloquer tous les rouleaux
    this.sendToUnity('LockThousand', 0);
    this.sendToUnity('LockHundred', 0);
    this.sendToUnity('LockTen', 0);
    this.sendToUnity('LockUnit', 0);

    // Compléter la phase après 3 secondes
    setTimeout(() => {
      this.complete();
    }, 3000);
  }
}
