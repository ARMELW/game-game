import { PhaseBase } from "../../core/phases/abstract-phase";

/**
 * Phase d'introduction du quiz
 */
export class IntroPhase extends PhaseBase {

    constructor() {
        super('interactive', 'Phase Interactive');
        this.onUnityEvent('SetValue', (data) => {
            console.log('Unity Click:', data);
        });
    }
    execute(): void | Promise<void> {
        console.log('state manager', this.getState());
        this.sendToUnity('SetValue', 5)
        //this.speak('Bonjour, bienvenue dans ce jeu de comptage')

        // this.whenComplete();
        // this.complete();
    }

}