import type { GameState, Position, Port } from './types';
import { posKey, portKey, parsePos } from './types';
import { traceRay } from './rayTracer';

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function createNewGame(atomCount: 4 | 5): GameState {
  const atoms: Position[] = [];
  const used = new Set<string>();

  while (atoms.length < atomCount) {
    const row = Math.floor(Math.random() * 8);
    const col = Math.floor(Math.random() * 8);
    const key = posKey({ row, col });
    if (!used.has(key)) {
      used.add(key);
      atoms.push({ row, col });
    }
  }

  return {
    atoms,
    atomCount,
    mode: 'answer',
    guesses: [],
    answerPortResults: {},
    answerNextLabel: 0,
    gameOver: false,
    score: null,
    revealedAtoms: null,
    guessResults: {},
    animating: false,
    animationPath: [],
    animationStep: 0,
    animationHighlightPks: [],
    animationResultType: null,
    guessResultHighlight: null,
    rayCost: 0,
  };
}

export function fireRay(state: GameState, port: Port): GameState {
  const pk = portKey(port);
  if (state.mode === 'answer') {
    if (state.gameOver) return state;
    // Don't re-fire already used ports in answer mode
    if (state.answerPortResults[pk]) return state;

    const trace = traceRay(state.atoms, port);
    const newResults = { ...state.answerPortResults };
    let nextLabel = state.answerNextLabel;
    let rayCost = state.rayCost;

    if (trace.result.type === 'hit') {
      newResults[pk] = { label: null, color: 'red' };
      rayCost += 1;
    } else if (trace.result.type === 'reflect') {
      newResults[pk] = { label: null, color: 'yellow' };
      rayCost += 1;
    } else if (trace.result.type === 'exit' && trace.result.exitPort) {
      const exitPk = portKey(trace.result.exitPort);
      const label = LABELS[nextLabel % LABELS.length];
      newResults[pk] = { label, color: 'labeled' };
      newResults[exitPk] = { label, color: 'labeled' };
      nextLabel++;
      rayCost += 2;
    }

    return {
      ...state,
      answerPortResults: newResults,
      answerNextLabel: nextLabel,
      rayCost,
    };
  } else {
    // Guess mode: animation only, no port state changes
    // After game over, trace against the real atoms so the player can learn
    const atoms = state.gameOver ? state.atoms : state.guesses.map(parsePos);
    const trace = traceRay(atoms, port);

    // Collect ports to highlight after animation: entry + exit (for detours)
    const highlightPks = [pk];
    if (trace.result.type === 'exit' && trace.result.exitPort) {
      highlightPks.push(portKey(trace.result.exitPort));
    }

    return {
      ...state,
      animating: true,
      animationPath: trace.path,
      animationStep: 0,
      animationHighlightPks: highlightPks,
      animationResultType: trace.result.type,
      guessResultHighlight: null, // clear previous highlight when new ray starts
    };
  }
}

export function toggleGuess(state: GameState, pos: Position): GameState {
  if (state.gameOver) return state;

  const key = posKey(pos);
  const guesses = [...state.guesses];
  const idx = guesses.indexOf(key);

  if (idx >= 0) {
    guesses.splice(idx, 1);
  } else if (guesses.length < state.atomCount) {
    guesses.push(key);
  }

  return {
    ...state,
    guesses,
  };
}

export function submitGuess(state: GameState): GameState {
  if (state.guesses.length !== state.atomCount) return state;

  const atomKeys = new Set(state.atoms.map(a => posKey(a)));
  const guessKeys = new Set(state.guesses);

  const guessResults: Record<string, 'correct' | 'wrong' | 'missed'> = {};

  for (const g of state.guesses) {
    guessResults[g] = atomKeys.has(g) ? 'correct' : 'wrong';
  }

  for (const a of state.atoms) {
    const ak = posKey(a);
    if (!guessKeys.has(ak)) {
      guessResults[ak] = 'missed';
    }
  }

  const wrongCount = state.guesses.filter(g => !atomKeys.has(g)).length;
  const score = state.rayCost + wrongCount * 5;

  return {
    ...state,
    mode: 'guess',
    gameOver: true,
    score,
    revealedAtoms: state.atoms,
    guessResults,
  };
}
