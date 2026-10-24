# Technology

Versions as resolved on 2026-10-24.

| Package | Version | Why |
| --- | --- | --- |
| `vite` | 8 | Dev server and build. Static output, deploys anywhere |
| `typescript` | 5.9 | 7.x (the native port) is new; 5.9 is the reliable line |
| `react`, `react-dom` | 19 | The HTML layer: narrative, controls, sources, the two data instruments |
| `three` | 0.186 | One WebGL renderer for every spatial scene |
| `d3-scale` | 4 | The log scale under the navigator and the search, linear scales for the light curve |

## What was weighed and not taken

**React Three Fiber.** R3F is excellent when the scene graph *is* the UI
state. Here it is not: there is one canvas, a handful of large point clouds,
and a clock that crossfades between whole scenes. That is a render loop with
four uniforms per scene, and a reconciler in front of it adds a dependency
and an indirection without removing any code. React owns the HTML; one
imperative `Stage` owns the GPU; they share exactly one thing, the director's
clock. If a later chapter wants rich, component-shaped 3D (an inspectable
molecule with picking, say), R3F can mount into its own canvas for that
chapter without touching the rest.

**GSAP and ScrollTrigger.** The brief asks for both, and neither is in. The
experience has one source of time, the director, and every scene is a pure
function of it, so guided play, scrubbing, chapter jumps and replay are the
same code path. GSAP would be a second clock to keep in step with the first,
and ScrollTrigger is scroll-driven, which this piece deliberately is not:
Explore mode is a scrubber, not a hijacked scroll. Easing is eight lines in
`src/animation/ease.ts`. If a later chapter wants GSAP's timeline authoring,
drive a paused GSAP timeline's `progress()` from the director.

**Postprocessing.** No bloom pass. Points are drawn additively with a soft
falloff in their own fragment shader, which gives the glow where it belongs
and nowhere else, at no extra full-screen pass. The shoreline shader does its
own grain and vignette. The brief warns against excess bloom, and the cheapest
way to have none is not to own one.

**WebGPU and TSL.** Three's `WebGPURenderer` and TSL are the upgrade path,
and the scenes are written so that path is short: every material is a small
`ShaderMaterial` with uniforms named after what they mean, all geometry is
plain `BufferGeometry`, and nothing depends on WebGL extensions beyond
instanced points. Today WebGL2 is the reliable target across Safari, Chrome
and Firefox on phones; the switch is a renderer swap plus porting five short
shaders to TSL.

## Which technology draws which scene

| Chapter | Medium | Why |
| --- | --- | --- |
| 1, 7 Shore | Full-screen fragment shader | Sky, sea and light are fields, not objects. A shader paints them at any resolution in one pass, and the figure is negative space |
| 2 Horizon | Three.js points + lines | Real orbit ratios as fine lines; a procedural galaxy of up to 120,000 points |
| 3 Structure | Three.js points | Up to 200,000 points along filaments; the largest single moment |
| 4 Patterns | 2D canvas + D3 scales, over a dimmed starfield | Thousands of measurements and a live search are a chart's job. Canvas, not SVG, because 3,803 points redraw every frame while folding |
| 5, 6 Within, Instrument | Three.js points + a line through a real structure | 393 real residues from AlphaFold DB, colored by confidence |
| All | HTML typography | Text is text: selectable, translatable, read by screen readers |

## Performance budget

- One `WebGLRenderer`, `powerPreference: 'high-performance'`, pixel ratio
  capped at 2 on desktop and 1.5 on phones.
- Point budgets are halved below 768px and on devices reporting
  `hardwareConcurrency <= 4`.
- Scenes outside the current crossfade window are not drawn at all.
- The protein JSON (~20 KB) is fetched after first paint, and the period
  search (about 0.1 s) runs in an idle callback, so neither is waited for.
- Three.js is most of the 235 KB gzipped bundle. Splitting it from the
  first load, so the intro paints from HTML alone, is the next cut.

## Fallbacks

- **No WebGL**: the stage reports failure, the page shows a static gradient
  ground, and every chapter's text, the scale navigator and the light-curve
  instrument still work. Nothing important lives only in the canvas.
- **Reduced motion**: guided play does not start by itself; chapter changes
  are crossfades with no camera travel; the scenes hold a still composition.
