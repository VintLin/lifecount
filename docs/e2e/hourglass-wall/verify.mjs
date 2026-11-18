// Run: ego-browser nodejs < docs/e2e/hourglass-wall/verify.mjs
// Failure cases: slope jumps at wall knots; square floor; artificial vertical
// closures inside the cup; sand crossing the glass; lost sparse grains; bad counts.
// Uses the shipped renderer/photograph. Captures the actual Canvas clipping path,
// not a second implementation of the wall geometry.
const fs = await import("node:fs/promises");
const out = "/Users/Vint/Repos/01_Project_Personal/011_LifeCount/docs/e2e/hourglass-wall";
const task = await taskSpace("LifeCount sand antialiasing");
const page = (await task.pages())[0];
await page.goto("http://localhost:4321/lifecount/");
await page.cdp("Page.bringToFront");
await page.cdp("Emulation.setFocusEmulationEnabled", {enabled:true});
await page.waitForSelector("[data-lifecount-visual-trigger]");
await page.click("[data-lifecount-visual-trigger]");
await page.click('[data-visual-mode="hourglass"]');
await page.waitForFunction(() => !!document.querySelector("[data-lifecount-hourglass-canvas]")?.dataset.sandTotal);
console.log({space:task.spaceId});
await page.evaluate(async () => {
    const {createHourglass} = await import("/lifecount/src/scripts/visuals/hourglass.ts");
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;inset:0;z-index:99999;width:600px;height:1172px;background:white";
    document.body.append(canvas);
    const nativeClip = CanvasRenderingContext2D.prototype.clip;
    const state = {canvas, wall:null, nativeClip, renderer:null};
    CanvasRenderingContext2D.prototype.clip = function(...args) {
        if (this.canvas === canvas && !state.wall && args[0] instanceof Path2D)
            state.wall = new Path2D(args[0]);
        return nativeClip.apply(this, args);
    };
    state.renderer = createHourglass(canvas, "/lifecount/images/hourglass-glass.png");
    state.renderer.update(.35, false); state.renderer.suspend(true);
    window.wallAcceptance = state;
});
await page.screenshot({path:`${out}/current-page.png`});
await page.waitForFunction(() => !!window.wallAcceptance.wall && window.wallAcceptance.canvas.width === 1200);
const result = await page.evaluate(async () => {
    const {canvas, renderer, wall} = window.wallAcceptance;
    const mask = document.createElement("canvas"), zoom = 8;
    mask.width = 220 * zoom; mask.height = 480 * zoom;
    const ctx = mask.getContext("2d"); ctx.scale(zoom, zoom); ctx.fill(wall);
    const pixels = ctx.getImageData(0, 0, mask.width, mask.height).data;
    const radius = y => {
        const py = Math.round(y * zoom);
        for (let x = mask.width - 1; x > 110 * zoom; x--)
            if (pixels[(py * mask.width + x) * 4 + 3] >= 128) return x / zoom;
        return 110;
    };
    const joins = [40,70,95,125,160,190,210,230,255,275,305,340,380,405,430].map(y => {
        const before = (radius(y) - radius(y - 2)) / 2;
        const after = (radius(y + 2) - radius(y)) / 2;
        return {y, before, after, slopeJump:Math.abs(after - before)};
    });
    // Read the actual cup floor from the rasterized clip. It must leave visible
    // glass below it and curve upward towards both sides, rather than ending in
    // the almost-flat chord at the photograph's outer base.
    const floorSamples = [75,110.5,146].map(x => {
        for (let py = mask.height - 1; py >= 430 * zoom; py--)
            if (pixels[(py * mask.width + Math.round(x * zoom)) * 4 + 3] >= 128)
                return {x,y:py/zoom};
        return {x,y:-1};
    });
    const roundFloor = floorSamples[1].y >= 458 && floorSamples[1].y <= 464
        && floorSamples[1].y - floorSamples[0].y >= 1
        && floorSamples[1].y - floorSamples[2].y >= 1;
    // The generated photograph is not symmetric. A smooth wall can still be
    // misplaced: compare its left boundary to the photographed rim itself.
    const photograph = new Image(); photograph.src = "/lifecount/images/hourglass-glass.png"; await photograph.decode();
    const photo = document.createElement("canvas"); photo.width = photo.height = 480;
    const pc = photo.getContext("2d"); pc.drawImage(photograph,0,0,480,480);
    const photoPixels = pc.getImageData(0,0,480,480).data;
    const leftContacts = [105,125,145,170].map(y => {
        let edge = 0;
        for (let x = 0; x < 110 * zoom; x++)
            if (pixels[(y * zoom * mask.width + x) * 4 + 3] >= 128) { edge = x / zoom; break; }
        let rim = edge, darkest = 256;
        for (let x = Math.round(edge) - 7; x <= Math.round(edge) + 4; x++) {
            const value = photoPixels[(y * 480 + x + 130) * 4];
            if (value < darkest) { darkest = value; rim = x; }
        }
        return {y, edge, rim, gap:edge-rim};
    });
    const images = {wall:mask.toDataURL()}, cases = [];
    for (const progress of [0,.0001,.01,.35,.75,.99,1]) {
        renderer.update(progress, false); renderer.suspend(true);
        const elapsed = Number(canvas.dataset.sandElapsed), total = Number(canvas.dataset.sandTotal);
        cases.push({progress, elapsed, total, correctCount:elapsed === Math.round(progress * total)});
        images[String(progress)] = canvas.toDataURL();
    }
    // Enlarge actual painted pixels at the cup shoulder, neck and floor.
    const crop = (image, x, y, width, height) => {
        const c = document.createElement("canvas"); c.width = width * 3; c.height = height * 3;
        const context = c.getContext("2d"); context.imageSmoothingEnabled = false;
        context.drawImage(image,x,y,width,height,0,0,c.width,c.height); return c.toDataURL();
    };
    renderer.update(.35, false);
    // Renderer coordinates: DPR 2, scale 2.4, offset (36,10) CSS px.
    images.shoulder = crop(canvas,100,500,1000,570);
    images.neck = crop(canvas,420,900,360,500);
    images.floor = crop(canvas,100,2030,1000,270);
    renderer.destroy(); canvas.remove();
    CanvasRenderingContext2D.prototype.clip = window.wallAcceptance.nativeClip;
    delete window.wallAcceptance;
    return {joins, maxSlopeJump:Math.max(...joins.map(j=>j.slopeJump)),leftContacts,floorSamples,roundFloor,cases,images};
});
for (const [name, png] of Object.entries(result.images))
    await fs.writeFile(`${out}/current-${name}.png`,Buffer.from(png.split(",")[1],"base64"));
delete result.images;
await fs.writeFile(`${out}/current.json`,JSON.stringify({capturedAt:new Date().toISOString(),...result},null,2));
console.log(result);
if (result.maxSlopeJump > .25 || !result.roundFloor || result.cases.some(c=>!c.correctCount) || result.leftContacts.some(c=>c.gap > 2.5 || c.gap < .25))
    throw new Error("Wall curve acceptance failed; see current.json and the enlarged crops");
