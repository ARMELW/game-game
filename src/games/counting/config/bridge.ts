import { MESSAGE_REGISTRY } from "./message";
import { AbstractBridge } from "../../core/services/abstract-bridge";

export class UnityBridge extends AbstractBridge {
  private sendMessageCallback: ((gameObjectName: string, methodName: string, parameter?: string | number) => void) | null = null;
  private checkReadyInterval: number | null = null;

  private static readonly SET_VALUE_PREFIX = 'SetValue';
  private static readonly SET_VALUE_PATTERN = /set value (\d+)/i;
  private static readonly VALID_BUTTON_PATTERN = /^on valid button clicked$/i;
  private static readonly CORRECT_VALUE_PATTERN = /^correct value$/i;
  private static readonly WRONG_VALUE_PATTERN = /^wrong value$/i;

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

      if (message.match(UnityBridge.VALID_BUTTON_PATTERN)) {
        console.log('Received ValidButtonClicked from Unity');
        this.receiveMessage({
          type: 'ValidButtonClicked',
          data: {},
          timestamp: Date.now()
        });
      } else if (message.match(UnityBridge.CORRECT_VALUE_PATTERN)) {
        this.receiveMessage({
          type: 'CorrectValue',
          data: {},
          timestamp: Date.now()
        });
      } else if (message.match(UnityBridge.WRONG_VALUE_PATTERN)) {
        this.receiveMessage({
          type: 'WrongValue',
          data: {},
          timestamp: Date.now()
        });
      } else if (message.startsWith(UnityBridge.SET_VALUE_PREFIX)) {
        const value = message.substring(UnityBridge.SET_VALUE_PREFIX.length);
        if (value.length > 0 && /^\d+$/.test(value)) {
          this.receiveMessage({
            type: 'SetValueUpdate',
            data: { value },
            timestamp: Date.now()
          });
        } else {
          console.warn('[Unity Bridge] Invalid SetValue format:', message);
        }
      } else {
        const match = message.match(UnityBridge.SET_VALUE_PATTERN);
        if (match) {
          const value = match[1];
          this.receiveMessage({
            type: 'SetValueUpdate',
            data: { value },
            timestamp: Date.now()
          });
        } else {
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