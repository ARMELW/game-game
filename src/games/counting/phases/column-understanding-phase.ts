import { SequencePhase } from "../../core/phases/sequence-phase";
import { PhaseBase } from "../../core/phases/abstract-phase";
import {
  StageIntroPhase,
  StageCompletionPhase,
  NumberExercisePhase
} from "./column-mini-phases";

/**
 * Phase 2: Compréhension des colonnes (Version refactorisée avec mini-phases)
 * 
 * Cette phase a été décomposée en mini-phases pour faciliter la maintenance:
 * - StageIntroPhase: Introduction de chaque stage avec voix
 * - NumberExercisePhase: Exercice pour un nombre complet (orchestre les ColumnFillPhase)
 * - ColumnFillPhase: Remplissage d'une seule colonne avec instructions vocales
 * - StageCompletionPhase: Célébration de fin de stage avec voix
 * 
 * L'utilisateur apprend progressivement en ajoutant une colonne à la fois:
 * 1. Unité seulement (3 nombres)
 * 2. Unité + Dizaine (3 nombres)
 * 3. Unité + Dizaine + Centaine (3 nombres)
 * 4. Unité + Dizaine + Centaine + Millième (3 nombres)
 */
export class ColumnUnderstandingPhase extends SequencePhase {
  constructor() {
    super('column-understanding', buildColumnPhases(), 'Compréhension des colonnes');
  }
}

function generateNumbersForStage(stageIndex: number): string[] {
  const numbers: string[] = [];

  for (let i = 0; i < 3; i++) {
    let num = '';
    switch (stageIndex) {
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

  console.log(`Nombres générés pour stage ${stageIndex}:`, numbers);
  return numbers;
}

function buildColumnPhases(): PhaseBase[] {
  const phases: PhaseBase[] = [];

  // Introduction générale de la phase
  phases.push(new PhaseIntroductionPhase());

  // Pour chaque stage (4 stages au total)
  const stageConfigs = [
    {
      number: 1,
      name: 'Unité seulement',
      description: 'Commençons par apprendre les Unités. Tu vas former 3 nombres en utilisant seulement la colonne des Unités.',
      maxPosition: 0, // Only units column (index 0)
      lockCommand: 'LockUnit:'
    },
    {
      number: 2,
      name: 'Unité et Dizaine',
      description: 'Maintenant, ajoutons les Dizaines ! Tu vas former 3 nombres avec les Unités et les Dizaines.',
      maxPosition: 1, // Units and tens (index 0-1)
      lockCommand: 'LockTen:'
    },
    {
      number: 3,
      name: 'Unité, Dizaine et Centaine',
      description: 'Parfait ! Ajoutons maintenant les Centaines. Tu vas former 3 nombres avec Unités, Dizaines et Centaines.',
      maxPosition: 2, // Units, tens, hundreds (index 0-2)
      lockCommand: 'LockHundred:'
    },
    {
      number: 4,
      name: 'Toutes les colonnes',
      description: 'Dernière étape ! Nous allons maintenant utiliser toutes les colonnes, y compris les Millièmes.',
      maxPosition: 3, // All columns (index 0-3)
      lockCommand: 'LockThousand:'
    }
  ];

  stageConfigs.forEach((config, index) => {
    // Unlock the column for this stage
    phases.push(new UnlockColumnPhase(config.lockCommand));

    // Introduce the stage
    phases.push(new StageIntroPhase(
      config.number,
      config.name,
      config.description
    ));

    // Generate and execute 3 number exercises
    const numbers = generateNumbersForStage(index);
    for (let exerciseNum = 1; exerciseNum <= 3; exerciseNum++) {
      phases.push(new NumberExercisePhase(
        exerciseNum,
        numbers[exerciseNum - 1],
        config.maxPosition,
        config.number
      ));
    }

    // Complete the stage
    phases.push(new StageCompletionPhase(
      config.number,
      config.name,
      index === stageConfigs.length - 1 // isLastStage
    ));
  });

  // Final completion
  phases.push(new PhaseCompletionPhase());

  return phases;
}

/**
 * Mini-phase: Introduction générale de la phase
 */
class PhaseIntroductionPhase extends PhaseBase {
  constructor() {
    super('phase-intro', 'Introduction Phase 2');
  }

  async execute(): Promise<void> {
    console.log('📊 Phase 2: Compréhension des colonnes - Introduction');

    // Lock all columns initially
    this.sendToUnity('LockThousand:', 1);
    this.sendToUnity('LockHundred:', 1);
    this.sendToUnity('LockTen:', 1);
    this.sendToUnity('LockUnit:', 1);

    // Vocal introduction
    await this.speak('Bravo pour avoir maîtrisé les boutons !');
    await this.speak('Maintenant, nous allons apprendre à former des nombres, colonne par colonne.');
    await this.speak('Un nombre est composé de quatre positions');
    await this.speak('les unités');
    await this.speak('les dizaines');
    await this.speak('les centaines');
    await this.speak('les millièmes');
    await this.speak('Nous allons commencer doucement avec les Unités, puis ajouter progressivement les autres colonnes.');

    this.updateGameState({
      message: 'Découvrons les positions ensemble !',
      instruction: 'Nous allons apprendre progressivement. D\'abord les Unités, puis les Dizaines, ensuite les Centaines, et enfin les Millièmes.',
      showValidateButton: false
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    this.complete();
  }
}

/**
 * Mini-phase: Unlock a column for the stage
 */
class UnlockColumnPhase extends PhaseBase {
  constructor(private lockCommand: string) {
    super(`unlock-${lockCommand}`, 'Unlock Column');
  }

  async execute(): Promise<void> {
    console.log(`🔓 Unlocking column: ${this.lockCommand}`);
    this.sendToUnity(this.lockCommand, 0);
    this.complete();
  }
}

/**
 * Mini-phase: Complétion finale de toute la phase
 */
class PhaseCompletionPhase extends PhaseBase {
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

