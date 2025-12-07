import { MESSAGE_REGISTRY } from "./message";
import { AbstractBridge } from "../../core/services/abstract-bridge";

export class UnityBridge extends AbstractBridge {
  private sendMessageCallback: ((gameObjectName: string, methodName: string, parameter?: string | number | boolean) => void) | null = null;
  private checkReadyInterval: number | null = null;

  constructor(debug: boolean = false) {
    super(MESSAGE_REGISTRY, debug);
    this.setupReceiver();
  }

  public setSendMessage(sendMessage: (gameObjectName: string, methodName: string, parameter?: string | number | boolean) => void) {
    this.sendMessageCallback = sendMessage;
    this.setReady(true);
  }

  protected setupReceiver(): void {
    window.onUnityMessage = (message: any) => {
      console.log("[UnityBridge override] Message:", message);
      try {
        if (typeof message === 'string') {
          try {
            const parsed = JSON.parse(message);
            if (parsed && typeof parsed === 'object') {
              this.receiveMessage(parsed);
              return;
            }
          } catch (e) {
          }

          this.receiveMessage({
            type: 'UnityMessage',
            data: message as any,
            timestamp: Date.now()
          });

          // Specific parsers
          if (message.startsWith('set value ')) {
            const value = parseInt(message.replace('set value ', ''), 10);
            if (!isNaN(value)) {
              this.receiveMessage({
                type: 'SetValue',
                data: value as any,
                timestamp: Date.now()
              });
            }
          }
        } else {
          this.receiveMessage(message);
        }
      } catch (e) {
        console.error("[UnityBridge] Failed to process message:", e);
      }
    };
  }

  protected sendRaw(message: { type: string; data: any }): void {

    if (!this.sendMessageCallback) {
      console.warn('[Unity Bridge] SendMessage callback not set, message queued');
      return;
    }

    try {

      this.sendMessageCallback('WebBridge', 'ReceiveStringMessageFromJs', message.type + message.data);

    } catch (error) {
      console.error('[Unity Bridge] Error sending to Unity:', error);
    }
  }


  public isReady(): boolean {
    return this.ready;
  }

  destroy(): void {
    if (this.checkReadyInterval) {
      clearInterval(this.checkReadyInterval);
    }
    this.clearHandlers();
    this.clearQueue();
    delete (window as any).receiveUnityMessage;
  }
}

export const unityBridge = new UnityBridge(
  true
);