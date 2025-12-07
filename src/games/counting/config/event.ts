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
export const createAppEventHub = (): AppEventTypes => {
  return new AppEvent();
};
