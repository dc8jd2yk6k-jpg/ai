import React, {useEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {geoCentroid, geoNaturalEarth1, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import {Kinetic, Label, lineWords} from '../components/Type';
import {Thread} from '../components/Thread';
import {clamp, cues, lerp, prog, rng, useT} from '../lib';
import {C, F, H, W, ease} from '../theme';

const redI = {color: C.red, fontStyle: 'italic'};

const Person: React.FC<{x: number; y: number; s?: number; fill?: string; o?: number}> = ({x, y, s = 1, fill = C.ink, o = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <circle cy={-22} r={7} fill={fill} />
    <rect x={-8} y={-13} width={16} height={22} rx={6} fill={fill} />
  </g>
);

const Sheep: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    {[-10, 0, 10, -5, 5].map((dx, i) => (
      <circle key={i} cx={dx} cy={i < 3 ? -12 : -20} r={9} fill={C.ink} />
    ))}
    <ellipse cx={17} cy={-16} rx={6} ry={5} fill={C.red} />
    <rect x={-10} y={-6} width={3} height={10} fill={C.ink} />
    <rect x={7} y={-6} width={3} height={10} fill={C.ink} />
  </g>
);

/* ───────────── SELLING OFF THE LAST ASSETS ───────────── */
export const Assets: React.FC = () => {
  const t = useT();
  const c = cues('assets');
  const tn2 = c.line('n2').t0;
  const items = [
    {k: 'Savings', at: c.word('n1', 'savings')},
    {k: 'Home', at: c.word('n1', 'home')},
    {k: 'Business', at: c.word('n1', 'business')},
  ];
  const partB = prog(t, tn2 - 0.4, 0.8, ease.inOut);
  const nodeX = 1560, ty = 620;
  const absorbed = items.filter((it) => t > it.at + 1.2).length;
  const tSheep = c.word('n2', 'sheep');
  const tFence = c.word('n2', 'enclosure');
  const tTime = c.word('n2', 'time', 1);
  const fenceOut = prog(t, c.word('n2', 'this') - 0.1, 0.8);
  const clockIn = prog(t, tTime - 0.6, 1);
  const icon = (k: string) =>
    k === 'Savings' ? (
      <g>
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cy={-i * 12} rx={30} ry={9} fill={C.bg} stroke={C.ink} strokeWidth={3} />
        ))}
      </g>
    ) : k === 'Home' ? (
      <path d="M-34,10 L-34,-20 L0,-46 L34,-20 L34,10 Z M-10,10 L-10,-10 L10,-10 L10,10" fill="none" stroke={C.ink} strokeWidth={4} />
    ) : (
      <g fill="none" stroke={C.ink} strokeWidth={4}>
        <rect x={-38} y={-30} width={76} height={40} />
        <path d="M-44,-30 L-34,-46 L34,-46 L44,-30" />
        <rect x={-10} y={-14} width={20} height={24} />
      </g>
    );
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{opacity: 1 - partB}}>
        <svg width={W} height={H}>
          <Thread d={`M120,${ty} L${nodeX},${ty}`} p={prog(t, 0, 1.2)} len={1500} width={2.5} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={nodeX} cy={ty} r={(70 + i * 40 + absorbed * 12) * (1 + Math.sin(t * 2 + i) * 0.02)} fill="none" stroke={i ? C.faint : C.ink} strokeWidth={i ? 1 : 2} />
          ))}
          <circle cx={nodeX} cy={ty} r={56 + absorbed * 10} fill="#000" stroke={C.red} strokeWidth={2} />
          <text x={nodeX} y={ty + 230} textAnchor="middle" fill={C.dim} fontFamily={F.mono} fontSize={15} letterSpacing="0.2em">THOSE ABLE TO REINVEST</text>
          {items.map((it, i) => {
            const appear = prog(t, it.at - 0.5, 0.4);
            const go = prog(t, it.at + 0.1, 1.1, ease.in);
            const x0 = 300 + i * 260;
            const x = lerp(x0, nodeX, go);
            return (
              <g key={it.k} opacity={appear * (1 - prog(t, it.at + 1.0, 0.2))} transform={`translate(${x},${ty - 60 + go * 60}) scale(${1 - go * 0.7})`}>
                {icon(it.k)}
                <text y={60} textAnchor="middle" fill={C.ink} fontFamily={F.mono} fontSize={17} letterSpacing="0.2em">{it.k.toUpperCase()}</text>
                <text y={86} textAnchor="middle" fill={C.red} fontFamily={F.mono} fontSize={14} letterSpacing="0.2em" opacity={prog(t, it.at, 0.3)}>SOLD</text>
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: 140, right: 140, top: 220}}>
          <Kinetic words={lineWords('assets', 'n1').slice(0, 8)} size={56} align="left" emph={{piece: redI}} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: partB}}>
        <svg width={W} height={H}>
          {/* field */}
          {Array.from({length: 48}, (_, i) => {
            const r = rng(i * 13 + 2);
            const x = 260 + (i % 12) * 118 + r() * 30;
            const y = 600 + Math.floor(i / 12) * 90 + r() * 20;
            const flip = prog(t, tSheep - 0.2 + r() * 1.8, 0.3);
            return flip < 0.5 ? <Person key={i} x={x} y={y} o={1 - flip * 2} /> : <Sheep key={i} x={x} y={y} o={(flip - 0.5) * 2} />;
          })}
          {/* fence */}
          <g opacity={prog(t, tFence, 0.5) * (1 - fenceOut)}>
            <rect x={200} y={540} width={1520} height={400} fill="none" stroke={C.dim} strokeWidth={3} strokeDasharray={3840} strokeDashoffset={3840 * (1 - prog(t, tFence, 1.4, ease.inOut))} />
            {Array.from({length: 20}, (_, i) => (
              <line key={i} x1={200 + i * 80} x2={200 + i * 80} y1={525} y2={555} stroke={C.dim} strokeWidth={4} opacity={prog(t, tFence + i * 0.05, 0.2)} />
            ))}
          </g>
          {/* time */}
          <g transform="translate(960,740)" opacity={clockIn}>
            <circle r={330} fill="none" stroke={C.red} strokeWidth={2} strokeDasharray={2074} strokeDashoffset={2074 * (1 - clockIn)} />
            <line y2={-300} stroke={C.red} strokeWidth={3} transform={`rotate(${(t - tTime) * 90})`} />
          </g>
        </svg>
        <div style={{position: 'absolute', left: 140, right: 140, top: 170}}>
          <Label at={tn2}>Thomas More · Utopia · 1516</Label>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 300, fontSize: 64, color: C.ink, marginTop: 16, opacity: prog(t, tSheep - 0.3, 0.6)}}>
            “Your sheep… devour men themselves.”
          </div>
          <div style={{marginTop: 30}}>
            <Kinetic words={lineWords('assets', 'n2').slice(-9)} size={42} align="left" color={C.dim} emph={{time: redI}} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── NO NEW WORLD ───────────── */
type Geo = GeoJSON.FeatureCollection<GeoJSON.Geometry>;
const countries = feature(world as any, (world as any).objects.countries) as unknown as Geo;
const projection = geoNaturalEarth1().fitExtent([[60, 140], [1860, 980]], countries as any);
const path = geoPath(projection);
const shapes = countries.features.map((f) => ({d: path(f as any) ?? '', c: projection(geoCentroid(f as any)) ?? [0, 0], id: String(f.id)}));
const routes = [
  {k: 'India', to: [78, 21] as [number, number], word: 'india'},
  {k: 'China', to: [113.3, 23.1] as [number, number], word: 'china'},
  {k: 'Americas', to: [-74, 40.7] as [number, number], word: 'ocean'},
];
const UK: [number, number] = [-2.2, 53.5];

export const MapScene: React.FC = () => {
  const t = useT();
  const c = cues('map');
  const tn4 = c.line('n4').t0;
  const tn5 = c.line('n5').t0;
  const tAll = c.word('n4', 'everywhere');
  const all = prog(t, tAll - 0.1, 0.6);
  const dimMap = prog(t, tn5 - 0.3, 0.8, ease.inOut);
  const routeD = useMemo(() => routes.map((r) => path({type: 'LineString', coordinates: [UK, r.to]} as any) ?? ''), []);
  const tCheap = c.word('n5', 'cheap');
  const fall = prog(t, c.word('n5', 'worthless') - 0.6, 1.4, ease.in);
  const rungs = ['Wealth', 'Industry', 'Exports', 'Factories', 'Cheap labor'];
  const zoom = 1 + prog(t, 0, c.dur) * 0.05;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{opacity: 1 - dimMap * 0.75, transform: `scale(${zoom})`}}>
        <svg width={W} height={H}>
          <path d={path({type: 'Sphere'} as any) ?? ''} fill="#0f0e0c" stroke={C.line} />
          {shapes.map((s, i) => {
            const r = rng(i + 9);
            const lit = all * (0.6 + 0.4 * Math.sin(t * 6 + r() * 6));
            return <path key={i} d={s.d} fill={lit > 0 ? `rgba(208,24,47,${0.12 + lit * 0.32})` : '#1d1b18'} stroke={lit > 0 ? C.red : '#2c2925'} strokeWidth={0.7} />;
          })}
          {routes.map((r, i) => {
            const at = c.word('n3', r.word) - 0.3;
            return (
              <g key={r.k} opacity={1 - all * 0.6}>
                <Thread d={routeD[i]} p={prog(t, at, 1.4, ease.inOut)} len={2600} width={2.5} />
                <text x={(projection(r.to) ?? [0, 0])[0] + 12} y={(projection(r.to) ?? [0, 0])[1] - 12} fill={C.ink} fontFamily={F.mono} fontSize={16} letterSpacing="0.15em" opacity={prog(t, at + 1.2, 0.4)}>
                  {r.k.toUpperCase()}
                </text>
              </g>
            );
          })}
          {/* the machine arrives everywhere at once */}
          {shapes.map((s, i) => {
            const r = rng(i + 31);
            const p = prog(t, tAll + r() * 0.15, 1.6);
            if (p <= 0 || !s.d) return null;
            return <circle key={i} cx={s.c[0]} cy={s.c[1]} r={4 + p * 40} fill="none" stroke={C.red} strokeWidth={1.5} opacity={(1 - p) * 0.9} />;
          })}
          {shapes.map((s, i) => (s.d && all > 0 ? <circle key={`d${i}`} cx={s.c[0]} cy={s.c[1]} r={2.5} fill="#ffd9d9" opacity={all} /> : null))}
        </svg>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: 150, width: 700, opacity: 1 - prog(t, tn4 - 0.3, 0.4)}}>
        <Label at={0.2}>c. 1840 · Lancashire’s floodgate</Label>
        <Kinetic words={lineWords('map', 'n3').slice(0, 4)} size={46} align="left" style={{marginTop: 14}} emph={{unemployment: redI}} />
        <Label at={c.word('n3', 'india') + 0.8} size={14} style={{marginTop: 18}} color={C.dim}>
          India absorbs &gt;¼ of British cotton cloth exports
        </Label>
      </div>
      <div style={{position: 'absolute', left: 120, top: 150, width: 900, opacity: 1 - prog(t, tn5 - 0.3, 0.4)}}>
        <Kinetic words={lineWords('map', 'n4').slice(0, 8)} size={50} align="left" emph={{ocean: redI}} />
      </div>
      {/* ladder */}
      <AbsoluteFill style={{opacity: dimMap}}>
        <svg width={W} height={H}>
          <line x1={1260} x2={1260} y1={170} y2={890} stroke={C.ink} strokeWidth={6} />
          <line x1={1520} x2={1520} y1={170} y2={890} stroke={C.ink} strokeWidth={6} />
          {rungs.map((k, i) => {
            const y = 250 + i * 150;
            const bottom = i === rungs.length - 1;
            const f = bottom ? fall : 0;
            const crack = bottom ? prog(t, tCheap, 0.4) : 0;
            return (
              <g key={k} transform={`translate(0,${f * 500}) rotate(${f * 24} 1390 ${y})`} opacity={1 - f}>
                <line x1={1260} x2={1520} y1={y} y2={y} stroke={bottom ? C.red : C.ink} strokeWidth={8} strokeDasharray={crack > 0 ? '60 6 90 8 200' : undefined} />
                <text x={1550} y={y + 6} fill={bottom ? C.red : C.dim} fontFamily={F.mono} fontSize={17} letterSpacing="0.18em">{k.toUpperCase()}</text>
              </g>
            );
          })}
          <Person x={1390} y={930} s={1.8} />
        </svg>
        <div style={{position: 'absolute', left: 140, top: 400, width: 900}}>
          <Kinetic words={lineWords('map', 'n5')} size={50} align="left" emph={{worthless: redI, cheap: {fontWeight: 600}}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── THE QUIET END ───────────── */
const Card: React.FC<{x: number; at: number; children: React.ReactNode; t: number}> = ({x, at, children, t}) => {
  const p = prog(t, at - 0.15, 0.7);
  return (
    <div style={{position: 'absolute', left: x, top: 470, width: 500, height: 330, background: '#161513', border: `1px solid ${C.faint}`, borderRadius: 14, padding: 34, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, boxShadow: '0 30px 80px rgba(0,0,0,0.5)', fontFamily: F.sans, color: C.ink}}>
      {children}
    </div>
  );
};

export const Quiet: React.FC = () => {
  const t = useT();
  const c = cues('quiet');
  const te2 = c.line('e2').t0;
  const caret = Math.floor(t * 2) % 2 === 0;
  const mono: React.CSSProperties = {fontFamily: F.mono, fontSize: 13, letterSpacing: '0.18em', color: C.dim, textTransform: 'uppercase'};
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 220}}>
        <Kinetic words={lineWords('quiet', 'e1')} size={58} emph={{quietly: {fontStyle: 'italic', color: C.dim}}} />
      </div>
      <Card x={150} at={c.word('e2', 'posting')} t={t}>
        <div style={mono}>Jobs · search</div>
        <div style={{marginTop: 22, border: `1px solid ${C.faint}`, borderRadius: 8, padding: '14px 16px', fontSize: 22, fontWeight: 300}}>
          entry level analyst{caret ? '|' : ' '}
        </div>
        <div style={{marginTop: 46, fontSize: 64, fontWeight: 300}}>0</div>
        <div style={{...mono, marginTop: 6}}>results · posted this week</div>
      </Card>
      <Card x={710} at={c.word('e2', 'contract')} t={t}>
        <div style={mono}>Inbox · HR Operations</div>
        <div style={{marginTop: 22, fontSize: 24, fontWeight: 500}}>Re: Your contract</div>
        <div style={{marginTop: 18, fontSize: 19, fontWeight: 300, lineHeight: 1.55, color: '#bdb6aa'}}>
          Thank you for your service. We will not be renewing your contract when it expires on 31 December. This role will not be backfilled.
        </div>
      </Card>
      <Card x={1270} at={c.word('e2', 'graduate')} t={t}>
        <div style={mono}>Applications · Class of 2026</div>
        {[
          ['Sent', '312'],
          ['Interviews', '0'],
          ['Offers', '0'],
          ['Status', 'No response'],
        ].map(([k, v], i) => (
          <div key={k} style={{display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${C.line}`, padding: '15px 0', fontSize: 22, fontWeight: 300, marginTop: i ? 0 : 14}}>
            <span style={{color: C.dim}}>{k}</span>
            <span style={{color: i === 3 ? C.red : C.ink}}>{v}</span>
          </div>
        ))}
      </Card>
    </AbsoluteFill>
  );
};

/* ───────────── FINALE: THE CITY ───────────── */
type Bld = {x: number; w: number; h: number; seed: number};
const BLD: Bld[] = (() => {
  const r = rng(2026);
  const out: Bld[] = [];
  let x = -40;
  while (x < W + 40) {
    const w = 50 + r() * 120;
    const mid = 1 - Math.abs(x + w / 2 - W / 2) / (W / 2);
    out.push({x, w, h: Math.min(540, 140 + r() * 220 + mid * mid * 300 + (r() > 0.9 ? 120 : 0)), seed: Math.floor(r() * 1e6)});
    x += w + 4 + r() * 14;
  }
  return out;
})();

export const Final: React.FC = () => {
  const t = useT();
  const frame = useCurrentFrame();
  const c = cues('final');
  const te4 = c.line('e4').t0;
  const te5 = c.line('e5').t0;
  const te6 = c.line('e6').t0;
  const city = prog(t, te4 - 0.6, 2.4, ease.inOut);
  const snapAt = c.line('e6').t1 + 0.35;
  const snap = prog(t, snapAt, 1.6, ease.out);
  const ref = useRef<HTMLCanvasElement>(null);
  const ground = 900;
  useEffect(() => {
    const g = ref.current!.getContext('2d')!;
    g.clearRect(0, 0, W, H);
    const sky = g.createLinearGradient(0, 0, 0, ground);
    sky.addColorStop(0, '#05070c');
    sky.addColorStop(0.7, '#141019');
    sky.addColorStop(1, '#3a1e14');
    g.fillStyle = sky;
    g.fillRect(0, 0, W, ground);
    // far layer
    for (const b of BLD) {
      const r = rng(b.seed + 7);
      const fx = b.x * 0.9 + 60, fh = b.h * 0.65, fw = b.w * 0.8;
      g.fillStyle = '#0d0c12';
      g.fillRect(fx, ground - fh - 60, fw, fh + 60);
      for (let y = ground - fh - 50; y < ground; y += 10)
        for (let x = fx + 4; x < fx + fw - 4; x += 8) if (r() > 0.55) {
          g.fillStyle = `rgba(241,194,122,${0.25 + r() * 0.3})`;
          g.fillRect(x, y, 3, 4);
        }
    }
    // near layer
    for (const b of BLD) {
      const r = rng(b.seed);
      const top = ground - b.h;
      g.fillStyle = '#0a0a0e';
      g.fillRect(b.x, top, b.w, b.h);
      if (r() > 0.7) {
        g.fillStyle = '#0a0a0e';
        g.fillRect(b.x + b.w / 2 - 2, top - 70, 4, 70);
        g.fillStyle = Math.sin(t * 3 + b.seed) > 0 ? C.red : '#3a0a10';
        g.beginPath();
        g.arc(b.x + b.w / 2, top - 72, 4, 0, Math.PI * 2);
        g.fill();
      }
      for (let y = top + 10; y < ground - 8; y += 16)
        for (let x = b.x + 7; x < b.x + b.w - 10; x += 13) {
          const v = r();
          const flick = Math.sin(t * (0.5 + v * 2) + v * 100) > -0.85;
          if (v > 0.32 && flick) {
            const warm = v > 0.93 ? '255,250,240' : v > 0.6 ? '241,194,122' : '255,214,150';
            g.fillStyle = `rgba(${warm},${0.55 + v * 0.45})`;
            g.fillRect(x, y, 7, 9);
          }
        }
    }
    // reflections
    const refl = g.createLinearGradient(0, ground, 0, H);
    refl.addColorStop(0, 'rgba(241,160,90,0.22)');
    refl.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = '#050505';
    g.fillRect(0, ground, W, H - ground);
    g.fillStyle = refl;
    g.fillRect(0, ground, W, H - ground);
    // traffic: autonomous streams, no one inside
    for (let i = 0; i < 70; i++) {
      const r = rng(i * 991);
      const lane = i % 2;
      const sp = 120 + r() * 160;
      const x = lane ? (r() * W + t * sp) % (W + 100) - 50 : W - ((r() * W + t * sp) % (W + 100)) + 50;
      g.fillStyle = lane ? 'rgba(255,240,220,0.9)' : 'rgba(255,60,60,0.85)';
      g.fillRect(x, ground + 18 + lane * 14, 10, 2.5);
    }
  }, [frame, t]);
  const push = 1.12 - city * 0.12 + prog(t, te4, c.dur - te4) * 0.06;
  const halfL = `M-20,990 L${960 - snap * 40},${990 + snap * snap * 60}`;
  const halfR = `M${960 + snap * 40},${990 + snap * snap * 70} L1940,990`;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: city, transform: `scale(${push})`, transformOrigin: '50% 80%'}}>
        <canvas ref={ref} width={W} height={H} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 50% 85%, rgba(241,170,90,0.18), rgba(0,0,0,0) 70%)'}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 28%, rgba(0,0,0,0) 45%)'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420}}>
        <Kinetic words={lineWords('final', 'e3').slice(0, 5)} size={60} out={c.line('e3').t0 + 2.2} emph={{craft: {fontStyle: 'italic'}}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420}}>
        <Kinetic words={lineWords('final', 'e3').slice(5)} size={60} out={te4 - 0.4} emph={{place: redI}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150}}>
        <Kinetic words={lineWords('final', 'e4')} size={52} out={te5 - 0.3} emph={{dazzling: {fontStyle: 'italic', color: C.gold}}} style={{textShadow: '0 4px 30px #000'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150}}>
        <Kinetic words={lineWords('final', 'e5')} size={64} out={te6 - 0.3} emph={{flawlessly: {fontStyle: 'italic'}}} style={{textShadow: '0 4px 30px #000'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150}}>
        <Kinetic words={lineWords('final', 'e6')} size={64} emph={{single: redI, belong: redI}} style={{textShadow: '0 4px 30px #000'}} />
      </div>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <Thread d={snap > 0 ? halfL : 'M-20,990 L1940,990'} width={3} len={2200} p={prog(t, te5, 1.6, ease.inOut)} glow={1.4} />
        {snap > 0 && <Thread d={halfR} width={3} len={2200} glow={1.4} />}
        {snap > 0 && snap < 0.5 && <circle cx={960} cy={990} r={40 * snap * 2} fill="none" stroke="#fff" strokeWidth={2} opacity={1 - snap * 2} />}
      </svg>
    </AbsoluteFill>
  );
};
