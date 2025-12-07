import { MESSAGE_REGISTRY } from "./message";
import { AbstractBridge } from "../../core/services/abstract-bridge";
export class UnityBridge extends AbstractBridge {
  private sendMessageCallback: ((gameObjectName: string, methodName: string, parameter?: string | number | undefined | void) => void) | null = null;
  private checkReadyInterval: number | null = null;

  constructor(debug: boolean = false) {
    super(MESSAGE_REGISTRY, debug);
    this.setupReceiver();
  }

  public setSendMessage(sendMessage: (gameObjectName: string, methodName: string, parameter?: string | number | undefined | void) => void) {
    this.sendMessageCallback = sendMessage;
    this.setReady(true);
  }


  protected setupReceiver(): void {
    // Configurer window.onUnityMessage pour recevoir les messages de Unity
    (window as any).onUnityMessage = (message: string) => {
      console.log('[Unity Bridge] Raw message from Unity:', message);
      
      // Parser le message de Unity
      // Unity envoie "SetValueX" où X est la nouvelle valeur
      if (message.startsWith('SetValue')) {
        const value = message.substring(8); // Extraire la valeur après "SetValue"
        this.receiveMessage({
          type: 'SetValueUpdate',
          data: { value },
          timestamp: Date.now()
        });
      } else {
        // Autres messages
        this.receiveMessage({
          type: 'UnityRawMessage',
          data: { message },
          timestamp: Date.now()
        });
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
    delete (window as any).onUnityMessage;
  }
}

export const unityBridge = new UnityBridge(
  false
);