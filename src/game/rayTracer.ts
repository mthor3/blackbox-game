import type { Direction, Position, Port, RayStep, RayTrace } from './types';
import { posKey } from './types';

function advance(pos: Position, dir: Direction): Position {
  switch (dir) {
    case 'up': return { row: pos.row - 1, col: pos.col };
    case 'down': return { row: pos.row + 1, col: pos.col };
    case 'left': return { row: pos.row, col: pos.col - 1 };
    case 'right': return { row: pos.row, col: pos.col + 1 };
  }
}

function reverseDirection(dir: Direction): Direction {
  switch (dir) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
}

function isOutOfBounds(pos: Position): boolean {
  return pos.row < 0 || pos.row > 7 || pos.col < 0 || pos.col > 7;
}

function portToEntry(port: Port): { position: Position; direction: Direction } {
  switch (port.side) {
    case 'top': return { position: { row: 0, col: port.index }, direction: 'down' };
    case 'bottom': return { position: { row: 7, col: port.index }, direction: 'up' };
    case 'left': return { position: { row: port.index, col: 0 }, direction: 'right' };
    case 'right': return { position: { row: port.index, col: 7 }, direction: 'left' };
  }
}

function exitToPort(pos: Position, dir: Direction): Port {
  switch (dir) {
    case 'up': return { side: 'top', index: pos.col };
    case 'down': return { side: 'bottom', index: pos.col };
    case 'left': return { side: 'left', index: pos.row };
    case 'right': return { side: 'right', index: pos.row };
  }
}

// Returns the two positions perpendicular to the travel direction at a given cell,
// and the direction the ray would deflect to (away from each atom).
function getPerpendicularChecks(
  pos: Position,
  dir: Direction
): Array<{ checkPos: Position; deflectTo: Direction }> {
  const { row, col } = pos;
  switch (dir) {
    case 'up':
    case 'down':
      return [
        { checkPos: { row, col: col - 1 }, deflectTo: 'right' },
        { checkPos: { row, col: col + 1 }, deflectTo: 'left' },
      ];
    case 'left':
    case 'right':
      return [
        { checkPos: { row: row - 1, col }, deflectTo: 'down' },
        { checkPos: { row: row + 1, col }, deflectTo: 'up' },
      ];
  }
}

interface DeflectionResult {
  type: 'none' | 'single' | 'double';
  newDirection?: Direction;
}

function checkDeflection(
  nextPos: Position,
  currentDir: Direction,
  atomSet: Set<string>
): DeflectionResult {
  const checks = getPerpendicularChecks(nextPos, currentDir);
  const hits = checks.filter(c => atomSet.has(posKey(c.checkPos)));

  if (hits.length === 0) return { type: 'none' };
  if (hits.length === 2) return { type: 'double', newDirection: reverseDirection(currentDir) };
  return { type: 'single', newDirection: hits[0].deflectTo };
}

export function traceRay(atoms: Position[], startPort: Port): RayTrace {
  const atomSet = new Set(atoms.map(a => posKey(a)));
  const { position: startPos, direction: startDir } = portToEntry(startPort);
  const path: RayStep[] = [];

  // Check for immediate hit at entry position
  if (atomSet.has(posKey(startPos))) {
    return { result: { type: 'hit' }, path: [] };
  }

  // Check for edge reflection before entering the grid
  const edgeDeflection = checkDeflection(startPos, startDir, atomSet);
  if (edgeDeflection.type !== 'none') {
    return { result: { type: 'reflect', exitPort: startPort }, path: [] };
  }

  // Step through the grid
  let currentPos = { ...startPos };
  let currentDir = startDir;
  path.push({ position: { ...currentPos }, direction: currentDir });

  for (let step = 0; step < 200; step++) {
    const nextPos = advance(currentPos, currentDir);

    // Ray exits the grid
    if (isOutOfBounds(nextPos)) {
      const exit = exitToPort(currentPos, currentDir);
      if (exit.side === startPort.side && exit.index === startPort.index) {
        return { result: { type: 'reflect', exitPort: exit }, path };
      }
      return { result: { type: 'exit', exitPort: exit }, path };
    }

    // Ray hits an atom head-on
    if (atomSet.has(posKey(nextPos))) {
      return { result: { type: 'hit' }, path };
    }

    // Check deflections at the next position
    const deflection = checkDeflection(nextPos, currentDir, atomSet);

    if (deflection.type === 'double') {
      currentDir = deflection.newDirection!;
      path.push({ position: { ...currentPos }, direction: currentDir });
    } else if (deflection.type === 'single') {
      currentDir = deflection.newDirection!;
      path.push({ position: { ...currentPos }, direction: currentDir });
    } else {
      currentPos = nextPos;
      path.push({ position: { ...currentPos }, direction: currentDir });
    }
  }

  // Safety: should never reach here
  return { result: { type: 'hit' }, path };
}
