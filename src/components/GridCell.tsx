import type { Position, RevealState } from '../game/types';
import { posKey } from '../game/types';

interface GridCellProps {
  position: Position;
  isGuess: boolean;
  isAnimated: boolean;
  revealState: RevealState;
  clickable: boolean;
  gameOver: boolean;
  onClick: (pos: Position) => void;
}

export function GridCell({
  position,
  isGuess,
  isAnimated,
  revealState,
  clickable,
  gameOver,
  onClick,
}: GridCellProps) {
  const classNames = ['grid-cell'];

  if (isAnimated) classNames.push('cell-animated');
  if (revealState === 'correct') classNames.push('cell-correct');
  if (revealState === 'wrong') classNames.push('cell-wrong');
  if (revealState === 'missed') classNames.push('cell-missed');
  if (clickable && !gameOver) classNames.push('cell-clickable');

  return (
    <div
      className={classNames.join(' ')}
      onClick={() => {
        if (clickable && !gameOver) onClick(position);
      }}
      data-pos={posKey(position)}
    >
      {(isGuess || revealState === 'missed') && (
        <div className="marble" />
      )}
    </div>
  );
}
