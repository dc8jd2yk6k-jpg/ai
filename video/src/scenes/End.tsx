import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Label} from '../components/Type';
import {Thread} from '../components/Thread';
import {TL, prog, useT} from '../lib';
import {C, F, ease} from '../theme';

export const EndCard: React.FC<{dur: number}> = ({dur}) => {
  const t = useT();
  const p = prog(t, 0.6, 1.6);
  const out = prog(t, dur - 1.2, 1.1, ease.inOut);
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', opacity: 1 - out}}>
      <div style={{textAlign: 'center'}}>
        <div style={{fontFamily: F.serif, fontWeight: 300, fontSize: 92, color: C.ink, letterSpacing: '-0.02em', opacity: p, filter: `blur(${(1 - p) * 8}px)`}}>
          A Revolution That <span style={{fontStyle: 'italic', color: C.red}}>No Longer</span> Needs Us
        </div>
        <svg width={900} height={30} style={{marginTop: 10}}>
          <Thread d="M0,15 L430,15 M470,15 L900,15" p={prog(t, 1.2, 1.4, ease.inOut)} len={1000} width={2} />
        </svg>
        <Label at={2} style={{marginTop: 18}}>{TL.date}</Label>
        <Label at={2.6} size={14} style={{marginTop: 46}} color={C.faint}>
          Adapted from the essay · Narration: Kokoro TTS · Score, design &amp; motion: generated in code
        </Label>
      </div>
    </AbsoluteFill>
  );
};
