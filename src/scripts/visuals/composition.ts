import type { VisualMode } from "@/data/lifecount";

// Bounds describe the largest subject in scene coordinates, excluding weather
// and transparent margins. They stay fixed as the lifetime advances.
const frames = {
    hourglass: { width: 220, height: 480, boundsW: 206, boundsH: 468, cx: 110, cy: 238, widthLimit: Infinity },
    candle: { width: 1536, height: 1536, boundsW: 1110, boundsH: 1251, cx: 768, cy: 689, widthLimit: Infinity },
    homebuilding: { width: 360, height: 250, boundsW: 280, boundsH: 185, cx: 180, cy: 115, widthLimit: 720 },
    bamboo: { width: 360, height: 250, boundsW: 205, boundsH: 184, cx: 180, cy: 120, widthLimit: Infinity },
    tree: { width: 360, height: 250, boundsW: 218, boundsH: 185, cx: 184, cy: 118, widthLimit: Infinity },
};

export function composeStage(stage: HTMLElement, mode: VisualMode, fullscreen: boolean) {
    if (mode === "grid" || mode === "daylight") return;
    const f = frames[mode];
    const house = mode === "homebuilding";
    const widthFraction = house ? .72 : .78;
    const heightFraction = mode === "hourglass" ? .64 : .60;
    const width = stage.clientWidth, height = stage.clientHeight;
    const scale = Math.min(
        width * (widthFraction + (fullscreen ? .06 : 0)) / f.boundsW,
        height * (heightFraction + (fullscreen ? .06 : 0)) / f.boundsH,
        (f.widthLimit + (fullscreen ? 200 : 0)) / f.boundsW,
        mode === "candle" ? 1 / Math.min(devicePixelRatio || 1, 2) : Infinity,
    );
    stage.style.setProperty("--frame-width", scale * f.width + "px");
    stage.style.setProperty("--frame-height", scale * f.height + "px");
    stage.style.setProperty("--frame-left", width * .5 - scale * f.cx + "px");
    stage.style.setProperty("--frame-top", height * .48 - scale * f.cy + "px");
}
