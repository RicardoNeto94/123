
// Allergen legend (codes -> labels)
const LEGEND = {
  "CE":"Celery","GL":"Cereals (Gluten)","CR":"Crustaceans","EG":"Eggs","FI":"Fish",
  "LU":"Lupin","MO":"Molluscs","Mi":"Milk","MU":"Mustard","NU":"Nuts","PE":"Peanuts",
  "SE":"Sesame","SO":"Soya","SU":"Sulfites","GA":"Garlic","ON":"Onion","MR":"Mushrooms","CI":"Awaiting completion"
};

function codeToLabel(c){ return LEGEND[c] || c; }

async function loadMenu(){
  const res = await fetch('./menu.json', {cache:'no-store'});
  if(!res.ok){ console.warn('menu.json fetch failed, status', res.status); return []; }
  try{ return await res.json(); }catch(e){ console.error('JSON parse error', e); return []; }
}

function buildChips(container, onChange){
  const frag = document.createDocumentFragment();
  Object.keys(LEGEND).forEach(code => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.dataset.code = code;
    btn.innerHTML = `<b>${code}</b> ${codeToLabel(code)}`;
    btn.addEventListener('click', ()=>{ btn.classList.toggle('active'); onChange(); });
    frag.appendChild(btn);
  });
  container.innerHTML = '';
  container.appendChild(frag);
}

function getActiveFilters(){
  return [...document.querySelectorAll('.chip.active')].map(ch => ch.dataset.code);
}

function filterDishes(list, selected){
  return list.filter(item => (selected||[]).every(c => !(item.allergens||[]).includes(c)));
}

function renderGrid(el, list, selected){
  el.innerHTML = '';
  const frag = document.createDocumentFragment();
  list.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    const h = document.createElement('h3'); h.textContent = item.name || ''; card.appendChild(h);
    if(item.description){ const p = document.createElement('p'); p.className='desc'; p.textContent=item.description; card.appendChild(p); }
    const badges = document.createElement('div'); badges.className='badges';
    (item.allergens||[]).forEach(code=>{ const s=document.createElement('span'); s.className='badge'; s.title=codeToLabel(code); s.textContent=code; badges.appendChild(s); });
    if(selected.length){ const safe=document.createElement('span'); safe.className='badge safe'; safe.textContent='SAFE'; badges.appendChild(safe); }
    card.appendChild(badges);
    frag.appendChild(card);
  });
  el.appendChild(frag);
}

function updateMeta(n, selected){
  document.getElementById('resultCount').textContent = `${n} dish${n===1?'':'es'}`;
  document.getElementById('activeFilter').textContent = selected.length ? `Safe for: ${selected.join(', ')}` : 'No filters active';
}

(async function init(){
  const chips = document.getElementById('chips');
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');

  const dishes = await loadMenu();

  const rerender = ()=>{
    const sel = getActiveFilters();
    const filtered = filterDishes(dishes, sel);
    renderGrid(grid, filtered, sel);
    updateMeta(filtered.length, sel);
    empty.classList.toggle('hidden', filtered.length !== 0);
  };

  buildChips(chips, rerender);
  // initial
  renderGrid(grid, dishes, []);
  updateMeta(dishes.length, []);
  empty.classList.add('hidden');
})();
