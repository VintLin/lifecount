import { NoiseDriftRenderer, type NoiseDriftStyle } from "@/utils/noise-drift";

type NoiseDriftWorkerMessage =
  | { type: "init"; canvas: OffscreenCanvas; width: number; height: number; devicePixelRatio: number; style: NoiseDriftStyle; reducedMotion: boolean; visible: boolean }
  | { type: "resize"; width: number; height: number; devicePixelRatio: number }
  | { type: "style"; style: NoiseDriftStyle }
  | { type: "motion"; reducedMotion: boolean }
  | { type: "visibility"; visible: boolean }
  | { type: "restart" }
  | { type: "destroy" };

type WorkerScope = typeof globalThis & {
  requestAnimationFrame?: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame?: (handle: number) => void;
};

const workerScope = self as WorkerScope;
let renderer: NoiseDriftRenderer | null = null;
let reducedMotion = false;
let visible = false;
let frameHandle: number | null = null;
let usingAnimationFrame = false;

const requestFrame = (callback: FrameRequestCallback): number => {
  if (workerScope.requestAnimationFrame) {
    usingAnimationFrame = true;
    return workerScope.requestAnimationFrame(callback);
  }
  usingAnimationFrame = false;
  return workerScope.setTimeout(() => callback(performance.now()), 16) as unknown as number;
};

const cancelFrame = (): void => {
  if (frameHandle === null) return;
  if (usingAnimationFrame && workerScope.cancelAnimationFrame) workerScope.cancelAnimationFrame(frameHandle);
  else workerScope.clearTimeout(frameHandle);
  frameHandle = null;
};

const drawFrame: FrameRequestCallback = (now) => {
  frameHandle = null;
  if (!renderer || !visible) return;
  renderer.drawFrame(now);
  if (!reducedMotion) frameHandle = requestFrame(drawFrame);
};

const syncAnimation = (): void => {
  cancelFrame();
  if (renderer && visible) drawFrame(performance.now());
};

self.addEventListener("message", (event: MessageEvent<NoiseDriftWorkerMessage>) => {
  const message = event.data;

  switch (message.type) {
    case "init": {
      const context = message.canvas.getContext("2d");
      if (!context) {
        self.postMessage({ type: "unavailable" });
        return;
      }
      renderer = new NoiseDriftRenderer(message.canvas, context);
      renderer.setStyle(message.style);
      renderer.resize(message.width, message.height, message.devicePixelRatio);
      reducedMotion = message.reducedMotion;
      visible = message.visible;
      syncAnimation();
      break;
    }
    case "resize":
      renderer?.resize(message.width, message.height, message.devicePixelRatio);
      syncAnimation();
      break;
    case "style":
      renderer?.setStyle(message.style);
      if (reducedMotion) syncAnimation();
      break;
    case "motion":
      reducedMotion = message.reducedMotion;
      syncAnimation();
      break;
    case "visibility":
      visible = message.visible;
      syncAnimation();
      break;
    case "restart":
      renderer?.restart();
      syncAnimation();
      break;
    case "destroy":
      cancelFrame();
      renderer = null;
      self.close();
      break;
  }
});
