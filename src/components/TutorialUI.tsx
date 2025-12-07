import { useEffect, useState } from 'react';
import { quizStateManager } from '../games/counting/config/state';

interface GameState {
  message?: string;
  progress?: string;
  showValidateButton?: boolean;
  showQuitButton?: boolean;
  successCount?: number;
  targetNumber?: string;
  currentDigit?: string;
}

export function TutorialUI() {
  const [gameState, setGameState] = useState<GameState>({});

  useEffect(() => {
    // Écouter les changements de state
    const unsubscribe = quizStateManager.on('gameStateChanged', (data: { updates: Partial<GameState> }) => {
      console.log('Game state updated:', data.updates);
      setGameState(prev => ({ ...prev, ...data.updates }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleValidate = () => {
    console.log('Validate button clicked');
    quizStateManager.emit('validateClick', {});
  };

  const handleQuit = () => {
    console.log('Quit button clicked');
    quizStateManager.emit('quitClick', {});
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      {/* Message principal */}
      {gameState.message && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            marginBottom: '12px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            whiteSpace: 'pre-line',
            maxWidth: '600px',
          }}
        >
          {gameState.message}
        </div>
      )}

      {/* Progression */}
      {gameState.progress && (
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.95)',
            padding: '12px 20px',
            borderRadius: '8px',
            textAlign: 'center',
            fontFamily: 'monospace',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px',
          }}
        >
          {gameState.progress}
        </div>
      )}

      {/* Compteur de succès */}
      {gameState.successCount !== undefined && gameState.successCount > 0 && (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.95)',
            padding: '8px 16px',
            borderRadius: '8px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px',
          }}
        >
          ✓ Exercices réussis : {gameState.successCount}
        </div>
      )}

      {/* Boutons */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}
      >
        {gameState.showValidateButton && (
          <button
            onClick={handleValidate}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(to bottom right, #22c55e, #16a34a)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            }}
          >
            Valider
          </button>
        )}

        {gameState.showQuitButton && (
          <button
            onClick={handleQuit}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(to bottom right, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            }}
          >
            Quitter
          </button>
        )}
      </div>
    </div>
  );
}
