import { useEffect, useRef } from 'react';
import { useUnityContext } from 'react-unity-webgl';
import { QuizGameOrchestrator } from '../games/counting/phases';
import { quizStateManager } from '../games/counting/config/state';

export function useUnity() {
  const orchestratorRef = useRef<QuizGameOrchestrator | null>(null);
  const isInitializedRef = useRef(false);

  const unityContext = useUnityContext({
    loaderUrl: './counting-machine/Build/counting-machine.loader.js',
    dataUrl: './counting-machine/Build/counting-machine.data.br',
    frameworkUrl: './counting-machine/Build/counting-machine.framework.js.br',
    codeUrl: './counting-machine/Build/counting-machine.wasm.br',
    streamingAssetsUrl: './counting-machine/StreamingAssets',
    companyName: 'Mena Mena Games',
    productName: 'Counting Machine',
    productVersion: '0.0.5',
  });

  const { unityProvider, sendMessage, addEventListener, removeEventListener, isLoaded, loadingProgression } = unityContext;

  useEffect(() => {
    if (loadingProgression === 1 && !isInitializedRef.current) {
      orchestratorRef.current = new QuizGameOrchestrator(quizStateManager);
      orchestratorRef.current.initialize();

      isInitializedRef.current = true;

      console.log('Orchestrateur initialisé');
    }
  }, [loadingProgression]);

  useEffect(() => {
    return () => {
      isInitializedRef.current = false;
    };
  }, []);

  const sendToUnity = (command: string) => {
    if (isLoaded) {
      try {
        sendMessage('WebBridge', 'ReceiveStringMessageFromJs', command);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const startGame = () => {
    if (orchestratorRef.current) {
      orchestratorRef.current.start();
    }
  };

  return {
    unityProvider,
    isLoaded,
    loadingProgression,
    sendToUnity,
    addEventListener,
    removeEventListener,
    orchestrator: orchestratorRef.current,
    startGame,
  };
}