import React, {useEffect, useRef} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Counter, Kinetic, Label, lineWords, spread} from '../components/Type';
import {Thread} from '../components/Thread';
import {clamp, cues, lerp, prog, rng, useT} from '../lib';
import {C, F, H, W, ease} from '../theme';

const redI = {color: C.red, fontStyle: 'italic'};

/* ───────────── ONE MACHINE ───────────── */
const TASKS = ['Write code', 'Draft contracts', 'Answer calls', 'Tutor', 'Translate', 'Synthesize research', 'Bookkeeping', 'Customer service', 'Legal review', 'Design', 'Diagnose', 'Schedule', 'Copywriting', 'Data entry'];
const TOKENS = ['def', 'return', '0.0731', '{', 'invoice', '§ 4.2', 'SELECT *', 'whereas', '1,204.55', '=>', 'Dear Sir', 'Q3', 'TODO', '∑', 'null', 'clause', '42', 'translate()', 'IBAN', 'import', 'résumé', '%', 'ticket #8812', '</div>'];

export const Machine: React.FC = () => {
  const t = useT();
  const c = cues('machine');
  const tm2 = c.line('m2').t0;
  const cx = 1240, cy = 540;
  const firsts = [c.word('m1', 'writes'), c.word('m1', 'drafts'), c.word('m1', 'answers'), c.word('m1', 'tutors')];
  const absorbAt = tm2 + 0.4;
  const pulse = 1 + Math.sin(t * 5) * 0.03 + prog(t, absorbAt, 3) * 0.25;
  const rings = [90, 150, 230, 330];
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={W} height={H}>
        <defs>
          <radialGradient id="core">
            <stop offset="0" stopColor="#fff4e6" />
            <stop offset="0.25" stopColor={C.red} stopOpacity={0.9} />
            <stop offset="1" stopColor={C.red} stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* token streams feeding the core */}
        {Array.from({length: 22}, (_, i) => {
          const r = rng(i * 77 + 3);
          const y = 140 + r() * 800;
          const speed = 300 + r() * 500;
          const vis = prog(t, tm2 + r() * 0.8, 0.6);
          return (
            <g key={i} opacity={vis * 0.85}>
              {Array.from({length: 7}, (_, k) => {
                const x = ((t - tm2) * speed + k * 190 + r() * 400) % 1300;
                const fx = -100 + x;
                const toCore = clamp((fx - 400) / 800);
                const yy = lerp(y, cy, toCore * toCore);
                return (
                  <text key={k} x={fx} y={yy} fill={k % 3 === 0 ? C.red : C.dim} fontFamily={F.mono} fontSize={lerp(18, 8, toCore)} opacity={1 - toCore}>
                    {TOKENS[(i * 7 + k) % TOKENS.length]}
                  </text>
                );
              })}
            </g>
          );
        })}
        {rings.map((r, i) => (
          <g key={r} transform={`translate(${cx},${cy}) rotate(${t * (i % 2 ? -12 : 9) * (1 + i * 0.4)})`}>
            <circle r={r * pulse} fill="none" stroke={i === 0 ? C.red : C.faint} strokeWidth={i === 0 ? 2 : 1} strokeDasharray={i % 2 ? '2 10' : '40 8 4 8'} />
            {Array.from({length: 24}, (_, k) => (
              <line key={k} x1={0} x2={0} y1={-r * pulse} y2={-r * pulse - (k % 6 === 0 ? 14 : 5)} stroke={C.dim} transform={`rotate(${k * 15})`} />
            ))}
          </g>
        ))}
        <circle cx={cx} cy={cy} r={70 * pulse} fill="url(#core)" />
        <circle cx={cx} cy={cy} r={12} fill="#fff" />
        {TASKS.map((task, i) => {
          const at = i < 4 ? firsts[i] : firsts[3] + 0.5 + (i - 4) * 0.22;
          const appear = prog(t, at - 0.1, 0.5);
          const absorb = prog(t, absorbAt + i * 0.12, 1.0, ease.in);
          const ring = rings[1 + (i % 3)];
          const ang = (i / TASKS.length) * Math.PI * 2 + t * 0.15 * (i % 2 ? 1 : -1);
          const R = lerp(ring + 30, 0, absorb);
          const x = cx + Math.cos(ang) * R * 1.25;
          const y = cy + Math.sin(ang) * R;
          return (
            <g key={task} opacity={appear * (1 - absorb)} transform={`translate(${x},${y}) scale(${1 - absorb * 0.6})`}>
              <rect x={-task.length * 6.6 - 14} y={-17} width={task.length * 13.2 + 28} height={34} rx={17} fill={C.bg} stroke={i < 4 ? C.red : C.faint} />
              <text textAnchor="middle" y={6} fill={C.ink} fontFamily={F.mono} fontSize={16} letterSpacing="0.06em">
                {task.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: 120, top: 200, width: 600}}>
        <Kinetic words={lineWords('machine', 'm1').slice(0, 5)} size={56} align="left" out={tm2 - 0.3} emph={{cloth: {fontStyle: 'italic'}}} />
        <Label at={c.word('m1', 'today') - 0.1} out={tm2 - 0.3} style={{marginTop: 30}} color={C.red}>
          Today: one system
        </Label>
      </div>
      <div style={{position: 'absolute', left: 120, bottom: 170, width: 700}}>
        <Kinetic words={lineWords('machine', 'm2')} size={46} align="left" emph={{first: redI, code: {fontFamily: F.mono, fontSize: 40}}} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── TUG OF WAR (Acemoglu & Restrepo) ───────────── */
const Y = [1947, 1957, 1967, 1977, 1987, 1997, 2007, 2017];
const DISP = [0, 5, 10, 15, 20, 29, 38, 47];
const REIN = [0, 5, 10, 15, 19.5, 22, 23.5, 24.5];

export const Tug: React.FC = () => {
  const t = useT();
  const c = cues('tug');
  const tm4 = c.line('m4').t0;
  const X0 = 240, X1 = 1300, Y0 = 880, Y1 = 420;
  const N = Y.length - 1;
  const sx = (i: number) => X0 + ((X1 - X0) * i) / N;
  const sy = (v: number) => Y0 - (v / 70) * (Y0 - Y1);
  const pth = (a: number[]) => a.map((v, i) => `${i ? 'L' : 'M'}${sx(i)},${sy(v)}`).join('');
  const p = prog(t, 0.6, 3.8, ease.inOut);
  const proj = prog(t, tm4, 2.4, ease.inOut);
  const PX = 1680;
  // rope: knot drifts toward displacement as the gap opens
  const knot = lerp(0, 1, prog(t, 2.2, 5.5, ease.inOut));
  const kx = 960 - knot * 260;
  const ropeY = 250;
  const sag = Math.sin(t * 3) * 2;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={W} height={H}>
        {/* rope */}
        <path d={`M240,${ropeY} Q${kx},${ropeY + 10 + sag} 1680,${ropeY}`} stroke={C.dim} strokeWidth={5} fill="none" strokeDasharray="10 4" opacity={prog(t, 0, 0.6)} />
        <Thread d={`M240,${ropeY} Q${(240 + kx) / 2},${ropeY + 6 + sag} ${kx},${ropeY + 6}`} width={5} len={1400} p={prog(t, 0.2, 1)} />
        <g transform={`translate(${kx},${ropeY + 6})`} opacity={prog(t, 0.4, 0.5)}>
          <circle r={14} fill={C.bg} stroke={C.ink} strokeWidth={2} />
          <line y1={-40} y2={-24} stroke={C.ink} />
        </g>
        <line x1={960} x2={960} y1={ropeY - 40} y2={ropeY + 40} stroke={C.faint} strokeDasharray="3 5" />
        <text x={240} y={ropeY - 34} fill={C.red} fontFamily={F.mono} fontSize={18} letterSpacing="0.2em" opacity={prog(t, c.word('m3', 'displacement'), 0.4)}>DISPLACEMENT ←</text>
        <text x={1680} y={ropeY - 34} textAnchor="end" fill={C.ink} fontFamily={F.mono} fontSize={18} letterSpacing="0.2em" opacity={prog(t, c.word('m3', 'reinstatement'), 0.4)}>→ REINSTATEMENT</text>
        {/* chart */}
        <defs>
          <clipPath id="tugc">
            <rect width={X0 + (X1 - X0) * p + 3} height={H} />
          </clipPath>
        </defs>
        <line x1={X0} x2={PX} y1={Y0} y2={Y0} stroke={C.line} />
        {Y.map((y, i) => (
          <text key={y} x={sx(i)} y={Y0 + 30} fill={C.dim} fontFamily={F.mono} fontSize={14} textAnchor="middle">{y}</text>
        ))}
        <line x1={sx(4)} x2={sx(4)} y1={Y1 - 20} y2={Y0} stroke={C.faint} strokeDasharray="4 6" opacity={prog(t, 2.6, 0.5)} />
        <text x={sx(4) + 10} y={Y1 - 4} fill={C.dim} fontFamily={F.mono} fontSize={14} opacity={prog(t, 2.6, 0.5)}>1987 — THE SCALES TIP</text>
        <g clipPath="url(#tugc)">
          <path d={pth(REIN)} stroke={C.ink} strokeWidth={3} fill="none" />
          <Thread d={pth(DISP)} width={3} len={1400} />
        </g>
        {/* projection */}
        <path d={`M${sx(N)},${sy(DISP[N])} L${lerp(sx(N), PX, proj)},${sy(lerp(DISP[N], 70, proj))}`} stroke={C.red} strokeWidth={2.5} strokeDasharray="8 8" fill="none" />
        <path d={`M${sx(N)},${sy(REIN[N])} L${lerp(sx(N), PX, proj)},${sy(lerp(REIN[N], 27, proj))}`} stroke={C.dim} strokeWidth={2} strokeDasharray="3 8" fill="none" />
        {Array.from({length: 6}, (_, i) => {
          const pp = prog(t, tm4 + 0.8 + i * 0.25, 0.4);
          const x = lerp(sx(N), PX, (i + 1) / 7);
          const y = sy(lerp(REIN[N], 27, (i + 1) / 7)) - 26;
          return <rect key={i} x={x - 7} y={y - 7} width={14} height={14} fill="none" stroke={C.red} strokeWidth={1.5} opacity={pp} transform={`rotate(${(1 - pp) * 90} ${x} ${y})`} />;
        })}
        <text x={PX} y={sy(27) - 52} textAnchor="end" fill={C.red} fontFamily={F.mono} fontSize={15} letterSpacing="0.12em" opacity={prog(t, tm4 + 1.8, 0.5)}>
          REINSTATED → MACHINES
        </text>
      </svg>
      <div style={{position: 'absolute', left: 240, top: 330}}>
        <Kinetic words={lineWords('tug', 'm4')} size={44} align="left" emph={{machines: redI, birth: redI}} />
      </div>
      <Label at={1.2} size={13} style={{position: 'absolute', left: 240, bottom: 130}}>
        Illustrative · after Acemoglu &amp; Restrepo, “Automation and New Tasks” (2019) · dashed = projection
      </Label>
    </AbsoluteFill>
  );
};

/* ───────────── WAGE CEILING ───────────── */
export const Ceiling: React.FC = () => {
  const t = useT();
  const c = cues('ceiling');
  const tRent = c.word('m6', 'rent');
  const tFood = c.word('m6', 'food');
  const tAlive = c.word('m6', 'alive');
  const levels = [
    {k: 'Rent', y: 440, at: tRent},
    {k: 'Food', y: 610, at: tFood},
    {k: 'Staying alive', y: 780, at: tAlive},
  ];
  const keys = [0, c.word('m5', 'ceiling'), c.word('m6', 'falling'), tRent, tFood, tAlive, c.dur];
  const ys = [180, 250, 330, 450, 620, 800, 850];
  const ceilY = interpolate(t, keys, ys, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut});
  const floor = 920;
  const figH = Math.min(260, floor - ceilY - 4);
  const cost = interpolate(ceilY, [180, 850], [38.0, 0.04]);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={W} height={H}>
        <defs>
          <linearGradient id="press" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0.9} />
            <stop offset="1" stopColor={C.redDeep} stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={W} height={ceilY} fill="url(#press)" />
        {levels.map((l) => {
          const crossed = ceilY > l.y;
          const flash = prog(t, l.at, 0.25) * (1 - prog(t, l.at + 0.25, 0.8));
          return (
            <g key={l.k} opacity={prog(t, 0.5, 0.6)}>
              <line x1={300} x2={1640} y1={l.y} y2={l.y} stroke={crossed ? C.red : C.dim} strokeDasharray="6 8" opacity={crossed ? 0.9 : 0.6} />
              <rect x={1660} y={l.y - 20} width={220} height={40} fill={crossed ? C.red : 'none'} opacity={0.15 + flash * 0.85} />
              <text x={1676} y={l.y + 7} fill={crossed ? C.ink : C.dim} fontFamily={F.mono} fontSize={19} letterSpacing="0.15em">
                {l.k.toUpperCase()}
              </text>
            </g>
          );
        })}
        <line x1={300} x2={1640} y1={floor} y2={floor} stroke={C.faint} strokeWidth={2} />
        <Thread d={`M200,${ceilY} L1640,${ceilY}`} width={4} len={1500} p={prog(t, 0.1, 1.2)} glow={1.2} />
        <text x={300} y={ceilY - 18} fill={C.red} fontFamily={F.mono} fontSize={17} letterSpacing="0.15em" opacity={prog(t, 0.6, 0.5)}>
          MACHINE COST = YOUR WAGE CEILING · ${cost.toFixed(2)}/h
        </text>
        {/* the worker, pressed down */}
        <g transform={`translate(900,${floor}) scale(${figH / 260})`} opacity={prog(t, 0.3, 0.6)}>
          <circle cx={0} cy={-230} r={28} fill={C.ink} />
          <rect x={-36} y={-195} width={72} height={110} rx={20} fill={C.ink} />
          <rect x={-30} y={-90} width={24} height={90} rx={10} fill={C.ink} />
          <rect x={6} y={-90} width={24} height={90} rx={10} fill={C.ink} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 300, right: 300, top: 100}}>
        <Kinetic words={lineWords('ceiling', 'm5')} size={44} out={c.line('m6').t0 - 0.2} emph={{ceiling: redI, wage: {fontWeight: 600}}} style={{color: C.ink}} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── HORSES ───────────── */
export const Horses: React.FC = () => {
  const t = useT();
  const frame = useCurrentFrame();
  const c = cues('horses');
  const tBy = c.word('m7', 'by');
  const ref = useRef<HTMLCanvasElement>(null);
  const COLS = 50, ROWS = 40, S = 15;
  useEffect(() => {
    const g = ref.current!.getContext('2d')!;
    g.clearRect(0, 0, COLS * S, ROWS * S);
    const r = rng(1915);
    for (let i = 0; i < COLS * ROWS; i++) {
      const x = (i % COLS) * S + S / 2, y = Math.floor(i / COLS) * S + S / 2;
      const appear = prog(t, 0.2 + (i / 2000) * 1.6 + r() * 0.3, 0.3);
      const keep = i % 20 < 3; // 300 of 2000 survive
      const die = keep ? 0 : prog(t, tBy + 0.1 + r() * 1.6, 0.4);
      const a = appear * (1 - die);
      if (a <= 0.01) {
        g.fillStyle = 'rgba(58,54,49,0.5)';
        g.fillRect(x - 0.5, y - 0.5, 1, 1);
        continue;
      }
      g.fillStyle = die > 0 ? `rgba(208,24,47,${a})` : `rgba(236,229,216,${a})`;
      g.beginPath();
      g.arc(x, y, 4.2, 0, Math.PI * 2);
      g.fill();
    }
  }, [frame, t, tBy]);
  const yr = Math.round(interpolate(t, [tBy - 0.2, tBy + 2.4], [1915, 1960], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut}));
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <canvas ref={ref} width={COLS * S} height={ROWS * S} style={{position: 'absolute', left: 1000, top: 200}} />
      <div style={{position: 'absolute', left: 140, top: 230}}>
        <Label at={0}>Horses · United States</Label>
        <div style={{fontFamily: F.serif, fontWeight: 300, fontSize: 200, color: C.ink, lineHeight: 1, marginTop: 10, fontVariantNumeric: 'tabular-nums'}}>{yr}</div>
        <Counter from={20000000} to={3000000} at={tBy} dur={2.4} size={64} color={C.red} style={{marginTop: 18}} />
        <Label at={0.8} size={14} style={{marginTop: 30}}>● = 10,000 horses</Label>
        <div style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 300, fontSize: 25, color: C.dim, width: 720, marginTop: 70, lineHeight: 1.45, opacity: prog(t, 2.6, 0.8)}}>
          “…the role of humans as the most important factor of production is bound to diminish in the same way that the role of horses… was first diminished and then eliminated.”
          <div style={{fontFamily: F.mono, fontStyle: 'normal', fontSize: 14, letterSpacing: '0.18em', marginTop: 14}}>WASSILY LEONTIEF · 1983</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
