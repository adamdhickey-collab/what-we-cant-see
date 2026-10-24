// Chapter 4's backdrop: one dim star in a still sky, behind the instrument.
// When the folded signal appears, a planet's silhouette crosses it once,
// drawn as an illustration of what the numbers mean.

import * as THREE from 'three';
import { range, smoothstep } from '../animation/ease';
import { rgb } from '../shaders/palette';
import { pointsGeometry, pointsMaterial } from '../shaders/points';
import { beatStart } from '../content/chapters';
import { createSky } from './sky';

const LOCK = beatStart('faint', 'lock');
import type { Frame, StageScene } from './types';

export function createStar(mobile: boolean): StageScene {
  const sky = createSky(mobile ? 1500 : 3000, 29);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
  const glow = rgb('ivory').map((v, k) => v * 0.85 + rgb('copper')[k] * 0.25);
  const starMat = pointsMaterial();
  const star = new THREE.Points(pointsGeometry(new Float32Array([0, 0, 0, 0, 0, 0]), new Float32Array([...glow, ...glow.map((v) => v * 0.22)]), new Float32Array([30, 220])), starMat);
  const planetMat = pointsMaterial({ blending: THREE.NormalBlending });
  const planet = new THREE.Points(pointsGeometry(new Float32Array(3), new Float32Array(rgb('ink')), new Float32Array([6])), planetMat);
  scene.add(star, planet);
  scene.traverse((o) => (o.frustumCulled = false));

  return {
    id: 'star',
    render(renderer, f: Frame) {
      sky.camera.quaternion.setFromEuler(new THREE.Euler(0.3, f.state.reduced ? 0 : f.elapsed * 0.004, 0));
      sky.follow(sky.camera, f.aspect);
      sky.material.uniforms.uOpacity.value = f.weight * 0.55;
      sky.material.uniforms.uPixelRatio.value = f.pixelRatio;
      renderer.render(sky.scene, sky.camera);

      // The star sits left of the instrument on wide screens, above it on phones.
      const sx = f.mobile ? 0 : -0.3;
      const sy = f.mobile ? 0.62 : 0.36;
      star.position.set(sx, sy, 0);
      // On a phone the instrument fills the top of the screen, so the star steps back.
      starMat.uniforms.uOpacity.value = f.weight * (f.mobile ? 0.25 : 0.9);
      starMat.uniforms.uPixelRatio.value = f.pixelRatio;
      const cross = range(f.local, LOCK, LOCK + 4);
      planet.position.set(sx + (cross - 0.5) * (26 / f.height) * 2.6, sy - 0.002, 0);
      planetMat.uniforms.uOpacity.value = f.weight * smoothstep(0, 0.1, cross) * (1 - smoothstep(0.9, 1, cross));
      planetMat.uniforms.uPixelRatio.value = f.pixelRatio;
      renderer.render(scene, camera);
      return [];
    },
    dispose() {
      sky.dispose();
      star.geometry.dispose();
      planet.geometry.dispose();
      starMat.dispose();
      planetMat.dispose();
    },
  };
}
