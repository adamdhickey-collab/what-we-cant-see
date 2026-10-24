// Chapter 2: from the horizon to the galaxy, in one continuous pull-back.
// Everything is placed in astronomical units at true ratios, and the camera's
// distance is computed from the same scale value the navigator shows, so the
// picture and the number cannot disagree. Float32 precision holds because the
// camera always frames the thing it is near: Earth at the origin while Earth
// fills the view, the galaxy's billions of AU only once it is the subject.

import * as THREE from 'three';
import { lerp, range, rng, smoothstep } from '../animation/ease';
import { beatStart } from '../content/chapters';
import { rgb } from '../shaders/palette';
import { lineMaterial, pointsGeometry, pointsMaterial } from '../shaders/points';
import { galaxyPoints } from './galaxy';
import { createSky } from './sky';
import type { Frame, Label, StageScene } from './types';
import { compose, distanceFor, labelAt, orbit, present } from './util';

const AU = 149_597_870_700;
const AU_PER_LY = 63_241.077;
const EARTH_R = 6_371_000 / AU;
// Moments in the chapter, keyed to its lines.
const FAST = beatStart('far', 'fast');
// The halo comes in a few seconds into the line about stars circling too fast.
const HALO = FAST + 4;

/** The two cities the Earth is shown for, and where the camera looks: between them. */
const CITIES = [
  { name: 'Minneapolis', lat: 44.9778, lon: -93.265, zone: 'America/Chicago' },
  { name: 'Tunja, Colombia', lat: 5.5353, lon: -73.3678, zone: 'America/Bogota' },
];
const VIEW = { lat: 22, lon: -83 };
/** The great-circle distance between them, by the haversine formula on a 6,371 km Earth: about 4,790 km. */
const DISTANCE_KM = (() => {
  const [a, b] = CITIES.map((c) => ({ p: (c.lat * Math.PI) / 180, l: (c.lon * Math.PI) / 180 }));
  const h = Math.sin((b.p - a.p) / 2) ** 2 + Math.cos(a.p) * Math.cos(b.p) * Math.sin((b.l - a.l) / 2) ** 2;
  return Math.round((2 * 6371 * Math.asin(Math.sqrt(h))) / 10) * 10;
})();
const CITY_LINE = beatStart('far', 'cities');
const SUN_LINE = beatStart('far', 'sun');

/** Earth's own frame: x toward 0°E, y toward the north pole, -z toward 90°E. */
function fromLatLon(lat: number, lon: number, radius: number) {
  const a = (lat * Math.PI) / 180, o = (lon * Math.PI) / 180;
  return new THREE.Vector3(Math.cos(a) * Math.cos(o), Math.sin(a), -Math.cos(a) * Math.sin(o)).multiplyScalar(radius);
}
function toLatLon(n: THREE.Vector3) {
  return { lat: (Math.asin(n.y) * 180) / Math.PI, lon: (Math.atan2(-n.z, n.x) * 180) / Math.PI };
}

/**
 * Where the Sun is overhead right now: its declination for the day of the
 * year and its longitude for the hour. Good to about a degree, enough to put
 * the day/night line where it is.
 */
function subsolar(now: Date) {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = (now.getTime() - start) / 86_400_000;
  const lat = -23.44 * Math.cos(((2 * Math.PI) / 365.24) * (day + 10));
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const lon = -15 * (hours - 12);
  return { lat, lon };
}

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

  // Earth, from real land outlines (scripts/fetch-earth.mjs), turned so its
  // lit half faces the Sun as it does at this moment, and lit in the shader so
  // the day/night line is where it really is right now. Oceans are sparse and
  // dim, so land reads by density as much as by brightness; a thin limb of
  // air rings it. Tunja and Minneapolis are marked, joined by the shortest
  // path over the surface.
  const earth = new THREE.Group();
  scene.add(earth);
  const ivory = rgb('ivory'), slate = rgb('slate');
  const litChunk = {
    decls: 'uniform vec3 uSunDir;',
    uniforms: { uSunDir: { value: sun.clone() } },
    // Day side full, night side faint but legible, with a soft terminator.
    object: 'vec3 nw = normalize(mat3(modelMatrix) * position); float lit = smoothstep(-0.12, 0.35, dot(nw, uSunDir)); col = col * (0.22 + 0.78 * lit) + VIOLET * 0.07 * (1.0 - lit);',
  };
  const earthMat = pointsMaterial(litChunk);
  earthMat.uniforms.uSize.value = 1.3;
  const cityMat = pointsMaterial(litChunk);
  const arcMat = lineMaterial(rgb('copper'), 0);
  fetch(`${import.meta.env.BASE_URL}data/earth-land.json`)
    .then((res) => res.json() as Promise<{ width: number; height: number; bits: string }>)
    .then((map) => {
      const bits = Uint8Array.from(atob(map.bits), (c) => c.charCodeAt(0));
      const isLand = (lat: number, lon: number) => {
        const row = Math.min(map.height - 1, Math.floor(((90 - lat) / 180) * map.height));
        const col = Math.min(map.width - 1, Math.floor(((lon + 180) / 360) * map.width));
        const i = row * map.width + col;
        return (bits[i >> 3] >> (i & 7)) & 1;
      };
      const eN = mobile ? 16000 : 40000;
      const limbN = mobile ? 1200 : 2600;
      const ePos = new Float32Array((eN + limbN) * 3), eCol = new Float32Array((eN + limbN) * 3), eSize = new Float32Array(eN + limbN);
      for (let i = 0; i < eN + limbN; i++) {
        const u = r.next() * 2 - 1, th = r.next() * Math.PI * 2, sq = Math.sqrt(1 - u * u);
        const n = new THREE.Vector3(sq * Math.cos(th), u, sq * Math.sin(th));
        if (i >= eN) {
          ePos.set([n.x * EARTH_R * 1.018, n.y * EARTH_R * 1.018, n.z * EARTH_R * 1.018], i * 3);
          eCol.set(ivory.map((v) => v * 0.16), i * 3);
          eSize[i] = 1;
          continue;
        }
        const { lat, lon } = toLatLon(n);
        const land = isLand(lat, lon) || lat > 78;
        if (!land && r.next() < 0.75) {
          i--;
          continue;
        }
        ePos.set([n.x * EARTH_R, n.y * EARTH_R, n.z * EARTH_R], i * 3);
        const b = land ? 0.95 : 0.2;
        eCol.set(ivory.map((v, k) => v * b + slate[k] * (land ? 0 : 0.25)), i * 3);
        eSize[i] = land ? 1.25 : 0.85;
      }
      const dots = new THREE.Points(pointsGeometry(ePos, eCol, eSize), earthMat);
      dots.frustumCulled = false;
      earth.add(dots);
    })
    .catch(() => {
      /* The text still carries the chapter. */
    });

  // The two cities, and the great-circle arc between them, lifted just off the ground.
  const cityAt = CITIES.map((c) => fromLatLon(c.lat, c.lon, EARTH_R * 1.004));
  const cityPts = new THREE.Points(
    pointsGeometry(new Float32Array(cityAt.flatMap((v) => [v.x, v.y, v.z])), new Float32Array([...rgb('ivory'), ...rgb('ivory')]), new Float32Array([7, 7])),
    cityMat,
  );
  const a0 = cityAt[0].clone().normalize(), a1 = cityAt[1].clone().normalize();
  const arcPts = Array.from({ length: 65 }, (_, k) => new THREE.Vector3().copy(a0).lerp(a1, k / 64).normalize().multiplyScalar(EARTH_R * (1.006 + 0.03 * Math.sin((Math.PI * k) / 64))));
  const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPts), arcMat);
  const arcMid = arcPts[32].clone();
  earth.add(cityPts, arc);
  const clock = CITIES.map((c) => new Intl.DateTimeFormat('en-US', { timeZone: c.zone, hour: 'numeric', minute: '2-digit', second: '2-digit' }));
  const viewCenter = fromLatLon(VIEW.lat, VIEW.lon, 1);

  // The Sun and the planets as single points; their orbits as fine circles.
  const bodies = new Float32Array((PLANETS.length + 1) * 3);
  const bCol = new Float32Array((PLANETS.length + 1) * 3);
  const bSize = new Float32Array(PLANETS.length + 1);
  const planetPos: THREE.Vector3[] = [];
  bodies.set([sun.x, sun.y, sun.z], 0);
  bCol.set(rgb('ivory').map((v, k) => v * 0.8 + rgb('copper')[k] * 0.4), 0);
  bSize[0] = 14;
  const orbitMat = lineMaterial(rgb('ivory'), 0.6);
  const orbits = new THREE.Group();
  PLANETS.forEach(([name, a], i) => {
    const ang = name === 'Earth' ? 0 : r.next() * Math.PI * 2;
    const p = new THREE.Vector3(sun.x + a * Math.cos(ang), 0, sun.z + a * Math.sin(ang));
    planetPos.push(p);
    bodies.set([p.x, p.y, p.z], (i + 1) * 3);
    bCol.set(rgb('ivory').map((v) => v * 0.7), (i + 1) * 3);
    bSize[i + 1] = 3;
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

  // The galaxy, in AU, with the Sun 26,000 light-years from its core. Its
  // points are placed around the core so it can turn about it.
  const g = galaxyPoints(mobile ? 50_000 : 120_000);
  const KLY = 1000 * AU_PER_LY;
  const center = new THREE.Vector3(sun.x - 26 * KLY, 0, sun.z);
  for (let i = 0; i < g.pos.length; i++) g.pos[i] *= KLY;
  const galMat = pointsMaterial();
  galMat.uniforms.uSize.value = 1.1;
  const galaxy = new THREE.Points(pointsGeometry(g.pos, g.col, g.size), galMat);
  galaxy.position.copy(center);
  scene.add(galaxy);
  const outerStar = new THREE.Vector3(44 * KLY, 0, 8 * KLY);

  // The dark matter halo: a rough sphere several times wider than the disk.
  // Its extent follows the models; its look is illustrative, and kept thin at
  // the center so the disk still reads through it.
  const hN = mobile ? 14000 : 36000;
  const hPos = new Float32Array(hN * 3), hCol = new Float32Array(hN * 3), hSize = new Float32Array(hN);
  const violet = rgb('violet');
  for (let i = 0; i < hN; i++) {
    const rad = (40 + 170 * Math.pow(r.next(), 0.6)) * KLY;
    const u = r.next() * 2 - 1, th = r.next() * Math.PI * 2, sq = Math.sqrt(1 - u * u);
    hPos.set([rad * sq * Math.cos(th) + center.x, rad * u * 0.85, rad * sq * Math.sin(th) + center.z], i * 3);
    hCol.set(violet.map((v) => v * (0.3 + 0.35 * r.next())), i * 3);
    hSize[i] = 1.5 + r.next() * 1.2;
  }
  const haloMat = pointsMaterial();
  const halo = new THREE.Points(pointsGeometry(hPos, hCol, hSize), haloMat);
  scene.add(halo);
  const haloMark = new THREE.Vector3(center.x + 150 * KLY, 60 * KLY, center.z);
  scene.traverse((o) => (o.frustumCulled = false));

  const target = new THREE.Vector3();
  const Y = new THREE.Vector3(0, 1, 0);
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), tmp3 = new THREE.Vector3(), tmp4 = new THREE.Vector3();

  return {
    id: 'cosmos',
    render(renderer, f: Frame) {
      const s = f.scale;
      const w = f.weight;
      const D = distanceFor(s, AU, 50, f.aspect);

      // The Earth as it is at this moment: its sunlit half toward the Sun.
      const now = new Date();
      const ss = subsolar(now);
      earth.quaternion.setFromUnitVectors(fromLatLon(ss.lat, ss.lon, 1), sun);

      // Where the camera looks: Earth, then the Sun, then most of the way to the core.
      target.set(0, 0, 0).lerp(sun, smoothstep(8.6, 11.4, s));
      target.lerp(tmp.copy(center).multiplyScalar(0.82), smoothstep(17.2, 20.6, s));
      const ambient = f.state.reduced ? 0 : f.elapsed * 0.012;
      // Near the Earth the camera faces the Americas, between the two cities,
      // leaning toward the day/night line so it crosses the globe whatever the
      // hour; then it swings back to its wider path as the view opens to the Sun.
      const facing = tmp2.copy(viewCenter).applyQuaternion(earth.quaternion);
      const fromNoon = Math.acos(Math.max(-1, Math.min(1, facing.dot(sun))));
      const lean = Math.max(-0.4, Math.min(0.4, fromNoon - 1.35));
      const axis = tmp3.copy(facing).cross(sun);
      if (axis.lengthSq() > 1e-6) facing.applyAxisAngle(axis.normalize(), lean);
      const near = 1 - smoothstep(7.9, 9.6, s);
      const baseAz = 0.6 + ambient;
      const cityAz = Math.atan2(facing.x, facing.z) + ambient * 0.3;
      const turn = Math.atan2(Math.sin(cityAz - baseAz), Math.cos(cityAz - baseAz));
      const az = baseAz + turn * near + f.drag.x;
      const baseEl = lerp(lerp(0.1, 0.42, smoothstep(8.5, 12.5, s)), 1.0, smoothstep(17, 20.5, s));
      const el = lerp(baseEl, Math.asin(facing.y), near) + f.drag.y * 0.4;
      camera.aspect = f.aspect;
      compose(camera, f);
      orbit(camera, target, D, az, Math.max(-1.4, Math.min(1.45, el)));

      const rise = range(f.local, 0.2, 5.5);
      sky.follow(camera, f.aspect);
      sky.material.uniforms.uRise.value = f.state.reduced ? 1 : rise;
      sky.material.uniforms.uOpacity.value = w * (1 - smoothstep(18.5, 20.5, s));
      sky.material.uniforms.uPixelRatio.value = f.pixelRatio;
      renderer.render(sky.scene, sky.camera);

      const earthA = smoothstep(6.6, 7.35, s) * (1 - smoothstep(9.2, 10.2, s));
      earthMat.uniforms.uOpacity.value = w * earthA;
      earthMat.uniforms.uSize.value = f.mobile ? 1.4 : 1.2;
      const cityA = earthA * smoothstep(CITY_LINE - 0.5, CITY_LINE + 1.5, f.local) * (1 - smoothstep(SUN_LINE + 1, SUN_LINE + 3, f.local));
      cityMat.uniforms.uOpacity.value = w * cityA;
      arcMat.uniforms.uOpacity.value = w * cityA * 0.8;
      const sysA = smoothstep(9.6, 11.0, s) * (1 - smoothstep(15.2, 16.6, s));
      orbitMat.uniforms.uOpacity.value = w * sysA * 0.32;
      bodyMat.uniforms.uOpacity.value = w * smoothstep(9.0, 10.5, s) * (1 - smoothstep(17.5, 19.0, s));
      const pxA = smoothstep(15.6, 16.4, s) * (1 - smoothstep(17.6, 18.4, s));
      pxMat.uniforms.uOpacity.value = w * pxA;
      galMat.uniforms.uOpacity.value = w * smoothstep(16.8, 19.2, s);
      // Its outer stars turn too fast, and something unseen holds them.
      const turning = f.state.reduced ? 0 : Math.max(0, f.local - FAST);
      galaxy.rotation.y = -0.06 * turning * Math.min(1, turning / 4);
      const haloA = smoothstep(HALO, HALO + 3, f.local);
      haloMat.uniforms.uOpacity.value = w * haloA;
      for (const m of [earthMat, cityMat, bodyMat, pxMat, galMat, haloMat]) m.uniforms.uPixelRatio.value = f.pixelRatio;
      renderer.render(scene, camera);

      const L = (text: string, at: THREE.Vector3, a: number, side?: Label['side']) => labelAt(text, at, camera, f, a, side);
      // A place on the Earth is labelled only while it faces the camera.
      const onNearSide = (local: THREE.Vector3) => {
        const p = tmp3.copy(local).applyQuaternion(earth.quaternion);
        return p.clone().normalize().dot(tmp4.copy(camera.position).sub(p).normalize()) > 0.15 ? p.clone() : null;
      };
      const cityLabels = CITIES.map((c, i) => {
        const p = onNearSide(cityAt[i]);
        return p ? L(`${c.name} · ${clock[i].format(now)}`, p, cityA, i === 0 ? 'left' : 'right') : null;
      });
      const mid = onNearSide(arcMid);
      return [
        ...cityLabels,
        mid ? L(`${DISTANCE_KM.toLocaleString('en-US')} km apart`, mid, cityA * 0.9) : null,
        L('Earth', tmp.set(0, EARTH_R * 1.4, 0), earthA * smoothstep(7.3, 7.45, s) * (1 - cityA)),
        L('Earth', planetPos[2], sysA * (1 - smoothstep(12.2, 12.6, s))),
        L('The Sun · 8 light-minutes', sun, sysA * (1 - smoothstep(12.6, 13, s)) * smoothstep(10.6, 11, s), 'left'),
        L('Jupiter', planetPos[4], sysA * smoothstep(11.6, 12, s) * (1 - smoothstep(13.6, 14, s))),
        L('Neptune · 30 AU', planetPos[7], sysA * smoothstep(12.3, 12.7, s) * (1 - smoothstep(14.6, 15, s))),
        L('Proxima Centauri · 4.24 light-years', proxima, pxA),
        L('The Sun is here', sun, smoothstep(19.4, 20, s) * w * (1 - smoothstep(FAST - 1, FAST, f.local)), 'left'),
        L('Outer stars · too fast for what we can see', tmp.copy(outerStar).applyAxisAngle(Y, galaxy.rotation.y).add(center), smoothstep(FAST, FAST + 1, f.local) * (1 - smoothstep(HALO - 0.5, HALO + 0.5, f.local))),
        L('Dark matter halo · illustrative', haloMark, haloA * (1 - smoothstep(HALO + 7, HALO + 9, f.local))),
      ].filter(present);
    },
    dispose() {
      sky.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Points || o instanceof THREE.Line) o.geometry.dispose();
      });
      [earthMat, cityMat, arcMat, bodyMat, pxMat, galMat, haloMat, orbitMat].forEach((m) => m.dispose());
    },
  };
}
