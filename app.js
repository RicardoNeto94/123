(async function(){
  const grid = document.getElementById('grid');
  const filtersEl = document.getElementById('fab-chips');
  const empty = document.getElementById('empty');
  const res = await fetch('menu.json');
  const data = await res.json();

  // Collect unique allergens from dataset
  const allAllergens = Array.from(new Set(data.flatMap(d => d.allergens || []))).sort();

  // Selected allergen codes (multi-select). Show dishes SAFE from these.
  const selected = new Set();

  function renderFilters(){
    filtersEl.innerHTML = '';
    allAllergens.forEach(code => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.type = 'button';
      btn.textContent = code;
      btn.setAttribute('aria-pressed', selected.has(code) ? 'true' : 'false');
      if(selected.has(code)) btn.classList.add('active');
      btn.addEventListener('click', () => {
        if(selected.has(code)) { selected.delete(code); }
        else { selected.add(code); }
        renderFilters();
        renderCards();
      });
      filtersEl.appendChild(btn);
    });
  }

  function isSafe(item){
    if(selected.size === 0) return true;
    const itemAllergens = new Set(item.allergens || []);
    for(const code of selected){
      if(itemAllergens.has(code)) return false; // contains one of the selected allergens -> not safe
    }
    return true;
  }

  function renderCards(){
    grid.innerHTML = '';
    const items = data.filter(isSafe);
    empty.hidden = items.length !== 0;

    items.forEach(item => {
      const el = document.createElement('article');
      el.className = 'card';
      const header = document.createElement('h3');
      header.textContent = item.name;
      el.appendChild(header);

      const meta = document.createElement('div');
      meta.className = 'meta';

      // Safe badge if at least one filter is active and item is safe
      if(selected.size > 0){
        const safe = document.createElement('span');
        safe.className = 'badge safe';
        safe.textContent = 'SAFE';
        meta.appendChild(safe);
      }

      // Allergen code badges
      (item.allergens || []).forEach(code => {
        const b = document.createElement('span');
        b.className = 'badge';
        b.textContent = code;
        meta.appendChild(b);
      });

      el.appendChild(meta);
      grid.appendChild(el);
    });
  }

  renderFilters();
  renderCards();
})();


}
if(panelClose) panelClose.addEventListener('click', closePanel);
if(backdrop) backdrop.addEventListener('click', closePanel);
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape' && !panel.hidden) closePanel();
});

// Hide/show preset toggle on scroll direction
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const toggle = document.getElementById('preset-toggle');
  if(!toggle) return;
  if(window.scrollY > lastScrollY + 10){ // scrolling down
    toggle.classList.add('hide');
  } else if(window.scrollY < lastScrollY - 10){ // scrolling up
    toggle.classList.remove('hide');
  }
  lastScrollY = window.scrollY;
});

// Hide floating preset toggle on scroll down, show on scroll up
(function(){
  const bar = document.getElementById('preset-toggle');
  if(!bar) return;
  let lastY = window.pageYOffset || 0;
  let ticking = false;
  function onScroll(){
    const y = window.pageYOffset || 0;
    const goingDown = y > lastY + 4;   // small threshold to avoid jitter
    const goingUp = y < lastY - 4;
    if(goingDown){
      bar.classList.add('is-hidden');
    } else if(goingUp){
      bar.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', ()=>{
    if(!ticking){
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
})(); 

// Expanding FAB behavior
const presetFab = document.getElementById('preset-fab');
const fabDone = document.getElementById('fab-done');

function openFab(){
  presetFab.setAttribute('aria-expanded', 'true');
  const firstChip = document.querySelector('.fab-chips .filter-chip');
  if(firstChip) firstChip.focus();
}
function closeFab(){
  presetFab.setAttribute('aria-expanded', 'false');
  presetFab.focus();
}

if(presetFab){
  presetFab.addEventListener('click', (e) => {
    // prevent clicks on inner controls from re-toggling
    const target = e.target;
    if(target.closest('.filter-chip') || target.id === 'fab-done') return;
    const expanded = presetFab.getAttribute('aria-expanded') === 'true';
    if(expanded) closeFab(); else openFab();
  });
  presetFab.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      const expanded = presetFab.getAttribute('aria-expanded') === 'true';
      if(expanded) closeFab(); else openFab();
    }
    if(e.key === 'Escape'){
      if(presetFab.getAttribute('aria-expanded') === 'true') closeFab();
    }
  });
}
if(fabDone){
  fabDone.addEventListener('click', closeFab);
}

// Hide-on-scroll behavior for FAB
(function(){
  const bar = document.getElementById('preset-fab');
  if(!bar) return;
  let lastY = window.pageYOffset || 0;
  let ticking = false;
  function onScroll(){
    const y = window.pageYOffset || 0;
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if(goingDown){
      bar.classList.add('is-hidden');
    } else if(goingUp){
      bar.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', ()=>{
    if(!ticking){
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
})(); 
