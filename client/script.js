/* ============================================================
   ECOLITH ENERGY — script.js
   Vanilla JavaScript · Production Full-Stack Connected Client
   ============================================================ */

(function () {
  'use strict';

  // Global cache for fetched dynamic products & settings
  let cachedProducts = [];
  let cachedSettings = null;

  /* ============================================================
     1. PRELOADER (battery 0 → 100)
     ============================================================ */
  const preloader       = document.getElementById('preloader');
  const batteryFill     = document.getElementById('batteryFill');
  const batteryPercent  = document.getElementById('batteryPercent');

  function runPreloader() {
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.floor(Math.random() * 8) + 3;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        setTimeout(() => {
          if (preloader) {
            preloader.classList.add('hide');
            setTimeout(() => preloader.remove(), 700);
          }
        }, 350);
      }
      if (batteryFill)    batteryFill.style.width = pct + '%';
      if (batteryPercent) batteryPercent.textContent = pct;
    }, 90);
  }

  window.addEventListener('load', runPreloader);
  // Safety fallback – always hide after 3.2s
  setTimeout(() => {
    if (preloader && !preloader.classList.contains('hide')) {
      preloader.classList.add('hide');
      setTimeout(() => preloader.remove(), 700);
    }
  }, 3200);

  /* ============================================================
     2. STICKY NAVBAR
     ============================================================ */
  const navbar = document.getElementById('navbar');

  function handleNavbar() {
    if (!navbar) return;
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else                     navbar.classList.remove('scrolled');
  }
  window.addEventListener('scroll', handleNavbar, { passive: true });
  handleNavbar();

  /* ============================================================
     3. MOBILE MENU
     ============================================================ */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    const mobileNavQuery = window.matchMedia('(max-width: 1200px)');

    function setMobileMenuOpen(isOpen, restoreFocus = false) {
      const mobileMenuOpen = mobileNavQuery.matches && isOpen;
      navMenu.classList.toggle('open', mobileMenuOpen);
      navMenu.setAttribute('aria-hidden', String(mobileNavQuery.matches && !mobileMenuOpen));
      hamburger.classList.toggle('open', mobileMenuOpen);
      hamburger.setAttribute('aria-expanded', String(mobileMenuOpen));
      hamburger.setAttribute('aria-label', mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu');
      document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';

      if (restoreFocus) hamburger.focus();
      else if (mobileMenuOpen) navMenu.querySelector('a')?.focus();
    }

    setMobileMenuOpen(false);

    hamburger.addEventListener('click', () => {
      setMobileMenuOpen(!navMenu.classList.contains('open'));
    });

    // Delegate so links added when authentication state loads also close the menu.
    navMenu.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a, button')) {
        setMobileMenuOpen(false);
      }
    });

    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navMenu.classList.contains('open')) {
        setMobileMenuOpen(false, true);
      }
    });

    mobileNavQuery.addEventListener('change', () => setMobileMenuOpen(false));
  }

  /* ============================================================
     4. SMOOTH SCROLL + ACTIVE LINK
     ============================================================ */
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = navbar ? navbar.offsetHeight : 0;
          const top = target.getBoundingClientRect().top + window.scrollY - offset + 1;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  // Active on scroll (IntersectionObserver)
  const sections = document.querySelectorAll('section[id]');
  const navObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((l) =>
            l.classList.toggle('active', l.getAttribute('href') === '#' + id)
          );
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((s) => navObs.observe(s));

  /* ============================================================
     5. SCROLL REVEAL OBSERVER
     ============================================================ */
  function initRevealObserver() {
    const revealEls = document.querySelectorAll('.reveal:not(.visible)');
    const revealObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  }
  initRevealObserver();

  /* ============================================================
     6. COUNTER ANIMATION
     ============================================================ */
  const counters = document.querySelectorAll('[data-count]');
  const countObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => countObs.observe(el));

  /* ============================================================
     7. PRODUCT MODAL
     ============================================================ */
  const modal      = document.getElementById('productModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody  = document.getElementById('modalBody');

  function openModal(productIdentifier) {
    // Find matching product in cachedProducts
    let product = cachedProducts.find(
      (p) => p.name === productIdentifier || p.slug === productIdentifier || p._id === productIdentifier
    );

    if (!product) {
      product = {
        name: productIdentifier,
        description: 'Dependable lithium battery solution engineered for electric mobility and energy applications.',
        features: ['Quality Tested', 'Real Manufacturing in Delhi', 'Thermal Stability']
      };
    }

    if (modalTitle) modalTitle.textContent = product.name;
    if (modalBody) {
      const specsHtml = (product.features && product.features.length)
        ? `<ul>${product.features.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>`
        : '';

      modalBody.innerHTML = `
        <p>${escapeHtml(product.description)}</p>
        ${specsHtml}
      `;
    }

    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (modal) {
    modal.querySelectorAll('[data-close]').forEach((el) =>
      el.addEventListener('click', closeModal)
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  /* ============================================================
     7A. DELAYED LOGIN / SIGNUP POPUP
     ============================================================ */
  const authPopup = document.getElementById('authPopup');
  if (authPopup) {
    const authPopupDelay = 5 * 1000;
    const showAuthPopup = () => {
      authPopup.classList.add('open');
      authPopup.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      authPopup.querySelector('a[href="/login"]')?.focus();
    };

    authPopup.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const links = authPopup.querySelectorAll('a[href="/login"], a[href="/signup"]');
      const firstLink = links[0];
      const lastLink = links[links.length - 1];

      if (event.shiftKey && document.activeElement === firstLink) {
        event.preventDefault();
        lastLink.focus();
      } else if (!event.shiftKey && document.activeElement === lastLink) {
        event.preventDefault();
        firstLink.focus();
      }
    });

    window.addEventListener('load', () => {
      window.setTimeout(() => {
        fetch('/api/auth/me', {
          credentials: 'include',
          headers: customerAuthHeaders()
        })
          .then((response) => response.ok ? response.json() : null)
          .then((payload) => {
            if ((!payload?.success || !payload.data?.user) && !navMenu?.classList.contains('open')) {
              showAuthPopup();
            }
          })
          .catch(() => {
            if (!navMenu?.classList.contains('open')) showAuthPopup();
          });
      }, authPopupDelay);
    }, { once: true });
  }

  /* ============================================================
     8. DYNAMIC PRODUCTS LOADING & FILTERING
     ============================================================ */
  const productGrid = document.getElementById('productGrid');
  const filterBtns  = document.querySelectorAll('.filter-btn');
  let currentFilter = 'all';

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        cachedProducts = json.data;
        renderProducts(cachedProducts);
      }
    } catch (err) {
      console.warn('Could not load products from API, preserving fallback markup.', err);
    }
  }

  function renderProducts(products) {
    if (!productGrid) return;

    productGrid.innerHTML = products.map((prod) => {
      const catLower = (prod.category || 'lfp').toLowerCase();
      const whatsappNumber = (cachedSettings && cachedSettings.whatsappNumber) || '8595581248';
      const waText = encodeURIComponent(`Hello EcoLith Energy, I want to enquire about the ${prod.name}.`);
      const waUrl = `https://wa.me/91${whatsappNumber}?text=${waText}`;

      return `
        <article class="product-card reveal visible" data-category="${catLower}">
          <div class="product-media">
            <img src="${escapeHtml(prod.image)}" alt="EcoLith Energy ${escapeHtml(prod.name)}" loading="lazy" />
            <span class="product-tag">${escapeHtml(prod.category)}</span>
          </div>
          <div class="product-body">
            <h3>${escapeHtml(prod.name)}</h3>
            <p class="product-lead">${escapeHtml(prod.shortDescription || prod.description)}</p>
            <ul class="spec-list">
              <li><span>Voltage</span><b>${escapeHtml(prod.voltage)}</b></li>
              <li><span>Capacity</span><b>${escapeHtml(prod.capacity)}</b></li>
              ${prod.energy ? `<li><span>Energy</span><b>${escapeHtml(prod.energy)}</b></li>` : ''}
              <li><span>Technology</span><b>${escapeHtml(prod.technology)}</b></li>
              <li><span>Type</span><b>${escapeHtml(prod.type || 'Light Weight Battery')}</b></li>
            </ul>
            <div class="product-cta">
              <button class="btn btn-outline btn-sm view-product" data-product="${escapeHtml(prod.name)}">View Product</button>
              <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Enquire Now</a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Re-attach modal trigger events to newly rendered buttons
    productGrid.querySelectorAll('.view-product').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.product));
    });

    applyFilter(currentFilter);
    initRevealObserver();
  }

  function applyFilter(filter) {
    currentFilter = filter;
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card) => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hide', !match);
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  // Attach modal trigger to initial static buttons
  document.querySelectorAll('.view-product').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.product));
  });

  /* ============================================================
     9. CUSTOMER NAVBAR STATE
     ============================================================ */
  const customerNavActions = document.getElementById('customerNavActions');
  const mobileCustomerNav = document.getElementById('mobileCustomerNav');

  function customerAuthHeaders() {
    const token = localStorage.getItem('customerAuthToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const csrfCookie = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('XSRF-TOKEN='));
    if (csrfCookie) {
      headers['X-CSRF-Token'] = decodeURIComponent(csrfCookie.slice('XSRF-TOKEN='.length));
    }
    return headers;
  }

  function renderGuestNavigation() {
    if (customerNavActions) {
      customerNavActions.innerHTML = `
        <a href="/login" class="btn btn-ghost btn-sm guest-link">Login</a>
        <a href="/signup" class="btn btn-primary btn-sm guest-link">Sign Up</a>
        <a href="https://wa.me/918595581248?text=Hello%20EcoLith%20Energy%2C%20I%20am%20interested%20in%20your%20lithium%20battery%20products." target="_blank" rel="noopener" class="btn btn-ghost btn-sm">WhatsApp</a>
        <a href="tel:+918595581248" class="btn btn-primary btn-sm">Call Now</a>
      `;
    }
    if (mobileCustomerNav) {
      mobileCustomerNav.innerHTML = `
        <a href="/login" class="nav-link">Login</a>
        <a href="/signup" class="nav-link">Sign Up</a>
      `;
    }
  }

  function renderAuthenticatedNavigation() {
    if (customerNavActions) {
      customerNavActions.replaceChildren();
      const logout = document.createElement('button');
      logout.className = 'btn btn-primary btn-sm';
      logout.type = 'button';
      logout.id = 'customerLogoutBtn';
      logout.textContent = 'Logout';
      customerNavActions.append(logout);
    }
    if (mobileCustomerNav) {
      mobileCustomerNav.replaceChildren();
      const logout = document.createElement('button');
      logout.className = 'nav-link';
      logout.type = 'button';
      logout.id = 'mobileCustomerLogoutBtn';
      logout.textContent = 'Logout';
      mobileCustomerNav.append(logout);
    }

    const logoutButtons = [
      document.getElementById('customerLogoutBtn'),
      document.getElementById('mobileCustomerLogoutBtn')
    ].filter(Boolean);
    logoutButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: customerAuthHeaders()
          });
        } finally {
          localStorage.removeItem('customerAuthToken');
          window.location.reload();
        }
      });
    });
  }

  async function updateCustomerNavbar() {
    if (!customerNavActions && !mobileCustomerNav) return;

    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: customerAuthHeaders()
      });
      const payload = await res.json();
      if (!payload.success || !payload.data?.user) {
        if (res.status === 401) localStorage.removeItem('customerAuthToken');
        renderGuestNavigation();
        return;
      }

      renderAuthenticatedNavigation();
    } catch (error) {
      renderGuestNavigation();
    }
  }

  updateCustomerNavbar();

  /* ============================================================
     10. DYNAMIC CUSTOMER REVIEWS
     ============================================================ */
  const reviewGrid = document.getElementById('reviewGrid');

  async function fetchReviews() {
    try {
      const res = await fetch('/api/reviews');
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        renderReviews(json.data);
      }
    } catch (err) {
      console.warn('Could not load reviews from API.', err);
    }
  }

  function renderReviews(reviews) {
    if (!reviewGrid) return;
    reviewGrid.innerHTML = reviews.map((r) => `
      <figure class="review-card reveal visible">
        <div class="stars">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</div>
        <blockquote>“${escapeHtml(r.review)}”</blockquote>
        <figcaption>— ${escapeHtml(r.name)}</figcaption>
      </figure>
    `).join('');
    initRevealObserver();
  }

  /* ============================================================
     10. DYNAMIC GALLERY (FACILITY PHOTOGRAPHS)
     ============================================================ */
  const facilityGallery = document.getElementById('facilityGallery');

  async function fetchGallery() {
    try {
      const res = await fetch('/api/gallery');
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        renderGallery(json.data);
      }
    } catch (err) {
      console.warn('Could not load gallery from API.', err);
    }
  }

  function renderGallery(items) {
    if (!facilityGallery) return;
    facilityGallery.innerHTML = items.map((item) => `
      <figure class="facility-item reveal visible">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)} at EcoLith Energy" loading="lazy" />
        <figcaption>${escapeHtml(item.title)}</figcaption>
      </figure>
    `).join('');
    initRevealObserver();
  }

  /* ============================================================
     11. DYNAMIC SITE SETTINGS & BRANDING
     ============================================================ */
  async function fetchSiteSettings() {
    try {
      const res = await fetch('/api/settings/public');
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        cachedSettings = json.data;
        applySiteSettings(cachedSettings);
      }
    } catch (err) {
      console.warn('Could not load site settings from API.', err);
    }
  }

  function applySiteSettings(s) {
    if (!s) return;

    // Contact Address
    const addrEl = document.getElementById('contactAddress');
    if (addrEl && s.address) {
      addrEl.innerHTML = escapeHtml(s.address).replace(/\n/g, '<br/>');
    }

    // Phone numbers
    const p1 = s.phone1 || '8595581248';
    const p2 = s.phone2 || '9315111248';
    document.querySelectorAll('.phone-link').forEach((el) => {
      el.textContent = p1;
      el.href = `tel:+91${p1}`;
    });
    document.querySelectorAll('.phone-link-2').forEach((el) => {
      el.textContent = p2;
      el.href = `tel:+91${p2}`;
    });
    document.querySelectorAll('.phone-btn').forEach((el) => {
      el.href = `tel:+91${p1}`;
    });

    // Email
    if (s.email) {
      document.querySelectorAll('.email-link').forEach((el) => {
        el.textContent = s.email;
        el.href = `mailto:${s.email}`;
      });
      document.querySelectorAll('.email-btn').forEach((el) => {
        el.href = `mailto:${s.email}`;
      });
    }

    // WhatsApp Number & Links
    const wa = s.whatsappNumber || '8595581248';
    const waUrl = `https://wa.me/91${wa}?text=${encodeURIComponent('Hello EcoLith Energy, I am interested in your lithium battery products.')}`;
    document.querySelectorAll('.whatsapp-btn').forEach((el) => {
      el.href = waUrl;
    });
    const floatWa = document.getElementById('floatingWhatsapp');
    if (floatWa) floatWa.href = waUrl;

    // Google Maps Iframe & Directions
    const addressQuery = encodeURIComponent(s.address || 'Ground Floor, Khasra Number 15, 24, Gali No. 5, near Shani Mandir, Samaipur, Swaroop Nagar Extension, Delhi, 110042');
    const mapsUrl = (url, fallback) => url && !url.includes('Samaipur+Swaroop+Nagar+Extension+Delhi+110042')
      ? url
      : fallback;
    const iframe = document.getElementById('mapIframe');
    if (iframe) {
      iframe.src = mapsUrl(s.googleMapsEmbed, `https://www.google.com/maps?q=${addressQuery}&output=embed`);
    }
    const dirLink = document.getElementById('mapDirectionsLink');
    if (dirLink) {
      dirLink.href = mapsUrl(s.googleMapsUrl, `https://www.google.com/maps/search/?api=1&query=${addressQuery}`);
    }
  }

  /* ============================================================
     12. CONTACT FORM SUBMISSION (FULL-STACK POST /api/inquiries)
     ============================================================ */
  const form        = document.getElementById('contactForm');
  const sendWA      = document.getElementById('sendWhatsApp');
  const toast       = document.getElementById('toast');

  function showToast(msg, isError) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.toggle('error', !!isError);
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  function getFormData() {
    if (!form) return null;
    const fd = new FormData(form);
    return {
      name:        (fd.get('name') || '').toString().trim(),
      phone:       (fd.get('phone') || '').toString().trim(),
      email:       (fd.get('email') || '').toString().trim(),
      company:     (fd.get('company') || '').toString().trim(),
      requirement: (fd.get('requirement') || '').toString().trim(),
      message:     (fd.get('message') || '').toString().trim()
    };
  }

  function validate(data) {
    const errors = [];
    if (!data.name || data.name.length < 2) errors.push('Please enter your full name.');
    if (!data.phone || !/^[0-9+\s-]{7,25}$/.test(data.phone)) errors.push('Please enter a valid phone number.');
    if (!data.requirement) errors.push('Please select a requirement.');
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Please enter a valid email address.');
    return errors;
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = getFormData();
      const errors = validate(data);

      form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));

      if (errors.length) {
        showToast(errors[0], true);
        if (!data.name) form.querySelector('[name="name"]')?.classList.add('error');
        else if (!data.phone) form.querySelector('[name="phone"]')?.classList.add('error');
        else if (!data.requirement) form.querySelector('[name="requirement"]')?.classList.add('error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : 'Send Enquiry';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }

      try {
        const res = await fetch('/api/inquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const json = await res.json();

        if (res.ok && json.success) {
          showToast('✓ Thank you. Your enquiry has been received.');
          form.reset();

          // Optionally open WhatsApp with prefilled message
          if (json.data && json.data.whatsappUrl) {
            setTimeout(() => {
              window.open(json.data.whatsappUrl, '_blank', 'noopener');
            }, 800);
          }
        } else {
          showToast(json.message || 'Failed to submit enquiry. Please try again.', true);
        }
      } catch (err) {
        showToast('Network error. You can also reach us directly on WhatsApp.', true);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }

  function sendToWhatsApp(data) {
    if (!data) data = getFormData() || {};
    const lines = [
      'Hello EcoLith Energy, I am interested in your lithium battery products.',
      '',
      'Name: '        + (data.name || '-'),
      'Phone: '       + (data.phone || '-'),
      'Email: '       + (data.email || '-'),
      'Company: '     + (data.company || '-'),
      'Requirement: ' + (data.requirement || '-'),
      'Message: '     + (data.message || '-')
    ];
    const wa = (cachedSettings && cachedSettings.whatsappNumber) || '8595581248';
    const url = `https://wa.me/91${wa}?text=` + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener');
  }

  if (sendWA) {
    sendWA.addEventListener('click', () => {
      const data = getFormData();
      const errors = validate(data);
      if (errors.length) {
        showToast(errors[0], true);
        return;
      }
      sendToWhatsApp(data);
    });
  }

  /* ============================================================
     13. BACK TO TOP
     ============================================================ */
  const backToTop = document.getElementById('backToTop');

  function handleBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle('show', window.scrollY > 500);
  }
  window.addEventListener('scroll', handleBackToTop, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     14. FOOTER YEAR UPDATE
     ============================================================ */
  const yearEl = document.querySelector('.footer-bottom p');
  if (yearEl) {
    yearEl.textContent = yearEl.textContent.replace(/\d{4}/, new Date().getFullYear());
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ============================================================
     15. INITIALIZE DATA FETCHING
     ============================================================ */
  fetchSiteSettings();
  fetchProducts();
  fetchReviews();
  fetchGallery();

})();