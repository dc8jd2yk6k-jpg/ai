import {Easing} from 'remotion';
import '@fontsource/fraunces/300.css';
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/300-italic.css';
import '@fontsource/fraunces/400-italic.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';

export const W = 1920;
export const H = 1080;

export const C = {
  bg: '#0b0a09',
  paper: '#14120f',
  ink: '#ece5d8',
  dim: '#8a8378',
  faint: '#3a3631',
  line: '#26231f',
  red: '#d0182f',
  redDeep: '#7a0c1a',
  gold: '#f1c27a',
  cold: '#9fb3c8',
};

export const F = {
  serif: '"Fraunces", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  sans: '"Inter", Helvetica, sans-serif',
};

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
};
