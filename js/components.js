const Components = {
  sidebar: `
    <aside class="sidebar">
        <div class="sidebar-top">
            <a href="index.html" class="logo" data-i18n="artist_name_sidebar"></a>
            <nav class="sidebar-nav">
                <ul class="nav-list">
                    <li><a href="index.html" class="nav-link" data-i18n="nav_works">Works</a></li>
                    <li><a href="about.html" class="nav-link" data-i18n="nav_about">About</a></li>
                    <li><a href="statement.html" class="nav-link" data-i18n="nav_statement">Artist Statement</a></li>
                    <li><a href="contact.html" class="nav-link" data-i18n="nav_contact">Contact</a></li>
                </ul>
            </nav>
        </div>
        <div class="sidebar-footer">
            <div class="controls">
                <div class="lang-switch"><strong>RU</strong> / EN</div>
                <button class="btn-icon theme-toggle" aria-label="Toggle Theme">
                    <img src="assets/icons/dark theme icon.svg" class="theme-icon-img" alt="Theme Toggle">
                </button>
            </div>
        </div>
    </aside>
  `,

  mobileHeader: `
    <header class="mobile-header">
        <a href="index.html" class="logo" data-i18n="artist_name_sidebar"></a>
        <button class="burger-btn" id="burger-btn" aria-label="Toggle Menu">
            <span></span>
            <span></span>
        </button>
    </header>
    <div class="mobile-nav-overlay" id="mobile-nav">
        <nav class="mobile-nav-content">
            <ul class="mobile-nav-list">
                <li><a href="index.html" data-i18n="nav_works">Works</a></li>
                <li><a href="about.html" data-i18n="nav_about">About</a></li>
                <li><a href="statement.html" data-i18n="nav_statement">Artist Statement</a></li>
                <li><a href="contact.html" data-i18n="nav_contact">Contact</a></li>
            </ul>
            <div class="mobile-controls">
                <div class="lang-switch">RU / EN</div>
                <button class="theme-toggle-mobile" aria-label="Toggle Theme">
                    <img src="assets/icons/dark theme icon.svg" class="theme-icon-img" alt="Theme Toggle">
                </button>
            </div>
        </nav>
    </div>
  `,
  
  footer: `
    <footer class="footer-simple">
        <div data-i18n="footer_copyright">© Ilvira Nasreddinova</div>
    </footer>
  `
};

window.Components = Components;
