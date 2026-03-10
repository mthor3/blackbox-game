export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  row: number;
  col: number;
}

export type Side = 'top' | 'bottom' | 'left' | 'right';

export interface Port {
  side: Side;
  index: number; // 0-7
}

export interface RayStep {
  position: Position;
  direction: Direction;
}

export type RayResultType = 'hit' | 'reflect' | 'exit';

export interface RayResult {
  type: RayResultType;
  exitPort?: Port;
}

export interface RayTrace {
  result: RayResult;
  path: RayStep[];
}

export interface PortDisplayState {
  label: string | null;
  color: 'default' | 'red' | 'yellow' | 'labeled';
}

export type GameMode = 'answer' | 'guess';

export type RevealState = 'correct' | 'wrong' | 'missed' | null;

export interface GameState {
  atoms: Position[];
  atomCount: 4 | 5;
  mode: GameMode;
  guesses: string[]; // posKey strings
  answerPortResults: Record<string, PortDisplayState>;
  answerNextLabel: number;
  gameOver: boolean;
  score: number | null;
  revealedAtoms: Position[] | null;
  guessResults: Record<string, RevealState>;
  animating: boolean;
  animationPath: RayStep[];
  animationStep: number;
  animationHighlightPks: string[];
  animationResultType: 'hit' | 'reflect' | 'exit' | null;
  guessResultHighlight: { pks: string[]; resultType: 'hit' | 'reflect' | 'exit' } | null;
  rayCost: number;
}

export function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

export function portKey(port: Port): string {
  return `${port.side}-${port.index}`;
}

export function portEquals(a: Port, b: Port): boolean {
  return a.side === b.side && a.index === b.index;
}

export function parsePos(key: string): Position {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}
