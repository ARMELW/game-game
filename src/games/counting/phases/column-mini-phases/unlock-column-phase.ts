import { PhaseBase } from "../../../core/phases/abstract-phase";
import { COLUMN_TRANSITION_DELAY } from './timing-constants';

/**
 * Mini-phase: Unlock a column for the stage
 */
export class UnlockColumnPhase extends PhaseBase {
  constructor(private lockCommand: string) {
    super(`unlock-${lockCommand}`, 'Unlock Column');
  }

  async execute(): Promise<void> {
    console.log(`🔓 Unlocking column for introduction: ${this.lockCommand}`);
    // Temporarily unlock the column for demonstration and then lock it again
    this.sendToUnity(this.lockCommand, 0);
    await new Promise(resolve => setTimeout(resolve, COLUMN_TRANSITION_DELAY));
    this.sendToUnity(this.lockCommand, 1);
    this.complete();
  }
}
