document.querySelectorAll('.filter-button').forEach(btn => {
  btn.addEventListener('click', () => {
    // toggle active
    document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
      const allergens = card.dataset.allergens.split(' ');
      if (!filter || !filter.length) {
        card.style.display = '';
      } else {
        card.style.display = allergens.includes(filter) ? 'none' : '';
      }
    });
  });
});
