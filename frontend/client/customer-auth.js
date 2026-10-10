const API_BASE_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000'
  : 'https://api.ecolithenergy.com';
const API_BASE = `${API_BASE_URL}/api/auth`;
let csrfToken = null;

function customerAuthHeaders() {
  const headers = {};
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  const csrfCookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('XSRF-TOKEN='));
  if (!headers['X-CSRF-Token'] && csrfCookie) {
    headers['X-CSRF-Token'] = decodeURIComponent(csrfCookie.slice('XSRF-TOKEN='.length));
  }
  return headers;
}

window.customerAuthHeaders = customerAuthHeaders;

async function customerApiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  Object.entries(customerAuthHeaders()).forEach(([name, value]) => {
    if (!headers.has(name)) headers.set(name, value);
  });
  const method = (options.method || 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken && !headers.has('X-CSRF-Token')) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  const response = await fetch(new URL(url, API_BASE_URL), {
    ...options,
    credentials: 'include',
    headers
  });
  csrfToken = response.headers.get('X-CSRF-Token') || csrfToken;
  return response;
}

window.customerApiFetch = customerApiFetch;

function setMessage(el, type, text) {
  if (!el) return;
  el.textContent = text;
  el.className = `message ${type} show`;
}

function passwordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, width: '0%', color: '#fff' };
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[a-z]/.test(password)) score += 25;
  if (/\d/.test(password)) score += 12.5;
  if (/[^A-Za-z0-9]/.test(password)) score += 12.5;

  if (score <= 25) return { score, width: '25%', color: '#ff6b6b' };
  if (score <= 50) return { score, width: '50%', color: '#ffb703' };
  if (score <= 75) return { score, width: '75%', color: '#8bd400' };
  return { score, width: '100%', color: '#8bd400' };
}

async function apiRequest(url, options = {}) {
  const headers = {
    ...customerAuthHeaders(),
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await customerApiFetch(url, {
    ...options,
    credentials: 'include',
    headers
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed.');
  }

  return payload;
}

function bindPasswordMeter(inputId, meterId) {
  const input = document.getElementById(inputId);
  const meter = document.getElementById(meterId);
  if (!input || !meter) return;

  input.addEventListener('input', () => {
    const result = passwordStrength(input.value);
    meter.style.width = result.width;
    meter.style.background = result.color;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const forgotForm = document.getElementById('forgotForm');
  const messageBox = document.getElementById('messageBox');

  document.querySelectorAll('[data-google-oauth]').forEach((link) => {
    const intent = link.dataset.googleOauth;
    if (intent === 'signup' || intent === 'login') {
      link.href = `${API_BASE_URL}/api/auth/google/${intent}`;
    }
  });

  const googleErrorMessages = {
    'account-exists': 'An account with this Google email already exists. Please log in with your existing account.',
    'account-inactive': 'This account is inactive. Please contact support.',
    'account-locked': 'This account is temporarily locked. Please try again later.',
    'account-not-found': 'No Google account is registered yet. Please sign up first.',
    failed: 'Google authentication failed. Please try again.'
  };
  const googleError = new URLSearchParams(window.location.search).get('google');
  if (googleErrorMessages[googleError]) {
    setMessage(messageBox, 'error', googleErrorMessages[googleError]);
  }

  if (signupForm) {
    bindPasswordMeter('signupPassword', 'passwordMeter');

    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(signupForm);
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
      };

      try {
        await apiRequest(`${API_BASE}/signup`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        window.location.href = '/';
      } catch (error) {
        setMessage(messageBox, 'error', error.message);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      try {
        await apiRequest(`${API_BASE}/login`, {
          method: 'POST',
          body: JSON.stringify({
            email: formData.get('email'),
            password: formData.get('password')
          })
        });
        window.location.href = '/';
      } catch (error) {
        setMessage(messageBox, 'error', error.message);
      }
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = new FormData(forgotForm).get('email');
      try {
        const result = await apiRequest(`${API_BASE}/forgot-password`, {
          method: 'POST',
          body: JSON.stringify({ email })
        });
        setMessage(messageBox, 'success', result.message || 'If an account exists, a reset link has been sent.');
      } catch (error) {
        setMessage(messageBox, 'error', error.message);
      }
    });
  }

  const resetForm = document.getElementById('resetForm');
  if (resetForm) {
    const token = window.location.pathname.split('/').pop();
    resetForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const password = new FormData(resetForm).get('password');
      try {
        const result = await apiRequest(`${API_BASE}/reset-password`, {
          method: 'POST',
          body: JSON.stringify({ token, password })
        });
        setMessage(messageBox, 'success', result.message || 'Password reset successfully.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
      } catch (error) {
        setMessage(messageBox, 'error', error.message);
      }
    });
  }

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    customerApiFetch(`${API_BASE}/me`)
      .then((res) => res.json())
      .then((payload) => {
        if (!payload.success || !payload.data?.user) {
          window.location.href = '/login';
          return;
        }

        const user = payload.data.user;
        const greeting = document.querySelector('.greeting');
        if (greeting) greeting.textContent = `Hey ${user.name || 'Customer'}`;
        profileForm.elements.name.value = user.name || '';
        profileForm.elements.phone.value = user.phone || '';
      })
      .catch(() => {
        window.location.href = '/login';
      });

    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(profileForm);
      try {
        const result = await apiRequest(`${API_BASE_URL}/api/profile`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formData.get('name'),
            phone: formData.get('phone')
          })
        });
        setMessage(messageBox, 'success', result.message || 'Profile updated successfully.');
        window.location.href = '/dashboard';
      } catch (error) {
        setMessage(messageBox, 'error', error.message);
      }
    });
  }
});
