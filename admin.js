/* =========================================================
   HomeTaste Kitchen — Admin Dashboard Script
   ========================================================= */

const SEED_MENU = [
  {id:1, name:'Paneer Butter Masala', cat:'Lunch', price:249, type:'veg', img:'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w:400'},
  {id:2, name:'Chicken Biryani', cat:'Lunch', price:299, type:'nonveg', img:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400'},
  {id:3, name:'Masala Dosa', cat:'Breakfast', price:99, type:'veg', img:'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400'},
  {id:4, name:'Gulab Jamun', cat:'Desserts', price:79, type:'veg', img:'https://images.unsplash.com/photo-1601303516361-f2b1ba0d95b2?w=400'}
];

document.addEventListener('DOMContentLoaded', () => {
  handleLogin();
  guardAdminPage();
  initSidebarActive();
  initLogout();
  initDashboardStats();
  initMenuManagement();
  initGalleryManagement();
  initBookingManagement();
  initPricingManager();
  initBusinessSettings();
});

/* ---------- Auth (demo only — localStorage flag) ---------- */
function handleLogin(){
  const form = document.getElementById('adminLoginForm');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = form.username.value.trim();
    const pass = form.password.value.trim();
    if(!user || !pass){ showAdminToast('Enter both username and password.', true); return; }
    localStorage.setItem('htk_admin_auth', JSON.stringify({user, at: Date.now()}));
    showAdminToast('Login successful — redirecting…');
    setTimeout(() => window.location.href = 'admin.html', 700);
  });
}

function guardAdminPage(){
  if(!document.querySelector('.admin-shell')) return;
  const nameEl = document.getElementById('adminUserName');
  const auth = JSON.parse(localStorage.getItem('htk_admin_auth') || 'null');
  if(nameEl) nameEl.textContent = auth?.user || 'Admin';
}

function initLogout(){
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('htk_admin_auth');
    window.location.href = 'admin-login.html';
  });
}

function initSidebarActive(){
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if(link.dataset.tab){
        e.preventDefault();
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
        document.getElementById(link.dataset.tab).style.display = 'block';
      }
    });
  });
}

/* ---------- Data helpers ---------- */
function getMenu(){
  let menu = JSON.parse(localStorage.getItem('htk_menu') || 'null');
  if(!menu){ menu = SEED_MENU; localStorage.setItem('htk_menu', JSON.stringify(menu)); }
  return menu;
}
function saveMenu(menu){ localStorage.setItem('htk_menu', JSON.stringify(menu)); }

function getBookings(){ return JSON.parse(localStorage.getItem('htk_bookings') || '[]'); }
function saveBookings(b){ localStorage.setItem('htk_bookings', JSON.stringify(b)); }

function getGallery(){ return JSON.parse(localStorage.getItem('htk_gallery') || '[]'); }
function saveGallery(g){ localStorage.setItem('htk_gallery', JSON.stringify(g)); }

/* ---------- Dashboard stats ---------- */
function initDashboardStats(){
  const el = document.getElementById('statTotalOrders');
  if(!el) return;
  const bookings = getBookings();
  document.getElementById('statTotalOrders').textContent = bookings.length;
  document.getElementById('statCatering').textContent = bookings.filter(b => b.guests).length;
  document.getElementById('statMenuItems').textContent = getMenu().length;
  const customers = new Set(bookings.map(b => b.phone));
  document.getElementById('statCustomers').textContent = customers.size;
}

/* ---------- Menu Management (CRUD) ---------- */
function initMenuManagement(){
  const tbody = document.getElementById('menuTableBody');
  if(!tbody) return;

  function render(){
    const menu = getMenu();
    tbody.innerHTML = menu.map(item => `
      <tr>
        <td><img src="${item.img}" alt="${item.name}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;"></td>
        <td>${item.name}</td>
        <td>${item.cat}</td>
        <td>₹${item.price}</td>
        <td style="text-transform:capitalize;">${item.type}</td>
        <td>
          <button class="icon-btn edit-item" data-id="${item.id}"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn delete-item" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('.delete-item').forEach(btn => btn.addEventListener('click', () => {
      let menu = getMenu().filter(m => m.id != btn.dataset.id);
      saveMenu(menu); render(); initDashboardStats();
      showAdminToast('Dish deleted.');
    }));
    tbody.querySelectorAll('.edit-item').forEach(btn => btn.addEventListener('click', () => openMenuModal(btn.dataset.id)));
  }

  document.getElementById('addDishBtn')?.addEventListener('click', () => openMenuModal());
  document.getElementById('menuModalClose')?.addEventListener('click', closeMenuModal);
  document.getElementById('menuModalOverlay')?.addEventListener('click', (e) => { if(e.target.id === 'menuModalOverlay') closeMenuModal(); });

  const imgInput = document.getElementById('dishImageInput');
  imgInput?.addEventListener('change', () => {
    const file = imgInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('dishImagePreview').src = reader.result;
      document.getElementById('dishImagePreview').style.display = 'block';
      imgInput.dataset.preview = reader.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('dishForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    let menu = getMenu();
    const id = form.dataset.editId ? parseInt(form.dataset.editId) : Date.now();
    const dish = {
      id, name: form.dishName.value, cat: form.dishCat.value,
      price: parseFloat(form.dishPrice.value), type: form.dishType.value,
      img: imgInput.dataset.preview || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    };
    if(form.dataset.editId){
      menu = menu.map(m => m.id === id ? dish : m);
    } else {
      menu.push(dish);
    }
    saveMenu(menu); render(); initDashboardStats(); closeMenuModal();
    showAdminToast('Dish saved successfully.');
  });

  function openMenuModal(id){
    const form = document.getElementById('dishForm');
    form.reset();
    delete form.dataset.editId;
    document.getElementById('dishImagePreview').style.display = 'none';
    document.getElementById('menuModalTitle').textContent = 'Add Dish';
    if(id){
      const item = getMenu().find(m => m.id == id);
      if(item){
        form.dataset.editId = id;
        form.dishName.value = item.name; form.dishCat.value = item.cat;
        form.dishPrice.value = item.price; form.dishType.value = item.type;
        document.getElementById('dishImagePreview').src = item.img;
        document.getElementById('dishImagePreview').style.display = 'block';
        imgInput.dataset.preview = item.img;
        document.getElementById('menuModalTitle').textContent = 'Edit Dish';
      }
    }
    document.getElementById('menuModalOverlay').classList.add('open');
  }
  function closeMenuModal(){ document.getElementById('menuModalOverlay').classList.remove('open'); }

  render();
}

/* ---------- Gallery Management ---------- */
function initGalleryManagement(){
  const grid = document.getElementById('adminGalleryGrid');
  if(!grid) return;

  function render(){
    const items = getGallery();
    if(!items.length){
      grid.innerHTML = '<p class="empty-note">No images uploaded yet. Add some with the button above.</p>';
      return;
    }
    grid.innerHTML = items.map(img => `
      <div style="position:relative;border-radius:12px;overflow:hidden;">
        <img src="${img.src}" style="width:100%;height:120px;object-fit:cover;">
        <button class="icon-btn del-gallery" data-id="${img.id}" style="position:absolute;top:6px;right:6px;background:#fff;"><i class="fa-solid fa-trash"></i></button>
      </div>`).join('');
    grid.querySelectorAll('.del-gallery').forEach(btn => btn.addEventListener('click', () => {
      saveGallery(getGallery().filter(g => g.id != btn.dataset.id));
      render();
    }));
  }

  document.getElementById('galleryUploadInput')?.addEventListener('change', (e) => {
    [...e.target.files].forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const items = getGallery();
        items.push({id: Date.now() + Math.random(), src: reader.result});
        saveGallery(items); render();
      };
      reader.readAsDataURL(file);
    });
    showAdminToast('Images uploaded.');
  });

  render();
}

/* ---------- Booking Management ---------- */
function initBookingManagement(){
  const tbody = document.getElementById('bookingTableBody');
  if(!tbody) return;

  function render(){
    const bookings = getBookings();
    if(!bookings.length){
      tbody.innerHTML = '<tr><td colspan="7" class="empty-note">No bookings yet.</td></tr>';
      return;
    }
    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td>${b.name || '—'}</td>
        <td>${b.phone || '—'}</td>
        <td>${b.date || '—'}</td>
        <td>${b.guests || '—'}</td>
        <td><span class="status-tag status-${(b.status||'pending').toLowerCase()}">${b.status || 'Pending'}</span></td>
        <td>${b.total || '—'}</td>
        <td>
          <select class="status-select" data-id="${b.id}">
            <option ${b.status==='Pending'?'selected':''}>Pending</option>
            <option ${b.status==='Confirmed'?'selected':''}>Confirmed</option>
            <option ${b.status==='Cancelled'?'selected':''}>Cancelled</option>
          </select>
        </td>
      </tr>`).join('');
    tbody.querySelectorAll('.status-select').forEach(sel => sel.addEventListener('change', () => {
      const bookings = getBookings().map(b => b.id == sel.dataset.id ? {...b, status: sel.value} : b);
      saveBookings(bookings); render();
      showAdminToast('Booking status updated.');
    }));
  }
  render();
}

/* ---------- Pricing Manager ---------- */
function initPricingManager(){
  const form = document.getElementById('pricingForm');
  if(!form) return;
  const pricing = JSON.parse(localStorage.getItem('htk_pricing') || '{"silver":499,"gold":799,"platinum":1199}');
  form.silverPrice.value = pricing.silver;
  form.goldPrice.value = pricing.gold;
  form.platinumPrice.value = pricing.platinum;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {silver: form.silverPrice.value, gold: form.goldPrice.value, platinum: form.platinumPrice.value};
    localStorage.setItem('htk_pricing', JSON.stringify(updated));
    showAdminToast('Package pricing updated.');
  });
}

/* ---------- Business Settings ---------- */
function initBusinessSettings(){
  const form = document.getElementById('settingsForm');
  if(!form) return;
  const settings = JSON.parse(localStorage.getItem('htk_settings') || '{}');
  Object.keys(settings).forEach(key => { if(form[key]) form[key].value = settings[key]; });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {};
    [...form.elements].forEach(el => { if(el.name) data[el.name] = el.value; });
    localStorage.setItem('htk_settings', JSON.stringify(data));
    showAdminToast('Business settings saved.');
  });
}

/* ---------- Toast ---------- */
function showAdminToast(msg, isError){
  let toast = document.getElementById('htkAdminToast');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'htkAdminToast';
    toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);background:#3D7A52;color:#fff;padding:16px 26px;border-radius:99px;font-family:Poppins,sans-serif;font-size:.88rem;font-weight:600;z-index:3000;opacity:0;transition:.35s;box-shadow:0 16px 40px rgba(0,0,0,.25);';
    document.body.appendChild(toast);
  }
  toast.style.background = isError ? '#B0432C' : '#3D7A52';
  toast.textContent = msg;
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; });
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(20px)'; }, 3000);
}
