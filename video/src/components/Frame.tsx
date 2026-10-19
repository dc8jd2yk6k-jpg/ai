import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {TL, prog, useT} from '../lib';
import {C, F, ease} from '../theme';
import {Thread} from './Thread';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];

/** Persistent HUD: title, chapter index, timecode — showreel chrome. */
export const HUD: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cards = TL.scenes.filter((s) => s.card && !s.card.end);
  const firstCard = cards[0].start;
  const end = TL.scenes.find((s) => s.card?.end)!.start;
  let ch = 0;
  cards.forEach((c, i) => {
    if (t >= c.start) ch = i + 1;
  });
  const vis = prog(t, firstCard + 2.5, 1) * (1 - prog(t, end - 1, 0.8));
  const tc = (x: number) => {
    const m = Math.floor(x / 60);
    const s = Math.floor(x % 60);
    const f = Math.floor((x * fps) % fps);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  };
  const st: React.CSSProperties = {position: 'absolute', fontFamily: F.mono, fontSize: 14, letterSpacing: '0.2em', color: C.dim, textTransform: 'uppercase'};
  return (
    <AbsoluteFill style={{opacity: vis * 0.75, pointerEvents: 'none'}}>
      <div style={{...st, left: 64, top: 52}}>A Revolution That No Longer Needs Us</div>
      <div style={{...st, right: 64, top: 52}}>
        <span style={{color: C.red}}>{ROMAN[ch]}</span> / VI
      </div>
      <div style={{...st, left: 64, bottom: 48}}>16·10·2026</div>
      <div style={{...st, right: 64, bottom: 48, fontVariantNumeric: 'tabular-nums'}}>{tc(t)}</div>
      <div style={{position: 'absolute', left: 64, right: 64, bottom: 86, height: 1, background: C.line}}>
        <div style={{width: `${(t / TL.total) * 100}%`, height: 1, background: C.red, opacity: 0.8}} />
      </div>
    </AbsoluteFill>
  );
};

/** Chapter card: numeral, title, a thread drawing under it. */
export const ChapterCard: React.FC<{num: string; title: string; dur: number}> = ({num, title, dur}) => {
  const t = useT();
  const pIn = prog(t, 0, 0.9);
  const pLine = prog(t, 0.15, 1.6, ease.inOut);
  const pOut = prog(t, dur - 0.5, 0.5, ease.in);
  const letters = title.split('');
  return (
    <AbsoluteFill style={{background: C.bg, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', fontFamily: F.serif, fontWeight: 300, fontSize: 520, color: 'transparent', WebkitTextStroke: `1px ${C.faint}`, opacity: 0.6 * pIn * (1 - pOut), transform: `scale(${1.08 - 0.08 * pIn + t * 0.01})`}}>
        {num}
      </div>
      <div style={{textAlign: 'center', opacity: 1 - pOut, transform: `translateY(${pOut * -10}px)`, filter: `blur(${pOut * 6}px)`}}>
        <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.5em', color: C.red, opacity: pIn, marginBottom: 28}}>CHAPTER {num}</div>
        <div style={{fontFamily: F.serif, fontWeight: 300, fontSize: 84, color: C.ink, letterSpacing: '-0.015em'}}>
          {letters.map((l, i) => {
            const p = prog(t, 0.1 + i * 0.018, 0.6);
            return (
              <span key={i} style={{opacity: p, display: 'inline-block', whiteSpace: 'pre', transform: `translateY(${(1 - p) * 20}px)`, filter: `blur(${(1 - p) * 6}px)`}}>
                {l}
              </span>
            );
          })}
        </div>
        <svg width={1200} height={40} style={{marginTop: 26}}>
          <Thread d="M0,20 C300,14 900,26 1200,20" p={pLine} len={1300} width={2} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
