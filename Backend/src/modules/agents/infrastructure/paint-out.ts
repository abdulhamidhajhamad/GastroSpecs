/** A rectangle in pixels, end-exclusive. */
export type PixelRect = { left: number; top: number; right: number; bottom: number };

/**
 * Paints rectangles of an RGB image over with what surrounds them, so a supplier's logo disappears into the
 * machine. Each rectangle is filled along rows or along columns, whichever pair of opposite edges matches
 * better: that follows the way light falls on steel (a round drum shades left to right, a flat panel top to
 * bottom). `data` is raw RGB, 3 bytes per pixel, changed in place.
 */
export function paintOut(data: Buffer, width: number, height: number, rects: PixelRect[]): void {
  for (const rect of rects) {
    const r = {
      left: Math.max(0, Math.floor(rect.left)),
      top: Math.max(0, Math.floor(rect.top)),
      right: Math.min(width, Math.ceil(rect.right)),
      bottom: Math.min(height, Math.ceil(rect.bottom)),
    };
    if (r.right <= r.left || r.bottom <= r.top) continue;
    if (edgeGap(data, width, r, "rows") <= edgeGap(data, width, r, "columns")) fillRows(data, width, r);
    else fillColumns(data, width, height, r);
  }
}

const at = (width: number, x: number, y: number) => (y * width + x) * 3;

/** Average colour difference between the two opposite edges just outside the rectangle. */
function edgeGap(data: Buffer, width: number, r: PixelRect, along: "rows" | "columns"): number {
  let sum = 0;
  let count = 0;
  if (along === "rows") {
    if (r.left === 0 || r.right === width) return Infinity;
    for (let y = r.top; y < r.bottom; y++) sum += diff(data, at(width, r.left - 1, y), at(width, r.right, y)), count++;
  } else {
    const height = data.length / 3 / width;
    if (r.top === 0 || r.bottom === height) return Infinity;
    for (let x = r.left; x < r.right; x++) sum += diff(data, at(width, x, r.top - 1), at(width, x, r.bottom)), count++;
  }
  return count ? sum / count : Infinity;
}

const diff = (data: Buffer, a: number, b: number) => Math.abs(data[a] - data[b]) + Math.abs(data[a + 1] - data[b + 1]) + Math.abs(data[a + 2] - data[b + 2]);

/** Mean of up to 3 pixels starting at `from`, `step` bytes apart; `steps` = pixels available that way. */
function edgeColour(data: Buffer, from: number, step: number, steps: number): number[] | null {
  const out = [0, 0, 0];
  let n = 0;
  for (let i = 0, p = from; i < Math.min(3, steps); i++, p += step) {
    out[0] += data[p];
    out[1] += data[p + 1];
    out[2] += data[p + 2];
    n++;
  }
  return n ? out.map((v) => v / n) : null;
}

/** Blends linearly from colour `a` to colour `b` over `length` pixels starting at byte `start`, `step` bytes apart. */
function blend(data: Buffer, start: number, step: number, length: number, a: number[] | null, b: number[] | null) {
  for (let k = 0; k < length; k++) {
    const t = (k + 1) / (length + 1);
    const c = a && b ? a.map((v, j) => v * (1 - t) + b[j] * t) : (a ?? b ?? [255, 255, 255]);
    const p = start + k * step;
    data[p] = c[0];
    data[p + 1] = c[1];
    data[p + 2] = c[2];
  }
}

function fillRows(data: Buffer, width: number, r: PixelRect) {
  for (let y = r.top; y < r.bottom; y++) {
    const left = edgeColour(data, at(width, r.left - 1, y), -3, r.left);
    const right = edgeColour(data, at(width, r.right, y), 3, width - r.right);
    blend(data, at(width, r.left, y), 3, r.right - r.left, left, right);
  }
}

function fillColumns(data: Buffer, width: number, height: number, r: PixelRect) {
  const row = width * 3;
  for (let x = r.left; x < r.right; x++) {
    const above = edgeColour(data, at(width, x, r.top - 1), -row, r.top);
    const below = edgeColour(data, at(width, x, r.bottom), row, height - r.bottom);
    blend(data, at(width, x, r.top), row, r.bottom - r.top, above, below);
  }
}
