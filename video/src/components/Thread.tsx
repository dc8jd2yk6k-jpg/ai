import React from 'react';
import {C} from '../theme';

/** A red thread: core stroke + loose fibres + soft glow, drawn by `p` (0..1). */
export const Thread: React.FC<{
  d: string;
  p?: number;
  color?: string;
  width?: number;
  glow?: number;
  len?: number;
  opacity?: number;
}> = ({d, p = 1, color = C.red, width = 3, glow = 0.6, len = 4000, opacity = 1}) => {
  const off = len * (1 - p);
  const common = {d, fill: 'none', strokeLinecap: 'round' as const, strokeDasharray: len, strokeDashoffset: off};
  return (
    <g opacity={opacity}>
      {glow > 0 && <path {...common} stroke={color} strokeWidth={width * 6} opacity={0.12 * glow} style={{filter: 'blur(6px)'}} />}
      <path {...common} stroke={color} strokeWidth={width} />
      <path {...common} stroke="#ff6b6b" strokeWidth={width * 0.3} opacity={0.5} transform="translate(0,-0.8)" />
      <path {...common} stroke={color} strokeWidth={0.7} opacity={0.6} transform="translate(0.8,1.6)" />
    </g>
  );
};

/** Wavy horizontal path helper. */
export const wave = (x0: number, x1: number, y: number, amp: number, freq: number, phase = 0, steps = 120) => {
  let s = '';
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    const yy = y + Math.sin(i / steps * Math.PI * 2 * freq + phase) * amp + Math.sin(i * 0.37 + phase * 2) * amp * 0.15;
    s += `${i ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)}`;
  }
  return s;
};
