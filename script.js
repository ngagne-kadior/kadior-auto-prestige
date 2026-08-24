const VEHICLES = [
  { brand:'Mercedes-AMG', model:'GT Coupé', year:2023, km:'8 500 km', trans:'Automatique', price:'145 000 000 XOF', type:'coupe', typeLabel:'Coupé', badge:'Neuf', img:'https://images.unsplash.com/photo-1553440569-bcc63803a83d' },
  { brand:'BMW', model:'M4 Competition', year:2023, km:'6 200 km', trans:'Automatique', price:'98 000 000 XOF', type:'coupe', typeLabel:'Coupé', badge:'Occasion certifiée', img:'https://images.unsplash.com/photo-1580273916550-e323be2ae537' },
  { brand:'Porsche', model:'Panamera Turbo', year:2022, km:'15 400 km', trans:'PDK', price:'120 000 000 XOF', type:'berline', typeLabel:'Berline', badge:'Occasion certifiée', img:'https://images.unsplash.com/photo-1503376780353-7e6692767b70' },
  { brand:'Audi', model:'RS7 Sportback', year:2023, km:'4 100 km', trans:'Automatique', price:'110 000 000 XOF', type:'berline', typeLabel:'Berline', badge:'Neuf', img:'https://images.unsplash.com/photo-1616422285623-13ff0162193c' },
  { brand:'Ferrari', model:'458 Italia', year:2021, km:'9 800 km', trans:'Automatique', price:'210 000 000 XOF', type:'supercar', typeLabel:'Supercar', badge:'Édition limitée', img:'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d' },
  { brand:'Lamborghini', model:'Huracán EVO', year:2022, km:'5 600 km', trans:'Automatique', price:'245 000 000 XOF', type:'supercar', typeLabel:'Supercar', badge:'Neuf', img:'https://images.unsplash.com/photo-1511919884226-fd3cad34687c' },
  { brand:'McLaren', model:'720S', year:2023, km:'3 200 km', trans:'Automatique', price:'260 000 000 XOF', type:'supercar', typeLabel:'Supercar', badge:'Neuf', img:'https://images.unsplash.com/photo-1542362567-b07e54358753' },
  { brand:'Lamborghini', model:'Aventador S', year:2021, km:'11 000 km', trans:'Automatique', price:'275 000 000 XOF', type:'supercar', typeLabel:'Supercar', badge:'Exclusif', img:'https://images.unsplash.com/photo-1571607388263-1044f9ea01dd' }
];
const imgUrl = (base, w, q) => `${base}?auto=format&fit=crop&w=${w}&q=${q||75}`;

/* Header scroll + mobile nav */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 20));
const navToggle = document.getElementById('navToggle');
navToggle.addEventListener('click', () => header.classList.toggle('nav-open'));
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => header.classList.remove('nav-open')));

/* Reveal on scroll */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); } });
}, { threshold: .15 });
const observeReveal = () => document.querySelectorAll('.reveal:not(.in-view)').forEach(el => io.observe(el));

/* ---------- Inventory grid (data-driven) ---------- */
const carGrid = document.getElementById('carGrid');
function renderCars(filter){
  carGrid.innerHTML = '';
  VEHICLES.forEach((v, i) => {
    if (filter && filter !== 'all' && v.type !== filter) return;
    const card = document.createElement('div');
    card.className = 'car-card reveal';
    card.innerHTML = `
      <div class="car-media">
        <span class="car-badge">${v.badge}</span>
        <img src="${imgUrl(v.img, 800)}" alt="${v.brand} ${v.model}" loading="lazy">
        <button class="car-3d-btn" data-index="${i}" aria-label="Vue 3D ${v.brand} ${v.model}">⟲ Vue 3D</button>
      </div>
      <div class="car-body">
        <div class="brand">${v.brand}</div>
        <h3>${v.model}</h3>
        <div class="car-meta"><span>${v.km}</span><span>${v.trans}</span><span>${v.year}</span></div>
        <div class="car-price">${v.price}</div>
        <a href="#contact" class="car-link">Voir les détails →</a>
      </div>`;
    carGrid.appendChild(card);
  });
  observeReveal();
  document.querySelectorAll('.car-3d-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openViewer(parseInt(btn.dataset.index, 10)); });
  });
  attachTilt();
}
renderCars('all');

const tabs = document.querySelectorAll('.filter-tabs button');
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  renderCars(t.dataset.filter);
}));

/* ---------- Card tilt-on-hover ---------- */
function attachTilt(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.car-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ---------- 3D carousel ---------- */
const ring3d = document.getElementById('ring3d');
const stage3d = document.getElementById('stage3d');
const chipCount = VEHICLES.length;
const angleStep = 360 / chipCount;
let radius = 380;
let rotation = 0;

function buildRing(){
  ring3d.innerHTML = '';
  VEHICLES.forEach((v, i) => {
    const chip = document.createElement('div');
    chip.className = 'chip3d';
    chip.style.backgroundImage = `url('${imgUrl(v.img, 420)}')`;
    chip.style.transform = `rotateY(${i * angleStep}deg) translateZ(${radius}px)`;
    chip.dataset.index = i;
    chip.innerHTML = `<div class="chip3d-label"><small>${v.brand}</small>${v.model}</div>`;
    chip.addEventListener('click', () => { if (!dragged) openViewer(i); });
    ring3d.appendChild(chip);
  });
  updateActiveChip();
}

function computeRadius(){
  const chipW = stage3d.offsetWidth < 700 ? 150 : 200;
  radius = Math.round((chipW / 2) / Math.tan(Math.PI / chipCount) * 1.25);
  document.querySelectorAll('.chip3d').forEach((chip, i) => {
    chip.style.transform = `rotateY(${i * angleStep}deg) translateZ(${radius}px)`;
  });
}

function updateActiveChip(){
  const norm = ((rotation % 360) + 360) % 360;
  const activeIndex = Math.round(norm / angleStep) % chipCount;
  document.querySelectorAll('.chip3d').forEach((chip, i) => {
    chip.classList.toggle('chip3d-active', i === (chipCount - activeIndex) % chipCount);
  });
}

function applyRotation(){
  ring3d.style.transform = `rotateY(${rotation}deg)`;
  updateActiveChip();
}

buildRing();
computeRadius();
window.addEventListener('resize', computeRadius);

document.getElementById('car3dPrev').addEventListener('click', () => { rotation -= angleStep; applyRotation(); });
document.getElementById('car3dNext').addEventListener('click', () => { rotation += angleStep; applyRotation(); });

let dragging = false, dragged = false, startX = 0, startRotation = 0;
let pendingRotation = null, dragRaf = null;

function flushDrag(){
  dragRaf = null;
  if (pendingRotation === null) return;
  rotation = pendingRotation;
  pendingRotation = null;
  applyRotation();
}

stage3d.addEventListener('pointerdown', (e) => {
  dragging = true; dragged = false; startX = e.clientX; startRotation = rotation;
  stage3d.classList.add('dragging');
  stage3d.setPointerCapture(e.pointerId);
});
stage3d.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const delta = e.clientX - startX;
  if (Math.abs(delta) > 4) dragged = true;
  const sensitivity = e.pointerType === 'touch' ? 0.75 : 0.4;
  pendingRotation = startRotation + delta * sensitivity;
  if (dragRaf === null) dragRaf = requestAnimationFrame(flushDrag);
});
['pointerup','pointercancel','pointerleave'].forEach(evt => stage3d.addEventListener(evt, () => {
  dragging = false; stage3d.classList.remove('dragging');
}));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion){
  setInterval(() => { if (!dragging) { rotation += 0.06; applyRotation(); } }, 30);
}

/* ---------- 3D viewer modal ---------- */
const overlay = document.getElementById('viewerOverlay');
const viewerTilt = document.getElementById('viewerTilt');
const viewerImg = document.getElementById('viewerImg');
const viewerImgReflect = document.getElementById('viewerImgReflect');
const viewerTitle = document.getElementById('viewerTitle');
const viewerBadge = document.getElementById('viewerBadge');
const viewerMeta = document.getElementById('viewerMeta');
const viewerPrice = document.getElementById('viewerPrice');
let currentIndex = 0;

function openViewer(index){
  currentIndex = index;
  const v = VEHICLES[index];
  viewerImg.src = imgUrl(v.img, 900, 82);
  viewerImg.alt = `${v.brand} ${v.model}`;
  viewerImgReflect.src = viewerImg.src;
  viewerTitle.textContent = `${v.brand} ${v.model}`;
  viewerBadge.textContent = v.badge;
  viewerMeta.innerHTML = `<span>${v.year}</span><span>${v.km}</span><span>${v.trans}</span><span>${v.typeLabel}</span>`;
  viewerPrice.textContent = v.price;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeViewer(){
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  viewerTilt.style.transform = '';
}
document.getElementById('viewerClose').addEventListener('click', closeViewer);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeViewer(); });
document.addEventListener('keydown', (e) => {
  if (!overlay.classList.contains('open')) return;
  if (e.key === 'Escape') closeViewer();
  if (e.key === 'ArrowRight') openViewer((currentIndex + 1) % chipCount);
  if (e.key === 'ArrowLeft') openViewer((currentIndex - 1 + chipCount) % chipCount);
});
document.getElementById('viewerNext').addEventListener('click', () => openViewer((currentIndex + 1) % chipCount));
document.getElementById('viewerPrev').addEventListener('click', () => openViewer((currentIndex - 1 + chipCount) % chipCount));

const viewerStage = document.getElementById('viewerStage');
viewerStage.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  const r = viewerStage.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - .5;
  const py = (e.clientY - r.top) / r.height - .5;
  viewerTilt.style.transform = `rotateY(${px * 34}deg) rotateX(${-py * 20}deg)`;
});
viewerStage.addEventListener('pointerleave', () => { viewerTilt.style.transform = ''; });

observeReveal();
