// Allergen legend
const LEGEND = {
  "CE":"Celery","GL":"Cereals (Gluten)","CR":"Crustaceans","EG":"Eggs","FI":"Fish",
  "LU":"Lupin","MO":"Molluscs","Mi":"Milk","MU":"Mustard","NU":"Nuts","PE":"Peanuts",
  "SE":"Sesame","SO":"Soya","SU":"Sulfites","GA":"Garlic","ON":"Onion","MR":"Mushrooms","CI":"Awaiting completion"
};
const codeToLabel = c => LEGEND[c] || c;

async function loadMenu(){
  try{ const r = await fetch('./menu.json',{cache:'no-store'}); if(!r.ok) return []; return await r.json(); }
  catch(e){ return []; }
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

const getActiveFilters = () => [...document.querySelectorAll('.chip.active')].map(ch => ch.dataset.code);
const filterDishes = (list, sel) => list.filter(item => (sel||[]).every(c => !(item.allergens||[]).includes(c)));

function renderGrid(el, list, sel){
  el.innerHTML = '';
  const frag = document.createDocumentFragment();
  const haveFilters = !!(sel && sel.length);

  list.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';

    const h = document.createElement('h3');
    h.textContent = item.name || '';
    card.appendChild(h);

    if(item.description){
      const p = document.createElement('p');
      p.className = 'desc';
      p.textContent = item.description;
      card.appendChild(p);
    }

    const badges = document.createElement('div');
    badges.className = 'badges';
    (item.allergens||[]).forEach(code => {
      const s = document.createElement('span');
      s.className = 'badge';
      s.title = codeToLabel(code);
      s.textContent = code;
      badges.appendChild(s);
    });
    card.appendChild(badges);

    // Add safe check INSIDE the card if it passes active filters
    if(haveFilters){
      const pass = sel.every(c => !(item.allergens||[]).includes(c));
      if(pass){
        const check = document.createElement('div');
        check.className = 'safe-check';
        check.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20.285 6.709a1 1 0 0 0-1.414-1.418l-9.192 9.193-4.243-4.243a1 1 0 0 0-1.414 1.414l5 5a1 1 0 0 0 1.414 0l9.849-9.946z"/></svg>';
        card.appendChild(check);
        requestAnimationFrame(()=> check.classList.add('show'));
      }
    }

    frag.appendChild(card);
  });

  el.appendChild(frag);
}

function updateMeta(n, sel){
  const rc = document.getElementById('resultCount');
  const af = document.getElementById('activeFilter');
  if(rc) rc.textContent = `${n} dish${n===1?'':'es'}`;
  if(af) af.textContent = sel.length ? `Safe for: ${sel.join(', ')}` : 'No filters active';
}

function toggleFilterPanel(open){
  const panel = document.getElementById('filterPanel');
  const btn = document.getElementById('filterToggle');
  if(!panel || !btn) return;
  const willOpen = (open !== undefined) ? open : !panel.classList.contains('open');
  panel.classList.toggle('open', willOpen);
  btn.setAttribute('aria-expanded', String(willOpen));
}

document.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('filterToggle');
  if(btn) btn.addEventListener('click', ()=> toggleFilterPanel());
});

(async function init(){
  const chips = document.getElementById('chips');
  const grid  = document.getElementById('grid');
  const empty = document.getElementById('empty');

  const dishes = await loadMenu();

  const rerender = ()=>{
    const sel = getActiveFilters();
    const data = filterDishes(dishes, sel);
    renderGrid(grid, data, sel);
    updateMeta(data.length, sel);
    if(empty) empty.classList.toggle('hidden', data.length !== 0);
  };

  buildChips(chips, rerender);
  renderGrid(grid, dishes, []);
  updateMeta(dishes.length, []);
  if(empty) empty.classList.add('hidden');
})();