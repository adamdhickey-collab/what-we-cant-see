import * as THREE from 'three';
import type { Frame, Label } from './types';

const v = new THREE.Vector3();

/** Project a world point to a label, or nothing if it is behind the camera or off screen. */
export function labelAt(text: string, world: THREE.Vector3, camera: THREE.Camera, f: Frame, opacity: number, side?: Label['side']): Label | null {
  if (opacity <= 0.01) return null;
  v.copy(world).project(camera);
  if (v.z > 1 || v.z < -1 || Math.abs(v.x) > 0.96 || Math.abs(v.y) > 0.96) return null;
  return { text, x: (v.x * 0.5 + 0.5) * f.width, y: (-v.y * 0.5 + 0.5) * f.height, opacity: opacity * f.weight, side };
}

/** Camera distance at which a width of 10^scale meters fills the short side of the view. */
export function distanceFor(scale: number, metersPerUnit: number, fovDeg: number, aspect: number) {
  const tan = Math.tan((fovDeg * Math.PI) / 360);
  return Math.pow(10, scale) / metersPerUnit / (2 * tan * Math.min(1, aspect));
}

/**
 * Frame the subject clear of the narration: right of center and a little
 * high on a wide screen, where the caption sits lower left, and higher on a
 * phone, where the caption fills the bottom. Call before updateProjectionMatrix.
 */
export function compose(camera: THREE.PerspectiveCamera, f: Frame, shift = 0.12) {
  const x = f.aspect > 1.2 ? -f.width * shift : 0;
  // On a wide screen the caption sits along the bottom, so the subject rides a little high.
  const y = f.aspect < 0.8 ? f.height * 0.12 : f.height * 0.06;
  camera.setViewOffset(f.width, f.height, x, y, f.width, f.height);
}

/** Place a camera on a sphere around a target. */
export function orbit(camera: THREE.PerspectiveCamera, target: THREE.Vector3, distance: number, azimuth: number, elevation: number) {
  const ce = Math.cos(elevation);
  camera.position.set(
    target.x + distance * ce * Math.sin(azimuth),
    target.y + distance * Math.sin(elevation),
    target.z + distance * ce * Math.cos(azimuth),
  );
  camera.near = distance * 1e-3;
  camera.far = distance * 1e5;
  camera.lookAt(target);
  camera.updateProjectionMatrix();
}

export const present = (x: Label | null): x is Label => x !== null;
