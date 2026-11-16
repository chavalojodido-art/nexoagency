/* ===== Configuración =====
   Número de WhatsApp Business de Nexo Agency, solo dígitos con código de país (ej. '50588887777').
   Si está vacío, los botones llevan al formulario y el formulario abre el correo. */
const WHATSAPP_NUMBER = '';
const EMAIL = 'hola@nexoagency.io';

document.documentElement.classList.add('js');
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
let lang = 'es';

/* ---- i18n (ES por defecto, EN con data-en) ---- */
const META = {
  es: { title: document.title, desc: $('meta[name=description]').content, toggle: 'EN', toggleLabel: 'Switch to English', menu: 'Abrir menú' },
  en: { title: 'Nexo Agency · Apps, websites and WhatsApp ordering for your business',
        desc: 'Nexo Agency builds WhatsApp ordering apps, catalogs, 24/7 appointment booking and professional websites for businesses in Latin America and worldwide. See a demo of your own business before you pay.',
        toggle: 'ES', toggleLabel: 'Cambiar a español', menu: 'Open menu' }
};
const MARQUEE_EN = { 'Restaurantes':'Restaurants','Cafeterías':'Cafés','Clínicas':'Clinics','Tiendas':'Stores','Hoteles y lodges':'Hotels & lodges','Salones de belleza':'Beauty salons','Talleres':'Workshops','Consultorios':'Practices' };
$$('.marquee__track span').forEach(s => s.dataset.en = MARQUEE_EN[s.textContent] || s.textContent);
$$('[data-en]').forEach(el => el.dataset.es = el.innerHTML);
function setLang(l) {
  lang = l;
  document.documentElement.lang = l;
  $$('[data-en]').forEach(el => el.innerHTML = el.dataset[l]);
  document.title = META[l].title;
  $('meta[name=description]').content = META[l].desc;
  const b = $('#lang'); b.textContent = META[l].toggle; b.setAttribute('aria-label', META[l].toggleLabel);
  try { localStorage.setItem('nexo_lang', l); } catch (e) {}
  updateWa(); calc();
}
$('#lang').addEventListener('click', () => setLang(lang === 'es' ? 'en' : 'es'));

/* ---- WhatsApp ---- */
const waUrl = txt => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(txt)}`;
const greet = () => lang === 'es'
  ? '¡Hola Nexo Agency! Quiero una demo gratis para mi negocio.'
  : 'Hi Nexo Agency! I would like a free demo for my business.';
function updateWa() {
  if (!WHATSAPP_NUMBER) { $('#formHint').textContent = lang === 'es' ? 'Se abre tu correo con el mensaje listo. No se envía nada hasta que tú lo mandes.' : 'It opens your email with the message ready. Nothing is sent until you hit send.'; return; }
  $$('.js-wa').forEach(a => { a.href = waUrl(greet()); a.target = '_blank'; a.rel = 'noopener'; });
}

/* ---- Formulario ---- */
$('#leadForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target; let ok = true;
  $$('input[required]', f).forEach(i => { const bad = !i.value.trim(); i.setAttribute('aria-invalid', bad); if (bad && ok) { i.focus(); ok = false; } });
  if (!ok) return;
  const d = Object.fromEntries(new FormData(f));
  const msg = lang === 'es'
    ? `¡Hola Nexo Agency! 👋\nSoy ${d.nombre}, de ${d.negocio}.\nMe interesa: ${d.necesidad}.\nQuiero ver una demo gratis de mi negocio.`
    : `Hi Nexo Agency! 👋\nI'm ${d.nombre}, from ${d.negocio}.\nI'm interested in: ${d.necesidad}.\nI'd like to see a free demo of my business.`;
  if (WHATSAPP_NUMBER) window.open(waUrl(msg), '_blank', 'noopener');
  else location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Demo gratis · ' + d.negocio)}&body=${encodeURIComponent(msg)}`;
});

/* ---- Calculadora ---- */
function calc() {
  const v = Math.max(0, +$('#ventas').value || 0), p = +$('#pct').value;
  $('#pctOut').textContent = p + '%';
  $('#anual').textContent = Math.round(v * p / 100 * 12).toLocaleString(lang === 'es' ? 'es' : 'en-US');
}
['input', 'change'].forEach(ev => { $('#ventas').addEventListener(ev, calc); $('#pct').addEventListener(ev, calc); });

/* ---- Nav ---- */
const nav = $('#nav'), fab = $('.fab');
const onScroll = () => { const y = scrollY; nav.classList.toggle('is-solid', y > 40); fab.classList.toggle('is-on', y > innerHeight * .8); };
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const burger = $('#burger'), mnav = $('#mnav');
burger.addEventListener('click', () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); mnav.hidden = !o; nav.classList.add('is-solid'); });
$$('a', mnav).forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', false); mnav.hidden = true; }));

/* ---- Reveal ---- */
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' }) : null;
$$('.reveal').forEach((el, i) => { if (io) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); } else el.classList.add('in'); });
requestAnimationFrame(() => $$('.hero .reveal').forEach(el => el.classList.add('in')));

/* ---- Video del hero ---- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection && navigator.connection.saveData;
const v = $('#heroVideo');
if (!reduce && !saveData) {
  const mobile = matchMedia('(max-width: 640px)').matches;
  v.poster = mobile ? 'assets/media/hero-poster-movil.jpg' : 'assets/media/hero-poster.jpg';
  v.src = mobile ? 'assets/media/hero-movil.mp4' : 'assets/media/hero-1080.mp4';
  v.addEventListener('playing', () => v.classList.add('is-on'), { once: true });
  v.addEventListener('error', canvasFallback, { once: true });
  v.play().catch(() => {});
}

/* Fallback: red de nodos en canvas si el video falla */
function canvasFallback() {
  const c = $('#heroCanvas'), x = c.getContext('2d'); c.style.display = 'block';
  let W, H, pts; const dpr = Math.min(devicePixelRatio || 1, 2);
  const size = () => { W = c.width = c.offsetWidth * dpr; H = c.height = c.offsetHeight * dpr; pts = Array.from({ length: Math.round(W * H / 26000 / dpr) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3 * dpr, vy: (Math.random() - .5) * .3 * dpr })); };
  size(); addEventListener('resize', size);
  (function tick() {
    x.clearRect(0, 0, W, H); const L = 140 * dpr;
    for (const p of pts) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < L) { x.strokeStyle = `rgba(182,255,59,${(1 - d / L) * .5})`; x.lineWidth = dpr; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); } }
    x.fillStyle = '#B6FF3B'; for (const p of pts) { x.beginPath(); x.arc(p.x, p.y, 2.2 * dpr, 0, 7); x.fill(); }
    requestAnimationFrame(tick);
  })();
}

$('#yr').textContent = new Date().getFullYear();
let saved = 'es'; try { saved = new URLSearchParams(location.search).get('lang') || localStorage.getItem('nexo_lang') || 'es'; } catch (e) {}
if (saved === 'en') setLang('en'); else { updateWa(); calc(); }
