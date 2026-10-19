import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Counter, Kinetic, Label, lineWords, spread} from '../components/Type';
import {Thread, wave} from '../components/Thread';
import {clamp, cues, lerp, prog, rng, useT} from '../lib';
import {C, F, H, W, ease} from '../theme';

const redI = {color: C.red, fontStyle: 'italic'};

const Ship: React.FC<{x: number; y: number; s: number; t: number; cargo: string; o?: number}> = ({x, y, s, t, cargo, o = 1}) => {
  const bob = Math.sin(t * 1.6 + x * 0.01) * 3;
  const roll = Math.sin(t * 1.1 + x * 0.02) * 1.5;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${s}) rotate(${roll})`} opacity={o}>
      <path d="M-120,0 L120,0 L95,34 L-100,34 Z" fill={C.ink} />
      <line x1={-40} x2={-40} y1={0} y2={-150} stroke={C.ink} strokeWidth={4} />
      <line x1={40} x2={40} y1={0} y2={-180} stroke={C.ink} strokeWidth={4} />
      <path d="M-40,-140 Q-2,-90 -40,-20 Z" fill={C.ink} opacity={0.85} />
      <path d="M40,-170 Q86,-110 40,-20 Z" fill={C.ink} opacity={0.85} />
      <path d="M-40,-140 Q-80,-90 -40,-30 Z" fill={C.ink} opacity={0.55} />
      <line x1={40} x2={40} y1={-180} y2={-205} stroke={C.red} strokeWidth={3} />
      <path d="M40,-205 L70,-198 L40,-191 Z" fill={C.red} />
      <text y={60} textAnchor="middle" fill={C.dim} fontFamily={F.mono} fontSize={16} letterSpacing="0.2em">{cargo}</text>
    </g>
  );
};

/* ───────────── FAMINE / 1933 ───────────── */
export const Famine: React.FC = () => {
  const t = useT();
  const c = cues('famine');
  const ta2 = c.line('a2').t0;
  const seaOut = prog(t, ta2 - 0.5, 0.8, ease.inOut);
  const rows = [
    {at: c.word('a2', 'milk'), big: 'Milk', small: 'poured onto highways'},
    {at: c.word('a2', 'six'), big: '6,000,000', small: 'piglets slaughtered'},
    {at: c.word('a2', 'cities'), big: 'Cities', small: 'went hungry'},
  ];
  const horizon = 640;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{opacity: 1 - seaOut}}>
        <svg width={W} height={H}>
          <defs>
            <linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0b0a09" />
              <stop offset="1" stopColor="#1e1914" />
            </linearGradient>
          </defs>
          <rect width={W} height={horizon} fill="url(#fsky)" />
          {/* coast of Ireland, left */}
          <path d={`M0,${horizon} L0,${horizon - 120} Q60,${horizon - 150} 120,${horizon - 90} Q170,${horizon - 60} 240,${horizon - 30} L300,${horizon} Z`} fill="#1a1713" stroke={C.faint} />
          {Array.from({length: 26}, (_, i) => (
            <path key={i} d={wave(0, W, horizon + 10 + i * i * 0.7, 2 + i * 0.25, 3 + (i % 4), t * (0.8 + i * 0.05) + i)} stroke={C.ink} strokeWidth={1} fill="none" opacity={0.08 + i * 0.012} />
          ))}
          {[0, 1, 2, 3].map((i) => {
            const st = 0.3 + i * 0.9;
            const x = lerp(260, 2300, clamp((t - st) / 9));
            const s = 0.55 + i * 0.07;
            return <Ship key={i} x={x} y={horizon + 10 + i * 6} s={s} t={t} cargo={['OATS', 'BARLEY', 'CATTLE', 'WHEAT'][i]} o={prog(t, st, 0.6)} />;
          })}
        </svg>
        <div style={{position: 'absolute', left: 140, top: 180}}>
          <Label at={0.3}>Ireland · 1845–1852</Label>
          <Counter from={0} to={1000000} at={c.word('a1', 'million') - 0.4} dur={3.2} size={110} style={{marginTop: 6}} />
          <Label at={c.word('a1', 'starved')} color={C.red}>Dead of hunger</Label>
        </div>
        <div style={{position: 'absolute', left: 140, right: 140, bottom: 150}}>
          <Kinetic words={lineWords('famine', 'a1').slice(-9)} size={44} align="left" emph={{grain: redI}} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: seaOut}}>
        <div style={{position: 'absolute', left: 140, top: 160, fontFamily: F.serif, fontWeight: 300, fontSize: 260, color: 'transparent', WebkitTextStroke: `1.5px ${C.faint}`, lineHeight: 1}}>1933</div>
        <Label at={ta2} style={{position: 'absolute', left: 150, top: 450}} color={C.red}>United States · the Great Depression</Label>
        {rows.map((r, i) => {
          const p = prog(t, r.at - 0.1, 0.6);
          return (
            <div key={i} style={{position: 'absolute', left: 820, top: 220 + i * 210, opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
              <div style={{fontFamily: i === 1 ? F.mono : F.serif, fontWeight: 300, fontSize: 100, color: i === 2 ? C.red : C.ink, letterSpacing: '-0.02em', lineHeight: 1}}>{r.big}</div>
              <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.dim, textTransform: 'uppercase', marginTop: 10}}>{r.small}</div>
              {i === 0 && (
                <svg width={900} height={30} style={{position: 'absolute', left: 340, top: 40}}>
                  <path d={wave(0, 600 * prog(t, r.at, 2.2, ease.inOut), 15, 4, 3, t * 3)} stroke="#f3efe6" strokeWidth={7} fill="none" strokeLinecap="round" />
                </svg>
              )}
              {i === 1 && (
                <svg width={600} height={60} style={{position: 'absolute', left: 600, top: 18}}>
                  {Array.from({length: 120}, (_, k) => (
                    <circle key={k} cx={6 + (k % 40) * 14} cy={8 + Math.floor(k / 40) * 14} r={4} fill={prog(t, r.at + 0.3 + k * 0.012, 0.2) > 0.5 ? C.red : C.dim} opacity={0.9} />
                  ))}
                </svg>
              )}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── SEN ───────────── */
export const Sen: React.FC = () => {
  const t = useT();
  const c = cues('sen');
  const ta4 = c.line('a4').t0;
  const tShared = c.word('a4', 'shared');
  const strike = prog(t, tShared + 0.25, 0.5, ease.inOut);
  return (
    <AbsoluteFill style={{background: C.bg, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 300, left: 200, right: 200}}>
        <Kinetic words={lineWords('sen', 'a3')} size={72} out={ta4 - 0.35} emph={{food: {fontStyle: 'italic'}, ability: redI, acquire: redI}} />
        <Label at={1.6} out={ta4 - 0.35} style={{textAlign: 'center', marginTop: 40}}>
          after Amartya Sen · Poverty and Famines · 1981
        </Label>
      </div>
      <div style={{position: 'absolute', top: 420, left: 0, right: 0}}>
        <Kinetic words={lineWords('sen', 'a4').slice(0, 4)} size={52} color={C.dim} />
        <div style={{display: 'flex', justifyContent: 'center', gap: 60, marginTop: 20, alignItems: 'baseline'}}>
          <Kinetic words={[{w: 'Priced,', t: c.word('a4', 'priced')}]} size={150} weight={400} />
          <div style={{position: 'relative'}}>
            <Kinetic words={[{w: 'not shared.', t: c.word('a4', 'not')}]} size={150} italic color={strike > 0 ? C.dim : C.ink} />
            <svg width={720} height={40} style={{position: 'absolute', left: -10, top: 92}}>
              <Thread d="M0,20 L700,14" p={strike} len={720} width={6} />
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── BOAT & WATER ───────────── */
export const Boat: React.FC = () => {
  const t = useT();
  const c = cues('boat');
  const drain = prog(t, c.word('b1', 'capsize') + 0.2, 1.8, ease.in);
  const lines = 34;
  const bx = 960, by = 690;
  const bob = Math.sin(t * 1.4) * 6 * (1 - drain);
  const roll = Math.sin(t * 1.1) * 3 * (1 - drain);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={W} height={H}>
        {Array.from({length: lines}, (_, i) => {
          const y = 700 + i * 12 + drain * (300 + i * 18);
          return <path key={i} d={wave(-20, W + 20, y, 6 + i * 0.4, 2 + (i % 3), t * (1 + i * 0.03) + i * 0.7)} stroke={i === 0 ? C.red : C.ink} strokeWidth={i === 0 ? 2 : 1} fill="none" opacity={(i === 0 ? 0.9 : 0.12 + (1 - i / lines) * 0.35) * (1 - drain * 0.6)} />;
        })}
        <g transform={`translate(${bx},${by + bob}) rotate(${roll})`}>
          <path d="M-210,-6 Q0,10 210,-6 L170,48 Q0,64 -170,48 Z" fill={C.ink} />
          <line x1={0} x2={0} y1={-6} y2={-250} stroke={C.ink} strokeWidth={5} />
          <path d="M6,-240 Q130,-140 6,-20 Z" fill={C.ink} opacity={0.9} />
          <path d="M-6,-220 Q-100,-130 -6,-30 Z" fill={C.ink} opacity={0.5} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 200, right: 200, top: 150}}>
        <Kinetic words={lineWords('boat', 'b1')} size={52} emph={{boat: redI, water: {fontStyle: 'italic'}, capsize: redI}} />
        <Label at={1} style={{textAlign: 'center', marginTop: 26}}>Xunzi · 3rd century BCE</Label>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── RESOURCE → INTELLIGENCE CURSE ───────────── */
const Pumpjack: React.FC<{t: number}> = ({t}) => {
  const a = Math.sin(t * 2.2) * 14;
  return (
    <g>
      <path d="M-80,0 L0,-170 L80,0" stroke={C.ink} strokeWidth={6} fill="none" />
      <g transform={`translate(0,-170) rotate(${a})`}>
        <rect x={-200} y={-12} width={340} height={24} fill={C.ink} />
        <path d="M140,-40 Q190,0 140,40 L130,40 L130,-40 Z" fill={C.ink} />
        <line x1={160} x2={160} y1={30} y2={140 + a * 2} stroke={C.ink} strokeWidth={3} />
      </g>
      <circle cx={-170} cy={-80} r={32} fill="none" stroke={C.ink} strokeWidth={6} />
      <rect x={-260} y={-4} width={520} height={8} fill={C.ink} />
    </g>
  );
};

const Rack: React.FC<{t: number}> = ({t}) => (
  <g>
    {Array.from({length: 3}, (_, col) => (
      <g key={col} transform={`translate(${-230 + col * 160},-360)`}>
        <rect width={140} height={360} fill="#151311" stroke={C.ink} strokeWidth={2} />
        {Array.from({length: 14}, (_, k) => {
          const r = rng(col * 100 + k);
          const on = Math.sin(t * (4 + r() * 9) + r() * 10) > 0.2;
          return (
            <g key={k} transform={`translate(10,${12 + k * 25})`}>
              <rect width={120} height={18} fill="#1f1c19" />
              <circle cx={10} cy={9} r={3} fill={on ? C.red : C.faint} />
              <circle cx={22} cy={9} r={3} fill={r() > 0.5 ? '#6fae7a' : C.faint} />
              <rect x={40} y={7} width={70} height={3} fill={C.faint} />
            </g>
          );
        })}
      </g>
    ))}
    <rect x={-260} y={-4} width={520} height={8} fill={C.ink} />
  </g>
);

export const Curse: React.FC = () => {
  const t = useT();
  const c = cues('curse');
  const tb4 = c.line('b4').t0;
  const morph = prog(t, tb4 - 0.2, 1.2, ease.inOut);
  const stamp = prog(t, c.word('b4', 'intelligence') - 0.05, 0.35, ease.out);
  const crowd = Array.from({length: 260}, (_, i) => {
    const r = rng(i + 500);
    return {x: 120 + r() * 900, y: 900 + r() * 80, s: 2 + r() * 2};
  });
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={W} height={H}>
        <g transform="translate(560,820)">
          <g opacity={1 - morph}>
            <Pumpjack t={t} />
          </g>
          <g opacity={morph} transform={`translate(0,${(1 - morph) * 20})`}>
            <Rack t={t} />
          </g>
        </g>
        <Thread d="M200,840 L920,840" width={2} len={800} p={prog(t, 0.3, 1)} />
        {crowd.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={C.ink} opacity={0.5 - morph * 0.35} />
        ))}
        <text x={560} y={1010} textAnchor="middle" fill={C.dim} fontFamily={F.mono} fontSize={14} letterSpacing="0.2em">THE PEOPLE · NOT REQUIRED</text>
      </svg>
      <div style={{position: 'absolute', left: 1080, top: 300, width: 700}}>
        <Label at={0.1} out={tb4 - 0.3} color={C.dim}>The resource curse</Label>
        <Kinetic words={lineWords('curse', 'b3')} size={50} align="left" out={tb4 - 0.3} emph={{wells: redI}} style={{marginTop: 18}} />
      </div>
      <div style={{position: 'absolute', left: 1080, top: 300, width: 700}}>
        <Kinetic words={lineWords('curse', 'b4').slice(0, 6)} size={50} align="left" emph={{petrostate: redI}} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 1080,
          top: 540,
          padding: '18px 30px',
          border: `5px solid ${C.red}`,
          color: C.red,
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: 44,
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap',
          opacity: stamp,
          transform: `rotate(-6deg) scale(${lerp(2.2, 1, stamp)})`,
          mixBlendMode: 'screen',
        }}
      >
        INTELLIGENCE CURSE
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── WEAPONS ───────────── */
const Icon: React.FC<{k: number}> = ({k}) => {
  if (k === 0)
    return (
      <g>
        <circle r={46} fill="none" stroke={C.ink} strokeWidth={6} strokeDasharray="18 9" />
        <circle r={18} fill={C.ink} />
      </g>
    );
  if (k === 1)
    return (
      <g>
        <path d="M-40,-20 L40,-20 L32,44 L-32,44 Z" fill="none" stroke={C.ink} strokeWidth={6} />
        <path d="M-18,-20 Q-18,-50 0,-50 Q18,-50 18,-20" fill="none" stroke={C.ink} strokeWidth={6} />
      </g>
    );
  return (
    <g>
      {Array.from({length: 9}, (_, i) => (
        <g key={i} transform={`translate(${(i % 3) * 32 - 32},${Math.floor(i / 3) * 30 - 30})`}>
          <circle r={7} cy={-8} fill={C.ink} />
          <rect x={-8} y={0} width={16} height={14} rx={5} fill={C.ink} />
        </g>
      ))}
    </g>
  );
};

export const Weapons: React.FC = () => {
  const t = useT();
  const c = cues('weapons');
  const tb6 = c.line('b6').t0;
  const fails = [c.word('b5', 'strike'), c.word('b5', 'strike') + 1.1, tb6 + 0.3];
  const names = ['Strike', 'Boycott', 'Revolt'];
  const needs = ['needs: they need your labor', 'needs: you have money', 'needs: soldiers who hesitate'];
  const cam = prog(t, tb6 + 0.6, 0.8, ease.inOut);
  const scanX = 960 + Math.sin(t * 1.3) * 520;
  const scanY = 760 + Math.cos(t * 0.9) * 60;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{opacity: 1 - cam}}>
        <svg width={W} height={H}>
          {names.map((n, i) => {
            const x = 480 + i * 480, y = 480;
            const f = prog(t, fails[i], 0.5);
            return (
              <g key={n} opacity={prog(t, 0.2 + i * 0.25, 0.5)}>
                <g transform={`translate(${x},${y})`} opacity={1 - f * 0.7}>
                  <Icon k={i} />
                </g>
                <text x={x} y={y + 120} textAnchor="middle" fill={f > 0.5 ? C.dim : C.ink} fontFamily={F.serif} fontWeight={300} fontSize={52}>
                  {n}
                </text>
                <text x={x} y={y + 160} textAnchor="middle" fill={C.dim} fontFamily={F.mono} fontSize={15} letterSpacing="0.15em">
                  {needs[i].toUpperCase()}
                </text>
                <path d={`M${x - 80},${y - 80} L${x + 80},${y + 80}`} stroke={C.red} strokeWidth={6} strokeDasharray={230} strokeDashoffset={230 * (1 - f)} strokeLinecap="round" />
                <path d={`M${x + 80},${y - 80} L${x - 80},${y + 80}`} stroke={C.red} strokeWidth={6} strokeDasharray={230} strokeDashoffset={230 * (1 - prog(t, fails[i] + 0.15, 0.4))} strokeLinecap="round" />
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 180}}>
          <Kinetic words={lineWords('weapons', 'b5').slice(0, 4)} size={56} emph={{fail: redI}} />
        </div>
      </AbsoluteFill>
      {/* machine vision */}
      <AbsoluteFill style={{opacity: cam}}>
        <svg width={W} height={H}>
          {Array.from({length: 400}, (_, i) => {
            const r = rng(i + 77);
            const x = 80 + r() * 1760;
            const y = 640 + r() * 300;
            const s = lerp(0.6, 1.4, (y - 640) / 300);
            return (
              <g key={i} transform={`translate(${x},${y}) scale(${s})`} opacity={0.55}>
                <circle r={7} cy={-10} fill={C.cold} />
                <rect x={-8} y={-2} width={16} height={22} rx={6} fill={C.cold} />
              </g>
            );
          })}
          {Array.from({length: 60}, (_, i) => (
            <line key={i} x1={0} x2={W} y1={i * 18} y2={i * 18} stroke="#9fb3c8" opacity={0.035} />
          ))}
          <g transform={`translate(${scanX},${scanY})`}>
            <rect x={-60} y={-70} width={120} height={140} fill="none" stroke={C.red} strokeWidth={2} />
            <line x1={-90} x2={-60} y1={0} y2={0} stroke={C.red} strokeWidth={2} />
            <line x1={60} x2={90} y1={0} y2={0} stroke={C.red} strokeWidth={2} />
            <text x={70} y={-78} fill={C.red} fontFamily={F.mono} fontSize={15}>ID {String(Math.floor(t * 731) % 100000).padStart(5, '0')}</text>
          </g>
        </svg>
        <div style={{position: 'absolute', left: 120, top: 150, fontFamily: F.mono, fontSize: 18, color: C.cold, letterSpacing: '0.15em', lineHeight: 1.9, opacity: 0.85}}>
          <div>● REC · SECTOR 7 · CROWD DENSITY HIGH</div>
          <div>FACE MATCHES: {Math.floor(t * 211)}</div>
          <div>
            NEIGHBOR RECOGNIZED: <span style={{color: C.red}}>N/A</span>
          </div>
          <div>
            HESITATION: <span style={{color: C.red}}>0.000 s</span>
          </div>
        </div>
        <div style={{position: 'absolute', left: 120, right: 120, top: 420}}>
          <Kinetic words={lineWords('weapons', 'b6')} size={50} align="left" emph={{never: redI, neighbor: redI}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
