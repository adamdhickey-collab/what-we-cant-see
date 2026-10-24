// Chapter 4: a real slice of the universe. Every point beyond our own galaxy
// is a galaxy the Sloan Digital Sky Survey measured: its place on the sky,
// and a distance inferred from its redshift (scripts/fetch-galaxies.mjs). The
// survey band runs along the celestial equator, so the galaxies fill two thin
// wedges that meet at us. Positions are in megaparsecs. Past the survey, a
// nearly uniform haze fills a shell of light marking the observable limit.

import * as THREE from 'three';
import { lerp, rng, smoothstep } from '../animation/ease';
import { beatStart } from '../content/chapters';
import { rgb } from '../shaders/palette';
import { pointsGeometry, pointsMaterial } from '../shaders/points';
import { galaxyPoints } from './galaxy';
import type { Frame, StageScene } from './types';
import { compose, distanceFor, labelAt, orbit, present } from './util';

const MPC = 3.0857e22;
const MPC_PER_KLY = 0.00030660;
/** Radius of the observable universe: about 46.5 billion light-years. */
const R_OBS = 14_260;
/** The share of galaxies Zoobot classified in Euclid's first release, about 1 in 70. */
const ZOOBOT_SHARE = 0.0146;
const PICKS = beatStart('many', 'zoobot');
const THREADS = beatStart('many', 'threads');

interface Survey {
  count: number;
  unitMpc: number;
  positions: string;
}

export function createWeb(mobile: boolean): StageScene {
  const r = rng(21);
  const ivory = rgb('ivory'), violet = rgb('violet');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 1e-6, 1e9);

  const webMat = pointsMaterial({
    decls: 'attribute float aTag; uniform float uTag;',
    uniforms: { uTag: { value: 0 } },
    // A model's labels are teal: the share Zoobot classified, at its true ratio.
    object: 'if (aTag < uTag) { col = TEAL; size *= 1.8; alpha = 1.0; }',
  });
  webMat.uniforms.uAtten.value = 1;

  // The survey arrives over the network; until it does, the chapter has our galaxy and the haze.
  fetch(`${import.meta.env.BASE_URL}data/galaxies-sdss.json`)
    .then((res) => res.json() as Promise<Survey>)
    .then((data) => {
      const raw = Uint8Array.from(atob(data.positions), (c) => c.charCodeAt(0));
      const q = new Int16Array(raw.buffer);
      // A phone draws every other galaxy.
      const stride = mobile ? 2 : 1;
      const n = Math.floor(data.count / stride);
      const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n), tag = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const j = i * stride * 3;
        pos.set([q[j] * data.unitMpc, q[j + 1] * data.unitMpc, q[j + 2] * data.unitMpc], i * 3);
        const bright = 0.5 + 0.5 * Math.pow(r.next(), 2);
        const tint = r.next() < 0.25 ? violet : ivory;
        col.set(tint.map((c) => c * bright), i * 3);
        size[i] = 0.9 + 1.4 * Math.pow(r.next(), 5);
        tag[i] = r.next();
      }
      const web = new THREE.Points(pointsGeometry(pos, col, size, { aTag: [tag, 1] }), webMat);
      web.frustumCulled = false;
      scene.add(web);
    })
    .catch(() => {
      /* The text still carries the chapter. */
    });

  // Our galaxy at the origin, where the last chapter left off and where the survey looks out from.
  const g = galaxyPoints(mobile ? 4000 : 9000, 9);
  for (let i = 0; i < g.pos.length; i++) g.pos[i] *= MPC_PER_KLY;
  const galMat = pointsMaterial();
  const galaxy = new THREE.Points(pointsGeometry(g.pos, g.col, g.size), galMat);

  // The haze, nearly uniform at the largest scales, and the observable limit as a thin shell of light.
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
  const sN = mobile ? 9000 : 24000;
  const sp = new Float32Array(sN * 3), sc = new Float32Array(sN * 3), ss = new Float32Array(sN);
  for (let i = 0; i < sN; i++) {
    const v = new THREE.Vector3(r.gauss(), r.gauss(), r.gauss()).normalize().multiplyScalar(R_OBS);
    sp.set([v.x, v.y, v.z], i * 3);
    sc.set(violet.map((c) => c * (0.5 + 0.5 * r.next())), i * 3);
    ss[i] = 1.8 + r.next() * 1.4;
  }
  const shellMat = pointsMaterial();
  const shell = new THREE.Points(pointsGeometry(sp, sc, ss), shellMat);

  scene.add(galaxy, haze, shell);
  scene.traverse((o) => (o.frustumCulled = false));
  const origin = new THREE.Vector3();
  // The Sloan Great Wall, about 320 Mpc away toward right ascension 13 hours
  // (195 degrees), placed the way the fetch script places every galaxy.
  const RA_WALL = (195 * Math.PI) / 180;
  const wall = new THREE.Vector3(320 * Math.cos(RA_WALL), 0, 320 * Math.sin(RA_WALL));
  const limitMark = new THREE.Vector3(R_OBS * 0.7, R_OBS * 0.7, 0);

  return {
    id: 'web',
    render(renderer, f: Frame) {
      const s = f.scale, w = f.weight;
      const D = distanceFor(s, MPC, 50, f.aspect);
      const ambient = f.state.reduced ? 0 : f.elapsed * 0.02;
      camera.aspect = f.aspect;
      compose(camera, f);
      // From beside our galaxy, up to look down on the survey's two wedges.
      orbit(camera, origin, D, 0.4 + ambient + f.drag.x, lerp(0.75, 1.25, smoothstep(22.5, 25.2, s)) + f.drag.y * 0.4);
      camera.far = Math.max(D * 1e3, 1e5);
      camera.updateProjectionMatrix();

      galMat.uniforms.uOpacity.value = w * (1 - smoothstep(22.6, 23.4, s));
      webMat.uniforms.uOpacity.value = w * smoothstep(23.2, 24.2, s) * (1 - smoothstep(26.2, 26.7, s));
      webMat.uniforms.uRef.value = D * 0.6;
      const picks = f.state.reduced ? (f.local >= PICKS ? 1 : 0) : smoothstep(PICKS, PICKS + 3, f.local);
      webMat.uniforms.uTag.value = ZOOBOT_SHARE * picks;
      hazeMat.uniforms.uOpacity.value = w * smoothstep(25.9, 26.5, s);
      shellMat.uniforms.uOpacity.value = w * smoothstep(26.3, 26.85, s);
      for (const m of [galMat, webMat, hazeMat, shellMat]) m.uniforms.uPixelRatio.value = f.pixelRatio;
      webMat.uniforms.uSize.value = f.mobile ? 1.8 : 1.5;
      renderer.render(scene, camera);

      return [
        labelAt('Us · the Milky Way', origin, camera, f, 1 - smoothstep(22.4, 23.0, s)),
        labelAt('You are here, at the point of the wedge', origin, camera, f, smoothstep(24.4, 24.8, s) * (1 - smoothstep(25.5, 25.8, s)), 'left'),
        labelAt('The Sloan Great Wall · over a billion light-years long', wall, camera, f, smoothstep(THREADS, THREADS + 1, f.local) * smoothstep(24.9, 25.1, s) * (1 - smoothstep(25.6, 25.9, s))),
        labelAt('Observable limit · about 46 billion light-years away in every direction', limitMark, camera, f, smoothstep(26.4, 26.85, s), 'left'),
      ].filter(present);
    },
    dispose() {
      scene.traverse((o) => {
        if (o instanceof THREE.Points) o.geometry.dispose();
      });
      [webMat, galMat, hazeMat, shellMat].forEach((m) => m.dispose());
    },
  };
}
