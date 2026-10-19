import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from './timeline.json';
import {ease} from './theme';

export type Word = {w: string; t: number};
export type Line = {id: string; text: string; start: number; dur: number; words: Word[]};
export type Scene = {id: string; start: number; dur: number; lines?: Line[]; card?: {num?: string; title?: string; end?: boolean}};

export const TL = timeline as {fps: number; total: number; title: string; date: string; scenes: Scene[]};
export const FPS = TL.fps;
export const XF = 0.45; // cross-dissolve overlap (s)

export const sceneById = (id: string) => {
  const s = TL.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`no scene ${id}`);
  return s;
};

/** Seconds since the scene started (scene sequences begin XF early). */
export const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps - XF;
};

/** Helpers bound to a scene: local start time of a line / word. */
export const cues = (id: string) => {
  const s = sceneById(id);
  const line = (lid: string) => {
    const l = s.lines?.find((x) => x.id === lid);
    if (!l) throw new Error(`no line ${lid}`);
    return {...l, t0: l.start - s.start, t1: l.start - s.start + l.dur};
  };
  /** local time of the first word in line `lid` that starts with `prefix` */
  const word = (lid: string, prefix: string, nth = 0) => {
    const l = line(lid);
    const hits = l.words.filter((w) => w.w.replace(/[^\w']/g, '').toLowerCase().startsWith(prefix.toLowerCase()));
    const hit = hits[nth] ?? hits[0];
    if (!hit) throw new Error(`no word ${prefix} in ${lid}`);
    return hit.t - s.start;
  };
  return {scene: s, dur: s.dur, line, word};
};

/** 0→1 progress over [a, a+d] with easing. */
export const prog = (t: number, a: number, d: number, e = ease.out) =>
  interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Deterministic PRNG (mulberry32 over a hashed seed, so nearby seeds decorrelate). */
export const rng = (seed: number) => {
  let a = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) ^ 0xc2b2ae35;
  a = Math.imul(a ^ (a >>> 16), 0x27d4eb2d);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
