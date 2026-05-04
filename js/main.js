const App = {
  works: [],
  theme: localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),

  /** Убирает из каталога скрытые работы (данные остаются в works.json). */
  filterCatalogWorks(list) {
    // Скрыто: «Венеры» (видео 0:42) — id venuses
    return list.filter(w => w.id !== 'venuses');
  },

  init() {
    this.injectComponents();
    if (window.i18n) window.i18n.init();

    this.applyTheme();
    this.bindEvents();
    this.setActiveLink();
    
    if (document.getElementById('gallery-grid')) {
      this.loadGallery();
    } else if (document.getElementById('work-content')) {
      this.loadWorkDetail();
    }

    window.addEventListener('languageChanged', () => {
      if (document.getElementById('gallery-grid')) this.renderGallery();
      if (document.getElementById('work-content')) this.loadWorkDetail();
    });

    this.initLightbox();
  },

  injectComponents() {
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    const mobileHeaderPlaceholder = document.getElementById('mobile-header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (sidebarPlaceholder && window.Components) {
      sidebarPlaceholder.innerHTML = window.Components.sidebar;
    }
    if (mobileHeaderPlaceholder && window.Components) {
      mobileHeaderPlaceholder.innerHTML = window.Components.mobileHeader;
    }
    if (footerPlaceholder && window.Components) {
      footerPlaceholder.innerHTML = window.Components.footer;
    }
    this.setActiveLink();
  },

  setActiveLink() {
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-link, .mobile-nav-list a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === fileName || (fileName === 'index.html' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  initLightbox() {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.id = 'lightbox';
    lb.innerHTML = `
      <div class="lightbox-controls">
        <button class="lightbox-btn" id="lightbox-zoom"><img src="assets/icons/zuum in icon.svg" alt="Zoom"></button>
        <button class="lightbox-btn" id="lightbox-close"><img src="assets/icons/close icon.svg" alt="Close"></button>
      </div>
      <div class="lightbox-content" id="lightbox-content">
        <img src="" alt="" class="lightbox-img" id="lightbox-img">
      </div>
    `;
    document.body.appendChild(lb);

    this.lb = {
      el: lb,
      img: lb.querySelector('#lightbox-img'),
      zoomBtn: lb.querySelector('#lightbox-zoom'),
      zoomIcon: lb.querySelector('#lightbox-zoom img'),
      content: lb.querySelector('#lightbox-content'),
      isZoomed: false,
      isDragging: false,
      startX: 0, startY: 0,
      translateX: 0, translateY: 0,
      scale: 1
    };

    const lbState = this.lb;

    // Close logic
    const closeLb = () => {
      lb.classList.remove('active', 'zoomed');
      lbState.isZoomed = false;
      lbState.translateX = 0;
      lbState.translateY = 0;
      lbState.img.style.transform = '';
      lbState.zoomIcon.src = 'assets/icons/zuum in icon.svg';
      document.body.style.overflow = '';
    };

    lb.querySelector('#lightbox-close').onclick = closeLb;
    lb.onclick = (e) => {
      if (e.target === lb || e.target === lbState.content) closeLb();
    };

    // Zoom logic
    const toggleZoom = (e) => {
      if (e) e.stopPropagation();
      
      // If we were dragging, don't toggle zoom
      if (lbState.wasDragged) {
        lbState.wasDragged = false;
        return;
      }

      lbState.isZoomed = !lbState.isZoomed;
      lb.classList.toggle('zoomed', lbState.isZoomed);
      
      if (lbState.isZoomed) {
        lbState.zoomIcon.src = 'assets/icons/zoom out icon.svg';
        const naturalWidth = lbState.img.naturalWidth;
        const currentWidth = lbState.img.clientWidth;
        const ratio = naturalWidth / currentWidth;
        // Умеренный зум от вписанного вида: не больше 2× и не «дожимаем» до полного 1:1 с файлом.
        const maxZoomFactor = 2;
        const softCap = 0.92;
        let scale = Math.min(maxZoomFactor, ratio * softCap);
        if (scale < 1.02) scale = 1.02;
        lbState.scale = scale;
      } else {
        lbState.zoomIcon.src = 'assets/icons/zuum in icon.svg';
        lbState.translateX = 0;
        lbState.translateY = 0;
      }
      this.updateLightboxTransform();
    };

    lbState.zoomBtn.onclick = toggleZoom;
    lbState.img.onclick = toggleZoom;

    // Panning logic
    const startDrag = (e) => {
      if (!lbState.isZoomed) return;
      lbState.isDragging = true;
      lbState.wasDragged = false;
      const pos = e.type.startsWith('touch') ? e.touches[0] : e;
      lbState.startX = pos.clientX - lbState.translateX;
      lbState.startY = pos.clientY - lbState.translateY;
      lbState.initialX = pos.clientX;
      lbState.initialY = pos.clientY;
      lbState.img.style.transition = 'none';
    };

    const doDrag = (e) => {
      if (!lbState.isDragging) return;
      const pos = e.type.startsWith('touch') ? e.touches[0] : e;
      
      const dx = Math.abs(pos.clientX - lbState.initialX);
      const dy = Math.abs(pos.clientY - lbState.initialY);
      if (dx > 5 || dy > 5) lbState.wasDragged = true;

      lbState.translateX = pos.clientX - lbState.startX;
      lbState.translateY = pos.clientY - lbState.startY;
      this.updateLightboxTransform();
      if (e.type.startsWith('touch')) e.preventDefault();
    };

    const stopDrag = () => {
      lbState.isDragging = false;
      lbState.img.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    };

    lbState.img.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);

    lbState.img.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', doDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);
  },

  updateLightboxTransform() {
    const s = this.lb;
    if (s.isZoomed) {
      s.img.style.transform = `translate(${s.translateX}px, ${s.translateY}px) scale(${s.scale})`;
    } else {
      s.img.style.transform = 'translate(0, 0) scale(1)';
    }
  },

  openLightbox(src) {
    this.lb.img.src = src;
    this.lb.el.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  bindEvents() {
    document.querySelectorAll('.theme-toggle, .theme-toggle-mobile').forEach(btn => {
      btn.addEventListener('click', () => this.toggleTheme());
    });

    document.querySelectorAll('.lang-switch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target.closest('[data-lang]');
        if (target) {
          const selectedLang = target.getAttribute('data-lang');
          if (selectedLang !== window.i18n.currentLang) {
            window.i18n.switch(selectedLang);
          }
        }
      });
    });

    const burgerBtn = document.getElementById('burger-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (burgerBtn && mobileNav) {
      burgerBtn.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('active');
        burgerBtn.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
    }

    // Close mobile nav on link click
    document.querySelectorAll('.mobile-nav-list a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        burgerBtn.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  },

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  },

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    document.querySelectorAll('.theme-icon-img').forEach(img => {
      img.src = this.theme === 'light' ? 'assets/icons/dark theme icon.svg' : 'assets/icons/light theme icon.svg';
    });
  },

  async loadGallery() {
    try {
      const response = await fetch('data/works.json');
      if (!response.ok) throw new Error('Fetch failed');
      this.works = this.filterCatalogWorks(await response.json());
      this.renderGallery();
    } catch (error) {
      console.error('Error loading works:', error);
    }
  },

  renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    const lang = window.i18n.currentLang;
    
    if (this.works.length === 0) {
      grid.innerHTML = '<p>No works found.</p>';
      return;
    }

    grid.innerHTML = this.works.map(work => {
      const sizeStr = work.size[lang].split(' (')[0];
      return `
        <div class="work-card fade-in" onclick="location.href='work.html?id=${work.id}'">
          <div class="work-image-wrapper">
            <img src="${work.image}" alt="${work.title[lang]}" loading="lazy">
          </div>
          <div class="work-info">
            <div class="work-title">${work.title[lang]}</div>
            <div class="work-meta">${sizeStr}, ${work.material[lang]}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  async loadWorkDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (!this.works.length) {
      const response = await fetch('data/works.json');
      this.works = this.filterCatalogWorks(await response.json());
    }
    
    const work = this.works.find(w => w.id === id);
    if (!work) {
      window.location.href = '404.html';
      return;
    }

    this.renderWorkDetail(work);
  },

  renderWorkDetail(work) {
    const detailContainer = document.getElementById('work-content');
    if (!detailContainer) return;

    const lang = window.i18n.currentLang;
    const workIndex = this.works.findIndex(w => w.id === work.id);
    const prevWork = workIndex > 0 ? this.works[workIndex - 1] : null;
    const nextWork = workIndex < this.works.length - 1 ? this.works[workIndex + 1] : null;

    const tgText = encodeURIComponent(`${window.i18n.t('contact_tg_text')} "${work.title[lang]}"`);
    const tgLink = `https://t.me/Ilviran?text=${tgText}`;

    const emailSubject = encodeURIComponent(`${window.i18n.t('contact_email_subject')} "${work.title[lang]}"`);
    const emailBody = encodeURIComponent(`${window.i18n.t('contact_tg_text')} "${work.title[lang]}".\n${window.i18n.t('contact_email_link_text')}: ${window.location.href}`);
    const mailtoLink = `mailto:ilviranasreddinova@gmail.com?subject=${emailSubject}&body=${emailBody}`;

    detailContainer.innerHTML = `
      <div class="work-detail-container fade-in">
        <a href="index.html" class="back-link" data-i18n="back_to_gallery">${window.i18n.t('back_to_gallery')}</a>
        
        <div class="work-detail-grid">
          <div class="work-image">
            <img src="${work.image}" alt="${work.title[lang]}" id="lightbox-trigger">
          </div>
          
          <div class="work-sidebar-info">
            <h1 class="work-detail-title">${work.title[lang]}</h1>
            
            <div class="work-detail-meta">
              ${work.material[lang]}<br>
              ${work.size[lang]}<br>
              ${work.description[lang]}
            </div>
            
            <div class="work-detail-price">${work.price}</div>
            
            <div class="work-contact">
              <div>
                <span data-i18n="contact_tg_label">${window.i18n.t('contact_tg_label')}</span>
                <a href="${tgLink}" target="_blank">@IlviraN</a>
              </div>
              <div>
                <span data-i18n="contact_email_label">${window.i18n.t('contact_email_label')}</span>
                <a href="${mailtoLink}" target="_blank">ilviranasreddinova@gmail.com</a>
              </div>
            </div>
            
            <div class="work-nav">
              <button class="btn-icon btn-nav" id="prev-work" ${!prevWork ? 'disabled style="opacity: 0.3; cursor: default;"' : ''}>
                <img src="assets/icons/arrow left icon.svg" alt="Previous">
              </button>
              <button class="btn-icon btn-nav" id="next-work" ${!nextWork ? 'disabled style="opacity: 0.3; cursor: default;"' : ''}>
                <img src="assets/icons/arrow right icon.svg" alt="Next">
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event Listeners for Nav
    if (prevWork) {
      document.getElementById('prev-work').onclick = () => {
        history.pushState(null, '', `work.html?id=${prevWork.id}`);
        this.renderWorkDetail(prevWork);
      };
    }
    if (nextWork) {
      document.getElementById('next-work').onclick = () => {
        history.pushState(null, '', `work.html?id=${nextWork.id}`);
        this.renderWorkDetail(nextWork);
      };
    }

    // Keyboard Nav
    const handleKeydown = (e) => {
      if (e.key === 'ArrowLeft' && prevWork) {
        document.getElementById('prev-work').click();
      } else if (e.key === 'ArrowRight' && nextWork) {
        document.getElementById('next-work').click();
      }
    };
    
    // Remove old listener if it exists (using a named function on window would be better but this is fine for now)
    window.removeEventListener('keydown', window._workNavHandler);
    window._workNavHandler = handleKeydown;
    window.addEventListener('keydown', window._workNavHandler);

    // Re-bind lightbox
    const trigger = document.getElementById('lightbox-trigger');
    if (trigger) {
      trigger.onclick = () => this.openLightbox(work.image);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
