/**
 * Graphing engine: draw axes, grid, and Y = f(x) plots.
 */

const Graph = (function () {
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];
  const GRID_COLOR = 'rgba(255,255,255,0.08)';
  const AXIS_COLOR = 'rgba(255,255,255,0.35)';
  const BG = '#0a0a0c';

  let canvas;
  let ctx;
  let width = 320;
  let height = 180;
  let xMin = -10;
  let xMax = 10;
  let yMin = -10;
  let yMax = 10;

  function xToPx(x) {
    return ((x - xMin) / (xMax - xMin)) * width;
  }

  function yToPx(y) {
    return height - ((y - yMin) / (yMax - yMin)) * height;
  }

  function pxToX(px) {
    return xMin + (px / width) * (xMax - xMin);
  }

  function drawGrid() {
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    const xStep = getStep(xMin, xMax);
    const yStep = getStep(yMin, yMax);
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      if (Math.abs(x) < 1e-10) continue;
      ctx.beginPath();
      ctx.moveTo(xToPx(x), 0);
      ctx.lineTo(xToPx(x), height);
      ctx.stroke();
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      if (Math.abs(y) < 1e-10) continue;
      ctx.beginPath();
      ctx.moveTo(0, yToPx(y));
      ctx.lineTo(width, yToPx(y));
      ctx.stroke();
    }
  }

  function drawAxes() {
    ctx.strokeStyle = AXIS_COLOR;
    ctx.lineWidth = 1.5;
    const zeroX = xToPx(0);
    const zeroY = yToPx(0);
    if (zeroX >= 0 && zeroX <= width) {
      ctx.beginPath();
      ctx.moveTo(zeroX, 0);
      ctx.lineTo(zeroX, height);
      ctx.stroke();
    }
    if (zeroY >= 0 && zeroY <= height) {
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(width, zeroY);
      ctx.stroke();
    }
  }

  function getStep(min, max) {
    const range = max - min;
    const raw = range / 8;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    if (norm <= 1) return mag;
    if (norm <= 2) return 2 * mag;
    if (norm <= 5) return 5 * mag;
    return 10 * mag;
  }

  function sample(fn, options = {}) {
    const pts = [];
    const step = (xMax - xMin) / (width * 2);
    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = fn(x);
        if (Number.isFinite(y) && y >= yMin - 1 && y <= yMax + 1) {
          pts.push({ x, y });
        }
      } catch (_) {}
    }
    return pts;
  }

  function drawEquation(fn, color, options) {
    const pts = sample(fn, options);
    if (pts.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (const p of pts) {
      const px = xToPx(p.x);
      const py = yToPx(p.y);
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  }

  function render(equations, options = {}) {
    if (!ctx) return;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, width, height);
    drawGrid();
    drawAxes();
    (equations || []).forEach((expr, i) => {
      if (!expr || !expr.trim()) return;
      const fn = Parser.parse(expr, { angleMode: options.angleMode || 'rad' });
      if (fn) drawEquation(fn, COLORS[i % COLORS.length], options);
    });
  }

  function init(canvasEl) {
    canvas = canvasEl;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
  }

  function setWindow(w) {
    if (w.xMin != null) xMin = Number(w.xMin);
    if (w.xMax != null) xMax = Number(w.xMax);
    if (w.yMin != null) yMin = Number(w.yMin);
    if (w.yMax != null) yMax = Number(w.yMax);
  }

  function getWindow() {
    return { xMin, xMax, yMin, yMax };
  }

  return {
    init,
    render,
    setWindow,
    getWindow,
    sample: (fn, opts) => sample(fn, opts),
  };
})();
