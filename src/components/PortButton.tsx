import type { CSSProperties } from 'react';
import type { Port, PortDisplayState } from '../game/types';
import { portKey } from '../game/types';

// 26 distinct colors for A–Z (not red, yellow, white, black, gray, or orange)
const LABEL_COLORS: string[] = [
  '#1565C0', // A - dark blue
  '#7B1FA2', // B - purple
  '#00838F', // C - teal
  '#2E7D32', // D - forest green
  '#C2185B', // E - hot pink
  '#283593', // F - indigo
  '#558B2F', // G - olive green
  '#4527A0', // H - deep indigo
  '#00695C', // I - dark teal-green
  '#0277BD', // J - cerulean
  '#6A1B9A', // K - deep purple
  '#1B5E20', // L - dark green
  '#880E4F', // M - dark magenta
  '#006064', // N - dark cyan
  '#AD1457', // O - deep pink
  '#01579B', // P - navy
  '#4A148C', // Q - darkest purple
  '#33691E', // R - dark lime
  '#0D47A1', // S - midnight blue
  '#004D40', // T - dark teal
  '#311B92', // U - deep violet
  '#1A237E', // V - dark navy
  '#546E7A', // W - blue-grey
  '#4E342E', // X - dark brown
  '#37474F', // Y - slate
  '#5D4037', // Z - warm brown
];

interface PortButtonProps {
  port: Port;
  state?: PortDisplayState;
  highlight?: 'hit' | 'reflect' | 'exit' | null;
  disabled: boolean;
  onClick: (port: Port) => void;
}

export function PortButton({ port, state, highlight, disabled, onClick }: PortButtonProps) {
  const color = state?.color ?? 'default';
  const label = state?.label ?? '';

  const classNames = ['port-button', `port-${color}`];
  if (disabled) classNames.push('port-disabled');
  if (highlight === 'hit') classNames.push('port-pulse-hit');
  if (highlight === 'reflect') classNames.push('port-pulse-reflect');
  if (highlight === 'exit') classNames.push('port-pulse-exit');

  // Per-letter color applied via inline style
  const style: CSSProperties = {};
  if (color === 'labeled' && label) {
    const idx = label.charCodeAt(0) - 65;
    const bg = LABEL_COLORS[idx] ?? '#3498db';
    style.background = bg;
    style.borderColor = bg;
    style.color = 'white';
  }

  return (
    <button
      className={classNames.join(' ')}
      style={style}
      onClick={() => onClick(port)}
      disabled={disabled}
      data-port={portKey(port)}
      title={portKey(port)}
    >
      {label}
    </button>
  );
}
