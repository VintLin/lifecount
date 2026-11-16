import type { LifeCountMessages, LifeCountLocale } from "@/i18n/lifecount";
import type { VisualMode } from "@/data/lifecount";
import { anniversary, parseDay } from "@/utils/lifecount";

export interface VisualModeData {
  mode: VisualMode;
  birthday: string;
  displayAge: number;
  locale: LifeCountLocale;
  messages: LifeCountMessages;
  enabled: boolean;
}

interface TimeSnapshot {
  totalSeconds: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  progress: number;
}

interface DaylightFrame {
  minute: number;
  phaseZh: string;
  phaseEn: string;
  top: string;
  bottom: string;
  sunX: number;
  sunY: number;
  stars: number;
}

const VISUAL_MODES: VisualMode[] = ["grid", "hourglass", "candle", "daylight"];
const PARTICLE_COUNT = 360;

const DAYLIGHT_FRAMES: DaylightFrame[] = [
  { minute: 0, phaseZh: "深夜", phaseEn: "Night", top: "#0b1024", bottom: "#202b4b", sunX: 0.2, sunY: 0.78, stars: 0.9 },
  { minute: 270, phaseZh: "凌晨", phaseEn: "Pre-dawn", top: "#172043", bottom: "#8f6480", sunX: 0.28, sunY: 0.72, stars: 0.65 },
  { minute: 360, phaseZh: "清晨", phaseEn: "Dawn", top: "#6b87b3", bottom: "#f4b27e", sunX: 0.38, sunY: 0.62, stars: 0.15 },
  { minute: 540, phaseZh: "上午", phaseEn: "Morning", top: "#73b9e2", bottom: "#dff4ff", sunX: 0.52, sunY: 0.36, stars: 0 },
  { minute: 720, phaseZh: "正午", phaseEn: "Noon", top: "#4eabe1", bottom: "#eefaff", sunX: 0.68, sunY: 0.2, stars: 0 },
  { minute: 930, phaseZh: "下午", phaseEn: "Afternoon", top: "#5fa8d3", bottom: "#f5ddad", sunX: 0.8, sunY: 0.34, stars: 0 },
  { minute: 1080, phaseZh: "傍晚", phaseEn: "Sunset", top: "#4e5f98", bottom: "#f39a68", sunX: 0.9, sunY: 0.62, stars: 0.12 },
  { minute: 1170, phaseZh: "暮色", phaseEn: "Dusk", top: "#20294f", bottom: "#6d4e75", sunX: 0.96, sunY: 0.73, stars: 0.52 },
  { minute: 1260, phaseZh: "夜间", phaseEn: "Night", top: "#0b1024", bottom: "#202b4b", sunX: 0.2, sunY: 0.78, stars: 0.9 },
  { minute: 1440, phaseZh: "深夜", phaseEn: "Night", top: "#0b1024", bottom: "#202b4b", sunX: 0.2, sunY: 0.78, stars: 0.9 }
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(value: string) {
  const normalized = value.replace("#", "");
  const parts = normalized.length === 3
    ? normalized.split("").map((part) => Number.parseInt(`${part}${part}`, 16))
    : [0, 2, 4].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16));
  return { r: parts[0], g: parts[1], b: parts[2] };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${[r, g, b].map((part) => Math.round(part).toString(16).padStart(2, "0")).join("")}`;
}

function mixColor(first: string, second: string, amount: number) {
  const a = hexToRgb(first);
  const b = hexToRgb(second);
  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount
  });
}

function snapshotFor(birthday: string, displayAge: number): TimeSnapshot {
  const start = parseDay(birthday).getTime();
  const end = parseDay(anniversary(birthday, displayAge * 12)).getTime();
  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
  const elapsedSeconds = clamp(Math.floor((Date.now() - start) / 1000), 0, totalSeconds);
  return {
    totalSeconds,
    elapsedSeconds,
    remainingSeconds: Math.max(0, totalSeconds - elapsedSeconds),
    progress: totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0
  };
}

function formatSeconds(value: number, locale: LifeCountLocale) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "zh-CN").format(value);
}

function currentDaylightFrame(date = new Date()) {
  const minute = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  const upper = DAYLIGHT_FRAMES.find((frame, index) => minute <= frame.minute && index > 0) ?? DAYLIGHT_FRAMES[1];
  const lower = DAYLIGHT_FRAMES[DAYLIGHT_FRAMES.indexOf(upper) - 1] ?? DAYLIGHT_FRAMES[0];
  const amount = clamp((minute - lower.minute) / Math.max(1, upper.minute - lower.minute), 0, 1);
  const smooth = amount * amount * (3 - 2 * amount);
  return {
    phaseZh: smooth < 0.5 ? lower.phaseZh : upper.phaseZh,
    phaseEn: smooth < 0.5 ? lower.phaseEn : upper.phaseEn,
    top: mixColor(lower.top, upper.top, smooth),
    bottom: mixColor(lower.bottom, upper.bottom, smooth),
    sunX: lower.sunX + (upper.sunX - lower.sunX) * smooth,
    sunY: lower.sunY + (upper.sunY - lower.sunY) * smooth,
    stars: lower.stars + (upper.stars - lower.stars) * smooth
  };
}

function createParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
    phase: (index * 0.61803398875) % 1,
    drift: ((index * 17) % 11) / 11 - 0.5,
    size: 1 + (index % 3) * 0.45
  }));
}

export interface VisualModeController {
  update(data: VisualModeData): void;
  destroy(): void;
}

export function setupVisualMode(
  root: HTMLElement,
  onModeChange: (mode: VisualMode) => void
): VisualModeController {
  const trigger = root.querySelector<HTMLButtonElement>("[data-lifecount-visual-trigger]");
  const menu = root.querySelector<HTMLElement>("[data-lifecount-visual-menu]");
  const menuTitle = root.querySelector<HTMLElement>("[data-lifecount-visual-menu-title]");
  const options = root.querySelector<HTMLElement>("[data-lifecount-visual-options]");
  const mapWrap = root.querySelector<HTMLElement>("[data-lifecount-map-wrap]");
  const visualStage = root.querySelector<HTMLElement>("[data-lifecount-visual-stage]");
  const title = root.querySelector<HTMLElement>("[data-lifecount-visual-title]");
  const description = root.querySelector<HTMLElement>("[data-lifecount-visual-description]");
  const summary = root.querySelector<HTMLElement>("[data-lifecount-visual-summary]");
  const hourglassView = root.querySelector<HTMLElement>("[data-lifecount-hourglass-view]");
  const candleView = root.querySelector<HTMLElement>("[data-lifecount-candle-view]");
  const daylightView = root.querySelector<HTMLElement>("[data-lifecount-daylight-view]");
  const canvas = root.querySelector<HTMLCanvasElement>("[data-lifecount-hourglass-canvas]");
  const candleBody = root.querySelector<SVGRectElement>("[data-lifecount-candle-body]");
  const candleFlame = root.querySelector<SVGPathElement>("[data-lifecount-candle-flame]");
  const candleDripLeft = root.querySelector<SVGPathElement>("[data-lifecount-candle-drip-left]");
  const candleDripRight = root.querySelector<SVGPathElement>("[data-lifecount-candle-drip-right]");
  const daylightSun = root.querySelector<HTMLElement>("[data-lifecount-daylight-sun]");
  const daylightStars = root.querySelector<HTMLElement>("[data-lifecount-daylight-stars]");

  let currentData: VisualModeData | null = null;
  let animationFrame = 0;
  let daylightTimer = 0;
  let resizeObserver: ResizeObserver | null = null;
  let reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const particles = createParticles();

  const closeMenu = () => {
    if (!menu || !trigger) return;
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  };

  const drawHourglass = (time: number) => {
    if (!canvas || !currentData) return;
    const snapshot = snapshotFor(currentData.birthday, currentData.displayAge);
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(220, bounds.width || 320);
    const height = Math.max(260, bounds.height || 360);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const left = width * 0.2;
    const right = width * 0.8;
    const top = height * 0.1;
    const bottom = height * 0.9;
    const neckTop = height * 0.46;
    const neckBottom = height * 0.54;
    const upperHeight = neckTop - top;
    const lowerHeight = bottom - neckBottom;
    const sand = "#c58d52";
    const glass = "rgba(40, 40, 46, 0.72)";

    const upperSand = upperHeight * clamp(snapshot.remainingSeconds / Math.max(1, snapshot.totalSeconds), 0, 1);
    const lowerSand = lowerHeight * snapshot.progress;
    context.fillStyle = sand;
    context.beginPath();
    context.moveTo(left + (right - left) * (1 - upperSand / upperHeight) * 0.18, top + upperHeight - upperSand);
    context.lineTo(right - (right - left) * (1 - upperSand / upperHeight) * 0.18, top + upperHeight - upperSand);
    context.lineTo(right * 0.5 + left * 0.5, neckTop);
    context.lineTo(right * 0.5 + left * 0.5, neckTop);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(left, bottom);
    context.lineTo(right, bottom);
    context.lineTo(right * 0.5 + left * 0.5, neckBottom);
    context.lineTo(right * 0.5 + left * 0.5, neckBottom);
    context.closePath();
    context.fill();
    if (lowerSand > 0) {
      const sandTop = bottom - lowerSand;
      context.beginPath();
      context.moveTo(left + (right - left) * (sandTop - neckBottom) / Math.max(1, lowerHeight) * 0.18, sandTop);
      context.lineTo(right - (right - left) * (sandTop - neckBottom) / Math.max(1, lowerHeight) * 0.18, sandTop);
      context.lineTo(right, bottom);
      context.lineTo(left, bottom);
      context.closePath();
      context.fill();
    }

    if (!reducedMotion) {
      const streamStart = neckTop;
      const streamEnd = neckBottom + lowerHeight * 0.28;
      for (const particle of particles) {
        const flow = (time * 0.00022 + particle.phase) % 1;
        if (flow > 0.54) continue;
        const y = streamStart + (streamEnd - streamStart) * (flow / 0.54);
        const x = width * 0.5 + Math.sin(time * 0.002 + particle.phase * 12) * width * 0.018 + particle.drift * width * 0.025;
        context.fillStyle = "#e4b978";
        context.fillRect(x, y, particle.size, particle.size);
      }
    }

    context.strokeStyle = glass;
    context.lineWidth = 3;
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(left, top);
    context.lineTo(right, top);
    context.lineTo(width * 0.5, neckTop);
    context.lineTo(right, bottom);
    context.lineTo(left, bottom);
    context.lineTo(width * 0.5, neckBottom);
    context.closePath();
    context.stroke();
    context.beginPath();
    context.moveTo(left - 12, top);
    context.lineTo(right + 12, top);
    context.moveTo(left - 12, bottom);
    context.lineTo(right + 12, bottom);
    context.stroke();
  };

  const stopAnimation = () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const startAnimation = () => {
    stopAnimation();
    if (!currentData || currentData.mode !== "hourglass" || reducedMotion || document.hidden) {
      drawHourglass(performance.now());
      return;
    }
    const frame = (time: number) => {
      drawHourglass(time);
      animationFrame = requestAnimationFrame(frame);
    };
    animationFrame = requestAnimationFrame(frame);
  };

  const updateCandle = () => {
    if (!currentData) return;
    const snapshot = snapshotFor(currentData.birthday, currentData.displayAge);
    const remainingHeight = Math.max(24, 184 * (1 - snapshot.progress));
    const bodyY = 224 - remainingHeight;
    candleBody?.setAttribute("y", String(bodyY));
    candleBody?.setAttribute("height", String(remainingHeight));
    candleFlame?.setAttribute("opacity", snapshot.progress >= 1 ? "0" : "1");
    const dripOpacity = snapshot.progress < 0.08 ? 0 : Math.min(1, snapshot.progress * 1.4);
    candleDripLeft?.setAttribute("opacity", String(dripOpacity));
    candleDripRight?.setAttribute("opacity", String(dripOpacity * 0.8));
  };

  const updateDaylight = () => {
    if (!currentData || !daylightView) return;
    const frame = currentDaylightFrame();
    daylightView.style.setProperty("--daylight-top", frame.top);
    daylightView.style.setProperty("--daylight-bottom", frame.bottom);
    daylightSun?.style.setProperty("--sun-x", `${frame.sunX * 100}%`);
    daylightSun?.style.setProperty("--sun-y", `${frame.sunY * 100}%`);
    daylightStars?.style.setProperty("--stars-opacity", String(frame.stars));
    const time = new Intl.DateTimeFormat(currentData.locale === "en" ? "en-US" : "zh-CN", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());
    const phase = currentData.locale === "en" ? frame.phaseEn : frame.phaseZh;
    const snapshot = snapshotFor(currentData.birthday, currentData.displayAge);
    if (summary) {
      summary.textContent = `${currentData.messages.visualLocalTime(time, phase)} · ${currentData.messages.visualProgress(`${(snapshot.progress * 100).toFixed(1)}%`)}`;
    }
  };

  const stopDaylightTimer = () => {
    if (daylightTimer) window.clearInterval(daylightTimer);
    daylightTimer = 0;
  };

  const startDaylightTimer = () => {
    stopDaylightTimer();
    if (currentData?.mode !== "daylight") return;
    updateDaylight();
    daylightTimer = window.setInterval(updateDaylight, 30_000);
  };

  const renderOptions = () => {
    if (!options || !currentData) return;
    options.replaceChildren(...VISUAL_MODES.map((mode) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "lifecount-visual-option";
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(mode === currentData?.mode));
      item.dataset.visualMode = mode;
      const copy = document.createElement("span");
      copy.className = "lifecount-visual-option-copy";
      const label = document.createElement("strong");
      label.textContent = currentData?.messages.visualModes[mode] ?? mode;
      const detail = document.createElement("small");
      detail.textContent = currentData?.messages.visualModeDescriptions[mode] ?? "";
      copy.append(label, detail);
      const check = document.createElement("span");
      check.className = "lifecount-visual-option-check";
      check.textContent = "✓";
      check.setAttribute("aria-hidden", "true");
      item.append(copy, check);
      item.addEventListener("click", () => {
        closeMenu();
        onModeChange(mode);
        requestAnimationFrame(() => trigger?.focus());
      });
      return item;
    }));
  };

  const update = (data: VisualModeData) => {
    currentData = data;
    if (!trigger || !menu || !visualStage || !mapWrap) return;
    trigger.disabled = !data.enabled;
    trigger.setAttribute("aria-label", data.messages.visualModeButton);
    trigger.title = data.messages.visualModeButton;
    if (menuTitle) menuTitle.textContent = data.messages.visualModeTitle;
    candleView?.querySelector("svg")?.setAttribute("aria-label", data.messages.visualModes.candle);
    renderOptions();

    const visualActive = data.enabled && data.mode !== "grid";
    mapWrap.hidden = visualActive;
    visualStage.hidden = !visualActive;
    hourglassView?.toggleAttribute("hidden", data.mode !== "hourglass");
    candleView?.toggleAttribute("hidden", data.mode !== "candle");
    daylightView?.toggleAttribute("hidden", data.mode !== "daylight");
    if (title) title.textContent = data.messages.visualModes[data.mode];
    if (description) description.textContent = data.messages.visualModeDescriptions[data.mode];
    if (data.mode === "hourglass") {
      const snapshot = snapshotFor(data.birthday, data.displayAge);
      if (summary) {
        summary.textContent = `${data.messages.visualElapsed(formatSeconds(snapshot.elapsedSeconds, data.locale))} · ${data.messages.visualRemaining(formatSeconds(snapshot.remainingSeconds, data.locale))} · ${data.messages.visualProgress(`${(snapshot.progress * 100).toFixed(1)}%`)}`;
      }
      startAnimation();
    } else {
      stopAnimation();
    }
    if (data.mode === "candle") {
      updateCandle();
      const snapshot = snapshotFor(data.birthday, data.displayAge);
      if (summary) summary.textContent = `${data.messages.visualProgress(`${(snapshot.progress * 100).toFixed(1)}%`)} · ${data.messages.visualRemaining(formatSeconds(snapshot.remainingSeconds, data.locale))}`;
    }
    startDaylightTimer();
  };

  const onDocumentClick = (event: Event) => {
    if (!menu || !trigger || !root.contains(event.target as Node)) return;
    if (!menu.contains(event.target as Node) && event.target !== trigger && !trigger.contains(event.target as Node)) closeMenu();
  };
  const onDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") closeMenu();
  };
  const onVisibilityChange = () => {
    if (document.hidden) stopAnimation();
    else if (currentData?.mode === "hourglass") startAnimation();
  };

  trigger?.addEventListener("click", () => {
    if (trigger.disabled || !menu) return;
    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    trigger.setAttribute("aria-expanded", String(willOpen));
  });
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onDocumentKeydown);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.matchMedia?.("(prefers-reduced-motion: reduce)").addEventListener("change", (event) => {
    reducedMotion = event.matches;
    if (reducedMotion) stopAnimation();
    else if (currentData?.mode === "hourglass") startAnimation();
  });
  if (canvas && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => drawHourglass(performance.now()));
    resizeObserver.observe(canvas);
  }

  return {
    update,
    destroy() {
      stopAnimation();
      stopDaylightTimer();
      resizeObserver?.disconnect();
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onDocumentKeydown);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };
}
