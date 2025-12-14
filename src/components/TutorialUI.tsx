import { useEffect, useMemo, useRef, useState } from 'react';
import { quizStateManager } from '../games/counting/config/state';
import { TypewriterText } from './TypewriterText';

interface GameState {
  message?: string;
  progress?: string;
  showValidateButton?: boolean;
  showQuitButton?: boolean;
  successCount?: number;
  targetNumber?: string;
  currentDigit?: string;
  instruction?: string; // New: for typewriter instructions
}

export function TutorialUI() {
  const [gameState, setGameState] = useState<GameState>({});
  const [typedInstruction, setTypedInstruction] = useState("");
  const [typedFeedback, setTypedFeedback] = useState("");
  const [isTypingInstruction, setIsTypingInstruction] = useState(false);
  const [isTypingFeedback, setIsTypingFeedback] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
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


  useEffect(() => {
    if (!gameState.instruction) return;

    setIsTypingInstruction(true);
    setTypedInstruction("");
    setTypedFeedback("");

    let currentIndex = 0;
    const instruction = gameState.instruction;
    const typeNextChar = () => {
      if (currentIndex <= instruction.length) {
        setTypedInstruction(instruction.slice(0, currentIndex));
        currentIndex++;
        typingTimeoutRef.current = setTimeout(typeNextChar, 18);
      } else {
        setIsTypingInstruction(false);
      }
    };

    typeNextChar();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [gameState.instruction]);

  const displayText = useMemo(
    () => typedInstruction,
    [typedInstruction]
  );

  const isTyping = isTypingInstruction;
  return (
    <div>
      <div className="flex-1 flex flex-col pt-12 px-4">
        <div className="mb-4">
          <div style={{
            backgroundColor: 'oklch(0.52 0.1401 247.65)'
          }} className="rounded-xl shadow-lg border border-slate-200 p-6 h-64 overflow-auto flex flex-col justify-between">
            <div className="text-[15px] leading-relaxed text-white">
              <p
                className="m-0"
                dangerouslySetInnerHTML={{
                  __html: displayText.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                  ),
                }}
              />
              {isTyping && (
                <span
                  className="inline-block w-2 h-[14px] bg-white rounded animate-blink ml-0.5 align-text-bottom"
                ></span>
              )}
            </div>
          </div>
        </div>
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
              Cliquez sur Valider
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
    </div>
  );
}
