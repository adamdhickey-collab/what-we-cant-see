// One point shader for every particle scene. Each point is a soft disc whose
// falloff is the glow, drawn additively, so light gathers where points
// gather and nowhere else: no bloom pass. Scenes add behavior by injecting
// small chunks of GLSL rather than forking the whole shader.

import * as THREE from 'three';
import { PALETTE_GLSL } from './palette';

export interface PointsChunks {
  /** Extra attribute and uniform declarations. */
  decls?: string;
  /** Runs before projection; may change `pos`, `col` and `alpha`. */
  object?: string;
  /** Runs in view space; may change `mv`. */
  view?: string;
  uniforms?: Record<string, THREE.IUniform>;
  blending?: THREE.Blending;
}

export function pointsMaterial(chunks: PointsChunks = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 1 },
      uSize: { value: 1 },
      uPixelRatio: { value: 1 },
      uAtten: { value: 0 },
      uRef: { value: 1 },
      uTime: { value: 0 },
      ...chunks.uniforms,
    },
    vertexShader: /* glsl */ `
      ${PALETTE_GLSL}
      uniform float uOpacity, uSize, uPixelRatio, uAtten, uRef, uTime;
      attribute vec3 aColor;
      attribute float aSize;
      ${chunks.decls ?? ''}
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        vec3 col = aColor;
        float alpha = 1.0;
        float size = aSize;
        ${chunks.object ?? ''}
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        ${chunks.view ?? ''}
        gl_Position = projectionMatrix * mv;
        float s = uSize * size * uPixelRatio;
        // Depth: near points grow, far ones dim, and none shrinks below a pixel.
        if (uAtten > 0.5) {
          float k = uRef / max(-mv.z, 1e-9);
          s *= clamp(k, 1.0, 4.0);
          alpha *= clamp(k * 2.5, 0.3, 1.0);
        }
        gl_PointSize = clamp(s, 1.0, 256.0);
        vColor = col;
        // A point smaller than a pixel fades instead of shimmering.
        vAlpha = uOpacity * alpha * min(s, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = 1.0 - smoothstep(0.0, 1.0, d);
        a *= a;
        if (a * vAlpha < 0.004) discard;
        gl_FragColor = vec4(vColor, a * vAlpha);
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: chunks.blending ?? THREE.AdditiveBlending,
  });
}

/** Build a geometry from flat arrays. */
export function pointsGeometry(positions: Float32Array, colors: Float32Array, sizes: Float32Array, extra: Record<string, [Float32Array, number]> = {}) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  for (const [name, [arr, n]] of Object.entries(extra)) g.setAttribute(name, new THREE.BufferAttribute(arr, n));
  // Bounds never matter: nothing here is frustum-culled.
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);
  return g;
}

/** Fine lines, drawn additively in a palette color. */
export function lineMaterial(color: [number, number, number], opacity = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Vector3(...color) }, uOpacity: { value: opacity } },
    vertexShader: `void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; void main(){ gl_FragColor = vec4(uColor, uOpacity); }`,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}
