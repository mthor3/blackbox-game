import type { GameState, Port, Position } from '../game/types';
import { posKey, portKey } from '../game/types';
import { PortButton } from './PortButton';
import { GridCell } from './GridCell';

interface BoardProps {
  state: GameState;
  onPortClick: (port: Port) => void;
  onCellClick: (pos: Position) => void;
}

export function Board({ state, onPortClick, onCellClick }: BoardProps) {
  const { answerPortResults, guesses, guessResults, animating, animationPath, animationStep, gameOver, mode, guessResultHighlight } = state;

  // Compute which cells are currently animated
  const animatedCells = new Set<string>();
  if (animating && animationPath.length > 0) {
    for (let i = 0; i <= Math.min(animationStep, animationPath.length - 1); i++) {
      animatedCells.add(posKey(animationPath[i].position));
    }
  }

  const guessSet = new Set(guesses);

  const portDisabled = animating || (gameOver && mode === 'answer');

  // Build the 10x10 grid
  const cells: React.ReactNode[] = [];

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const key = `${row}-${col}`;

      // Corners
      if ((row === 0 || row === 9) && (col === 0 || col === 9)) {
        cells.push(<div key={key} className="corner-cell" />);
        continue;
      }

      // Top port buttons
      if (row === 0 && col >= 1 && col <= 8) {
        const port: Port = { side: 'top', index: col - 1 };
        const pk = portKey(port);
        cells.push(
          <PortButton
            key={key}
            port={port}
            state={answerPortResults[pk]}
            highlight={guessResultHighlight?.pks.includes(pk) ? guessResultHighlight.resultType : null}
            disabled={portDisabled || (mode === 'answer' && !!answerPortResults[pk])}
            onClick={onPortClick}
          />
        );
        continue;
      }

      // Bottom port buttons
      if (row === 9 && col >= 1 && col <= 8) {
        const port: Port = { side: 'bottom', index: col - 1 };
        const pk = portKey(port);
        cells.push(
          <PortButton
            key={key}
            port={port}
            state={answerPortResults[pk]}
            highlight={guessResultHighlight?.pks.includes(pk) ? guessResultHighlight.resultType : null}
            disabled={portDisabled || (mode === 'answer' && !!answerPortResults[pk])}
            onClick={onPortClick}
          />
        );
        continue;
      }

      // Left port buttons
      if (col === 0 && row >= 1 && row <= 8) {
        const port: Port = { side: 'left', index: row - 1 };
        const pk = portKey(port);
        cells.push(
          <PortButton
            key={key}
            port={port}
            state={answerPortResults[pk]}
            highlight={guessResultHighlight?.pks.includes(pk) ? guessResultHighlight.resultType : null}
            disabled={portDisabled || (mode === 'answer' && !!answerPortResults[pk])}
            onClick={onPortClick}
          />
        );
        continue;
      }

      // Right port buttons
      if (col === 9 && row >= 1 && row <= 8) {
        const port: Port = { side: 'right', index: row - 1 };
        const pk = portKey(port);
        cells.push(
          <PortButton
            key={key}
            port={port}
            state={answerPortResults[pk]}
            highlight={guessResultHighlight?.pks.includes(pk) ? guessResultHighlight.resultType : null}
            disabled={portDisabled || (mode === 'answer' && !!answerPortResults[pk])}
            onClick={onPortClick}
          />
        );
        continue;
      }

      // Grid cells (row 1-8, col 1-8 => grid row 0-7, col 0-7)
      const gridRow = row - 1;
      const gridCol = col - 1;
      const pos: Position = { row: gridRow, col: gridCol };
      const pk = posKey(pos);

      cells.push(
        <GridCell
          key={key}
          position={pos}
          isGuess={guessSet.has(pk)}
          isAnimated={animatedCells.has(pk)}
          revealState={guessResults[pk] ?? null}
          clickable={!gameOver}
          gameOver={gameOver}
          onClick={onCellClick}
        />
      );
    }
  }

  return <div className="board">{cells}</div>;
}
