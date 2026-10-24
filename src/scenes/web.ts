// Chapter 3: the cosmic web. Points are placed along filaments between
// nodes to resemble the morphology of redshift surveys and simulations; it is
// illustrative, not a map of a real region, and the chapter says so.
// Positions are in megaparsecs. Past the box, the web gives way to a nearly
// uniform haze inside a sphere marking the observable limit.

import * as THREE from 'three';
import { lerp, rng, smoothstep } from '../animation/ease';
import { rgb } from '../shaders/palette';
import { lineMaterial, pointsGeometry, pointsMaterial } from '../shaders/points';
import { galaxyPoints } from './galaxy';
import type { Frame, StageScene } from './types';
import { compose, distanceFor, labelAt, orbit, present } from './util';

const MPC = 3.0857e22;
const MPC_PER_KLY = 0.00030660;
/** Radius of the observable universe: about 46.5 billion light-years. */
const R_OBS = 14_260;

export function createWeb(mobile: boolean): StageScene {
  const r = rng(21);
  const half = 160;
  const nodes: { p: THREE.Vector3; m: number }[] = [{ p: new THREE.Vector3(), m: 1 }];
  for (let i = 0; i < 70; i++) {
    nodes.push({
      p: new THREE.Vector3((r.next() * 2 - 1) * half, (r.next() * 2 - 1) * half * 0.8, (r.next() * 2 - 1) * half),
      m: 0.25 + Math.pow(r.next(), 2.5) * 1.1,
    });
  }
  // Filaments: each node to its three nearest neighbors.
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: a.p.distanceTo(b.p) }))
      .filter((e) => e.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3)
      .forEach(({ j, d }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (d < 150 && !seen.has(key)) {
          seen.add(key);
          edges.push([i, j]);
        }
      });
  });
  const lengths = edges.map(([a, b]) => nodes[a].p.distanceTo(nodes[b].p) * (nodes[a].m + nodes[b].m));
  const total = lengths.reduce((s, x) => s + x, 0);

  const N = mobile ? 70_000 : 180_000;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size = new Float32Array(N), tag = new Float32Array(N);
  const ivory = rgb('ivory'), violet = rgb('violet');
  const ctrl = edges.map(() => new THREE.Vector3(r.gauss(), r.gauss(), r.gauss()).multiplyScalar(14));
  const a = new THREE.Vector3(), b = new THREE.Vector3(), q = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    const k = r.next();
    if (k < 0.66) {
      // Along a filament, as a gently bowed curve, thicker near its ends.
      let pick = r.next() * total, e = 0;
      while (pick > lengths[e] && e < edges.length - 1) pick -= lengths[e++];
      const [ia, ib] = edges[e];
      const u = r.next();
      a.copy(nodes[ia].p);
      b.copy(nodes[ib].p);
      q.copy(a).add(b).multiplyScalar(0.5).add(ctrl[e]);
      const p = a.multiplyScalar((1 - u) * (1 - u)).add(q.multiplyScalar(2 * u * (1 - u))).add(b.multiplyScalar(u * u));
      const thick = 1.2 + 2.6 * (1 - 4 * u * (1 - u));
      p.x += r.gauss() * thick;
      p.y += r.gauss() * thick;
      p.z += r.gauss() * thick;
      pos.set([p.x, p.y, p.z], i * 3);
    } else if (k < 0.93) {
      // Clusters at the nodes.
      const n = nodes[Math.floor(Math.pow(r.next(), 0.7) * nodes.length)];
      const s = 2 + 5 * n.m;
      pos.set([n.p.x + r.gauss() * s, n.p.y + r.gauss() * s, n.p.z + r.gauss() * s], i * 3);
    } else {
      // The few galaxies in the voids.
      pos.set([(r.next() * 2 - 1) * half, (r.next() * 2 - 1) * half * 0.8, (r.next() * 2 - 1) * half], i * 3);
    }
    const bright = 0.45 + 0.55 * Math.pow(r.next(), 2);
    const tint = r.next() < 0.25 ? violet : ivory;
    col.set(tint.map((c) => c * bright), i * 3);
    size[i] = 0.8 + 1.6 * Math.pow(r.next(), 5);
    tag[i] = r.next();
  }
  const webMat = pointsMaterial({
    decls: 'attribute float aTag; uniform float uTag;',
    uniforms: { uTag: { value: 0 } },
    // A model's labels are teal: the share Zoobot classified, at its true ratio.
    object: 'if (aTag < uTag) { col = TEAL; size *= 1.7; alpha = 1.0; }',
  });
  webMat.uniforms.uAtten.value = 1;
  const web = new THREE.Points(pointsGeometry(pos, col, size, { aTag: [tag, 1] }), webMat);

  // One galaxy at the origin, where the last chapter left off.
  const g = galaxyPoints(mobile ? 4000 : 9000, 9);
  for (let i = 0; i < g.pos.length; i++) g.pos[i] *= MPC_PER_KLY;
  const galMat = pointsMaterial();
  const galaxy = new THREE.Points(pointsGeometry(g.pos, g.col, g.size), galMat);

  // The haze, nearly uniform at the largest scales, and the observable limit.
  const hN = mobile ? 15_000 : 40_000;
  const hp = new Float32Array(hN * 3), hc = new Float32Array(hN * 3), hs = new Float32Array(hN);
  for (let i = 0; i < hN; i++) {
    const v = new THREE.Vector3(r.gauss(), r.gauss(), r.gauss()).normalize().multiplyScalar(R_OBS * Math.cbrt(r.next()));
    hp.set([v.x, v.y, v.z], i * 3);
    hc.set(ivory.map((c) => c * (0.25 + 0.3 * r.next())), i * 3);
    hs[i] = 0.9 + r.next() * 0.6;
  }
  const hazeMat = pointsMaterial();
  const haze = new THREE.Points(pointsGeometry(hp, hc, hs), hazeMat);
  const limitMat = lineMaterial(rgb('violet'), 0);
  const limit = new THREE.Group();
  const ring = (tilt: THREE.Euler) => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 256; k++) {
      const t = (k / 256) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * R_OBS, 0, Math.sin(t) * R_OBS).applyEuler(tilt));
    }
    limit.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), limitMat));
  };
  [0, 0.5, -0.5, 1.0, -1.0].forEach((lat, i) => ring(new THREE.Euler(lat, i * 0.7, 0)));
  ring(new THREE.Euler(Math.PI / 2, 0, 0));

  const scene = new THREE.Scene();
  scene.add(web, galaxy, haze, limit);
  scene.traverse((o) => (o.frustumCulled = false));
  const camera = new THREE.PerspectiveCamera(50, 1, 1e-6, 1e9);
  const origin = new THREE.Vector3();
  const filamentMark = new THREE.Vector3().copy(nodes[edges[0][0]].p).lerp(nodes[edges[0][1]].p, 0.5).add(ctrl[0].clone().multiplyScalar(0.5));
  const limitMark = new THREE.Vector3(R_OBS, 0, 0);

  return {
    id: 'web',
    render(renderer, f: Frame) {
      const s = f.scale, w = f.weight;
      const D = distanceFor(s, MPC, 50, f.aspect);
      const ambient = f.state.reduced ? 0 : f.elapsed * 0.03;
      camera.aspect = f.aspect;
      compose(camera, f);
      orbit(camera, origin, D, 0.4 + ambient + f.drag.x, lerp(0.75, 0.38, smoothstep(21.2, 23.5, s)) + f.drag.y * 0.4);
      camera.far = Math.max(D * 1e3, 1e5);
      camera.updateProjectionMatrix();

      galMat.uniforms.uOpacity.value = w * (1 - smoothstep(22.0, 22.9, s));
      const webA = smoothstep(21.6, 22.8, s) * (1 - smoothstep(25.3, 26.2, s));
      webMat.uniforms.uOpacity.value = w * webA;
      webMat.uniforms.uRef.value = D;
      webMat.uniforms.uTag.value = f.state.reduced ? (f.local >= 20 ? 0.0146 : 0) : 0.0146 * smoothstep(20, 23, f.local);
      hazeMat.uniforms.uOpacity.value = w * smoothstep(25.1, 26.0, s);
      limitMat.uniforms.uOpacity.value = w * smoothstep(26.0, 26.8, s) * 0.5;
      for (const m of [galMat, webMat, hazeMat]) m.uniforms.uPixelRatio.value = f.pixelRatio;
      webMat.uniforms.uSize.value = f.mobile ? 1.8 : 1.6;
      renderer.render(scene, camera);

      return [
        labelAt('One galaxy', origin, camera, f, 1 - smoothstep(21.6, 22.2, s)),
        labelAt('A filament of galaxies', filamentMark, camera, f, smoothstep(23.4, 23.9, s) * (1 - smoothstep(24.6, 25, s))),
        labelAt('Observable limit · about 46 billion light-years away in every direction', limitMark, camera, f, smoothstep(26.3, 26.8, s), 'left'),
      ].filter(present);
    },
    dispose() {
      scene.traverse((o) => {
        if (o instanceof THREE.Points || o instanceof THREE.Line) o.geometry.dispose();
      });
      [webMat, galMat, hazeMat, limitMat].forEach((m) => m.dispose());
    },
  };
}
