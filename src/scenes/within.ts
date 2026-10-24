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
import { beatIndexAt, CHAPTERS } from '../content/chapters';
import type { ProteinView } from '../animation/director';
import { rgb } from '../shaders/palette';
import { pointsGeometry, pointsMaterial } from '../shaders/points';
import type { Frame, StageScene } from './types';
import { labelAt, present } from './util';

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

/** The view the narration calls for at a moment in Chapter 6. */
function autoView(local: number): Exclude<ProteinView, 'auto'> | 'shape' {
  const beat = beatIndexAt(CHAPTERS[5], local);
  return beat < 2 ? 'shape' : beat === 2 ? 'prediction' : beat === 3 || beat === 5 ? 'confidence' : 'verify';
}

export function createWithin(mobile: boolean): StageScene {
  const r = rng(41);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, 3.2);
  const ivory = rgb('ivory'), violet = rgb('violet'), teal = rgb('teal');

  // A cell, schematic: membrane, nucleus, contents.
  const cN = mobile ? 9000 : 18000;
  const cp = new Float32Array(cN * 3), cc = new Float32Array(cN * 3), cs = new Float32Array(cN);
  for (let i = 0; i < cN; i++) {
    const v = new THREE.Vector3(r.gauss(), r.gauss(), r.gauss()).normalize();
    const k = r.next();
    let rad = 1, tint = ivory, b = 0.8;
    if (k < 0.5) rad = 1 + 0.04 * Math.sin(v.x * 7 + v.y * 5) + r.gauss() * 0.006;
    else if (k < 0.72) {
      rad = 0.34 + r.gauss() * 0.005;
      v.multiplyScalar(rad).add(new THREE.Vector3(0.18, 0.05, 0));
      rad = 1;
      tint = violet;
      b = 1;
    } else {
      rad = 0.42 + Math.cbrt(r.next()) * 0.5;
      b = 0.4;
    }
    v.multiplyScalar(rad);
    v.y *= 0.82;
    cp.set([v.x, v.y, v.z], i * 3);
    cc.set(tint.map((c) => c * b * (0.6 + 0.4 * r.next())), i * 3);
    cs[i] = 0.9 + r.next() * 0.8;
  }
  const cellMat = pointsMaterial();
  const cell = new THREE.Points(pointsGeometry(cp, cc, cs), cellMat);

  // Hydrogen's 1s state: radius drawn from r² e^(-2r/a0), a Gamma(3, a0/2).
  const aN = mobile ? 12000 : 26000;
  const ap = new Float32Array(aN * 3), ac = new Float32Array(aN * 3), as = new Float32Array(aN);
  const a0 = 0.3;
  for (let i = 0; i < aN; i++) {
    const rad = -(a0 / 2) * Math.log(Math.max(r.next() * r.next() * r.next(), 1e-12));
    const v = new THREE.Vector3(r.gauss(), r.gauss(), r.gauss()).normalize().multiplyScalar(rad);
    ap.set([v.x, v.y, v.z], i * 3);
    ac.set(teal.map((c, k) => (c * 0.6 + ivory[k] * 0.4) * 1.0), i * 3);
    as[i] = 1;
  }
  ap.set([0, 0, 0], 0);
  ac.set(ivory, 0);
  as[0] = 5;
  const atomMat = pointsMaterial();
  const atom = new THREE.Points(pointsGeometry(ap, ac, as), atomMat);

  const protein = new THREE.Group();
  const proteinMats: THREE.ShaderMaterial[] = [];
  let residuePos: THREE.Vector3[] = [];
  let unsureIndex = 0;
  const viewNow = new THREE.Vector3();

  scene.add(cell, atom, protein);
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
        decls: `attribute float aPlddt; ${PROTEIN_COLOR}`,
        uniforms: { uView: { value: viewNow } },
        object: 'float a; col = proteinColor(aPlddt, a); alpha *= a;',
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
      camera.updateProjectionMatrix();

      // Each object's true width, in log10 meters: cell 20 µm, p53 about 10 nm, the 1s cloud about 0.3 nm.
      const show = (obj: THREE.Object3D, width: number) => {
        const k = Math.pow(10, width - s);
        obj.scale.setScalar(k);
        return smoothstep(0.03, 0.25, k) * (1 - smoothstep(2.5, 9, k));
      };
      const cellA = show(cell, -4.7);
      const proteinA = show(protein, -8);
      const atomA = show(atom, -9.6);

      const spin = f.state.reduced ? 0 : f.elapsed * 0.1;
      for (const o of [cell, protein, atom]) {
        o.rotation.set(0.25 + f.drag.y * 0.6, spin + f.drag.x, 0);
      }

      cellMat.uniforms.uOpacity.value = w * cellA;
      atomMat.uniforms.uOpacity.value = w * atomA;
      for (const m of [cellMat, atomMat]) m.uniforms.uPixelRatio.value = f.pixelRatio;
      cellMat.uniforms.uSize.value = 1.5;
      atomMat.uniforms.uSize.value = 2;

      // Which view the protein is in: the narration's, or the viewer's.
      const chosen = f.chapter === 5 ? (f.state.proteinView === 'auto' ? autoView(f.local) : f.state.proteinView) : 'shape';
      viewNow.lerp(target[chosen], f.state.reduced ? 1 : Math.min(1, f.dt * 3));
      proteinMats.forEach((m, i) => {
        m.uniforms.uOpacity.value = w * proteinA * (i === 0 ? 1 : 0.45);
        m.uniforms.uPixelRatio.value = f.pixelRatio;
        m.uniforms.uTime.value = f.elapsed;
        m.uniforms.uSize.value = f.mobile ? 0.85 : 1;
      });
      renderer.render(scene, camera);

      const labels = [
        labelAt('A cell, about 20 micrometers across (schematic)', anchor.set(0.75, 0.62, 0).multiplyScalar(cell.scale.x), camera, f, cellA * smoothstep(0.6, 0.9, cell.scale.x) * (1 - smoothstep(1.4, 2, cell.scale.x))),
        labelAt('Nucleus · drawn 60,000 times too large', anchor.set(0, 0, 0), camera, f, atomA * smoothstep(0.7, 1, atom.scale.x)),
      ];
      if (residuePos.length) {
        protein.updateMatrixWorld();
        const head = anchor.copy(residuePos[0]).applyMatrix4(protein.matrixWorld);
        if (f.chapter === 4) labels.push(labelAt('p53 · 393 amino acids', head, camera, f, proteinA * smoothstep(13, 14, f.local) * (1 - smoothstep(19, 20, f.local))));
        if (f.chapter === 5) {
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
      [cellMat, atomMat, ...proteinMats].forEach((m) => m.dispose());
    },
  };
}
