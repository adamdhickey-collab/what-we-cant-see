// The last chapter's lenses: the same shore through other eyes, one line of
// the script each, changing by themselves as the narration moves on. A separate
// full-screen pass over the shore, so the shore's own shader stays one
// picture. Each lens is a field drawn where the shore shader draws things:
// the person on the rock, the horizon at 42%, the sun just under it.
//
// What the lenses show is real (bodies glow in infrared, neutrinos cross the
// planet, the air is full of radio); how each is drawn is illustrative, and
// the sources say so.

import * as THREE from 'three';
import { CH, CHAPTERS, beatIndexAt } from '../content/chapters';
import type { LensId } from '../content/extras';
import { PALETTE_GLSL } from '../shaders/palette';
import type { Frame, Label, StageScene } from './types';

const fragment = /* glsl */ `
  precision highp float;
  ${PALETTE_GLSL}
  uniform vec2 uRes;
  uniform float uTime, uMotion, uOpacity, uIR, uRadio, uNu, uMag, uDark;
  varying vec2 vUv;
  const float H = 0.42;

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  float landY(float x) { return 0.115 + 0.11 * smoothstep(0.3, 1.05, x); }

  // Composite a layer over what is there, in premultiplied color.
  vec4 over(vec4 dst, vec3 rgb, float a) { return vec4(rgb * a + dst.rgb * (1.0 - a), a + dst.a * (1.0 - a)); }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
    float t = uTime * uMotion;
    vec2 body = vec2(0.1 * aspect + 0.012, 0.225);
    float land = 1.0 - step(landY(uv.x), uv.y);
    vec4 acc = vec4(0.0);

    // Infrared: the scene by warmth. The person brightest, the rock and the
    // ground still warm from the day, the sea cooler, the sky coldest.
    if (uIR > 0.001) {
      // A seated figure is taller than it is wide.
      vec2 e = (p - body) / vec2(0.026, 0.042);
      float heat = 0.03 + 0.08 * (1.0 - smoothstep(H, 1.0, uv.y));
      if (uv.y < H) heat = 0.16 + 0.04 * fbm(p * vec2(8.0, 30.0) + t * 0.05);
      heat = mix(heat, 0.3 + 0.06 * fbm(p * 30.0), land);
      heat += 0.85 * exp(-dot(e, e) * 1.1) + 0.25 * exp(-length(e) * 0.8);
      vec3 ramp = heat < 0.3 ? mix(INK, VIOLET * 0.7, heat / 0.3) : heat < 0.6 ? mix(VIOLET * 0.7, COPPER, (heat - 0.3) / 0.3) : mix(COPPER, IVORY, clamp((heat - 0.6) / 0.4, 0.0, 1.0));
      acc = over(acc, ramp, 0.94 * uIR);
    }

    // Radio: the phone in a pocket and a distant mast, each sending rings
    // out through the air, over a faint hiss from every direction.
    if (uRadio > 0.001) {
      acc = over(acc, INK, 0.45 * uRadio);
      float r1 = length(p - body);
      float w1 = fract(r1 * 7.0 - t * 0.9);
      float ring1 = (smoothstep(0.0, 0.02, w1) - smoothstep(0.02, 0.07, w1)) * exp(-r1 * 2.2);
      vec2 mast = vec2(0.46 * aspect, H + 0.02);
      float r2 = length(p - mast);
      float w2 = fract(r2 * 3.5 - t * 0.5);
      float ring2 = (smoothstep(0.0, 0.015, w2) - smoothstep(0.015, 0.05, w2)) * exp(-r2 * 1.2);
      float hiss = step(0.82, hash(floor(gl_FragCoord.xy / 2.0) + floor(t * 12.0))) * smoothstep(H, H + 0.2, uv.y);
      acc = over(acc, IVORY, clamp(ring1 * 0.8 + ring2 * 0.6, 0.0, 1.0) * uRadio);
      acc = over(acc, VIOLET, hiss * 0.22 * uRadio);
    }

    // Neutrinos: fine streaks rising from the sun below the horizon, through
    // the sea, the ground and the person alike.
    if (uNu > 0.001) {
      acc = over(acc, INK, 0.3 * uNu);
      vec2 dir = normalize(vec2(-0.35, 1.0));
      vec2 q = vec2(dot(p, dir), dot(p, vec2(dir.y, -dir.x)));
      float lane = floor(q.y * 160.0);
      float rnd = hash(vec2(lane, 7.0));
      float along = fract(q.x * (0.8 + rnd) - t * (0.45 + rnd * 0.6) + rnd * 13.0);
      float thin = 1.0 - smoothstep(0.08, 0.32, abs(fract(q.y * 160.0) - 0.5));
      float streak = thin * smoothstep(0.0, 0.02, along) * (1.0 - smoothstep(0.02, 0.16, along)) * step(0.72, rnd);
      acc = over(acc, mix(IVORY, TEAL, 0.4), streak * 0.85 * uNu);
    }

    // The magnetic field: arcs over the sky, with a slow flow along them.
    if (uMag > 0.001) {
      vec2 c = vec2(-0.1 * aspect, -1.6);
      vec2 d = (p - c) * vec2(0.62, 1.0);
      float r = length(d);
      float lines = 1.0 - smoothstep(0.0, 0.05, abs(fract(r * 11.0) - 0.5) - 0.44);
      float ang = atan(d.y, d.x);
      float flow = 0.55 + 0.45 * sin(ang * 60.0 - t * 1.5 + floor(r * 11.0) * 2.0);
      float sky = smoothstep(H - 0.02, H + 0.08, uv.y);
      acc = over(acc, mix(TEAL, VIOLET, 0.5), lines * flow * 0.55 * sky * uMag);
    }

    // Dark matter: a slow violet drift through everything.
    if (uDark > 0.001) {
      float n = fbm(p * 2.2 + vec2(t * 0.03, -t * 0.02));
      float g = fbm(p * 9.0 - vec2(t * 0.05, 0.0));
      acc = over(acc, VIOLET * 1.1, smoothstep(0.42, 0.78, n) * (0.25 + 0.35 * g) * uDark);
    }

    if (acc.a < 0.002) discard;
    gl_FragColor = vec4(acc.rgb / acc.a, acc.a * uOpacity);
  }
`;

const ORDER: LensId[] = ['infrared', 'radio', 'neutrinos', 'magnetic', 'dark'];
const UNIFORM: Record<LensId, string> = { infrared: 'uIR', radio: 'uRadio', neutrinos: 'uNu', magnetic: 'uMag', dark: 'uDark' };

export function createLenses(): StageScene {
  const uniforms: Record<string, THREE.IUniform> = {
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uMotion: { value: 1 },
    uOpacity: { value: 1 },
    uIR: { value: 0 },
    uRadio: { value: 0 },
    uNu: { value: 0 },
    uMag: { value: 0 },
    uDark: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: fragment,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return {
    // Weighted with the shore, drawn over it.
    id: 'shore',
    render(renderer, f: Frame) {
      const c = CHAPTERS[CH.return];
      const on = f.chapter === CH.return ? (c.beats[beatIndexAt(c, f.local)].lens ?? null) : null;
      let any = 0;
      for (const id of ORDER) {
        const u = uniforms[UNIFORM[id]];
        const target = on === id ? 1 : 0;
        // A slow dissolve from one way of seeing to the next.
        u.value = f.state.reduced ? target : u.value + (target - u.value) * Math.min(1, f.dt * 1.5);
        any = Math.max(any, u.value);
      }
      if (any < 0.002) return [];
      uniforms.uRes.value.set(f.width * f.pixelRatio, f.height * f.pixelRatio);
      uniforms.uTime.value = f.elapsed;
      uniforms.uMotion.value = f.state.reduced ? 0 : 1;
      uniforms.uOpacity.value = f.weight;
      renderer.render(scene, camera);

      const at = (x: number, y: number) => ({ x: (x / f.aspect + 0.5) * f.width, y: (1 - y) * f.height });
      const labels: Label[] = [];
      const ir = uniforms.uIR.value as number;
      const nu = uniforms.uNu.value as number;
      if (ir > 0.05) labels.push({ text: 'You · about 34 °C at the skin', ...at(0.1 * f.aspect + 0.03, 0.29), opacity: ir * f.weight });
      if (nu > 0.05) labels.push({ text: 'From the Sun, through the Earth', ...at(0.3 * f.aspect, 0.08), opacity: nu * f.weight, side: 'left' });
      return labels;
    },
    dispose() {
      material.dispose();
      mesh.geometry.dispose();
    },
  };
}
