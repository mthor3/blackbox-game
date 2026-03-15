import { useEffect, useState } from 'react';
import type { RayStep, Direction } from '../game/types';

interface Props {
  path: RayStep[];
  resultType: 'hit' | 'reflect' | 'exit' | null;
  cellSize: number;
  onComplete: () => void;
}

type Point = { x: number; y: number };

function isReverseDir(d1: Direction, d2: Direction): boolean {
  return (
    (d1 === 'up' && d2 === 'down') || (d1 === 'down' && d2 === 'up') ||
    (d1 === 'left' && d2 === 'right') || (d1 === 'right' && d2 === 'left')
  );
}

// Edge the ray crosses INTO a cell (opposite side from travel direction — where it came from).
function entryEdge(row: number, col: number, direction: Direction, cs: number): Point {
  const g = cs + 2;
  switch (direction) {
    case 'down':  return { x: (col + 1) * g + cs / 2, y: (row + 1) * g };        // top edge
    case 'up':    return { x: (col + 1) * g + cs / 2, y: (row + 1) * g + cs };   // bottom edge
    case 'right': return { x: (col + 1) * g,           y: (row + 1) * g + cs / 2 }; // left edge
    case 'left':  return { x: (col + 1) * g + cs,      y: (row + 1) * g + cs / 2 }; // right edge
  }
}

// Edge the ray exits through (forward edge in travel direction).
function exitEdge(row: number, col: number, direction: Direction, cs: number): Point {
  const g = cs + 2;
  switch (direction) {
    case 'up':    return { x: (col + 1) * g + cs / 2, y: (row + 1) * g };        // top edge
    case 'down':  return { x: (col + 1) * g + cs / 2, y: (row + 1) * g + cs };   // bottom edge
    case 'left':  return { x: (col + 1) * g,           y: (row + 1) * g + cs / 2 }; // left edge
    case 'right': return { x: (col + 1) * g + cs,      y: (row + 1) * g + cs / 2 }; // right edge
  }
}

// Atom cell position (one step forward from the last path cell).
function atomCell(row: number, col: number, direction: Direction): { row: number; col: number } {
  switch (direction) {
    case 'up':    return { row: row - 1, col };
    case 'down':  return { row: row + 1, col };
    case 'left':  return { row, col: col - 1 };
    case 'right': return { row, col: col + 1 };
  }
}

// Point where the laser meets the near edge of the atom marble (one step forward).
// Marble radius ≈ cs/3 (diameter is cs * 0.667 per CSS).
function hitEndPoint(row: number, col: number, direction: Direction, cs: number): Point {
  const g = cs + 2;
  const r = cs / 3; // marble radius
  switch (direction) {
    case 'up':    return { x: (col + 1) * g + cs / 2,             y: row * g + cs / 2 + r };
    case 'down':  return { x: (col + 1) * g + cs / 2,             y: (row + 2) * g + cs / 2 - r };
    case 'left':  return { x: col * g + cs / 2 + r,                y: (row + 1) * g + cs / 2 };
    case 'right': return { x: (col + 2) * g + cs / 2 - r,          y: (row + 1) * g + cs / 2 };
  }
}

function buildPoints(path: RayStep[], resultType: string | null, cs: number): Point[] {
  if (path.length === 0) return [];

  const g = cs + 2;
  const first = path[0];
  const last = path[path.length - 1];
  const OFFSET = 5;

  const pts: Point[] = [];

  // Start at the edge of the first grid cell (where the ray crosses into the grid)
  pts.push(entryEdge(first.position.row, first.position.col, first.direction, cs));

  let odx = 0, ody = 0;
  let i = 0;

  while (i < path.length) {
    const step = path[i];
    const cx = (step.position.col + 1) * g + cs / 2;
    const cy = (step.position.row + 1) * g + cs / 2;

    const isAtTurn =
      i + 1 < path.length &&
      path[i + 1].position.row === step.position.row &&
      path[i + 1].position.col === step.position.col;

    if (isAtTurn) {
      const nextDir = path[i + 1].direction;
      pts.push({ x: cx + odx, y: cy + ody });
      if (isReverseDir(step.direction, nextDir)) {
        // 180° reflection: offset the return path so it runs parallel without overlapping
        if (step.direction === 'left' || step.direction === 'right') ody += OFFSET;
        else odx += OFFSET;
        pts.push({ x: cx + odx, y: cy + ody });
      }
      i += 2;
    } else {
      pts.push({ x: cx + odx, y: cy + ody });
      i++;
    }
  }

  if (resultType === 'exit' || resultType === 'reflect') {
    // Extend to the grid boundary (forward edge of the last cell)
    const ep = exitEdge(last.position.row, last.position.col, last.direction, cs);
    pts.push({ x: ep.x + odx, y: ep.y + ody });
  } else if (resultType === 'hit') {
    // Extend to the near edge of the atom marble
    const ep = hitEndPoint(last.position.row, last.position.col, last.direction, cs);
    pts.push({ x: ep.x + odx, y: ep.y + ody });
  }

  return pts;
}

function pathLength(pts: Point[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

const RESULT_COLORS: Record<string, { core: string; glow: string }> = {
  hit:     { core: '#e74c3c', glow: '#ff1a1a' },
  reflect: { core: '#f1c40f', glow: '#ffff00' },
  exit:    { core: '#00e600', glow: '#009900' },
};
const DEFAULT_COLORS = { core: '#ffe566', glow: '#ffaa00' };

export function RayOverlay({ path, resultType, cellSize: cs, onComplete }: Props) {
  const g = cs + 2;
  const svgSize = 10 * g - 2;

  const pts = buildPoints(path, resultType, cs);
  const totalLength = pathLength(pts);

  const [dashOffset, setDashOffset] = useState(totalLength);
  const [opacity, setOpacity] = useState(1);
  const [fading, setFading] = useState(false);
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [glowWidth, setGlowWidth] = useState(8);
  const [glowOpacity, setGlowOpacity] = useState(0.35);
  const [hitCellActive, setHitCellActive] = useState(false);

  useEffect(() => {
    let drawRafId: number;
    let glowRafId: number;
    let holdTimer: ReturnType<typeof setTimeout>;

    const startHold = () => {
      // Switch to result color (CSS transition handles the stroke color change)
      if (resultType && RESULT_COLORS[resultType]) {
        setColors(RESULT_COLORS[resultType]);
      }
      if (resultType === 'hit') setHitCellActive(true);
      // Animate glow buildup via RAF (8→16 width, 0.35→0.8 opacity, ease-in over hold+fade=2500ms)
      const buildStart = performance.now();
      const buildDuration = 2500;
      const animateGlow = (now: number) => {
        const t = Math.min((now - buildStart) / buildDuration, 1);
        const e = t * t; // ease-in
        setGlowWidth(8 + 8 * e);
        setGlowOpacity(0.35 + 0.45 * e);
        if (t < 1) glowRafId = requestAnimationFrame(animateGlow);
      };
      glowRafId = requestAnimationFrame(animateGlow);
      // After 1500ms hold, start the fade
      holdTimer = setTimeout(() => {
        setFading(true);
        setOpacity(0);
      }, 1500);
    };

    if (totalLength === 0) {
      startHold();
    } else {
      const duration = path.length * 150;
      const startTime = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        setDashOffset(totalLength * (1 - progress));
        if (progress < 1) {
          drawRafId = requestAnimationFrame(tick);
        } else {
          startHold();
        }
      };

      drawRafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(drawRafId);
      cancelAnimationFrame(glowRafId);
      clearTimeout(holdTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (pts.length < 2) return null;

  const pointsStr = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg
      onTransitionEnd={() => { if (fading) onComplete(); }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: svgSize,
        height: svgSize,
        pointerEvents: 'none',
        overflow: 'visible',
        opacity,
        transition: fading ? 'opacity 1000ms ease-out' : undefined,
      }}
    >
      <defs>
        <filter id="laser-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Hit cell background */}
      {hitCellActive && resultType === 'hit' && (() => {
        const last = path[path.length - 1];
        const cell = atomCell(last.position.row, last.position.col, last.direction);
        return (
          <rect
            x={(cell.col + 1) * g}
            y={(cell.row + 1) * g}
            width={cs}
            height={cs}
            fill={colors.core}
            filter="url(#laser-glow)"
            style={{ opacity: glowOpacity }}
          />
        );
      })()}
      {/* Outer glow */}
      <polyline
        points={pointsStr}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength}
        strokeDashoffset={dashOffset}
        filter="url(#laser-glow)"
        style={{
          stroke: colors.glow,
          strokeWidth: glowWidth,
          opacity: glowOpacity,
          transition: 'stroke 300ms ease-out',
        }}
      />
      {/* Core beam */}
      <polyline
        points={pointsStr}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength}
        strokeDashoffset={dashOffset}
        style={{ stroke: colors.core, transition: 'stroke 300ms ease-out' }}
      />
    </svg>
  );
}
