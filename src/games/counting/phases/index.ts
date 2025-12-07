import { StateManager } from "../../core/phases/state-manager";
import { GameOrchestrator } from "../../core/phases/game-orchestrator";
import { PhaseBase } from "../../core/phases/abstract-phase";
import { IntroPhase } from "./intro-phase";
import { NextPhase } from "./next-phase";

export class QuizGameOrchestrator extends GameOrchestrator {
    constructor(state: StateManager) {
        super(state);
    }
    protected getDefaultGameState(): any {
        return {};
    }
    protected setupPhases(): PhaseBase[] {
        return [
            new IntroPhase(),
            new NextPhase()
        ];
    }

    protected onComplete(): void {
        console.log('🎉 Jeu simple terminé avec succès!');
        console.log('État final du jeu:', this.getGameState());
    }

    protected onError(error: any): void {
        console.error('❌ Erreur dans le jeu simple:', error);
    }
}
