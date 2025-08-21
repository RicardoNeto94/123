
(async function(){
  const grid = document.getElementById('grid');
  const filtersEl = document.getElementById('filters');
  const empty = document.getElementById('empty');
        
  const res = await fetch('menu.json');
  const data = await res.json();

  const allAllergens = Array.from(new Set(data.flatMap(d => d.allergens || []))).sort();
  const selected = new Set();

  function renderFilters(){
    if(!filtersEl) return;
    filtersEl.innerHTML = '';
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
  initFabCollapsed();
      });
      filtersEl.appendChild(btn);
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

      if(filtersEl){ filtersEl.hidden = true; }
        expanded ? closeFab() : openFab();
      }
      if(e.key === 'Escape'){ closeFab(); }
    });
  }
    
  // Hide pill on scroll down, show on scroll up
  renderFilters();
  renderCards();
  initFabCollapsed();
})();
