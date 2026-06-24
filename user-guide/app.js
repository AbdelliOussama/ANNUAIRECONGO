/* ═══════════════════════════════════════════════════════════════
   Annuaire Congo — User Guide App Script
   Navigation, search, lightbox, theme, accordion, scroll spy
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ─── DOM refs ──────────────────────────────────────────────
  const sidebar    = document.getElementById('sidebar');
  const overlay    = document.getElementById('overlay');
  const hamburger  = document.getElementById('hamburger');
  const themeBtn   = document.getElementById('themeBtn');
  const themeIcon  = document.getElementById('themeIcon');
  const searchInput    = document.getElementById('searchInput');
  const searchResults  = document.getElementById('searchResults');
  const backTop    = document.getElementById('backTop');
  const lightbox   = document.getElementById('lightbox');
  const lbImg      = document.getElementById('lbImg');
  const lbClose    = document.getElementById('lbClose');
  const html       = document.documentElement;

  // ─── Build search index from sidebar links ─────────────────
  const index = [];
  document.querySelectorAll('.sidebar__link[data-nav]').forEach(link => {
    const label = link.closest('.sidebar__group')
      ?.querySelector('.sidebar__label')?.textContent?.trim() || '';
    index.push({
      id: link.dataset.nav,
      title: link.textContent.trim(),
      group: label,
    });
  });

  // ─── Navigate ──────────────────────────────────────────────
  function navigateTo(pageId) {
    const target = document.getElementById('page-' + pageId);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    history.pushState(null, '', '#' + pageId);
    closeSidebar();
    setActiveLink(pageId);
  }

  function setActiveLink(pageId) {
    document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
    const active = document.querySelector(`.sidebar__link[data-nav="${pageId}"]`);
    if (active) {
      active.classList.add('active');
      active.scrollIntoView({ block: 'nearest' });
    }
  }

  // Attach nav clicks
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.dataset.nav);
    });
  });

  // Hash on load
  window.addEventListener('load', () => {
    const hash = location.hash.replace('#', '');
    if (hash && document.getElementById('page-' + hash)) {
      setTimeout(() => navigateTo(hash), 80);
    }
  });

  // ─── Scroll Spy ────────────────────────────────────────────
  const pages = document.querySelectorAll('.page');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        let currentId = '';
        pages.forEach(p => {
          if (p.getBoundingClientRect().top < 140) {
            currentId = p.id.replace('page-', '');
          }
        });
        if (currentId) setActiveLink(currentId);
        ticking = false;
      });
      ticking = true;
    }
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ─── Mobile sidebar ────────────────────────────────────────
  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (hamburger) hamburger.addEventListener('click', () => sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // ─── Theme ─────────────────────────────────────────────────
  function setTheme(t) {
    html.setAttribute('data-theme', t);
    if (themeIcon) themeIcon.textContent = t === 'dark' ? 'light_mode' : 'dark_mode';
    try { localStorage.setItem('ug-theme', t); } catch(e) {}
  }
  if (themeBtn) themeBtn.addEventListener('click', () => setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
  try {
    const saved = localStorage.getItem('ug-theme');
    if (saved) setTheme(saved);
  } catch(e) {}

  // ─── Search ────────────────────────────────────────────────
  function highlight(text, q) {
    const i = text.toLowerCase().indexOf(q);
    if (i < 0) return text;
    return text.slice(0, i)
      + `<mark style="background:var(--brand);color:#fff;border-radius:2px;padding:0 2px">${text.slice(i, i + q.length)}</mark>`
      + text.slice(i + q.length);
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = '';
      if (q.length < 2) { searchResults.classList.remove('open'); return; }

      const matches = index.filter(item =>
        item.title.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)
      );

      if (!matches.length) {
        searchResults.innerHTML = `<div class="search-result"><span class="search-result__title" style="color:var(--t3)">Aucun résultat</span></div>`;
      } else {
        searchResults.innerHTML = matches.slice(0, 8).map(m => `
          <div class="search-result" data-nav="${m.id}">
            <span class="material-icons-outlined search-result__icon">article</span>
            <div>
              <div class="search-result__title">${highlight(m.title, q)}</div>
              <div class="search-result__section">${m.group}</div>
            </div>
          </div>
        `).join('');
        searchResults.querySelectorAll('.search-result[data-nav]').forEach(r => {
          r.addEventListener('click', () => {
            navigateTo(r.dataset.nav);
            searchInput.value = '';
            searchResults.classList.remove('open');
          });
        });
      }
      searchResults.classList.add('open');
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.search-box')) searchResults.classList.remove('open');
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
    if (e.key === 'Escape') {
      if (searchInput) searchInput.blur();
      if (searchResults) searchResults.classList.remove('open');
      closeSidebar();
      closeLightbox();
    }
  });

  // ─── Lightbox ──────────────────────────────────────────────
  function openLightbox(src, alt) {
    if (!lightbox || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.screenshot img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  // ─── Accordion (.acc-item / .acc-header) ───────────────────
  document.querySelectorAll('.acc-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.acc-item');
      const isOpen = item.classList.contains('open');
      // Close siblings in the same .accordion parent
      const parent = item.closest('.accordion');
      if (parent) parent.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ─── Hero card clicks ──────────────────────────────────────
  document.querySelectorAll('.hero-card[data-nav]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => navigateTo(card.dataset.nav));
  });

  // ─── Intersection animations ───────────────────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.feature-item, .hero-card, .role-card, .step, .plan-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .45s ease, transform .45s ease';
    observer.observe(el);
  });

})();
