import { SequencePhase } from "../../core/phases/sequence-phase";
import { PhaseBase } from "../../core/phases/abstract-phase";
import {
  StageIntroPhase,
  StageCompletionPhase,
  NumberExercisePhase,
  PhaseIntroductionPhase,
  UnlockColumnPhase,
  PhaseCompletionPhase
} from "./column-mini-phases";

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
  // Unlock the columns allowed for this stage (units..maxPosition)
  phases.push(new UnlockColumnPhase(config.maxPosition));

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

  phases.push(new PhaseCompletionPhase());

  return phases;
}
