export interface NoiseDriftStyle {
  color: [number, number, number];
  alpha: number;
}

type NoiseSurface = HTMLCanvasElement | OffscreenCanvas;
type NoiseContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type NoiseFunction = (x: number, y: number, z: number) => number;

interface NoisePoint {
  x: number;
  y: number;
  opacity: number;
}

const SCALE = 200;
const LENGTH = 10;
const STROKE_LENGTH = 2.2;
const SPACING = 15;
const TWO_PI = Math.PI * 2;

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createNoise(seed: number): NoiseFunction {
  const random = createRandom(seed);
  const permutation = new Uint8Array(512);
  const values = new Uint8Array(256);

  for (let index = 0; index < 256; index += 1) values[index] = index;
  for (let index = 255; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = values[index];
    values[index] = values[swapIndex];
    values[swapIndex] = current;
  }
  for (let index = 0; index < 512; index += 1) permutation[index] = values[index & 255];

  const fade = (value: number): number => value * value * value * (value * (value * 6 - 15) + 10);
  const lerp = (start: number, end: number, amount: number): number =>
    start + (end - start) * amount;
  const grad = (hash: number, x: number, y: number, z: number): number => {
    const maskedHash = hash & 15;
    const first = maskedHash < 8 ? x : y;
    const second = maskedHash < 4 ? y : maskedHash === 12 || maskedHash === 14 ? x : z;
    return ((maskedHash & 1) === 0 ? first : -first) +
      ((maskedHash & 2) === 0 ? second : -second);
  };

  return (x: number, y: number, z: number): number => {
    const floorX = Math.floor(x);
    const floorY = Math.floor(y);
    const floorZ = Math.floor(z);
    const gridX = floorX & 255;
    const gridY = floorY & 255;
    const gridZ = floorZ & 255;
    const offsetX = x - floorX;
    const offsetY = y - floorY;
    const offsetZ = z - floorZ;
    const fadeX = fade(offsetX);
    const fadeY = fade(offsetY);
    const fadeZ = fade(offsetZ);
    const a = permutation[gridX] + gridY;
    const aa = permutation[a] + gridZ;
    const ab = permutation[a + 1] + gridZ;
    const b = permutation[gridX + 1] + gridY;
    const ba = permutation[b] + gridZ;
    const bb = permutation[b + 1] + gridZ;
    const result = lerp(
      lerp(
        lerp(grad(permutation[aa], offsetX, offsetY, offsetZ), grad(permutation[ba], offsetX - 1, offsetY, offsetZ), fadeX),
        lerp(grad(permutation[ab], offsetX, offsetY - 1, offsetZ), grad(permutation[bb], offsetX - 1, offsetY - 1, offsetZ), fadeX),
        fadeY
      ),
      lerp(
        lerp(grad(permutation[aa + 1], offsetX, offsetY, offsetZ - 1), grad(permutation[ba + 1], offsetX - 1, offsetY, offsetZ - 1), fadeX),
        lerp(grad(permutation[ab + 1], offsetX, offsetY - 1, offsetZ - 1), grad(permutation[bb + 1], offsetX - 1, offsetY - 1, offsetZ - 1), fadeX),
        fadeY
      ),
      fadeZ
    );
    return (result + 1) / 2;
  };
}

export class NoiseDriftRenderer {
  private width = 0;
  private height = 0;
  private points: NoisePoint[] = [];
  private noise = createNoise(Date.now());
  private style: NoiseDriftStyle = { color: [24, 24, 27], alpha: 0.22 };

  constructor(private readonly surface: NoiseSurface, private readonly context: NoiseContext) {}

  setStyle(style: NoiseDriftStyle): void {
    this.style = style;
  }

  restart(seed = Date.now()): void {
    this.noise = createNoise(seed);
  }

  resize(width: number, height: number, devicePixelRatio: number): void {
    this.width = width;
    this.height = height;
    this.surface.width = Math.round(width * devicePixelRatio);
    this.surface.height = Math.round(height * devicePixelRatio);
    this.context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    this.points = [];

    for (let x = -SPACING / 2; x < width + SPACING; x += SPACING) {
      for (let y = -SPACING / 2; y < height + SPACING; y += SPACING) {
        this.points.push({ x, y, opacity: Math.random() * 0.5 + 0.5 });
      }
    }
  }

  drawFrame(now: number): void {
    this.context.clearRect(0, 0, this.width, this.height);
    const time = now / 10000;
    const [red, green, blue] = this.style.color;

    for (const point of this.points) {
      const angle = this.getForceOnPoint(point.x, point.y, time);
      const length = (this.noise(point.x / SCALE, point.y / SCALE, time * 2) + 0.5) * LENGTH;
      const nextX = point.x + Math.cos(angle) * length;
      const nextY = point.y + Math.sin(angle) * length;
      const deltaX = Math.cos(angle) * STROKE_LENGTH * 0.5;
      const deltaY = Math.sin(angle) * STROKE_LENGTH * 0.5;
      const alpha = (Math.abs(Math.cos(angle)) * 0.5 + 0.5) * point.opacity * this.style.alpha;

      this.context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      this.context.lineWidth = 0.9;
      this.context.beginPath();
      this.context.moveTo(nextX - deltaX, nextY - deltaY);
      this.context.lineTo(nextX + deltaX, nextY + deltaY);
      this.context.stroke();
    }
  }

  private getForceOnPoint(x: number, y: number, time: number): number {
    return (this.noise(x / SCALE, y / SCALE, time) - 0.5) * 2 * TWO_PI;
  }
}
