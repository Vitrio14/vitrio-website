\
(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Header scroll state
  const header = $('.header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 14);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  const burger = $('#hamburger');
  const panel = $('#mobilePanel');
  if (burger && panel) {
    const setOpen = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    };
    setOpen(false);

    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
    });

    // Close after click
    $$('#mobilePanel a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  // Toast helper
  const toast = $('#toast');
  const toastMsg = $('#toastMsg');
  const showToast = (title, msg) => {
    if (!toast || !toastMsg) return;
    toastMsg.innerHTML = `<strong>${title}</strong><br><small>${msg}</small>`;
    toast.classList.add('show');
  };
  const hideToast = () => toast?.classList.remove('show');
  $('#toastClose')?.addEventListener('click', hideToast);

  // Copy link button
  $('#copyLink')?.addEventListener('click', async () => {
    try{
      await navigator.clipboard.writeText(window.location.origin);
      showToast('Link copiato', 'Incollalo dove vuoi (Discord, bio, ecc.)');
    }catch{
      showToast('Ops', 'Il browser non permette la copia automatica.');
    }
  });

  // Smooth scroll offset for sticky header
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 86;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')?.slice(1);
      if (!id) return;
      if (!document.getElementById(id)) return;
      e.preventDefault();
      scrollToId(id);
    });
  });

  // Theme toggle (dark/light) with persistence
  const THEME_KEY = 'vitrio_theme';
  const themeBtn = $('#themeToggle');
  const applyTheme = (mode) => {
    document.documentElement.dataset.theme = mode;
    document.body.classList.toggle('light', mode === 'light');
    try{ localStorage.setItem(THEME_KEY, mode); }catch{}
  };
  const stored = (() => { try{ return localStorage.getItem(THEME_KEY); }catch{ return null; }})();
  if (stored === 'light') applyTheme('light');
  if (themeBtn){
    themeBtn.addEventListener('click', () => {
      const next = document.body.classList.contains('light') ? 'dark' : 'light';
      applyTheme(next);
      showToast('Tema aggiornato', next === 'light' ? 'Modalità chiara attiva.' : 'Modalità scura attiva.');
    });
  }

  // Light theme tweaks via inline CSS variables (keeps file simple)
  const lightCss = document.createElement('style');
  lightCss.textContent = `
    body.light{
      --bg0:#f6f7fb;
      --bg1:#eef0f7;
      --panel:rgba(10,10,20,.04);
      --panel2:rgba(10,10,20,.06);
      --stroke:rgba(10,10,20,.10);
      --text:#0b0b14;
      --muted:rgba(11,11,20,.70);
      --shadow: 0 18px 60px rgba(10,10,20,.14);
      background:
        radial-gradient(1200px 600px at 20% -10%, rgba(169,112,255,.22), transparent 60%),
        radial-gradient(900px 500px at 90% 10%, rgba(255,78,205,.14), transparent 55%),
        linear-gradient(180deg, var(--bg0), var(--bg1));
    }
    body.light .header{background: rgba(255,255,255,.70)}
    body.light .header.scrolled{background: rgba(255,255,255,.92)}
  `;
  document.head.appendChild(lightCss);
})();
