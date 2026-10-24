import * as THREE from 'three';
import type { Frame, Label } from './types';

const v = new THREE.Vector3();

/** Project a world point to a label, or nothing if it is behind the camera or off screen. */
export function labelAt(text: string, world: THREE.Vector3, camera: THREE.Camera, f: Frame, opacity: number, side: Label['side'] = 'right'): Label | null {
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
