// Página 404: partículas de luz subindo pela cena e parallax leve com o ponteiro.
(() => {
  const canvas = document.querySelector('[data-particles]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!canvas || reduce.matches) return;
  const ctx = canvas.getContext('2d');
  const layers = [...document.querySelectorAll('[data-depth]')];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let particles = [];
  let raf = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let paused = false;
  const scene = document.querySelector('.lost');
  const pauseBtn = document.querySelector('[data-pause-scene]');
  pauseBtn?.addEventListener('click', () => {
    paused = !paused;
    scene.toggleAttribute('data-paused', paused);
    pauseBtn.textContent = paused ? 'Retomar animação' : 'Pausar animação';
    pauseBtn.setAttribute('aria-pressed', String(paused));
    if (paused) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });

  const spawn = (anywhere) => {
    const warm = Math.random() < 0.18;
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 2.2,
      vy: 6 + Math.random() * 16,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.3 + Math.random() * 0.6,
      twinkle: Math.random() * Math.PI * 2,
      depth: 0.3 + Math.random() * 0.7,
      color: warm ? '255, 214, 150' : '200, 225, 255',
    };
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(110, (w * h) / 14000));
    particles = Array.from({ length: count }, () => spawn(true));
  };

  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      p.y -= p.vy * dt;
      p.sway += p.swaySpeed * dt;
      p.twinkle += dt * 1.6;
      if (p.y < -12) Object.assign(p, spawn(false));
      const x = p.x + Math.sin(p.sway) * 14 + pointer.x * 18 * p.depth;
      const y = p.y + pointer.y * 10 * p.depth;
      const alpha = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(p.twinkle))) * p.depth;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, p.r * 5);
      glow.addColorStop(0, `rgba(${p.color}, ${alpha})`);
      glow.addColorStop(1, `rgba(${p.color}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, p.r * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const el of layers) {
      const d = Number(el.dataset.depth);
      el.style.translate = `${pointer.x * d}px ${pointer.y * d}px`;
    }
    raf = requestAnimationFrame(frame);
  };

  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf && !paused) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });
  new ResizeObserver(resize).observe(canvas);
  resize();
  raf = requestAnimationFrame(frame);
})();
