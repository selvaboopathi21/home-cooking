/* =========================================================
   HomeTaste Kitchen — Shared Front-End Script
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollReveal();
  initFAQ();
  initLightbox();
  initGalleryFilter();
  inithomefoodPage();
  initCateringCalculator();
  initCateringBookingForm();
  initBookingPage();
  initContactForm();
  initNewsletter();
  updateCartBadge();
});

/* ---------- Mobile Nav ---------- */
function initMobileNav(){
  const btn = document.querySelector('.hamburger');
  const panel = document.querySelector('.mobile-panel');
  const overlay = document.querySelector('.overlay');
  if(!btn || !panel) return;
  const toggle = (open) => {
    panel.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
  };
  btn.addEventListener('click', () => toggle(!panel.classList.contains('open')));
  overlay.addEventListener('click', () => toggle(false));
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
}

/* ---------- Scroll Reveal ---------- */
function initScrollReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target);} });
  }, {threshold:.15});
  items.forEach(i => io.observe(i));
}

/* ---------- FAQ Accordion ---------- */
function initFAQ(){
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q')?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if(!isOpen) item.classList.add('open');
    });
  });
}

/* ---------- Gallery Lightbox ---------- */
function initLightbox(){
  const lb = document.querySelector('.lightbox');
  if(!lb) return;
  const img = lb.querySelector('img');
  document.querySelectorAll('.g-item img').forEach(pic => {
    pic.addEventListener('click', () => { img.src = pic.src; lb.classList.add('open'); });
  });
  lb.querySelector('.lightbox-close')?.addEventListener('click', () => lb.classList.remove('open'));
  lb.addEventListener('click', (e) => { if(e.target === lb) lb.classList.remove('open'); });
}

function initGalleryFilter(){
  const chips = document.querySelectorAll('.gallery-filter .chip');
  if(!chips.length) return;
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.cat;
      document.querySelectorAll('.g-item').forEach(item => {
        item.style.display = (cat === 'all' || item.dataset.cat === cat) ? 'block' : 'none';
      });
    });
  });
}

/* =========================================================
   homefood PAGE — search, category filter, cart
   ========================================================= */
function inithomefoodPage(){
  const grid = document.getElementById('homefoodGrid');
  if(!grid) return;

  const search = document.getElementById('homefoodSearch');
  const chips = document.querySelectorAll('.homefood-chip');

  const applyFilter = () => {
    const term = (search?.value || '').toLowerCase().trim();
    const activeCat = document.querySelector('.homefood-chip.active')?.dataset.cat || 'all';
    document.querySelectorAll('.dish-card').forEach(card => {
      const name = card.dataset.name.toLowerCase();
      const cat = card.dataset.cat;
      const matchesSearch = name.includes(term);
      const matchesCat = activeCat === 'all' || cat === activeCat;
      card.style.display = (matchesSearch && matchesCat) ? '' : 'none';
    });
  };

  search?.addEventListener('input', applyFilter);
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyFilter();
    });
  });

  grid.querySelectorAll('.add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.dish-card');
      addToCart({
        name: card.dataset.name,
        price: parseFloat(card.dataset.price)
      });
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      setTimeout(() => btn.innerHTML = '<i class="fa-solid fa-plus"></i>', 900);
    });
  });
}

function addToCart(item){
  const cart = JSON.parse(localStorage.getItem('htk_cart') || '[]');
  cart.push(item);
  localStorage.setItem('htk_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge(){
  const cart = JSON.parse(localStorage.getItem('htk_cart') || '[]');
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = cart.length);
}

/* =========================================================
   CATERING PAGE — live calculator + homefood builder
   ========================================================= */
function initCateringCalculator(){
  const calc = document.getElementById('cateringCalc');
  if(!calc) return;

  const state = { event: 'Birthday', guests: 50, pkg: 'Silver', items: {} };
  const basePrice = { Silver: 499, Gold: 799, Platinum: 1199 };

  document.querySelectorAll('.event-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.event-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      state.event = opt.dataset.value;
      recalc();
    });
  });

  document.querySelectorAll('.pkg-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.pkg-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      state.pkg = opt.dataset.value;
      recalc();
    });
  });

  const guestSlider = document.getElementById('guestSlider');
  guestSlider?.addEventListener('input', () => {
    state.guests = parseInt(guestSlider.value, 10);
    document.getElementById('guestVal').textContent = state.guests;
    recalc();
  });

  document.querySelectorAll('.builder-item input').forEach(chk => {
    chk.addEventListener('change', () => {
      state.items[chk.dataset.item] = chk.checked ? parseFloat(chk.dataset.price) : 0;
      recalc();
    });
  });

  function recalc(){
    const perGuest = basePrice[state.pkg];
    const addOns = Object.values(state.items).reduce((a,b) => a+b, 0);
    const total = (perGuest * state.guests) + (addOns * state.guests);
    document.getElementById('estAmount').textContent = '₹' + total.toLocaleString('en-IN');
    document.getElementById('estEvent').textContent = state.event;
    document.getElementById('estGuests').textContent = state.guests;
    document.getElementById('estPkg').textContent = state.pkg;
    document.getElementById('estAddons').textContent = '₹' + (addOns * state.guests).toLocaleString('en-IN');
    const hidden = document.getElementById('cateringHiddenTotal');
    if(hidden) hidden.value = total;
  }
  recalc();
}

/* ---------- Catering booking form ---------- */
function initCateringBookingForm(){
  const form = document.getElementById('cateringBookingForm');
  if(!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if(!field.value.trim()){ valid = false; field.style.borderColor = '#B0432C'; }
      else field.style.borderColor = '';
    });
    if(!valid){ showToast('Please fill in all required fields.', true); return; }

    const estAmount = document.getElementById('estAmount')?.textContent || '₹0';
    const record = {
      name: form.fullName.value, phone: form.phone.value, eventDate: form.eventDate.value,
      guestCount: form.guestCount.value, address: form.address.value, notes: form.notes.value,
      eventType: document.getElementById('estEvent')?.textContent || '',
      package: document.getElementById('estPkg')?.textContent || '',
      estimatedTotal: estAmount, status: 'Pending', id: Date.now()
    };

    const enquiries = JSON.parse(localStorage.getItem('htk_catering_enquiries') || '[]');
    enquiries.push(record);
    localStorage.setItem('htk_catering_enquiries', JSON.stringify(enquiries));

    sendToGoogleSheet('Catering', record);

    showToast('Catering enquiry received! Our team will call you to confirm details.');
    form.reset();
  });
}

/* =========================================================
   BOOKING PAGE — order summary + validation
   ========================================================= */
function initBookingPage(){
  const form = document.getElementById('bookingForm');
  if(!form) return;

  const cart = JSON.parse(localStorage.getItem('htk_cart') || '[]');
  const summaryEl = document.getElementById('orderSummary');
  const totalEl = document.getElementById('orderTotal');

  function renderSummary(){
    if(!cart.length){
      summaryEl.innerHTML = '<p class="empty-note">No dishes selected yet. Add items from the homefood page, or describe your requirements in special instructions.</p>';
      totalEl.textContent = '₹0';
      return;
    }
    let total = 0;
    summaryEl.innerHTML = cart.map(i => {
      total += i.price;
      return `<div class="summary-item"><span>${i.name}</span><span>₹${i.price}</span></div>`;
    }).join('');
    totalEl.textContent = '₹' + total.toLocaleString('en-IN');
  }
  renderSummary();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if(!field.value.trim()){ valid = false; field.style.borderColor = '#B0432C'; }
      else field.style.borderColor = '';
    });
    if(!valid){
      showToast('Please fill in all required fields.', true);
      return;
    }
    const bookingRecord = {
      name: form.fullName.value, phone: form.phone.value, email: form.email.value,
      address: form.address.value, date: form.eventDate.value, guests: form.guests.value,
      notes: form.notes.value, cart, total: totalEl.textContent, status: 'Pending',
      id: Date.now()
    };
    const bookings = JSON.parse(localStorage.getItem('htk_bookings') || '[]');
    bookings.push(bookingRecord);
    localStorage.setItem('htk_bookings', JSON.stringify(bookings));
    localStorage.removeItem('htk_cart');

    sendToGoogleSheet('Bookings', {
      name: bookingRecord.name, phone: bookingRecord.phone, email: bookingRecord.email,
      address: bookingRecord.address, eventDate: bookingRecord.date, guests: bookingRecord.guests,
      notes: bookingRecord.notes, items: cart.map(i => i.name).join(', '), total: bookingRecord.total,
      status: bookingRecord.status
    });

    showToast('Booking confirmed! We will call you shortly to finalize details.');
    form.reset();
    setTimeout(() => { cart.length = 0; renderSummary(); }, 300);
  });

  document.getElementById('resetBooking')?.addEventListener('click', () => {
    form.reset();
    document.querySelectorAll('.form-field input, .form-field textarea').forEach(f => f.style.borderColor = '');
  });
}

/* ---------- Contact form ---------- */
function initContactForm(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = form.querySelectorAll('input, textarea');
    const record = {
      name: inputs[0]?.value || '', phone: inputs[1]?.value || '',
      email: inputs[2]?.value || '', message: inputs[3]?.value || ''
    };

    const messages = JSON.parse(localStorage.getItem('htk_contact_messages') || '[]');
    messages.push({...record, id: Date.now()});
    localStorage.setItem('htk_contact_messages', JSON.stringify(messages));

    sendToGoogleSheet('Contact', record);

    showToast("Thanks for reaching out! We'll reply within 24 hours.");
    form.reset();
  });
}

/* ---------- Newsletter ---------- */
function initNewsletter(){
  const form = document.getElementById('newsletterForm');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type=email]')?.value || '';

    const subs = JSON.parse(localStorage.getItem('htk_newsletter') || '[]');
    subs.push({email, id: Date.now()});
    localStorage.setItem('htk_newsletter', JSON.stringify(subs));

    sendToGoogleSheet('Newsletter', {email});

    showToast("You're subscribed! Fresh offers land in your inbox soon.");
    form.reset();
  });
}

/* ---------- Toast ---------- */
function showToast(msg, isError){
  let toast = document.getElementById('htkToast');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'htkToast';
    toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);background:#3B2F2F;color:#fff;padding:16px 26px;border-radius:99px;font-family:Poppins,sans-serif;font-size:.88rem;font-weight:600;z-index:3000;opacity:0;transition:.35s;box-shadow:0 16px 40px rgba(0,0,0,.25);';
    document.body.appendChild(toast);
  }
  toast.style.background = isError ? '#B0432C' : '#3D7A52';
  toast.textContent = msg;
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; });
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3200);
}
