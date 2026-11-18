import type { HourglassRenderer } from './hourglass';
export type CandleStatus = 'loading' | 'ready' | 'error';
/** Baked 3D geometry indexed by actual life progress; playback never advances age. */
export function createCandle(canvas: HTMLCanvasElement, baseUrl: string, status: (state: CandleStatus) => void): HourglassRenderer & { retry(): void } {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D unavailable');
    const buffer = document.createElement('canvas');
    buffer.width = buffer.height = 1;
    const source = buffer.getContext('2d', { willReadFrequently: true })!;
    const flameLayer = document.createElement('canvas');
    let flameBox: { x: number; y: number; root: number } | null = null;
    const cameraSpan = (p: number) => 4.55 - 1.05*p + .30*Math.max(0,1-p/.08)**2;
    // Separate only the warm emissive pixels above the wick, never the wax or dark wick.
    function separateFlame() {
        flameBox = null;
        const p = renderedProgress;
        if (p >= 1) return;
        const size = buffer.width, scale = cameraSpan(p);
        const wick = Math.max(.105,3.5*(1-p)**1.06-.10), strength = Math.min(1,(1-p)/.10);
        const root = (.5-(wick+.13-(1.65-.43*p))*.943/scale)*size;
        const x = Math.floor(size*(.5-.14/scale));
        const y = Math.max(0,Math.floor(root-(.48*strength*.943+.025)/scale*size));
        const w = Math.ceil(size*.28/scale), h = Math.ceil(root+.015/scale*size-y);
        const pixels = source.getImageData(x,y,w,h);
        flameLayer.width=w; flameLayer.height=h;
        const fc=flameLayer.getContext('2d')!, flame=fc.createImageData(w,h);
        for(let i=0;i<pixels.data.length;i+=4) {
            const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];
            // Match the rendered flame envelope so nearby ivory wax cannot enter the moving layer.
            const row=Math.floor(i/4/w), column=(i/4)%w;
            const t=(root-y-row)/(size*.48*strength*.943/scale);
            const radius=Math.max(...[t-.06,t,t+.06].map(v=>{
                const u=Math.max(0,Math.min(1,v));
                return .085*Math.sin(Math.PI*u)**.72*(1-.6*u)*strength;
            }))*size/scale+2;
            const centre=size/2+.035*Math.max(0,t)**2*Math.sin(p*25)*size/scale;
            if(t>=0 && t<=1.06 && Math.abs(x+column-centre)<=radius && r>240 && r-g>3 && r-b>7) {
                flame.data.set(pixels.data.subarray(i,i+4),i);
                pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=255;
            }
        }
        source.putImageData(pixels,x,y); fc.putImageData(flame,0,0);
        flameBox={x,y,root};
    }
    type Entry = { abort: AbortController; promise: Promise<ImageBitmap>; bitmap?: ImageBitmap };
    const cache = new Map<number, Entry>();
    let disposed = false, suspended = false, flowing = false, progress = 0, revision = 0;
    let animation = 0, lastTime = 0, ready = false, failed = false, frameKey = "";
    let width = 0, height = 0, side = 0, left = 0, top = 0, renderedProgress = 0;
    // Keep the extinguished terminal state exclusive to a completed lifetime.
    const frameIndex = () => progress >= 1 ? 100 : Math.min(99, Math.round(progress * 100));
    const stop = () => { cancelAnimationFrame(animation); animation = 0; };
    function load(index: number): Promise<ImageBitmap> {
        const existing = cache.get(index);
        if (existing) return existing.promise;
        const abort = new AbortController();
        let entry: Entry;
        const promise = fetch(`${baseUrl}${String(index).padStart(3, '0')}.webp`, { signal: abort.signal })
            .then(response => { if (!response.ok) throw new Error(`Candle asset ${response.status}`); return response.blob(); })
            .then(blob => createImageBitmap(blob))
            .then(bitmap => {
                if (disposed || cache.get(index) !== entry) { bitmap.close(); throw new Error('Obsolete candle asset'); }
                entry.bitmap = bitmap;
                return bitmap;
            }).catch(error => { if (cache.get(index) === entry) cache.delete(index); throw error; });
        entry = { abort, promise };
        cache.set(index, entry);
        return entry.promise;
    }
    function trim(keep: number[]) {
        for (const [index, entry] of cache) {
            if (cache.size <= 3) break;
            if (keep.includes(index)) continue;
            entry.abort.abort(); entry.bitmap?.close(); cache.delete(index);
        }
    }
    function paint(time?: number) {
        if (!ctx || disposed) return;
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
        if (ready) {
            // Undo the baked camera zoom and vertical tracking around its ground plane.
            const span = cameraSpan(renderedProgress);
            side = width * span / cameraSpan(0);
            left = (width - side) / 2;
            top = height * (.5 + 1.65*.943/cameraSpan(0)) - side * (.5 + (1.65-.43*renderedProgress)*.943/span);
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(buffer, left, top, side, side);
            if (flameBox) {
                const ratio=side/buffer.width, t=(time ?? 0)/1000;
                // Incommensurate slow frequencies keep the motion soft and non-repeating.
                const sway=time===undefined?0:.065*Math.sin(t*2.1)+.035*Math.sin(t*3.73+.8)+.018*Math.sin(t*6.17);
                const stretch=time===undefined?1:1+.025*Math.sin(t*2.9+.4)+.012*Math.sin(t*5.3);
                ctx.save();
                ctx.translate(left+side/2,top+flameBox.root*ratio);
                ctx.transform(1,0,sway,stretch,0,0);
                ctx.drawImage(flameLayer,(flameBox.x-buffer.width/2)*ratio,(flameBox.y-flameBox.root)*ratio,flameLayer.width*ratio,flameLayer.height*ratio);
                ctx.restore();
            }
        }
    }
    // Only the extracted flame moves; the wick and wax remain fixed.
    function tick(time: number) {
        animation = 0;
        if (disposed || suspended || !flowing || !ready || progress >= 1) return;
        if (time - lastTime >= 1000 / 30) { lastTime = time; paint(time); }
        animation = requestAnimationFrame(tick);
    }
    function schedule() { if (!animation && !suspended && flowing && progress < 1 && ready) animation = requestAnimationFrame(tick); }
    async function refresh() {
        if (failed || disposed) return;
        const token = ++revision, index = frameIndex();
        stop();
        if (!cache.get(index)?.bitmap) { ready = false; paint(); status('loading'); }
        try {
            const bitmap = await load(index);
            if (disposed || token !== revision) return;
            trim([index]);
            // Draw one native-resolution frame; alpha blends create doubled wax edges.
            buffer.width = bitmap.width; buffer.height = bitmap.height;
            source.drawImage(bitmap, 0, 0);
            renderedProgress = index / 100;
            separateFlame();
            ready = true; canvas.dataset.progress = String(progress); canvas.dataset.frame = String(index);
            status('ready'); paint(); schedule();
        } catch {
            if (!disposed && token === revision) { ready = false; failed = true; paint(); status('error'); }
        }
    }
    const resize = () => {
        const rect = canvas.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
        width = Math.max(1, Math.round(rect.width * dpr)); height = Math.max(1, Math.round(rect.height * dpr));
        canvas.width = width; canvas.height = height;
        paint();
    };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    return {
        update(value, active) {
            progress = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)); flowing = active;
            const key = String(frameIndex());
            canvas.dataset.progress = String(progress);
            if (key === frameKey && ready) {
                if (!flowing) { stop(); paint(); } else schedule();
                return;
            }
            if (key !== frameKey) { failed = false; frameKey = key; }
            void refresh();
        },
        suspend(value) { suspended = value; if (value) { stop(); paint(); } else schedule(); },
        retry() { failed = false; void refresh(); },
        destroy() {
            disposed = true; ++revision; stop(); observer.disconnect();
            for (const entry of cache.values()) { entry.abort.abort(); entry.bitmap?.close(); }
            cache.clear(); buffer.width = buffer.height = 0; flameLayer.width = flameLayer.height = 0; flameBox = null;
            delete canvas.dataset.progress; delete canvas.dataset.frame;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
}
