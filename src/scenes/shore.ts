import * as THREE from 'three';
import { lerp, range, smoothstep } from '../animation/ease';
import { shoreFragment, shoreVertex } from '../shaders/shore';
import { beatStart, CH, CHAPTERS } from '../content/chapters';
import type { Frame, Label, StageScene } from './types';

// Moments in the two shore chapters, keyed to their lines.
const OPEN = CHAPTERS[CH.shore];
const HORIZON = beatStart('shore', 'horizon');
const LIFT = beatStart('shore', 'lift');
const ANDROMEDA = beatStart('return', 'andromeda');
const LENSES = beatStart('return', 'lenses');
const ALWAYS = beatStart('return', 'always');

export function createShore(): StageScene {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uDusk: { value: 0.2 },
    uLift: { value: 0 },
    uAndromeda: { value: 0 },
    uMotion: { value: 1 },
    uReveal: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: shoreVertex,
    fragmentShader: shoreFragment,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  return {
    id: 'shore',
    render(renderer, f: Frame) {
      const opening = f.chapter === CH.shore;
      const L = f.local;
      const dusk = opening ? lerp(0.15, 0.62, range(L, 0, OPEN.duration)) : 0.72;
      const lift = opening ? smoothstep(LIFT, OPEN.duration - 0.5, L) : 1 - smoothstep(0, 6, L);
      const andromeda = opening ? 0 : smoothstep(ANDROMEDA, ANDROMEDA + 3, L);
      // The seabed is sounded as the horizon is named, and again as the closing names instruments.
      const reveal = opening ? range(L, HORIZON - 0.5, HORIZON + 5.5) : range(L, ALWAYS, ALWAYS + 4.5);
      uniforms.uRes.value.set(f.width * f.pixelRatio, f.height * f.pixelRatio);
      uniforms.uTime.value = f.elapsed;
      uniforms.uOpacity.value = f.weight;
      uniforms.uDusk.value = dusk;
      uniforms.uLift.value = lift;
      uniforms.uAndromeda.value = andromeda;
      uniforms.uReveal.value = reveal;
      uniforms.uMotion.value = f.state.reduced ? 0 : 1;
      renderer.render(scene, camera);

      // Labels sit where the shader draws things, in the same coordinates.
      const labels: Label[] = [];
      const H = 0.42;
      const horizon = opening ? smoothstep(HORIZON - 1, HORIZON + 0.5, L) * (1 - smoothstep(HORIZON + 6.5, HORIZON + 7.5, L)) : 0;
      if (horizon > 0) labels.push({ text: 'Horizon · about 4.7 km', x: f.width * 0.82, y: f.height * (1 - H), opacity: horizon * f.weight, side: 'left' });
      if (andromeda > 0) {
        // The smudge sits at p = (-0.3 * aspect, 0.76), and p.x = (u - 0.5) * aspect, so u = 0.2.
        labels.push({ text: 'Andromeda Galaxy · 2.5 million light-years', x: f.width * 0.2, y: f.height * (1 - 0.76), opacity: andromeda * f.weight * (1 - smoothstep(LENSES - 1.5, LENSES, L)) });
      }
      return labels;
    },
    dispose() {
      material.dispose();
      mesh.geometry.dispose();
    },
  };
}
