/* ============================================================
   ECOLITH ENERGY — ADMIN DASHBOARD JAVASCRIPT
   Vanilla JavaScript · Production Full-Stack SPA Client
   ============================================================ */

(function () {
  'use strict';

  const API_BASE_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:5000'
    : 'https://api.ecolithenergy.com';

  function resolveMediaUrl(url) {
    if (!url) return '';
    if (url.startsWith('/uploads/')) return `${API_BASE_URL}${url}`;
    return url;
  }

  let currentAdmin = null;
  let currentSection = 'dashboard';
  let csrfToken = null;

  // Pagination states
  const paginationState = {
    products: { page: 1, limit: 10, total: 0 },
    inquiries: { page: 1, limit: 10, total: 0 },
    audit: { page: 1, limit: 20, total: 0 }
  };

  // Helper to extract CSRF token from cookie
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  async function safeJsonParse(response) {
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  }

  // Universal fetch wrapper with CSRF & session handling
  async function apiFetch(endpoint, options = {}) {
    options.headers = options.headers || {};
    options.credentials = 'include';

    // Retrieve CSRF token
    const token = getCookie('XSRF-TOKEN') || csrfToken;
    if (token) {
      options.headers['x-csrf-token'] = token;
    }

    if (!(options.body instanceof FormData) && options.body && typeof options.body === 'object') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    try {
      const res = await fetch(new URL(endpoint, API_BASE_URL), options);
      csrfToken = res.headers.get('X-CSRF-Token') || csrfToken;
      if (res.status === 401 && !endpoint.includes('/auth/login')) {
        handleUnauthorized();
        throw new Error('Session expired. Please log in.');
      }
      const data = await safeJsonParse(res);
      if (!res.ok && !data) {
        throw new Error('Server returned an invalid response.');
      }
      if (!res.ok) {
        throw new Error(data.message || 'Server error');
      }
      return data || {};
    } catch (err) {
      throw err;
    }
  }

  // Toast Notification
  function showToast(message, isError = false) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.innerHTML = `<span>${isError ? '⚠️' : '✓'}</span> <div>${escapeHtml(message)}</div>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Modal helpers
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  // Delete Confirmation Modal Helper
  let confirmCallback = null;
  function showConfirm(message, callback) {
    const msgEl = document.getElementById('confirmMessage');
    if (msgEl) msgEl.textContent = message;
    confirmCallback = callback;
    openModal('modalConfirm');
  }

  document.getElementById('btnConfirmAccept')?.addEventListener('click', () => {
    if (confirmCallback) {
      confirmCallback();
      confirmCallback = null;
    }
    closeModal('modalConfirm');
  });

  // Attach modal close buttons
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      if (modalId) closeModal(modalId);
      else {
        btn.closest('.modal-overlay')?.classList.remove('open');
      }
    });
  });

  /* ============================================================
     1. AUTHENTICATION & SESSION
     ============================================================ */
  const loginView = document.getElementById('loginView');
  const appLayout = document.getElementById('appLayout');
  const loginForm = document.getElementById('loginForm');
  const loginAlert = document.getElementById('loginAlert');
  const btnLogin = document.getElementById('btnLogin');
  const btnLogout = document.getElementById('btnLogout');
  const togglePassword = document.getElementById('togglePassword');

  togglePassword?.addEventListener('click', () => {
    const pwd = document.getElementById('loginPassword');
    if (pwd.type === 'password') {
      pwd.type = 'text';
      togglePassword.textContent = 'Hide';
    } else {
      pwd.type = 'password';
      togglePassword.textContent = 'Show';
    }
  });

  function handleUnauthorized() {
    currentAdmin = null;
    if (loginView) loginView.style.display = 'flex';
    if (appLayout) appLayout.style.display = 'none';
  }

  async function checkAuth() {
    try {
      const res = await apiFetch('/api/admin/auth/me');
      if (res && res.data && res.data.admin) {
        currentAdmin = res.data.admin;
        setupAuthenticatedUI();
      } else {
        handleUnauthorized();
      }
    } catch (err) {
      handleUnauthorized();
    }
  }

  function setupAuthenticatedUI() {
    if (loginView) loginView.style.display = 'none';
    if (appLayout) appLayout.style.display = 'flex';

    // Update staff profile in sidebar
    const nameEl = document.getElementById('currentAdminName');
    const roleEl = document.getElementById('currentAdminRole');
    if (nameEl) nameEl.textContent = currentAdmin.name;
    if (roleEl) roleEl.textContent = currentAdmin.role;

    // RBAC: Toggle tab visibility
    const navAdmins = document.getElementById('navAdmins');
    const navAudit = document.getElementById('navAudit');
    if (navAdmins) navAdmins.style.display = currentAdmin.role === 'SUPER_ADMIN' ? 'flex' : 'none';
    if (navAudit) navAudit.style.display = (currentAdmin.role === 'SUPER_ADMIN' || currentAdmin.role === 'ADMIN') ? 'flex' : 'none';

    // Load initial dashboard
    navigateTo('dashboard');
  }

  // Handle Login
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginAlert.style.display = 'none';
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<span>Verifying credentials...</span>';

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await apiFetch('/api/admin/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      currentAdmin = res.data.admin;
      loginForm.reset();
      showToast('Welcome back, ' + currentAdmin.name);
      setupAuthenticatedUI();
    } catch (err) {
      loginAlert.textContent = err.message || 'Invalid email or password.';
      loginAlert.style.display = 'block';
    } finally {
      btnLogin.disabled = false;
      btnLogin.innerHTML = '<span>Sign In to Dashboard</span>';
    }
  });

  // Handle Logout
  btnLogout?.addEventListener('click', async () => {
    try {
      await apiFetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (e) {}
    showToast('Logged out successfully.');
    handleUnauthorized();
  });

  /* ============================================================
     2. NAVIGATION & TABS
     ============================================================ */
  window.navigateTo = function (section) {
    currentSection = section;

    // Update sidebar active link
    document.querySelectorAll('.sidebar-nav .nav-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.section === section);
    });

    // Close mobile drawer if open
    document.getElementById('sidebar')?.classList.remove('open');

    // Update page title
    const titles = {
      dashboard: 'Dashboard Overview',
      products: 'Battery Products Management',
      inquiries: 'Customer Enquiries',
      reviews: 'Customer Reviews Management',
      gallery: 'Facility Photographs',
      settings: 'Site Settings & Branding',
      admins: 'Staff Administration',
      audit: 'Action Audit Logs'
    };
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = titles[section] || 'Dashboard';

    // Show selected section, hide others
    document.querySelectorAll('.content-section').forEach((sec) => {
      sec.style.display = sec.id === `section-${section}` ? 'block' : 'none';
    });

    // Load section data
    switch (section) {
      case 'dashboard': loadDashboard(); break;
      case 'products': loadProducts(); break;
      case 'inquiries': loadInquiries(); break;
      case 'reviews': loadReviews(); break;
      case 'gallery': loadGallery(); break;
      case 'settings': loadSettings(); break;
      case 'admins': loadAdmins(); break;
      case 'audit': loadAuditLogs(); break;
    }
  };

  document.querySelectorAll('.sidebar-nav .nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (item.dataset.section) navigateTo(item.dataset.section);
    });
  });

  // Mobile menu toggles
  document.getElementById('openSidebar')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.add('open');
  });
  document.getElementById('closeSidebar')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
  });

  /* ============================================================
     3. DASHBOARD METRICS
     ============================================================ */
  async function loadDashboard() {
    try {
      const res = await apiFetch('/api/admin/dashboard');
      const d = res.data;

      document.getElementById('statTotalProducts').textContent = d.totalProducts;
      document.getElementById('statPublishedProducts').textContent = d.publishedProducts;
      document.getElementById('statNewInquiries').textContent = d.newInquiries;
      document.getElementById('statTotalInquiries').textContent = d.totalInquiries;
      document.getElementById('statTotalReviews').textContent = d.totalReviews;
      document.getElementById('statGalleryImages').textContent = d.galleryImages;

      // Render recent enquiries
      const tbody = document.querySelector('#tblRecentInquiries tbody');
      if (tbody) {
        if (!d.recentInquiries || d.recentInquiries.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No enquiries yet.</td></tr>';
        } else {
          tbody.innerHTML = d.recentInquiries.map((inq) => `
            <tr>
              <td>${new Date(inq.createdAt).toLocaleDateString()}</td>
              <td><b>${escapeHtml(inq.name)}</b></td>
              <td>${escapeHtml(inq.phone)}</td>
              <td>${escapeHtml(inq.requirement)}</td>
              <td>${getStatusBadge(inq.status)}</td>
              <td><button class="btn btn-outline btn-sm" data-action="view-inquiry" data-id="${escapeHtml(inq._id)}">View</button></td>
            </tr>
          `).join('');
        }
      }
    } catch (err) {
      showToast('Failed to load dashboard statistics', true);
    }
  }

  function getStatusBadge(status) {
    const map = {
      NEW: 'badge-green',
      CONTACTED: 'badge-blue',
      IN_PROGRESS: 'badge-yellow',
      CONVERTED: 'badge-green',
      CLOSED: 'badge-gray',
      SPAM: 'badge-red'
    };
    return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
  }

  // Quick Action Buttons
  document.getElementById('btnQuickAddProduct')?.addEventListener('click', () => openProductModal());
  document.getElementById('btnQuickUploadImage')?.addEventListener('click', () => openGalleryModal());
  document.getElementById('btnQuickViewInquiries')?.addEventListener('click', () => navigateTo('inquiries'));
  document.getElementById('btnViewAllInquiries')?.addEventListener('click', () => navigateTo('inquiries'));

  /* ============================================================
     4. PRODUCTS MANAGEMENT
     ============================================================ */
  const tblProductsBody = document.querySelector('#tblProducts tbody');
  const searchProducts = document.getElementById('searchProducts');
  const filterProductCategory = document.getElementById('filterProductCategory');
  const btnAddProduct = document.getElementById('btnAddProduct');
  const formProduct = document.getElementById('formProduct');
  const fileProdImage = document.getElementById('fileProdImage');
  const prodImageInput = document.getElementById('prodImage');
  const previewProdImageBox = document.getElementById('previewProdImageBox');

  async function loadProducts() {
    const { page, limit } = paginationState.products;
    const cat = filterProductCategory ? filterProductCategory.value : 'ALL';
    const q = searchProducts ? searchProducts.value.trim() : '';

    try {
      const res = await apiFetch(`/api/admin/products?page=${page}&limit=${limit}&category=${cat}&search=${encodeURIComponent(q)}`);
      const { data, pagination } = res;
      paginationState.products.total = pagination.total;

      document.getElementById('pageInfoProducts').textContent =
        `Showing ${data.length} of ${pagination.total} products (Page ${pagination.page} of ${pagination.pages})`;

      if (data.length === 0) {
        tblProductsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No products found.</td></tr>';
        return;
      }

      tblProductsBody.innerHTML = data.map((p) => `
        <tr>
          <td><img src="${escapeHtml(resolveMediaUrl(p.image))}" alt="${escapeHtml(p.name)}" class="table-thumb" /></td>
          <td><b>${escapeHtml(p.name)}</b><br/><small style="color:var(--text-dim)">${p.slug}</small></td>
          <td><span class="badge ${p.category === 'LFP' ? 'badge-green' : 'badge-blue'}">${p.category}</span></td>
          <td>${escapeHtml(p.voltage)}</td>
          <td>${escapeHtml(p.capacity)}</td>
          <td>
            <button class="btn btn-outline btn-sm" data-action="toggle-product" data-id="${escapeHtml(p._id)}">
              ${p.isPublished ? '🟢 Live' : '⚪ Draft'}
            </button>
          </td>
          <td>
            <button class="btn btn-outline btn-sm" data-action="edit-product" data-id="${escapeHtml(p._id)}">Edit</button>
            <button class="btn btn-danger btn-sm" data-action="delete-product" data-id="${escapeHtml(p._id)}" data-name="${escapeHtml(p.name)}">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      showToast('Error loading products', true);
    }
  }

  searchProducts?.addEventListener('input', () => {
    paginationState.products.page = 1;
    loadProducts();
  });
  filterProductCategory?.addEventListener('change', () => {
    paginationState.products.page = 1;
    loadProducts();
  });

  document.getElementById('btnPrevProducts')?.addEventListener('click', () => {
    if (paginationState.products.page > 1) {
      paginationState.products.page -= 1;
      loadProducts();
    }
  });
  document.getElementById('btnNextProducts')?.addEventListener('click', () => {
    const maxPage = Math.ceil(paginationState.products.total / paginationState.products.limit) || 1;
    if (paginationState.products.page < maxPage) {
      paginationState.products.page += 1;
      loadProducts();
    }
  });

  function openProductModal(prod = null) {
    formProduct.reset();
    document.getElementById('prodId').value = prod ? prod._id : '';
    document.getElementById('modalProductTitle').textContent = prod ? 'Edit Battery Product' : 'Add New Battery Product';

    if (prod) {
      document.getElementById('prodName').value = prod.name || '';
      document.getElementById('prodSlug').value = prod.slug || '';
      document.getElementById('prodCategory').value = prod.category || 'LFP';
      document.getElementById('prodTechnology').value = prod.technology || '';
      document.getElementById('prodVoltage').value = prod.voltage || '';
      document.getElementById('prodCapacity').value = prod.capacity || '';
      document.getElementById('prodEnergy').value = prod.energy || '';
      document.getElementById('prodType').value = prod.type || 'Light Weight Battery';
      document.getElementById('prodImage').value = prod.image || '';
      document.getElementById('prodDescription').value = prod.description || '';
      document.getElementById('prodFeatures').value = (prod.features || []).join('\n');
      document.getElementById('prodApplications').value = (prod.applications || []).join('\n');
      document.getElementById('prodWarranty').value = prod.warranty || 'Contact for Warranty Details';
      document.getElementById('prodSortOrder').value = prod.sortOrder || 0;
      document.getElementById('prodIsPublished').checked = prod.isPublished !== false;
      document.getElementById('prodIsFeatured').checked = !!prod.isFeatured;
      updatePreview(previewProdImageBox, resolveMediaUrl(prod.image));
    } else {
      updatePreview(previewProdImageBox, '');
    }

    openModal('modalProduct');
  }

  function updatePreview(container, url) {
    if (url) {
      container.innerHTML = `<img src="${url}" alt="Preview" />`;
    } else {
      container.innerHTML = '<span style="color:var(--text-dim);">No image selected</span>';
    }
  }

  prodImageInput?.addEventListener('input', () => {
    updatePreview(previewProdImageBox, prodImageInput.value.trim());
  });

  // Handle Product Image Upload
  fileProdImage?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);

    try {
      showToast('Uploading image...');
      const res = await apiFetch('/api/admin/upload', {
        method: 'POST',
        body: fd
      });
      prodImageInput.value = res.data.url;
      updatePreview(previewProdImageBox, res.data.url);
      showToast('Image uploaded successfully.');
    } catch (err) {
      showToast(err.message || 'Image upload failed.', true);
    }
  });

  btnAddProduct?.addEventListener('click', () => openProductModal());

  // Save Product Form
  formProduct?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const isEdit = !!id;

    const payload = {
      name: document.getElementById('prodName').value.trim(),
      slug: document.getElementById('prodSlug').value.trim() || undefined,
      category: document.getElementById('prodCategory').value,
      technology: document.getElementById('prodTechnology').value.trim(),
      voltage: document.getElementById('prodVoltage').value.trim(),
      capacity: document.getElementById('prodCapacity').value.trim(),
      energy: document.getElementById('prodEnergy').value.trim() || undefined,
      type: document.getElementById('prodType').value.trim() || 'Light Weight Battery',
      image: document.getElementById('prodImage').value.trim(),
      description: document.getElementById('prodDescription').value.trim(),
      features: document.getElementById('prodFeatures').value.split('\n').map(s => s.trim()).filter(Boolean),
      applications: document.getElementById('prodApplications').value.split('\n').map(s => s.trim()).filter(Boolean),
      warranty: document.getElementById('prodWarranty').value.trim(),
      sortOrder: parseInt(document.getElementById('prodSortOrder').value, 10) || 0,
      isPublished: document.getElementById('prodIsPublished').checked,
      isFeatured: document.getElementById('prodIsFeatured').checked
    };

    try {
      if (isEdit) {
        await apiFetch(`/api/admin/products/${id}`, { method: 'PUT', body: payload });
        showToast('Product updated successfully.');
      } else {
        await apiFetch('/api/admin/products', { method: 'POST', body: payload });
        showToast('Product added successfully.');
      }
      closeModal('modalProduct');
      loadProducts();
    } catch (err) {
      showToast(err.message || 'Failed to save product.', true);
    }
  });

  window.editProduct = async function (id) {
    try {
      const res = await apiFetch(`/api/admin/products/${id}`);
      openProductModal(res.data);
    } catch (err) {
      showToast('Failed to load product details.', true);
    }
  };

  window.toggleProductPublish = async function (id) {
    try {
      const res = await apiFetch(`/api/admin/products/${id}/toggle-publish`, { method: 'PATCH' });
      showToast(res.message);
      loadProducts();
    } catch (err) {
      showToast('Failed to update status.', true);
    }
  };

  window.deleteProduct = function (id, name) {
    showConfirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`, async () => {
      try {
        await apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        showToast('Product deleted.');
        loadProducts();
      } catch (err) {
        showToast(err.message || 'Failed to delete product.', true);
      }
    });
  };

  /* ============================================================
     5. ENQUIRIES MANAGEMENT
     ============================================================ */
  const tblInquiriesBody = document.querySelector('#tblInquiries tbody');
  const searchInquiries = document.getElementById('searchInquiries');
  const filterInquiryStatus = document.getElementById('filterInquiryStatus');
  const btnExportCsv = document.getElementById('btnExportCsv');

  async function loadInquiries() {
    const { page, limit } = paginationState.inquiries;
    const status = filterInquiryStatus ? filterInquiryStatus.value : 'ALL';
    const q = searchInquiries ? searchInquiries.value.trim() : '';

    try {
      const res = await apiFetch(`/api/admin/inquiries?page=${page}&limit=${limit}&status=${status}&search=${encodeURIComponent(q)}`);
      const { data, pagination } = res;
      paginationState.inquiries.total = pagination.total;

      document.getElementById('pageInfoInquiries').textContent =
        `Showing ${data.length} of ${pagination.total} enquiries (Page ${pagination.page} of ${pagination.pages})`;

      if (data.length === 0) {
        tblInquiriesBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No enquiries found.</td></tr>';
        return;
      }

      tblInquiriesBody.innerHTML = data.map((inq) => `
        <tr>
          <td>${new Date(inq.createdAt).toLocaleDateString()}</td>
          <td><b>${escapeHtml(inq.name)}</b></td>
          <td><a href="tel:${escapeHtml(inq.phone)}" style="color:var(--green)">${escapeHtml(inq.phone)}</a></td>
          <td>${escapeHtml(inq.company || '-')}</td>
          <td>${escapeHtml(inq.requirement)}</td>
          <td>${getStatusBadge(inq.status)}</td>
          <td>
            <button class="btn btn-outline btn-sm" data-action="view-inquiry" data-id="${escapeHtml(inq._id)}">View Details</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      showToast('Error loading enquiries', true);
    }
  }

  searchInquiries?.addEventListener('input', () => {
    paginationState.inquiries.page = 1;
    loadInquiries();
  });
  filterInquiryStatus?.addEventListener('change', () => {
    paginationState.inquiries.page = 1;
    loadInquiries();
  });

  document.getElementById('btnPrevInquiries')?.addEventListener('click', () => {
    if (paginationState.inquiries.page > 1) {
      paginationState.inquiries.page -= 1;
      loadInquiries();
    }
  });
  document.getElementById('btnNextInquiries')?.addEventListener('click', () => {
    const maxPage = Math.ceil(paginationState.inquiries.total / paginationState.inquiries.limit) || 1;
    if (paginationState.inquiries.page < maxPage) {
      paginationState.inquiries.page += 1;
      loadInquiries();
    }
  });

  btnExportCsv?.addEventListener('click', () => {
    window.location.href = `${API_BASE_URL}/api/admin/inquiries/export-csv`;
  });

  window.viewInquiry = async function (id) {
    try {
      const res = await apiFetch(`/api/admin/inquiries/${id}`);
      const inq = res.data;
      const body = document.getElementById('inquiryDetailBody');

      body.innerHTML = `
        <div style="margin-bottom: 1rem;">
          <h4 style="font-size:1.2rem; margin-bottom: 0.25rem;">${escapeHtml(inq.name)}</h4>
          <span style="color:var(--text-dim); font-size: 0.85rem;">Received: ${new Date(inq.createdAt).toLocaleString()}</span>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="changeInqStatus" class="form-control" data-action="update-inquiry-status" data-id="${escapeHtml(inq._id)}">
            ${['NEW', 'CONTACTED', 'IN_PROGRESS', 'CONVERTED', 'CLOSED', 'SPAM'].map(s => `
              <option value="${s}" ${inq.status === s ? 'selected' : ''}>${s}</option>
            `).join('')}
          </select>
        </div>
        <div style="background:var(--dark-card); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1rem; font-size:0.9rem;">
          <p><b>Phone:</b> <a href="tel:${escapeHtml(inq.phone)}" style="color:var(--green)">${escapeHtml(inq.phone)}</a></p>
          <p><b>Email:</b> ${escapeHtml(inq.email || 'None')}</p>
          <p><b>Company:</b> ${escapeHtml(inq.company || 'Individual')}</p>
          <p><b>Requirement:</b> ${escapeHtml(inq.requirement)}</p>
          <p style="margin-top:0.5rem; border-top:1px solid var(--dark-border); padding-top:0.5rem;">
            <b>Customer Message:</b><br/>${escapeHtml(inq.message || 'No additional message.')}
          </p>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <a href="tel:${encodeURIComponent(inq.phone)}" class="btn btn-outline btn-sm">📞 Call Customer</a>
          <a href="https://wa.me/${inq.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hello ' + inq.name + ', this is EcoLith Energy regarding your enquiry.')}" target="_blank" class="btn btn-primary btn-sm">💬 WhatsApp</a>
          ${inq.email ? `<a href="mailto:${inq.email}" class="btn btn-outline btn-sm">✉️ Email</a>` : ''}
        </div>
      `;

      document.getElementById('btnDeleteInquiry').onclick = () => {
        showConfirm(`Delete enquiry from ${inq.name}?`, async () => {
          await apiFetch(`/api/admin/inquiries/${inq._id}`, { method: 'DELETE' });
          closeModal('modalInquiry');
          showToast('Enquiry deleted.');
          loadInquiries();
        });
      };

      openModal('modalInquiry');
    } catch (err) {
      showToast('Failed to load enquiry details', true);
    }
  };

  window.updateInquiryStatusAction = async function (id, status) {
    try {
      await apiFetch(`/api/admin/inquiries/${id}/status`, {
        method: 'PUT',
        body: { status }
      });
      showToast(`Status updated to ${status}`);
      loadInquiries();
    } catch (err) {
      showToast('Failed to update status', true);
    }
  };

  /* ============================================================
     6. REVIEWS MANAGEMENT
     ============================================================ */
  const tblReviewsBody = document.querySelector('#tblReviews tbody');
  const btnAddReview = document.getElementById('btnAddReview');
  const formReview = document.getElementById('formReview');

  async function loadReviews() {
    try {
      const res = await apiFetch('/api/admin/reviews');
      const data = res.data;

      if (!data || data.length === 0) {
        tblReviewsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No reviews found.</td></tr>';
        return;
      }

      tblReviewsBody.innerHTML = data.map((r) => `
        <tr>
          <td><b>${escapeHtml(r.name)}</b></td>
          <td><span style="color:var(--green)">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></td>
          <td style="max-width:300px;">"${escapeHtml(r.review)}"</td>
          <td>${escapeHtml(r.source)}</td>
          <td>${r.isPublished ? '🟢 Live' : '⚪ Hidden'}</td>
          <td>
            <button class="btn btn-outline btn-sm" data-action="edit-review" data-id="${escapeHtml(r._id)}">Edit</button>
            <button class="btn btn-danger btn-sm" data-action="delete-review" data-id="${escapeHtml(r._id)}">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      showToast('Error loading reviews', true);
    }
  }

  btnAddReview?.addEventListener('click', () => {
    formReview.reset();
    document.getElementById('revId').value = '';
    document.getElementById('modalReviewTitle').textContent = 'Add Customer Review';
    openModal('modalReview');
  });

  formReview?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('revId').value;
    const payload = {
      name: document.getElementById('revName').value.trim(),
      rating: parseInt(document.getElementById('revRating').value, 10) || 5,
      review: document.getElementById('revReview').value.trim(),
      source: document.getElementById('revSource').value.trim() || 'Google Business Profile',
      isPublished: document.getElementById('revIsPublished').checked
    };

    try {
      if (id) {
        await apiFetch(`/api/admin/reviews/${id}`, { method: 'PUT', body: payload });
        showToast('Review updated.');
      } else {
        await apiFetch('/api/admin/reviews', { method: 'POST', body: payload });
        showToast('Review added.');
      }
      closeModal('modalReview');
      loadReviews();
    } catch (err) {
      showToast(err.message || 'Failed to save review.', true);
    }
  });

  window.editReview = async function (id) {
    try {
      const res = await apiFetch('/api/admin/reviews');
      const rev = (res.data || []).find(r => r._id === id);
      if (!rev) return;

      document.getElementById('revId').value = rev._id;
      document.getElementById('modalReviewTitle').textContent = 'Edit Review';
      document.getElementById('revName').value = rev.name;
      document.getElementById('revRating').value = rev.rating;
      document.getElementById('revReview').value = rev.review;
      document.getElementById('revSource').value = rev.source;
      document.getElementById('revIsPublished').checked = rev.isPublished !== false;

      openModal('modalReview');
    } catch (err) {
      showToast('Failed to load review', true);
    }
  };

  window.deleteReview = function (id) {
    showConfirm('Delete this customer review?', async () => {
      try {
        await apiFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
        showToast('Review deleted.');
        loadReviews();
      } catch (err) {
        showToast('Failed to delete review.', true);
      }
    });
  };

  /* ============================================================
     7. GALLERY MANAGEMENT
     ============================================================ */
  const tblGalleryBody = document.querySelector('#tblGallery tbody');
  const btnAddGallery = document.getElementById('btnAddGallery');
  const formGallery = document.getElementById('formGallery');
  const fileGalImage = document.getElementById('fileGalImage');
  const galImageInput = document.getElementById('galImage');
  const previewGalImageBox = document.getElementById('previewGalImageBox');

  async function loadGallery() {
    try {
      const res = await apiFetch('/api/admin/gallery');
      const data = res.data;

      if (!data || data.length === 0) {
        tblGalleryBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No gallery images found.</td></tr>';
        return;
      }

      tblGalleryBody.innerHTML = data.map((g) => `
        <tr>
          <td><img src="${escapeHtml(resolveMediaUrl(g.image))}" alt="${escapeHtml(g.title)}" class="table-thumb" /></td>
          <td><b>${escapeHtml(g.title)}</b><br/><small style="color:var(--text-dim)">${escapeHtml(g.description || '')}</small></td>
          <td><span class="badge badge-blue">${escapeHtml(g.category)}</span></td>
          <td>${g.sortOrder || 0}</td>
          <td>${g.isPublished ? '🟢 Live' : '⚪ Hidden'}</td>
          <td>
            <button class="btn btn-danger btn-sm" data-action="delete-gallery" data-id="${escapeHtml(g._id)}">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      showToast('Error loading gallery', true);
    }
  }

  function openGalleryModal() {
    formGallery.reset();
    document.getElementById('galId').value = '';
    updatePreview(previewGalImageBox, '');
    openModal('modalGallery');
  }

  btnAddGallery?.addEventListener('click', openGalleryModal);

  galImageInput?.addEventListener('input', () => {
    updatePreview(previewGalImageBox, galImageInput.value.trim());
  });

  fileGalImage?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);

    try {
      showToast('Uploading image...');
      const res = await apiFetch('/api/admin/upload', {
        method: 'POST',
        body: fd
      });
      galImageInput.value = res.data.url;
      updatePreview(previewGalImageBox, res.data.url);
      showToast('Image uploaded.');
    } catch (err) {
      showToast(err.message || 'Upload failed.', true);
    }
  });

  formGallery?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById('galTitle').value.trim(),
      category: document.getElementById('galCategory').value,
      image: document.getElementById('galImage').value.trim(),
      description: document.getElementById('galDescription').value.trim(),
      sortOrder: parseInt(document.getElementById('galSortOrder').value, 10) || 0,
      isPublished: true
    };

    try {
      await apiFetch('/api/admin/gallery', { method: 'POST', body: payload });
      showToast('Photograph added to gallery.');
      closeModal('modalGallery');
      loadGallery();
    } catch (err) {
      showToast(err.message || 'Failed to save photograph.', true);
    }
  });

  window.deleteGallery = function (id) {
    showConfirm('Delete this photograph from the gallery?', async () => {
      try {
        await apiFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
        showToast('Photograph deleted.');
        loadGallery();
      } catch (err) {
        showToast('Failed to delete image.', true);
      }
    });
  };

  /* ============================================================
     8. SITE SETTINGS
     ============================================================ */
  const settingsForm = document.getElementById('settingsForm');

  async function loadSettings() {
    try {
      const res = await apiFetch('/api/admin/settings');
      const s = res.data;

      document.getElementById('setCompanyName').value = s.companyName || '';
      document.getElementById('setTagline').value = s.tagline || '';
      document.getElementById('setPhone1').value = s.phone1 || '';
      document.getElementById('setPhone2').value = s.phone2 || '';
      document.getElementById('setEmail').value = s.email || '';
      document.getElementById('setWhatsapp').value = s.whatsappNumber || '';
      document.getElementById('setAddress').value = s.address || '';
      document.getElementById('setMapsUrl').value = s.googleMapsUrl || '';
      document.getElementById('setMapsEmbed').value = s.googleMapsEmbed || '';
      document.getElementById('setHeroTitle').value = s.heroTitle || '';
      document.getElementById('setHeroSubtitle').value = s.heroSubtitle || '';
      document.getElementById('setAboutText').value = s.aboutText || '';
      document.getElementById('setFooterText').value = s.footerText || '';
    } catch (err) {
      showToast('Failed to load settings', true);
    }
  }

  settingsForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      companyName: document.getElementById('setCompanyName').value.trim(),
      tagline: document.getElementById('setTagline').value.trim(),
      phone1: document.getElementById('setPhone1').value.trim(),
      phone2: document.getElementById('setPhone2').value.trim(),
      email: document.getElementById('setEmail').value.trim(),
      whatsappNumber: document.getElementById('setWhatsapp').value.trim(),
      address: document.getElementById('setAddress').value.trim(),
      googleMapsUrl: document.getElementById('setMapsUrl').value.trim(),
      googleMapsEmbed: document.getElementById('setMapsEmbed').value.trim(),
      heroTitle: document.getElementById('setHeroTitle').value.trim(),
      heroSubtitle: document.getElementById('setHeroSubtitle').value.trim(),
      aboutText: document.getElementById('setAboutText').value.trim(),
      footerText: document.getElementById('setFooterText').value.trim()
    };

    try {
      await apiFetch('/api/admin/settings', { method: 'PUT', body: payload });
      showToast('Company information and branding saved successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to update settings.', true);
    }
  });

  /* ============================================================
     9. STAFF USERS (SUPER_ADMIN ONLY)
     ============================================================ */
  const tblAdminsBody = document.querySelector('#tblAdmins tbody');
  const btnAddAdminUser = document.getElementById('btnAddAdminUser');
  const formAdminUser = document.getElementById('formAdminUser');

  async function loadAdmins() {
    try {
      const res = await apiFetch('/api/admin/users');
      const data = res.data;

      tblAdminsBody.innerHTML = data.map((adm) => `
        <tr>
          <td><b>${escapeHtml(adm.name)}</b></td>
          <td>${escapeHtml(adm.email)}</td>
          <td><span class="badge ${adm.role === 'SUPER_ADMIN' ? 'badge-red' : 'badge-green'}">${adm.role}</span></td>
          <td>${adm.isActive ? '🟢 Active' : '🔴 Inactive'}</td>
          <td>${adm.lastLoginAt ? new Date(adm.lastLoginAt).toLocaleString() : 'Never'}</td>
          <td>
            ${adm._id !== currentAdmin._id ? `
              <button class="btn btn-danger btn-sm" data-action="delete-admin" data-id="${escapeHtml(adm._id)}">Remove</button>
            ` : '<span style="color:var(--text-dim)">(You)</span>'}
          </td>
        </tr>
      `).join('');
    } catch (err) {
      showToast('Error loading staff accounts', true);
    }
  }

  btnAddAdminUser?.addEventListener('click', () => {
    formAdminUser.reset();
    openModal('modalAdminUser');
  });

  formAdminUser?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('admName').value.trim(),
      email: document.getElementById('admEmail').value.trim(),
      password: document.getElementById('admPassword').value,
      role: document.getElementById('admRole').value
    };

    try {
      await apiFetch('/api/admin/users', { method: 'POST', body: payload });
      showToast('Staff user created.');
      closeModal('modalAdminUser');
      loadAdmins();
    } catch (err) {
      showToast(err.message || 'Failed to create user.', true);
    }
  });

  window.deleteAdmin = function (id) {
    showConfirm('Delete this staff administrator?', async () => {
      try {
        await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        showToast('User deleted.');
        loadAdmins();
      } catch (err) {
        showToast('Failed to delete user.', true);
      }
    });
  };

  /* ============================================================
     10. AUDIT LOGS
     ============================================================ */
  const tblAuditLogsBody = document.querySelector('#tblAuditLogs tbody');
  const filterAuditAction = document.getElementById('filterAuditAction');

  async function loadAuditLogs() {
    const act = filterAuditAction ? filterAuditAction.value : 'ALL';
    try {
      const res = await apiFetch(`/api/admin/audit-logs?action=${act}`);
      const data = res.data;

      if (!data || data.length === 0) {
        tblAuditLogsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No audit records.</td></tr>';
        return;
      }

      tblAuditLogsBody.innerHTML = data.map((l) => `
        <tr>
          <td>${new Date(l.timestamp).toLocaleString()}</td>
          <td><b>${escapeHtml(l.adminName)}</b></td>
          <td><span class="badge badge-green">${escapeHtml(l.action)}</span></td>
          <td>${escapeHtml(l.resource)}</td>
          <td><small style="color:var(--text-dim)">${escapeHtml(l.resourceId || '-')}</small></td>
          <td><code>${escapeHtml(l.ipHash || '-')}</code></td>
        </tr>
      `).join('');
    } catch (err) {
      showToast('Error loading audit logs', true);
    }
  }

  filterAuditAction?.addEventListener('change', loadAuditLogs);

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const { action, id, name } = button.dataset;
    const actions = {
      'view-inquiry': () => window.viewInquiry(id),
      'toggle-product': () => window.toggleProductPublish(id),
      'edit-product': () => window.editProduct(id),
      'delete-product': () => window.deleteProduct(id, name),
      'edit-review': () => window.editReview(id),
      'delete-review': () => window.deleteReview(id),
      'delete-gallery': () => window.deleteGallery(id),
      'delete-admin': () => window.deleteAdmin(id)
    };
    actions[action]?.();
  });

  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-action="update-inquiry-status"]');
    if (select) window.updateInquiryStatusAction(select.dataset.id, select.value);
  });

  // Initialize Dashboard Application
  checkAuth();

})();
