/**
 * PIRTONDI Landing Page JavaScript
 * Modular HTML Partials Loader & Interactive Handlers
 */

// --- 1. Async Modular HTML Loader ---
async function loadModularSections() {
  const includeElements = Array.from(document.querySelectorAll('[data-include]'));
  
  if (includeElements.length === 0) {
    initComponents();
    return;
  }

  const loadPromises = includeElements.map(async (element) => {
    const filePath = element.getAttribute('data-include');
    if (!filePath) return;

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} saat memuat ${filePath}`);
      }
      const htmlContent = await response.text();
      
      // Parse HTML to support elements properly
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      const parent = element.parentNode;
      while (tempDiv.firstChild) {
        parent.insertBefore(tempDiv.firstChild, element);
      }
      parent.removeChild(element);
    } catch (error) {
      console.warn(`[Module Loader] Catatan: Modul ${filePath} tidak dapat dimuat melalui fetch (${error.message}). Pastikan menggunakan local server (Live Server) atau web server.`);
    }
  });

  await Promise.all(loadPromises);
  initComponents();
}

// --- 2. Initialize Interactive Components ---
function initComponents() {
  const siteHeader = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const faqItems = document.querySelectorAll('.faq-item');
  const ctaLinks = document.querySelectorAll('.cta-tracking');
  const brandLogo = document.getElementById('nav-brand-logo');
  const intenLink = document.getElementById('topbar-inten-link');
  const footerIntenLink = document.getElementById('footer-main-link');

  // --- Mobile Menu Drawer Toggle ---
  if (menuToggle && mobileDrawer) {
    const toggleMenu = (forceClose = false) => {
      const isOpen = forceClose ? false : !mobileDrawer.classList.contains('is-open');
      
      if (isOpen) {
        mobileDrawer.classList.add('is-open');
        menuToggle.classList.add('is-active');
        menuToggle.setAttribute('aria-expanded', 'true');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      } else {
        mobileDrawer.classList.remove('is-open');
        menuToggle.classList.remove('is-active');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    };

    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close mobile drawer when clicking any nav link
    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', () => {
        toggleMenu(true);
      });
    });

    // Close when clicking outside drawer
    document.addEventListener('click', (e) => {
      if (
        mobileDrawer.classList.contains('is-open') &&
        !mobileDrawer.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        toggleMenu(true);
      }
    });

    // Close drawer on window resize above tablet
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 960 && mobileDrawer.classList.contains('is-open')) {
        toggleMenu(true);
      }
    });
  }

  // --- FAQ Accordion ---
  faqItems.forEach((item, index) => {
    const button = item.querySelector('.faq-question-btn');
    const panel = item.querySelector('.faq-answer-panel');

    if (button && panel) {
      button.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close other FAQs for cleaner reading on mobile
        faqItems.forEach((otherItem) => {
          if (otherItem !== item && otherItem.classList.contains('is-open')) {
            otherItem.classList.remove('is-open');
            const otherBtn = otherItem.querySelector('.faq-question-btn');
            const otherPanel = otherItem.querySelector('.faq-answer-panel');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherPanel) otherPanel.style.maxHeight = null;
          }
        });

        // Toggle current FAQ
        if (isOpen) {
          item.classList.remove('is-open');
          button.setAttribute('aria-expanded', 'false');
          panel.style.maxHeight = null;
        } else {
          item.classList.add('is-open');
          button.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 32 + 'px';
          
          // Track FAQ open event
          trackEvent('faq_open', { question_index: index + 1, question_text: button.textContent.trim() });
        }
      });
    }
  });

  // --- Sticky Header Shadow on Scroll ---
  if (siteHeader) {
    const handleScrollHeader = () => {
      if (window.scrollY > 20) {
        siteHeader.classList.add('is-scrolled');
      } else {
        siteHeader.classList.remove('is-scrolled');
      }
    };

    window.addEventListener('scroll', handleScrollHeader, { passive: true });
    handleScrollHeader();
  }

  // --- Prestasi Infographic Modal / Lightbox ---
  const prestasiModal = document.getElementById('prestasi-modal');
  const prestasiModalImg = document.getElementById('prestasi-modal-img');
  const prestasiModalTitle = document.getElementById('prestasi-modal-title');
  const prestasiModalClose = document.getElementById('prestasi-modal-close');
  const prestasiCards = document.querySelectorAll('.prestasi-card');

  if (prestasiModal && prestasiModalImg && prestasiModalClose) {
    const openPrestasiModal = (imgSrc, title) => {
      prestasiModalImg.src = imgSrc;
      prestasiModalImg.alt = title || 'Infografis Prestasi Prosus INTEN';
      if (prestasiModalTitle && title) {
        prestasiModalTitle.textContent = title;
      }
      prestasiModal.classList.add('is-active');
      prestasiModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      prestasiModalClose.focus();
      trackEvent('view_infografis_prestasi', { title: title, file: imgSrc });
    };

    const closePrestasiModal = () => {
      prestasiModal.classList.remove('is-active');
      prestasiModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    prestasiCards.forEach((card) => {
      const fullImg = card.getAttribute('data-full-img');
      const title = card.getAttribute('data-title');

      if (fullImg) {
        card.addEventListener('click', () => {
          openPrestasiModal(fullImg, title);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPrestasiModal(fullImg, title);
          }
        });
      }
    });

    prestasiModalClose.addEventListener('click', () => {
      closePrestasiModal();
    });

    prestasiModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('prestasi-modal-backdrop') || e.target === prestasiModal) {
        closePrestasiModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && prestasiModal.classList.contains('is-active')) {
        closePrestasiModal();
      }
    });
  }

  // --- Analytics & Event Tracking (PRD Section 25) ---
  function trackEvent(eventName, data = {}) {
    const eventPayload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    if (window.dataLayer) {
      window.dataLayer.push(eventPayload);
    }
    console.log('[Analytics Event]:', eventName, eventPayload);
  }

  // Initial page view event
  trackEvent('page_view', { page: 'landing_page_pirtondi_kelas_11' });

  // CTA Clicks Tracking
  ctaLinks.forEach((cta) => {
    cta.addEventListener('click', () => {
      const buttonId = cta.id || 'cta_button';
      trackEvent('click_daftar_sekarang', { button_id: buttonId, target_url: cta.href });
    });
  });

  // Logo Clicks Tracking
  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      trackEvent('click_logo', { logo: 'header_brand_logo' });
    });
  }

  // Prosus INTEN External Link Tracking
  if (intenLink) {
    intenLink.addEventListener('click', () => {
      trackEvent('click_website_prosus_inten', { placement: 'topbar' });
    });
  }

  if (footerIntenLink) {
    footerIntenLink.addEventListener('click', () => {
      trackEvent('click_website_prosus_inten', { placement: 'footer' });
    });
  }

  // Scroll Depth Tracking (50% and 90%)
  let tracked50 = false;
  let tracked90 = false;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;

    const scrollPercent = (window.scrollY / totalHeight) * 100;

    if (scrollPercent >= 50 && !tracked50) {
      tracked50 = true;
      trackEvent('scroll_50_percent', { scrollPercent: Math.round(scrollPercent) });
    }

    if (scrollPercent >= 90 && !tracked90) {
      tracked90 = true;
      trackEvent('scroll_90_percent', { scrollPercent: Math.round(scrollPercent) });
    }
  }, { passive: true });
}

// Start loading modular sections on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadModularSections);
} else {
  loadModularSections();
}
