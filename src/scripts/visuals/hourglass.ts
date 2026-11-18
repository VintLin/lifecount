/** Photographic glass and settled black sand. No animation frame advances life progress. */
export interface HourglassRenderer {
    update(progress: number, flowing: boolean): void;
    suspend(value: boolean): void;
    destroy(): void;
}
export function createHourglass(canvas: HTMLCanvasElement, assetUrl: string): HourglassRenderer {
    const context = canvas.getContext('2d');
    if (!context)
        throw new Error('Canvas 2D unavailable');
    const ctx: CanvasRenderingContext2D = context;
    const W = 220, H = 480, CX = 110, NECK = 242, TOP = 5, BASE = 462;
    const grid = new Uint8Array(W * H), shade = new Uint8Array(W * H), moved = new Uint8Array(W * H), velocity = new Float32Array(W * H);
    const radii = new Float32Array(H), leftRadii = new Float32Array(H);
    // Interior traced from the approved photograph, inset one unit from the rim.
    // Shape-preserving Hermite tangents keep the neck and cup bulges bounded.
    // The same Bezier profile supplies both the visible clip and cell-center radii.
    const knots = [[5, 46], [15, 65], [40, 85], [70, 95], [95, 93], [125, 81], [160, 60], [190, 37], [210, 19], [230, 6], [242, 2.5], [255, 7], [275, 24], [305, 48], [340, 72], [380, 92], [405, 94]] as const;
    // The photographed upper-left rim sits outside a mirror of the right rim.
    // Calibrate it independently, tapering back to the shared neck and lower cup.
    const leftOffsets = [0, 1, 2, 2.5, 3, 3.5, 3.5, 1.5, .5, 0, 0, 0, 0, 0, 0, 0, 0];
    type WallPoint = readonly [radius: number, y: number];
    type WallSegment = readonly [WallPoint, WallPoint, WallPoint, WallPoint];
    function makeWall(profile: readonly (readonly [number, number])[]): WallSegment[] {
        const intervals = profile.slice(1).map(([y], i) => y - profile[i][0]);
        const slopes = intervals.map((h, i) => (profile[i + 1][1] - profile[i][1]) / h);
        const tangents = profile.map((_, i) => {
            if (i === 0)
                return slopes[0];
            if (i === profile.length - 1)
                return 0;
            const before = slopes[i - 1], after = slopes[i];
            if (before * after <= 0)
                return 0;
            const w1 = 2 * intervals[i] + intervals[i - 1], w2 = intervals[i] + 2 * intervals[i - 1];
            return (w1 + w2) / (w1 / before + w2 / after);
        });
        const wall: WallSegment[] = intervals.map((h, i) => {
            const [y0, r0] = profile[i], [y1, r1] = profile[i + 1];
            return [[r0 - 1, y0], [r0 - 1 + tangents[i] * h / 3, y0 + h / 3],
                [r1 - 1 - tangents[i + 1] * h / 3, y1 - h / 3], [r1 - 1, y1]];
        });
        // One continuous bowl from the widest point to the inner floor. Start
        // vertically (matching its zero radius derivative) and finish horizontally
        // at the center. Keep the photograph's thick glass foot below the sand.
        const [bowlY, bowlRadius] = profile.at(-1)!;
        const innerRadius = bowlRadius - 1;
        wall.push([[innerRadius, bowlY], [innerRadius, BASE - 6], [innerRadius * .52, BASE], [0, BASE]]);
        return wall;
    }
    const wall = makeWall(knots);
    const leftWall = makeWall(knots.map(([y, r], i) => [y, r + leftOffsets[i]] as const));
    const cubic = (a: number, b: number, c: number, d: number, t: number) => {
        const u = 1 - t;
        return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
    };
    for (const [profile, samples] of [[wall, radii], [leftWall, leftRadii]] as const)
        for (let y = TOP; y < BASE; y++) {
            const centerY = y + .5;
            const [a, b, c, d] = profile.find(segment => centerY <= segment[3][1])!;
            // The final cap is parametric in y as well as radius; invert its y once
            // at initialization instead of giving simulation and rendering two walls.
            let lo = 0, hi = 1;
            for (let n = 0; n < 22; n++) {
                const t = (lo + hi) / 2;
                if (cubic(a[1], b[1], c[1], d[1], t) < centerY)
                    lo = t;
                else
                    hi = t;
            }
            samples[y] = cubic(a[0], b[0], c[0], d[0], (lo + hi) / 2);
        }
    const inside = (x: number, y: number) => x - CX > -leftRadii[y] && x - CX < radii[y];
    const topCells: number[] = [], bottomCells: number[] = [];
    for (let y = TOP + 2; y < BASE - 1; y++)
        for (let x = 0; x < W; x++) {
            if (inside(x, y)) {
                if (y <= NECK)
                    topCells.push(y * W + x);
                else if (y > NECK)
                    bottomCells.push(y * W + x);
            }
        }
    // Fill upper reservoir UP from its supported funnel; lower reservoir is a pile, never a floating slab.
    // Reservoir surface: nearly level with a shallow, smoothly bounded center depression.
    // Bulk compaction approximates collective settling, not individual 3D grain trajectories.
    const reservoirCost = (i: number) => -Math.floor(i / W) + 4 * Math.exp(-(((i % W - CX) / 23) ** 2) / 2);
    topCells.sort((a, b) => reservoirCost(a) - reservoirCost(b) || a % W - b % W);
    // Rounded apex with repose-like flanks; volume is still determined by grain count.
    const pileCost = (i: number) => BASE - Math.floor(i / W) + .60 * (Math.sqrt((i % W - CX) ** 2 + 10 ** 2) - 10);
    bottomCells.sort((a, b) => pileCost(a) - pileCost(b));
    const TOTAL = Math.floor(Math.min(topCells.length, bottomCells.length) * .69);
    let randomSeed = 42;
    function rand() { randomSeed ^= randomSeed << 13; randomSeed ^= randomSeed >>> 17; randomSeed ^= randomSeed << 5; return (randomSeed >>> 0) / 4294967296; }
    let stepMoves = 0, sandDirty = true;
    const activeSurface = new Uint8Array(W);
    function wakeSurface(x: number) { for (let k = Math.max(1, x - 4); k <= Math.min(W - 2, x + 4); k++)
        activeSurface[k] = 1; }
    let tick = 0;
    function seed(p: number) {
        sandDirty = true;
        stepMoves = 0;
        activeSurface.fill(1);
        randomSeed = 42;
        grid.fill(2);
        shade.fill(0);
        velocity.fill(0);
        tick = 0;
        for (let y = TOP + 1; y < BASE; y++)
            for (let x = 0; x < W; x++)
                if (inside(x, y))
                    grid[y * W + x] = 0;
        const initialLower = Math.round(TOTAL * p);
        const put = (i: number) => { grid[i] = 1; shade[i] = Math.floor(rand() * 255); };
        topCells.slice(0, TOTAL - initialLower).forEach(put);
        bottomCells.slice(0, initialLower).forEach(put);
        // Settle surfaces behind a closed neck before showing the initial state.
        for (let n = 0; n < 180; n++)
            step();
        tick = 0;
    }
    function swap(a: number, b: number) {
        sandDirty = true;
        stepMoves++;
        if (Math.floor(b / W) > NECK) {
            wakeSurface(a % W);
            wakeSurface(b % W);
        }
        grid[b] = 1;
        grid[a] = 0;
        shade[b] = shade[a];
        velocity[b] = velocity[a];
        velocity[a] = 0;
        moved[b] = 1;
    }
    // Surface relaxation transports existing grains; it never redraws an artificial sand silhouette.
    // Lower-chamber settling never changes the time-derived reservoir volumes.
    const surface = new Int16Array(W);
    function relaxPileSurface(start: number, end: number) {
        const pending = activeSurface.slice();
        activeSurface.fill(0);
        if (!pending.some(Boolean))
            return;
        surface.fill(-1);
        for (let x = 2; x < W - 2; x++)
            for (let y = start; y < end - 3; y++) {
                const i = y * W + x;
                // Ignore falling grains: only a supported layer can donate surface material.
                if (grid[i] === 1 && grid[i + W] === 1 && grid[i + W * 2] === 1 && grid[i + W * 3] !== 0) {
                    surface[x] = y;
                    break;
                }
            }
        const dir = rand() < .5 ? 1 : -1;
        for (let j = 4; j < W - 4; j++) {
            const x = dir > 0 ? j : W - 1 - j, y = surface[x];
            if (!pending[x] || y < 0 || grid[y * W + x] !== 1)
                continue;
            let best = -1, drop = 0;
            for (const dx of [-3, -2, -1, 1, 2, 3]) {
                // Only the lower pile sheds over-steep local patches.
                const ny = surface[x + dx];
                if (ny < 0 || ny - 1 <= y)
                    continue;
                const slope = .60 * Math.abs(x - CX) / Math.sqrt((x - CX) ** 2 + 100);
                const excess = ny - y - Math.abs(dx) * slope;
                if (excess > drop && grid[(ny - 1) * W + x + dx] === 0) {
                    best = x + dx;
                    drop = excess;
                }
            }
            if (best < 0)
                continue;
            const targetY = surface[best] - 1, dist = Math.abs(best - x), direction = Math.sign(best - x);
            let clear = true;
            // A short arc just above the surface prevents crossing glass or burrowing through sand.
            for (let n = 1; n < dist; n++) {
                const yy = Math.floor(y + (targetY - y) * n / dist - .65 * Math.sin(Math.PI * n / dist));
                if (grid[yy * W + x + direction * n] !== 0) {
                    clear = false;
                    break;
                }
            }
            if (!clear)
                continue;
            swap(y * W + x, targetY * W + best);
            velocity[targetY * W + best] = .15;
            surface[x] = y + 1;
            surface[best] = targetY;
        }
    }
    function step() {
        stepMoves = 0;
        moved.fill(0);
        tick++;
        // Only settle the lower pile. Real-life progress owns all throat transfers.
        for (let y = BASE - 1; y > NECK; y--) {
            const dir = rand() < .5 ? 1 : -1;
            for (let j = 1; j < W - 1; j++) {
                const x = dir === 1 ? j : W - 1 - j, i = y * W + x;
                if (grid[i] !== 1 || moved[i])
                    continue;
                let ci = i;
                velocity[i] = Math.min(3.5, velocity[i] + .16 + rand() * .07);
                const steps = Math.max(1, Math.floor(velocity[i]));
                let fell = false;
                for (let n = 0; n < steps; n++) {
                    const ni = ci + W;
                    if (ni >= grid.length || grid[ni] !== 0)
                        break;
                    swap(ci, ni);
                    ci = ni;
                    fell = true;
                }
                if (fell)
                    continue;
                velocity[i] = 0;
                const d = rand() < .5 ? 1 : -1;
                for (const dx of [d, -d]) {
                    const ni = i + W + dx;
                    if (grid[ni] === 0) {
                        swap(i, ni);
                        velocity[ni] = .3;
                        break;
                    }
                }
            }
        }
        if (tick % 2 === 0)
            relaxPileSurface(NECK + 5, BASE);
    }
    // Reconstruct supported surfaces independently of the simulation's square cells.
    // Paths are rasterized at the destination DPR; enlarging a low-resolution mask
    // would merely enlarge the original stair steps, even with image smoothing.
    const glass = new Path2D();
    glass.moveTo(CX + .5 + wall[0][0][0], wall[0][0][1]);
    for (const [, b, c, d] of wall) {
        glass.bezierCurveTo(CX + .5 + b[0], b[1], CX + .5 + c[0], c[1], CX + .5 + d[0], d[1]);
    }
    for (let i = leftWall.length - 1; i >= 0; i--) {
        const [a, b, c] = leftWall[i];
        glass.bezierCurveTo(CX + .5 - c[0], c[1], CX + .5 - b[0], b[1], CX + .5 - a[0], a[1]);
    }
    glass.closePath();
    const texture = document.createElement('canvas');
    texture.width = W * 2;
    texture.height = H * 2;
    const tc = texture.getContext('2d')!;
    const texels = tc.createImageData(texture.width, texture.height);
    // A separate, fixed seed keeps resizing and repainting from advancing physics
    // or making a paused sand pile sparkle. Half-cell grains retain fine detail.
    let textureSeed = 9173;
    for (let i = 0; i < texels.data.length; i += 4) {
        textureSeed ^= textureSeed << 13;
        textureSeed ^= textureSeed >>> 17;
        textureSeed ^= textureSeed << 5;
        const luminance = 8 + (textureSeed >>> 0) / 4294967296 * 15;
        texels.data[i] = texels.data[i + 1] = texels.data[i + 2] = luminance;
        texels.data[i + 3] = 255;
    }
    tc.putImageData(texels, 0, 0);
    const upperSurface = new Int16Array(W), lowerSurface = new Int16Array(W);
    const freeSurface = new Uint8Array(W), covered = new Uint8Array(W);
    let sandBody = new Path2D(), looseGrains: number[] = [], pileTop = BASE;
    function rebuildSand() {
        if (!sandDirty)
            return;
        sandDirty = false;
        sandBody = new Path2D();
        looseGrains = [];
        pileTop = BASE;
        for (const [start, end, heights] of [[TOP + 1, NECK + 1, upperSurface], [NECK + 1, BASE, lowerSurface]] as const) {
            heights.fill(-1);
            freeSurface.fill(0);
            covered.fill(0);
            for (let x = 1; x < W - 1; x++) {
                for (let y = start; y < end - 2; y++) {
                    const i = y * W + x;
                    // A single falling grain must never become a column of sand.
                    if (grid[i] === 1 && grid[i + W] === 1 && grid[i + W * 2] === 1) {
                        heights[x] = y;
                        // A column starting at glass describes the side wall,
                        // not the sand's free surface. Do not bend the pile to it.
                        freeSurface[x] = grid[i - W] === 0 ? 1 : 0;
                        break;
                    }
                }
            }
            for (let left = 1; left < W - 1; left++) {
                if (heights[left] < 0)
                    continue;
                let right = left;
                while (right + 1 < W - 1 && heights[right + 1] >= 0)
                    right++;
                let freeLeft = left, freeRight = right;
                while (freeLeft <= freeRight && !freeSurface[freeLeft])
                    freeLeft++;
                while (freeRight >= freeLeft && !freeSurface[freeRight])
                    freeRight--;
                if (freeRight - freeLeft < 2) {
                    left = right;
                    continue;
                }
                const smooth = (x: number) => {
                    let sum = 0, weight = 0;
                    for (let dx = -5; dx <= 5; dx++) {
                        const sample = Math.max(freeLeft, Math.min(freeRight, x + dx));
                        const w = 6 - Math.abs(dx);
                        sum += heights[sample] * w;
                        weight += w;
                    }
                    return sum / weight;
                };
                const leftY = smooth(freeLeft), rightY = smooth(freeRight);
                const reach = Math.min(4, freeRight - freeLeft);
                const leftSlope = (smooth(freeLeft + reach) - leftY) / reach;
                const rightSlope = (rightY - smooth(freeRight - reach)) / reach;
                const heightAt = (x: number) => {
                    const y = x < freeLeft ? leftY + (x - freeLeft) * leftSlope
                        : x > freeRight ? rightY + (x - freeRight) * rightSlope : smooth(x);
                    return Math.max(start, Math.min(end, y));
                };
                // Quadratic segments through filtered column centers remove hard
                // joins while keeping the reservoir's depression and pile slope.
                // Extend the free surface beyond both walls. Intersecting it with
                // the curved glass clip makes every contact follow the true wall;
                // all vertical closure edges now lie outside the cup.
                let previous = heightAt(-1);
                sandBody.moveTo(-1, previous);
                for (let x = 0; x <= W + 1; x++) {
                    const next = heightAt(x);
                    sandBody.quadraticCurveTo(x - .5, previous, x, (previous + next) / 2);
                    previous = next;
                }
                sandBody.lineTo(W + 1, previous);
                sandBody.lineTo(W + 1, end);
                sandBody.lineTo(-1, end);
                sandBody.closePath();
                covered.fill(1, left, right + 1);
                left = right;
            }
            for (let y = start; y < end; y++)
                for (let x = 1; x < W - 1; x++) {
                    const i = y * W + x;
                    if (grid[i] === 1 && (!covered[x] || y < heights[x]))
                        looseGrains.push(i);
                }
        }
        for (let x = CX - 1; x <= CX + 1; x++)
            if (lowerSurface[x] >= 0)
                pileTop = Math.min(pileTop, lowerSurface[x]);
    }
    let width = 1, height = 1, scale = 1, ox = 0, oy = 0, frame = 0, lastFrame = 0;
    let disposed = false, suspended = false, flowing = false, progress = -1, quiet = 0, settled = false;
    const photo = new Image();
    function resize() {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        const dpr = Math.min(2, devicePixelRatio || 1);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        scale = Math.min(height / H, width / W);
        ox = (width - W * scale) / 2;
        oy = (height - H * scale) / 2;
        draw(performance.now());
    }
    function draw(now: number) {
        if (disposed)
            return;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        if (!photo.complete || !photo.naturalWidth)
            return;
        ctx.save();
        ctx.translate(ox, oy);
        ctx.scale(scale, scale);
        ctx.drawImage(photo, CX - 240, 0, 480, 480);
        rebuildSand();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.save();
        ctx.clip(glass);
        ctx.save();
        ctx.clip(sandBody);
        ctx.drawImage(texture, 0, 0, W, H);
        ctx.restore();
        for (const i of looseGrains) {
            const luminance = Math.round(8 + shade[i] / 255 * 15);
            ctx.fillStyle = `rgb(${luminance},${luminance},${luminance})`;
            ctx.beginPath();
            ctx.ellipse(i % W + .5, Math.floor(i / W) + .5, .46, .5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        // Perceptual time stream, not extra bulk grains. Its phase never changes reservoir counts.
        if (flowing && !suspended && progress > 0 && progress < 1) {
            ctx.fillStyle = '#262626';
            for (let n = 0; n < 22; n++) {
                const t = (now * .00065 + n / 22) % 1;
                const y = NECK + 3 + (pileTop - NECK - 4) * t * t;
                ctx.fillRect(CX + Math.sin(n * 7.3) * .45, y, .55, .8);
            }
        }
        ctx.restore();
        ctx.globalAlpha = .085;
        ctx.drawImage(photo, CX - 240, 0, 480, 480);
        ctx.globalAlpha = 1;
        ctx.restore();
    }
    function animate(now: number) {
        frame = 0;
        if (disposed || suspended)
            return;
        if (now - lastFrame >= 1000 / 30) {
            lastFrame = now;
            if (!settled) {
                for (let n = 0; n < 7; n++) {
                    step();
                    quiet = stepMoves === 0 ? quiet + 1 : 0;
                    if (quiet >= 8) {
                        settled = true;
                        velocity.fill(0);
                        break;
                    }
                }
            }
            draw(now);
        }
        if (flowing || !settled)
            frame = requestAnimationFrame(animate);
    }
    function schedule() { if (!frame && !suspended && !disposed && (flowing || !settled))
        frame = requestAnimationFrame(animate); }
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    photo.onload = () => { if (!disposed) {
        resize();
        schedule();
    } };
    photo.src = assetUrl;
    return {
        update(value, active) {
            const next = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
            if (Math.round(next * TOTAL) !== Math.round(progress * TOTAL)) {
                seed(next);
                quiet = 0;
                settled = false;
                canvas.dataset.sandTotal = String(TOTAL);
                canvas.dataset.sandElapsed = String(Math.round(next * TOTAL));
            }
            progress = next;
            flowing = active && next > 0 && next < 1;
            canvas.dataset.progress = String(next);
            if (!flowing && frame) {
                cancelAnimationFrame(frame);
                frame = 0;
            }
            draw(performance.now());
            schedule();
        },
        suspend(value) { suspended = value; if (value) {
            cancelAnimationFrame(frame);
            frame = 0;
            draw(performance.now());
        }
        else
            schedule(); },
        destroy() { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); photo.onload = null; delete canvas.dataset.sandTotal; delete canvas.dataset.sandElapsed; delete canvas.dataset.progress; ctx.clearRect(0, 0, width, height); }
    };
}
