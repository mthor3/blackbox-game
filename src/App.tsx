import { useReducer, useEffect, useCallback } from 'react';
import type { GameState, GameMode, Port, Position } from './game/types';
import { posKey } from './game/types';
import { createNewGame, fireRay, toggleGuess, submitGuess } from './game/gameState';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { ScoreDisplay } from './components/ScoreDisplay';
import './App.css';

type Action =
  | { type: 'NEW_GAME'; atomCount: 4 | 5 }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_ATOM_COUNT'; atomCount: 4 | 5 }
  | { type: 'FIRE_RAY'; port: Port }
  | { type: 'TOGGLE_GUESS'; pos: Position }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'ANIMATION_TICK' }
  | { type: 'ANIMATION_DONE' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return createNewGame(action.atomCount);

    case 'SET_MODE':
      if (state.animating || state.gameOver) return state;
      return { ...state, mode: action.mode, guessResultHighlight: null };

    case 'SET_ATOM_COUNT':
      return createNewGame(action.atomCount);

    case 'FIRE_RAY':
      return fireRay(state, action.port);

    case 'TOGGLE_GUESS':
      return toggleGuess(state, action.pos);

    case 'SUBMIT_GUESS':
      return submitGuess(state);

    case 'ANIMATION_TICK':
      if (!state.animating) return state;
      return { ...state, animationStep: state.animationStep + 1 };

    case 'ANIMATION_DONE': {
      const highlight =
        state.mode === 'guess' &&
        state.animationHighlightPks.length > 0 &&
        state.animationResultType !== null
          ? { pks: state.animationHighlightPks, resultType: state.animationResultType }
          : null;
      return {
        ...state,
        animating: false,
        animationStep: 0,
        animationPath: [],
        animationHighlightPks: [],
        animationResultType: null,
        guessResultHighlight: highlight,
      };
    }

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, null, () => createNewGame(4));

  // Animation timer
  useEffect(() => {
    if (!state.animating) return;

    const timer = setInterval(() => {
      if (state.animationStep >= state.animationPath.length - 1) {
        dispatch({ type: 'ANIMATION_DONE' });
      } else {
        dispatch({ type: 'ANIMATION_TICK' });
      }
    }, 150);

    return () => clearInterval(timer);
  }, [state.animating, state.animationStep, state.animationPath.length]);

  const handlePortClick = useCallback((port: Port) => {
    dispatch({ type: 'FIRE_RAY', port });
  }, []);

  const handleCellClick = useCallback((pos: Position) => {
    dispatch({ type: 'TOGGLE_GUESS', pos });
  }, []);

  const handleNewGame = useCallback(() => {
    dispatch({ type: 'NEW_GAME', atomCount: state.atomCount });
  }, [state.atomCount]);

  const handleSetAtomCount = useCallback((count: 4 | 5) => {
    dispatch({ type: 'SET_ATOM_COUNT', atomCount: count });
  }, []);

  const handleSetMode = useCallback((mode: GameMode) => {
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  const handleSubmitGuess = useCallback(() => {
    dispatch({ type: 'SUBMIT_GUESS' });
  }, []);

  const correctCount = state.gameOver
    ? state.guesses.filter(g => state.atoms.some(a => posKey(a) === g)).length
    : 0;

  return (
    <div className="app">
      <h1>BlackBox</h1>
      <Controls
        atomCount={state.atomCount}
        mode={state.mode}
        guessCount={state.guesses.length}
        gameOver={state.gameOver}
        animating={state.animating}
        rayCost={state.rayCost}
        onNewGame={handleNewGame}
        onSetAtomCount={handleSetAtomCount}
        onSetMode={handleSetMode}
        onSubmitGuess={handleSubmitGuess}
      />
      <Board
        state={state}
        onPortClick={handlePortClick}
        onCellClick={handleCellClick}
      />
      {state.gameOver && state.score !== null && (
        <ScoreDisplay
          score={state.score}
          rayCost={state.rayCost}
          atomCount={state.atomCount}
          correctCount={correctCount}
        />
      )}
    </div>
  );
}

export default App;
