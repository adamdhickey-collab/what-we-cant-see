// Chapters 5 and 6: a cell, a protein, an atom. Each is its own object at
// its own true width, scaled into view by the same scale value the navigator
// shows, so going down a scale is an object growing past the frame and the
// next one arriving: a cut in structure, not a camera pretending to fly
// through a body.
//
// The protein is real: AlphaFold's prediction of human p53, one point per
// amino acid, colored by what the instrument claims about it.

import * as THREE from 'three';
import { lerp, rng, smoothstep } from '../animation/ease';
import { beatStart, CH } from '../content/chapters';
import { autoView } from './views';
import { rgb } from '../shaders/palette';
import { lineMaterial, pointsGeometry, pointsMaterial } from '../shaders/points';
import type { Frame, StageScene } from './types';
import { fbm3 } from './noise';
import { compose, labelAt, present } from './util';

export interface ProteinData {
  entryId: string;
  residues: [number, number, number, number][];
}

const PROTEIN_COLOR = /* glsl */ `
  uniform vec3 uView;
  vec3 proteinColor(float pl, out float a) {
    float unsure = 1.0 - smoothstep(60.0, 75.0, pl);
    vec3 conf = pl > 90.0 ? TEAL : pl > 70.0 ? TEAL * 0.8 : pl > 50.0 ? mix(TEAL, VIOLET, 0.65) : VIOLET * 0.9;
    vec3 ver = mix(IVORY * 0.16, VIOLET * 1.2, unsure);
    float shape = 1.0 - uView.x - uView.y - uView.z;
    a = shape + uView.x + uView.y * mix(1.0, 0.55, unsure) + uView.z * mix(0.45, 1.0 + 0.35 * sin(uTime * 2.4), unsure);
    return IVORY * 0.8 * shape + TEAL * uView.x + conf * uView.y + ver * uView.z;
  }
`;

// Moments in the inward chapter, keyed to its lines.
const MICROBES = beatStart('small', 'microbes');
const P53 = beatStart('small', 'p53');
const ATOM = beatStart('small', 'atom');

export function createWithin(mobile: boolean): StageScene {
  const r = rng(41);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, 3.2);
  const ivory = rgb('ivory'), violet = rgb('violet'), teal = rgb('teal');

  // Nearer points brighter, farther ones dimmer: depth without a fog pass.
  const depth = {
    decls: 'uniform float uNear, uFar;',
    uniforms: { uNear: { value: 2 }, uFar: { value: 4.4 } },
    view: 'alpha *= mix(1.0, 0.22, smoothstep(uNear, uFar, -mv.z));',
  };

  // A cell, schematic: a two-layered membrane, the nucleus with its double
  // envelope and nucleolus, folded endoplasmic reticulum around it,
  // mitochondria and vesicles in a faint cytosol.
  const cN = mobile ? 14000 : 32000;
  const cp = new Float32Array(cN * 3), cc = new Float32Array(cN * 3), cs = new Float32Array(cN);
  const nucleus = new THREE.Vector3(0.16, 0.04, 0);
  const mitos = Array.from({ length: 14 }, () => {
    const at = new THREE.Vector3(r.gauss(), r.gauss(), r.gauss()).normalize().multiplyScalar(0.55 + r.next() * 0.3);
    if (at.distanceTo(nucleus) < 0.5) at.add(at.clone().sub(nucleus).setLength(0.3));
    return { at, axis: new THREE.Vector3(r.gauss(), r.gauss(), r.gauss()).normalize(), len: 0.1 + r.next() * 0.08 };
  });
  const vesicles = Array.from({ length: 28 }, () => ({
    at: new THREE.Vector3(r.gauss(), r.gauss(), r.gauss()).normalize().multiplyScalar(0.45 + r.next() * 0.45),
    rad: 0.015 + r.next() * 0.025,
  }));
  const dir = () => new THREE.Vector3(r.gauss(), r.gauss(), r.gauss()).normalize();
  for (let i = 0; i < cN; i++) {
    const k = r.next();
    let p: THREE.Vector3, tint = ivory, b: number;
    if (k < 0.36) {
      const n = dir();
      const wob = 1 + 0.07 * (fbm3(n.x * 2.4, n.y * 2.4, n.z * 2.4) - 0.5);
      p = n.multiplyScalar(wob + (r.next() < 0.5 ? -0.007 : 0.007));
      b = 0.85;
    } else if (k < 0.5) {
      p = dir().multiplyScalar(0.32 + (r.next() < 0.5 ? -0.005 : 0.005)).add(nucleus);
      tint = violet;
      b = 1.05;
    } else if (k < 0.54) {
      p = new THREE.Vector3(r.gauss(), r.gauss(), r.gauss()).multiplyScalar(0.05).add(nucleus).add(new THREE.Vector3(0.05, 0.05, 0.04));
      tint = violet;
      b = 1.2;
    } else if (k < 0.66) {
      // Endoplasmic reticulum: sheets where a noise field crosses a band of radii.
      const n = dir();
      const shell = 0.4 + r.next() * 0.2;
      if (fbm3(n.x * 4 + shell * 6, n.y * 4, n.z * 4) < 0.55) {
        i--;
        continue;
      }
      p = n.multiplyScalar(shell).add(nucleus);
      tint = violet;
      b = 0.5;
    } else if (k < 0.8) {
      const m = mitos[Math.floor(r.next() * mitos.length)];
      const along = (r.next() * 2 - 1) * m.len;
      const ring = dir().projectOnPlane(m.axis).normalize().multiplyScalar(0.035);
      p = m.at.clone().addScaledVector(m.axis, along).add(ring);
      b = 0.95;
    } else if (k < 0.87) {
      const v = vesicles[Math.floor(r.next() * vesicles.length)];
      p = dir().multiplyScalar(v.rad).add(v.at);
      b = 0.7;
    } else {
      p = dir().multiplyScalar(0.36 + Math.cbrt(r.next()) * 0.6);
      b = 0.25;
    }
    p.y *= 0.82;
    cp.set([p.x, p.y, p.z], i * 3);
    cc.set(tint.map((c) => c * b * (0.7 + 0.3 * r.next())), i * 3);
    cs[i] = 0.8 + r.next() * 0.6;
  }
  const cellMat = pointsMaterial(depth);
  const cell = new THREE.Points(pointsGeometry(cp, cc, cs), cellMat);

  // Bacteria, schematic: rods about 2 µm long, a tenth of the cell's width,
  // drawn around it at true ratio. In a body most of them live in the gut.
  const rods = 46, perRod = mobile ? 70 : 150;
  const bp = new Float32Array(rods * perRod * 3), bc = new Float32Array(rods * perRod * 3), bs = new Float32Array(rods * perRod);
  for (let k = 0; k < rods; k++) {
    const at = dir().multiplyScalar(1.18 + r.next() * 0.5);
    at.y *= 0.82;
    const axis = dir();
    for (let j = 0; j < perRod; j++) {
      const i = k * perRod + j;
      const along = (r.next() * 2 - 1) * 0.09;
      const p = at.clone().addScaledVector(axis, along).add(dir().projectOnPlane(axis).normalize().multiplyScalar(0.022));
      bp.set([p.x, p.y, p.z], i * 3);
      bc.set(ivory.map((c, n) => (c * 0.6 + rgb('copper')[n] * 0.4) * (0.6 + 0.3 * r.next())), i * 3);
      bs[i] = 0.9;
    }
  }
  const microbeMat = pointsMaterial(depth);
  const microbes = new THREE.Points(pointsGeometry(bp, bc, bs), microbeMat);

  // A fingertip's ridges, generated: a loop pattern of fine lines, about 2 cm across.
  const fN = mobile ? 14000 : 30000;
  const fp = new Float32Array(fN * 3), fc = new Float32Array(fN * 3), fs = new Float32Array(fN);
  for (let i = 0; i < fN; i++) {
    const x = r.next() * 2 - 1, y = r.next() * 2 - 1;
    const oval = x * x + (y * y) / 1.69;
    const qx = x + 0.12 * (fbm3(x * 2, y * 2, 3) - 0.5), qy = y + 0.12 * (fbm3(x * 2, y * 2, 9) - 0.5);
    const ridge = Math.hypot(qx * 1.15, (qy + 0.25) * 0.9 + 0.3 * qx * qx) * 15;
    if (oval > 1 || ridge % 1 > 0.32) {
      i--;
      continue;
    }
    fp.set([x * 0.85, y * 0.85, (r.next() - 0.5) * 0.02 - 0.3 * oval], i * 3);
    fc.set(ivory.map((c, n) => (c * 0.75 + rgb('copper')[n] * 0.25) * (0.5 + 0.4 * r.next()) * (1 - 0.6 * oval)), i * 3);
    fs[i] = 1;
  }
  const fingerMat = pointsMaterial(depth);
  const finger = new THREE.Points(pointsGeometry(fp, fc, fs), fingerMat);

  // Hydrogen's 1s state: radius drawn from r² e^(-2r/a0), a Gamma(3, a0/2).
  // The ring marks a0, the most likely distance, and faces the viewer.
  const aN = mobile ? 24000 : 60000;
  const ap = new Float32Array(aN * 3), ac = new Float32Array(aN * 3), as = new Float32Array(aN);
  const a0 = 0.3;
  for (let i = 0; i < aN; i++) {
    const rad = -(a0 / 2) * Math.log(Math.max(r.next() * r.next() * r.next(), 1e-12));
    const v = dir().multiplyScalar(rad);
    ap.set([v.x, v.y, v.z], i * 3);
    ac.set(teal.map((c, k) => (c * 0.65 + ivory[k] * 0.35) * 0.85), i * 3);
    as[i] = 0.9;
  }
  ap.set([0, 0, 0], 0);
  ac.set(ivory, 0);
  as[0] = 5;
  const atomMat = pointsMaterial(depth);
  const atom = new THREE.Points(pointsGeometry(ap, ac, as), atomMat);
  const ringMat = lineMaterial(rgb('teal'), 0);
  const ringPts = Array.from({ length: 129 }, (_, k) => new THREE.Vector3(Math.cos((k / 128) * Math.PI * 2) * a0, Math.sin((k / 128) * Math.PI * 2) * a0, 0));
  const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), ringMat);

  const protein = new THREE.Group();
  const proteinMats: THREE.ShaderMaterial[] = [];
  let residuePos: THREE.Vector3[] = [];
  let unsureIndex = 0;
  const viewNow = new THREE.Vector3();

  scene.add(finger, cell, microbes, atom, ring, protein);
  scene.traverse((o) => (o.frustumCulled = false));

  // The structure arrives over the network; until it does, the chapter has
  // everything but the protein.
  fetch(`${import.meta.env.BASE_URL}data/protein-P04637.json`)
    .then((res) => res.json() as Promise<ProteinData>)
    .then((data) => {
      const pts = data.residues.map(([x, y, z]) => new THREE.Vector3(x, y, z));
      const centroid = pts.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / pts.length);
      pts.forEach((p) => p.sub(centroid));
      const extent = Math.max(...pts.map((p) => p.length()));
      pts.forEach((p) => p.multiplyScalar(1 / extent));
      residuePos = pts;
      const plddt = data.residues.map((x) => x[3]);
      unsureIndex = plddt.findIndex((p) => p < 50);

      const n = pts.length;
      const pp = new Float32Array(n * 3), pc = new Float32Array(n * 3), psz = new Float32Array(n), pl = new Float32Array(n);
      pts.forEach((p, i) => {
        pp.set([p.x, p.y, p.z], i * 3);
        pc.set(ivory, i * 3);
        psz[i] = 4.5;
        pl[i] = plddt[i];
      });
      const chunks = {
        decls: `attribute float aPlddt; ${depth.decls} ${PROTEIN_COLOR}`,
        uniforms: { uView: { value: viewNow }, ...depth.uniforms },
        object: 'float a; col = proteinColor(aPlddt, a); alpha *= a;',
        view: depth.view,
      };
      const dotMat = pointsMaterial(chunks);
      const dots = new THREE.Points(pointsGeometry(pp, pc, psz, { aPlddt: [pl, 1] }), dotMat);

      // The backbone, as a smooth curve through the alpha-carbons.
      const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
      const samples = n * 14;
      const lp = new Float32Array(samples * 3), lc = new Float32Array(samples * 3), ls = new Float32Array(samples), ll = new Float32Array(samples);
      for (let i = 0; i < samples; i++) {
        const u = i / (samples - 1);
        const p = curve.getPoint(u);
        lp.set([p.x, p.y, p.z], i * 3);
        lc.set(ivory, i * 3);
        ls[i] = 1.6;
        const fi = u * (n - 1);
        ll[i] = lerp(plddt[Math.floor(fi)], plddt[Math.min(n - 1, Math.ceil(fi))], fi % 1);
      }
      const traceMat = pointsMaterial(chunks);
      traceMat.uniforms.uOpacity.value = 0.6;
      const trace = new THREE.Points(pointsGeometry(lp, lc, ls, { aPlddt: [ll, 1] }), traceMat);
      protein.add(trace, dots);
      protein.traverse((o) => (o.frustumCulled = false));
      proteinMats.push(dotMat, traceMat);
    })
    .catch(() => {
      /* The text still carries the chapter. */
    });

  const target = { shape: new THREE.Vector3(0, 0, 0), prediction: new THREE.Vector3(1, 0, 0), confidence: new THREE.Vector3(0, 1, 0), verify: new THREE.Vector3(0, 0, 1) };
  const anchor = new THREE.Vector3();

  return {
    id: 'within',
    render(renderer, f: Frame) {
      const s = f.scale, w = f.weight;
      camera.aspect = f.aspect;
      camera.position.z = 3.2 / Math.min(1, f.aspect * 1.15);
      // In Chapter 6 a panel takes the right, so the protein sits nearer center.
      compose(camera, f, f.chapter === CH.unsure ? 0.02 : 0.12);
      camera.updateProjectionMatrix();
      depth.uniforms.uNear.value = camera.position.z - 0.9;
      depth.uniforms.uFar.value = camera.position.z + 1.1;

      // Each object's true width, in log10 meters: cell 20 µm, p53 about 10 nm, the 1s cloud about 0.3 nm.
      const show = (obj: THREE.Object3D, width: number) => {
        const k = Math.pow(10, width - s);
        obj.scale.setScalar(k);
        return smoothstep(0.03, 0.25, k) * (1 - smoothstep(2.5, 9, k));
      };
      const fingerA = show(finger, -1.7);
      const cellA = show(cell, -4.7);
      microbes.scale.copy(cell.scale);
      const microbeA = cellA * (f.chapter === CH.small ? (f.state.reduced ? (f.local >= MICROBES ? 1 : 0) : smoothstep(MICROBES, MICROBES + 2.5, f.local)) : 0);
      const proteinA = show(protein, -8);
      const atomA = show(atom, -9.6);
      ring.scale.copy(atom.scale);
      ringMat.uniforms.uOpacity.value = w * atomA * 0.55 * smoothstep(0.7, 1, atom.scale.x);

      const spin = f.state.reduced ? 0 : f.elapsed * 0.1;
      for (const o of [cell, microbes, protein, atom]) {
        o.rotation.set(0.25 + f.drag.y * 0.6, spin + f.drag.x, 0);
      }

      // The fingertip faces the viewer and only sways.
      finger.rotation.set(0.15 + f.drag.y * 0.3, Math.sin(spin) * 0.25 + f.drag.x * 0.3, 0);
      fingerMat.uniforms.uOpacity.value = w * fingerA;
      microbeMat.uniforms.uOpacity.value = w * microbeA;
      cellMat.uniforms.uOpacity.value = w * cellA;
      atomMat.uniforms.uOpacity.value = w * atomA;
      for (const m of [cellMat, atomMat, fingerMat, microbeMat]) m.uniforms.uPixelRatio.value = f.pixelRatio;
      fingerMat.uniforms.uSize.value = 1.3;
      microbeMat.uniforms.uSize.value = 1.4;
      cellMat.uniforms.uSize.value = 1.5;
      atomMat.uniforms.uSize.value = 2;

      // Which view the protein is in: the narration's, or the viewer's.
      const chosen = f.chapter === CH.unsure ? (f.state.proteinView === 'auto' ? autoView(f.local) : f.state.proteinView) : 'shape';
      viewNow.lerp(target[chosen], f.state.reduced ? 1 : Math.min(1, f.dt * 3));
      proteinMats.forEach((m, i) => {
        m.uniforms.uOpacity.value = w * proteinA * (i === 0 ? 1 : 0.45);
        m.uniforms.uPixelRatio.value = f.pixelRatio;
        m.uniforms.uTime.value = f.elapsed;
        m.uniforms.uSize.value = f.mobile ? 0.85 : 1;
      });
      renderer.render(scene, camera);

      const labels = [
        labelAt('A fingertip · about 2 cm across', anchor.set(0.7, 0.9, 0).multiplyScalar(finger.scale.x), camera, f, fingerA * smoothstep(0.6, 0.9, finger.scale.x) * (1 - smoothstep(1.4, 2, finger.scale.x))),
        labelAt('Bacteria · each about 2 µm (schematic)', anchor.set(1.3, -0.7, 0.3).multiplyScalar(cell.scale.x), camera, f, microbeA * (1 - smoothstep(1.4, 2, cell.scale.x)), 'left'),
        labelAt('A cell · about 20 µm across (schematic)', anchor.set(0.75, 0.62, 0).multiplyScalar(cell.scale.x), camera, f, cellA * smoothstep(0.6, 0.9, cell.scale.x) * (1 - smoothstep(1.4, 2, cell.scale.x))),
        labelAt('Nucleus · drawn 60,000 times too large', anchor.set(0, 0, 0), camera, f, atomA * smoothstep(0.7, 1, atom.scale.x)),
        labelAt('Most likely distance · 0.053 nm', anchor.set(a0 * 0.71, a0 * 0.71, 0).multiplyScalar(atom.scale.x), camera, f, atomA * smoothstep(0.7, 1, atom.scale.x)),
      ];
      if (residuePos.length) {
        protein.updateMatrixWorld();
        const head = anchor.copy(residuePos[0]).applyMatrix4(protein.matrixWorld);
        if (f.chapter === CH.small) labels.push(labelAt('p53 · 393 amino acids', head, camera, f, proteinA * smoothstep(P53 + 1, P53 + 2, f.local) * (1 - smoothstep(ATOM - 1, ATOM, f.local))));
        if (f.chapter === CH.unsure) {
          const u = anchor.copy(residuePos[Math.max(0, unsureIndex + 4)]).applyMatrix4(protein.matrixWorld);
          labels.push(labelAt('Confidence below 50: loose, or unknown?', u, camera, f, proteinA * viewNow.z));
        }
      }
      return labels.filter(present);
    },
    dispose() {
      scene.traverse((o) => {
        if (o instanceof THREE.Points) o.geometry.dispose();
      });
      ring.geometry.dispose();
      [cellMat, atomMat, ringMat, fingerMat, microbeMat, ...proteinMats].forEach((m) => m.dispose());
    },
  };
}
