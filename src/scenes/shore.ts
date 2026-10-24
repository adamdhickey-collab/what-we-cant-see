import * as THREE from 'three';
import { lerp, range, smoothstep } from '../animation/ease';
import { shoreFragment, shoreVertex } from '../shaders/shore';
import type { Frame, Label, StageScene } from './types';

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
      const opening = f.chapter === 0;
      const L = f.local;
      const dusk = opening ? lerp(0.15, 0.62, range(L, 0, 24)) : 0.72;
      const lift = opening ? smoothstep(17, 23.5, L) : 1 - smoothstep(0, 6, L);
      const andromeda = opening ? 0 : smoothstep(10, 13, L);
      uniforms.uRes.value.set(f.width * f.pixelRatio, f.height * f.pixelRatio);
      uniforms.uTime.value = f.elapsed;
      uniforms.uOpacity.value = f.weight;
      uniforms.uDusk.value = dusk;
      uniforms.uLift.value = lift;
      uniforms.uAndromeda.value = andromeda;
      uniforms.uMotion.value = f.state.reduced ? 0 : 1;
      renderer.render(scene, camera);

      // Labels sit where the shader draws things, in the same coordinates.
      const labels: Label[] = [];
      const H = 0.42;
      const horizon = opening ? smoothstep(11, 12.5, L) * (1 - smoothstep(16.5, 17.5, L)) : 0;
      if (horizon > 0) labels.push({ text: 'Horizon · about 4.7 km', x: f.width * 0.82, y: f.height * (1 - H), opacity: horizon * f.weight, side: 'left' });
      if (andromeda > 0) {
        // The smudge sits at p = (-0.3 * aspect, 0.76), and p.x = (u - 0.5) * aspect, so u = 0.2.
        labels.push({ text: 'Andromeda Galaxy · 2.5 million light-years', x: f.width * 0.2, y: f.height * (1 - 0.76), opacity: andromeda * f.weight * (1 - smoothstep(16.5, 18, L)) });
      }
      return labels;
    },
    dispose() {
      material.dispose();
      mesh.geometry.dispose();
    },
  };
}
