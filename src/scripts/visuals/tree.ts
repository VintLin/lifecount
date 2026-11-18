import type { HourglassRenderer } from "./hourglass";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const tau = 2 * Math.PI;
const greens = ["#475944", "#627752", "#81945e", "#a6ad70", "#c7cb86"];
const copper = ["#804b40", "#a4593b", "#c97b43", "#dea04f", "#ebbf70"];
const blossom = ["#9e4d6b", "#cc7794", "#e69bb1", "#f6bdc9", "#ffe0dc"];

interface Limb {
  parent: number;
  depth: number;
  angle: number;
  length: number;
  bend: number;
  weight: number;
  loss: number;
  seed: number;
}
function orchard() {
  let state = 38447;
  const random = () =>
    (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;
  const limbs: Limb[] = [];
  function fork(
    parent: number,
    depth: number,
    angle: number,
    length: number,
    weight: number,
  ) {
    const index = limbs.length;
    limbs.push({
      parent,
      depth,
      angle,
      length,
      weight,
      bend: (random() - 0.5) * 0.42,
      loss: 0.73 + random() * 0.27,
      seed: random(),
    });
    if (depth === 6) return;
    const direction = random() < 0.5 ? -1 : 1;
    fork(
      index,
      depth + 1,
      angle * 0.82 + direction * (0.14 + random() * 0.36),
      length * (0.72 + random() * 0.13) * (depth === 0 ? 1.5 : 1),
      weight * 0.67,
    );
    fork(
      index,
      depth + 1,
      angle * 0.88 - direction * (0.57 + random() * 0.46),
      length * (0.68 + random() * 0.15) * (depth === 0 ? 1.15 : 1),
      weight * 0.56,
    );
    if (depth === 2)
      fork(index, depth + 1, angle * 0.6 + 0.1, length * 0.69, weight * 0.49);
  }
  fork(-1, 0, 0.07, 35, 13);
  const specks = Array.from({ length: 600 }, () => ({
    x: random(),
    y: random(),
    v: random(),
    w: random(),
  }));
  return { limbs, specks };
}

export function createTree(host: HTMLElement): HourglassRenderer {
  const canvas = document.createElement("canvas");
  canvas.className = "lifecount-tree-canvas";
  canvas.width = 360;
  canvas.height = 250;
  canvas.setAttribute("aria-hidden", "true");
  host.append(canvas);
  const ctx = canvas.getContext("2d")!;
  const { limbs, specks } = orchard();
  const dot = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(
      Math.round(x),
      Math.round(y),
      Math.max(1, Math.round(w)),
      Math.max(1, Math.round(h)),
    );
  };
  function oval(x: number, y: number, rx: number, ry: number, color: string) {
    for (let row = -Math.floor(ry); row <= ry; row++) {
      const half = rx * Math.sqrt(Math.max(0, 1 - (row / ry) ** 2));
      dot(x - half, y + row, 2 * half + 1, 1, color);
    }
  }
  let progress = 0,
    paused = true,
    timer = 0,
    time = 0;
  let tips: { x: number; y: number }[] = [],
    grabbed = -1,
    origin = 0,
    displacement = 0,
    velocity = 0;
  let pointer: number | null = null;
  const loose: { x: number; y: number; born: number; color: string }[] = [];
  function position(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * 360) / r.width,
      y: ((e.clientY - r.top) * 250) / r.height,
    };
  }
  canvas.style.touchAction = "none";
  canvas.onpointerdown = (e) => {
    if (paused || pointer !== null) return;
    const at = position(e);
    let nearest = 18;
    grabbed = -1;
    tips.forEach((t, i) => {
      const d = Math.hypot(t.x - at.x, t.y - at.y);
      if (d < nearest && limbs[i].depth >= 1) {
        nearest = d;
        grabbed = i;
      }
    });
    if (grabbed < 0) return;
    pointer = e.pointerId;
    origin = at.x;
    displacement = 0.13;
    velocity = 0;
    canvas.setPointerCapture(pointer);
    for (const tip of visibleTips
      .filter((t) => Math.hypot(t.x - at.x, t.y - at.y) < 23)
      .slice(0, 8)) {
      loose.push({ ...tip, born: time });
    }
  };
  canvas.onpointermove = (e) => {
    if (pointer === e.pointerId)
      displacement = Math.max(
        -0.7,
        Math.min(0.7, (position(e).x - origin) / 44),
      );
  };
  canvas.onlostpointercapture = () => {
    pointer = null;
  };
  let visibleTips: { x: number; y: number; color: string }[] = [];
  function paint() {
    ctx.clearRect(0, 0, 360, 250);
    const now = new Date(Date.now()),
      month =
        now.getMonth() +
        (now.getDate() - 1) /
          new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const winter = month < 2 || month >= 11,
      spring = month >= 2 && month < 5,
      autumn = month >= 8 && month < 11;
    const yearPhase = spring ? clamp((month - 2) * 1.65) : 1;
    const bloom = spring ? Math.max(0, 1 - Math.abs(month - 3.05) / 0.95) : 0;
    const leafDensity = winter
      ? 0
      : autumn
        ? clamp((11 - month) * 0.66)
        : yearPhase;
    const weatherPhase = (Date.now() / 1000 / 210) % 1;
    const moisture = clamp(Math.sin(weatherPhase * tau) * 2 - 0.45);
    const wet = moisture > 0.04;
    const wind = 0.65 + Math.sin(time * 0.71) * 0.38 + moisture * 0.65;
    const growth = clamp(progress / 0.56) ** 0.68;
    const autumnTint = clamp((month - 8) * 1.35);
    const ground = winter
      ? ["#cdcbbc", "#e4e3d8", "#b9bcae"]
      : wet
        ? ["#939679", "#b2af8a", "#797e64"]
        : ["#adae85", "#c9c69a", "#959b77"];
    for (const s of specks.slice(0, 110)) {
      const width = 5 + growth * 42;
      dot(
        180 + (s.x - s.w) * width,
        209 + (s.y - 0.5) * 5,
        1 + s.v * 3,
        1,
        ground[s.v > 0.6 ? 1 : 2],
      );
    }
    const ends: { x: number; y: number }[] = [];
    const crowns: {
      x: number;
      y: number;
      size: number;
      seed: number;
      depth: number;
    }[] = [];
    const pulls: number[] = [];
    limbs.forEach((limb, i) => {
      const { parent, depth, seed } = limb;
      const start = ends[parent] ?? { x: 180, y: 209 };
      const age = clamp((growth - depth * 0.069) / (1 - depth * 0.069));
      const loss = clamp(
        (progress - limb.loss) / Math.max(0.015, 1 - limb.loss),
      );
      const length =
        limb.length *
        (depth === 0 ? 0.18 + 0.82 * age : age) *
        (1 - (depth >= 3 ? 0.52 : 0) * loss);
      const radius = Math.max(0.5, limb.weight * (0.13 + growth * 0.87));
      const sway =
        (0.012 * Math.sin(time * 1.8 + seed * 1.1) + 0.024) *
        wind *
        (depth / 6);
      pulls[i] = i === grabbed ? displacement : (pulls[parent] ?? 0) * 0.7;
      const angle = limb.angle + sway + pulls[i];
      const dx = Math.sin(angle) * length,
        dy = -Math.cos(angle) * length;
      const end = { x: start.x + dx, y: start.y + dy };
      ends[i] = end;
      if (length < 0.35) return;
      const steps = Math.ceil(length * 1.35);
      for (let j = 0; j <= steps; j++) {
        const t = j / steps,
          w = Math.max(
            1,
            radius *
              (1 - 0.35 * t + (depth === 0 ? 0.65 * Math.pow(1 - t, 9) : 0)),
          );
        const x = start.x + dx * t + Math.sin(t * Math.PI) * limb.bend * length,
          y = start.y + dy * t;
        dot(x - w * 0.5, y, w, 1.4, progress === 1 ? "#67584e" : "#4c3039");
        if (w > 2) dot(x - w * 0.5, y, w * 0.35, 1.4, "#80555a");
        if (w > 4) dot(x + w * 0.18, y, 1, 1, "#876a55");
        if (winter && wet && depth > 1 && j % 4 !== 0)
          dot(x, y - 1, 1, 1, "#edece4");
      }
      if (progress < limb.loss && (depth >= 3 || age < 0.65)) {
        const size = depth >= 3 ? (9 + seed * 10) * age : 2.6;
        crowns.push({ ...end, size, seed, depth });
      }
    });
    tips = ends;
    const litterColor = spring ? "#dca4a1" : "#ae774a";
    if ((autumn || spring) && progress > 0.13 && progress < 1) {
      const amount = autumn ? autumnTint : bloom * 0.5;
      for (const s of specks.slice(0, Math.floor(amount * 85 * growth))) {
        dot(185 + (s.x - 0.5) * 115, 209 + (s.y - 0.5) * 6, 2, 1, litterColor);
      }
    }
    visibleTips = [];
    for (const c of crowns) {
      if (c.seed > leafDensity) continue;
      const flower = progress > 0.13 && c.seed < bloom;
      const palette = flower
        ? blossom
        : autumn && c.seed < autumnTint
          ? copper
          : greens;
      visibleTips.push({ x: c.x, y: c.y, color: palette[2] });
      const r = c.size;
      // Interlock small jagged masses; keep each bough shaded as a whole.
      for (let i = 0; i < 95; i++) {
        const s = specks[(Math.floor(c.seed * 450) + i) % specks.length];
        const a = s.x * tau,
          d = Math.sqrt(s.y) * r * (0.9 + 0.15 * Math.sin(3 * a + c.seed * 9));
        const x = Math.cos(a) * d,
          y = Math.sin(a) * d * 0.78;
        const light = clamp(
          0.49 -
            (y / r) * 0.72 -
            (x / r) * 0.15 +
            (s.v - 0.5) * 0.53 +
            (c.seed - 0.5) * 0.24,
        );
        const size = Math.max(1, ((1.4 + s.w * 2.3) * r) / 12);
        dot(
          c.x + x,
          c.y + y,
          size,
          size * 0.72,
          palette[Math.round(light * 4)],
        );
        dot(
          c.x + x + 1,
          c.y + y - 1,
          size * 0.64,
          size * 0.62,
          palette[Math.round(light * 4)],
        );
      }
    }
    if (progress < 0.025 && !winter) {
      const tip = ends[0];
      oval(tip.x - 2, tip.y, 2, 1, greens[2]);
      oval(tip.x + 2, tip.y - 2, 2, 1, greens[3]);
    }
    if ((spring || autumn) && crowns.length && progress > 0.13) {
      const count = Math.floor(7 * (spring ? bloom : autumnTint));
      for (let i = 0; i < count; i++) {
        const c = crowns[(i * 17) % crowns.length],
          f = (time * 0.105 + specks[i].x) % 1;
        dot(
          c.x + f * 17 * wind + 3 * Math.sin(f * tau * 2 + i),
          c.y + f * (210 - c.y),
          2,
          1,
          litterColor,
        );
      }
    }
    if (wet)
      for (const s of specks.slice(0, Math.floor(85 * moisture))) {
        const y = (s.y * 225 + time * (winter ? 11 : 102)) % 225;
        const x =
          60 +
          ((s.x * 236 +
            y * (winter ? 0.17 : 0.24) +
            (winter ? Math.sin(time + s.x * 10) * 3 : 0)) %
            236);
        dot(
          x,
          y,
          winter ? 2 : 1,
          winter ? 2 : 3,
          winter ? "#c6cfce" : "#9eaeb0",
        );
      }
    for (let i = loose.length - 1; i >= 0; i--) {
      const petal = loose[i],
        elapsed = time - petal.born,
        y = petal.y + elapsed * 24;
      if (y >= 210) {
        loose.splice(i, 1);
        continue;
      }
      dot(
        petal.x + elapsed * 5 + Math.sin(elapsed * 4 + i) * 2,
        y,
        2,
        1,
        petal.color,
      );
    }
    canvas.dataset.progress = String(progress);
  }
  function sync() {
    if (!paused && !timer)
      timer = window.setInterval(() => {
        if (pointer === null) {
          velocity = (velocity - displacement * 0.34) * 0.71;
          displacement += velocity;
        }
        time += 0.1;
        paint();
      }, 100);
    if (paused && timer) {
      clearInterval(timer);
      timer = 0;
    }
  }
  return {
    update(value, animate) {
      progress = clamp(value);
      paused = !animate;
      paint();
      sync();
    },
    suspend(value) {
      paused = value;
      sync();
    },
    destroy() {
      paused = true;
      sync();
      canvas.remove();
    },
  };
}
