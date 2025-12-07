import { MESSAGE_REGISTRY } from "./message";
import { AbstractBridge } from "../../core/services/abstract-bridge";
export class UnityBridge extends AbstractBridge {
  private sendMessageCallback: ((gameObjectName: string, methodName: string, parameter?: string | number) => void) | null = null;
  private checkReadyInterval: number | null = null;

  constructor(debug: boolean = false) {
    super(MESSAGE_REGISTRY, debug);
    this.setupReceiver();
  }

  public setSendMessage(sendMessage: (gameObjectName: string, methodName: string, parameter?: string | number) => void) {
    this.sendMessageCallback = sendMessage;
    this.setReady(true);
  }


  protected setupReceiver(): void {
    // Configurer window.onUnityMessage pour recevoir les messages de Unity
    (window as any).onUnityMessage = (message: string) => {
      console.log('[Unity Bridge] Raw message from Unity:', message);
      
      const SET_VALUE_PREFIX = 'SetValue';
      
      // Parser le message de Unity
      // Unity envoie soit "SetValueX" où X est la nouvelle valeur
      // soit "set value X" (avec espace et minuscules)
      if (message.startsWith(SET_VALUE_PREFIX)) {
        const value = message.substring(SET_VALUE_PREFIX.length);
        this.receiveMessage({
          type: 'SetValueUpdate',
          data: { value },
          timestamp: Date.now()
        });
      } else {
        // Essayer de matcher le pattern "set value X" avec regex
        const match = message.match(/set value (\d+)/i);
        if (match) {
          const value = match[1];
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