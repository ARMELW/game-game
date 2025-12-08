import { PhaseBase } from "../../../core/phases/abstract-phase";

/**
 * Mini-phase: Unlock a column for the stage
 */
export class UnlockColumnPhase extends PhaseBase {
  private readonly lockCommands = ['LockUnit:', 'LockTen:', 'LockHundred:', 'LockThousand:'];

  constructor(private maxPosition: number) {
    super(`unlock-stage-${maxPosition}`, 'Unlock Stage Columns');
  }

  async execute(): Promise<void> {
    console.log(`🔓 Unlocking columns up to position: ${this.maxPosition}`);

    // Unlock the columns up to maxPosition and lock the rest
    for (let i = 0; i < this.lockCommands.length; i++) {
      const cmd = this.lockCommands[i];
      const lockValue = i <= this.maxPosition ? 0 : 1; // 0 = unlock, 1 = lock
      this.sendToUnity(cmd, lockValue);
    }

    this.complete();
  }
}
