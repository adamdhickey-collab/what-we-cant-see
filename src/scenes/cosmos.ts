// Chapter 2: from the horizon to the galaxy, in one continuous pull-back.
// Everything is placed in astronomical units at true ratios, and the camera's
// distance is computed from the same scale value the navigator shows, so the
// picture and the number cannot disagree. Float32 precision holds because the
// camera always frames the thing it is near: Earth at the origin while Earth
// fills the view, the galaxy's billions of AU only once it is the subject.

import * as THREE from 'three';
import { lerp, range, rng, smoothstep } from '../animation/ease';
import { rgb } from '../shaders/palette';
import { lineMaterial, pointsGeometry, pointsMaterial } from '../shaders/points';
import { galaxyPoints } from './galaxy';
import { createSky } from './sky';
import type { Frame, Label, StageScene } from './types';
import { distanceFor, labelAt, orbit, present } from './util';

const AU = 149_597_870_700;
const AU_PER_LY = 63_241.077;
const EARTH_R = 6_371_000 / AU;
const PLANETS: [string, number][] = [
  ['Mercury', 0.387], ['Venus', 0.723], ['Earth', 1], ['Mars', 1.524],
  ['Jupiter', 5.203], ['Saturn', 9.537], ['Uranus', 19.19], ['Neptune', 30.07],
];

export function createCosmos(mobile: boolean): StageScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 1e-9, 1e12);
  const sky = createSky(mobile ? 3000 : 6000);
  const sun = new THREE.Vector3(-1, 0, 0);
  const r = rng(3);

  // Earth: a sphere of points lit from the Sun's side.
  const eN = mobile ? 2500 : 5000;
  const ePos = new Float32Array(eN * 3), eCol = new Float32Array(eN * 3), eSize = new Float32Array(eN);
  const ivory = rgb('ivory'), slate = rgb('slate'), teal = rgb('teal');
  for (let i = 0; i < eN; i++) {
    const u = r.next() * 2 - 1, th = r.next() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const n = [s * Math.cos(th), u, s * Math.sin(th)];
    ePos.set(n.map((c) => c * EARTH_R), i * 3);
    const lit = Math.max(0, -n[0]);
    const c = lit > 0.02 ? ivory.map((v, k) => v * (0.15 + 0.75 * lit) + teal[k] * 0.08) : slate.map((v) => v * 0.9);
    eCol.set(c, i * 3);
    eSize[i] = 1.1 + r.next() * 0.6;
  }
  const earthMat = pointsMaterial();
  earthMat.uniforms.uSize.value = 1.3;
  const earth = new THREE.Points(pointsGeometry(ePos, eCol, eSize), earthMat);
  scene.add(earth);

  // The Sun and the planets as single points; their orbits as fine circles.
  const bodies = new Float32Array((PLANETS.length + 1) * 3);
  const bCol = new Float32Array((PLANETS.length + 1) * 3);
  const bSize = new Float32Array(PLANETS.length + 1);
  const planetPos: THREE.Vector3[] = [];
  bodies.set([sun.x, sun.y, sun.z], 0);
  bCol.set(rgb('ivory').map((v, k) => v * 0.8 + rgb('copper')[k] * 0.4), 0);
  bSize[0] = 14;
  const orbitMat = lineMaterial(rgb('ivory'), 0.3);
  const orbits = new THREE.Group();
  PLANETS.forEach(([name, a], i) => {
    const ang = name === 'Earth' ? 0 : r.next() * Math.PI * 2;
    const p = new THREE.Vector3(sun.x + a * Math.cos(ang), 0, sun.z + a * Math.sin(ang));
    planetPos.push(p);
    bodies.set([p.x, p.y, p.z], (i + 1) * 3);
    bCol.set(rgb('ivory').map((v) => v * 0.7), (i + 1) * 3);
    bSize[i + 1] = 2.2;
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 256; k++) {
      const q = (k / 256) * Math.PI * 2;
      pts.push(new THREE.Vector3(sun.x + a * Math.cos(q), 0, sun.z + a * Math.sin(q)));
    }
    orbits.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), orbitMat));
  });
  orbits.children.forEach((o) => (o.frustumCulled = false));
  scene.add(orbits);
  const bodyMat = pointsMaterial();
  const bodiesPts = new THREE.Points(pointsGeometry(bodies, bCol, bSize), bodyMat);
  scene.add(bodiesPts);

  // Proxima Centauri, in a fixed direction, at its true distance.
  const proxima = new THREE.Vector3(-0.55, 0.35, -0.76).normalize().multiplyScalar(4.24 * AU_PER_LY).add(sun);
  const pxMat = pointsMaterial();
  const pxPts = new THREE.Points(pointsGeometry(new Float32Array([proxima.x, proxima.y, proxima.z]), new Float32Array(rgb('ivory')), new Float32Array([5])), pxMat);
  scene.add(pxPts);

  // The galaxy, in AU, with the Sun 26,000 light-years from its core.
  const g = galaxyPoints(mobile ? 50_000 : 120_000);
  const KLY = 1000 * AU_PER_LY;
  const center = new THREE.Vector3(sun.x - 26 * KLY, 0, sun.z);
  for (let i = 0; i < g.pos.length; i += 3) {
    g.pos[i] = g.pos[i] * KLY + center.x;
    g.pos[i + 1] *= KLY;
    g.pos[i + 2] = g.pos[i + 2] * KLY + center.z;
  }
  const galMat = pointsMaterial();
  galMat.uniforms.uSize.value = 1.25;
  const galaxy = new THREE.Points(pointsGeometry(g.pos, g.col, g.size), galMat);
  scene.add(galaxy);
  scene.traverse((o) => (o.frustumCulled = false));

  const target = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  return {
    id: 'cosmos',
    render(renderer, f: Frame) {
      const s = f.scale;
      const w = f.weight;
      const D = distanceFor(s, AU, 50, f.aspect);

      // Where the camera looks: Earth, then the Sun, then most of the way to the core.
      target.set(0, 0, 0).lerp(sun, smoothstep(8.6, 11.4, s));
      target.lerp(tmp.copy(center).multiplyScalar(0.82), smoothstep(17.2, 20.6, s));
      const ambient = f.state.reduced ? 0 : f.elapsed * 0.012;
      const az = 0.6 + ambient + f.drag.x;
      const el = lerp(lerp(0.1, 0.42, smoothstep(8.5, 12.5, s)), 1.0, smoothstep(17, 20.5, s)) + f.drag.y * 0.4;
      camera.aspect = f.aspect;
      orbit(camera, target, D, az, Math.max(-1.4, Math.min(1.45, el)));

      const rise = range(f.local, 0.2, 5.5);
      sky.follow(camera, f.aspect);
      sky.material.uniforms.uRise.value = f.state.reduced ? 1 : rise;
      sky.material.uniforms.uOpacity.value = w * (1 - smoothstep(18.5, 20.5, s));
      sky.material.uniforms.uPixelRatio.value = f.pixelRatio;
      renderer.render(sky.scene, sky.camera);

      const earthA = smoothstep(7.0, 7.45, s) * (1 - smoothstep(9.2, 10.2, s));
      earthMat.uniforms.uOpacity.value = w * earthA;
      earthMat.uniforms.uSize.value = f.mobile ? 1.6 : 1.3;
      const sysA = smoothstep(9.6, 11.0, s) * (1 - smoothstep(15.2, 16.6, s));
      orbitMat.uniforms.uOpacity.value = w * sysA * 0.32;
      bodyMat.uniforms.uOpacity.value = w * smoothstep(9.0, 10.5, s) * (1 - smoothstep(17.5, 19.0, s));
      const pxA = smoothstep(15.6, 16.4, s) * (1 - smoothstep(17.6, 18.4, s));
      pxMat.uniforms.uOpacity.value = w * pxA;
      galMat.uniforms.uOpacity.value = w * smoothstep(16.8, 19.2, s);
      for (const m of [earthMat, bodyMat, pxMat, galMat]) m.uniforms.uPixelRatio.value = f.pixelRatio;
      renderer.render(scene, camera);

      const L = (text: string, at: THREE.Vector3, a: number, side?: Label['side']) => labelAt(text, at, camera, f, a, side);
      return [
        L('Earth', tmp.set(0, EARTH_R * 1.4, 0), earthA * smoothstep(7.6, 8.0, s)),
        L('Earth', planetPos[2], sysA * (1 - smoothstep(12.2, 12.6, s))),
        L('The Sun · 8 light-minutes', sun, sysA * (1 - smoothstep(12.6, 13, s)) * smoothstep(10.6, 11, s), 'left'),
        L('Jupiter', planetPos[4], sysA * smoothstep(11.6, 12, s) * (1 - smoothstep(13.6, 14, s))),
        L('Neptune · 30 AU', planetPos[7], sysA * smoothstep(12.3, 12.7, s) * (1 - smoothstep(14.6, 15, s))),
        L('Proxima Centauri · 4.24 light-years', proxima, pxA),
        L('The Sun is here', sun, smoothstep(19.4, 20, s) * w, 'left'),
      ].filter(present);
    },
    dispose() {
      sky.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Points || o instanceof THREE.Line) o.geometry.dispose();
      });
      [earthMat, bodyMat, pxMat, galMat, orbitMat].forEach((m) => m.dispose());
    },
  };
}
