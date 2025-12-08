import { PhaseBase } from "../../core/phases/abstract-phase";

/**
 * Phase 2: Compréhension des colonnes (Version progressive)
 * L'utilisateur apprend progressivement en ajoutant une colonne à la fois:
 * 1. Unité seulement (3 nombres)
 * 2. Unité + Dizaine (3 nombres)
 * 3. Unité + Dizaine + Centaine (3 nombres)
 * 4. Unité + Dizaine + Centaine + Millième (3 nombres)
 */
export class ColumnUnderstandingPhase extends PhaseBase {
  // Positions : 0=unité, 1=dizaine, 2=centaine, 3=millième
  private readonly positionNames = ['Unité', 'Dizaine', 'Centaine', 'Millième'];
  private readonly lockCommands = ['LockUnit:', 'LockTen:', 'LockHundred:', 'LockThousand:'];

  // État de l'exercice
  private currentStage = 0; // 0=Unité, 1=Unité+Dizaine, 2=Unité+Dizaine+Centaine, 3=Tous
  private currentNumbers: string[] = []; // 3 nombres à compléter pour le stage actuel
  private currentNumberIndex = 0;
  private currentPosition = 0; // Position actuelle en cours de remplissage
  private currentValue = '0000';
  private targetNumber = '';
  private validationHandled = false; // Flag to prevent duplicate event handlers
  private validateHandlerRegistered = false; // Ensure the validate click listener is added once

  constructor() {
    super('column-understanding', 'Compréhension des colonnes');
  }

  async execute(): Promise<void> {
    console.log('📊 Phase 2: Compréhension des colonnes - Version progressive');

    // Tout bloquer au départ
    this.lockAll();

    // Message d'introduction
    /** await this.speak('Bravo pour avoir maîtrisé les boutons !');
     await this.speak('Maintenant, nous allons apprendre à former des nombres, colonne par colonne.');
     await this.speak('Un nombre est composé de quatre positions');
     await this.speak('les unités');
     this.sendToUnity('LockUnit:', 0);
     await this.speak('les dizaines');
     this.sendToUnity('LockTen:', 0);
     await this.speak('les centaines');
     this.sendToUnity('LockHundred:', 0);
     await this.speak('les millièmes');
     this.sendToUnity('LockThousand:', 0);
     this.updateGameState({
       message: 'Découvrons les positions ensemble !',
       showValidateButton: false
     });
 
 
     await this.speak('Nous allons commencer doucement avec les Unités, puis ajouter progressivement les autres colonnes.');
 
     this.updateGameState({
       message: 'Préparation de l\'exercice...',
       instruction: 'Nous allons apprendre progressivement. D\'abord les Unités, puis les Dizaines, ensuite les Centaines, et enfin les Millièmes.',
       showValidateButton: false
     });
 */
  // Reset validate handler registration state when entering the phase
  this.validateHandlerRegistered = false;

  // Écouter les changements de valeur
    this.onUnityEvent('SetValueUpdate', (data: { value?: string }) => {
      const valueStr = data.value || '0';
      this.currentValue = valueStr.padStart(4, '0');
    });

    // CorrectValue from Unity should automatically validate and advance to next column
    this.onUnityEvent('CorrectValue', () => {
      this.checkProgress(true);
    });

    // WrongValue may result in an error message or re-checking progress (no auto-advance)
    this.onUnityEvent('WrongValue', () => {
      this.checkProgress(false);
    });
    // Attendre 2 secondes puis commencer
    setTimeout(() => {
      this.startStage();
    }, 2000);
  }

  private async startStage(): Promise<void> {
    if (this.currentStage > 3) {
      // Tous les stages terminés
      await this.completePhase();
      return;
    }

    const stageNames = [
      'Unité seulement',
      'Unité et Dizaine',
      'Unité, Dizaine et Centaine',
      'Toutes les colonnes'
    ];

    console.log(`Démarrage du stage ${this.currentStage + 1}: ${stageNames[this.currentStage]}`);

    // Générer 3 nombres pour ce stage
    this.currentNumbers = this.generateNumbersForStage(this.currentStage);
    this.currentNumberIndex = 0;

    // Annoncer le stage
    //await this.speak(`Étape ${this.currentStage + 1}: ${stageNames[this.currentStage]}`);

    let instruction = '';
    switch (this.currentStage) {
      case 0:
        this.sendToUnity('LockUnit:', 0);
        //await this.speak('Commençons par apprendre les Unités. Tu vas former 3 nombres en utilisant seulement la colonne des Unités.');

        instruction = 'Apprentissage des Unités : Tu vas former 3 nombres en utilisant seulement la colonne des Unités.';
        break;
      case 1:
        this.sendToUnity('LockTen:', 0);
        //await this.speak('Maintenant, ajoutons les Dizaines ! Tu vas former 3 nombres avec les Unités et les Dizaines.');
        instruction = 'Apprentissage Unités + Dizaines : Tu vas former 3 nombres en utilisant les colonnes des Unités et Dizaines.';
        break;
      case 2:
        this.sendToUnity('LockHundred:', 0);
        //await this.speak('Parfait ! Ajoutons maintenant les Centaines. Tu vas former 3 nombres avec Unités, Dizaines et Centaines.');
        instruction = 'Apprentissage Unités + Dizaines + Centaines : Tu vas former 3 nombres en utilisant ces trois colonnes.';
        break;
      case 3:
        this.sendToUnity('LockThousand:', 0);
        //await this.speak('Dernière étape ! Nous allons maintenant utiliser toutes les colonnes, y compris les Millièmes.');
        instruction = 'Apprentissage complet : Tu vas former 3 nombres en utilisant toutes les colonnes !';
        break;
    }

    this.updateGameState({
      instruction: instruction,
      message: `Étape ${this.currentStage + 1}/4: ${stageNames[this.currentStage]}`
    });

    // Attendre un peu puis commencer le premier nombre
    setTimeout(() => {
      this.startNewNumber();
    }, 2000);
  }

  private generateNumbersForStage(stage: number): string[] {
    const numbers: string[] = [];

    for (let i = 0; i < 3; i++) {
      let num = '';
      switch (stage) {
        case 0: // Unité seulement (1-9)
          num = (Math.floor(Math.random() * 9) + 1).toString().padStart(4, '0');
          break;
        case 1: // Unité + Dizaine (10-99)
          num = (Math.floor(Math.random() * 90) + 10).toString().padStart(4, '0');
          break;
        case 2: // Unité + Dizaine + Centaine (100-999)
          num = (Math.floor(Math.random() * 900) + 100).toString().padStart(4, '0');
          break;
        case 3: // Tous (1000-9999)
          num = (Math.floor(Math.random() * 9000) + 1000).toString().padStart(4, '0');
          break;
      }
      numbers.push(num);
    }

    console.log(`Nombres générés pour stage ${stage}:`, numbers);
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
      // Tous les nombres de ce stage sont terminés
      await this.completeStage();
      return;
    }

    this.targetNumber = this.currentNumbers[this.currentNumberIndex];
    this.currentPosition = 0; // Recommencer à l'unité

    // Réinitialiser la machine
    this.sendToUnity('SetValue', '0000');
    this.currentValue = '0000';

    // Envoyer le nombre cible à Unity
  console.log('Sending ChangeList ->', this.targetNumber);
  this.sendToUnity('ChangeList', this.targetNumber);

    // Annoncer le nombre
    //await this.speak(`Nombre ${this.currentNumberIndex + 1} sur 3 : forme le nombre ${this.targetNumber}`);

    this.updateGameState({
      message: `Nombre ${this.currentNumberIndex + 1}/3 : ${this.targetNumber}`,
      targetNumber: this.targetNumber,
      instruction: `Nombre à former : ${this.targetNumber}. Commence par la colonne des Unités.`,
      showValidateButton: false
    });

    // Commencer par la première colonne
    setTimeout(() => {
      this.startColumn();
    }, 2000);
  }

  private async startColumn(): Promise<void> {
    // Déterminer combien de colonnes sont actives pour ce stage
    const maxPosition = this.currentStage; // stage 0 = 1 colonne, stage 1 = 2 colonnes, etc.

    if (this.currentPosition > maxPosition) {
      // Toutes les colonnes pour ce nombre sont remplies
      await this.completeNumber();
      return;
    }

  const positionName = this.positionNames[this.currentPosition];
  const targetDigit = this.targetNumber[3 - this.currentPosition];

  console.log(`Démarrage colonne: ${positionName}, chiffre cible: ${targetDigit}`);

    // Reset validation flag
    this.validationHandled = false;

  // For each column, lock everything then only unlock the columns allowed for this stage
  // (columns up to maxPosition = currentStage). This ensures at the 'dizaines' stage
  // both units and tens columns are unlocked.
    console.log('startColumn: currentPosition=', this.currentPosition, 'maxPosition=', maxPosition);
    this.lockAll();
    for (let i = 0; i <= maxPosition; i++) {
      this.sendToUnity(this.lockCommands[i], 0);
    }

    // Instruction vocale
    //await this.speak(`Remplis maintenant la colonne des ${positionName}.`);
    //await this.speak(`Pour le nombre ${this.targetNumber}, la colonne des ${positionName} doit afficher ${targetDigit}.`);
    //await this.speak(`Utilise les boutons pour mettre ${targetDigit} dans la colonne des ${positionName}.`);

    this.updateGameState({
      message: `Colonne: ${positionName} → ${targetDigit}`,
      currentDigit: positionName,
      instruction: `Remplis la colonne des ${positionName} avec le chiffre ${targetDigit}. Utilise les boutons ↑ et ↓ pour ajuster la valeur.`,
      showValidateButton: false
    });
  }

  private checkProgress(autoAdvance = false): void {
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
      this.handleColumnCorrect(autoAdvance);
    }
  }

  private async handlePreviousColumnError(columnIndex: number): Promise<void> {
    const columnName = this.positionNames[columnIndex];
    const targetDigit = this.targetNumber[3 - columnIndex];

    //await this.speak(`Attention ! Tu as modifié la colonne des ${columnName}.`);
    // await this.speak(`Elle doit rester à ${targetDigit}.`);

    this.updateGameState({
      instruction: `⚠️ Attention : Tu as modifié une colonne précédente (${columnName}). Elle doit rester à ${targetDigit}. Corrige-la avant de continuer.`
    });
  }

  private handleColumnCorrect(autoAdvance = false): void {
    // Prevent duplicate event handlers
    if (this.validationHandled) {
      return;
    }
    this.validationHandled = true;

    const positionName = this.positionNames[this.currentPosition];
    console.log(`handleColumnCorrect: validationHandled set for position ${this.currentPosition} (${positionName})`);
    const targetDigit = this.targetNumber[3 - this.currentPosition];

    console.log(`✓ Colonne ${positionName} correcte: ${targetDigit}`);

  // this.speakNonBlocking('Parfait !');

    this.updateGameState({
      message: `✓ ${positionName} : ${targetDigit} - Correct !`,
      instruction: `Excellent ! La colonne des ${positionName} est correcte.`,
      showValidateButton: !autoAdvance
    });

    // If autoAdvance is requested (Unity signaled correctness), move directly to next column
  if (autoAdvance) {
      // Slight delay for UX so user hears feedback
      setTimeout(() => {
        this.nextColumn();
      }, 800);
      return;
    }

    // Register a single validateClick handler for the whole phase that honors validationHandled
    if (!this.validateHandlerRegistered) {
      this.validateHandlerRegistered = true;
      this.onEvent('validateClick', () => {
        console.log('validateClick received in ColumnUnderstandingPhase. validationHandled=', this.validationHandled);
        // Only advance if the column is currently validated
        if (this.validationHandled) {
          this.nextColumn();
        }
      });
    }
  }

  private async nextColumn(): Promise<void> {
    this.updateGameState({
      showValidateButton: false
    });

    this.currentPosition++;

    const maxPosition = this.currentStage;

    if (this.currentPosition > maxPosition) {
      // Toutes les colonnes actives pour ce stage sont remplies
      await this.completeNumber();
    } else {
      // Passer à la colonne suivante
     // await this.speak('Très bien ! Passons à la colonne suivante.');
      setTimeout(() => {
        this.startColumn();
      }, 1000);
    }
  }

  private async completeNumber(): Promise<void> {
    //await this.speak('Excellent ! Tu as formé le nombre correctement !');

    this.updateGameState({
      message: `✓ Nombre ${this.currentNumberIndex + 1}/3 complété !`,
      instruction: `Bravo ! Tu as réussi à former le nombre ${this.targetNumber}.`,
      successCount: (this.currentStage * 3) + this.currentNumberIndex + 1
    });

    this.currentNumberIndex++;

    // Passer au nombre suivant
    // Before starting a new number, make sure all locks are cleared so Unity accepts a new list
    this.unlockAll();
    console.log('✅ Nombre complété, passage au suivant (currentNumberIndex):', this.currentNumberIndex);
    setTimeout(() => {
      this.startNewNumber();
    }, 2000);
  }

  private async completeStage(): Promise<void> {

    this.currentStage++;

    if (this.currentStage <= 3) {
      //await this.speak('Passons à l\'étape suivante !');
      setTimeout(() => {
        this.startStage();
      }, 3000);
    } else {
      // Tous les stages terminés
      await this.completePhase();
    }
  }

  private async completePhase(): Promise<void> {
    //await this.speak('Fantastique ! Tu as terminé tous les exercices !');
    //await this.speak('Tu sais maintenant former n\'importe quel nombre en remplissant les colonnes une par une !');
    //await this.speak('Tu es prêt pour la suite !');

    this.updateGameState({
      message: '🎉 Phase terminée avec succès !',
      instruction: 'Félicitations ! Tu maîtrises maintenant toutes les colonnes et peux former n\'importe quel nombre.',
      showValidateButton: false
    });

    setTimeout(() => {
      this.complete();
    }, 3000);
  }
}

