import Event from "../../core/services/event";

export class AppEvent extends Event {

  sendToPhase(data: unknown) {
    this.emit("sendToPhase", data);
  }
}

type EventMethods = Omit<EventType, keyof Event>;

declare class EventType extends AppEvent {
  on<K extends keyof EventMethods>(event: K, listener: EventMethods[K]): void;
  off<K extends keyof EventMethods>(event: K, listener: EventMethods[K]): void;
}

export type AppEventTypes = Omit<EventType, keyof Omit<Event, "on" | "off">>;

// Singleton instance to ensure all parts of the app use the same event hub
export const appEventHub = new AppEvent() as AppEventTypes;

export const createAppEventHub = (): AppEventTypes => {
  return appEventHub;
};
