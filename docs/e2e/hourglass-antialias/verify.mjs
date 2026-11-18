// Run with the local Astro server: ego-browser nodejs < docs/e2e/hourglass-antialias/verify.mjs
// Failure cases: stair-stepped pile; disappearing sparse grains; sand outside glass;
// changed reservoir counts; texture flicker while paused; stream continuing at 0/100%;
// fullscreen or narrow layout losing sharpness; grid/hourglass toggle failing.
const fs = await import("node:fs/promises");
const root = "/Users/Vint/Repos/01_Project_Personal/011_LifeCount";
const out = `${root}/docs/e2e/hourglass-antialias`;
const task = await taskSpace("LifeCount sand antialiasing");
const page = (await task.pages())[0];
await page.goto("http://localhost:4321/lifecount/");
await page.cdp("Page.bringToFront");
await page.cdp("Emulation.setFocusEmulationEnabled", {enabled:true});
await page.cdp("Emulation.setDeviceMetricsOverride", {width:1280,height:900,deviceScaleFactor:2,mobile:false});
await page.waitForSelector("[data-lifecount-visual-trigger]");
await page.click("[data-lifecount-visual-trigger]");
await page.click('[data-visual-mode="hourglass"]');
await page.waitForFunction(() => !!document.querySelector("[data-lifecount-hourglass-canvas]")?.dataset.sandTotal);
const app = await page.evaluate(() => {
    const canvas = document.querySelector("[data-lifecount-hourglass-canvas]");
    const stage = document.querySelector("[data-lifecount-visual-stage]");
    return { ...canvas.dataset, width: canvas.width, height: canvas.height, topPadding:parseFloat(getComputedStyle(stage).paddingTop) };
});
await page.screenshot({ path: `${out}/current-page.png` });
// Same shipped renderer and photograph, controlled progress and size for boundary acceptance.
let fixture = await page.evaluate(async () => {
    const { createHourglass } = await import("/lifecount/src/scripts/visuals/hourglass.ts");
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;inset:0;z-index:99999;background:white;overflow:auto";
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:600px;height:1172px";
    host.append(canvas); document.body.append(host);
    const image = new Image(); image.src = "/lifecount/images/hourglass-glass.png"; await image.decode();
    const renderer = createHourglass(canvas, image.src);
    renderer.update(.35, false); renderer.suspend(true);
    await new Promise(resolve => requestAnimationFrame(resolve));
    window.sandAcceptance = { canvas, renderer, host };
    return { ...canvas.dataset, width: canvas.width, height: canvas.height };
});
await page.waitForFunction(() => window.sandAcceptance.canvas.width === Math.round(600 * Math.min(2, devicePixelRatio || 1)));
fixture = await page.evaluate(() => ({...window.sandAcceptance.canvas.dataset,width:window.sandAcceptance.canvas.width,height:window.sandAcceptance.canvas.height}));
const results = await page.evaluate(async () => {
    const { canvas, renderer } = window.sandAcceptance;
    // Allow the separately loaded photograph to finish before reading pixels.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    renderer.update(.35, false);
    const paused = canvas.toDataURL();
    renderer.update(.35, false);
    const stable = paused === canvas.toDataURL();
    const ctx = canvas.getContext("2d"), data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const dpr = canvas.width / 600, scale = 2.4;
    const ox = (600 - 220 * scale) / 2, oy = (1172 - 480 * scale) / 2;
    const heights = [];
    const center = Math.round((ox + 110 * scale) * dpr);
    let apex = Math.floor((oy + 465 * scale) * dpr);
    for (let py = Math.floor((oy + 330 * scale) * dpr); py < apex; py++) {
        const i = (py * canvas.width + center) * 4;
        if (data[i] < 60 && data[i + 1] < 60 && data[i + 2] < 60) { apex = py; break; }
    }
    for (let px = Math.ceil((ox + 60 * scale) * dpr); px < (ox + 160 * scale) * dpr; px++) {
        let top = -1;
        for (let py = Math.floor(apex - 10 * scale * dpr); py < (oy + 465 * scale) * dpr; py++) {
            const i = (py * canvas.width + px) * 4;
            if (data[i] < 60 && data[i + 1] < 60 && data[i + 2] < 60) { top = py; break; }
        }
        heights.push(top);
    }
    const residual = heights.slice(5, -5).reduce((sum, y, i) => {
        const j = i + 5;
        const average = heights.slice(j - 5, j + 6).reduce((a, b) => a + b, 0) / 11;
        return sum + Math.abs(y - average);
    }, 0) / (heights.length - 10) / dpr;
    const images = { pile: paused };
    const cases = [];
    for (const progress of [0, .0001, .01, .35, .99, .9999, 1]) {
        renderer.update(progress, false); renderer.suspend(true);
        const elapsed = Number(canvas.dataset.sandElapsed), total = Number(canvas.dataset.sandTotal);
        cases.push({ progress, elapsed, total, correctCount: elapsed === Math.round(total * progress) });
        images[String(progress)] = canvas.toDataURL();
    }
    return { stable, residualCssPixels: residual, heights, cases, images };
});
// Capture a compositor frame before comparing: occluded macOS windows may defer RAF.
await page.evaluate(() => {
    const state = window.sandAcceptance;
    state.renderer.suspend(false); state.renderer.update(.35, true);
    state.before = state.canvas.toDataURL(); state.countBefore = state.canvas.dataset.sandElapsed;
});
await new Promise(resolve => setTimeout(resolve, 350));
await page.screenshot({path:`${out}/current-flowing.png`});
Object.assign(results, await page.evaluate(() => {
    const state = window.sandAcceptance;
    const flowingChanges = state.before !== state.canvas.toDataURL();
    const countStable = state.countBefore === state.canvas.dataset.sandElapsed;
    state.renderer.suspend(true); state.before = state.canvas.toDataURL();
    return { flowingChanges, countStable };
}));
await new Promise(resolve => setTimeout(resolve, 200));
await page.screenshot({path:`${out}/current-suspended.png`});
results.suspendedStable = await page.evaluate(() => window.sandAcceptance.before === window.sandAcceptance.canvas.toDataURL());
for (const [name, image] of Object.entries(results.images))
    await fs.writeFile(`${out}/current-${name}.png`, Buffer.from(image.split(",")[1], "base64"));
delete results.images;
await page.evaluate(() => { window.sandAcceptance.renderer.destroy(); window.sandAcceptance.host.remove(); delete window.sandAcceptance; });
const sizes = {};
await page.cdp("Emulation.setDeviceMetricsOverride", {width:390,height:844,deviceScaleFactor:2,mobile:true});
await page.screenshot({path:`${out}/current-mobile.png`});
sizes.mobile = await page.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,elapsed:document.querySelector("[data-lifecount-hourglass-canvas]").dataset.sandElapsed,topPadding:parseFloat(getComputedStyle(document.querySelector("[data-lifecount-visual-stage]")).paddingTop)}));
await page.cdp("Emulation.setDeviceMetricsOverride", {width:1280,height:900,deviceScaleFactor:2,mobile:false});
await page.click("[data-lifecount-visual-fullscreen]");
await page.screenshot({path:`${out}/current-fullscreen.png`});
sizes.fullscreen = await page.evaluate(() => {
    const stage = document.querySelector("[data-lifecount-visual-stage]");
    const canvas = document.querySelector("[data-lifecount-hourglass-canvas]");
    return {active:document.fullscreenElement === stage || stage.classList.contains("is-fullscreen"),width:canvas.clientWidth,elapsed:canvas.dataset.sandElapsed,topPadding:parseFloat(getComputedStyle(stage).paddingTop),bottomFits:canvas.getBoundingClientRect().bottom <= stage.getBoundingClientRect().bottom,height:canvas.clientHeight,viewportHeight:innerHeight};
});
await page.click("[data-lifecount-visual-fullscreen]");
await page.cdp("Emulation.setEmulatedMedia", {features:[{name:"prefers-reduced-motion",value:"reduce"}]});
await page.screenshot({path:`${out}/current-reduced-motion.png`});
const reducedBefore = await page.evaluate(() => document.querySelector("[data-lifecount-hourglass-canvas]").toDataURL());
await new Promise(resolve => setTimeout(resolve, 250));
await page.screenshot({path:`${out}/current-reduced-motion.png`});
const reducedStable = reducedBefore === await page.evaluate(() => document.querySelector("[data-lifecount-hourglass-canvas]").toDataURL());
await page.cdp("Emulation.setEmulatedMedia", {features:[]});
await page.click("[data-lifecount-visual-trigger]");
await page.click('[data-visual-mode="grid"]');
const gridRestored = await page.evaluate(() => document.querySelector("[data-lifecount-visual-stage]").hidden && !document.querySelector("[data-lifecount-map-wrap]").hidden);
await page.click("[data-lifecount-visual-trigger]");
await page.click('[data-visual-mode="hourglass"]');
await page.screenshot({path:`${out}/current-page.png`});
await page.cdp("Emulation.clearDeviceMetricsOverride");
await page.cdp("Emulation.setFocusEmulationEnabled", {enabled:false});
const baseline = JSON.parse(await fs.readFile(`${out}/before.json`, "utf8"));
const roughnessReduction = 1 - results.residualCssPixels / baseline.residualCssPixels;
const report = { capturedAt: new Date().toISOString(), app, fixture, ...results, sizes, reducedStable, gridRestored, roughnessReduction };
await fs.writeFile(`${out}/current.json`, JSON.stringify(report, null, 2));
console.log({ space: task.spaceId, ...report, heights: `${report.heights.length} samples saved in current.json` });
if (!results.stable || !results.suspendedStable || !results.countStable || !results.flowingChanges || results.cases.some(c => !c.correctCount) || sizes.mobile.scrollWidth !== 390 || !sizes.fullscreen.active || !reducedStable || !gridRestored || roughnessReduction < .25 || app.topPadding !== 24 || sizes.mobile.topPadding !== 16 || sizes.fullscreen.topPadding !== 48 || !sizes.fullscreen.bottomFits || sizes.fullscreen.height !== sizes.fullscreen.viewportHeight - 144)
    throw new Error("Hourglass acceptance failed; see current.json");
