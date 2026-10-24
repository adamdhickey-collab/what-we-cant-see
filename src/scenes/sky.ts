// A sky of stars at infinity: drawn with a camera that only turns, so it
// never parallaxes. It can begin as a row of points along the shore's
// horizon and rise into place, which is how Chapter 2 opens.

import * as THREE from 'three';
import { rng } from '../animation/ease';
import { rgb } from '../shaders/palette';
import { pointsGeometry, pointsMaterial } from '../shaders/points';

export function createSky(count: number, seed = 11) {
  const r = rng(seed);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const line = new Float32Array(count);
  const ivory = rgb('ivory');
  const violet = rgb('violet');
  for (let i = 0; i < count; i++) {
    const u = r.next() * 2 - 1;
    const th = r.next() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    pos.set([s * Math.cos(th), u, s * Math.sin(th)], i * 3);
    const tint = r.next() < 0.18 ? violet : ivory;
    const b = 0.35 + 0.65 * Math.pow(r.next(), 3);
    col.set([tint[0] * b, tint[1] * b, tint[2] * b], i * 3);
    size[i] = 0.8 + 2.4 * Math.pow(r.next(), 6);
    line[i] = r.next() * 2 - 1;
  }
  const material = pointsMaterial({
    decls: 'attribute float aLine; uniform float uRise, uTan, uAspect;',
    uniforms: { uRise: { value: 1 }, uTan: { value: Math.tan((50 * Math.PI) / 360) }, uAspect: { value: 1 } },
    // The shore's horizon sits at 42% of the frame's height, which is NDC y = -0.16.
    view: /* glsl */ `
      vec3 onLine = vec3(aLine * uTan * uAspect * 0.9, -0.16 * uTan * 0.9, -0.9);
      float k = smoothstep(0.0, 1.0, clamp(uRise * 1.4 - (aLine * 0.5 + 0.5) * 0.4, 0.0, 1.0));
      mv.xyz = mix(onLine, mv.xyz, k);
    `,
  });
  material.uniforms.uSize.value = 1.4;
  const points = new THREE.Points(pointsGeometry(pos, col, size, { aLine: [line, 1] }), material);
  points.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(points);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 10);
  return {
    scene,
    camera,
    material,
    /** Copy another camera's orientation, never its position. */
    follow(src: THREE.Camera, aspect: number) {
      camera.quaternion.copy(src.quaternion);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      material.uniforms.uAspect.value = aspect;
    },
    dispose() {
      points.geometry.dispose();
      material.dispose();
    },
  };
}
