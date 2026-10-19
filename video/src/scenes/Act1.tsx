import React, {useEffect, useRef} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Counter, Kinetic, Label, lineWords, spread} from '../components/Type';
import {Thread, wave} from '../components/Thread';
import {clamp, cues, lerp, prog, rng, useT} from '../lib';
import {C, F, H, W, ease} from '../theme';

const red = {color: C.red};
const redI = {color: C.red, fontStyle: 'italic'};

/* ───────────── COLD OPEN ───────────── */
export const Cold: React.FC = () => {
  const t = useT();
  const c = cues('cold');
  const c3 = c.line('c3');
  const draw = prog(t, 0.2, 5, ease.inOut);
  const taut = prog(t, c.word('c3', 'expire'), 1.2, ease.inOut);
  const amp = lerp(10, 0.5, taut);
  const camZ = 1 + t * 0.006;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{transform: `scale(${camZ})`}}>
        <svg width={W} height={H}>
          <Thread d={wave(-40, W + 40, 600, amp, 2.2, t * 0.6)} p={draw} len={2200} width={2.6} glow={0.6 + taut} />
        </svg>
      </AbsoluteFill>
      <Label at={0.4} out={c.line('c1').t0 - 0.2} style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center'}} color={C.dim}>
        Lancashire · 1820 &nbsp;—&nbsp; Everywhere · 2026
      </Label>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380}}>
        <Kinetic words={lineWords('cold', 'c1')} out={c.line('c2').t0 - 0.35} size={66} emph={{happy: redI, ending: redI}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380}}>
        <Kinetic words={lineWords('cold', 'c2')} out={c3.t0 - 0.3} size={66} emph={{needed: redI}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360}}>
        <Kinetic words={lineWords('cold', 'c3')} out={c.dur - 0.4} size={78} emph={{contract: {fontWeight: 600}, expire: redI}} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── WEAVE ───────────── */
const COLS = 64;
const ROWS = 30;
const CELL = 14;

export const Weave: React.FC = () => {
  const t = useT();
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const c = cues('weave');
  const tMach = c.word('w3', 'power');
  const tCheap = c.word('w3', 'simply');
  useEffect(() => {
    const cv = ref.current!;
    const g = cv.getContext('2d')!;
    const w = COLS * CELL;
    const h = ROWS * CELL;
    g.clearRect(0, 0, w, h);
    // rows woven: slow by hand, then mechanised burst
    const hand = clamp(t / tMach) * 9;
    const mach = prog(t, tMach, 2.4, ease.in) * (ROWS - 9);
    const rowsDone = hand + mach;
    const mech = prog(t, tMach, 1.6);
    const r = rng(42);
    // warp threads
    for (let x = 0; x < COLS; x++) {
      const jx = (r() - 0.5) * 3 * (1 - mech);
      g.strokeStyle = `rgba(236,229,216,${0.22 + 0.1 * (x % 2)})`;
      g.lineWidth = CELL * 0.42;
      g.beginPath();
      g.moveTo(x * CELL + CELL / 2 + jx, 0);
      g.lineTo(x * CELL + CELL / 2 + jx, h);
      g.stroke();
    }
    for (let y = 0; y < ROWS; y++) {
      const fill = clamp(rowsDone - y);
      if (fill <= 0) continue;
      const handRow = y < 9;
      const rr = rng(1000 + y);
      const jy = handRow ? (rr() - 0.5) * 4 : 0;
      const tone = handRow ? `rgba(${200 + rr() * 30},${150 + rr() * 30},${110 + rr() * 30},0.95)` : `rgba(${lerp(200, 150, mech)},${lerp(160, 160, mech)},${lerp(130, 170, mech)},0.95)`;
      const reach = Math.floor(fill * COLS);
      const dir = y % 2 === 0;
      for (let k = 0; k < reach; k++) {
        const x = dir ? k : COLS - 1 - k;
        const over = (x + y) % 2 === 0;
        if (!over) continue;
        g.fillStyle = tone;
        g.fillRect(x * CELL + 1, y * CELL + 2 + jy, CELL - 2, CELL - 4);
        g.fillStyle = 'rgba(0,0,0,0.25)';
        g.fillRect(x * CELL + 1, y * CELL + CELL - 4 + jy, CELL - 2, 2);
      }
      // the shuttle
      if (fill < 1) {
        const sx = (dir ? reach : COLS - reach) * CELL;
        g.fillStyle = C.red;
        g.fillRect(sx - 18, y * CELL + 3, 36, CELL - 6);
      }
    }
    // the single red thread woven through
    g.strokeStyle = C.red;
    g.lineWidth = 2.5;
    g.beginPath();
    const ry = 4.5 * CELL;
    g.moveTo(0, ry);
    g.lineTo(Math.min(w, clamp(rowsDone / 5) * w), ry);
    g.stroke();
  }, [frame, t, tMach]);

  // 250 figures = 1,000 weavers each; they vanish as the loom mechanises
  const gone = prog(t, tMach + 0.4, 2.6, ease.inOut);
  const figs = Array.from({length: 250}, (_, i) => i);
  const camS = 1.04 - prog(t, 0, c.dur) * 0.04;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <div style={{position: 'absolute', left: 860, top: 210, transform: `scale(${camS}) perspective(1600px) rotateY(-14deg)`, transformOrigin: 'left center'}}>
        <canvas ref={ref} width={COLS * CELL} height={ROWS * CELL} style={{boxShadow: '0 40px 120px rgba(0,0,0,0.7)'}} />
        <Label at={tMach} style={{marginTop: 18}} color={C.red}>
          ● Power loom engaged
        </Label>
      </div>
      <div style={{position: 'absolute', left: 140, top: 250, width: 640}}>
        <Label at={0.2}>Handloom weavers · Britain · 1820s</Label>
        <Counter from={0} to={250000} at={0.3} dur={2.6} size={124} style={{marginTop: 8, opacity: 1 - gone * 0.75}} />
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(25, 1fr)', gap: 9, width: 560, marginTop: 26}}>
          {figs.map((i) => {
            const r = rng(i * 31 + 5);
            const appear = prog(t, 0.4 + (i / 250) * 2.4, 0.3);
            const die = prog(t, tMach + 0.3 + r() * 2.4, 0.35);
            return (
              <svg key={i} width={14} height={22} style={{opacity: appear * (1 - die * 0.9)}}>
                <circle cx={7} cy={4} r={3.2} fill={die > 0.5 ? C.faint : C.ink} />
                <rect x={3.5} y={9} width={7} height={12} rx={2} fill={die > 0.5 ? C.faint : C.ink} />
              </svg>
            );
          })}
        </div>
        <Label at={0.8} size={14} style={{marginTop: 14}}>
          each figure = 1,000 weavers
        </Label>
      </div>
      <div style={{position: 'absolute', left: 140, right: 140, bottom: 150}}>
        <Kinetic words={spread('It was simply cheaper.', tCheap, tCheap + 0.9)} size={58} align="left" emph={{cheaper: redI}} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── CHASM (Allen, "Engels' Pause") ───────────── */
const yrs = [1780, 1790, 1800, 1810, 1820, 1830, 1840];
const output = [100, 104, 111, 119, 127, 136, 146];
const wages = [100, 100, 101, 102, 104, 107, 112];

export const Chasm: React.FC = () => {
  const t = useT();
  const c = cues('chasm');
  const p = prog(t, 0.3, 3.6, ease.inOut);
  const pFill = prog(t, c.word('w5', 'generation'), 2.2, ease.inOut);
  const X0 = 260, X1 = 1500, Y0 = 820, Y1 = 260;
  const sx = (i: number) => X0 + ((X1 - X0) * i) / (yrs.length - 1);
  const sy = (v: number) => Y0 - ((v - 90) / (150 - 90)) * (Y0 - Y1);
  const path = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${sx(i)},${sy(v)}`).join('');
  const area = `${path(output)} ${wages.map((v, i) => `L${sx(yrs.length - 1 - i)},${sy(wages[yrs.length - 1 - i])}`).join(' ')} Z`;
  const r = rng(9);
  const people = Array.from({length: 180}, () => {
    const u = 0.08 + r() * 0.9;
    const i = u * (yrs.length - 1);
    const a = Math.floor(i), b = Math.min(yrs.length - 1, a + 1), f = i - a;
    const top = sy(lerp(output[a], output[b], f));
    const bot = sy(lerp(wages[a], wages[b], f));
    return {x: X0 + u * (X1 - X0), y: lerp(top + 14, bot - 6, Math.pow(r(), 0.6)), d: r()};
  });
  const zoom = 1 + prog(t, c.word('w5', 'generation'), 4, ease.inOut) * 0.12;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '70% 55%'}}>
        <svg width={W} height={H}>
          <defs>
            <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="8" stroke={C.redDeep} strokeWidth="1.2" />
            </pattern>
            <clipPath id="reveal">
              <rect x={0} y={0} width={X0 + (X1 - X0) * p + 4} height={H} />
            </clipPath>
          </defs>
          {[90, 110, 130, 150].map((v) => (
            <g key={v}>
              <line x1={X0} x2={X1} y1={sy(v)} y2={sy(v)} stroke={C.line} />
              <text x={X0 - 20} y={sy(v) + 5} fill={C.dim} fontFamily={F.mono} fontSize={14} textAnchor="end">{v}</text>
            </g>
          ))}
          {yrs.map((y, i) => (
            <text key={y} x={sx(i)} y={Y0 + 36} fill={C.dim} fontFamily={F.mono} fontSize={15} textAnchor="middle">{y}</text>
          ))}
          <g clipPath="url(#reveal)">
            <path d={area} fill="url(#hatch)" opacity={0.35 + pFill * 0.5} />
            <path d={path(output)} stroke={C.ink} strokeWidth={3} fill="none" />
            <Thread d={path(wages)} width={3} len={1400} />
          </g>
          {people.map((q, i) => {
            const a = prog(t, c.word('w5', 'generation') + q.d * 2, 0.5);
            return (
              <g key={i} opacity={a * 0.85} transform={`translate(${q.x},${q.y + (1 - a) * 6})`}>
                <circle r={2.4} cy={-7} fill={C.ink} />
                <rect x={-2} y={-4} width={4} height={8} rx={1.5} fill={C.ink} />
              </g>
            );
          })}
          <text x={X1 + 18} y={sy(146) + 6} fill={C.ink} fontFamily={F.mono} fontSize={17} opacity={prog(t, 3, 0.6)}>OUTPUT / WORKER +46%</text>
          <text x={X1 + 18} y={sy(112) + 6} fill={C.red} fontFamily={F.mono} fontSize={17} opacity={prog(t, 3.3, 0.6)}>REAL WAGES +12%</text>
        </svg>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 260, top: 150}}>
        <Kinetic words={lineWords('chasm', 'w4')} out={c.line('w5').t0 - 0.3} size={48} align="left" emph={{climbed: {fontWeight: 600}, still: redI}} />
        <div style={{position: 'absolute', top: 0}}>
          <Kinetic words={lineWords('chasm', 'w5')} size={48} align="left" emph={{chasm: redI}} />
        </div>
      </div>
      <Label at={1} size={13} style={{position: 'absolute', left: 260, bottom: 130}}>
        Britain, 1780–1840 · index 1780 = 100 · after R.C. Allen, “Engels’ Pause” (2009)
      </Label>
    </AbsoluteFill>
  );
};

/* ───────────── RAIL ───────────── */
const JOBS = ['Stoker', 'Navvy', 'Signalman', 'Clerk', 'Porter', 'Ticket Inspector', 'Platelayer', 'Guard'];

export const Rail: React.FC = () => {
  const t = useT();
  const c = cues('rail');
  const tOnly = c.line('w7').t0;
  const tChange = c.word('w8', 'changed');
  const tThis = c.line('w8').t0;
  const vpX = 960, vpY = 430;
  const travel = t * 0.9;
  const sleepers = Array.from({length: 26}, (_, i) => {
    const z = ((i + travel) % 26) / 26; // 0 far, 1 near
    const zz = Math.pow(z, 2.2);
    return {y: lerp(vpY, 1100, zz), half: lerp(4, 760, zz), o: z};
  });
  const dark = prog(t, tThis - 0.2, 1.2, ease.inOut);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={W} height={H} style={{opacity: 1 - dark * 0.8}}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b1612" />
            <stop offset="1" stopColor={C.bg} />
          </linearGradient>
        </defs>
        <rect width={W} height={vpY} fill="url(#sky)" />
        {/* engraving-style horizon hatching */}
        {Array.from({length: 40}, (_, i) => (
          <line key={i} x1={0} x2={W} y1={vpY - i * 9} y2={vpY - i * 9} stroke={C.line} strokeWidth={1} opacity={1 - i / 40} />
        ))}
        {sleepers.map((s, i) => (
          <line key={i} x1={vpX - s.half * 0.9} x2={vpX + s.half * 0.9} y1={s.y} y2={s.y} stroke={C.dim} strokeWidth={lerp(1, 14, s.o * s.o)} opacity={0.5} />
        ))}
        <line x1={vpX - 4} y1={vpY} x2={vpX - 860} y2={H + 40} stroke={C.ink} strokeWidth={4} opacity={0.8} />
        <Thread d={`M${vpX + 4},${vpY} L${vpX + 860},${H + 40}`} width={4} len={900} />
        {/* telegraph poles */}
        {Array.from({length: 8}, (_, i) => {
          const z = ((i / 8 + travel / 26) % 1);
          const zz = Math.pow(z, 2.2);
          const x = vpX - lerp(30, 1500, zz);
          const h = lerp(10, 700, zz);
          return <line key={i} x1={x} x2={x} y1={lerp(vpY, 1100, zz)} y2={lerp(vpY, 1100, zz) - h} stroke={C.faint} strokeWidth={lerp(1, 10, zz)} />;
        })}
      </svg>
      {/* job tags */}
      <div style={{position: 'absolute', right: 140, top: 210, width: 520}}>
        <Label at={0.4} color={C.dim}>New work · 1830–1900</Label>
        {JOBS.map((j, i) => {
          const at = 1.0 + i * 0.55;
          const p = prog(t, at, 0.5);
          const flip = prog(t, tChange - 0.2 + i * 0.07, 0.25);
          return (
            <div key={j} style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}>
              <svg width={18} height={26}>
                {flip < 0.5 ? (
                  <>
                    <circle cx={9} cy={5} r={4} fill={C.ink} />
                    <rect x={4} y={11} width={10} height={14} rx={3} fill={C.ink} />
                  </>
                ) : (
                  <rect x={1} y={6} width={16} height={16} fill="none" stroke={C.red} strokeWidth={2} />
                )}
              </svg>
              <span style={{fontFamily: flip < 0.5 ? F.serif : F.mono, fontSize: flip < 0.5 ? 40 : 30, fontWeight: 300, color: flip < 0.5 ? C.ink : C.red, letterSpacing: flip < 0.5 ? '-0.01em' : '0.1em'}}>
                {flip < 0.5 ? j : j.toUpperCase().replace(/[AEIOU]/g, '_')}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 140, top: 240, width: 820}}>
        <Kinetic words={lineWords('rail', 'w7')} out={tThis - 0.3} size={60} align="left" emph={{humans: redI}} style={{opacity: t > tOnly - 0.3 ? 1 : 0}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820}}>
        <Kinetic words={lineWords('rail', 'w8')} size={64} emph={{changed: redI}} />
      </div>
    </AbsoluteFill>
  );
};
