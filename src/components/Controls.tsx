import type { GameMode } from '../game/types';

interface ControlsProps {
  atomCount: 4 | 5;
  mode: GameMode;
  guessCount: number;
  gameOver: boolean;
  animating: boolean;
  rayCost: number;
  onNewGame: () => void;
  onSetAtomCount: (count: 4 | 5) => void;
  onSetMode: (mode: GameMode) => void;
  onSubmitGuess: () => void;
}

export function Controls({
  atomCount,
  mode,
  guessCount,
  gameOver,
  animating,
  rayCost,
  onNewGame,
  onSetAtomCount,
  onSetMode,
  onSubmitGuess,
}: ControlsProps) {
  const canSubmit = guessCount === atomCount && !gameOver && !animating;

  return (
    <div className="controls">
      <div className="controls-row">
        <button className="control-btn new-game-btn" onClick={onNewGame}>
          New Game
        </button>

        <div className="atom-count-selector">
          <span className="control-label">Marbles:</span>
          <button
            className={`control-btn ${atomCount === 4 ? 'active' : ''}`}
            onClick={() => onSetAtomCount(4)}
            disabled={!gameOver && guessCount > 0}
          >
            4
          </button>
          <button
            className={`control-btn ${atomCount === 5 ? 'active' : ''}`}
            onClick={() => onSetAtomCount(5)}
            disabled={!gameOver && guessCount > 0}
          >
            5
          </button>
        </div>
      </div>

      <div className="controls-row">
        <span className="control-label">Ray Cost: <strong>{rayCost}</strong></span>
      </div>

      <div className="controls-row">
        <div className="mode-toggle">
          <span className="control-label">Mode:</span>
          <button
            className={`control-btn ${mode === 'answer' ? 'active' : ''}`}
            onClick={() => onSetMode('answer')}
            disabled={animating}
          >
            {mode === 'answer' ? 'Playing...' : 'Play'}
          </button>
          <button
            className={`control-btn ${mode === 'guess' ? 'active' : ''}`}
            onClick={() => onSetMode('guess')}
            disabled={animating}
          >
            {mode === 'guess' ? 'Testing...' : 'Test'}
          </button>
        </div>

        <button
          className="control-btn submit-btn"
          onClick={onSubmitGuess}
          disabled={!canSubmit}
        >
          Submit ({guessCount}/{atomCount})
        </button>
      </div>
    </div>
  );
}
