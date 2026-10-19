import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {rng} from '../lib';

/** Film grain: pre-baked noise tiles, re-offset every frame. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const f = useCurrentFrame();
  const r = rng(f * 7919 + 13);
  const idx = Math.floor(r() * 6);
  const x = -Math.floor(r() * 320);
  const y = -Math.floor(r() * 320);
  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 2560,
          height: 1600,
          backgroundImage: `url(${staticFile(`grain/g${idx}.png`)})`,
          backgroundSize: '640px 640px',
          imageRendering: 'pixelated',
        }}
      />
      <Img src={staticFile(`grain/g${idx}.png`)} style={{display: 'none'}} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.75}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** Gentle flicker in exposure, like projected film. */
export const Flicker: React.FC = () => {
  const f = useCurrentFrame();
  const r = rng(f * 104729 + 1);
  return <AbsoluteFill style={{pointerEvents: 'none', background: '#000', opacity: 0.025 + r() * 0.03}} />;
};
