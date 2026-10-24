import type * as THREE from 'three';
import type { DirectorState } from '../animation/director';
import type { SceneId } from '../content/chapters';

export interface Frame {
  /** The director's clock, held to each line's composition under reduced motion. */
  t: number;
  dt: number;
  /** Wall-clock seconds since the stage started, for ambient motion. */
  elapsed: number;
  /** How present this scene is, 0..1, across a crossfade. */
  weight: number;
  /** Which chapter this scene is drawing, and seconds into it. */
  chapter: number;
  local: number;
  /** log10 of the width in view, in meters. */
  scale: number;
  width: number;
  height: number;
  aspect: number;
  pixelRatio: number;
  mobile: boolean;
  /** Accumulated drag, in radians. */
  drag: { x: number; y: number };
  state: DirectorState;
}

export interface Label {
  text: string;
  x: number;
  y: number;
  opacity: number;
  /** Which side of the anchor the text sits on. */
  side?: 'left' | 'right';
}

export interface StageScene {
  id: SceneId;
  render(renderer: THREE.WebGLRenderer, f: Frame): Label[];
  dispose(): void;
}
