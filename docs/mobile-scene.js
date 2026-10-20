const header = document.querySelector('header');
const links = header?.querySelector('nav.building-links');
if (header && links) {
  const menu = document.createElement('details');
  menu.className = 'mobile-pages';
  const summary = document.createElement('summary');
  summary.textContent = 'Yapılar ⌄';
  const panel = document.createElement('div');
  for (const link of links.querySelectorAll('a')) {
    const item = link.cloneNode(true);
    item.textContent = item.textContent.replace('↗', '').trim();
    panel.append(item);
  }
  menu.append(summary, panel);
  header.append(menu);
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') menu.open = false;
  });
}
if (matchMedia('(max-width: 640px)').matches) {
  const intro = document.querySelector('.intro');
  const path = location.pathname;
  if (intro) {
    if (path.includes('/kent-hotel/')) intro.dataset.mobileTitle = 'Kent Hotel';
    else if (path.includes('/osmanli-bankasi/')) intro.dataset.mobileTitle = new URLSearchParams(location.search).get('era') === 'club' ? 'İttihat ve Terakki' : 'Osmanlı Bankası';
    else if (path.includes('/ulucami/')) intro.dataset.mobileTitle = new URLSearchParams(location.search).get('focus') === 'cesme' ? 'Çinili Çeşme' : 'Ulu Cami';
    else intro.dataset.mobileTitle = 'İş Bankası';
  }
  document.querySelectorAll('[data-era]').forEach(button => button.addEventListener('click', () => {
    if (intro) intro.dataset.mobileTitle = button.dataset.era === 'club' ? 'İttihat ve Terakki' : 'Osmanlı Bankası';
  }));
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    if (intro && path.includes('/ulucami/')) intro.dataset.mobileTitle = button.dataset.view === 'fountain' ? 'Çinili Çeşme' : 'Ulu Cami';
  }));
  const sources = document.getElementById('sources');
  if (sources) {
    sources.setAttribute('aria-label', sources.textContent.trim());
    sources.textContent = 'Kaynaklar ↗';
  }
  const labels = {compare:'Kütle',context:'Çevre',rotate:'Döndür',evidence:'Yorum',roof:'Yorum',site:path.includes('/ulucami/')?'DGN':'Konum',light:'Işık'};
  document.querySelectorAll('.tools button').forEach(button => {
    const label = labels[button.id];
    if (!label) return;
    if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', button.textContent.trim());
    button.textContent = label;
  });
}
