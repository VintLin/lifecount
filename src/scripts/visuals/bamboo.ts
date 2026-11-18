import type { HourglassRenderer } from "./hourglass";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const phase = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));

// The first two culms form the silhouette; later shoots stay close to the root.
const grove = [
  { x: 156, lean: -14, height: 83, birth: 0.49, width: 3.4 },
  { x: 161, lean: 9, height: 66, birth: 0.58, width: 3.2 },
  { x: 165, lean: 46, height: 96, birth: 0.215, width: 4.8 },
  { x: 157, lean: 38, height: 156, birth: 0, width: 7.6 },
];

const mainSprays = [
  [0.22, -1, 29],
  [0.48, -1, 39],
  [0.72, -1, 29],
  [0.87, 1, 23],
];
const sideSprays = [
  [0.32, 1, 29],
  [0.72, -1, 19],
  [0.88, 1, 27],
];
const newSprays = [
  [0.54, -1, 19],
  [0.84, 1, 17],
];

export function createBamboo(host: HTMLElement): HourglassRenderer {
  const canvas = document.createElement("canvas");
  canvas.className = "lifecount-bamboo-canvas";
  canvas.width = 360;
  canvas.height = 250;
  canvas.setAttribute("aria-hidden", "true");
  host.append(canvas);
  const ctx = canvas.getContext("2d")!;
  type Point = [number, number];
  function shape(color: string, ...points: Point[]) {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([x, y], i) =>
      i
        ? ctx.lineTo(Math.round(x), Math.round(y))
        : ctx.moveTo(Math.round(x), Math.round(y)),
    );
    ctx.fill();
  }
  let progress = 0,
    time = 0,
    timer = 0;
  function paint() {
    ctx.clearRect(0, 0, 360, 250);
    const month = new Date(Date.now()).getMonth();
    const winter = month < 2 || month === 11;
    const wet = Math.max(0, Math.sin((Date.now() / 210000) * Math.PI * 2));
    const decline = phase(progress, 0.7, 1);
    ctx.fillStyle = winter ? "#e8ebe3" : "#e9e8dc";
    ctx.beginPath();
    ctx.ellipse(162, 211, 42, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Rear slab sits behind the shoot so the first few pixels remain visible.
    shape(
      "#969b90",
      [125, 207],
      [130, 195],
      [143, 182],
      [155, 183],
      [163, 194],
      [158, 207],
    );
    shape("#c1c4b8", [130, 195], [143, 182], [155, 183], [146, 191]);
    shape(
      "#737a72",
      [146, 191],
      [155, 183],
      [163, 194],
      [158, 207],
      [139, 207],
    );
    grove.forEach(({ x, lean, height, birth, width: baseWidth }, i) => {
      if (progress < birth) return;
      const main = birth === 0;
      const age = phase(progress, birth, birth + (main ? 0.3 : 0.13));
      const old = phase(decline, (i % 3) * 0.09, 0.94);
      const heightNow = main
        ? 3 + 14 * phase(age, 0, 1 / 3) + (height - 17) * phase(age, 1 / 3, 1)
        : height * age;
      const base = 195 + (i % 3);
      const wind = Math.sin(time * 1.4 + i * 0.37) * (2 + wet * 3);
      const axis = (h: number) =>
        x + lean * (h / height) ** 1.45 + wind * (h / height) ** 2;
      const shoot = 1 - phase(age, 0.34, 0.88);
      const sheath = Math.min(heightNow, (main ? 21 : 15) * shoot);
      const matureColor =
        old > 0.76 ? "#a39465" : old > 0.42 ? "#8c925b" : "#667f49";
      for (let h = 0; h < heightNow - sheath; h++) {
        const level = h / height;
        const width =
          baseWidth * (1 - 0.4 * level - 0.43 * phase(level, 0.76, 1));
        const left = Math.round(axis(h) - width / 2);
        const node = h % (main ? 28 : 21) < 2;
        ctx.fillStyle = node ? "#52624b" : matureColor;
        ctx.fillRect(left, base - h, Math.ceil(width) + (node ? 1 : 0), 1);
        ctx.fillStyle = node ? "#aeb487" : "#bdbe84";
        ctx.fillRect(left + 1, base - h, 1, 1);
      }
      if (sheath > 0) {
        const top = base - heightNow,
          sx = axis(heightNow - sheath);
        const w = Math.min(sheath * 0.45, (main ? 3.8 : 2.9) + 1.4 * (1 - age));
        shape(
          "#826847",
          [sx, top],
          [sx + w, top + sheath],
          [sx - w, top + sheath],
        );
        for (let j = 1; j <= 3; j++) {
          const y = top + (j * sheath) / 4,
            half = (w * j) / 4;
          shape(
            "#afa16a",
            [sx - half, y],
            [sx + half, y],
            [sx + half * 0.6, y - sheath * 0.22],
          );
        }
      }
      const foliage = phase(age, 0.65, 1);
      // A few branching sprays leave long, readable stretches of bare culm.
      const sprays = main ? mainSprays : birth < 0.3 ? sideSprays : newSprays;
      for (const [level, side, reach] of sprays) {
        const h = level * height;
        if (h >= heightNow - sheath || foliage <= 0) continue;
        const bx = axis(h),
          by = base - h;
        const length = reach * foliage;
        const branch = new Path2D();
        branch.moveTo(bx, by);
        branch.quadraticCurveTo(
          bx + side * length * 0.35,
          by - length * 0.62,
          bx + side * length,
          by - length * 0.47,
        );
        ctx.strokeStyle = "#53694c";
        ctx.lineWidth = 1;
        ctx.stroke(branch);
        for (let k = 0; k < 9; k++) {
          if ((k * 7 + Math.round(level * 10) * 3 + i) % 17 < old * 17)
            continue;
          const t = [0.4, 0.4, 0.55, 0.69, 0.69, 0.69, 0.87, 0.96, 0.96][k];
          const lx = bx + side * length * (0.7 * t + 0.3 * t * t);
          const ly = by - length * (1.24 * t - 0.77 * t * t);
          const dx = side * [-4, 14, 8, 21, 10, -7, 12, 22, 8][k] * foliage;
          const dy =
            ([-20, -10, 17, -10, 20, -14, -17, 5, 19][k] +
              Math.sin(time * 2 + i + k) * 1.6) *
            foliage;
          const color =
            old > 0.5
              ? "#a3a070"
              : month >= 2 && month < 5 && k % 3 === 0
                ? "#9aad60"
                : ["#496e53", "#608453", "#769557"][k % 3];
          const angle = Math.atan2(dy, dx);
          const nx = -2.1 * Math.sin(angle),
            ny = 2.1 * Math.cos(angle);
          shape(
            color,
            [lx, ly],
            [lx + dx * 0.4 + nx, ly + dy * 0.36 + ny],
            [lx + dx, ly + dy],
            [lx + dx * 0.5 - nx, ly + dy * 0.44 - ny],
          );
        }
      }
    });
    shape(
      "#868d86",
      [155, 206],
      [161, 197],
      [176, 189],
      [186, 191],
      [199, 204],
      [191, 209],
      [165, 210],
    );
    shape(
      "#b2b8ad",
      [161, 197],
      [176, 189],
      [186, 191],
      [176, 198],
      [164, 201],
    );
    shape(
      "#676f69",
      [176, 198],
      [186, 191],
      [199, 204],
      [191, 209],
      [174, 208],
    );
    shape(
      "#9da398",
      [130, 209],
      [141, 202],
      [155, 199],
      [167, 204],
      [172, 210],
      [151, 212],
    );
    shape(
      "#c5c8bd",
      [130, 209],
      [141, 202],
      [155, 199],
      [153, 204],
      [139, 208],
    );
    shape(
      "#777f76",
      [153, 204],
      [155, 199],
      [167, 204],
      [172, 210],
      [151, 212],
    );
    for (let i = 0; i < decline * 24; i++) {
      const x = 127 + ((i * 43) % 71),
        y = 207 + (i % 8);
      shape("#a69a65", [x, y], [x + 4, y - 2], [x + 8, y - 2], [x + 3, y]);
    }
    ctx.fillStyle = winter ? "#cfd8d3" : "#aebdb7";
    for (let i = 0; i < wet * 37; i++) {
      const y = (i * 67 + time * (winter ? 10 : 82)) % 203;
      ctx.fillRect(
        Math.round(77 + ((i * 73 + y * 0.13) % 200)),
        Math.round(y),
        winter ? 2 : 1,
        winter ? 2 : 3,
      );
    }
    canvas.dataset.progress = String(progress);
  }
  function suspend(paused: boolean) {
    if (paused) {
      window.clearInterval(timer);
      timer = 0;
    } else if (!timer)
      timer = window.setInterval(() => {
        time += 0.1;
        paint();
      }, 100);
  }
  return {
    update(value, animate) {
      progress = clamp(value);
      paint();
      suspend(!animate);
    },
    suspend,
    destroy() {
      suspend(true);
      canvas.remove();
    },
  };
}
