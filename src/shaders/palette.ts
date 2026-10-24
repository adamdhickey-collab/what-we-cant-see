// The palette, once, for shaders. Values are display sRGB and go to the
// screen untouched; src/styles/tokens.css carries the same six for the page.
// Meaning: ivory is the human view, copper is observation, teal is a model,
// violet is what is unresolved.

export const PALETTE = {
  ink: [0x0a, 0x14, 0x23],
  slate: [0x17, 0x27, 0x3b],
  ivory: [0xf3, 0xf1, 0xea],
  copper: [0xcf, 0xa6, 0x7a],
  teal: [0x81, 0xc8, 0xc6],
  violet: [0x7c, 0x8e, 0xba],
} as const;

export type Swatch = keyof typeof PALETTE;

export const rgb = (name: Swatch): [number, number, number] => {
  const [r, g, b] = PALETTE[name];
  return [r / 255, g / 255, b / 255];
};

const v3 = (name: Swatch) => `vec3(${rgb(name).map((c) => c.toFixed(4)).join(', ')})`;

export const PALETTE_GLSL = `
const vec3 INK = ${v3('ink')};
const vec3 SLATE = ${v3('slate')};
const vec3 IVORY = ${v3('ivory')};
const vec3 COPPER = ${v3('copper')};
const vec3 TEAL = ${v3('teal')};
const vec3 VIOLET = ${v3('violet')};
`;

export const INK_HEX = 0x0a1423;
