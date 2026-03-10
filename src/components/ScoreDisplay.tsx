interface ScoreDisplayProps {
  score: number;
  rayCost: number;
  atomCount: number;
  correctCount: number;
}

export function ScoreDisplay({ score, rayCost, atomCount, correctCount }: ScoreDisplayProps) {
  const wrongCount = atomCount - correctCount;

  return (
    <div className="score-display">
      <h2>Game Over</h2>
      <div className="score-breakdown">
        <div className="score-line">
          <span>Ray costs:</span>
          <span>{rayCost}</span>
        </div>
        <div className="score-line">
          <span>Wrong guesses ({wrongCount} × 5):</span>
          <span>{wrongCount * 5}</span>
        </div>
        <div className="score-line score-total">
          <span>Total score:</span>
          <span>{score}</span>
        </div>
        <div className="score-line">
          <span>Correct marbles:</span>
          <span>{correctCount} / {atomCount}</span>
        </div>
      </div>
      <p className="score-note">Lower score is better!</p>
    </div>
  );
}
