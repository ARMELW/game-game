import { PhaseBase } from "../../core/phases/abstract-phase";

/**
 * Phase 2: Compréhension des colonnes
 * Éducation progressive sur chaque position (unité, dizaine, centaine, millième)
 * Avec 3 mini-challenges par position
 */
export class ColumnUnderstandingPhase extends PhaseBase {
  // Positions : 0=unité, 1=dizaine, 2=centaine, 3=millième
  private currentPosition = 0;
  private readonly positionNames = ['Unité', 'Dizaine', 'Centaine', 'Millième'];
  private readonly lockCommands = ['LockUnit', 'LockTen', 'LockHundred', 'LockThousand'];
  
  // Challenges
  private challengesPerPosition = 3;
  private currentChallenge = 0;
  private currentTarget = '';
  private currentValue = '0000';
  private waitingForValidation = false; // Prevent multiple listener registrations

  constructor() {
    super('column-understanding', 'Compréhension des colonnes');
  }

  async execute(): Promise<void> {
    console.log('📊 Phase 2: Compréhension des colonnes');

    // Message d'introduction
    await this.speak('Bravo pour avoir maîtrisé les boutons ! Maintenant, nous allons découvrir le secret des nombres : les positions !');
    await this.speak('Un nombre est composé de quatre positions : les millièmes, les centaines, les dizaines, et les unités.');
    
    this.updateGameState({
      message: 'Découvrons les positions ensemble !',
      showValidateButton: false
    });

    // Tout bloquer au départ
    this.lockAll();

    // Réinitialiser la machine
    this.sendToUnity('SetValue', '0000');

    // Écouter les changements de valeur
    this.onUnityEvent('SetValueUpdate', (data: { value?: string }) => {
      const valueStr = data.value || '0';
      this.currentValue = valueStr.padStart(4, '0');
      this.checkChallengeProgress();
    });

    // Attendre 2 secondes puis commencer par les unités
    setTimeout(() => {
      this.startPositionLearning();
    }, 2000);
  }

  private generateRandomNumbers(count: number): string[] {
    const numbers: string[] = [];
    for (let i = 0; i < count; i++) {
      const num = Math.floor(Math.random() * 10000);
      numbers.push(num.toString().padStart(4, '0'));
    }
    return numbers;
  }

  private unlockAll(): void {
    this.sendToUnity('LockThousand', 0);
    this.sendToUnity('LockHundred', 0);
    this.sendToUnity('LockTen', 0);
    this.sendToUnity('LockUnit', 0);
  }

  private lockAll(): void {
    this.sendToUnity('LockThousand', 1);
    this.sendToUnity('LockHundred', 1);
    this.sendToUnity('LockTen', 1);
    this.sendToUnity('LockUnit', 1);
  }

  private async startPositionLearning(): Promise<void> {
    const positionName = this.positionNames[this.currentPosition];
    console.log(`Apprentissage de la position: ${positionName}`);

    // Réinitialiser
    this.sendToUnity('SetValue', '0000');
    this.currentValue = '0000';

    // Débloquer uniquement la position actuelle
    this.lockAll();
    this.sendToUnity(this.lockCommands[this.currentPosition], 0);

    // Explication vocale selon la position
    await this.explainPosition(this.currentPosition);

    // Afficher l'instruction
    this.updateGameState({
      message: `Position : ${positionName}`,
      currentDigit: positionName,
      showValidateButton: false
    });

    // Laisser un moment pour expérimenter
    setTimeout(() => {
      this.startChallenges();
    }, 3000);
  }

  private async explainPosition(position: number): Promise<void> {
    switch(position) {
      case 0: // Unité
        await this.speak('Commençons par la position la plus à droite : l\'unité.');
        await this.speak('L\'unité représente les nombres de zéro à neuf. C\'est comme compter sur tes doigts d\'une seule main !');
        await this.speak('Tu peux avoir 0, 1, 2, 3, 4, 5, 6, 7, 8 ou 9 unités. Mais pas plus ! Essaie les boutons pour voir.');
        break;
      case 1: // Dizaine
        await this.speak('Maintenant, découvrons la dizaine ! C\'est la deuxième position en partant de la droite.');
        await this.speak('Une dizaine, c\'est comme avoir 10 unités regroupées ensemble. On peut avoir jusqu\'à 9 dizaines, c\'est-à-dire 90 !');
        await this.speak('Quand tu as 1 à la position des dizaines, ça fait 10. Avec 2, ça fait 20. Et ainsi de suite !');
        break;
      case 2: // Centaine
        await this.speak('Passons à la centaine ! C\'est la troisième position.');
        await this.speak('Une centaine, c\'est comme avoir 100 unités, ou 10 dizaines regroupées. C\'est beaucoup !');
        await this.speak('Tu peux avoir de 0 à 9 centaines. Avec 1 centaine, tu as 100. Avec 5 centaines, tu as 500 !');
        break;
      case 3: // Millième
        await this.speak('Enfin, découvrons le millième ! C\'est la position la plus à gauche.');
        await this.speak('Un millième, c\'est énorme : mille unités ! Ou 100 dizaines, ou 10 centaines !');
        await this.speak('Avec 9 millièmes et tout rempli, on arrive jusqu\'à 9999. C\'est le plus grand nombre qu\'on peut faire avec cette machine !');
        break;
    }
  }

  private async startChallenges(): Promise<void> {
    await this.speak(`Maintenant, faisons quelques petits exercices pour bien comprendre la position ${this.positionNames[this.currentPosition]} !`);
    
    this.currentChallenge = 0;
    this.nextChallenge();
  }

  private nextChallenge(): void {
    if (this.currentChallenge >= this.challengesPerPosition) {
      // Tous les challenges de cette position sont terminés
      this.completePosition();
      return;
    }

    // Reset validation flag
    this.waitingForValidation = false;

    // Générer un nombre cible
    this.currentTarget = this.generateTargetForPosition(this.currentPosition);
    console.log(`Challenge ${this.currentChallenge + 1}/${this.challengesPerPosition} pour ${this.positionNames[this.currentPosition]}: ${this.currentTarget}`);

    // Réinitialiser
    this.sendToUnity('SetValue', '0000');
    this.currentValue = '0000';

    // Envoyer la cible à Unity
    this.sendToUnity('ChangeList', this.currentTarget);

    this.updateGameState({
      message: `Forme le nombre : ${this.currentTarget}`,
      targetNumber: this.currentTarget,
      showValidateButton: false
    });
  }

  private generateTargetForPosition(position: number): string {
    // Générer un nombre avec uniquement la position actuelle non-nulle
    const digitValue = Math.floor(Math.random() * 9) + 1; // 1-9
    const parts = ['0', '0', '0', '0'];
    parts[3 - position] = digitValue.toString();
    return parts.join('');
  }

  private checkChallengeProgress(): void {
    const targetDigit = this.currentTarget[3 - this.currentPosition];
    const currentDigit = this.currentValue[3 - this.currentPosition];

    if (currentDigit === targetDigit && !this.waitingForValidation) {
      console.log(`✓ Challenge ${this.currentChallenge + 1} correct!`);
      
      this.waitingForValidation = true; // Prevent multiple listener registrations
      
      this.updateGameState({
        message: '✓ Parfait ! Clique sur Valider',
        showValidateButton: true
      });

      // Écouter la validation (une seule fois)
      const handleValidate = async () => {
        await this.speak('Excellent !');
        
        this.updateGameState({
          showValidateButton: false
        });

        this.currentChallenge++;
        
        setTimeout(() => {
          this.nextChallenge();
        }, 1000);
      };

      this.onEvent('validateClick', handleValidate);
    }
  }

  private async completePosition(): Promise<void> {
    await this.speak(`Bravo ! Tu maîtrises maintenant la position ${this.positionNames[this.currentPosition]} !`);
    
    this.currentPosition++;

    if (this.currentPosition < 4) {
      // Passer à la position suivante
      setTimeout(() => {
        this.startPositionLearning();
      }, 2000);
    } else {
      // Toutes les positions apprises, faire la révision finale
      await this.speak('Fantastique ! Tu as appris toutes les positions ! Maintenant, faisons un dernier exercice pour tout réviser ensemble.');
      setTimeout(() => {
        this.startFinalReview();
      }, 2000);
    }
  }

  private async startFinalReview(): Promise<void> {
    // Débloquer toutes les positions pour la révision finale
    this.unlockAll();
    
    await this.speak('Pour terminer, forme 3 nombres complets en utilisant toutes les positions que tu as apprises !');
    
    // Générer 3 nombres complets aléatoires
    const reviewNumbers = this.generateRandomNumbers(3);
    this.currentChallenge = 0;
    
    this.doFinalReviewChallenge(reviewNumbers);
  }

  private doFinalReviewChallenge(numbers: string[]): void {
    if (this.currentChallenge >= numbers.length) {
      // Révision terminée
      this.completePhase();
      return;
    }

    this.currentTarget = numbers[this.currentChallenge];
    this.waitingForValidation = false; // Reset validation flag
    
    // Réinitialiser
    this.sendToUnity('SetValue', '0000');
    this.currentValue = '0000';

    // Envoyer la cible à Unity
    this.sendToUnity('ChangeList', this.currentTarget);

    this.updateGameState({
      message: `Révision ${this.currentChallenge + 1}/3 : Forme le nombre ${this.currentTarget}`,
      targetNumber: this.currentTarget,
      showValidateButton: false
    });

    // Vérifier la progression
    const checkReview = () => {
      if (this.currentValue === this.currentTarget && !this.waitingForValidation) {
        this.waitingForValidation = true; // Prevent multiple listener registrations
        
        this.updateGameState({
          message: '✓ Excellent ! Clique sur Valider',
          showValidateButton: true
        });

        const handleValidate = async () => {
          await this.speak('Parfait !');
          
          this.updateGameState({
            showValidateButton: false
          });

          this.currentChallenge++;
          
          setTimeout(() => {
            this.doFinalReviewChallenge(numbers);
          }, 1500);
        };

        this.onEvent('validateClick', handleValidate);
      }
    };

    // Surveillance continue
    this.onUnityEvent('SetValueUpdate', (data: { value?: string }) => {
      const valueStr = data.value || '0';
      this.currentValue = valueStr.padStart(4, '0');
      checkReview();
    });
  }

  private async completePhase(): Promise<void> {
    await this.speak('Magnifique ! Tu es maintenant un expert des positions ! Passe à la suite pour t\'entraîner librement !');
    
    this.updateGameState({
      message: 'Vous maîtrisez maintenant toutes les positions !'
    });

    setTimeout(() => {
      this.complete();
    }, 2000);
  }
}
