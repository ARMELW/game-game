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

interface StageConfig {
  number: number;
  name: string;
  description: string;
  maxPosition: number;
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

  phases.push(new PhaseIntroductionPhase());

  const stageConfigs: StageConfig[] = [
    { number: 1, name: 'Unité seulement', description: 'Commençons par apprendre les Unités...', maxPosition: 0 },
    { number: 2, name: 'Unité et Dizaine', description: 'Ajoutons les Dizaines...', maxPosition: 1 },
    { number: 3, name: 'Unité, Dizaine et Centaine', description: 'Ajoutons maintenant les Centaines...', maxPosition: 2 },
    { number: 4, name: 'Toutes les colonnes', description: 'Utilisons maintenant toutes les colonnes...', maxPosition: 3 }
  ];

  stageConfigs.forEach((stage, index) => {
    phases.push(...buildStagePhases(stage, index === stageConfigs.length - 1));
  });

  phases.push(new PhaseCompletionPhase());

  return phases;
}

function buildStagePhases(stage: StageConfig, isLastStage: boolean): PhaseBase[] {
  const stagePhases: PhaseBase[] = [];

  // 1. Débloquer la colonne
  stagePhases.push(new UnlockColumnPhase(stage.maxPosition));

  // 2. Introduction du stage
  stagePhases.push(new StageIntroPhase(stage.number, stage.name, stage.description));

  // 3. Exercices (2 pour les unités et millièmes, 3 pour les autres)
  const exerciseCount = (stage.number === 1 || stage.number === 4) ? 2 : 3;
  const numbers = generateNumbersForStage(stage.number - 1);
  numbers.slice(0, exerciseCount).forEach((value, i) => {
    stagePhases.push(
      new NumberExercisePhase(i + 1, value, stage.maxPosition, stage.number, exerciseCount)
    );
  });

  // 4. Fin du stage
  stagePhases.push(new StageCompletionPhase(stage.number, stage.name, isLastStage));

  return stagePhases;
}
