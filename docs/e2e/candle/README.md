# Candle integration acceptance

The production view now uses `src/scripts/visuals/candle.ts`, selected through the existing Life view menu. Its progress comes from the same birthday/anniversary snapshot as the hourglass and seconds summary. The browser loads the nearest 3D render frame and keeps a small decoded-image cache. A restrained flame silhouette sway pauses for settings, reduced motion, hidden pages and inactive views. At 100% the flame is absent and the accepted grounded wax remains.

## Actual browser checks

Verified in ego-browser at `http://localhost:4321/lifecount/`:

- Current Me settings: 1995-01-01, maximum age 85 → 37.5%, frames 37/38.
- Maximum age 120 updates immediately → approximately 26.6%; reload preserves candle mode and age.
- Birthday 1900-01-01, maximum age 85 → 100%, remaining 0 seconds, frame 100.
- Future birthday 2026-11-18 → clamped 0%, complete candle.
- Grid → Hourglass → Candle: correct map/stage visibility and old renderer metadata removed (`transitions.json`).
- Biography tab switches to the grid and disables visual selection; returning to Me restores candle (`behavior.json`).
- English labels and summary; Seconds remains the disabled unit control in candle mode.
- Native fullscreen enters/exits successfully; 390px mobile layout has scrollWidth=390 (`mobile.png`).
- Reduced-motion media setting: canvas remains identical over a 350ms observation; normal mode changes the flame (`behavior.json`).
- A real missing-asset failure remains stable, offers Retry, and recovers after the file becomes available.

Screenshots are actual application captures. Original personal settings are restored after acceptance; test dates are not retained.

## Reproduce

Start the normal local application, select Life view → Candle, then perform the settings and view transitions listed above. Use the birth/max-age fields for endpoints, not video playback. Compare the displayed percentage with the elapsed/total seconds. Check flame motion with the browser's reduced-motion emulation and while settings are open. Return to original dates afterward.

## Rendering and limits

`public/images/candle/v4/000.webp` … `100.webp` contain the 101 progress states, with `manifest.json` documenting dimensions and total size. Rebuild using `/tmp/lifecount-candle-bpy/bin/python scripts/render-candle-assets.py` in the isolated Blender environment described in the prototype README. Delete/move stale output assets before rebuilding changed geometry: the script resumes existing frames.

The browser selects the nearest 1% raster state (100% remains exclusive to a completed lifetime); it does not run Blender or a thermal fluid solver. Scene geometry is procedural and life-progress-driven. This is the approved static sculpture extended into a lifecycle, not a claim of physically simulated melting. Source frames are 1536px square, rendered without a visible ground/shadow plane. The canvas retains source resolution and never enlarges a frame beyond its native pixels. Seconds and percentage remain continuous; only the baked geometry is quantized to 1%. The production runtime adds no new package dependency.

## Sharpness and ground-shadow regression

Run the async expression in `quality-probe.js` on the local Vite page using a DPR-2 browser. Set `window.candleQualityBase='/lifecount/images/candle/v4/'` first. It renders the annotated 76.5266% state at 672 × 557 CSS pixels, records actual draw calls, and cleans up its fixture afterward.

Before: source 640px, draw 1114px (1.740625× enlargement), intermediate alpha blend between frames 76/77. After: native 1536px frame, no interframe blend, no source enlargement. The outer-border test checks clipping/tint only; ground-shadow removal is guaranteed by hiding the floor in asset renders and visually inspected on white, not inferred solely from that border test.

The older screenshots and behavior reports above record the original integration. `quality-after.json` and `quality-review.html` document this subsequent quality fix.

## Flame sway

The renderer extracts the warm flame pixels above the dark wick into a small transparent layer once per loaded life frame. The original wax and wick remain stationary. An anchored shear and slight vertical stretch animate that layer at 30 fps with several slow frequencies. Suspension paints the neutral flame; the completed lifetime has no flame layer.

Open `sway-review.html` to run the actual transpiled renderer against embedded production frames, then pause/resume the motion. The acceptance checks compare rendered pixels at birth, 77%, 99%, and 100%, and verify suspended pixels remain unchanged. `sway-results.json` records the headless Chrome result; `sway-browser.png` records the displayed state. These checks do not model thermal fluid physics.

## Short single wick revision

The v3 scene replaces five overlapping fibres with one tapered, slightly curved charred wick (radius .012, height .16). The flame base moves from wickZ+.20 to wickZ+.13 so it overlaps the shortened tip. The source remains 1536px, 96 samples, with no visible ground plane.

The moving flame extraction is bounded by the scene's flame envelope and bright warm pixels so ivory wax near the lower flame root stays stationary. `wick-sway-review.html` embeds the production renderer and actual v3 assets for repeatable motion/pause checks; `wick-review.html` shows an equal-scale 77% before/after crop.

V3 acceptance: all 101 unique 1536px frames decode, no object touches the image border. Headless Chrome at DPR 2 passes moving-flame, stationary-wax, and paused-frame checks at 0%, 38%, 77%, 99%, and 100%. Terminal motion is zero. The local application serves the v3 asset with HTTP 200; Astro check and build pass.

## Bound multi-fibre wick revision

The v4 scene restores a compact multi-fibre body: a .024-radius core and four .009-radius outer fibres. The outer centres begin .023 from the core, intersect it rather than forming loose strands, and smoothly converge to the same centre at the tip. Both the .16 height and .13 flame-root offset are unchanged from v3. This keeps the shorter wick while removing the splayed upper silhouette that made the original look too wide.

`wick-bound-review.html` compares the original, thin single-fibre, and bound multi-fibre crops at the same scale. `wick-bound-sway-review.html` is the repeatable browser motion acceptance artifact for this revision.

V4 acceptance: all 101 unique 1536px frames decode, with no clipped image-border content. Headless Chrome at DPR 2 passes flame motion, stationary wax, and pause checks at 0%, 38%, 77%, 99%, and 100%. A birth-state extraction leak was reproduced and fixed by excluding pixels below the flame root; the same acceptance then passes. Terminal motion is zero. The app serves v4 assets with HTTP 200; Astro check and build pass.
