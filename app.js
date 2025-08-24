// app.js
/* Novare Apps Hub — GitHub Pages PWA
   - apps.json catalog with stale-while-revalidate
   - Admin edit link toggle via ?admin=1
   - Install prompt + update snackbar
   - Accessibility toggles
*/
const CONFIG = {
  APPS_JSON: './apps.json',
  // Set this to your repo edit URL to enable the admin edit button
  GITHUB_EDIT_URL: 'https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/edit/main/apps.json'
};

let deferredPrompt = null;
const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

document.addEventListener('DOMContentLoaded', () => {
  // Year
  qs('#year').textContent = new Date().getFullYear();

  // Settings dialog
  const settingsDialog = qs('#settingsDialog');
  qs('#settingsBtn').addEventListener('click', () => settingsDialog.showModal());
  qs('#closeSettings').addEventListener('click', () => settingsDialog.close());

  // Accessibility toggles
  const contrast = qs('#toggleContrast');
  const dyslexia = qs('#toggleDyslexia');
  const textSize = qs('#textSize');
  // restore
  if(localStorage.getItem('contrast')==='1') { document.body.classList.add('high-contrast'); contrast.checked = true; }
  if(localStorage.getItem('dyslexia')==='1') { document.body.classList.add('dyslexia'); dyslexia.checked = true; }
  const size = localStorage.getItem('txt') || '100';
  ['90','100','110','120','130'].forEach(s=>document.body.classList.remove(`txt-${s}`));
  document.body.classList.add(`txt-${size}`); textSize.value = size;

  contrast.addEventListener('change', e=>{
    document.body.classList.toggle('high-contrast', e.target.checked);
    localStorage.setItem('contrast', e.target.checked ? '1':'0');
  });
  dyslexia.addEventListener('change', e=>{
    document.body.classList.toggle('dyslexia', e.target.checked);
    localStorage.setItem('dyslexia', e.target.checked ? '1':'0');
  });
  textSize.addEventListener('input', e=>{
    ['90','100','110','120','130'].forEach(s=>document.body.classList.remove(`txt-${s}`));
    const val = String(e.target.value);
    document.body.classList.add(`txt-${val}`);
    localStorage.setItem('txt', val);
  });

  // Filters
  qs('#search').addEventListener('input', renderFiltered);
  qs('#filterPaid').addEventListener('change', renderFiltered);
  qs('#refreshBtn').addEventListener('click', () => loadApps(true));

  // Admin link
  if (new URLSearchParams(location.search).get('admin') === '1') {
    const link = qs('#adminEditLink');
    link.hidden = false;
    link.href = CONFIG.GITHUB_EDIT_URL;
  }

  // Install prompt
  const installBtn = qs('#installBtn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });

  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            snackbar('New version available', 'Refresh', () => location.reload());
          }
        });
      });
    }).catch(console.error);
  }

  // Load apps
  loadApps(false);
});

let APPS = [];
async function loadApps(bypassCache){
  try{
    const res = await fetch(CONFIG.APPS_JSON, { cache: bypassCache ? 'no-store' : 'default' });
    APPS = await res.json();
    renderFiltered();
  }catch(err){
    console.error('Failed to load apps.json', err);
    // Fallback demo data (in case first load offline)
    APPS = [
      {"title":"Accessible Calendar","url":"https://YOUR_USER.github.io/AccessibleCalendar/","paid":true,"price_label":"£2.99","summary":"Simple visual schedule with large text.","badge":"POPULAR","paypal_ncp_url":"https://www.paypal.com/ncp/payment/EXAMPLE"},
      {"title":"ShiftChat","url":"https://YOUR_USER.github.io/ShiftChat/","paid":false,"summary":"Quick rota chat & handovers","badge":"NEW"}
    ];
    renderFiltered();
  }
}

function renderFiltered(){
  const term = qs('#search').value.trim().toLowerCase();
  const filter = qs('#filterPaid').value;
  const grid = qs('#appsGrid');
  grid.innerHTML = '';

  const filtered = APPS.filter(a=>{
    const matchesText = !term || (a.title?.toLowerCase()?.includes(term) || a.summary?.toLowerCase()?.includes(term));
    const matchesPaid = filter==='all' || (filter==='free' ? !a.paid : !!a.paid);
    return matchesText && matchesPaid;
  });

  if(filtered.length === 0){
    qs('#emptyState').hidden = false;
    return;
  } else {
    qs('#emptyState').hidden = true;
  }

  const tmpl = qs('#appCardTmpl');
  filtered.forEach(app=>{
    const node = tmpl.content.firstElementChild.cloneNode(true);
    node.querySelector('.card-title').textContent = app.title || 'Untitled';
    const badge = node.querySelector('.badge');
    badge.textContent = app.badge || (app.paid ? (app.price_label || 'PAID') : 'FREE');

    node.querySelector('.card-summary').textContent = app.summary || '';
    node.querySelector('[data-open]').href = app.url;
    node.querySelector('[data-info]').href = app.info || app.url;

    const buyBtn = node.querySelector('[data-buy]');
    if (app.paid && app.paypal_ncp_url){
      buyBtn.href = app.paypal_ncp_url;
      buyBtn.textContent = app.price_label ? `Buy ${app.price_label}` : 'Buy';
    } else {
      buyBtn.remove();
    }

    grid.appendChild(node);
  });
}

function snackbar(msg, actionLabel, action){
  const bar = qs('#snackbar');
  bar.textContent = msg;
  if(actionLabel && action){
    const a = document.createElement('button');
    a.textContent = ' ' + actionLabel;
    a.className = 'btn ghost';
    a.addEventListener('click', action);
    bar.appendChild(a);
  }
  bar.style.display = 'block';
  setTimeout(()=>{ bar.style.display = 'none'; bar.innerHTML=''; }, 5000);
}
