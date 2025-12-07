import { PhaseBase } from "../../core/phases/abstract-phase";

/**
 * Phase 2: Compréhension des colonnes
 * Guide l'utilisateur à travers 3 nombres en débloquant progressivement chaque colonne
 */
export class ColumnUnderstandingPhase extends PhaseBase {
  private numbers: string[] = [];
  private currentNumberIndex = 0;
  private currentDigitIndex = 0; // 0=unité, 1=dizaine, 2=centaine, 3=millième
  private readonly digitNames = ['Unité', 'Dizaine', 'Centaine', 'Millième'];
  private readonly lockCommands = ['LockUnit', 'LockTen', 'LockHundred', 'LockThousand'];

  constructor() {
    super('column-understanding', 'Compréhension des colonnes');
  }

  execute(): void {
    console.log('📊 Phase 2: Compréhension des colonnes');

    // Générer 3 nombres aléatoires
    this.numbers = this.generateRandomNumbers(3);
    console.log('Nombres générés:', this.numbers);

    // Envoyer la liste à Unity
    this.sendToUnity('ChangeList', this.numbers.join('/'));

    // Afficher bulle explicative
    this.updateGameState({
      message: 'Millième | Centaine | Dizaine | Unité',
      showValidateButton: false
    });

    // Débloquer tous temporairement pour montrer
    this.unlockAll();

    // Attendre 3 secondes puis commencer le premier exercice
    setTimeout(() => {
      this.startNumberExercise();
    }, 3000);
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

  private startNumberExercise(): void {
    const targetNumber = this.numbers[this.currentNumberIndex];
    console.log(`Exercice pour le nombre: ${targetNumber}`);

    // Réinitialiser
    this.sendToUnity('SetValue', '0000');

    // Bloquer tout
    this.lockAll();

    // Commencer par l'unité
    this.currentDigitIndex = 0;
    this.startDigitExercise(targetNumber);
  }

  private startDigitExercise(targetNumber: string): void {
    const digitName = this.digitNames[this.currentDigitIndex];
    const digitPosition = 3 - this.currentDigitIndex; // Position dans la string (de droite à gauche)
    const targetDigit = targetNumber[digitPosition];

    console.log(`Sous-étape: ${digitName} (cible: ${targetDigit})`);

    // Débloquer la colonne actuelle
    this.sendToUnity(this.lockCommands[this.currentDigitIndex], 0);

    // Afficher l'instruction
    this.updateGameState({
      message: `Formez le nombre: ${targetNumber}\nRéglez ${digitName} sur ${targetDigit}`,
      targetNumber: targetNumber,
      currentDigit: digitName,
      showValidateButton: false
    });

    // Écouter les changements de valeur
    this.onUnityEvent('SetValueUpdate', (data: any) => {
      this.handleValueUpdate(data, targetNumber);
    });
  }

  private handleValueUpdate(data: any, targetNumber: string): void {
    const valueStr = data.value || data.toString();
    const currentValue = valueStr.padStart(4, '0');
    console.log(`Valeur actuelle: ${currentValue}, cible: ${targetNumber}`);

    // Vérifier si la colonne actuelle est correcte
    const digitPosition = 3 - this.currentDigitIndex;
    const currentDigit = currentValue[digitPosition];
    const targetDigit = targetNumber[digitPosition];

    // Vérifier aussi que les colonnes précédentes sont toujours correctes
    let previousCorrect = true;
    for (let i = 0; i < this.currentDigitIndex; i++) {
      const prevPos = 3 - i;
      if (currentValue[prevPos] !== targetNumber[prevPos]) {
        previousCorrect = false;
        break;
      }
    }

    if (currentDigit === targetDigit && previousCorrect) {
      console.log(`✓ ${this.digitNames[this.currentDigitIndex]} correct!`);
      
      // Passer à la colonne suivante
      this.currentDigitIndex++;

      if (this.currentDigitIndex < 4) {
        // Il reste des colonnes
        setTimeout(() => {
          this.startDigitExercise(targetNumber);
        }, 500);
      } else {
        // Toutes les colonnes complétées pour ce nombre
        this.completeNumberExercise();
      }
    }
  }

  private completeNumberExercise(): void {
    console.log(`✓ Nombre ${this.numbers[this.currentNumberIndex]} complété!`);

    this.updateGameState({
      message: 'Parfait ! Cliquez sur Valider',
      showValidateButton: true
    });

    // Attendre la validation
    this.onEvent('validateClick', () => {
      this.updateGameState({
        message: '✓ Bravo !',
        showValidateButton: false
      });

      setTimeout(() => {
        this.currentNumberIndex++;

        if (this.currentNumberIndex < this.numbers.length) {
          // Passer au nombre suivant
          this.startNumberExercise();
        } else {
          // Tous les nombres complétés
          this.updateGameState({
            message: 'Vous maîtrisez maintenant les colonnes !'
          });

          setTimeout(() => {
            this.complete();
          }, 2000);
        }
      }, 2000);
    });
  }
}
