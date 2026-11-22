// Motlab 9:16 (1080x1920) Library
const q = new URLSearchParams(location.search);
const S = parseFloat(q.get('scale') || '1');
const W = 1080, H = 1920;

const cv = document.getElementById('c');
cv.width = W * S;
cv.height = H * S;
const ctx = cv.getContext('2d');

const BG_DARK = '#090d16';
const AMBER = '#f59e0b';
const WHITE = '#f8fafc';
const MUTED = '#94a3b8';
const FONT = '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOutCubic = x => 1 - Math.pow(1 - clamp(x), 3);
const easeInOutCubic = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const prog = (t, a, b) => clamp((t - a) / (b - a));

function scene(total, draw) {
  window.TOTAL = total;
  window.renderAt = t => {
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.globalAlpha = 1;
    draw(t);
  };
  window.ready = document.fonts.ready.then(() => {
    window.renderAt(parseFloat(q.get('t') || '0'));
  });
}
