/**
 * Smart Library Management System - Authentication Service & Demo Switcher
 */

const Auth = {
  init() {
    this.bindEvents();
    this.checkInitialSession();
  },

  bindEvents() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    const roleSelector = document.getElementById('demo-role-selector');
    if (roleSelector) {
      roleSelector.addEventListener('change', (e) => this.handleDemoSwitch(e.target.value));
    }
  },

  checkInitialSession() {
    const user = API.getCurrentUser();
    const token = API.getToken();

    if (token && user) {
      this.applyUserInterface(user);
    } else {
      this.showAuthView();
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Authenticating...';
    submitBtn.disabled = true;

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const authData = await API.auth.login({ username, password });
      API.setToken(authData.token);
      API.setCurrentUser(authData);

      App.showToast('Login successful! Welcome back, ' + authData.fullName, 'success');
      this.applyUserInterface(authData);
    } catch (err) {
      App.showToast(err.message || 'Login failed. Please verify credentials.', 'danger');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;

    const payload = {
      username: document.getElementById('reg-username').value.trim(),
      password: document.getElementById('reg-password').value,
      fullName: document.getElementById('reg-fullname').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      phoneNumber: document.getElementById('reg-phone').value.trim(),
      membershipType: document.getElementById('reg-type').value,
      address: document.getElementById('reg-address').value.trim()
    };

    try {
      const authData = await API.auth.register(payload);
      API.setToken(authData.token);
      API.setCurrentUser(authData);

      App.showToast('Registration successful! Welcome to the library.', 'success');
      this.applyUserInterface(authData);
    } catch (err) {
      App.showToast(err.message || 'Registration failed.', 'danger');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  },

  async handleDemoSwitch(accountKey) {
    if (!accountKey) return;

    const accounts = {
      admin: { u: 'admin', p: 'admin123' },
      librarian: { u: 'librarian', p: 'librarian123' },
      alice: { u: 'alice', p: 'member123' },
      bob: { u: 'bob', p: 'member123' },
      clara: { u: 'clara', p: 'member123' },
      david: { u: 'david', p: 'member123' }
    };

    const target = accounts[accountKey];
    if (!target) return;

    try {
      const authData = await API.auth.login({ username: target.u, password: target.p });
      API.setToken(authData.token);
      API.setCurrentUser(authData);

      App.showToast(`Switched account to: ${authData.fullName} (${authData.role})`, 'info');
      this.applyUserInterface(authData);
    } catch (err) {
      App.showToast('Demo switch error: ' + err.message, 'danger');
    }
  },

  applyUserInterface(user) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-shell').style.display = 'flex';

    // Update Topbar and Sidebar Profile Info
    const userNameEl = document.getElementById('current-user-name');
    const userRoleEl = document.getElementById('current-user-role');
    const userAvatarEl = document.getElementById('current-user-avatar');

    if (userNameEl) userNameEl.textContent = user.fullName || user.username;
    if (userRoleEl) userRoleEl.textContent = user.role === 'ROLE_LIBRARIAN' ? 'Staff / Librarian' : 'Member (' + (user.membershipNumber || 'Active') + ')';
    if (userAvatarEl) {
      const initials = (user.fullName || user.username).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      userAvatarEl.textContent = initials;
    }

    // Role-based Navigation visibility
    const librarianNav = document.querySelectorAll('.librarian-only');
    const memberNav = document.querySelectorAll('.member-only');

    if (user.role === 'ROLE_LIBRARIAN' || user.role === 'ROLE_ADMIN') {
      librarianNav.forEach(el => el.style.display = 'flex');
      memberNav.forEach(el => el.style.display = 'none');
      window.location.hash = '#dashboard';
    } else {
      librarianNav.forEach(el => el.style.display = 'none');
      memberNav.forEach(el => el.style.display = 'flex');
      window.location.hash = '#member-portal';
    }

    // Initialize notification polling
    App.pollNotifications();
  },

  showAuthView() {
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('app-shell').style.display = 'none';
  },

  logout() {
    API.setToken(null);
    API.setCurrentUser(null);
    App.showToast('You have been logged out securely.', 'info');
    this.showAuthView();
  }
};
