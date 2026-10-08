import { token } from './util.js';

const GRAVITY = 520;

export function createPetals(canvas, { reduced }) {
  const COLORS = ['--tint-200', '--tint-100', '--accent-300', '--tint-200'].map(token);
  const BLAST_COLORS = ['--tint-200', '--accent-300', '--accent-500', '--tint-100', '--accent-700', '--accent-300'].map(token);
  const ctx = canvas.getContext('2d');
  const petals = [];
  let w = 0;
  let h = 0;
  let raf = 0;
  let last = 0;
  let running = false;

  const ambientCount = reduced ? 0 : window.innerWidth < 700 ? 14 : 22;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function make(burst, spread = 1) {
    const size = burst ? 7 + Math.random() * 9 : 5 + Math.random() * 7;
    return {
      burst,
      x: Math.random() * w,
      y: burst ? -20 - Math.random() * h * spread : Math.random() * h,
      size,
      vy: burst ? 55 + Math.random() * 70 : 14 + Math.random() * 22,
      vx: (Math.random() - 0.5) * 12,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 1.4,
      flip: Math.random() * Math.PI * 2,
      vf: 1 + Math.random() * 2,
      sway: Math.random() * Math.PI * 2,
      alpha: burst ? 0.55 + Math.random() * 0.3 : 0.18 + Math.random() * 0.2,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    };
  }

  // A particle thrown out from a point: fast at first, slowed by air, then pulled down.
  function makeBlast(x, y, angle, spread, power) {
    const a = angle + (Math.random() - 0.5) * spread;
    const speed = power * (0.45 + Math.random() * 0.75);
    const confetti = Math.random() < 0.55;
    return {
      kind: 'blast',
      confetti,
      x,
      y,
      size: confetti ? 4 + Math.random() * 4 : 6 + Math.random() * 8,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 10,
      flip: Math.random() * Math.PI * 2,
      vf: 4 + Math.random() * 8,
      sway: Math.random() * Math.PI * 2,
      alpha: 0.75 + Math.random() * 0.25,
      color: BLAST_COLORS[(Math.random() * BLAST_COLORS.length) | 0],
    };
  }

  function drawPetal(p) {
    const s = p.size;
    if (p.confetti) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.flip));
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-s * 0.35, -s, s * 0.7, s * 2);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, 0.35 + Math.abs(Math.cos(p.flip)) * 0.65);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.9, -s * 0.55, s * 0.6, s * 0.7, 0, s);
    ctx.bezierCurveTo(-s * 0.6, s * 0.7, -s * 0.9, -s * 0.55, 0, -s);
    ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, w, h);
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      if (p.kind === 'blast') {
        const drag = Math.pow(0.22, dt);
        p.vx *= drag;
        p.vy = p.vy * drag + GRAVITY * dt * 0.35;
        // Once falling, drift down gently like paper.
        if (p.vy > 70) p.vy = 70 + (p.vy - 70) * Math.pow(0.05, dt);
        p.sway += dt * 2;
        p.flip += dt * p.vf;
        p.rot += dt * p.vr;
        p.x += (p.vx + (p.vy > 40 ? Math.sin(p.sway) * 26 : 0)) * dt;
        p.y += p.vy * dt;
        if (p.y > h + 30 || p.x < -60 || p.x > w + 60) {
          petals.splice(i, 1);
          continue;
        }
        drawPetal(p);
        continue;
      }
      p.sway += dt * 0.9;
      p.flip += dt * p.vf;
      p.rot += dt * p.vr;
      p.y += p.vy * dt;
      p.x += (p.vx + Math.sin(p.sway) * 18) * dt;
      if (p.y > h + 30) {
        if (p.burst) petals.splice(i, 1);
        else Object.assign(p, make(false), { y: -20 });
        continue;
      }
      drawPetal(p);
    }
    if (petals.length) raf = requestAnimationFrame(frame);
    else {
      running = false;
      ctx.clearRect(0, 0, w, h);
    }
  }

  function start() {
    if (running || document.hidden || !petals.length) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(raf);
    running = false;
  }

  resize();
  for (let i = 0; i < ambientCount; i++) petals.push(make(false));
  start();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  return {
    // Explode particles from a viewport point. angle in radians (−π/2 is straight up).
    burst({ x, y, count = 80, angle = -Math.PI / 2, spread = Math.PI * 0.9, power = 900 }) {
      const n = reduced ? Math.min(12, count) : count;
      const scale = Math.min(1.2, Math.max(0.65, w / 900));
      for (let i = 0; i < n; i++) petals.push(makeBlast(x, y, angle, spread, power * scale));
      start();
    },
    shower(count = 70) {
      const n = reduced ? Math.min(14, count) : count;
      for (let i = 0; i < n; i++) petals.push(make(true, reduced ? 0.3 : 1.1));
      start();
    },
  };
}
