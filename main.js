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
  d.querySelectorAll('.rail-btn').forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: +b.dataset.dir * rail.clientWidth * .8, behavior: reduce ? 'auto' : 'smooth' })));
  rail.querySelectorAll('.ath').forEach(li => li.tabIndex = 0);
})();
