document.addEventListener('DOMContentLoaded', async () => {
  const greeting = document.querySelector('.greeting');
  const logoutButton = document.getElementById('logoutBtn');

  if (greeting) {
    try {
      const response = await window.customerApiFetch('/api/auth/me');
      const payload = await response.json();
      if (!response.ok || !payload.success || !payload.data?.user) {
        window.location.href = '/login';
        return;
      }
      greeting.textContent = `Hey ${payload.data.user.name || 'Customer'}`;
    } catch {
      window.location.href = '/login';
      return;
    }
  }

  logoutButton?.addEventListener('click', async () => {
    try {
      const response = await window.customerApiFetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Logout failed. Please try again.');
      window.location.href = '/login';
    } catch (error) {
      const message = document.getElementById('messageBox');
      if (message) {
        message.textContent = error.message || 'Logout failed. Please try again.';
        message.className = 'message error show';
      }
    }
  });
});
