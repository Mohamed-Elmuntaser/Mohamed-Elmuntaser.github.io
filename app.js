(() => {
 const data = window.PORTFOLIO_DATA;
 const $ = s => document.querySelector(s);
 const $$ = s => [...document.querySelectorAll(s)];

 let lang = 'en', filter = 'all', search = '';

 // Use absolute paths because all image files are in the website root.
 const imageSrc = filename =>
  '/' + String(filename).split('/').map(encodeURIComponent).join('/');

 const all = [
  ...data.design.map(p => ({...p, category:'design'})),
  ...data.asbuilt.map(p => ({...p, category:'asbuilt'})),
  ...data.contracting.map(p => ({...p, category:'contracting'}))
 ];

 const text = (en, ar) => lang === 'ar' ? (ar || en) : en;
 const loc = p => lang === 'ar' ? (p.location_ar || p.location) : p.location;

 function render() {
  const items = all.filter(p =>
   (filter === 'all' || p.category === filter) &&
   (`${p.title} ${p.title_ar || ''} ${p.location || ''} ${p.type || ''}`)
    .toLowerCase().includes(search)
  );

  $('#projectGrid').innerHTML = items.map(p => {
   const im = p.images && p.images.length ? p.images[0] : '';

   return `
    <article class="project-card" tabindex="0" data-id="${p.id}">
     <div class="card-image">
      ${im ? `<img loading="lazy" decoding="async" src="${imageSrc(im)}" alt="${esc(text(p.title,p.title_ar))}">` : ''}
     </div>
     <div class="card-kicker">
      <span>${p.category === 'design'
       ? text('DESIGN PROJECT','مشروع تصميم')
       : p.category === 'asbuilt'
        ? text('AS-BUILT / RENOVATION','رفع معماري / ترميم')
        : text('CONTRACTING','تنفيذ')}</span>
      <span>${p.num}</span>
     </div>
     <h3 class="card-title">${esc(text(p.title,p.title_ar))}</h3>
     <div class="card-meta">${esc(loc(p))}${p.area ? ' · ' + esc(p.area) : ''}</div>
    </article>`;
  }).join('');

  $$('.project-card').forEach(el => {
   el.addEventListener('click', () => openProject(el.dataset.id));
   el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
     e.preventDefault();
     openProject(el.dataset.id);
    }
   });
  });

  $('#emptyState').hidden = items.length > 0;
 }

 function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
   '&':'&amp;',
   '<':'&lt;',
   '>':'&gt;',
   '"':'&quot;',
   "'":'&#39;'
  }[c]));
 }

 function openProject(id) {
  const p = all.find(x => x.id === id);
  if (!p) return;

  $('#modalNumber').textContent =
   (p.category === 'design'
    ? text('DESIGN PROJECT','مشروع تصميم')
    : p.category === 'asbuilt'
     ? text('AS-BUILT & RENOVATION','الرفع والترميم')
     : text('CONTRACTING PROJECT','مشروع تنفيذي')) + ' / ' + p.num;

  $('#modalTitle').textContent = text(p.title,p.title_ar);
  $('#modalType').textContent = text(p.type,p.type_ar);
  $('#modalDescription').textContent = text(p.description,p.description_ar);

  const meta = [];

  if (p.location) meta.push([text('Location','الموقع'),loc(p)]);
  if (p.area) meta.push([text('Project area','مساحة المشروع'),p.area]);
  if (p.builtup) meta.push([text('Built-up area','المساحة المبنية'),p.builtup]);
  if (p.style) meta.push([text('Design style','الطراز المعماري'),p.style]);

  $('#modalMeta').innerHTML = meta.map(x =>
   `<div><strong>${x[0]}</strong>${esc(x[1])}</div>`
  ).join('');

  // Preserve the exact image order from projects.js.
  $('#modalGallery').innerHTML = (p.images || []).map((im,i) =>
   `<img src="${imageSrc(im)}"
    alt="${esc(text(p.title,p.title_ar))} — ${i+1}"
    loading="eager"
    decoding="async">`
  ).join('');

  $('#modal').classList.add('open');
  $('#modal').setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
 }

 function close() {
  $('#modal').classList.remove('open');
  $('#modal').setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
 }

 function setLanguage(next) {
  lang = next;

  document.documentElement.lang = lang;
  document.body.classList.toggle('rtl',lang === 'ar');
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  $$('[data-en][data-ar]').forEach(el => {
   if (el.tagName === 'H2' && el.innerHTML.includes('<br'))
    el.innerHTML = el.dataset[lang];
   else
    el.textContent = el.dataset[lang];
  });

  $('#langToggle').textContent = lang === 'en' ? 'العربية' : 'English';
  $('#search').placeholder = text('Search projects','ابحث في المشاريع');
  $('#search').setAttribute('aria-label',text('Search projects','ابحث في المشاريع'));

  $('#summary').textContent = text(data.profile.summary,data.profile.summary_ar);
  $('#role').textContent = text(data.profile.role,data.profile.role_ar);

  $('#emailLink').textContent = data.profile.email;
  $('#emailLink').href = 'mailto:' + data.profile.email;

  $('#phoneLink').textContent = data.profile.phone;
  $('#phoneLink').href = 'tel:' + data.profile.phone;

  $('#linkedinLink').href = data.profile.linkedin;

  render();
 }

 $('#langToggle').addEventListener('click', () =>
  setLanguage(lang === 'en' ? 'ar' : 'en')
 );

 $$('.filter').forEach(b => {
  b.addEventListener('click', () => {
   filter = b.dataset.filter;
   $$('.filter').forEach(x =>
    x.classList.toggle('active',x === b)
   );
   render();
  });
 });

 $('#search').addEventListener('input',e => {
  search = e.target.value.trim().toLowerCase();
  render();
 });

 $('#modalClose').addEventListener('click',close);

 $('#modal').addEventListener('click',e => {
  if (e.target.dataset.close) close();
 });

 document.addEventListener('keydown',e => {
  if (e.key === 'Escape') close();
 });

 const first = data.design.find(p => p.images && p.images.length);

 if (first) {
  $('#heroImage').style.backgroundImage =
   `url("${imageSrc(first.images[0])}")`;
 }

 $('#year').textContent = new Date().getFullYear();

 setLanguage('en');
})();
