
async function loadMenu() {
  const res = await fetch('menu.json');
  const items = await res.json();

  // Collect unique allergen codes from dataset
  const codes = new Set();
  items.forEach(it => (it.allergens || []).forEach(a => codes.add(a)));
  const codeList = Array.from(codes).sort();

  const filtersEl = document.querySelector('.filters');
  const gridEl = document.querySelector('.grid');
  const emptyEl = document.querySelector('#empty');

  let activeCode = null;

  // Build chips
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = 'Filter by allergen (show SAFE dishes):';
  filtersEl.appendChild(label);

  const clearChip = document.createElement('button');
  clearChip.className = 'filter-chip';
  clearChip.textContent = 'All dishes';
  clearChip.addEventListener('click', () => {
    activeCode = null;
    updateActive();
    render();
  });
  filtersEl.appendChild(clearChip);

  codeList.forEach(code => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip';
    chip.setAttribute('data-code', code);
    chip.innerHTML = `<strong>${code}</strong>`;
    chip.addEventListener('click', () => {
      activeCode = (activeCode === code) ? null : code;
      updateActive();
      render();
    });
    filtersEl.appendChild(chip);
  });

  function updateActive() {
    document.querySelectorAll('.filter-chip').forEach(ch => ch.classList.remove('active'));
    if (activeCode) {
      const active = document.querySelector(`.filter-chip[data-code="${activeCode}"]`);
      if (active) active.classList.add('active');
    } else {
      clearChip.classList.add('active');
    }
  }

  function render() {
    gridEl.innerHTML = '';
    // Filter items: show dishes SAFE for selected allergen (i.e., allergen code NOT present)
    const filtered = activeCode
      ? items.filter(it => !(it.allergens || []).includes(activeCode))
      : items.slice();

    if (filtered.length === 0) {
      emptyEl.style.display = 'block';
    } else {
      emptyEl.style.display = 'none';
    }

    filtered.forEach(it => {
      const card = document.createElement('article');
      card.className = 'card';

      const title = document.createElement('h3');
      title.textContent = it.name || 'Untitled dish';
      card.appendChild(title);

      const meta = document.createElement('div');
      meta.className = 'meta';

      const allergens = (it.allergens && it.allergens.length)
        ? it.allergens.join(', ')
        : 'None';

      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = 'Allergens: ' + allergens;
      meta.appendChild(badge);

      if (activeCode) {
        const safe = document.createElement('span');
        safe.className = 'badge';
        safe.textContent = `SAFE for ${activeCode}`;
        meta.appendChild(safe);
      }

      card.appendChild(meta);

      if (it.description && it.description.trim().length) {
        const desc = document.createElement('p');
        desc.textContent = it.description.trim();
        desc.style.marginTop = '10px';
        desc.style.opacity = '0.9';
        card.appendChild(desc);
      }

      gridEl.appendChild(card);
    });
  }

  updateActive();
  render();
}

document.addEventListener('DOMContentLoaded', loadMenu);
