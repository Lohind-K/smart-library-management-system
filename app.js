/**
 * Smart Library Management System - Main Application Controller
 */

const App = {
  activeView: '',
  allBooksCache: [],
  allMembersCache: [],
  memberBooksCache: [],

  getBookCoverFallback(title, category) {
    const cleanTitle = (title || 'Library Book').replace(/["'<>]/g, '');
    const cleanCat = (category || 'General').replace(/["'<>]/g, '');
    const firstLine = cleanTitle.length > 24 ? cleanTitle.substring(0, 24) : cleanTitle;
    const secondLine = cleanTitle.length > 24 ? (cleanTitle.substring(24, 48) + (cleanTitle.length > 48 ? '...' : '')) : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect width="400" height="240" fill="url(#bg)"/><text x="200" y="78" font-family="Segoe UI, sans-serif" font-size="44" text-anchor="middle" fill="#60a5fa">📖</text><rect x="120" y="98" width="160" height="24" rx="12" fill="#2563eb"/><text x="200" y="114" font-family="Segoe UI, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#ffffff">${cleanCat.toUpperCase()}</text><text x="200" y="152" font-family="Segoe UI, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#f8fafc">${firstLine}</text><text x="200" y="174" font-family="Segoe UI, sans-serif" font-size="12" text-anchor="middle" fill="#94a3b8">${secondLine}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  },

  init() {
    Auth.init();
    this.bindGlobalEvents();
    this.handleRouting();
    window.addEventListener('hashchange', () => this.handleRouting());
  },

  bindGlobalEvents() {
    // Navigation link clicks
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          window.location.hash = href;
        }
      });
    });

    // Notification dropdown toggle
    const notifBtn = document.getElementById('notif-toggle-btn');
    const notifDropdown = document.getElementById('notification-dropdown');
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('active');
        if (notifDropdown.classList.contains('active')) {
          this.loadNotificationsList();
        }
      });

      document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
          notifDropdown.classList.remove('active');
        }
      });
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // Mobile sidebar toggle
    const mobileToggle = document.getElementById('mobile-sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
    }
  },

  handleRouting() {
    const rawHash = window.location.hash || '';
    const hash = rawHash.replace('#', '') || 'dashboard';
    const user = API.getCurrentUser();

    if (!user && hash !== 'auth') {
      Auth.showAuthView();
      return;
    }

    this.activeView = hash;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('href') === `#${hash}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(view => {
      view.classList.remove('active');
    });

    // Show target view
    const targetSection = document.getElementById(`view-${hash}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update page header title
    const titleEl = document.getElementById('current-page-title');
    if (titleEl) {
      titleEl.textContent = this.getViewTitle(hash);
    }

    // Dispatch view-specific data loader
    this.loadViewData(hash);
  },

  getViewTitle(viewName) {
    const titles = {
      'dashboard': 'Librarian Dashboard',
      'books': 'Book Inventory Management',
      'members': 'Member Directory & Access',
      'circulation': 'Circulation: Issue & Return',
      'reservations': 'Book Reservations & Queue',
      'fines': 'Fines & Settlement Management',
      'reports': 'Reports & Analytics Center',
      'member-portal': 'Member Dashboard',
      'member-catalog': 'Search & Browse Catalog',
      'my-loans': 'My Borrowed Books',
      'my-reservations': 'My Book Reservations',
      'my-fines': 'My Fines & Dues',
      'settings': 'Account Settings & System Profile'
    };
    return titles[viewName] || 'Smart Library System';
  },

  loadViewData(viewName) {
    switch (viewName) {
      case 'dashboard':
        this.loadLibrarianDashboard();
        break;
      case 'books':
        this.loadBooksView();
        break;
      case 'members':
        this.loadMembersView();
        break;
      case 'circulation':
        this.loadCirculationView();
        break;
      case 'reservations':
        this.loadReservationsView();
        break;
      case 'fines':
        this.loadFinesView();
        break;
      case 'reports':
        this.loadReportsView('inventory');
        break;
      case 'member-portal':
        this.loadMemberPortal();
        break;
      case 'member-catalog':
        this.loadMemberCatalog();
        break;
      case 'my-loans':
        this.loadMyLoans();
        break;
      case 'my-reservations':
        this.loadMyReservations();
        break;
      case 'my-fines':
        this.loadMyFines();
        break;
      case 'settings':
        this.loadSettingsView();
        break;
    }
  },

  // -------------------------------------------------------------
  // 1. Librarian Dashboard
  // -------------------------------------------------------------
  async loadLibrarianDashboard() {
    try {
      const stats = await API.dashboard.getLibrarianStats();

      document.getElementById('dash-total-books').textContent = stats.totalBooks || 0;
      document.getElementById('dash-available-copies').textContent = stats.availableCopies || 0;
      document.getElementById('dash-total-members').textContent = stats.totalMembers || 0;
      document.getElementById('dash-active-loans').textContent = stats.activeLoans || 0;
      document.getElementById('dash-overdue-loans').textContent = stats.overdueLoans || 0;
      document.getElementById('dash-pending-res').textContent = stats.pendingReservations || 0;
      document.getElementById('dash-outstanding-fines').textContent = `$${Number(stats.outstandingFines || 0).toFixed(2)}`;
      document.getElementById('dash-collected-fines').textContent = `$${Number(stats.collectedFines || 0).toFixed(2)}`;

      // Render Recent Activities Table
      const activitiesTbody = document.getElementById('dash-recent-activities-tbody');
      if (activitiesTbody) {
        if (!stats.recentActivities || stats.recentActivities.length === 0) {
          activitiesTbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No recent activity recorded</td></tr>';
        } else {
          activitiesTbody.innerHTML = stats.recentActivities.map(a => `
            <tr>
              <td><strong>${a.loanNumber}</strong></td>
              <td>${a.bookTitle}</td>
              <td>${a.memberName}</td>
              <td>${a.borrowDate} &rarr; <strong>${a.dueDate}</strong></td>
              <td>
                ${a.status === 'RETURNED' ? '<span class="badge badge-success">Returned</span>' :
                  a.isOverdue ? '<span class="badge badge-danger">Overdue</span>' : '<span class="badge badge-info">Borrowed</span>'}
              </td>
            </tr>
          `).join('');
        }
      }

      // Render Overdue Alerts
      const alertsContainer = document.getElementById('dash-overdue-alerts-container');
      if (alertsContainer) {
        if (!stats.overdueAlerts || stats.overdueAlerts.length === 0) {
          alertsContainer.innerHTML = '<div class="text-muted text-center py-4">No overdue books at this time. All loans are on schedule!</div>';
        } else {
          alertsContainer.innerHTML = stats.overdueAlerts.map(alert => `
            <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="color:#b91c1c;">${alert.bookTitle}</strong><br>
                <small style="color:#7f1d1d;">Borrowed by: ${alert.memberName} (${alert.memberEmail})</small>
              </div>
              <div style="text-align:right;">
                <span class="badge badge-danger">${alert.daysOverdue} Days Late</span><br>
                <small style="color:#64748b;">Due: ${alert.dueDate}</small>
              </div>
            </div>
          `).join('');
        }
      }
    } catch (err) {
      this.showToast('Error loading dashboard: ' + err.message, 'danger');
    }
  },

  // -------------------------------------------------------------
  // 2. Book Management
  // -------------------------------------------------------------
  async loadBooksView() {
    try {
      const [books, categories] = await Promise.all([
        API.books.getAll(),
        API.books.getCategories()
      ]);
      this.allBooksCache = books;

      // Populate Category Filter Dropdown
      const catSelect = document.getElementById('book-category-filter');
      if (catSelect) {
        catSelect.innerHTML = '<option value="">All Categories</option>' +
          categories.map(c => `<option value="${c}">${c}</option>`).join('');
      }

      this.renderBooksTable(books);
    } catch (err) {
      this.showToast('Error loading books: ' + err.message, 'danger');
    }
  },

  renderBooksTable(books) {
    const tbody = document.getElementById('books-table-tbody');
    if (!tbody) return;

    if (!books || books.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No books found in the catalog</td></tr>';
      return;
    }

    tbody.innerHTML = books.map(b => {
      const isAvailable = b.availableCopies > 0;
      return `
        <tr>
          <td>
            <div class="book-card-item">
              <img src="${b.coverImageUrl || ''}" onerror="this.onerror=null;this.src=App.getBookCoverFallback('${(b.title || '').replace(/'/g, "\\'")}', '${b.category || ''}');" class="book-thumb" alt="Cover" />
              <div>
                <div class="book-title-cell">${b.title}</div>
                <div class="book-author-sub">By ${b.author} (${b.publicationYear || 'N/A'})</div>
              </div>
            </div>
          </td>
          <td><code>${b.isbn}</code></td>
          <td><span class="badge badge-secondary">${b.category}</span></td>
          <td>${b.shelfLocation || 'General Stacks'}</td>
          <td>
            <strong>${b.availableCopies}</strong> / ${b.totalCopies}
          </td>
          <td>
            ${isAvailable ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-danger">Out of Stock</span>'}
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="App.openEditBookModal(${b.id})">Edit</button>
              <button class="btn btn-secondary btn-sm" onclick="App.openBookCopiesModal(${b.id})">Copies</button>
              <button class="btn btn-outline-danger btn-sm" onclick="App.confirmDeleteBook(${b.id}, '${b.title.replace(/'/g, "\\'")}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterBooksLocal() {
    const query = (document.getElementById('book-search-input')?.value || '').toLowerCase();
    const category = document.getElementById('book-category-filter')?.value || '';

    const filtered = this.allBooksCache.filter(b => {
      const matchQuery = !query || b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) || b.isbn.toLowerCase().includes(query);
      const matchCat = !category || b.category.toLowerCase() === category.toLowerCase();
      return matchQuery && matchCat;
    });

    this.renderBooksTable(filtered);
  },

  openAddBookModal() {
    document.getElementById('book-modal-title').textContent = 'Add New Book';
    document.getElementById('book-form-id').value = '';
    document.getElementById('book-form-isbn').value = '';
    document.getElementById('book-form-title').value = '';
    document.getElementById('book-form-author').value = '';
    document.getElementById('book-form-category').value = '';
    document.getElementById('book-form-publisher').value = '';
    document.getElementById('book-form-year').value = new Date().getFullYear();
    document.getElementById('book-form-copies').value = '3';
    document.getElementById('book-form-copies').disabled = false;
    document.getElementById('book-form-shelf').value = 'Main Stacks';
    document.getElementById('book-form-cover').value = '';
    document.getElementById('book-form-desc').value = '';

    this.openModal('book-modal');
  },

  openEditBookModal(bookId) {
    const book = this.allBooksCache.find(b => b.id === bookId);
    if (!book) return;

    document.getElementById('book-modal-title').textContent = 'Edit Book Details';
    document.getElementById('book-form-id').value = book.id;
    document.getElementById('book-form-isbn').value = book.isbn;
    document.getElementById('book-form-title').value = book.title;
    document.getElementById('book-form-author').value = book.author;
    document.getElementById('book-form-category').value = book.category;
    document.getElementById('book-form-publisher').value = book.publisher || '';
    document.getElementById('book-form-year').value = book.publicationYear || '';
    document.getElementById('book-form-copies').value = book.totalCopies;
    document.getElementById('book-form-shelf').value = book.shelfLocation || '';
    document.getElementById('book-form-cover').value = book.coverImageUrl || '';
    document.getElementById('book-form-desc').value = book.description || '';

    this.openModal('book-modal');
  },

  async handleSaveBook(e) {
    e.preventDefault();
    const id = document.getElementById('book-form-id').value;
    const bookData = {
      isbn: document.getElementById('book-form-isbn').value.trim(),
      title: document.getElementById('book-form-title').value.trim(),
      author: document.getElementById('book-form-author').value.trim(),
      category: document.getElementById('book-form-category').value.trim(),
      publisher: document.getElementById('book-form-publisher').value.trim(),
      publicationYear: parseInt(document.getElementById('book-form-year').value) || null,
      totalCopies: parseInt(document.getElementById('book-form-copies').value) || 1,
      shelfLocation: document.getElementById('book-form-shelf').value.trim(),
      coverImageUrl: document.getElementById('book-form-cover').value.trim(),
      description: document.getElementById('book-form-desc').value.trim()
    };

    try {
      if (id) {
        await API.books.update(id, bookData);
        this.showToast('Book updated successfully!', 'success');
      } else {
        await API.books.create(bookData);
        this.showToast('Book created and added to catalog!', 'success');
      }
      this.closeAllModals();
      this.loadBooksView();
    } catch (err) {
      this.showToast(err.message, 'danger');
    }
  },

  confirmDeleteBook(id, title) {
    this.openConfirmModal(
      'Delete Book',
      `Are you sure you want to permanently delete "${title}" and all its registered physical copies from the library?`,
      async () => {
        try {
          await API.books.delete(id);
          this.showToast('Book deleted successfully', 'success');
          this.loadBooksView();
        } catch (err) {
          this.showToast('Cannot delete book: ' + err.message, 'danger');
        }
      }
    );
  },

  async openBookCopiesModal(bookId) {
    const book = this.allBooksCache.find(b => b.id === bookId);
    if (!book) return;

    document.getElementById('copies-modal-book-title').textContent = `${book.title} (ISBN: ${book.isbn})`;
    document.getElementById('copies-modal-book-id').value = book.id;

    try {
      const copies = await API.books.getCopies(bookId);
      const tbody = document.getElementById('copies-table-tbody');
      tbody.innerHTML = copies.map(c => `
        <tr>
          <td><strong>${c.copyBarcode}</strong></td>
          <td>
            <select class="filter-select" onchange="App.handleCopyStatusChange(${c.id}, this.value)">
              <option value="AVAILABLE" ${c.status === 'AVAILABLE' ? 'selected' : ''}>Available</option>
              <option value="BORROWED" ${c.status === 'BORROWED' ? 'selected' : ''} disabled>Borrowed</option>
              <option value="RESERVED" ${c.status === 'RESERVED' ? 'selected' : ''}>Reserved</option>
              <option value="MAINTENANCE" ${c.status === 'MAINTENANCE' ? 'selected' : ''}>Maintenance</option>
              <option value="LOST" ${c.status === 'LOST' ? 'selected' : ''}>Lost</option>
            </select>
          </td>
          <td>${c.conditionNotes || 'Good'}</td>
          <td>${c.acquisitionDate || 'N/A'}</td>
        </tr>
      `).join('');

      this.openModal('copies-modal');
    } catch (err) {
      this.showToast('Error loading copies: ' + err.message, 'danger');
    }
  },

  async handleAddSingleCopy() {
    const bookId = document.getElementById('copies-modal-book-id').value;
    const barcode = prompt('Enter barcode for new copy (Leave blank to auto-generate):');
    if (barcode === null) return;

    try {
      await API.books.addCopy(bookId, { barcode, notes: 'Newly added physical inventory' });
      this.showToast('Copy added successfully!', 'success');
      this.openBookCopiesModal(Number(bookId));
      this.loadBooksView();
    } catch (err) {
      this.showToast(err.message, 'danger');
    }
  },

  async handleCopyStatusChange(copyId, newStatus) {
    try {
      await API.books.updateCopyStatus(copyId, newStatus);
      this.showToast('Copy status updated to ' + newStatus, 'success');
      this.loadBooksView();
    } catch (err) {
      this.showToast('Status update failed: ' + err.message, 'danger');
    }
  },

  // -------------------------------------------------------------
  // 3. Member Management
  // -------------------------------------------------------------
  async loadMembersView() {
    try {
      const members = await API.members.getAll();
      this.allMembersCache = members;
      this.renderMembersTable(members);
    } catch (err) {
      this.showToast('Error loading members: ' + err.message, 'danger');
    }
  },

  renderMembersTable(members) {
    const tbody = document.getElementById('members-table-tbody');
    if (!tbody) return;

    if (!members || members.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No members registered</td></tr>';
      return;
    }

    tbody.innerHTML = members.map(m => {
      const hasFine = Number(m.outstandingFines || 0) > 0;
      return `
        <tr>
          <td>
            <strong>${m.fullName}</strong><br>
            <small class="text-muted">@${m.username}</small>
          </td>
          <td><code>${m.membershipNumber || 'N/A'}</code></td>
          <td><span class="badge badge-info">${m.membershipType}</span></td>
          <td>
            Active: <strong>${m.activeLoanCount}</strong> / Max: ${m.maxAllowedBooks}
          </td>
          <td>
            ${hasFine ? `<span class="badge badge-danger">$${Number(m.outstandingFines).toFixed(2)}</span>` : '<span class="badge badge-success">Clear</span>'}
          </td>
          <td>
            ${m.active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Suspended</span>'}
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="App.viewMemberDetails(${m.id})">Details</button>
              <button class="btn btn-sm ${m.active ? 'btn-outline-danger' : 'btn-success'}" onclick="App.toggleMemberActive(${m.id})">
                ${m.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterMembersLocal() {
    const q = (document.getElementById('member-search-input')?.value || '').toLowerCase();
    const filtered = this.allMembersCache.filter(m =>
      m.fullName.toLowerCase().includes(q) ||
      m.username.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.membershipNumber && m.membershipNumber.toLowerCase().includes(q))
    );
    this.renderMembersTable(filtered);
  },

  async toggleMemberActive(memberId) {
    try {
      const res = await API.members.toggleActive(memberId);
      this.showToast(`Member account is now ${res.active ? 'Active' : 'Suspended'}`, 'info');
      this.loadMembersView();
    } catch (err) {
      this.showToast(err.message, 'danger');
    }
  },

  async viewMemberDetails(memberId) {
    try {
      const [member, history] = await Promise.all([
        API.members.getById(memberId),
        API.members.getHistory(memberId)
      ]);

      document.getElementById('mem-detail-name').textContent = member.fullName;
      document.getElementById('mem-detail-number').textContent = member.membershipNumber;
      document.getElementById('mem-detail-email').textContent = member.email;
      document.getElementById('mem-detail-phone').textContent = member.phoneNumber || 'N/A';
      document.getElementById('mem-detail-type').textContent = member.membershipType;
      document.getElementById('mem-detail-status').textContent = member.status;
      document.getElementById('mem-detail-fines').textContent = `$${Number(member.outstandingFines || 0).toFixed(2)}`;

      const historyTbody = document.getElementById('mem-history-tbody');
      if (history.length === 0) {
        historyTbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No borrowing history on record</td></tr>';
      } else {
        historyTbody.innerHTML = history.map(h => `
          <tr>
            <td><strong>${h.book.title}</strong></td>
            <td>${h.borrowDate}</td>
            <td>${h.returnDate || '<em>Not Returned</em>'}</td>
            <td>
              ${h.status === 'RETURNED' ? '<span class="badge badge-success">Returned</span>' :
                h.isCurrentlyOverdue ? '<span class="badge badge-danger">Overdue</span>' : '<span class="badge badge-info">Borrowed</span>'}
            </td>
          </tr>
        `).join('');
      }

      this.openModal('member-details-modal');
    } catch (err) {
      this.showToast('Error loading details: ' + err.message, 'danger');
    }
  },

  // -------------------------------------------------------------
  // 4. Circulation: Issue & Return Books
  // -------------------------------------------------------------
  async loadCirculationView() {
    try {
      const [members, books, activeLoans] = await Promise.all([
        API.members.getAll(),
        API.books.getAll(),
        API.loans.getActive()
      ]);

      // Populate Issue Book Selects
      const memSelect = document.getElementById('issue-member-select');
      if (memSelect) {
        memSelect.innerHTML = '<option value="">-- Choose Member --</option>' +
          members.filter(m => m.active).map(m => `<option value="${m.id}">${m.fullName} (${m.membershipNumber || m.username}) - Active Loans: ${m.activeLoanCount}/${m.maxAllowedBooks}</option>`).join('');
      }

      const bookSelect = document.getElementById('issue-book-select');
      if (bookSelect) {
        bookSelect.innerHTML = '<option value="">-- Choose Book Title --</option>' +
          books.map(b => `<option value="${b.id}" ${b.availableCopies === 0 ? 'disabled' : ''}>${b.title} [Avail: ${b.availableCopies}/${b.totalCopies}]</option>`).join('');
      }

      // Populate Active Loans Table
      const tbody = document.getElementById('circulation-loans-tbody');
      if (tbody) {
        if (activeLoans.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No books currently issued</td></tr>';
        } else {
          tbody.innerHTML = activeLoans.map(l => {
            const isLate = new Date(l.dueDate) < new Date();
            return `
              <tr>
                <td><strong>${l.loanNumber}</strong></td>
                <td>
                  <strong>${l.book.title}</strong><br>
                  <small class="text-muted">Barcode: ${l.bookCopy ? l.bookCopy.copyBarcode : 'N/A'}</small>
                </td>
                <td>${l.member.fullName} (${l.member.membershipNumber})</td>
                <td>${l.borrowDate}</td>
                <td>
                  <strong style="color:${isLate ? '#dc2626' : '#0f172a'};">${l.dueDate}</strong>
                  ${isLate ? '<span class="badge badge-danger" style="margin-left:6px;">LATE</span>' : ''}
                </td>
                <td>
                  <button class="btn btn-success btn-sm" onclick="App.openReturnBookModal(${l.id}, '${l.book.title.replace(/'/g, "\\'")}', '${l.member.fullName.replace(/'/g, "\\'")}', ${isLate})">
                    Process Return
                  </button>
                </td>
              </tr>
            `;
          }).join('');
        }
      }
    } catch (err) {
      this.showToast('Error loading circulation data: ' + err.message, 'danger');
    }
  },

  async handleIssueBook(e) {
    e.preventDefault();
    const memberId = document.getElementById('issue-member-select').value;
    const bookId = document.getElementById('issue-book-select').value;
    const days = parseInt(document.getElementById('issue-days-input').value) || 14;
    const notes = document.getElementById('issue-notes-input').value.trim();

    if (!memberId || !bookId) {
      this.showToast('Please select both a member and a book.', 'warning');
      return;
    }

    try {
      const loan = await API.loans.issue({ memberId: Number(memberId), bookId: Number(bookId), loanPeriodDays: days, notes });
      this.showToast(`Book successfully issued! Loan #${loan.loanNumber}. Due on ${loan.dueDate}.`, 'success');
      document.getElementById('issue-book-form').reset();
      this.loadCirculationView();
    } catch (err) {
      this.showToast('Issue failed: ' + err.message, 'danger');
    }
  },

  openReturnBookModal(loanId, bookTitle, memberName, isOverdue) {
    document.getElementById('return-modal-loan-id').value = loanId;
    document.getElementById('return-modal-title').textContent = `Return: ${bookTitle}`;
    document.getElementById('return-modal-member').textContent = `Issued to: ${memberName}`;
    document.getElementById('return-overdue-warning').style.display = isOverdue ? 'block' : 'none';
    this.openModal('return-book-modal');
  },

  async handleProcessReturn(e) {
    e.preventDefault();
    const loanId = document.getElementById('return-modal-loan-id').value;
    const condition = document.getElementById('return-condition-select').value;
    const notes = document.getElementById('return-notes-input').value.trim();

    try {
      await API.loans.returnBook({ loanId: Number(loanId), conditionNotes: condition, notes });
      this.showToast('Book returned and inventory updated successfully!', 'success');
      this.closeAllModals();
      this.loadCirculationView();
    } catch (err) {
      this.showToast('Return failed: ' + err.message, 'danger');
    }
  },

  // -------------------------------------------------------------
  // 5. Reservations Management
  // -------------------------------------------------------------
  async loadReservationsView() {
    try {
      const reservations = await API.reservations.getAll();
      const tbody = document.getElementById('reservations-table-tbody');
      if (!tbody) return;

      if (!reservations || reservations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No book reservations pending</td></tr>';
        return;
      }

      tbody.innerHTML = reservations.map(r => `
        <tr>
          <td><strong>${r.reservationNumber}</strong></td>
          <td><strong>${r.bookTitle}</strong></td>
          <td>${r.memberName} (${r.membershipNumber})</td>
          <td>${new Date(r.reservationDate).toLocaleDateString()}</td>
          <td><span class="badge badge-info">Position #${r.queuePosition}</span></td>
          <td>
            ${r.status === 'PENDING' ? '<span class="badge badge-warning">Waiting in Queue</span>' :
              r.status === 'NOTIFIED' ? '<span class="badge badge-success">Ready for Pickup</span>' :
              r.status === 'FULFILLED' ? '<span class="badge badge-info">Fulfilled</span>' : '<span class="badge badge-secondary">Cancelled</span>'}
          </td>
          <td>
            ${r.status === 'PENDING' || r.status === 'NOTIFIED' ? `
              <button class="btn btn-success btn-sm" onclick="App.fulfillReservation(${r.id})">Fulfill</button>
              <button class="btn btn-outline-danger btn-sm" onclick="App.cancelReservation(${r.id})">Cancel</button>
            ` : '<em>Completed</em>'}
          </td>
        </tr>
      `).join('');
    } catch (err) {
      this.showToast('Error loading reservations: ' + err.message, 'danger');
    }
  },

  async fulfillReservation(id) {
    try {
      await API.reservations.fulfill(id);
      this.showToast('Reservation marked as fulfilled!', 'success');
      this.loadReservationsView();
    } catch (err) {
      this.showToast(err.message, 'danger');
    }
  },

  async cancelReservation(id) {
    this.openConfirmModal('Cancel Reservation', 'Are you sure you want to cancel this reservation request?', async () => {
      try {
        await API.reservations.cancel(id);
        this.showToast('Reservation has been cancelled', 'info');
        this.loadReservationsView();
      } catch (err) {
        this.showToast(err.message, 'danger');
      }
    });
  },

  // -------------------------------------------------------------
  // 6. Fines & Payment Settlements
  // -------------------------------------------------------------
  async loadFinesView() {
    try {
      const [fines, payments] = await Promise.all([
        API.fines.getAll(),
        API.fines.getPayments()
      ]);

      const finesTbody = document.getElementById('fines-table-tbody');
      if (finesTbody) {
        if (!fines || fines.length === 0) {
          finesTbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No overdue penalties assessed</td></tr>';
        } else {
          finesTbody.innerHTML = fines.map(f => {
            const balance = Number(f.amount) - Number(f.paidAmount);
            return `
              <tr>
                <td><strong>${f.fineNumber}</strong></td>
                <td>${f.member.fullName} (${f.member.membershipNumber})</td>
                <td>${f.loan ? f.loan.book.title : 'Book Penalty'}</td>
                <td>$${Number(f.amount).toFixed(2)}</td>
                <td>
                  <strong style="color:${balance > 0 ? '#dc2626' : '#059669'};">$${balance.toFixed(2)}</strong>
                </td>
                <td>
                  ${f.status === 'PAID' ? '<span class="badge badge-success">Paid</span>' :
                    f.status === 'WAIVED' ? '<span class="badge badge-secondary">Waived</span>' :
                    f.status === 'PARTIALLY_PAID' ? '<span class="badge badge-warning">Partial</span>' : '<span class="badge badge-danger">Unpaid</span>'}
                </td>
                <td>
                  ${balance > 0 && f.status !== 'WAIVED' ? `
                    <button class="btn btn-success btn-sm" onclick="App.openPayFineModal(${f.id}, '${f.fineNumber}', ${balance})">Pay</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.waiveFinePrompt(${f.id})">Waive</button>
                  ` : '<small class="text-muted">Settled</small>'}
                </td>
              </tr>
            `;
          }).join('');
        }
      }

      // Populate Receipts / Payments History Table
      const payTbody = document.getElementById('payments-table-tbody');
      if (payTbody) {
        if (!payments || payments.length === 0) {
          payTbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No payment transactions recorded</td></tr>';
        } else {
          payTbody.innerHTML = payments.map(p => `
            <tr>
              <td><strong>${p.paymentNumber}</strong></td>
              <td>${p.member.fullName}</td>
              <td><strong>$${Number(p.amount).toFixed(2)}</strong></td>
              <td><span class="badge badge-info">${p.paymentMethod}</span></td>
              <td>${new Date(p.paymentDate).toLocaleString()}</td>
            </tr>
          `).join('');
        }
      }
    } catch (err) {
      this.showToast('Error loading fines: ' + err.message, 'danger');
    }
  },

  openPayFineModal(fineId, fineNumber, balance) {
    document.getElementById('pay-fine-id').value = fineId;
    document.getElementById('pay-fine-number').textContent = fineNumber;
    document.getElementById('pay-fine-balance').textContent = `$${balance.toFixed(2)}`;
    document.getElementById('pay-fine-amount').value = balance.toFixed(2);
    document.getElementById('pay-fine-amount').max = balance;
    this.openModal('pay-fine-modal');
  },

  async handleFinePaymentSubmit(e) {
    e.preventDefault();
    const fineId = document.getElementById('pay-fine-id').value;
    const amount = parseFloat(document.getElementById('pay-fine-amount').value);
    const method = document.getElementById('pay-fine-method').value;
    const ref = document.getElementById('pay-fine-ref').value.trim();

    try {
      const payment = await API.fines.pay({
        fineId: Number(fineId),
        amount,
        paymentMethod: method,
        transactionReference: ref
      });
      this.showToast(`Payment processed! Receipt #${payment.paymentNumber}.`, 'success');
      this.closeAllModals();
      this.loadFinesView();
    } catch (err) {
      this.showToast('Payment failed: ' + err.message, 'danger');
    }
  },

  async waiveFinePrompt(fineId) {
    const reason = prompt('Reason for waiving fine (e.g., Medical exemption, Staff discretion):');
    if (reason === null) return;

    try {
      await API.fines.waive(fineId, reason);
      this.showToast('Fine successfully waived.', 'info');
      this.loadFinesView();
    } catch (err) {
      this.showToast(err.message, 'danger');
    }
  },

  // -------------------------------------------------------------
  // 7. Reports & Analytics
  // -------------------------------------------------------------
  async loadReportsView(reportType) {
    const start = document.getElementById('report-start-date')?.value || '';
    const end = document.getElementById('report-end-date')?.value || '';

    try {
      let reportData;
      switch (reportType) {
        case 'inventory':
          reportData = await API.reports.getInventory();
          break;
        case 'history':
          reportData = await API.reports.getBorrowingHistory(start, end);
          break;
        case 'overdue':
          reportData = await API.reports.getOverdue();
          break;
        case 'active-members':
          reportData = await API.reports.getActiveMembers();
          break;
        case 'fines':
          reportData = await API.reports.getFineCollection(start, end);
          break;
        case 'most-borrowed':
          reportData = await API.reports.getMostBorrowed();
          break;
      }

      this.renderReportView(reportData);
    } catch (err) {
      this.showToast('Error generating report: ' + err.message, 'danger');
    }
  },

  renderReportView(report) {
    document.getElementById('report-title-display').textContent = report.reportType;
    document.getElementById('report-generated-at').textContent = `Generated: ${new Date(report.generatedAt).toLocaleString()}`;

    // Render Summary Metric Cards
    const summaryContainer = document.getElementById('report-summary-cards');
    if (summaryContainer && report.summary) {
      summaryContainer.innerHTML = Object.entries(report.summary).map(([key, val]) => `
        <div class="report-stat">
          <div class="title">${key.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
          <div class="value">${val}</div>
        </div>
      `).join('');
    }

    // Render Dynamic Table Header and Rows
    const thead = document.getElementById('report-table-thead');
    const tbody = document.getElementById('report-table-tbody');

    if (!report.rows || report.rows.length === 0) {
      thead.innerHTML = '<tr><th>Result</th></tr>';
      tbody.innerHTML = '<tr><td class="text-center text-muted py-4">No records found matching report criteria</td></tr>';
      return;
    }

    const columns = Object.keys(report.rows[0]);
    thead.innerHTML = '<tr>' + columns.map(c => `<th>${c.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>`).join('') + '</tr>';

    tbody.innerHTML = report.rows.map(row => {
      return '<tr>' + columns.map(col => `<td>${row[col] !== null ? row[col] : 'N/A'}</td>`).join('') + '</tr>';
    }).join('');
  },

  // -------------------------------------------------------------
  // 8. Member Self-Service Portal
  // -------------------------------------------------------------
  async loadMemberPortal() {
    const user = API.getCurrentUser();
    if (!user) return;

    try {
      const stats = await API.dashboard.getMemberStats(user.userId);
      document.getElementById('memportal-active-count').textContent = stats.activeLoansCount || 0;
      document.getElementById('memportal-overdue-count').textContent = stats.overdueLoansCount || 0;
      document.getElementById('memportal-res-count').textContent = stats.pendingReservationsCount || 0;
      document.getElementById('memportal-fines-count').textContent = `$${Number(stats.outstandingFines || 0).toFixed(2)}`;

      const booksContainer = document.getElementById('memportal-current-books');
      if (booksContainer) {
        if (!stats.currentBooks || stats.currentBooks.length === 0) {
          booksContainer.innerHTML = '<div class="text-center text-muted py-4">You have no books currently borrowed. Browse our catalog below to discover titles!</div>';
        } else {
          booksContainer.innerHTML = stats.currentBooks.map(b => `
            <div style="background:white; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:12px; display:flex; gap:16px; align-items:center;">
              <img src="${b.coverImageUrl || ''}" onerror="this.onerror=null;this.src=App.getBookCoverFallback('${(b.title || '').replace(/'/g, "\\'")}', '${b.category || ''}');" class="book-thumb" alt="Book" />
              <div style="flex:1;">
                <h4 style="font-size:15px; margin-bottom:4px;">${b.title}</h4>
                <div style="font-size:12px; color:#64748b;">By ${b.author}</div>
                <div style="font-size:12px; margin-top:6px;">
                  Borrowed: ${b.borrowDate} &bull; Due: <strong>${b.dueDate}</strong>
                </div>
              </div>
              <div style="text-align:right;">
                ${b.isOverdue ? '<span class="badge badge-danger">OVERDUE</span>' : `<span class="badge badge-info">${b.daysRemaining} days left</span>`}
              </div>
            </div>
          `).join('');
        }
      }
    } catch (err) {
      this.showToast('Portal load error: ' + err.message, 'danger');
    }
  },

  async loadMemberCatalog() {
    try {
      const [books, categories] = await Promise.all([
        API.books.getAll(),
        API.books.getCategories()
      ]);

      const catSelect = document.getElementById('member-cat-filter');
      if (catSelect) {
        catSelect.innerHTML = '<option value="">All Categories</option>' +
          categories.map(c => `<option value="${c}">${c}</option>`).join('');
      }

      this.renderMemberCatalogCards(books);
    } catch (err) {
      this.showToast('Catalog load error: ' + err.message, 'danger');
    }
  },

  renderMemberCatalogCards(books) {
    const container = document.getElementById('member-catalog-cards');
    if (!container) return;

    this.memberBooksCache = books || [];

    if (!books || books.length === 0) {
      container.innerHTML = '<div class="text-center text-muted py-4" style="grid-column:1/-1;">No books match your search</div>';
      return;
    }

    const user = API.getCurrentUser();
    const isStaff = user && (user.role === 'ROLE_LIBRARIAN' || user.role === 'ROLE_ADMIN');

    container.innerHTML = books.map(b => {
      const isAvail = b.availableCopies > 0;
      return `
        <div class="card" style="display:flex; flex-direction:column; overflow:hidden;">
          <div style="height:180px; overflow:hidden; background:#e2e8f0; display:flex; align-items:center; justify-content:center;">
            <img src="${b.coverImageUrl || ''}" onerror="this.onerror=null;this.src=App.getBookCoverFallback('${(b.title || '').replace(/'/g, "\\'")}', '${b.category || ''}');" style="width:100%; height:100%; object-fit:cover;" alt="${b.title}" />
          </div>
          <div style="padding:16px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <span class="badge badge-secondary" style="margin-bottom:8px;">${b.category}</span>
              <h4 style="font-size:15px; margin-bottom:4px; line-height:1.3;">${b.title}</h4>
              <p style="font-size:12px; color:#64748b; margin-bottom:8px;">By ${b.author}</p>
              <div style="font-size:12px; color:#475569; margin-bottom:12px;">
                📍 Shelf Location: <strong style="color:#2563eb;">${b.shelfLocation || 'Main Stacks'}</strong>
              </div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:12px;">
                <span>Copies: <strong>${b.availableCopies}/${b.totalCopies}</strong></span>
                ${isAvail ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-warning">All Borrowed</span>'}
              </div>
              ${isAvail ? `
                ${isStaff ? `
                  <button class="btn btn-secondary btn-sm" style="width:100%;" onclick="window.location.hash='#circulation'">🔄 Issue at Circulation Desk</button>
                ` : `
                  <button class="btn btn-primary btn-sm" style="width:100%; font-weight:600;" onclick="App.openMemberBorrowModal(${b.id})">📖 Borrow / Check Out</button>
                `}
              ` : `
                <button class="btn btn-warning btn-sm" style="width:100%; font-weight:600;" onclick="App.handleReserveBook(${b.id}, '${b.title.replace(/'/g, "\\'")}')">⏳ Reserve Book</button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  openMemberBorrowModal(bookId) {
    const book = (this.memberBooksCache || []).find(x => x.id === bookId);
    if (!book) return;

    document.getElementById('borrow-modal-book-id').value = book.id;
    document.getElementById('borrow-modal-title').textContent = book.title;
    document.getElementById('borrow-modal-author').textContent = `By ${book.author} (${book.publicationYear || ''})`;
    document.getElementById('borrow-modal-shelf').textContent = book.shelfLocation || 'Main Stacks';
    document.getElementById('borrow-modal-copies').textContent = `${book.availableCopies} copy(ies) remaining`;

    const coverEl = document.getElementById('borrow-modal-cover');
    if (coverEl) {
      coverEl.src = book.coverImageUrl || '';
      coverEl.onerror = () => {
        coverEl.onerror = null;
        coverEl.src = this.getBookCoverFallback(book.title, book.category);
      };
    }

    const due = new Date();
    due.setDate(due.getDate() + 14);
    const dateStr = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('borrow-modal-duedate').textContent = dateStr;

    this.openModal('member-borrow-modal');
  },

  async confirmMemberBorrow() {
    const user = API.getCurrentUser();
    if (!user) {
      this.showToast('Please log in first to borrow books.', 'danger');
      return;
    }

    const bookId = Number(document.getElementById('borrow-modal-book-id').value);
    const submitBtn = document.getElementById('borrow-modal-submit-btn');
    const origText = submitBtn.textContent;
    submitBtn.textContent = 'Processing Borrow...';
    submitBtn.disabled = true;

    try {
      const res = await API.loans.issue({
        memberId: user.userId,
        bookId: bookId,
        loanPeriodDays: 14,
        notes: 'Issued via Member Self-Checkout'
      });

      this.closeAllModals();
      this.showToast(`🎉 Book issued successfully! Due date: ${res.dueDate}. You can find it under "My Borrowed Books".`, 'success');
      this.loadMemberCatalog();
      this.loadMemberPortal();
    } catch (err) {
      this.showToast(err.message || 'Unable to issue book.', 'danger');
    } finally {
      submitBtn.textContent = origText;
      submitBtn.disabled = false;
    }
  },

  showBorrowInstructions(title, shelf) {
    this.showToast(`"${title}" is located at ${shelf || 'Main Stacks'}. Visit the circulation desk or click Borrow.`, 'info');
  },

  async handleReserveBook(bookId, bookTitle) {
    const user = API.getCurrentUser();
    if (!user) return;

    this.openConfirmModal('Confirm Reservation', `Place reservation for "${bookTitle}"? You will be notified in-app the moment a copy is returned.`, async () => {
      try {
        await API.reservations.create({ memberId: user.userId, bookId });
        this.showToast(`Reservation placed for "${bookTitle}"!`, 'success');
        this.loadMemberCatalog();
      } catch (err) {
        this.showToast(err.message, 'danger');
      }
    });
  },

  async loadMyLoans() {
    const user = API.getCurrentUser();
    if (!user) return;

    try {
      const loans = await API.loans.getMemberLoans(user.userId);
      const tbody = document.getElementById('myloans-table-tbody');
      if (!tbody) return;

      if (!loans || loans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">You have no loan history</td></tr>';
        return;
      }

      tbody.innerHTML = loans.map(l => `
        <tr>
          <td><strong>${l.book.title}</strong></td>
          <td>${l.borrowDate}</td>
          <td><strong>${l.dueDate}</strong></td>
          <td>${l.returnDate || '<em>Active</em>'}</td>
          <td>
            ${l.status === 'RETURNED' ? '<span class="badge badge-success">Returned</span>' :
              l.isCurrentlyOverdue ? '<span class="badge badge-danger">Overdue</span>' : '<span class="badge badge-info">Borrowed</span>'}
          </td>
          <td>
            ${l.status === 'ISSUED' ? `
              <button class="btn btn-success btn-sm" onclick="App.handleMemberSelfReturn(${l.id}, '${l.book.title.replace(/'/g, "\\'")}')">
                Return Book
              </button>
            ` : '<span class="text-muted" style="font-size:12px;">Returned</span>'}
          </td>
        </tr>
      `).join('');
    } catch (err) {
      this.showToast('Error loading your loans: ' + err.message, 'danger');
    }
  },

  handleMemberSelfReturn(loanId, title) {
    this.openConfirmModal('Confirm Book Return', `Return "${title}" to the library? The inventory will be updated immediately.`, async () => {
      try {
        await API.loans.returnBook({
          loanId: loanId,
          conditionNotes: 'Returned via Member Self-Service'
        });
        this.showToast(`✅ Successfully returned "${title}". Thank you!`, 'success');
        this.loadMyLoans();
        this.loadMemberPortal();
      } catch (err) {
        this.showToast(err.message || 'Error processing book return.', 'danger');
      }
    });
  },

  async loadMyReservations() {
    const user = API.getCurrentUser();
    if (!user) return;

    try {
      const res = await API.reservations.getMemberReservations(user.userId);
      const tbody = document.getElementById('myres-table-tbody');
      if (!tbody) return;

      if (!res || res.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">You have no active reservations</td></tr>';
        return;
      }

      tbody.innerHTML = res.map(r => `
        <tr>
          <td><strong>${r.bookTitle}</strong></td>
          <td>${new Date(r.reservationDate).toLocaleDateString()}</td>
          <td><span class="badge badge-info">Queue #${r.queuePosition}</span></td>
          <td>
            ${r.status === 'PENDING' ? '<span class="badge badge-warning">Waiting</span>' :
              r.status === 'NOTIFIED' ? '<span class="badge badge-success">Ready for Pickup</span>' :
              r.status === 'FULFILLED' ? '<span class="badge badge-info">Fulfilled</span>' : '<span class="badge badge-secondary">Cancelled</span>'}
          </td>
          <td>
            ${r.status === 'PENDING' || r.status === 'NOTIFIED' ? `
              <button class="btn btn-outline-danger btn-sm" onclick="App.cancelReservation(${r.id})">Cancel</button>
            ` : '<em>Closed</em>'}
          </td>
        </tr>
      `).join('');
    } catch (err) {
      this.showToast('Error loading reservations: ' + err.message, 'danger');
    }
  },

  async loadMyFines() {
    const user = API.getCurrentUser();
    if (!user) return;

    try {
      const fines = await API.fines.getMemberFines(user.userId);
      const tbody = document.getElementById('myfines-table-tbody');
      if (!tbody) return;

      if (!fines || fines.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No fines or dues on your account. Good standing!</td></tr>';
        return;
      }

      tbody.innerHTML = fines.map(f => {
        const balance = Number(f.amount) - Number(f.paidAmount);
        return `
          <tr>
            <td><strong>${f.fineNumber}</strong></td>
            <td>${f.reason || 'Overdue Book'}</td>
            <td>$${Number(f.amount).toFixed(2)}</td>
            <td><strong style="color:${balance > 0 ? '#dc2626' : '#059669'};">$${balance.toFixed(2)}</strong></td>
            <td>
              ${f.status === 'PAID' ? '<span class="badge badge-success">Paid</span>' :
                f.status === 'WAIVED' ? '<span class="badge badge-secondary">Waived</span>' : '<span class="badge badge-danger">Unpaid</span>'}
            </td>
            <td>
              ${balance > 0 && f.status !== 'WAIVED' ? `
                <button class="btn btn-success btn-sm" onclick="App.openPayFineModal(${f.id}, '${f.fineNumber}', ${balance})">Pay Online</button>
              ` : '<small class="text-muted">Cleared</small>'}
            </td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      this.showToast('Error loading fines: ' + err.message, 'danger');
    }
  },

  // -------------------------------------------------------------
  // 9. Profile & Settings
  // -------------------------------------------------------------
  loadSettingsView() {
    const user = API.getCurrentUser();
    if (!user) return;

    document.getElementById('profile-name-val').textContent = user.fullName || user.username;
    document.getElementById('profile-username-val').textContent = `@${user.username}`;
    document.getElementById('profile-email-val').textContent = user.email || 'N/A';
    document.getElementById('profile-role-val').textContent = user.role;
    document.getElementById('profile-memid-val').textContent = user.membershipNumber || 'Staff';
  },

  // -------------------------------------------------------------
  // In-App Notification Center
  // -------------------------------------------------------------
  async pollNotifications() {
    try {
      const res = await API.notifications.getUnreadCount();
      const badge = document.getElementById('notif-badge-count');
      if (badge) {
        const count = res.unreadCount || 0;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
      }
    } catch (ignored) {}
  },

  async loadNotificationsList() {
    try {
      const notifs = await API.notifications.getAll();
      const listContainer = document.getElementById('notif-items-container');
      if (!listContainer) return;

      if (!notifs || notifs.length === 0) {
        listContainer.innerHTML = '<div class="text-center text-muted py-4">No notifications</div>';
        return;
      }

      listContainer.innerHTML = notifs.map(n => `
        <div class="notif-item ${!n.read ? 'unread' : ''}" onclick="App.markNotificationRead(${n.id})">
          <div class="notif-title">${n.title}</div>
          <div class="notif-desc">${n.message}</div>
          <div class="notif-time">${new Date(n.createdAt).toLocaleTimeString()} &bull; ${new Date(n.createdAt).toLocaleDateString()}</div>
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  },

  async markNotificationRead(id) {
    try {
      await API.notifications.markRead(id);
      this.pollNotifications();
      this.loadNotificationsList();
    } catch (ignored) {}
  },

  async markAllNotificationsRead() {
    try {
      await API.notifications.markAllRead();
      this.pollNotifications();
      this.loadNotificationsList();
      this.showToast('All notifications marked as read', 'info');
    } catch (ignored) {}
  },

  // -------------------------------------------------------------
  // UI Helpers: Modals, Dialogs & Toasts
  // -------------------------------------------------------------
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  },

  openConfirmModal(title, message, onConfirm) {
    document.getElementById('confirm-modal-title').textContent = title;
    document.getElementById('confirm-modal-message').textContent = message;

    const confirmBtn = document.getElementById('confirm-modal-ok-btn');
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener('click', () => {
      this.closeAllModals();
      if (onConfirm) onConfirm();
    });

    this.openModal('confirm-modal');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div style="font-size:18px;">
        ${type === 'success' ? '&#10004;' : type === 'danger' ? '&#10006;' : '&#9888;'}
      </div>
      <div style="flex:1;">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
