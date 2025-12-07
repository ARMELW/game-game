import { useEffect, useCallback, useState } from 'react';
import { Unity } from 'react-unity-webgl';
import { useUnity } from '../hooks/useUnity';

interface UnityGameProps {
  onUnityMessage?: (message: string) => void;
}

export function UnityGame({ onUnityMessage }: UnityGameProps) {
  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    addEventListener,
    removeEventListener,
    startGame,
  } = useUnity();

  const [hasStarted, setHasStarted] = useState(false);

  // Handle messages from Unity
  const handleUnityMessage = useCallback((message: string) => {
    console.log('[UnityBridge] Message from Unity:', message);

    // Call component-specific handler if provided
    if (onUnityMessage) {
      onUnityMessage(message);
    }
  }, [onUnityMessage]);

  useEffect(() => {
    addEventListener('UnityMessage', handleUnityMessage);
    return () => {
      removeEventListener('UnityMessage', handleUnityMessage);
    };
  }, [addEventListener, removeEventListener, handleUnityMessage]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#ffffff',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              marginBottom: '20px',
            }}
          >
            <img
              src="/counting-machine/assets/logo.webp"
              alt="Loading"
              style={{
                width: '100%',
                height: '100%',
                animation: 'flickerAnimation 1s infinite',
              }}
            />
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#000',
            }}
          >
            Loading... {Math.round(loadingProgression * 100)}%
          </div>
        </div>
      )}

      {isLoaded && !hasStarted && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.8)',
            zIndex: 10,
          }}
        >
          <button
            onClick={() => {
              startGame();
              setHasStarted(true);
            }}
            style={{
              fontSize: '20px',
              padding: '16px 40px',
              background: 'linear-gradient(to bottom right, #0ea5e9, #0369a1)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.2s',
            }}
          >
            Lancer le jeu
          </button>
        </div>
      )}

      <Unity
        unityProvider={unityProvider}
        style={{
          width: '100%',
          height: '100%',
          visibility: isLoaded ? 'visible' : 'hidden',
        }}
      />
      <style>{`
        @keyframes flickerAnimation {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
