(async function(){
  const grid = document.getElementById('grid');
  const filtersEl = document.getElementById('filters');
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
      btn.textContent = code + ' free';
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

// Theme toggle
const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;
body.classList.add('light'); // default theme

toggleBtn.addEventListener('click', () => {
  if(body.classList.contains('light')){
    body.classList.replace('light', 'dark');
    toggleBtn.textContent = '🌞';
  } else {
    body.classList.replace('dark', 'light');
    toggleBtn.textContent = '🌙';
  }
});
