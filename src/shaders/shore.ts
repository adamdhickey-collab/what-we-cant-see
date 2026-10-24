// The shore at dusk, painted in one full-screen pass. Sky, sea and light are
// fields rather than objects, and the person is negative space: a silhouette
// cut from the reflected glow, small enough that nothing about them is drawn
// except that they are there, looking.

import { PALETTE_GLSL } from './palette';

export const shoreVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const shoreFragment = /* glsl */ `
  precision highp float;
  ${PALETTE_GLSL}
  uniform vec2 uRes;
  uniform float uTime, uOpacity, uDusk, uLift, uAndromeda, uMotion;
  varying vec2 vUv;

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  float capsule(vec2 p, vec2 a, vec2 b, float r) {
    vec2 pa = p - a, ba = b - a;
    return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)) - r;
  }
  float landY(float x) { return 0.115 + 0.11 * smoothstep(0.3, 1.05, x) + 0.006 * sin(x * 23.0) + 0.016 * (noise(vec2(x * 14.0, 1.0)) - 0.5); }
  // Someone seated, knees up, arms around them. Units are fractions of the frame's height.
  float person(vec2 p, vec2 b) {
    float d = length(p - (b + vec2(-0.003, 0.064))) - 0.0092;
    d = min(d, capsule(p, b + vec2(-0.005, 0.012), b + vec2(-0.002, 0.05), 0.0102));
    d = min(d, capsule(p, b + vec2(-0.004, 0.01), b + vec2(0.021, 0.025), 0.0071));
    d = min(d, capsule(p, b + vec2(0.021, 0.025), b + vec2(0.027, 0.001), 0.0061));
    d = min(d, capsule(p, b + vec2(0.0, 0.045), b + vec2(0.019, 0.027), 0.0044));
    return d;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
    float H = 0.42;
    float t = uTime * uMotion;
    vec2 sun = vec2(0.18 * aspect, H - 0.05);
    vec3 col;

    if (uv.y >= H) {
      float h = (uv.y - H) / (1.0 - H);
      vec3 zen = mix(SLATE, INK, 0.35 + 0.65 * uDusk);
      vec3 mid = mix(VIOLET * 0.6, SLATE * 0.9, uDusk);
      vec3 low = mix(COPPER * 0.9, COPPER * 0.5 + VIOLET * 0.12, uDusk);
      col = mix(low, mid, smoothstep(0.0, 0.3, h));
      col = mix(col, zen, smoothstep(0.2, 0.95, h));
      float d = length((p - sun) * vec2(0.55, 1.0));
      col += COPPER * 0.32 * exp(-d * 4.5) * (1.0 - uDusk * 0.55);

      // Stars come out as the sky darkens.
      vec2 g = vec2(p.x, uv.y) * 120.0;
      vec2 id = floor(g);
      float r = hash(id);
      vec2 f = fract(g) - 0.5 - (vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5) * 0.6;
      float star = step(0.9965, r) * (1.0 - smoothstep(0.0, 0.11, length(f)));
      float tw = 0.75 + 0.25 * sin(t * 1.7 + r * 80.0);
      col += IVORY * star * tw * smoothstep(0.1, 0.7, h) * smoothstep(0.25, 0.75, uDusk) * (0.35 + 0.65 * hash(id + 3.0));

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
      vec3 sea = mix(mix(VIOLET * 0.45, SLATE * 0.8, uDusk), INK * 0.9, smoothstep(0.0, 0.9, depth));
      float dx = p.x - sun.x;
      float column = exp(-dx * dx / (0.01 + depth * 0.09));
      float glints = smoothstep(0.52, 0.72, rip) * smoothstep(0.0, 0.08, depth);
      col = sea + COPPER * column * (0.16 + 0.5 * glints) * (1.0 - depth * 0.6) * (1.0 - uDusk * 0.45);
      col += mix(COPPER, VIOLET, 0.4) * 0.22 * exp(-depth * 18.0) * (1.0 - uDusk * 0.4);
    }

    // The horizon: a hairline that resolves into a row of points.
    float py = (uv.y - H) * uRes.y;
    float line = exp(-py * py * 0.35) * 0.5;
    float S = 9.0 * max(1.0, uRes.y / 900.0);
    vec2 c = vec2(mod(gl_FragCoord.x, S) - S * 0.5, py);
    float dotm = 1.0 - smoothstep(0.6, 1.6, length(c));
    float bright = 0.5 + 0.5 * hash(vec2(floor(gl_FragCoord.x / S), 3.0));
    col += IVORY * (line * (1.0 - uLift) + dotm * uLift * (0.5 + 0.5 * bright)) * (1.0 - 0.35 * uDusk);

    // The shore and the person on it.
    float ly = landY(uv.x);
    float land = 1.0 - smoothstep(ly - 0.0015, ly + 0.0015, uv.y);
    vec2 base = vec2(0.1 * aspect, landY(0.6));
    float fig = 1.0 - smoothstep(-0.0012, 0.0012, person(p, base));
    vec3 ground = INK * 0.55 + COPPER * 0.04 * fbm(p * 40.0);
    col = mix(col, ground, max(land, fig));
    col += COPPER * 0.08 * exp(-abs(uv.y - ly) * uRes.y * 0.6) * smoothstep(0.35, 0.9, uv.x) * (1.0 - uDusk * 0.5);

    col += (hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.028;
    col *= 0.82 + 0.18 * smoothstep(1.1, 0.2, length((uv - 0.5) * vec2(aspect * 0.7, 1.0)));
    gl_FragColor = vec4(col, uOpacity);
  }
`;
