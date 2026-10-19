import React from 'react';
import {Chasm, Cold, Rail, Weave} from './Act1';
import {Ceiling, Horses, Machine, Tug} from './Act2';
import {Boat, Curse, Famine, Sen, Weapons} from './Act3';
import {Assets, Final, MapScene, Quiet} from './Act4';

export const SCENES: Record<string, React.FC> = {
  cold: Cold,
  weave: Weave,
  chasm: Chasm,
  rail: Rail,
  machine: Machine,
  tug: Tug,
  ceiling: Ceiling,
  horses: Horses,
  famine: Famine,
  sen: Sen,
  boat: Boat,
  curse: Curse,
  weapons: Weapons,
  assets: Assets,
  map: MapScene,
  quiet: Quiet,
  final: Final,
};
