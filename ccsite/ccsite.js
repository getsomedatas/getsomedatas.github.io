/* ═══════════════════════════════════════════════════════════════
   CCSITE.JS — reads cards.json and builds every section of the page
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Category emoji icons (fallback if JSON has none) ───────── */
  const CATEGORY_ICONS = {
    cards:  '💳',
    paypal: '🅿️',
    crypto: '₿',
  };

  /* ── Boot ──────────────────────────────────────────────────────── */
  fetch('cards.json')
    .then(r => r.json())
    .then(data => build(data))
    .catch(err => console.error('Failed to load cards.json:', err));

  /* ── Master builder ─────────────────────────────────────────── */
  function build(data) {
    buildSeoSpam(data.site);
    buildNav(data.site, data.nav);
    buildAbout(data.about);
    buildWhatWeSell(data.what_we_sell);
    buildPrice(data.product_categories, data.bulk_discount, data.site);
    buildShipping(data.shipping);
    buildForum(data.forum);
    buildFaq(data.faq);
    buildQA(data.qa);
    buildContact(data.contact);
    buildFooter(data.site);
    buildScrollTop();
    initModal(data.site);
  }

  /* ── SEO spam ─────────────────────────────────────────────────── */
  function buildSeoSpam(site) {
    const el = document.getElementById('seo-spam');
    if (el) el.textContent = site.seo_spam || '';
    document.title = site.title || 'CREDIT CARDS';
  }

  /* ── NAVBAR ───────────────────────────────────────────────────── */
  function buildNav(site, navItems) {
    // Brand
    const brand = document.getElementById('site-brand');
    if (brand) {
      brand.innerHTML = site.name || 'CC SHOP';
    }

    // Nav links
    const ul = document.getElementById('nav-links');
    if (!ul || !navItems) return;
    navItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'nav-item';
      const a = document.createElement('a');
      a.className = 'nav-link';
      a.href = '#' + item.anchor;
      a.textContent = item.label;
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  /* ── ABOUT ────────────────────────────────────────────────────── */
  function buildAbout(about) {
    const headline = document.getElementById('about-headline');
    const body     = document.getElementById('about-body');
    if (!about) return;

    if (headline) headline.textContent = about.headline || '';

    if (body) {
      // Main paragraphs
      (about.paragraphs || []).forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        body.appendChild(p);
      });

      // Terms
      if (about.terms_heading) {
        const strong = document.createElement('strong');
        strong.textContent = about.terms_heading;
        body.appendChild(strong);
      }
      if (about.terms) {
        const p = document.createElement('p');
        p.textContent = about.terms;
        body.appendChild(p);
      }

      // Refund
      if (about.refund_heading) {
        const strong = document.createElement('strong');
        strong.textContent = about.refund_heading;
        body.appendChild(strong);
      }
      if (about.refund) {
        const p = document.createElement('p');
        p.textContent = about.refund;
        body.appendChild(p);
      }

      // History
      if (about.history) {
        const p = document.createElement('p');
        p.textContent = about.history;
        body.appendChild(p);
      }

      // Recruiting
      if (about.recruiting) {
        const p = document.createElement('p');
        const em = document.createElement('em');
        em.textContent = about.recruiting;
        p.appendChild(em);
        body.appendChild(p);
      }
    }
  }

  /* ── WHAT WE SELL ─────────────────────────────────────────────── */
  function buildWhatWeSell(items) {
    const row = document.getElementById('products-icons');
    if (!row || !items) return;

    items.forEach(item => {
      const col = document.createElement('div');
      col.className = 'col-auto';

      const card = document.createElement('div');
      card.className = 'product-icon-card';

      const icon = document.createElement('span');
      icon.className = 'icon-emoji';
      icon.textContent = item.emoji || '📦';

      const name = document.createElement('span');
      name.className = 'icon-name';
      name.textContent = item.name;

      const desc = document.createElement('span');
      desc.className = 'icon-desc';
      desc.textContent = item.desc || '';

      card.append(icon, name, desc);
      col.appendChild(card);
      row.appendChild(col);
    });
  }

  /* ── PRICE LISTINGS ───────────────────────────────────────────── */
  function buildPrice(categories, bulkDiscount, site) {
    const container = document.getElementById('price-listings');
    const bulkNote  = document.getElementById('bulk-note');
    if (!container || !categories) return;

    categories.forEach(cat => {
      const icon = CATEGORY_ICONS[cat.id] || '📦';
      const card = document.createElement('div');
      card.className = 'price-card';

      // Left: icon image area
      const imgDiv = document.createElement('div');
      imgDiv.className = 'price-card-img';
      imgDiv.textContent = icon;

      // Right: body
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'price-card-body';

      const h3 = document.createElement('h3');
      h3.textContent = cat.name;

      const note = document.createElement('p');
      note.className = 'card-note';
      note.textContent = cat.note || '';

      bodyDiv.append(h3, note);

      // Product rows
      (cat.items || []).forEach(item => {
        const row = document.createElement('div');
        row.className = 'product-row';

        const priceEl = document.createElement('span');
        priceEl.className = 'prod-price';
        priceEl.textContent = `1 × $${item.price}`;

        const nameEl = document.createElement('span');
        nameEl.className = 'prod-name';
        nameEl.textContent = item.name;

        const btn = document.createElement('button');
        btn.className = 'btn-buy';
        btn.textContent = 'BUY';
        btn.dataset.productName  = item.name;
        btn.dataset.productPrice = `$${item.price} USD`;
        btn.dataset.productId    = item.id || '';

        row.append(priceEl, nameEl, btn);
        bodyDiv.appendChild(row);
      });

      card.append(imgDiv, bodyDiv);
      container.appendChild(card);
    });

    if (bulkNote && bulkDiscount) {
      bulkNote.textContent = bulkDiscount;
    }
  }

  /* ── SHIPPING ─────────────────────────────────────────────────── */
  function buildShipping(shipping) {
    const headline = document.getElementById('shipping-headline');
    const body     = document.getElementById('shipping-body');
    if (!shipping) return;

    if (headline) headline.textContent = shipping.headline || 'SHIPPING';

    if (body) {
      (shipping.body || []).forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        body.appendChild(p);
      });
    }
  }

  /* ── FORUM ────────────────────────────────────────────────────── */
  function buildForum(forum) {
    const intro = document.getElementById('forum-intro');
    const list  = document.getElementById('forum-posts');
    if (!forum) return;

    if (intro) intro.textContent = forum.intro || '';

    if (list) {
      (forum.posts || []).sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(post => {
          const isBad = post.rating <= 2;
          const div = document.createElement('div');
          div.className = 'forum-post' + (isBad ? ' bad-review' : '');

          const header = document.createElement('div');
          header.className = 'forum-post-header';

          const subject = document.createElement('span');
          subject.className = 'forum-post-subject';
          subject.textContent = post.subject;

          const meta = document.createElement('span');
          meta.className = 'forum-post-meta';
          meta.textContent = formatForumDate(post.date);

          header.append(subject, meta);

          const user = document.createElement('span');
          user.className = 'forum-post-user';
          user.textContent = '[ ' + post.user + ' ]';

          const body = document.createElement('p');
          body.className = 'forum-post-body';
          body.textContent = post.body;

          const footer = document.createElement('div');
          footer.className = 'forum-post-footer';

          const stars = document.createElement('span');
          stars.className = 'stars' + (isBad ? ' low' : '');
          stars.textContent = renderStars(post.rating || 0);

          const replies = document.createElement('span');
          replies.textContent = `${post.replies || 0} ${post.replies === 1 ? 'reply' : 'replies'}`;

          footer.append(stars, replies);
          div.append(header, user, body, footer);
          list.appendChild(div);
        });
    }
  }

  /* ── CONTACT ──────────────────────────────────────────────────── */
  function buildContact(contact) {
    const note  = document.getElementById('contact-note');
    const email = document.getElementById('contact-email');
    if (!contact) return;
    if (note)  note.textContent = contact.note || '';
    if (email) email.innerHTML  = (contact.emails || [contact.email]).map(e => `<span>${e}</span>`).join('<br>');
  }

  /* ── FOOTER ───────────────────────────────────────────────────── */
  function buildFooter(site) {
    const el = document.getElementById('footer-text');
    if (!el) return;
    const year = site.copyright_year || new Date().getFullYear();
    const name = site.name || 'CC SHOP';
    el.innerHTML = `Copyright &copy; ${year} <a href="#">${name}</a> — All rights reserved.`;
  }

  /* ── SCROLL TO TOP ────────────────────────────────────────────── */
  function buildScrollTop() {
    const a = document.createElement('a');
    a.id = 'scroll-top';
    a.href = '#';
    a.title = 'Scroll to top';
    a.innerHTML = '<i class="fas fa-angle-up"></i>';
    a.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(a);
  }

  /* ── ORDER MODAL wiring ───────────────────────────────────────── */
  function initModal(site) {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-buy');
      if (!btn) return;

      document.getElementById('modal-product-name').textContent  = btn.dataset.productName  || '—';
      document.getElementById('modal-product-price').textContent = btn.dataset.productPrice || '—';
      document.getElementById('modal-wallet').textContent        = site.btc_wallet           || '—';
      document.getElementById('modal-email').textContent         = site.contact_email        || '—';

      const modal = new bootstrap.Modal(document.getElementById('orderModal'));
      modal.show();
    });
  }

  /* ── Helpers ──────────────────────────────────────────────────── */
  function renderStars(n) {
    const full  = Math.round(Math.min(Math.max(n, 0), 5));
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  function formatForumDate(str) {
    try {
      return new Date(str).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return str; }
  }

})();
