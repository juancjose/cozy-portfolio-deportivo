(() => {
  const d = document, root = d.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.getElementById('y').textContent = new Date().getFullYear();

  // nav
  const nav = d.querySelector('.nav'), tog = d.querySelector('.nav__toggle'), menu = d.getElementById('menu');
  const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const setMenu = open => { tog.setAttribute('aria-expanded', open); menu.classList.toggle('is-open', open); d.body.style.overflow = open ? 'hidden' : ''; };
  tog.addEventListener('click', () => setMenu(tog.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // hero slides
  const slides = [...d.querySelectorAll('.hero__slides img')];
  if (!reduce && slides.length > 1) {
    let i = 0;
    setInterval(() => { slides[i].classList.remove('is-on'); i = (i + 1) % slides.length; slides[i].classList.add('is-on'); }, 6000);
  }

  // reveal
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  d.querySelectorAll('.reveal').forEach((el, n) => { el.style.transitionDelay = (n % 5) * 70 + 'ms'; io.observe(el); });

  // scoreboard counters
  const fmt = n => n.toLocaleString('es-AR');
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.to;
    if (reduce) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 2000;
    const step = t => { const p = Math.min((t - t0) / dur, 1), v = Math.round(to * (1 - Math.pow(1 - p, 4))); el.textContent = fmt(v); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  d.querySelectorAll('.count').forEach(el => { el.textContent = fmt(+el.dataset.to); cio.observe(el); });
  // set start state 0 only when JS animates
  if (!reduce) d.querySelectorAll('.count').forEach(el => el.textContent = '0');

  // lineup
  const roster = [...d.querySelectorAll('#roster li')].map(li => ({ ...li.dataset, desc: li.textContent }));
  const card = d.querySelector('.card'), cImg = d.getElementById('card-img');
  const players = [...d.querySelectorAll('.player')];
  players.forEach(b => {
    const p = roster[+b.dataset.i];
    b.setAttribute('aria-label', `${p.name}, ${p.pos} (${p.role}). Ver ficha`);
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => show(+b.dataset.i, b));
  });
  function show(i, btn) {
    const p = roster[i];
    players.forEach(x => { x.classList.toggle('is-active', x === btn); x.setAttribute('aria-pressed', x === btn); });
    card.classList.add('is-swapping');
    setTimeout(() => {
      cImg.src = `assets/FOTOS-TEAM-COZY_${p.img}.webp`; cImg.alt = `Foto de ${p.name}`;
      d.getElementById('card-pos').textContent = p.pos;
      d.getElementById('card-name').textContent = p.name;
      d.getElementById('card-role').textContent = p.role;
      d.getElementById('card-desc').textContent = p.desc;
      card.classList.remove('is-swapping');
    }, reduce ? 0 : 220);
  }
  show(0, players.find(b => b.dataset.i === '0'));

  // athletes rail
  const rail = d.getElementById('rail');
  const items = [...rail.children];
  items.forEach(li => li.tabIndex = 0);
  let period = 0, pos = 0, last = 0, hold = 0, hover = false, focus = false, visible = true;
  const SPEED = 45; // px por segundo
  if (!reduce) {
    rail.classList.add('is-auto');
    items.forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.removeAttribute('tabindex'); c.querySelector('img').alt = ''; rail.appendChild(c); });
    const measure = () => { period = rail.children[items.length].offsetLeft - items[0].offsetLeft; };
    measure(); addEventListener('resize', measure);
    addEventListener('load', measure);
    const wrap = () => { if (period) { if (rail.scrollLeft >= period + rail.clientWidth) rail.scrollLeft -= period; else if (rail.scrollLeft <= 0) rail.scrollLeft += period; } };
    rail.addEventListener('mouseenter', () => hover = true);
    rail.addEventListener('mouseleave', () => hover = false);
    rail.addEventListener('focusin', () => focus = true);
    rail.addEventListener('focusout', () => focus = false);
    const pauseFor = ms => hold = performance.now() + ms;
    rail.addEventListener('pointerdown', () => pauseFor(4000));
    rail.addEventListener('touchstart', () => pauseFor(4000), { passive: true });
    rail.addEventListener('wheel', () => pauseFor(2500), { passive: true });
    rail.addEventListener('scroll', () => { if (performance.now() < hold) wrap(); }, { passive: true });
    new IntersectionObserver(es => visible = es[0].isIntersecting).observe(rail);
    const tick = t => {
      const dt = last ? Math.min(t - last, 64) / 1000 : 0; last = t;
      const paused = hover || focus || !visible || t < hold || d.hidden;
      if (paused) pos = rail.scrollLeft;
      else if (period) { pos += SPEED * dt; if (pos >= period) pos -= period; rail.scrollLeft = pos; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    d.querySelectorAll('.rail-btn').forEach(b => b.addEventListener('click', () => {
      pauseFor(1200);
      const step = +b.dataset.dir * rail.clientWidth * .8;
      if (step < 0 && rail.scrollLeft + step < 0) rail.scrollLeft += period;
      if (step > 0 && rail.scrollLeft + step >= period) rail.scrollLeft -= period;
      rail.scrollBy({ left: step, behavior: 'smooth' });
    }));
  } else {
    d.querySelectorAll('.rail-btn').forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: +b.dataset.dir * rail.clientWidth * .8 })));
  }
})();

// cinematic video (self-hosted, se reproduce dentro de la página)
(() => {
  const d = document, sec = d.getElementById('video');
  if (!sec) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v = d.getElementById('cine-video'), lv = d.getElementById('lightbox-video');
  const bPlay = sec.querySelector('.cine__play'), bSound = sec.querySelector('.cine__sound'), bBig = sec.querySelector('.cine__big');
  const box = d.getElementById('lightbox');
  let loaded = false, inView = false, lbOpen = false, opener = null;
  const addSources = el => {
    if (el.querySelector('source')) return;
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([k, type]) => { const s = d.createElement('source'); s.src = v.dataset[k]; s.type = type; el.appendChild(s); });
    el.load();
  };
  const tryPlay = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  v.addEventListener('playing', () => { sec.classList.add('is-playing'); bSound.hidden = false; });

  if (!reduce) {
    new IntersectionObserver(es => {
      inView = es[0].isIntersecting;
      if (inView && !loaded) { loaded = true; addSources(v); }
      if (!loaded || lbOpen) return;
      inView ? tryPlay() : v.pause();
    }, { rootMargin: '300px 0px' }).observe(sec);
  } else {
    bPlay.hidden = false; // sin autoplay: póster + botón que abre el reproductor
    bPlay.addEventListener('click', () => openBox(bPlay));
  }

  bSound.addEventListener('click', () => {
    v.muted = !v.muted;
    if (!v.muted) { v.volume = 1; tryPlay(); }
    bSound.setAttribute('aria-pressed', String(!v.muted));
    bSound.querySelector('.cine__sound-txt').textContent = v.muted ? 'Activar sonido' : 'Silenciar';
  });

  function openBox(from) {
    opener = from; lbOpen = true;
    v.pause();
    addSources(lv);
    try { lv.currentTime = reduce ? 0 : v.currentTime || 0; } catch {}
    box.showModal();
    box.querySelector('.lightbox__x').focus();
    lv.muted = false;
    const p = lv.play(); if (p && p.catch) p.catch(() => {});
  }
  const closeBox = () => { if (box.open) box.close(); };
  box.addEventListener('close', () => {
    lbOpen = false; lv.pause();
    if (loaded && inView) tryPlay();
    opener && opener.focus();
  });
  bBig.addEventListener('click', () => openBox(bBig));
  box.querySelector('.lightbox__x').addEventListener('click', closeBox);
  box.addEventListener('click', e => { if (e.target === box) closeBox(); });
})();
