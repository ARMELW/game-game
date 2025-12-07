import { StateManager } from "../../core/phases/state-manager";
import { GameOrchestrator } from "../../core/phases/game-orchestrator";
import { PhaseBase } from "../../core/phases/abstract-phase";
import { DiscoveryPhase } from "./discovery-phase";
import { ColumnUnderstandingPhase } from "./column-understanding-phase";
import { FreePracticePhase } from "./free-practice-phase";

export interface TutorialGameState {
    message: string;
    progress: string;
    showValidateButton: boolean;
    showQuitButton: boolean;
    successCount: number;
    targetNumber: string;
    currentDigit: string;
    lastValue: number;
}

export class QuizGameOrchestrator extends GameOrchestrator<TutorialGameState> {
    constructor(state: StateManager) {
        super(state);
    }
    protected getDefaultGameState(): TutorialGameState {
        return {
            message: '',
            progress: '',
            showValidateButton: false,
            showQuitButton: false,
            successCount: 0,
            targetNumber: '',
            currentDigit: '',
            lastValue: 0
        };
    }
    protected setupPhases(): PhaseBase[] {
        return [
            new DiscoveryPhase(),
            new ColumnUnderstandingPhase(),
            new FreePracticePhase()
        ];
    }

    protected onComplete(): void {
        console.log('🎉 Tutoriel terminé avec succès!');
        console.log('État final du jeu:', this.getGameState());
    }

    protected onError(error: Error): void {
        console.error('❌ Erreur dans le tutoriel:', error);
    }
}
