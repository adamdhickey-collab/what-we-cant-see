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
  uniform float uTime, uOpacity, uDusk, uLift, uAndromeda, uMotion, uReveal;
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

  float landY(float x) { return 0.115 + 0.11 * smoothstep(0.3, 1.05, x) + 0.006 * sin(x * 23.0) + 0.016 * (noise(vec2(x * 14.0, 1.0)) - 0.5); }

  // One edge of a polygon, for its distance d and its inside/outside sign s.
  void edge(vec2 p, vec2 a, vec2 b, inout float d, inout float s) {
    vec2 e = b - a, w = p - a;
    vec2 h = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
    d = min(d, dot(h, h));
    bvec3 c = bvec3(p.y >= a.y, p.y < b.y, e.x * w.y > e.y * w.x);
    if (all(c) || all(not(c))) s = -s;
  }

  // The rock they sit on: one boulder with a flat top where they sit, a
  // chipped shoulder at each end and faceted sides, its base buried in the
  // sand. The top runs from behind their hips to past their feet.
  float rock(vec2 p, vec2 c) {
    vec2 q = p - c;
    float d = 1e3, s = 1.0;
    edge(q, vec2(-0.035, 0.026), vec2(0.066, 0.025), d, s);
    edge(q, vec2(0.066, 0.025), vec2(0.08, 0.013), d, s);
    edge(q, vec2(0.08, 0.013), vec2(0.089, -0.008), d, s);
    edge(q, vec2(0.089, -0.008), vec2(0.084, -0.04), d, s);
    edge(q, vec2(0.084, -0.04), vec2(-0.05, -0.04), d, s);
    edge(q, vec2(-0.05, -0.04), vec2(-0.055, -0.002), d, s);
    edge(q, vec2(-0.055, -0.002), vec2(-0.046, 0.017), d, s);
    edge(q, vec2(-0.046, 0.017), vec2(-0.035, 0.026), d, s);
    return s * sqrt(d) - 0.0015 + 0.0018 * (fbm(p * 70.0) - 0.5);
  }

  // The person, traced from a reference image and drawn to uFigure (see
  // figure.ts). q is in figure units: 1.0 is a standing height, the origin
  // under the hips. FIG_K is figure units per traced pixel.
  const float FIG_K = 0.00157;
  vec2 figureUv(vec2 q) {
    vec2 ip = vec2(q.x / FIG_K + 45.0, 332.0 - q.y / FIG_K);
    return vec2(ip.x / 371.0, 1.0 - ip.y / 361.0);
  }
  float person(vec2 q) { return texture2D(uFigure, figureUv(q)).a; }
  // The same, blurred by sampling a coarser mip, for a smooth outward normal.
  float personSoft(vec2 q) { return texture2D(uFigure, figureUv(q), 2.5).a; }

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

      // Stars on a pixel grid a few device pixels square.
      float PX = max(2.0, floor(uRes.y / 420.0));
      vec2 px = floor(gl_FragCoord.xy / PX);
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
    // Rim light from the low sun: a crisp hot edge where the light first
    // lands, and a glow behind it that fades a few pixels in. An edge that
    // faces the sun squarely takes a wide rim; one the light only grazes
    // takes a hairline; one turned away takes none. Edges that face up catch
    // a little cool sky instead.
    vec2 toSun = normalize(sun - p);
    float fpx = 1.0 / (uRes.y * s);
    vec2 h = vec2(1.5 * fpx, 0.0);
    vec2 n = -normalize(vec2(personSoft(fq + h.xy) - personSoft(fq - h.xy), personSoft(fq + h.yx) - personSoft(fq - h.yx)) + 1e-6);
    float facing = smoothstep(-0.15, 0.85, dot(n, toSun));
    float reach = mix(0.5, 2.2, facing);
    float edgeLit = fig * facing * (0.85 + 0.3 * noise(fq * 90.0));
    float core = edgeLit * (1.0 - person(fq + toSun * 0.9 * fpx));
    float glow = 0.0;
    for (int k = 1; k <= 5; k++) {
      float dk = float(k) * 0.9;
      glow = max(glow, (1.0 - person(fq + toSun * dk * fpx)) * exp(-(dk - 0.9) / reach));
    }
    glow *= edgeLit;
    float sky = fig * (1.0 - person(fq + vec2(0.0, 1.2) * fpx)) * smoothstep(0.3, 0.9, n.y);
    vec3 ground = INK * 0.55 + COPPER * 0.04 * fbm(p * 40.0);
    vec3 stoneCol = INK * 0.5 + mix(SLATE, COPPER, 0.25) * 0.1 * fbm(p * vec2(60.0, 140.0) + 3.0);
    vec3 body = INK * 0.42;
    col = mix(col, ground, land);
    col = mix(col, stoneCol, stone);
    // The flat top of the rock catches the sky along its lip.
    col += mix(COPPER, VIOLET, 0.35) * 0.16 * stone * smoothstep(-0.0025, 0.0, dr) * smoothstep(rockC.y + 0.018, rockC.y + 0.024, p.y) * (1.0 - uDusk * 0.5);
    col = mix(col, body, fig);
    col += (COPPER * 0.42 * glow + mix(COPPER, IVORY, 0.5) * 0.55 * core) * (1.0 - uDusk * 0.5);
    col += mix(VIOLET, IVORY, 0.3) * 0.14 * sky * (1.0 - uDusk * 0.4);
    // Wet sand where the water reaches, and a thin lapping edge.
    float wet = exp(-abs(uv.y - ly) * uRes.y * 0.6) * smoothstep(0.35, 0.9, uv.x);
    float lap = 0.5 + 0.5 * sin(uv.x * 140.0 - t * 0.9 + noise(vec2(uv.x * 30.0, t * 0.3)) * 4.0);
    col += COPPER * 0.08 * wet * (1.0 - uDusk * 0.5);
    col += IVORY * 0.03 * lap * exp(-abs(uv.y - ly - 0.004) * uRes.y * 0.35) * (1.0 - land);

    col += (hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.028;
    col *= 0.82 + 0.18 * smoothstep(1.1, 0.2, length((uv - 0.5) * vec2(aspect * 0.7, 1.0)));
    gl_FragColor = vec4(col, uOpacity);
  }
`;
