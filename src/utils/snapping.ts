
// compute snapping to other element edges/centers and stage centers
export type Guide = { x1: number; y1: number; x2: number; y2: number };

export function computeSnap(x: number, y: number, w = 0, h = 0, candidates: Array<{ x: number; y: number; width?: number; height?: number }>, threshold = 6) {
  let nx = x;
  let ny = y;
  const guides: Guide[] = [];

  const targetLeft = x;
  const targetRight = x + w;
  const targetCenterX = x + w / 2;
  const targetTop = y;
  const targetBottom = y + h;
  const targetCenterY = y + h / 2;

  for (const c of candidates) {
    const left = c.x;
    const right = c.x + (c.width ?? 0);
    const centerX = c.x + ((c.width ?? 0) / 2);
    const top = c.y;
    const bottom = c.y + (c.height ?? 0);
    const centerY = c.y + ((c.height ?? 0) / 2);

    // X alignments
    if (Math.abs(targetLeft - left) <= threshold) {
      nx = left;
      guides.push({ x1: left, y1: 0, x2: left, y2: 10000 });
    } else if (Math.abs(targetLeft - right) <= threshold) {
      nx = right;
      guides.push({ x1: right, y1: 0, x2: right, y2: 10000 });
    } else if (Math.abs(targetCenterX - centerX) <= threshold) {
      nx = centerX - w / 2;
      guides.push({ x1: centerX, y1: 0, x2: centerX, y2: 10000 });
    } else if (Math.abs(targetRight - right) <= threshold) {
      nx = right - w;
      guides.push({ x1: right, y1: 0, x2: right, y2: 10000 });
    } else if (Math.abs(targetRight - left) <= threshold) {
      nx = left - w;
      guides.push({ x1: left, y1: 0, x2: left, y2: 10000 });
    }

    // Y alignments
    if (Math.abs(targetTop - top) <= threshold) {
      ny = top;
      guides.push({ x1: 0, y1: top, x2: 10000, y2: top });
    } else if (Math.abs(targetTop - bottom) <= threshold) {
      ny = bottom;
      guides.push({ x1: 0, y1: bottom, x2: 10000, y2: bottom });
    } else if (Math.abs(targetCenterY - centerY) <= threshold) {
      ny = centerY - h / 2;
      guides.push({ x1: 0, y1: centerY, x2: 10000, y2: centerY });
    } else if (Math.abs(targetBottom - bottom) <= threshold) {
      ny = bottom - h;
      guides.push({ x1: 0, y1: bottom, x2: 10000, y2: bottom });
    } else if (Math.abs(targetBottom - top) <= threshold) {
      ny = top - h;
      guides.push({ x1: 0, y1: top, x2: 10000, y2: top });
    }
  }

  return { x: nx, y: ny, guides };
}
