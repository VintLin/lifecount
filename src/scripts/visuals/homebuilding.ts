import { drawWorker, type WorkAction } from "./house-worker";
import type { HourglassRenderer } from "./hourglass";

type Point = [number, number, number];
type Brick = { x: number; y: number; course: number };
const perimeter: [number, number][] = [];
for (let y = 0; y < 6; y++)
  for (let x = 0; x < 8; x++)
    if (x === 0 || x === 7 || y === 0 || y === 5) perimeter.push([x, y]);
const walls: Brick[] = [];
for (let course = 0; course < 8; course++) {
  for (const [x, y] of perimeter) {
    const door = y === 5 && x >= 4 && x <= 5 && course < 6;
    const windows =
      course >= 3 &&
      course < 6 &&
      ((y === 5 && (x === 1 || x === 2)) || (x === 7 && (y === 2 || y === 3)));
    if (!door && !windows) walls.push({ x, y, course });
  }
}
const count = (p: number, from: number, to: number, total: number) =>
  Math.floor(total * Math.min(1, Math.max(0, (p - from) / (to - from))));

// Fixed world coordinates keep completed masonry identical after a reload.
function project(x: number, y: number, z: number) {
  return [
    Math.round(170 + (x - y) * 10),
    Math.round(94 + (x + y) * 5 - z * 12),
  ];
}

export function createHomebuilding(host: HTMLElement): HourglassRenderer {
  const canvas = document.createElement("canvas");
  canvas.className = "lifecount-house-canvas";
  canvas.width = 360;
  canvas.height = 250;
  canvas.setAttribute("aria-hidden", "true");
  host.append(canvas);
  const ctx = canvas.getContext("2d")!;
  function face(color: string, ...vertices: Point[]) {
    ctx.fillStyle = color;
    ctx.beginPath();
    vertices.forEach(([x, y, z], i) => {
      const [u, v] = project(x, y, z);
      if (i) ctx.lineTo(u, v);
      else ctx.moveTo(u, v);
    });
    ctx.closePath();
    ctx.fill();
  }
  function beam(a: Point, b: Point, color: string, width = 1) {
    const [x, y] = project(...a),
      [u, v] = project(...b);
    // Rasterize on the scene's pixel grid to keep fine timber and ropes crisp.
    const steps = Math.max(1, Math.abs(u - x), Math.abs(v - y));
    ctx.fillStyle = color;
    for (let i = 0; i <= steps; i++)
      ctx.fillRect(
        Math.round(x + ((u - x) * i) / steps),
        Math.round(y + ((v - y) * i) / steps),
        width,
        width,
      );
  }
  function block(
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    h: number,
    top: string,
    front: string,
    side: string,
  ) {
    const X = x + w,
      Y = y + d,
      Z = z + h;
    face(side, [X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]);
    face(front, [x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z]);
    face(top, [x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]);
  }
  function rect(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
  function wheelbarrow(x: number, y: number) {
    const [u, v] = project(x, y, 0.32);
    rect(u - 3, v - 2, 6, 5, "#454848");
    rect(u - 1, v, 2, 2, "#a4aaa1");
    for (const offset of [-0.2, 0.2]) {
      beam([x, y + offset, 0.4], [x + 1.7, y + offset, 1.05], "#806851", 2);
      beam(
        [x + 0.92, y + offset, 0.64],
        [x + 1.05, y + offset, 0.05],
        "#686b65",
      );
    }
    face(
      "#597974",
      [x - 0.12, y - 0.42, 1.06],
      [x + 1.25, y - 0.42, 1.06],
      [x + 1.25, y + 0.42, 1.06],
      [x - 0.12, y + 0.42, 1.06],
    );
    face(
      "#799991",
      [x - 0.12, y + 0.42, 1.06],
      [x + 1.25, y + 0.42, 1.06],
      [x + 0.91, y + 0.27, 0.56],
      [x + 0.27, y + 0.27, 0.56],
    );
    face(
      "#486860",
      [x + 1.25, y - 0.42, 1.06],
      [x + 1.25, y + 0.42, 1.06],
      [x + 0.91, y + 0.27, 0.56],
      [x + 0.91, y - 0.27, 0.56],
    );
    beam([x - 0.12, y + 0.42, 1.06], [x + 1.25, y + 0.42, 1.06], "#acc1ac");
  }
  function sawhorse(x: number, y: number) {
    for (const end of [x, x + 1.65]) {
      beam([end, y - 0.38, 0.08], [end, y, 0.96], "#97714e", 2);
      beam([end, y + 0.38, 0.08], [end, y, 0.96], "#ad845b", 2);
    }
    block(
      x - 0.12,
      y - 0.12,
      0.9,
      1.95,
      0.24,
      0.2,
      "#dfbd88",
      "#b48b60",
      "#906a4f",
    );
  }
  function plant(x: number, y: number, z: number, seed: number) {
    const [u, v] = project(x, y, z);
    for (let i = 0; i < 9; i++) {
      const dx = ((i * 7 + seed) % 11) - 5,
        dy = (i * 3 + seed) % 5;
      rect(u + dx, v - dy, 3, 2, i % 2 ? "#6c8456" : "#82965d");
      if (i % 3 === 0)
        rect(u + dx + 1, v - dy - 1, 2, 2, seed % 2 ? "#d08b76" : "#e6bf71");
    }
  }
  let progress = 0,
    time = 0,
    frame = 0,
    last = 0,
    running = false,
    paused = false;
  const landscape = document.createElement("canvas");
  landscape.width = canvas.width;
  landscape.height = canvas.height;
  let seed = 193238;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function bakeLandscape() {
    block(-3, -3, -0.47, 15, 13, 0.48, "#9a995d", "#968367", "#786b59");
    block(-3, -3, 0.01, 15, 13, 0.09, "#a8b775", "#7e905a", "#697b51");
    // Patch density follows shade and traffic. Broken tufts soften the plot edge.
    for (let i = 0; i < 8200; i++) {
      const x = -3 + random() * 15,
        y = -3 + random() * 13;
      const edge = Math.min(x + 3, 12 - x, y + 3, 10 - y);
      const field =
        0.45 * Math.sin(x * 1.55 + y * 0.85) +
        0.32 * Math.cos(y * 2.1 - x * 0.65) +
        0.17 * Math.sin(x * 3.7);
      const border = Math.max(0, 1 - edge);
      const density = field * 0.45 + border * 0.45 + (x < -0.8 ? 0.22 : 0);
      if (random() > 0.55 + density) continue;
      const [u, v] = project(x, y, 0.11);
      const h = 1 + Math.floor(random() * (2 + border * 3));
      const green =
        field > 0.18 ? "#71864d" : field < -0.18 ? "#a6b96b" : "#8fa65f";
      rect(u, v, 1 + Math.floor(random() * 3), 1, green);
      if (random() < 0.45 + border * 0.25) {
        rect(u, v - h, 1, h, field > 0.15 ? "#7e9554" : "#a8bc70");
        if (h > 2) rect(u + 1, v - h - 1, 1, 2, "#bcc77d");
      }
    }
    // Low picket fence on the far boundaries.
    for (const z of [0.42, 0.85]) {
      beam([-2.6, -2.6, z], [10.8, -2.6, z], "#ae9274", 2);
      beam([-2.6, -2.6, z], [-2.6, 5.4, z], "#ae9274", 2);
    }
    for (let i = 0; i < 13; i++) {
      const x = i < 8 ? -2.6 + i * 1.9 : -2.6,
        y = i < 8 ? -2.6 : -2.6 + (i - 7) * 1.6;
      block(x, y, 0, 0.16, 0.18, 1.15, "#ebdabc", "#caaf8c", "#9e836b");
    }
    // A small boundary tree gives the site a fixed scale as the house grows.
    face(
      "#a0b07d",
      [-2.5, 3.5, 0.08],
      [-1.7, 3.1, 0.08],
      [-0.2, 3.8, 0.08],
      [-0.7, 4.6, 0.08],
      [-2.1, 4.5, 0.08],
    );
    block(-2.05, 3.9, 0.07, 0.34, 0.34, 1.9, "#aa8664", "#85654d", "#705a4c");
    const [tu, tv] = project(-1.9, 4.05, 2.3);
    beam([-1.9, 4.05, 1.1], [-2.55, 4.48, 2.48], "#655342", 3);
    beam([-1.9, 4.05, 1.6], [-1.24, 3.86, 2.92], "#79634a", 3);
    const foliage = [
      "#425541",
      "#536a49",
      "#668052",
      "#82965b",
      "#9eae6b",
      "#baca83",
    ];
    // Overlapping leaf masses share one upper-left light direction.
    for (const [cx, cy, rx, ry] of [
      [-7, -8, 10, 9],
      [6, -13, 11, 10],
      [-1, -21, 10, 10],
      [-12, -16, 8, 7],
      [0, -10, 10, 8],
      [10, -7, 7, 7],
    ]) {
      for (let y = -ry; y <= ry; y++)
        for (let x = -rx; x <= rx; x++) {
          const nx = x / rx,
            ny = y / ry,
            d = nx * nx + ny * ny;
          if (d > 1 + (random() - 0.5) * 0.19) continue;
          const light =
            -nx * 0.46 - ny * 0.66 + Math.sqrt(Math.max(0, 1 - d)) * 0.44;
          const shade = Math.min(
            5,
            Math.max(0, Math.floor(2 + 2.6 * light + (random() - 0.5) * 1.8)),
          );
          rect(tu + cx + x, tv + cy + y, 1, 1, foliage[shade]);
        }
    }
    landscape.getContext("2d")!.drawImage(canvas, 0, 0);
  }
  bakeLandscape();
  function draw() {
    ctx.clearRect(0, 0, 360, 250);
    ctx.drawImage(landscape, 0, 0);
    // Exposed subsoil marks the building pad and the route used for deliveries.
    face(
      "#bda684",
      [-0.5, -0.5, 0.07],
      [8.65, -0.5, 0.07],
      [8.65, 6.65, 0.07],
      [-0.5, 6.65, 0.07],
    );
    if (progress < 0.94) {
      face(
        "#c7b18d",
        [7.65, 1.2, 0.07],
        [11.25, 1.4, 0.07],
        [11, 6.75, 0.07],
        [8.3, 7.45, 0.07],
        [7.45, 6.6, 0.07],
      );
      for (const x of [9.55, 10.24]) {
        beam([x, 1.6, 0.08], [x - 0.13, 4.75, 0.08], "#b69e7f");
        beam([x - 0.13, 4.75, 0.08], [x - 0.46, 6.53, 0.08], "#c0a989");
      }
      for (let i = 0; i < 60; i++) {
        const [u, v] = project(
          8.65 + ((i * 31) % 200) / 100,
          1.6 + ((i * 19) % 470) / 100,
          0.08,
        );
        rect(u, v, 1 + (i % 3), 1, i % 3 ? "#b69c79" : "#d6c4a2");
      }
    }
    if (progress > 0.23) {
      const reach = Math.min(1, (progress - 0.23) * 3);
      face(
        "#9da57c",
        [8, 0, 0.09],
        [8 + 1.35 * reach, 0.8, 0.09],
        [8 + 1.35 * reach, 6.8, 0.09],
        [0.65, 6.8, 0.09],
        [0, 6, 0.09],
      );
    }
    const foundations = count(progress, 0.06, 0.15, perimeter.length);
    const trenches = Math.min(
      perimeter.length,
      1 + count(progress, 0, 0.06, perimeter.length),
    );
    for (const [x, y] of perimeter.slice(0, trenches)) {
      face(
        "#987c5d",
        [x, y, 0.08],
        [x + 1, y, 0.08],
        [x + 1, y + 1, 0.08],
        [x, y + 1, 0.08],
      );
      face(
        "#685647",
        [x + 0.13, y + 0.15, 0.08],
        [x + 0.88, y + 0.15, 0.08],
        [x + 0.88, y + 0.8, 0.08],
        [x + 0.13, y + 0.8, 0.08],
      );
      beam([x + 0.12, y + 0.82, 0.08], [x + 0.88, y + 0.82, 0.08], "#c4a379");
    }
    if (progress < 0.15) {
      wheelbarrow(9.2, 5.8);
      for (let i = 0; i < 7; i++) {
        const x = 8.5 + i * 0.29,
          y = 0.8 + (i % 3) * 0.27;
        face(
          "#b19269",
          [x - 0.55, y, 0.08],
          [x, y - 0.4, 0.08],
          [x + 0.3, y, 0.54],
          [x + 0.65, y + 0.35, 0.08],
          [x, y + 0.52, 0.08],
        );
        face(
          "#957655",
          [x + 0.3, y, 0.54],
          [x + 0.65, y + 0.35, 0.08],
          [x, y + 0.52, 0.08],
        );
      }
    }
    if (progress < 0.15) {
      const corners: Point[] = [
        [0, 0, 0.48],
        [8, 0, 0.48],
        [8, 6, 0.48],
        [0, 6, 0.48],
      ];
      corners.forEach(([x, y, z], i) => {
        beam([x, y, 0], [x, y, 0.7], "#836247", 2);
        beam([x, y, z], corners[(i + 1) % 4], "#efe1b8");
      });
    }
    perimeter.slice(0, foundations).forEach(([x, y]) => {
      const footing = (bx: number, by: number, width: number, depth: number) =>
        block(
          bx,
          by,
          0.08,
          width,
          depth,
          0.37,
          "#c3b7a3",
          "#9d9384",
          "#877f77",
        );
      if (y === 0 || y === 5) footing(x, y === 0 ? 0 : 5.42, 0.99, 0.58);
      if (x === 0 || x === 7) {
        const start = y === 0 ? 0.58 : y;
        footing(
          x === 0 ? 0 : 7.42,
          start,
          0.58,
          y === 0 || y === 5 ? 0.42 : 0.99,
        );
      }
    });
    if (progress >= 0.15)
      block(
        0.32,
        0.32,
        0.17,
        7.36,
        5.36,
        0.24,
        "#bfa78a",
        "#8e7c67",
        "#857968",
      );
    const laid = count(progress, 0.15, 0.55, walls.length);
    walls.slice(0, laid).forEach(({ x, y, course }) => {
      const shade = (x * 7 + y + course * 5) % 3;
      const z = 0.45 + course * 0.47;
      const plaster =
        progress >= 0.83 && course < count(progress, 0.83, 0.92, 8);
      const front = plaster
        ? "#e2d5b9"
        : ["#dfcdae", "#e2d0af", "#decbac"][shade];
      const side = plaster
        ? "#bdb19b"
        : ["#bdab92", "#c0ad94", "#baa790"][shade];
      const t = 0.35;
      function unit(bx: number, by: number, w: number, d: number) {
        block(
          bx,
          by,
          z,
          w,
          d,
          0.47,
          plaster ? "#e8dcc3" : "#e7d5b6",
          front,
          side,
        );
        if (progress >= 0.55) return;
        for (const f of [0.28, 0.72]) {
          const px = bx + w * (w > d ? f : 0.5),
            py = by + d * (w > d ? 0.5 : f);
          const hx = w * 0.12,
            hy = d * 0.13;
          face(
            "#af9c83",
            [px - hx, py - hy, z + 0.47],
            [px + hx, py - hy, z + 0.47],
            [px + hx, py + hy, z + 0.47],
            [px - hx, py + hy, z + 0.47],
          );
        }
      }
      if (y === 0 || y === 5) unit(x, y === 5 ? 6 - t : 0, 1, t);
      if (x === 0 || x === 7)
        unit(
          x === 7 ? 8 - t : 0,
          y === 0 ? t : y,
          t,
          y === 0 || y === 5 ? 1 - t : 1,
        );
      if (plaster) return;
      // Bed joints and staggered head joints make each exposed course legible.
      if (y === 5) {
        beam([x, 6, z], [x + 1, 6, z], "#baa186");
        const seam = x + (course % 2 ? 0.28 : 0.77);
        beam([seam, 6, z], [seam, 6, z + 0.4], "#cdb599");
      }
      if (x === 7) {
        beam([8, y, z], [8, y + 1, z], "#aa937d");
        const seam = y + (course % 2 ? 0.72 : 0.24);
        beam([8, seam, z], [8, seam, z + 0.4], "#b29c84");
      }
    });
    if (laid > walls.findIndex((b) => b.course === 6)) {
      block(0.76, 5.65, 3.27, 2.5, 0.35, 0.31, "#d1c4ac", "#cbbba2", "#a39887");
      block(
        3.77,
        5.65,
        3.27,
        2.46,
        0.35,
        0.31,
        "#d1c4ac",
        "#cbbba2",
        "#a39887",
      );
      block(7.65, 1.76, 3.27, 0.35, 2.5, 0.31, "#d1c4ac", "#cbbba2", "#a39887");
    }
    if (progress > 0.29 && progress < 0.62) {
      for (const y of [1, 4.5]) {
        const attach = Math.min(3.15, 0.45 + walls[laid - 1].course * 0.47);
        beam([8.02, y, attach], [9.4, y + 0.2, 0.12], "#947052", 2);
        block(
          9.23,
          y + 0.02,
          0.08,
          0.44,
          0.44,
          0.13,
          "#baa689",
          "#978069",
          "#947753",
        );
      }
    }
    const eave = 4.21,
      ridge = 6.95;
    const roofHeight = (x: number) => ridge - Math.abs(x - 4) * 0.64;
    const rafters = count(progress, 0.55, 0.62, 8);
    for (let i = 0; i < rafters; i++) {
      const y = -0.3 + i * 0.94;
      beam([-0.35, y, eave], [4, y, ridge], "#775139", 3);
      beam([4, y, ridge], [8.35, y, eave], "#a87b50", 3);
      beam([0, y, eave], [8, y, eave], "#745943", 2);
    }
    // Each pair of rafters sits on the wall plate. The longitudinal brace
    // links adjacent frames while the roof is still open.
    if (rafters > 0 && progress < 0.68) {
      for (let i = 0; i < rafters; i++) {
        const y = -0.3 + i * 0.94;
        beam([2, y, roofHeight(2)], [4, y, eave], "#a17b54");
        beam([4, y, eave], [6, y, roofHeight(6)], "#936e4c");
      }
      if (rafters > 1) {
        const lastY = -0.3 + (rafters - 1) * 0.94;
        beam([4, -0.3, ridge], [4, lastY, ridge], "#c09363", 2);
        beam(
          [7.7, -0.3, roofHeight(7.7)],
          [5.6, lastY, roofHeight(5.6)],
          "#b58c5e",
        );
      }
    }
    if (rafters === 8) {
      face("#d5bb95", [0, 6, eave], [8, 6, eave], [4, 6, ridge]);
      beam([4, 6, eave], [4, 6, ridge], "#9e7553", 2);
      beam([0, 6, eave], [8, 6, eave], "#88664e", 2);
    }
    // Underlay and spaced battens are visible just ahead of each tile course.
    if (progress >= 0.62) {
      for (const side of [-1, 1]) {
        const edge = 4 + side * 4.42,
          tip =
            edge -
            side * Math.min(4.42, ((progress - 0.62) / 0.18) * 4.42 + 0.76);
        face(
          "#797d78",
          [edge, -0.43, roofHeight(edge)],
          [tip, -0.43, roofHeight(tip)],
          [tip, 6.5, roofHeight(tip)],
          [edge, 6.5, roofHeight(edge)],
        );
        for (let x = edge; side * (x - tip) > 0; x -= side * 0.52)
          beam([x, -0.43, roofHeight(x)], [x, 6.5, roofHeight(x)], "#be975f");
      }
    }
    const tiles = count(progress, 0.62, 0.8, 112);
    for (let row = 0; row < 8; row++)
      for (let j = 0; j < 14; j++) {
        if (row * 14 + j >= tiles) continue;
        const side = j % 2,
          y = -0.43 + Math.floor(j / 2) * 0.99;
        const x = side ? 8.42 - row * 0.555 : -0.42 + row * 0.555,
          inner = x + (side ? -0.57 : 0.57);
        face(
          (side
            ? ["#b86348", "#c47151", "#bf6a4e"]
            : ["#d98a61", "#e3966d", "#df9066"])[(j + row) % 3],
          [x, y, roofHeight(x)],
          [inner, y, roofHeight(inner)],
          [inner, y + 1, roofHeight(inner)],
          [x, y + 1, roofHeight(x)],
        );
        for (const dy of [0.12, 0.62]) {
          beam(
            [x, y + dy, roofHeight(x)],
            [inner, y + dy, roofHeight(inner)],
            side ? "#aa624a" : "#be7757",
          );
          beam(
            [x, y + dy + 0.12, roofHeight(x)],
            [inner, y + dy + 0.12, roofHeight(inner)],
            side ? "#d48963" : "#e6a37b",
          );
        }
        beam(
          [x, y, roofHeight(x)],
          [x, y + 1, roofHeight(x)],
          side ? "#a45a48" : "#c87a56",
        );
      }
    if (progress >= 0.8) {
      beam([4, -0.43, ridge], [4, 6.5, ridge], "#e4a07a", 3);
      block(
        5.7,
        0.52,
        roofHeight(6.45),
        0.75,
        0.76,
        1.65,
        "#cd9275",
        "#a86c58",
        "#8f5a4e",
      );
      block(
        5.61,
        0.43,
        roofHeight(6.45) + 1.65,
        0.93,
        0.94,
        0.2,
        "#cc9b80",
        "#b98065",
        "#99674f",
      );
      face(
        "#71554b",
        [5.79, 0.6, roofHeight(6.45) + 1.86],
        [6.36, 0.6, roofHeight(6.45) + 1.86],
        [6.36, 1.18, roofHeight(6.45) + 1.86],
        [5.79, 1.18, roofHeight(6.45) + 1.86],
      );
      const details = count(progress, 0.8, 0.94, 4);
      if (details >= 1)
        block(1, 5.72, 1.86, 2, 0.13, 1.41, "#b5c6b2", "#6c958e", "#516e6b");
      if (details >= 2) {
        block(7.72, 2, 1.86, 0.13, 2, 1.41, "#b5c6b2", "#6c958e", "#587e7b");
        beam([1.98, 5.86, 1.86], [1.98, 5.86, 3.27], "#eedfbe", 2);
        beam([7.86, 3, 1.86], [7.86, 3, 3.27], "#dbcaa9", 2);
      }
      if (details >= 3) {
        block(4, 5.78, 0.45, 2, 0.14, 2.6, "#789689", "#627d70", "#495f59");
        block(
          3.98,
          5.68,
          3.05,
          2.04,
          0.33,
          0.22,
          "#9d8c70",
          "#947e61",
          "#806e56",
        );
        for (let board = 1; board < 6; board++)
          beam(
            [4 + board * 0.32, 5.93, 0.52],
            [4 + board * 0.32, 5.93, 3.02],
            "#567366",
          );
        const [u, v] = project(5.55, 5.93, 1.72);
        rect(u, v, 2, 2, "#dec695");
      }
      if (details >= 4)
        block(
          0.82,
          6.06,
          1.65,
          2.35,
          0.38,
          0.26,
          "#809264",
          "#af7857",
          "#876549",
        );
    }
    if (progress >= 0.85) {
      for (const z of [1.84, 2.54, 3.27])
        beam([8.1, 2, z], [8.1, 4, z], "#dacbb0");
      beam([8.1, 2, 1.85], [8.1, 2, 3.25], "#7c776a", 2);
      beam([7.86, 3, 2.95], [8.1, 3.52, 3.15], "#a5bdb2", 2);
      beam([1.16, 6.14, 2.8], [1.74, 6.14, 3.12], "#b5cdc1", 2);
      // Window reveals, sash rails, sill, and a louvered attic vent.
      beam([0.88, 6.12, 3.32], [3.12, 6.12, 3.32], "#917d67", 2);
      beam([1, 6.13, 2.48], [3, 6.13, 2.48], "#e4d6b7");
      beam([1, 6.13, 1.84], [3, 6.13, 1.84], "#f0dfbb", 2);
      for (const x of [0.55, 3.05]) {
        block(x, 6.03, 1.83, 0.38, 0.12, 1.48, "#92a295", "#59796f", "#496759");
        for (let j = 0; j < 4; j++)
          beam(
            [x, 6.16, 2 + j * 0.3],
            [x + 0.37, 6.16, 2 + j * 0.3],
            "#789486",
          );
      }
      for (let j = 0; j < 4; j++)
        beam(
          [3.4, 6.02, 4.85 + j * 0.15],
          [4.57, 6.02, 4.85 + j * 0.15],
          "#836c55",
        );
    }
    if (progress >= 0.9) {
      // Lean-to porch: stone landing, posts, knees and a standing-seam canopy.
      block(3.68, 6, 0.08, 2.7, 1.35, 0.3, "#c8bba1", "#a5967f", "#978977");
      for (const x of [3.76, 6.06]) {
        block(x, 7.07, 0.38, 0.16, 0.18, 2.7, "#dabf93", "#b18b63", "#8d7157");
        beam([x, 7.07, 2.53], [x, 6.63, 3.02], "#a17e59", 2);
      }
      face(
        "#668482",
        [3.38, 5.99, 3.91],
        [6.61, 5.99, 3.91],
        [6.61, 7.6, 3.16],
        [3.38, 7.6, 3.16],
      );
      for (let x = 3.38; x < 6.62; x += 0.54)
        beam([x, 6, 3.91], [x, 7.6, 3.16], "#8da5a0");
      beam([3.38, 7.6, 3.16], [6.61, 7.6, 3.16], "#4c6765", 2);
      beam([8.45, -0.4, 4.13], [8.45, 6.48, 4.13], "#795e51", 2);
      beam([8.18, 0.21, 4], [8.18, 0.21, 0.45], "#8e8a79", 2);
    }
    if (progress >= 0.96) {
      for (const x of [1.05, 1.5, 1.95, 2.4, 2.8])
        plant(x, 6.32, 1.9, Math.round(x * 10));
      for (const y of [1.6, 2.4, 3.2, 4.1])
        plant(8.35, y, 0.27, Math.round(y * 10));
    }
    const path = count(progress, 0.94, 1, 6);
    for (let i = 0; i < path; i++)
      block(
        4.05,
        9.45 - i * 0.66,
        0.09,
        1.94,
        0.61,
        i === 5 ? 0.32 : 0.12,
        "#d8cbb6",
        "#b6a48f",
        "#a08e7c",
      );
    const next = walls[Math.min(laid, walls.length - 1)];
    const platform = progress >= 0.32 && progress < 0.8;
    const deck =
      progress >= 0.55
        ? 3.05
        : Math.max(0.72, 0.45 + (next.course + 1) * 0.47 - 1.2);
    if (platform) {
      for (const x of [0.1, 3.8, 7.8]) {
        beam([x, 6.8, 0.08], [x, 6.8, deck + 0.6], "#8b7159", 2);
      }
      beam([0.1, 6.8, 0.18], [3.8, 6.8, deck], "#a08260", 2);
      beam([3.8, 6.8, deck], [7.8, 6.8, 0.18], "#a08260", 2);
      block(
        -0.1,
        6.1,
        deck - 0.13,
        8.3,
        0.85,
        0.13,
        "#c8ab7d",
        "#9e805d",
        "#816744",
      );
      // The entry bay stays open above the leaning access ladder.
      for (const h of [0.48, 0.97]) {
        beam([0.1, 6.93, deck + h], [7.31, 6.93, deck + h], "#827b6c");
        beam([0.1, 6.93, deck], [0.1, 6.93, deck + h], "#837b70", 2);
        beam([3.8, 6.93, deck], [3.8, 6.93, deck + h], "#837b70", 2);
        beam([7.31, 6.93, deck], [7.31, 6.93, deck + h], "#837b70", 2);
      }
      for (const x of [7.46, 8.13])
        beam([x, 7.86, 0.1], [x, 6.74, deck + 0.65], "#895f42", 2);
      for (let z = 0.36; z < deck + 0.28; z += 0.38) {
        const y = 7.86 - (1.12 * (z - 0.1)) / (deck + 0.55);
        beam([7.46, y, z], [8.13, y, z], "#c8a67e", 2);
      }
      for (const x of [0.1, 3.8, 7.8])
        block(
          x - 0.16,
          6.63,
          0.06,
          0.49,
          0.4,
          0.1,
          "#bda589",
          "#927a60",
          "#816e5c",
        );
      if (progress >= 0.55) {
        // A return scaffold gives the roofer a work floor along the eaves.
        for (const y of [0.1, 3.35, 6.5]) {
          beam([8.88, y, 0.12], [8.88, y, deck + 1], "#817c70", 2);
          beam([8.13, y, 0.12], [8.13, y, deck], "#817c70", 2);
        }
        beam([8.88, 0.1, 0.2], [8.88, 3.35, deck], "#9a8b76", 2);
        beam([8.88, 3.35, deck], [8.88, 6.5, 0.2], "#9a8b76", 2);
        block(
          8.08,
          0.02,
          deck - 0.14,
          0.9,
          6.8,
          0.14,
          "#cfb78f",
          "#aa8a62",
          "#927553",
        );
        for (const h of [0.5, 1])
          beam([8.88, 0.1, deck + h], [8.88, 6.5, deck + h], "#817c70");
        for (const x of [8.1, 8.63])
          beam([x, 5.92, deck], [x, 5.29, eave + 0.46], "#a77a4e", 2);
        for (let z = deck + 0.2; z < eave + 0.3; z += 0.37) {
          const y = 5.92 - (0.63 * (z - deck)) / (eave + 0.46 - deck);
          beam([8.1, y, z], [8.63, y, z], "#cfac80", 2);
        }
      }
      // A separate rope hoist supplies the staging from the yard beside the ladder.
      const liftY = 6.38,
        liftX = 9.05,
        loadZ = 0.15 + (deck - 0.15) * (0.5 - 0.5 * Math.cos(time * 0.52));
      beam([8.12, liftY, deck - 0.1], [8.12, liftY, deck + 2.1], "#716858", 2);
      beam([8.12, liftY, deck + 2.1], [liftX, liftY, deck + 2.1], "#9c7954", 2);
      beam([8.12, liftY, deck + 1.25], [liftX, liftY, deck + 2.1], "#9c7954");
      beam([liftX, liftY, deck + 2.1], [liftX, liftY, loadZ + 0.66], "#696257");
      for (const dx of [-0.33, 0.33])
        beam(
          [liftX, liftY, loadZ + 0.66],
          [liftX + dx, liftY, loadZ + 0.13],
          "#8e785e",
        );
      block(
        liftX - 0.39,
        liftY - 0.28,
        loadZ,
        0.78,
        0.56,
        0.12,
        "#ba9568",
        "#917457",
        "#785f4c",
      );
      block(
        liftX - 0.32,
        liftY - 0.24,
        loadZ + 0.12,
        0.64,
        0.48,
        0.21,
        "#c7b08b",
        "#ad9371",
        "#988262",
      );
      // Materials waiting on the deck allow the mason to work without carrying blocks up a ladder.
      for (let i = 0; i < 3; i++)
        block(
          6.05 + i * 0.38,
          6.16,
          deck,
          0.36,
          0.45,
          0.23,
          progress < 0.55 ? "#d6c3a3" : "#d9956d",
          progress < 0.55 ? "#ae9980" : "#ae6249",
          "#91725d",
        );
    }
    if (progress >= 0.15 && progress < 0.55) {
      wheelbarrow(9.7, 6);
      for (let i = 0; i < 12; i++)
        block(
          9 + (i % 3) * 0.67,
          2.4 + (Math.floor(i / 3) % 2) * 0.52,
          0.08 + Math.floor(i / 6) * 0.3,
          0.65,
          0.51,
          0.28,
          "#e2c7a3",
          "#bb9c7a",
          "#ad8e73",
        );
      block(
        8.75,
        4.35,
        0.08,
        1.35,
        0.91,
        0.26,
        "#a39782",
        "#887864",
        "#706451",
      );
      beam([9.05, 4.6, 0.4], [9.88, 4.6, 0.4], "#d1aa44", 2);
    } else if (progress >= 0.55 && progress < 0.94) {
      sawhorse(9.05, 3.3);
      sawhorse(9.05, 5.5);
      for (let i = 0; i < 3; i++)
        block(
          9.02 + 0.43 * i,
          2.8,
          1.1,
          0.41,
          3.24,
          0.13,
          "#d9b281",
          "#b08d62",
          "#987652",
        );
      beam([9.23, 3.58, 1.25], [10.26, 4.13, 1.25], "#808988", 3);
      beam([10.26, 4.13, 1.25], [10.57, 4.26, 1.25], "#955f40", 3);
    }
    const digging = progress < 0.15;
    const pit =
      perimeter[
        Math.min(
          perimeter.length - 1,
          progress < 0.06 ? trenches - 1 : foundations,
        )
      ];
    const workX = digging
      ? pit[0] + 0.5
      : progress < 0.55
        ? next.x + 0.5
        : progress < 0.8
          ? 4
          : 5;
    const workY = digging
      ? pit[1] + 0.9
      : progress >= 0.94
        ? 9.55 - path * 0.6
        : 6.65;
    // Ground workers visit the yard. Masons collect material at the scaffold landing.
    const cycle = (time % 12) / 12;
    const trip = Math.min(
      1,
      Math.max(0, (1 - Math.cos(cycle * 2 * Math.PI)) * 0.7 - 0.18),
    );
    const along = Math.min(1, trip / 0.55);
    const yard = Math.max(0, (trip - 0.77) / 0.23);
    const wx =
      progress === 1
        ? 6.8
        : digging
          ? workX
          : workX + (7.85 - workX) * along + 1.85 * yard;
    const wy =
      progress === 1
        ? 7.8
        : digging
          ? workY
          : workY + (7.2 - workY) * along - 2.8 * yard;
    const framing = progress >= 0.55 && progress < 0.62;
    const roofing = progress >= 0.62 && progress < 0.8;
    const roofX = 8.19 - Math.floor(tiles / 14) * 0.52;
    const roofY = Math.min(5.85, Math.floor((tiles % 14) / 2) + 0.1);
    const stageY = Math.max(0.35, Math.min(6.1, (rafters - 0.5) * 0.94));
    const platformX = workX + (6.8 - workX) * trip;
    const [u, v] = roofing
      ? project(roofX, roofY, roofHeight(roofX) + 0.1)
      : framing
        ? project(8.47, stageY, deck + 0.08)
        : platform
          ? project(platformX, 6.52, deck + 0.08)
          : project(wx, wy, 0.15);
    const walking =
      !digging &&
      !framing &&
      !roofing &&
      progress < 1 &&
      trip > 0.04 &&
      trip < 0.98;
    const action: WorkAction =
      progress === 1
        ? "stand"
        : roofing
          ? "tile"
          : progress < 0.06
            ? "dig"
            : digging
              ? "level"
              : progress < 0.55
                ? walking && cycle > 0.5
                  ? "carry"
                  : "mortar"
                : framing
                  ? "hammer"
                  : progress < 0.94
                    ? "driver"
                    : "pave";
    ctx.fillStyle = "rgba(58,52,44,.22)";
    ctx.beginPath();
    ctx.ellipse(u + 3, v + 1, 6, 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    drawWorker(
      ctx,
      u,
      v,
      action,
      time,
      walking,
      walking && cycle > 0.5 ? -1 : 1,
    );
    canvas.dataset.progress = String(progress);
  }
  function tick(now: number) {
    frame = 0;
    if (paused || !running) return;
    if (now - last >= 1000 / 12) {
      time += last ? Math.min((now - last) / 1000, 0.2) : 0;
      last = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (running && !paused) {
      if (!frame) frame = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    }
  }
  return {
    update(value, animate) {
      progress = Math.min(1, Math.max(0, value));
      running = animate && progress < 1;
      draw();
      sync();
    },
    suspend(value) {
      paused = value;
      sync();
    },
    destroy() {
      running = false;
      sync();
      canvas.remove();
    },
  };
}
