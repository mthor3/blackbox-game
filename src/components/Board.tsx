import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState, Port, Position, RayStep } from '../game/types';
import { posKey, portKey } from '../game/types';
import { PortButton } from './PortButton';
import { GridCell } from './GridCell';
import { RayOverlay } from './RayOverlay';

interface BoardProps {
  state: GameState;
  onPortClick: (port: Port) => void;
  onCellClick: (pos: Position) => void;
}

export function Board({ state, onPortClick, onCellClick }: BoardProps) {
  const { answerPortResults, guesses, guessResults, animating, animationPath, animationResultType, gameOver, mode, guessResultHighlight } = state;

  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(48);

  useEffect(() => {
    const update = () => {
      if (boardRef.current) {
        setCellSize((boardRef.current.getBoundingClientRect().width - 18) / 10);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (boardRef.current) ro.observe(boardRef.current);
    return () => ro.disconnect();
  }, []);

  // Snapshot of the active/lingering overlay — survives animating becoming false
  type OverlaySnapshot = {
    key: string;
    path: RayStep[];
    resultType: 'hit' | 'reflect' | 'exit' | null;
    cellSize: number;
  };
  const [overlay, setOverlay] = useState<OverlaySnapshot | null>(null);
  const latestRef = useRef({ animationPath, animationResultType, cellSize });
  latestRef.current = { animationPath, animationResultType, cellSize };

  useEffect(() => {
    if (animating && latestRef.current.animationPath.length > 0) {
      const { animationPath: path, animationResultType: resultType, cellSize: cs } = latestRef.current;
      setOverlay({
        key: `${path[0].position.row}-${path[0].position.col}-${path[0].direction}`,
        path,
        resultType,
        cellSize: cs,
      });
    }
  }, [animating]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOverlayComplete = useCallback(() => setOverlay(null), []);

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
          isAnimated={false}
          revealState={guessResults[pk] ?? null}
          clickable={!gameOver}
          gameOver={gameOver}
          onClick={onCellClick}
        />
      );
    }
  }

  return (
    <div style={{ position: 'relative', width: 'fit-content' }}>
      <div className="board" ref={boardRef}>{cells}</div>
      {overlay && (
        <RayOverlay
          key={overlay.key}
          path={overlay.path}
          resultType={overlay.resultType}
          cellSize={overlay.cellSize}
          onComplete={handleOverlayComplete}
        />
      )}
    </div>
  );
}
