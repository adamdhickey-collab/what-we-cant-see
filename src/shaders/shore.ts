// The shore at dusk, painted in one full-screen pass. Sky, sea and light are
// fields rather than objects. The person is a silhouette on a rock, rim-lit by
// what is left of the sun, small enough that nothing about them is drawn
// except that they are there, looking.
//
// Two things the eye cannot see are drawn faintly over the scene: the stars,
// which switch on one pixel at a time as the sky darkens (brightest first, as
// they do), and the seabed under the water, mapped as depth contours that a
// sounding sweeps outward from the shore.

import { PALETTE_GLSL } from './palette';

export const shoreVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const shoreFragment = /* glsl */ `
  precision highp float;
  ${PALETTE_GLSL}
  uniform vec2 uRes;
  uniform float uTime, uOpacity, uDusk, uLift, uAndromeda, uMotion, uReveal, uStipple;
  uniform sampler2D uFigure;
  varying vec2 vUv;

  const float H = 0.42;

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
  float ellipse(vec2 p, vec2 c, vec2 r) { return (length((p - c) / r) - 1.0) * min(r.x, r.y); }

  // The centre of a grid cell, in scene coordinates.
  vec2 cellCentre(vec2 cell, float size, float aspect) {
    vec2 f = (cell + 0.5) * size / uRes;
    return vec2((f.x - 0.5) * aspect, f.y);
  }

  float landY(float x) { return 0.115 + 0.11 * smoothstep(0.3, 1.05, x) + 0.006 * sin(x * 23.0) + 0.016 * (noise(vec2(x * 14.0, 1.0)) - 0.5); }

  // The rock they sit on: three stones fused, with a weathered edge.
  float rock(vec2 p, vec2 c) {
    float d = ellipse(p, c + vec2(0.0, 0.0), vec2(0.058, 0.032));
    d = smin(d, ellipse(p, c + vec2(0.048, -0.008), vec2(0.036, 0.022)), 0.012);
    d = smin(d, ellipse(p, c + vec2(-0.05, -0.012), vec2(0.032, 0.02)), 0.012);
    return d + 0.0035 * (fbm(p * 70.0) - 0.5);
  }

  // The person, traced from a reference image and drawn to uFigure (see
  // figure.ts). q is in figure units: 1.0 is a standing height, the origin
  // under the hips. FIG_K is figure units per traced pixel.
  const float FIG_K = 0.00157;
  float person(vec2 q) {
    vec2 ip = vec2(q.x / FIG_K + 45.0, 332.0 - q.y / FIG_K);
    vec2 fuv = vec2(ip.x / 371.0, 1.0 - ip.y / 361.0);
    return texture2D(uFigure, fuv).a;
  }

  vec3 skyColor(float h, vec2 p, vec2 sun) {
    vec3 zen = mix(SLATE, INK, 0.35 + 0.65 * uDusk);
    vec3 mid = mix(VIOLET * 0.6, SLATE * 0.9, uDusk);
    vec3 low = mix(COPPER * 0.9, COPPER * 0.5 + VIOLET * 0.12, uDusk);
    vec3 col = mix(low, mid, smoothstep(0.0, 0.3, h));
    col = mix(col, zen, smoothstep(0.2, 0.95, h));
    float d = length((p - sun) * vec2(0.55, 1.0));
    return col + COPPER * 0.32 * exp(-d * 4.5) * (1.0 - uDusk * 0.55);
  }

  // One layer of stars on a coarse pixel grid. Each cell may hold one star at
  // one pixel; it is born when the sky is dark enough for its brightness,
  // flashes once, then twinkles in steps rather than smoothly.
  vec3 starLayer(vec2 px, float G, float density, float seed, float avail, float t, bool cross) {
    vec2 gc = floor(px / G);
    float r = hash(gc + seed);
    if (r > density) return vec3(0.0);
    vec2 sp = gc * G + floor(vec2(hash(gc + seed + 1.7), hash(gc + seed + 9.2)) * (G - 2.0)) + 1.0;
    vec2 o = px - sp;
    float mag = hash(gc + seed + 4.4);                  // 0 faint .. 1 bright
    float birth = 1.0 - mag;                            // bright stars come out first
    float age = avail - birth;
    if (age < 0.0) return vec3(0.0);
    float on = (o.x == 0.0 && o.y == 0.0) ? 1.0 : 0.0;
    if (cross && mag > 0.8) on += (abs(o.x) + abs(o.y) == 1.0 ? 0.35 : 0.0);
    if (on == 0.0) return vec3(0.0);
    float flash = 1.0 + 1.6 * exp(-age * 30.0);
    float tw = floor((0.72 + 0.28 * sin(t * (1.1 + 2.0 * r) + r * 90.0)) * 4.0) / 4.0;
    vec3 tint = hash(gc + seed + 2.1) < 0.2 ? mix(IVORY, VIOLET, 0.6) : (hash(gc + seed + 3.3) < 0.12 ? mix(IVORY, COPPER, 0.5) : IVORY);
    return tint * on * (0.25 + 0.75 * mag * mag) * tw * flash * smoothstep(0.0, 0.08, age);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
    float t = uTime * uMotion;
    vec2 sun = vec2(0.18 * aspect, H - 0.05);
    vec3 col;
    // Stars and stipple share one pixel grid a few device pixels square.
    float PX = max(2.0, floor(uRes.y / 420.0));
    vec2 px = floor(gl_FragCoord.xy / PX);

    // Where the person sits, in screen and in sea coordinates.
    float rockX = 0.1 * aspect;
    vec2 rockC = vec2(rockX, landY(0.6) + 0.004);
    vec2 seat = rockC + vec2(-0.012, 0.027);

    if (uv.y >= H) {
      float h = (uv.y - H) / (1.0 - H);
      col = skyColor(h, p, sun);

      // A faint river of the galaxy, which only a dark sky lets you see.
      vec2 bq = mat2(0.94, 0.34, -0.34, 0.94) * (p - vec2(-0.1 * aspect, 0.8));
      float band = exp(-bq.y * bq.y * 38.0);
      float dark = smoothstep(0.45, 0.72, uDusk) * smoothstep(0.08, 0.5, h);
      col += mix(VIOLET, IVORY, 0.3) * 0.045 * band * (0.4 + fbm(bq * vec2(5.0, 14.0))) * dark;

      float avail = smoothstep(0.24, 0.66, uDusk) * 1.08;
      vec3 stars = starLayer(px, 7.0, 0.16 + 0.5 * band, 0.0, avail * 0.9, t, false) * 0.55;
      stars += starLayer(px, 23.0, 0.55, 31.0, avail, t, true);
      float extinction = smoothstep(0.02, 0.35, h) * (1.0 - 0.8 * exp(-length((p - sun) * vec2(0.5, 1.0)) * 3.0));
      col += stars * extinction;

      // Andromeda: a faint, tilted smudge, as an eye sees it from a dark shore.
      vec2 q = p - vec2(-0.3 * aspect, 0.76);
      q = mat2(0.87, -0.5, 0.5, 0.87) * q;
      float ad = length(q * vec2(1.0, 3.2));
      col += IVORY * 0.22 * uAndromeda * (exp(-ad * 40.0) + 0.35 * exp(-ad * 12.0));
    } else {
      float depth = (H - uv.y) / H;
      float persp = 1.0 / (depth + 0.02);
      vec2 wp = vec2(p.x * persp * 0.6, persp);
      float rip = fbm(vec2(wp.x * 1.5, wp.y * 2.0 - t * 0.25)) * 0.6 + fbm(vec2(wp.x * 4.0, wp.y * 5.0 + t * 0.4)) * 0.4;

      // The surface mirrors the sky, broken by the swell, and darkens toward the shore.
      float mh = clamp(depth * 0.55 + (rip - 0.5) * 0.12 * (1.0 - depth * 0.5), 0.0, 1.0);
      vec3 mirror = skyColor(mh, vec2(p.x, H + mh * (1.0 - H)), sun);
      vec3 deep = mix(mix(VIOLET * 0.4, SLATE * 0.75, uDusk), INK * 0.85, smoothstep(0.0, 0.9, depth));
      float fres = 0.55 * exp(-depth * 3.5) + 0.12;
      vec3 sea = mix(deep, mirror, fres);
      float dx = p.x - sun.x;
      float column = exp(-dx * dx / (0.01 + depth * 0.09));
      float glints = smoothstep(0.52, 0.72, rip) * smoothstep(0.0, 0.08, depth);
      col = sea + COPPER * column * (0.16 + 0.5 * glints) * (1.0 - depth * 0.6) * (1.0 - uDusk * 0.45);
      col += mix(COPPER, VIOLET, 0.4) * 0.18 * exp(-depth * 18.0) * (1.0 - uDusk * 0.4);

      // The seabed nobody here can see: depth contours, a map laid under the
      // water. Lines wobble with the surface they are seen through, and fade
      // where perspective packs them closer than a few pixels.
      vec2 wf = vec2(rockX * 1.5 * 0.6, 1.5);
      float F = wp.y * 0.3 + 10.0 * fbm(wp * vec2(0.24, 0.15) + 7.0) + (rip - 0.5) * 0.3;
      float w = fwidth(F);
      float gl = abs(fract(F - 0.5) - 0.5) / max(w, 1e-4);
      float major = 1.0 - step(0.5, mod(floor(F + 0.5), 5.0));
      float iso = (1.0 - smoothstep(0.0, 1.0 + major * 0.6, gl)) * (1.0 - smoothstep(0.12, 0.45, w));
      float r = length((wp - wf) * vec2(1.0, 0.8));
      float front = uReveal * 62.0;
      float shown = 1.0 - smoothstep(front - 6.0, front, r);
      float edge = exp(-pow((r - front) * 0.22, 2.0)) * uReveal * (1.0 - uReveal);
      // After the sounding, a slow ping keeps going out, every eleven seconds.
      float ping = fract(t / 11.0) * 70.0;
      float pulse = exp(-pow((r - ping) * 0.3, 2.0)) * uMotion * uReveal;
      vec3 ink = mix(TEAL, VIOLET, 0.3);
      col += ink * iso * (0.13 + 0.17 * major) * shown * (1.0 + 2.0 * pulse);
      col += ink * iso * 1.2 * edge;
      col += TEAL * 0.05 * edge * smoothstep(0.0, 0.5, depth);
    }

    // The horizon is only where sky meets sea; at the end its edge resolves
    // into a row of points, which become the stars of the next chapter.
    float py = (uv.y - H) * uRes.y;
    col += mix(COPPER, IVORY, 0.4) * 0.05 * exp(-abs(py) * 0.05) * (1.0 - uDusk * 0.6);
    float S = 9.0 * max(1.0, uRes.y / 900.0);
    vec2 c = vec2(mod(gl_FragCoord.x, S) - S * 0.5, py);
    float dotm = 1.0 - smoothstep(0.6, 1.6, length(c));
    float bright = 0.5 + 0.5 * hash(vec2(floor(gl_FragCoord.x / S), 3.0));
    col += IVORY * dotm * uLift * (0.5 + 0.5 * bright) * (1.0 - 0.35 * uDusk);

    // The shore, the rock, and the person on it.
    float ly = landY(uv.x);
    float px1 = 1.5 / uRes.y;
    float land = 1.0 - smoothstep(ly - px1, ly + px1, uv.y);
    float dr = rock(p, rockC);
    float stone = 1.0 - smoothstep(-px1, px1, dr);
    float s = 0.15;
    vec2 fq = (p - seat) / s;
    float fig = person(fq);
    // Lit where the figure ends a pixel or two toward the sun.
    float rim = fig * (1.0 - person(fq + normalize(sun - p) * 2.0 * px1 / s));
    vec3 ground = INK * 0.55 + COPPER * 0.04 * fbm(p * 40.0);
    vec3 stoneCol = INK * 0.62 + mix(SLATE, COPPER, 0.25) * 0.08 * fbm(p * 90.0 + 3.0);
    vec3 body = INK * 0.42;

    // Stipple: as the light fails, what is near is seen as counted points, the
    // way a dark-adapted eye sees. Each grid cell holds one fixed threshold;
    // a point shows where the light at the cell's centre beats it, so points
    // stay where they are and only come and go as the light changes. Light
    // gathers where the forms face the sun and the sky. The grid is half the
    // stars', fine enough to model a figure a few dozen pixels tall.
    float seen = mix(1.0, 0.4, smoothstep(0.15, 0.75, uDusk));
    vec2 toSun = normalize(sun - p);
    float SP = max(1.0, floor(PX * 0.5));
    vec2 fc = floor(gl_FragCoord.xy / SP);
    vec2 pc = cellCentre(fc, SP, aspect);
    float grain = hash(fc + 17.0);
    float shoreLy = landY(pc.x / aspect + 0.5);
    float landLit = (0.01 + 0.26 * exp(-(shoreLy - pc.y) * 16.0) * (0.45 + 0.8 * exp(-abs(pc.x - sun.x) * 2.5))) * (0.5 + fbm(pc * 40.0));
    vec2 e = vec2(2.0 * SP / uRes.y, 0.0);
    float drc = rock(pc, rockC);
    vec2 rn = normalize(vec2(rock(pc + e.xy, rockC), rock(pc + e.yx, rockC)) - drc + 1e-6);
    float rockLit = (0.12 + 0.6 * smoothstep(-0.02, 0.0, drc)) * (0.08 + 0.45 * max(rn.y, 0.0) + 0.5 * max(dot(rn, toSun), 0.0)) * (0.6 + 0.8 * fbm(pc * 90.0 + 3.0));
    vec2 fqc = (pc - seat) / s;
    float fpx = SP / (uRes.y * s);
    float figLit = 0.03;
    figLit += 0.5 * (1.0 - person(fqc + toSun * 1.0 * fpx));
    figLit += 0.3 * (1.0 - person(fqc + toSun * 3.0 * fpx));
    figLit += 0.15 * (1.0 - person(fqc + toSun * 7.0 * fpx));
    figLit += 0.18 * (1.0 - person(fqc + vec2(0.0, 2.0) * fpx));
    vec3 groundPts = INK * 0.4 + mix(COPPER, VIOLET, 0.45) * 0.45 * step(grain, landLit * seen);
    vec3 stonePts = INK * 0.38 + mix(COPPER, VIOLET, 0.3) * 0.5 * step(grain, rockLit * 0.8 * seen);
    vec3 bodyPts = INK * 0.22 + mix(COPPER, IVORY, 0.3) * 0.7 * step(hash(fc + 29.0), figLit * seen);
    ground = mix(ground, groundPts, uStipple);
    stoneCol = mix(stoneCol, stonePts, uStipple);
    body = mix(body, bodyPts, uStipple);

    col = mix(col, ground, land);
    col = mix(col, stoneCol, stone);
    // The top of the rock catches the sky.
    col += mix(COPPER, VIOLET, 0.35) * 0.18 * stone * smoothstep(-0.006, 0.0, dr) * smoothstep(rockC.y - 0.01, rockC.y + 0.03, p.y) * (1.0 - uDusk * 0.5) * (1.0 - uStipple);
    col = mix(col, body, fig);
    col += mix(COPPER, IVORY, 0.25) * 0.6 * rim * (1.0 - uDusk * 0.5) * (1.0 - uStipple);
    // Wet sand where the water reaches, and a thin lapping edge.
    float wet = exp(-abs(uv.y - ly) * uRes.y * 0.6) * smoothstep(0.35, 0.9, uv.x);
    float lap = 0.5 + 0.5 * sin(uv.x * 140.0 - t * 0.9 + noise(vec2(uv.x * 30.0, t * 0.3)) * 4.0);
    col += COPPER * 0.08 * wet * (1.0 - uDusk * 0.5);
    col += IVORY * 0.03 * lap * exp(-abs(uv.y - ly - 0.004) * uRes.y * 0.35) * (1.0 - land);

    // Film grain, held off what is drawn in points so the points stay still.
    col += (hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.028 * (1.0 - uStipple * max(land, max(stone, fig)));
    col *= 0.82 + 0.18 * smoothstep(1.1, 0.2, length((uv - 0.5) * vec2(aspect * 0.7, 1.0)));
    gl_FragColor = vec4(col, uOpacity);
  }
`;
