import React from 'react';
import {interpolate} from 'remotion';
import {Word, prog, useT, cues} from '../lib';
import {C, F, ease} from '../theme';

export const spread = (text: string, t0: number, t1: number): Word[] => {
  const ws = text.split(' ');
  return ws.map((w, i) => ({w, t: t0 + ((t1 - t0) * i) / Math.max(1, ws.length)}));
};

/** Words of a narrated line in scene-local time. */
export const lineWords = (scene: string, lid: string): Word[] => {
  const c = cues(scene);
  const s = c.scene.start;
  return c.line(lid).words.map((w) => ({w: w.w, t: w.t - s}));
};

type KProps = {
  words: Word[];
  out?: number; // local time to dissolve out
  size?: number;
  font?: string;
  color?: string;
  weight?: number;
  italic?: boolean;
  emph?: Record<string, React.CSSProperties>; // word(lowercase, no punct) -> style
  style?: React.CSSProperties;
  lead?: number; // anticipate VO slightly
  align?: 'left' | 'center' | 'right';
  tracking?: number;
  upper?: boolean;
  rise?: number;
};

const key = (w: string) => w.replace(/[^\w']/g, '').toLowerCase();

/** Word-by-word reveal: blur → sharp, slight rise. */
export const Kinetic: React.FC<KProps> = ({
  words,
  out,
  size = 64,
  font = F.serif,
  color = C.ink,
  weight = 300,
  italic,
  emph = {},
  style,
  lead = 0.06,
  align = 'center',
  tracking = -0.01,
  upper,
  rise = 14,
}) => {
  const t = useT();
  const o = out === undefined ? 1 : 1 - prog(t, out, 0.5, ease.inOut);
  const ob = out === undefined ? 0 : prog(t, out, 0.5, ease.in) * 10;
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        fontStyle: italic ? 'italic' : 'normal',
        color,
        textAlign: align,
        lineHeight: 1.18,
        letterSpacing: `${tracking}em`,
        textTransform: upper ? 'uppercase' : 'none',
        opacity: o,
        filter: ob > 0.01 ? `blur(${ob}px)` : undefined,
        fontVariationSettings: '"SOFT" 50, "WONK" 0',
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = prog(t, w.t - lead, 0.42, ease.out);
        const st = emph[key(w.w)] ?? {};
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${(1 - p) * rise}px)`,
              filter: p < 0.99 ? `blur(${(1 - p) * 8}px)` : undefined,
              marginRight: '0.25em',
              ...st,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/** Small uppercase mono label with fade-in. */
export const Label: React.FC<{
  children: React.ReactNode;
  at?: number;
  out?: number;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({children, at = 0, out, color = C.dim, size = 18, style}) => {
  const t = useT();
  const p = prog(t, at, 0.5);
  const o = out === undefined ? 1 : 1 - prog(t, out, 0.4);
  return (
    <div
      style={{
        fontFamily: F.mono,
        fontSize: size,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color,
        opacity: p * o,
        transform: `translateY(${(1 - p) * 6}px)`,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Animated number counter. */
export const Counter: React.FC<{
  from: number;
  to: number;
  at: number;
  dur: number;
  size?: number;
  color?: string;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
  font?: string;
}> = ({from, to, at, dur, size = 120, color = C.ink, prefix = '', suffix = '', style, font = F.mono}) => {
  const t = useT();
  const p = prog(t, at, dur, ease.inOut);
  const v = interpolate(p, [0, 1], [from, to]);
  return (
    <div style={{fontFamily: font, fontSize: size, color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', ...style}}>
      {prefix}
      {Math.round(v).toLocaleString('en-US')}
      {suffix}
    </div>
  );
};
