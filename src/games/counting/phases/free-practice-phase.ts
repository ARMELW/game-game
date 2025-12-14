import { PhaseBase } from "../../core/phases/abstract-phase";

/**
 * Phase 3: Exercices libres
 * Mode libre sans guidage : tous les rouleaux débloqués
 * L'utilisateur trouve le nombre ou pas, et on continue automatiquement
 */
export class FreePracticePhase extends PhaseBase {
  private readonly INTRO_DELAY_MS = 2000;
  private readonly SUCCESS_DELAY_MS = 2000;

  private currentTarget = '';
  private successCount = 0;
  private currentValue = '0000';

  constructor() {
    super('free-practice', 'Exercices libres');
  }

  async execute(): Promise<void> {
    console.log('🔄 Phase 3: Exercices libres');

    // Message vocal d'introduction
    await this.speak('Bravo ! Maintenant, c\'est l\'heure de t\'entraîner librement ! Je vais te donner des nombres à former.');
    await this.speak('Utilise tous les rouleaux pour former le nombre. Amuse-toi bien !');

    // Afficher l'interface
    this.updateGameState({
      message: 'Mode libre : trouve les nombres !',
      successCount: 0,
      showValidateButton: false,
      showQuitButton: true
    });

    // Débloquer tous les rouleaux
    this.unlockAll();

    // Écouter les changements de valeur
    this.onUnityEvent('SetValueUpdate', (data: { value?: string }) => {
      const valueStr = data.value || '0';
      this.currentValue = valueStr.padStart(4, '0');
      console.log('Current value:', this.currentValue);
    });

    // CorrectValue = nombre trouvé automatiquement
    this.onUnityEvent('CorrectValue', () => {
      this.handleSuccess();
    });

    // Écouter le bouton Valider
    this.onEvent('validateClick', () => {
      this.validateNumber();
    });
    this.onUnityEvent('ValidButtonClicked', () => {
      this.validateNumber();
    });

    // Écouter le clic sur Quitter
    this.onEvent('quitClick', () => {
      this.exitGame();
    });

    // Commencer le premier exercice
    setTimeout(() => {
      this.startNewExercise();
    }, this.INTRO_DELAY_MS);
  }

  private unlockAll(): void {
    this.sendToUnity('LockThousand:', 0);
    this.sendToUnity('LockHundred:', 0);
    this.sendToUnity('LockTen:', 0);
    this.sendToUnity('LockUnit:', 0);
  }

  private validateNumber(): void {
    if (this.currentValue === this.currentTarget) {
      this.handleSuccess();
    } else {
      // Nombre incorrect
      this.updateGameState({
        message: `❌ Essaie encore !`,
        instruction: `Le nombre n'est pas correct. Continue d'essayer !`
      });
      this.speakNonBlocking('Pas tout à fait ! Essaie encore.');
    }
  }

  private handleSuccess(): void {
    this.successCount++;
    console.log(`✓ Succès ${this.successCount} : ${this.currentTarget} trouvé !`);

    // Messages vocaux variés
    if (this.successCount === 1) {
      this.speakNonBlocking('Bravo ! Premier nombre trouvé !');
    } else if (this.successCount === 3) {
      this.speakNonBlocking('Excellent ! Trois nombres de suite !');
    } else if (this.successCount === 5) {
      this.speakNonBlocking('Incroyable ! Cinq nombres ! Tu es vraiment doué !');
    } else if (this.successCount % 5 === 0) {
      this.speakNonBlocking(`Fantastique ! ${this.successCount} nombres réussis !`);
    } else {
      this.speakNonBlocking('Parfait !');
    }

    this.updateGameState({
      message: `✓ Bravo ! ${this.successCount} nombre${this.successCount > 1 ? 's' : ''} trouvé${this.successCount > 1 ? 's' : ''} !`,
      instruction: `Excellent ! Tu as trouvé le nombre ${Number(this.currentTarget)}.`,
      successCount: this.successCount,
      showValidateButton: false
    });

    // Nouveau nombre après un délai
    setTimeout(() => {
      this.startNewExercise();
    }, this.SUCCESS_DELAY_MS);
  }

  private startNewExercise(): void {
    // Générer un nombre aléatoire entre 0 et 9999
    const randomNum = Math.floor(Math.random() * 10000);
    this.currentTarget = randomNum.toString().padStart(4, '0');

    console.log(`Nouvel exercice: ${this.currentTarget}`);

    // Créer la liste avec ce nombre
    this.sendToUnity('ChangeList', this.currentTarget);

    // Réinitialiser la valeur à 0000
    this.sendToUnity('SetValue', '0000');
    this.currentValue = '0000';

    // Afficher l'objectif
    this.updateGameState({
      message: `Trouve le nombre : ${Number(this.currentTarget)}`,
      targetNumber: this.currentTarget,
      instruction: `Utilise tous les rouleaux pour former le nombre ${Number(this.currentTarget)}.`,
      showValidateButton: false,
      showQuitButton: true
    });
  }

  private async exitGame(): Promise<void> {
    console.log(`Fin du jeu libre. Nombres trouvés: ${this.successCount}`);

    await this.speak(`Félicitations ! Tu as trouvé ${this.successCount} nombre${this.successCount > 1 ? 's' : ''} ! Excellent travail ! À bientôt !`);

    this.updateGameState({
      message: `Bravo ! Tu as trouvé ${this.successCount} nombre${this.successCount > 1 ? 's' : ''} !`,
      instruction: 'À bientôt pour de nouvelles aventures !',
      showValidateButton: false,
      showQuitButton: false
    });

    // Compléter la phase après 3 secondes
    setTimeout(() => {
      this.complete();
    }, 3000);
  }
}