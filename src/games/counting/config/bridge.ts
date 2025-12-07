import { MESSAGE_REGISTRY } from "./message";
import { AbstractBridge } from "../../core/services/abstract-bridge";
import { createAppEventHub } from "./event";
const appEvent = createAppEventHub();
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
      console.log('Unity message received:', message);
      appEvent.sendToPhase(message);
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
  false
);