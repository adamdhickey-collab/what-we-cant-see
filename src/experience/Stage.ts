// One renderer, one loop, every scene. Each scene is drawn only while its
// chapters are on screen, and crossfades with its neighbors by weight: the
// shore paints first and opaquely, the point scenes add light over it.

import * as THREE from 'three';
import { director } from '../animation/director';
import { smoothstep } from '../animation/ease';
import { CHAPTERS, STARTS, TOTAL, heldTime, scaleAt, type SceneId } from '../content/chapters';
import { INK_HEX } from '../shaders/palette';
import { createCosmos } from '../scenes/cosmos';
import { createShore } from '../scenes/shore';
import { createStar } from '../scenes/star';
import type { Frame, Label, StageScene } from '../scenes/types';
import { createWeb } from '../scenes/web';
import { createWithin } from '../scenes/within';

const FADE = 1.6;
const ORDER: SceneId[] = ['shore', 'cosmos', 'web', 'star', 'within'];

export class Stage {
  private renderer: THREE.WebGLRenderer;
  private scenes: StageScene[];
  private raf = 0;
  private last = 0;
  private elapsed = 0;
  private drag = { x: 0, y: 0, vx: 0, vy: 0, down: false, px: 0, py: 0 };
  private labelEls: HTMLElement[] = [];
  private mobile: boolean;
  private windows: Record<SceneId, number[]>;

  static create(canvas: HTMLCanvasElement, labels: HTMLElement): Stage | null {
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
      if (!renderer.getContext()) return null;
      return new Stage(renderer, canvas, labels);
    } catch {
      return null;
    }
  }

  private constructor(renderer: THREE.WebGLRenderer, private canvas: HTMLCanvasElement, private labelLayer: HTMLElement) {
    this.renderer = renderer;
    this.mobile = matchMedia('(max-width: 767px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
    renderer.autoClear = false;
    renderer.setClearColor(INK_HEX, 1);
    this.scenes = [createShore(), createCosmos(this.mobile), createWeb(this.mobile), createStar(this.mobile), createWithin(this.mobile)];
    this.windows = Object.fromEntries(ORDER.map((id) => [id, CHAPTERS.flatMap((c, i) => (c.scene === id ? [i] : []))])) as Record<SceneId, number[]>;
    this.resize();
    window.addEventListener('resize', this.resize);
    canvas.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    this.raf = requestAnimationFrame(this.loop);
  }

  private resize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.mobile ? 1.5 : 2));
    this.renderer.setSize(w, h, false);
  };

  private onDown = (e: PointerEvent) => {
    Object.assign(this.drag, { down: true, px: e.clientX, py: e.clientY });
  };
  private onMove = (e: PointerEvent) => {
    if (!this.drag.down) return;
    const dx = (e.clientX - this.drag.px) / window.innerWidth;
    const dy = (e.clientY - this.drag.py) / window.innerHeight;
    this.drag.vx = dx * 4;
    this.drag.vy = dy * 2.4;
    this.drag.x += this.drag.vx;
    this.drag.y = Math.max(-1.2, Math.min(1.2, this.drag.y + this.drag.vy));
    this.drag.px = e.clientX;
    this.drag.py = e.clientY;
  };
  private onUp = () => {
    this.drag.down = false;
  };

  /** Presence of a scene, and which of its chapters it is drawing. */
  private weigh(id: SceneId, t: number) {
    let best = { weight: 0, chapter: 0 };
    for (const i of this.windows[id]) {
      const start = STARTS[i], end = start + CHAPTERS[i].duration;
      const fadeIn = start === 0 ? 1 : smoothstep(start - FADE, start + FADE, t);
      const fadeOut = end >= TOTAL ? 1 : 1 - smoothstep(end - FADE, end + FADE, t);
      const weight = fadeIn * fadeOut;
      if (weight > best.weight) best = { weight, chapter: i };
    }
    return best;
  }

  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.last ? (now - this.last) / 1000 : 0.016);
    this.last = now;
    this.elapsed += dt;
    director.tick(dt);
    const state = director.get();
    if (!this.drag.down) {
      this.drag.x += this.drag.vx;
      this.drag.vx *= 0.92;
      this.drag.vy = 0;
    }

    const t = heldTime(state.t, state.reduced);
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.clear();
    const labels: Label[] = [];
    for (const scene of this.scenes) {
      const { weight, chapter } = this.weigh(scene.id, t);
      if (weight < 0.002) continue;
      const frame: Frame = {
        t,
        dt,
        elapsed: this.elapsed,
        weight,
        chapter,
        local: t - STARTS[chapter],
        // Across a crossfade, each scene keeps the scale of its own chapter.
        scale: scaleAt(Math.max(STARTS[chapter], Math.min(STARTS[chapter] + CHAPTERS[chapter].duration - 1e-3, t))),
        width: w,
        height: h,
        aspect: w / h,
        pixelRatio: this.renderer.getPixelRatio(),
        mobile: this.mobile,
        drag: this.drag,
        state,
      };
      labels.push(...scene.render(this.renderer, frame));
    }
    this.drawLabels(labels);
  };

  private drawLabels(labels: Label[]) {
    while (this.labelEls.length < labels.length) {
      const el = document.createElement('div');
      el.className = 'stage-label';
      el.innerHTML = '<span class="stage-label-dot"></span><span class="stage-label-text"></span>';
      this.labelLayer.appendChild(el);
      this.labelEls.push(el);
    }
    this.labelEls.forEach((el, i) => {
      const l = labels[i];
      if (!l) {
        el.style.opacity = '0';
        return;
      }
      el.style.opacity = String(l.opacity);
      el.style.transform = `translate(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px)`;
      // Text that would run off the right edge flips to the anchor's left.
      el.dataset.side = l.side ?? (l.x > window.innerWidth * 0.6 ? 'left' : 'right');
      const text = el.lastElementChild as HTMLElement;
      if (text.textContent !== l.text) text.textContent = l.text;
    });
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    this.canvas.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    this.scenes.forEach((s) => s.dispose());
    this.renderer.dispose();
    this.labelEls.forEach((el) => el.remove());
  }
}
