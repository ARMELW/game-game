import { PhaseBase } from "../../core/phases/abstract-phase";
import { StateManager } from "../../core/phases/state-manager";

/**
 * Phase d'introduction du quiz
 */
export class NextPhase extends PhaseBase {

    constructor() {
        super('next', 'Phase Next');
    }
    execute(): void | Promise<void> {
        const state = this.getState();

        // Exemple: écouter un événement de l'orchestrateur
        this.onEvent('PhaseChanged', (data) => {
            console.log('Phase changed:', data);
        });

        // Exemple: écouter un événement de Unity
        this.onUnityEvent('OnClick', (data) => {
            console.log('Unity Click:', data);
        });

        this.speak('Tu es un con!!');
        this.whenComplete();
        this.complete();
    }

}