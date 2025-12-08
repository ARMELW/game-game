import { PhaseBase } from "../../core/phases/abstract-phase";

/**
 * Phase 2: Compréhension des colonnes (Nouvelle version)
 * L'utilisateur remplit un nombre complet colonne par colonne
 * Avec assistance vocale pour chaque étape et gestion des erreurs
 */
export class ColumnUnderstandingPhase extends PhaseBase {
  // Positions : 0=unité, 1=dizaine, 2=centaine, 3=millième
  private readonly positionNames = ['Unité', 'Dizaine', 'Centaine', 'Millième'];
  private readonly lockCommands = ['LockUnit', 'LockTen', 'LockHundred', 'LockThousand'];

  // État de l'exercice
  private currentNumbers: string[] = []; // 3 nombres à compléter
  private currentNumberIndex = 0;
  private currentPosition = 0; // Position actuelle (0-3)
  private currentValue = '0000';
  private targetNumber = '';
  private validationHandled = false; // Flag to prevent duplicate event handlers

  constructor() {
    super('column-understanding', 'Compréhension des colonnes');
  }

  async execute(): Promise<void> {
    console.log('📊 Phase 2: Compréhension des colonnes - Nouvelle version');
    
    // Tout bloquer au départ
    this.lockAll();
    
    // Message d'introduction
    await this.speak('Bravo pour avoir maîtrisé les boutons !');
    await this.speak('Maintenant, nous allons apprendre à former des nombres complets, colonne par colonne.');
    await this.speak('Je vais te donner un nombre, et tu vas le former en remplissant chaque colonne une par une.');
    await this.speak('Commençons par l\'Unité, puis la Dizaine, la Centaine, et enfin le Millième.');
    
    this.updateGameState({
      message: 'Préparation de l\'exercice...',
      instruction: 'Nous allons former 3 nombres ensemble. Pour chaque nombre, tu rempliras les colonnes une par une, en commençant par l\'Unité.',
      showValidateButton: false
    });

    // Générer 3 nombres aléatoires
    this.currentNumbers = this.generateRandomNumbers(3);
    console.log('Nombres générés:', this.currentNumbers);

    // Réinitialiser la machine
    this.sendToUnity('SetValue', '0000');

    // Écouter les changements de valeur
    this.onUnityEvent('SetValueUpdate', (data: { value?: string }) => {
      const valueStr = data.value || '0';
      this.currentValue = valueStr.padStart(4, '0');
      this.checkProgress();
    });

    // Attendre 2 secondes puis commencer
    setTimeout(() => {
      this.startNewNumber();
    }, 2000);
  }

  private generateRandomNumbers(count: number): string[] {
    const numbers: string[] = [];
    for (let i = 0; i < count; i++) {
      // Générer des nombres entre 1000 et 9999 pour avoir au moins le chiffre des milliers non-nul
      const num = Math.floor(Math.random() * 9000) + 1000; // Entre 1000 et 9999
      numbers.push(num.toString().padStart(4, '0'));
    }
    return numbers;
  }

  private unlockAll(): void {
    this.sendToUnity('LockThousand:', 0);
    this.sendToUnity('LockHundred:', 0);
    this.sendToUnity('LockTen:', 0);
    this.sendToUnity('LockUnit:', 0);
  }

  private lockAll(): void {
    this.sendToUnity('LockThousand:', 1);
    this.sendToUnity('LockHundred:', 1);
    this.sendToUnity('LockTen:', 1);
    this.sendToUnity('LockUnit:', 1);
  }

  private async startNewNumber(): Promise<void> {
    if (this.currentNumberIndex >= this.currentNumbers.length) {
      // Tous les nombres terminés
      await this.completePhase();
      return;
    }

    this.targetNumber = this.currentNumbers[this.currentNumberIndex];
    this.currentPosition = 0; // Recommencer à l'unité

    // Réinitialiser la machine
    this.sendToUnity('SetValue', '0000');
    this.currentValue = '0000';

    // Envoyer le nombre cible à Unity
    this.sendToUnity('ChangeList', this.targetNumber);

    // Annoncer le nombre
    await this.speak(`Exercice numéro ${this.currentNumberIndex + 1} sur 3.`);
    await this.speak(`Le nombre à former est : ${this.targetNumber}`);
    
    this.updateGameState({
      message: `Nombre ${this.currentNumberIndex + 1}/3 : ${this.targetNumber}`,
      targetNumber: this.targetNumber,
      instruction: `Nombre à former : ${this.targetNumber}. Nous allons le remplir colonne par colonne.`,
      showValidateButton: false
    });

    // Commencer par la première colonne
    setTimeout(() => {
      this.startColumn();
    }, 2000);
  }

  private async startColumn(): Promise<void> {
    const positionName = this.positionNames[this.currentPosition];
    const targetDigit = this.targetNumber[3 - this.currentPosition];
    
    console.log(`Démarrage colonne: ${positionName}, chiffre cible: ${targetDigit}`);
    
    // Reset validation flag
    this.validationHandled = false;
    
    // Tout bloquer puis débloquer uniquement la position actuelle
    this.lockAll();
    this.sendToUnity(this.lockCommands[this.currentPosition], 0);

    // Instruction vocale
    await this.speak(`Commençons par la colonne des ${positionName}.`);
    await this.speak(`Pour le nombre ${this.targetNumber}, la colonne des ${positionName} doit afficher ${targetDigit}.`);
    await this.speak(`Utilise les boutons pour mettre ${targetDigit} dans la colonne des ${positionName}.`);

    this.updateGameState({
      message: `Colonne: ${positionName} → ${targetDigit}`,
      currentDigit: positionName,
      instruction: `Remplis la colonne des ${positionName} avec le chiffre ${targetDigit}. Utilise les boutons ↑ et ↓ pour ajuster la valeur.`,
      showValidateButton: false
    });
  }

  private checkProgress(): void {
    // Vérifier si toutes les colonnes précédentes sont correctes
    for (let i = 0; i < this.currentPosition; i++) {
      const targetDigit = this.targetNumber[3 - i];
      const currentDigit = this.currentValue[3 - i];
      if (currentDigit !== targetDigit) {
        // Une colonne précédente a été modifiée incorrectement
        this.handlePreviousColumnError(i);
        return;
      }
    }

    // Vérifier la colonne actuelle
    const targetDigit = this.targetNumber[3 - this.currentPosition];
    const currentDigit = this.currentValue[3 - this.currentPosition];

    if (currentDigit === targetDigit) {
      // Colonne correcte !
      this.handleColumnCorrect();
    } else {
      // La valeur a changé mais n'est pas encore correcte
      // On ne compte pas comme erreur tant que l'utilisateur n'a pas essayé de valider
    }
  }

  private async handlePreviousColumnError(columnIndex: number): Promise<void> {
    const columnName = this.positionNames[columnIndex];
    const targetDigit = this.targetNumber[3 - columnIndex];
    
    await this.speak(`Attention ! Tu as modifié la colonne des ${columnName}.`);
    await this.speak(`Elle doit rester à ${targetDigit}.`);
    
    this.updateGameState({
      instruction: `⚠️ Attention : Tu as modifié une colonne précédente (${columnName}). Elle doit rester à ${targetDigit}. Corrige-la avant de continuer.`
    });
  }

  private handleColumnCorrect(): void {
    // Prevent duplicate event handlers
    if (this.validationHandled) {
      return;
    }
    this.validationHandled = true;

    const positionName = this.positionNames[this.currentPosition];
    const targetDigit = this.targetNumber[3 - this.currentPosition];

    console.log(`✓ Colonne ${positionName} correcte: ${targetDigit}`);

    this.speakNonBlocking('Parfait !');

    this.updateGameState({
      message: `✓ ${positionName} : ${targetDigit} - Correct !`,
      instruction: `Excellent ! La colonne des ${positionName} est correcte. Clique sur Valider pour passer à la suite.`,
      showValidateButton: true
    });

    // Écouter la validation (une seule fois)
    this.onEvent('validateClick', () => {
      this.nextColumn();
    });
  }

  private async nextColumn(): Promise<void> {
    this.updateGameState({
      showValidateButton: false
    });

    this.currentPosition++;

    if (this.currentPosition >= 4) {
      // Toutes les colonnes sont remplies
      await this.completeNumber();
    } else {
      // Passer à la colonne suivante
      await this.speak('Très bien ! Passons à la colonne suivante.');
      setTimeout(() => {
        this.startColumn();
      }, 1000);
    }
  }

  private async completeNumber(): Promise<void> {
    await this.speak('Excellent ! Tu as formé le nombre correctement !');
    await this.speak(`Le nombre ${this.targetNumber} est maintenant complet.`);

    this.updateGameState({
      message: `✓ Nombre ${this.currentNumberIndex + 1}/3 complété !`,
      instruction: `Bravo ! Tu as réussi à former le nombre ${this.targetNumber} en remplissant chaque colonne.`,
      successCount: this.currentNumberIndex + 1
    });

    this.currentNumberIndex++;

    // Passer au nombre suivant ou terminer
    setTimeout(() => {
      this.startNewNumber();
    }, 3000);
  }

  private async completePhase(): Promise<void> {
    await this.speak('Fantastique ! Tu as réussi tous les exercices !');
    await this.speak('Tu maîtrises maintenant la formation des nombres colonne par colonne !');
    await this.speak('Tu es prêt pour la suite !');

    this.updateGameState({
      message: '🎉 Phase terminée avec succès !',
      instruction: 'Félicitations ! Tu sais maintenant comment former n\'importe quel nombre en remplissant les colonnes une par une.',
      showValidateButton: false
    });

    setTimeout(() => {
      this.complete();
    }, 3000);
  }
}

