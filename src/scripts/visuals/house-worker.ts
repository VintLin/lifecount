// Joint coordinates are in native scene pixels, relative to the boot soles.
type Joint = [number, number];
export type WorkAction =
  | "stand"
  | "dig"
  | "level"
  | "carry"
  | "mortar"
  | "hammer"
  | "tile"
  | "driver"
  | "pave";
export function drawWorker(
  ctx: CanvasRenderingContext2D,
  u: number,
  v: number,
  action: WorkAction,
  time: number,
  walking: boolean,
  facing: number,
) {
  ctx.save();
  ctx.translate(u, v);
  ctx.scale(facing, 1);
  function patch(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }
  function limb(a: Joint, b: Joint, size: number, color: string) {
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
    for (let i = 0; i <= steps; i++)
      patch(
        a[0] + (dx * i) / steps - size / 2,
        a[1] + (dy * i) / steps - size / 2,
        size,
        size,
        color,
      );
  }
  const kneel = action === "tile" || action === "pave";
  const working = !walking && action !== "stand" && action !== "carry";
  const stroke = working ? (1 + Math.sin(time * 3.4)) / 2 : 0;
  const stride = walking ? Math.sin(time * 5.6) * 3 : 0;
  const bend = kneel
    ? 4
    : working
      ? 1.3 + stroke
      : action === "carry"
        ? 1.5
        : 0;
  const hip: Joint = [-bend * 0.25, kneel ? -6 : -11];
  const shoulder: Joint = [hip[0] + bend, hip[1] - (kneel ? 5 : 8) + stroke];
  function leg(offset: number, step: number, far: boolean) {
    const knee: Joint = [
      hip[0] + offset + (kneel ? 4 : step * 0.7 + 0.6),
      kneel ? -2 : -5,
    ];
    const heel: Joint = [
      offset + step - (kneel ? 3 : 0),
      -1 - Math.max(0, step * 0.35),
    ];
    limb([hip[0] + offset, hip[1]], knee, 3, far ? "#34404e" : "#4d6070");
    limb(knee, heel, 2, far ? "#313943" : "#43505a");
    patch(heel[0] - 1, heel[1], 4, 2, "#493c35");
  }
  leg(-2, -stride, true);
  leg(1, stride, false);
  const wrist: Joint = [
    shoulder[0] + (action === "stand" ? 2 : 6) + stroke * 2,
    shoulder[1] + (kneel ? 7 : action === "stand" ? 8 : 5) + stroke * 2,
  ];
  limb(
    [shoulder[0] - 2, shoulder[1]],
    [wrist[0] - 4, wrist[1] - 1],
    3,
    "#565f62",
  );
  limb(
    [wrist[0] - 4, wrist[1] - 1],
    [wrist[0] - 2, wrist[1] + 1],
    2,
    "#a37b60",
  );
  limb(hip, shoulder, 5, "#354e5e");
  limb([hip[0] + 1, hip[1] - 2], [shoulder[0] + 1, shoulder[1]], 3, "#657c87");
  patch(hip[0] - 2, hip[1] - 1, 5, 2, "#594c41");
  const hx = shoulder[0] + 1,
    hy = shoulder[1] - 4;
  patch(hx - 2, hy - 1, 4, 5, "#a67b5f");
  patch(hx, hy, 3, 3, "#e4b68c");
  patch(hx + 2, hy + 1, 2, 1, "#bf9171");
  patch(hx + 1, hy, 1, 1, "#55493e");
  patch(hx - 2, hy - 3, 4, 2, "#d79e4d");
  patch(hx - 3, hy - 2, 6, 2, "#c78d45");
  patch(hx - 3, hy - 1, 8, 1, "#f1c675");
  const elbow: Joint = [
    shoulder[0] + (action === "carry" ? 1 : 3),
    shoulder[1] + 5,
  ];
  limb(shoulder, elbow, 3, "#84949a");
  limb(elbow, wrist, 2, "#d8a783");
  const [x, y] = wrist;
  switch (action) {
    case "stand":
      break;
    case "dig":
      limb([x - 2, y - 6], [x + 4, y + 8], 1, "#876441");
      patch(x + 3, y + 7, 4, 3, "#636e6c");
      break;
    case "level":
      patch(x - 1, y, 7, 2, "#c69b41");
      patch(x + 2, y, 2, 1, "#656751");
      break;
    case "mortar":
      limb(wrist, [x + 3, y + 1], 1, "#765d49");
      patch(x + 3, y, 5, 2, "#929e9f");
      break;
    case "carry":
    case "tile":
      patch(x - 4, y - 3, 7, 3, action === "tile" ? "#b36248" : "#b59c80");
      patch(x - 4, y - 4, 7, 1, action === "tile" ? "#e09467" : "#dec8aa");
      break;
    case "driver":
      patch(x, y - 2, 5, 3, "#bb9047");
      patch(x + 5, y - 1, 3, 1, "#69797a");
      break;
    default:
      limb(wrist, [x + 2, y - 5], 1, "#886743");
      patch(x, y - 6, 5, 2, "#535d5e");
  }
  ctx.restore();
}
