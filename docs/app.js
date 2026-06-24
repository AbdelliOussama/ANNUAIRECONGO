/* ═══════════════════════════════════════════════════════════════
   Annuaire Congo — Documentation App Script
   Navigation, search, theme toggle, keyboard shortcuts
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── DOM Elements ──────────────────────────────────────────
  const sidebar      = document.getElementById('sidebar');
  const sidebarToggle= document.getElementById('sidebarToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const themeToggle  = document.getElementById('themeToggle');
  const themeIcon    = document.getElementById('themeIcon');
  const searchInput  = document.getElementById('searchInput');
  const searchResults= document.getElementById('searchResults');
  const backToTop    = document.getElementById('backToTop');
  const contentEl    = document.getElementById('content');

  // ─── Navigation ────────────────────────────────────────────
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('[data-nav]');

  // Build search index from sidebar links
  const searchIndex = [];
  document.querySelectorAll('.sidebar__link[data-nav]').forEach(link => {
    const groupTitle = link.closest('.sidebar__group')
      ?.querySelector('.sidebar__group-title')?.textContent?.trim() || '';
    searchIndex.push({
      id: link.dataset.nav,
      title: link.textContent.trim(),
      group: groupTitle,
      icon: link.querySelector('.material-icons-outlined')?.textContent || 'article',
    });
  });

  function navigateTo(pageId) {
    const target = document.getElementById('page-' + pageId);
    if (target) {
      // Offset for topbar (approx 70px)
      const topOffset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }

    // Close mobile sidebar
    closeSidebar();

    // Update URL hash
    history.pushState(null, '', '#' + pageId);
  }

  // Attach click handlers to all nav elements
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.dataset.nav);
    });
  });

  // Handle hash navigation on load
  function handleHash() {
    const hash = location.hash.replace('#', '');
    if (hash && document.getElementById('page-' + hash)) {
      setTimeout(() => navigateTo(hash), 100);
    }
  }
  window.addEventListener('hashchange', handleHash);
  window.addEventListener('load', handleHash);

  // ScrollSpy for sidebar active links
  window.addEventListener('scroll', () => {
    let currentId = '';
    pages.forEach(page => {
      const pageTop = page.getBoundingClientRect().top;
      // If the top of the section is near the top of the viewport
      if (pageTop < 150) {
        currentId = page.getAttribute('id').replace('page-', '');
      }
    });

    if (currentId) {
      document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll(`.sidebar__link[data-nav="${currentId}"]`).forEach(l => l.classList.add('active'));
    }
  }, { passive: true });

  // ─── Mobile Sidebar ────────────────────────────────────────
  function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  sidebarOverlay.addEventListener('click', closeSidebar);

  // ─── Theme Toggle ─────────────────────────────────────────
  const html = document.documentElement;

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    localStorage.setItem('ac-docs-theme', theme);
  }

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Restore saved theme
  const savedTheme = localStorage.getItem('ac-docs-theme');
  if (savedTheme) setTheme(savedTheme);

  // ─── Search ────────────────────────────────────────────────
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) {
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      return;
    }

    const matches = searchIndex.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.group.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-result-item"><span class="search-result-item__title" style="color:var(--text-3)">Aucun résultat trouvé</span></div>';
    } else {
      searchResults.innerHTML = matches.map(m => `
        <div class="search-result-item" data-nav="${m.id}">
          <span class="material-icons-outlined search-result-item__icon">${m.icon}</span>
          <div>
            <div class="search-result-item__title">${highlight(m.title, query)}</div>
            <div class="search-result-item__path">${m.group}</div>
          </div>
        </div>
      `).join('');

      searchResults.querySelectorAll('.search-result-item[data-nav]').forEach(item => {
        item.addEventListener('click', () => {
          navigateTo(item.dataset.nav);
          searchInput.value = '';
          searchResults.classList.remove('active');
        });
      });
    }

    searchResults.classList.add('active');
  });

  function highlight(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return text;
    return text.slice(0, idx) + '<mark style="background:var(--brand);color:#fff;border-radius:2px;padding:0 2px;">' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
  }

  // Close search results on click outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-box')) {
      searchResults.classList.remove('active');
    }
  });

  // ─── Keyboard Shortcuts ────────────────────────────────────
  document.addEventListener('keydown', e => {
    // Ctrl+K → Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
    // Escape → Close search / sidebar
    if (e.key === 'Escape') {
      searchInput.blur();
      searchResults.classList.remove('active');
      closeSidebar();
    }
  });

  // ─── Back to Top ───────────────────────────────────────────
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ─── Copy Code ─────────────────────────────────────────────
  window.copyCode = function (btn) {
    const codeBlock = btn.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const original = btn.textContent;
      btn.textContent = '✓ Copié!';
      btn.style.color = 'var(--accent)';
      btn.style.borderColor = 'var(--accent)';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.color = '';
        btn.style.borderColor = '';
      }, 2000);
    });
  };

  // ─── Tab Component ─────────────────────────────────────────
  document.querySelectorAll('.tab-list').forEach(tabList => {
    tabList.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabs = tabList.closest('.tabs');
        tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        tabs.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        tabs.querySelector('#' + btn.dataset.tab).classList.add('active');
      });
    });
  });

  // ─── Smooth page entry animations ──────────────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.feature-item, .hero-card, .sector-card, .flow-step, .endpoint').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = 'opacity .5s cubic-bezier(.4,0,.2,1), transform .5s cubic-bezier(.4,0,.2,1)';
    observer.observe(el);
  });

})();
