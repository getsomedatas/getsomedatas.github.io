/* ═══════════════════════════════════════════════════════════════
   INBOX.JS — loads emails.json, renders list, handles selection
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  let allEmails   = [];
  let currentFolder = 'inbox';
  let selectedId    = null;

  const LABEL_NAMES = {
    buyer:   'Buyer',
    threat:  'Threat',
    partner: 'Partner',
    crypto:  'Crypto',
    sent:    'Sent',
    draft:   'Draft',
  };

  /* ── Fetch data and boot ────────────────────────────────────── */
  fetch('emails.json')
    .then(r => r.json())
    .then(data => init(data))
    .catch(err => console.error('Failed to load emails.json:', err));

  function init(data) {
    allEmails = data.emails;

    // Populate account info
    document.getElementById('account-avatar').textContent = data.account.avatar;
    document.getElementById('account-name').textContent   = data.account.name;
    document.getElementById('account-email').textContent  = data.account.email;

    // Update badges
    updateBadges();

    // Render initial folder
    renderFolder('inbox');

    // Folder nav click
    document.querySelectorAll('.folder-item').forEach(el => {
      el.addEventListener('click', () => {
        const folder = el.dataset.folder;
        document.querySelectorAll('.folder-item').forEach(f => f.classList.remove('active'));
        el.classList.add('active');
        renderFolder(folder);
      });
    });
  }

  /* ── Count unread per folder ────────────────────────────────── */
  function updateBadges() {
    const unreadInbox  = allEmails.filter(e => e.folder === 'inbox'  && !e.read).length;
    const unreadDrafts = allEmails.filter(e => e.folder === 'drafts' && !e.read).length;

    const bi = document.getElementById('badge-inbox');
    const bd = document.getElementById('badge-drafts');
    if (bi) bi.textContent = unreadInbox  || '';
    if (bd) bd.textContent = unreadDrafts || '';
  }

  /* ── Render folder email list ───────────────────────────────── */
  function renderFolder(folder) {
    currentFolder = folder;
    selectedId    = null;

    // Clear viewer
    showEmptyViewer();

    // Title
    const titles = {
      inbox:   'Inbox',
      sent:    'Sent',
      drafts:  'Drafts',
      starred: 'Starred',
      trash:   'Trash',
    };
    document.getElementById('list-folder-title').textContent = titles[folder] || folder;

    // Filter
    let emails;
    if (folder === 'starred') {
      emails = allEmails.filter(e => e.starred);
    } else {
      emails = allEmails.filter(e => e.folder === folder);
    }

    // Sort newest first
    emails = emails.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

    document.getElementById('list-count').textContent = emails.length
      ? `${emails.length} message${emails.length !== 1 ? 's' : ''}`
      : '';

    const list = document.getElementById('email-list');
    list.innerHTML = '';

    if (emails.length === 0) {
      const li = document.createElement('li');
      li.style.cssText = 'padding:32px 16px;text-align:center;color:var(--text-muted);font-size:13px;';
      li.textContent = 'No messages';
      list.appendChild(li);
      return;
    }

    emails.forEach(email => {
      const li = buildEmailItem(email);
      list.appendChild(li);
    });
  }

  /* ── Build a single list item ───────────────────────────────── */
  function buildEmailItem(email) {
    const li = document.createElement('li');
    li.className = 'email-item' + (email.read ? ' read' : '');
    li.dataset.id = email.id;

    const dot = document.createElement('span');
    dot.className = 'unread-dot';

    const fromEl = document.createElement('span');
    fromEl.className = 'email-item-from';
    fromEl.textContent = email.from;

    const dateEl = document.createElement('span');
    dateEl.className = 'email-item-date';
    dateEl.textContent = formatDate(email.date);

    const subjEl = document.createElement('span');
    subjEl.className = 'email-item-subject';
    subjEl.textContent = email.subject;

    const labelEl = document.createElement('span');
    labelEl.className = 'email-item-label label-' + (email.label || '');

    li.append(dot, fromEl, dateEl, subjEl, labelEl);

    li.addEventListener('click', () => selectEmail(email.id));

    return li;
  }

  function renderAttachments(attachments) {
  if (!attachments || attachments.length === 0) return;

    const section = document.createElement('div');
    section.className = 'attachments-section';

    const label = document.createElement('span');
    label.className = 'attachments-label';
    label.textContent = 'Attachments';
    section.appendChild(label);

    attachments.forEach(a => {
      const link = document.createElement('a');
      link.className = 'attachment-link';
      link.href = a.path;
      link.download = a.filename;
      link.textContent = '📎 ' + a.filename;
      section.appendChild(link);
    });

    return section;
  }

  /* ── Select and display email ───────────────────────────────── */
  function selectEmail(id) {
    const email = allEmails.find(e => e.id === id);
    if (!email) return;

    // Mark selected in list
    document.querySelectorAll('.email-item').forEach(el => {
      el.classList.toggle('selected', parseInt(el.dataset.id) === id);
    });

    // Mark as read
    if (!email.read) {
      email.read = true;
      const li = document.querySelector(`.email-item[data-id="${id}"]`);
      if (li) li.classList.add('read');
      updateBadges();
    }

    selectedId = id;

    // Populate viewer
    document.getElementById('viewer-subject').textContent = email.subject;

    // Label tag
    const labelTag = document.getElementById('viewer-label-tag');
    labelTag.textContent   = LABEL_NAMES[email.label] || '';
    labelTag.className     = 'viewer-label-tag label-' + (email.label || '');

    // Avatar initials (first char of from name)
    const initials = email.from
      .split(/[\s_@]/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');
    document.getElementById('viewer-avatar').textContent = initials;

    document.getElementById('viewer-from-name').textContent  = email.from;
    document.getElementById('viewer-from-email').textContent = '<' + email.fromEmail + '>';
    document.getElementById('viewer-to').textContent         = email.to || '—';
    document.getElementById('viewer-date').textContent       = formatDateLong(email.date);

    // Body — use mono style for encrypted-looking subjects
    // Body
    const bodyEl = document.getElementById('viewer-body');
    const hasAttachments = email.attachments && email.attachments.length > 0;
    bodyEl.className = 'viewer-body' + (hasAttachments ? ' mono' : '');
    bodyEl.textContent = email.body;

    // Attachments
    const existingAttachments = document.getElementById('viewer-attachments');
    if (existingAttachments) existingAttachments.remove();

    if (hasAttachments) {
      const attachmentSection = renderAttachments(email.attachments);
      attachmentSection.id = 'viewer-attachments';
      bodyEl.parentElement.appendChild(attachmentSection);
    }

    // Show content
    document.getElementById('viewer-empty').hidden   = true;
    document.getElementById('viewer-content').hidden = false;
  }

  /* ── Show empty viewer ──────────────────────────────────────── */
  function showEmptyViewer() {
    document.getElementById('viewer-empty').hidden   = false;
    document.getElementById('viewer-content').hidden = true;
    document.querySelectorAll('.email-item').forEach(el => el.classList.remove('selected'));
  }

  /* ── Date helpers ───────────────────────────────────────────── */
  function formatDate(isoStr) {
    const d = new Date(isoStr);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function formatDateLong(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleString([], {
      weekday: 'short',
      month:   'short',
      day:     'numeric',
      year:    'numeric',
      hour:    '2-digit',
      minute:  '2-digit',
    });
  }

})();
