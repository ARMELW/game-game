import { PhaseBase } from "../../core/phases/abstract-phase";
import { appEventHub } from "../config/event";
/**
 * Phase d'introduction du quiz
 */
export class IntroPhase extends PhaseBase {

    constructor() {
        super('interactive', 'Phase Interactive');
        window.onUnityMessage = (message: any) => {
            console.log('Unity message received:mec', message);

        };
    }
    execute(): void | Promise<void> {
        console.log('state manager', this.getState());
        this.sendToUnity('SetValue', 5)
        //this.speak('Bonjour, bienvenue dans ce jeu de comptage')

        // this.whenComplete();
        // this.complete();
    }

}