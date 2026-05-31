// Twinkle Stars Admin Dashboard

document.addEventListener('DOMContentLoaded', () => {
  if (API.isDemoMode()) {
    document.getElementById('demo-banner')?.style && (document.getElementById('demo-banner').style.display = 'block');
    document.getElementById('demo-banner-login')?.style && (document.getElementById('demo-banner-login').style.display = 'block');
  }

  if (API.getAuthToken()) {
    showDashboard();
  } else {
    initLogin();
  }
});

function initLogin() {
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.style.display = 'none';

    try {
      const { token } = await API.post('/auth/login', { password });
      API.setAuthToken(token);
      showDashboard();
    } catch (err) {
      errorEl.textContent = err.message || 'Login failed';
      errorEl.style.display = 'block';
    }
  });
}

function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  initNavigation();
  initLogout();
  loadOverview();
  initAdmissions();
  initPrograms();
  initSchedule();
  initDaycare();
  initGallery();
  initAnnouncements();
  initSettings();
}

function initNavigation() {
  document.querySelectorAll('#admin-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#admin-nav button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`panel-${btn.dataset.panel}`).classList.add('active');
    });
  });
}

function initLogout() {
  document.getElementById('logout-btn').addEventListener('click', () => {
    API.setAuthToken(null);
    location.reload();
  });
}

function adminToast(msg, type = 'success') {
  window.TwinkleStars?.showToast(msg, type);
}

async function loadOverview() {
  try {
    const [admissions, programs, gallery] = await Promise.all([
      API.get('/admissions', true),
      API.get('/programs'),
      API.get('/gallery')
    ]);
    const newCount = (admissions.data || []).filter(a => a.status === 'new').length;
    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card"><div class="number">${(admissions.data || []).length}</div><div class="label">Total Inquiries</div></div>
      <div class="stat-card"><div class="number">${newCount}</div><div class="label">New Inquiries</div></div>
      <div class="stat-card"><div class="number">${(programs.data || []).length}</div><div class="label">Programs</div></div>
      <div class="stat-card"><div class="number">${(gallery.data || []).length}</div><div class="label">Gallery Photos</div></div>
    `;
  } catch (err) {
    console.error(err);
  }
}

// --- Admissions CRUD ---
function initAdmissions() {
  loadAdmissionsTable();
}

async function loadAdmissionsTable() {
  try {
    const { data } = await API.get('/admissions', true);
    const tbody = document.getElementById('admissions-table');
    tbody.innerHTML = (data || []).map(a => `
      <tr>
        <td>${formatDate(a.created_at)}</td>
        <td>${esc(a.child_name)} (${esc(a.age)})</td>
        <td>${esc(a.program)}</td>
        <td>${esc(a.parent_name)}</td>
        <td>${esc(a.phone)}</td>
        <td><span class="status-badge status-${a.status}">${a.status}</span></td>
        <td class="admin-actions">
          <select onchange="updateAdmissionStatus(${a.id}, this.value)" class="btn-edit" style="padding:0.3rem;">
            <option value="">Status...</option>
            <option value="new" ${a.status==='new'?'selected':''}>New</option>
            <option value="contacted" ${a.status==='contacted'?'selected':''}>Contacted</option>
            <option value="enrolled" ${a.status==='enrolled'?'selected':''}>Enrolled</option>
            <option value="archived" ${a.status==='archived'?'selected':''}>Archived</option>
          </select>
          <button class="btn-delete" onclick="deleteAdmission(${a.id})">Delete</button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--color-text-muted);">No inquiries yet</td></tr>';
  } catch (err) {
    adminToast('Failed to load admissions', 'error');
  }
}

window.updateAdmissionStatus = async function(id, status) {
  if (!status) return;
  try {
    await API.put(`/admissions/${id}`, { status }, true);
    adminToast('Status updated');
    loadAdmissionsTable();
    loadOverview();
  } catch (err) {
    adminToast(err.message, 'error');
  }
};

window.deleteAdmission = async function(id) {
  if (!confirm('Delete this inquiry?')) return;
  try {
    await API.delete(`/admissions/${id}`, true);
    adminToast('Deleted');
    loadAdmissionsTable();
    loadOverview();
  } catch (err) {
    adminToast(err.message, 'error');
  }
};

function initPrograms() {
  const loadTable = async () => {

    try {
      const { data } = await API.get('/programs');
      document.getElementById('programs-table').innerHTML = (data || []).map(p => `
        <tr>
          <td>${p.icon || '⭐'}</td><td>${esc(p.name)}</td><td>${esc(p.age_range)}</td><td>${p.sort_order}</td>
          <td class="admin-actions">
            <button class="btn-edit" onclick="editProgram(${p.id}, '${escAttr(p.name)}', '${escAttr(p.slug)}', '${escAttr(p.icon||'⭐')}', '${escAttr(p.age_range)}', '${escAttr(p.description||'')}', ${p.sort_order})">Edit</button>
            <button class="btn-delete" onclick="deleteProgram(${p.id})">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      adminToast('Failed to load programs', 'error');
    }
  };
  document.getElementById('add-program').onclick = () => {
    document.getElementById('program-form').reset();
    document.getElementById('program-id').value = '';
    document.getElementById('program-form-card').style.display = 'block';
    document.getElementById('program-form-title').textContent = 'Add Program';
  };
  document.getElementById('cancel-program').onclick = () => {
    document.getElementById('program-form-card').style.display = 'none';
  };

  document.getElementById('program-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('program-id').value;
    const body = {
      name: document.getElementById('program-name').value,
      slug: document.getElementById('program-slug').value,
      icon: document.getElementById('program-icon').value || '⭐',
      age_range: document.getElementById('program-age').value,
      description: document.getElementById('program-desc').value,
      sort_order: parseInt(document.getElementById('program-order').value) || 0
    };
    try {
      if (id) await API.put(`/programs/${id}`, body, true);
      else await API.post('/programs', body, true);
      adminToast('Saved');
      document.getElementById('program-form-card').style.display = 'none';
      loadTable();
    } catch (err) {
      adminToast(err.message, 'error');
    }
  };

  loadTable();
}

window.deleteProgram = async function(id) {
  if (!confirm('Delete this program?')) return;
  try {
    await API.delete(`/programs/${id}`, true);
    adminToast('Deleted');
    initPrograms();
  } catch (err) {
    adminToast(err.message, 'error');
  }
};

window.editProgram = function(id, name, slug, icon, age, desc, order) {
  document.getElementById('program-id').value = id;
  document.getElementById('program-name').value = name;
  document.getElementById('program-slug').value = slug;
  document.getElementById('program-icon').value = icon;
  document.getElementById('program-age').value = age;
  document.getElementById('program-desc').value = desc;
  document.getElementById('program-order').value = order;
  document.getElementById('program-form-card').style.display = 'block';
  document.getElementById('program-form-title').textContent = 'Edit Program';
};

function initSchedule() {
  const loadTable = async () => {
    const { data } = await API.get('/schedule');
    document.getElementById('schedule-table').innerHTML = (data || []).map((s, i) => `
      <tr><td>${i+1}</td><td>${esc(s.title)}</td><td>${esc(s.description)}</td>
      <td class="admin-actions"><button class="btn-edit" onclick="editScheduleItem(${s.id}, '${escAttr(s.title)}', '${escAttr(s.description||'')}', ${s.sort_order})">Edit</button>
      <button class="btn-delete" onclick="deleteScheduleItem(${s.id})">Delete</button></td></tr>
    `).join('');
  };

  document.getElementById('add-schedule').onclick = () => {
    document.getElementById('schedule-form').reset();
    document.getElementById('schedule-id').value = '';
    document.getElementById('schedule-form-card').style.display = 'block';
    document.getElementById('schedule-form-title').textContent = 'Add Schedule Item';
  };
  document.getElementById('cancel-schedule').onclick = () => document.getElementById('schedule-form-card').style.display = 'none';

  document.getElementById('schedule-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('schedule-id').value;
    const body = { title: document.getElementById('schedule-title').value, description: document.getElementById('schedule-desc').value, sort_order: parseInt(document.getElementById('schedule-order').value) || 0 };
    try {
      if (id) await API.put(`/schedule/${id}`, body, true);
      else await API.post('/schedule', body, true);
      adminToast('Saved');
      document.getElementById('schedule-form-card').style.display = 'none';
      loadTable();
    } catch (err) { adminToast(err.message, 'error'); }
  };

  window.editScheduleItem = (id, title, desc, order) => {
    document.getElementById('schedule-id').value = id;
    document.getElementById('schedule-title').value = title;
    document.getElementById('schedule-desc').value = desc;
    document.getElementById('schedule-order').value = order;
    document.getElementById('schedule-form-card').style.display = 'block';
    document.getElementById('schedule-form-title').textContent = 'Edit Schedule Item';
  };
  window.deleteScheduleItem = async (id) => {
    if (!confirm('Delete?')) return;
    await API.delete(`/schedule/${id}`, true);
    adminToast('Deleted');
    loadTable();
  };
  loadTable();
}

function initDaycare() {
  const loadTable = async () => {
    const { data } = await API.get('/daycare-facilities');
    document.getElementById('daycare-table').innerHTML = (data || []).map(d => `
      <tr><td>${esc(d.title)}</td><td>${esc(d.description)}</td>
      <td class="admin-actions"><button class="btn-edit" onclick="editDaycareItem(${d.id}, '${escAttr(d.title)}', '${escAttr(d.description||'')}', ${d.sort_order})">Edit</button>
      <button class="btn-delete" onclick="deleteDaycareItem(${d.id})">Delete</button></td></tr>
    `).join('');
  };

  document.getElementById('add-daycare').onclick = () => {
    document.getElementById('daycare-form').reset();
    document.getElementById('daycare-id').value = '';
    document.getElementById('daycare-form-card').style.display = 'block';
  };
  document.getElementById('cancel-daycare').onclick = () => document.getElementById('daycare-form-card').style.display = 'none';

  document.getElementById('daycare-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('daycare-id').value;
    const body = { title: document.getElementById('daycare-title').value, description: document.getElementById('daycare-desc').value, sort_order: parseInt(document.getElementById('daycare-order').value) || 0 };
    try {
      if (id) await API.put(`/daycare-facilities/${id}`, body, true);
      else await API.post('/daycare-facilities', body, true);
      adminToast('Saved');
      document.getElementById('daycare-form-card').style.display = 'none';
      loadTable();
    } catch (err) { adminToast(err.message, 'error'); }
  };

  window.editDaycareItem = (id, title, desc, order) => {
    document.getElementById('daycare-id').value = id;
    document.getElementById('daycare-title').value = title;
    document.getElementById('daycare-desc').value = desc;
    document.getElementById('daycare-order').value = order;
    document.getElementById('daycare-form-card').style.display = 'block';
    document.getElementById('daycare-form-title').textContent = 'Edit Facility';
  };
  window.deleteDaycareItem = async (id) => {
    if (!confirm('Delete?')) return;
    await API.delete(`/daycare-facilities/${id}`, true);
    adminToast('Deleted');
    loadTable();
  };
  loadTable();
}

function initGallery() {
  const loadTable = async () => {
    const { data } = await API.get('/gallery');
    document.getElementById('gallery-table').innerHTML = (data || []).map(g => `
      <tr><td><img src="${esc(g.image_url)}" alt="" style="width:60px;height:45px;object-fit:cover;border-radius:4px;"></td>
      <td>${esc(g.caption)}</td>
      <td class="admin-actions"><button class="btn-edit" onclick="editGalleryItem(${g.id}, '${escAttr(g.image_url)}', '${escAttr(g.caption||'')}', ${g.sort_order})">Edit</button>
      <button class="btn-delete" onclick="deleteGalleryItem(${g.id})">Delete</button></td></tr>
    `).join('');
  };

  document.getElementById('add-gallery').onclick = () => {
    document.getElementById('gallery-form').reset();
    document.getElementById('gallery-id').value = '';
    document.getElementById('gallery-form-card').style.display = 'block';
  };
  document.getElementById('cancel-gallery').onclick = () => document.getElementById('gallery-form-card').style.display = 'none';

  document.getElementById('gallery-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('gallery-id').value;
    const body = { image_url: document.getElementById('gallery-url').value, caption: document.getElementById('gallery-caption').value, sort_order: parseInt(document.getElementById('gallery-order').value) || 0 };
    try {
      if (id) await API.put(`/gallery/${id}`, body, true);
      else await API.post('/gallery', body, true);
      adminToast('Saved');
      document.getElementById('gallery-form-card').style.display = 'none';
      loadTable();
      loadOverview();
    } catch (err) { adminToast(err.message, 'error'); }
  };

  window.editGalleryItem = (id, url, caption, order) => {
    document.getElementById('gallery-id').value = id;
    document.getElementById('gallery-url').value = url;
    document.getElementById('gallery-caption').value = caption;
    document.getElementById('gallery-order').value = order;
    document.getElementById('gallery-form-card').style.display = 'block';
  };
  window.deleteGalleryItem = async (id) => {
    if (!confirm('Delete?')) return;
    await API.delete(`/gallery/${id}`, true);
    adminToast('Deleted');
    loadTable();
    loadOverview();
  };
  loadTable();
}

function initAnnouncements() {
  const loadTable = async () => {
    const { data } = await API.get('/announcements');
    document.getElementById('announcements-table').innerHTML = (data || []).map(a => `
      <tr><td>${esc(a.title)}</td><td>${a.active ? '✅ Yes' : '❌ No'}</td>
      <td class="admin-actions"><button class="btn-edit" onclick="editAnnouncement(${a.id}, '${escAttr(a.title)}', '${escAttr(a.body||'')}', ${a.active})">Edit</button>
      <button class="btn-delete" onclick="deleteAnnouncement(${a.id})">Delete</button></td></tr>
    `).join('');
  };

  document.getElementById('add-announcement').onclick = () => {
    document.getElementById('announcement-form').reset();
    document.getElementById('announcement-id').value = '';
    document.getElementById('announcement-form-card').style.display = 'block';
  };
  document.getElementById('cancel-announcement').onclick = () => document.getElementById('announcement-form-card').style.display = 'none';

  document.getElementById('announcement-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('announcement-id').value;
    const body = { title: document.getElementById('announcement-title').value, body: document.getElementById('announcement-body').value, active: document.getElementById('announcement-active').checked };
    try {
      if (id) await API.put(`/announcements/${id}`, body, true);
      else await API.post('/announcements', body, true);
      adminToast('Saved');
      document.getElementById('announcement-form-card').style.display = 'none';
      loadTable();
    } catch (err) { adminToast(err.message, 'error'); }
  };

  window.editAnnouncement = (id, title, body, active) => {
    document.getElementById('announcement-id').value = id;
    document.getElementById('announcement-title').value = title;
    document.getElementById('announcement-body').value = body;
    document.getElementById('announcement-active').checked = active;
    document.getElementById('announcement-form-card').style.display = 'block';
  };
  window.deleteAnnouncement = async (id) => {
    if (!confirm('Delete?')) return;
    await API.delete(`/announcements/${id}`, true);
    adminToast('Deleted');
    loadTable();
  };
  loadTable();
}

function initSettings() {
  API.get('/settings').then(({ data }) => {
    if (!data) return;
    document.getElementById('set-hero-tagline').value = data.hero_tagline || '';
    document.getElementById('set-mission-quote').value = data.mission_quote || '';
    document.getElementById('set-daycare-quote').value = data.daycare_quote || '';
    document.getElementById('set-phone').value = data.phone || '';
    document.getElementById('set-email').value = data.email || '';
    document.getElementById('set-address').value = data.address || '';
    document.getElementById('set-school-hours').value = data.school_hours || '';
    document.getElementById('set-daycare-hours').value = data.daycare_hours || '';
  });

  document.getElementById('settings-form').onsubmit = async (e) => {
    e.preventDefault();
    const body = {
      hero_tagline: document.getElementById('set-hero-tagline').value,
      mission_quote: document.getElementById('set-mission-quote').value,
      daycare_quote: document.getElementById('set-daycare-quote').value,
      phone: document.getElementById('set-phone').value,
      email: document.getElementById('set-email').value,
      address: document.getElementById('set-address').value,
      school_hours: document.getElementById('set-school-hours').value,
      daycare_hours: document.getElementById('set-daycare-hours').value
    };
    try {
      await API.put('/settings', body, true);
      adminToast('Settings saved');
    } catch (err) {
      adminToast(err.message, 'error');
    }
  };
}

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function escAttr(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
