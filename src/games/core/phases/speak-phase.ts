import { StateManager } from "./state-manager";
import { PhaseBase } from "./abstract-phase";

/**
 * SpeakPhase: fait parler le personnage
 */
export class SpeakPhase<TState = any> extends PhaseBase<TState> {
  constructor(
    id: string,
    private text: string | ((sm: StateManager<TState>) => string),
    title?: string
  ) {
    super(id, title);
  }

  async execute() {
    const text = typeof this.text === 'function' ? this.text(this.stateManager) : this.text;
    await this.speak(text);
    this.complete();
  }
}