import { PhaseBase } from "../../core/phases/abstract-phase";
import { appEventHub } from "../config/event";
/**
 * Phase d'introduction du quiz
 */
export class IntroPhase extends PhaseBase {

    constructor() {
        super('interactive', 'Phase Interactive');
       appEventHub.on('sendToPhase', (message: any) => {
            console.log('Message reçu dans IntroPhase :', message);
            // Traitez le message ici
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