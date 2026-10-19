import React from 'react';
import {AbsoluteFill, Composition, Sequence, continueRender, delayRender} from 'remotion';
import {Flicker, Grain, Vignette} from './components/Atmos';
import {ChapterCard, HUD} from './components/Frame';
import {FPS, TL, XF, prog, useT} from './lib';
import {SCENES} from './scenes';
import {EndCard} from './scenes/End';
import {C, H, W, ease} from './theme';

const FONTS = ['300 64px Fraunces', 'italic 300 64px Fraunces', '600 64px Fraunces', '400 20px "JetBrains Mono"', '700 20px "JetBrains Mono"', '300 20px Inter', '500 20px Inter'];

/** Hold each frame until the webfonts are ready (never longer than 8 s). */
const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [handle] = React.useState(() => delayRender('fonts', {timeoutInMilliseconds: 20000}));
  React.useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    Promise.all(FONTS.map((f) => document.fonts.load(f))).then(finish, finish);
    const id = setTimeout(finish, 8000);
    return () => clearTimeout(id);
  }, [handle]);
  return <>{children}</>;
};

const Fade: React.FC<{dur: number; children: React.ReactNode; first: boolean; last: boolean}> = ({dur, children, first, last}) => {
  const t = useT();
  const i = first ? 1 : prog(t, -XF, XF * 2, ease.inOut);
  const o = last ? 1 : 1 - prog(t, dur - XF, XF * 2, ease.inOut);
  return <AbsoluteFill style={{opacity: Math.min(i, o)}}>{children}</AbsoluteFill>;
};

export const Film: React.FC = () => (
  <FontGate>
  <AbsoluteFill style={{background: C.bg}}>
    {TL.scenes.map((s, i) => {
      const from = Math.round((s.start - XF) * FPS);
      const len = Math.round((s.dur + XF * 2) * FPS);
      const Comp = SCENES[s.id];
      return (
        <Sequence key={s.id} from={from} durationInFrames={len} name={s.id}>
          <Fade dur={s.dur} first={i === 0} last={i === TL.scenes.length - 1}>
            {s.card?.end ? <EndCard dur={s.dur} /> : s.card ? <ChapterCard num={s.card.num!} title={s.card.title!} dur={s.dur} /> : Comp ? <Comp /> : null}
          </Fade>
        </Sequence>
      );
    })}
    <HUD />
    <Vignette />
    <Grain />
    <Flicker />
  </AbsoluteFill>
  </FontGate>
);

export const RemotionRoot: React.FC = () => (
  <Composition id="Film" component={Film} durationInFrames={Math.ceil(TL.total * FPS)} fps={FPS} width={W} height={H} />
);
