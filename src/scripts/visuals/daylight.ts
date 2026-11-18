import type { HourglassRenderer } from "./hourglass";
import type * as Three from "three";
// Display-space colors from zenith to low sky, with midnight wrapping at 100%.
const midnight = [0x101a36, 0x192749, 0x283858, 0x374760];
const palettes = [
  midnight,
  [0x536e9c, 0xadc4df, 0xeacbd0, 0xffe3bf],
  [0x357bc0, 0x70afe0, 0xa6d1ed, 0xd8e8ef],
  [0x374d7a, 0x867eaa, 0xd69ba9, 0xedbd9e],
  midnight,
];

function paletteAt(progress: number) {
  const phase = progress * 4;
  const index = Math.min(3, Math.floor(phase));
  const fraction = phase - index;
  const blend = fraction * fraction * (3 - 2 * fraction);
  return palettes[index].map((start, stop) => {
    const end = palettes[index + 1][stop];
    return [16, 8, 0].map((shift) => {
      const from = (start >> shift) & 255;
      return from + (((end >> shift) & 255) - from) * blend;
    });
  });
}

// Life progress is the only clock for the sun. Animation time moves haze only.
export function createDaylight(
  host: HTMLElement,
): HourglassRenderer {
  let backend: HourglassRenderer | null = null,
    disposed = false,
    progress = 0,
    active = false,
    paused = false;
  const apply = () => {
    if (!backend)
      host.style.background = `linear-gradient(to bottom, ${paletteAt(progress)
        .map((rgb) => `rgb(${rgb.join(" ")})`)
        .join(", ")})`;
    backend?.update(progress, active);
    backend?.suspend(paused);
  };
  void import("three")
    .then((THREE) => {
      if (disposed) return;
      try {
        backend = buildSky(THREE, host);
        host.dataset.skyRenderer = "webgl";
      } catch (error) {
        host.dataset.skyRenderer = "fallback";
        console.warn("Sky uses static fallback", error);
      }
      apply();
    })
    .catch((error) => {
      if (!disposed) {
        host.dataset.skyRenderer = "fallback";
        console.warn("Sky unavailable", error);
      }
    });
  return {
    update(value, running) {
      progress = Math.max(0, Math.min(1, value));
      active = running;
      apply();
    },
    suspend(value) {
      paused = value;
      backend?.suspend(value);
    },
    destroy() {
      disposed = true;
      backend?.destroy();
      host.style.removeProperty("background");
      delete host.dataset.skyRenderer;
    },
  };
}

function buildSky(T: typeof Three, host: HTMLElement): HourglassRenderer {
  const canvas = document.createElement("canvas");
  canvas.className = "lifecount-daylight-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "low-power",
  });
  host.append(canvas);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const uniforms = {
    stops: { value: midnight.map(() => new T.Vector3()) },
    direction: { value: 0 },
    darkness: { value: 0 },
    hazeTime: { value: 0 },
    aspect: { value: 1 },
  };
  const material = new T.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader:
      "varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",
    fragmentShader: `
        varying vec2 vUv;
        uniform vec3 stops[4];
        uniform float direction, darkness, hazeTime, aspect;
        float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        void main(){
            float depth = 1.0 - vUv.y;
            vec2 pos = vec2(vUv.x * aspect, depth);
            float drift = hazeTime * .035;
            float mist = sin(pos.y * 13. + pos.x * 2. + drift + sin(pos.x * 3. - drift));
            float sweep = direction * (.5 - vUv.x) * sin(depth * 3.14159);
            float h = clamp(depth + .19 * sweep + .009 * mist, 0., 1.);
            vec3 color = mix(stops[0], stops[1], smoothstep(0., .44, h));
            color = mix(color, stops[2], smoothstep(.27, .81, h));
            color = mix(color, stops[3], smoothstep(.63, 1., h));
            vec2 stars = pos * 160.;
            float spark = step(.997, hash(floor(stars))) * (1. - smoothstep(.02, .14, length(fract(stars)-.5)));
            color += .28 * darkness * spark * (1.-depth);
            // Stable display-space dither softens quantization without flicker.
            gl_FragColor = vec4(color + (hash(gl_FragCoord.xy)-.5)/255., 1.);
        }`,
  });
  const composite = new T.Scene(),
    quad = new T.Mesh(new T.PlaneGeometry(2, 2), material);
  composite.add(quad);
  const orthographic = new T.Camera();
  let disposed = false,
    suspended = false,
    active = false,
    frame = 0,
    last = 0,
    hazeTime = 0,
    previous = 0;
  function paint() {
    if (disposed) return;
    renderer.render(composite, orthographic);
  }
  function tick(now: number) {
    frame = 0;
    if (disposed || suspended || !active) return;
    if (now - last >= 1000 / 24) {
      hazeTime += previous ? Math.min((now - previous) / 1000, 0.1) : 0;
      previous = now;
      last = now;
      uniforms.hazeTime.value = hazeTime;
      paint();
    }
    frame = requestAnimationFrame(tick);
  }
  const schedule = () => {
    if (!frame && !disposed && !suspended && active)
      frame = requestAnimationFrame(tick);
  };
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    uniforms.aspect.value = width / Math.max(1, height);
    paint();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  return {
    update(progress, running) {
      paletteAt(progress).forEach(([r, g, b], i) =>
        uniforms.stops.value[i].set(r / 255, g / 255, b / 255),
      );
      uniforms.direction.value = Math.sin(progress * Math.PI * 2);
      uniforms.darkness.value = Math.max(0, Math.cos(progress * Math.PI * 2));
      active = running && progress < 1;
      canvas.dataset.progress = String(progress);
      paint();
      if (!active) {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
      }
      schedule();
    },
    suspend(value) {
      if (suspended === value) return;
      suspended = value;
      if (value) {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
      } else schedule();
    },
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
