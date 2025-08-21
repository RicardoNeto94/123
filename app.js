
(async function(){
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const presetFab = document.getElementById('preset-fab');
  const fabChips = document.getElementById('fab-chips');
  const fabDone = document.getElementById('fab-done');
  const fabBackdrop = document.getElementById('fab-backdrop');

  const res = await fetch('menu.json');
  const data = await res.json();

  const allAllergens = Array.from(new Set(data.flatMap(d => d.allergens || []))).sort();
  const selected = new Set();

  function renderFilters(){
    if(!fabChips) return;
    fabChips.innerHTML = '';
    allAllergens.forEach(code => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.type = 'button';
      btn.textContent = code;
      if(selected.has(code)) btn.classList.add('active');
      btn.addEventListener('click', () => {
        if(selected.has(code)){ selected.delete(code); btn.classList.remove('active'); }
        else { selected.add(code); btn.classList.add('active'); }
        renderCards();
      });
      fabChips.appendChild(btn);
    });
  }

  function isSafe(item){
    if(selected.size === 0) return true;
    const itemAllergens = new Set(item.allergens || []);
    for(const code of selected){
      if(itemAllergens.has(code)) return false;
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
      el.innerHTML = `<h3>${item.name}</h3>`;

      const meta = document.createElement('div');
      meta.className = 'meta';

      if(selected.size > 0){
        const safe = document.createElement('span');
        safe.className = 'badge safe';
        safe.textContent = 'SAFE';
        meta.appendChild(safe);
      }
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

  function openFab(){
    presetFab.setAttribute('aria-expanded', 'true');
    if(fabChips) fabChips.hidden = false;
    if(fabBackdrop) fabBackdrop.classList.add('show');
  }
  function closeFab(){
    presetFab.setAttribute('aria-expanded', 'false');
    if(fabChips) fabChips.hidden = true;
    if(fabBackdrop) fabBackdrop.classList.remove('show');
  }

  if(presetFab){
    presetFab.addEventListener('click', (e)=>{
      if(e.target.closest('.filter-chip') || e.target.id === 'fab-done') return;
      const expanded = presetFab.getAttribute('aria-expanded') === 'true';
      expanded ? closeFab() : openFab();
    });
    presetFab.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        const expanded = presetFab.getAttribute('aria-expanded') === 'true';
        expanded ? closeFab() : openFab();
      }
      if(e.key === 'Escape'){ closeFab(); }
    });
  }
  if(fabDone) fabDone.addEventListener('click', closeFab);
  if(fabBackdrop) fabBackdrop.addEventListener('click', closeFab);

  // Hide pill on scroll down, show on scroll up
  (function(){
    const bar = presetFab;
    if(!bar) return;
    let lastY = window.pageYOffset || 0;
    let ticking = false;
    function onScroll(){
      const y = window.pageYOffset || 0;
      if(y > lastY + 4){ bar.classList.add('is-hidden'); }
      else if(y < lastY - 4){ bar.classList.remove('is-hidden'); }
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', ()=>{
      if(!ticking){ window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
  })();

  renderFilters();
  renderCards();
})();
