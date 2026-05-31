// Load dynamic content — always shows fallback data, upgrades from API when available

const PROGRAM_LEVELS = {
  'little-comets': 'PreKG',
  'bright-stars': 'LKG',
  'supernovas': 'UKG'
};
const PROGRAM_CARD_CLASSES = ['card--comet', 'card--star', 'card--nova'];
const FACILITY_ICONS = ['🌟', '⏰', '🎉', '📚', '🎮', '❄️', '🚌', '📹'];

const FALLBACK_PROGRAMS = [
  { name: 'Little Comets', slug: 'little-comets', age_range: 'Age: 1.5–2 yrs', description: 'Gentle introduction to learning through sensory play, songs, and cosmic exploration.', icon: '☄️', sort_order: 1 },
  { name: 'Bright Stars', slug: 'bright-stars', age_range: 'Age: 2.5–3.5 yrs', description: 'Building foundational skills through creative play, early literacy, and social development.', icon: '⭐', sort_order: 2 },
  { name: 'SuperNovas', slug: 'supernovas', age_range: 'Age: 3.5–5 yrs', description: 'Preparing little explorers for school with structured learning and confidence-building.', icon: '💫', sort_order: 3 }
];

const FALLBACK_SCHEDULE = [
  { title: 'Welcome Circle and Songs', sort_order: 1 },
  { title: 'Story Time', sort_order: 2 },
  { title: 'Art and Messy Play', sort_order: 3 },
  { title: 'Outdoor Exploration', sort_order: 4 },
  { title: 'Healthy Snack Time', sort_order: 5 },
  { title: 'Music and Movement', sort_order: 6 }
];

const FALLBACK_FACILITIES = [
  { title: 'Full Time Care', sort_order: 1 },
  { title: 'Part Time Care', sort_order: 2 },
  { title: 'Holiday Care', sort_order: 3 },
  { title: 'Tuition', sort_order: 4 },
  { title: 'Projector and Toy Room', sort_order: 5 },
  { title: 'AC & Power', sort_order: 6 },
  { title: 'AC Transport', sort_order: 7 },
  { title: 'CCTV', sort_order: 8 }
];

document.addEventListener('DOMContentLoaded', () => {
  renderPrograms(FALLBACK_PROGRAMS);
  renderSchedule(FALLBACK_SCHEDULE);
  renderDaycareFacilities(FALLBACK_FACILITIES);
  renderTimings('9:30 AM – 12:30 PM', '8:00 AM – 8:00 PM');

  loadSettings();
  loadPrograms();
  loadSchedule();
  loadTimings();
  loadDaycareFacilities();
  loadGallery();
  loadAnnouncements();
});

function renderPrograms(programs) {
  const containers = document.querySelectorAll('[data-content="programs"]');
  if (!containers.length || !programs.length) return;

  const sorted = [...programs].filter(p => p.slug !== 'daycare').sort((a, b) => a.sort_order - b.sort_order);

  containers.forEach(container => {
    container.innerHTML = sorted.map((p, i) => {
      const level = PROGRAM_LEVELS[p.slug] || '';
      return `
        <div class="card ${PROGRAM_CARD_CLASSES[i] || ''}">
          <div class="card-icon">${p.icon || '⭐'}</div>
          <h3>${escapeHtml(p.name)} — ${level}</h3>
          <span class="card-age">${escapeHtml(p.age_range)}</span>
          ${p.description ? `<p>${escapeHtml(p.description)}</p>` : ''}
        </div>
      `;
    }).join('');
  });
}

function renderSchedule(items) {
  const containers = document.querySelectorAll('[data-content="schedule"]');
  if (!containers.length || !items.length) return;

  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);

  containers.forEach(container => {
    container.innerHTML = `
      <div class="adventure-list">
        ${sorted.map((item, i) => `
          <div class="adventure-list-item">
            <span class="num">${i + 1}</span>
            <h3>${escapeHtml(item.title)}</h3>
          </div>
        `).join('')}
      </div>
    `;
  });
}

function renderDaycareFacilities(facilities) {
  const containers = document.querySelectorAll('[data-content="daycare-facilities"]');
  if (!containers.length || !facilities.length) return;

  const sorted = [...facilities].sort((a, b) => a.sort_order - b.sort_order);

  containers.forEach(container => {
    container.innerHTML = sorted.map((f, i) => `
      <div class="facility-item facility-item--highlight">
        <span class="facility-badge">${i + 1}</span>
        <span class="facility-icon">${FACILITY_ICONS[i] || '✨'}</span>
        <div>
          <h4>${escapeHtml(f.title)}</h4>
          ${f.description ? `<p>${escapeHtml(f.description)}</p>` : ''}
        </div>
      </div>
    `).join('');
  });
}

function renderTimings(schoolHours, daycareHours) {
  const containers = document.querySelectorAll('[data-content="timings"]');
  if (!containers.length) return;

  containers.forEach(container => {
    container.innerHTML = `
      <div class="timing-card">
        <h3>🏫 School</h3>
        <p class="time">${escapeHtml(schoolHours)}</p>
      </div>
      <div class="timing-card">
        <h3>🌙 Daycare</h3>
        <p class="time">${escapeHtml(daycareHours)}</p>
      </div>
    `;
  });
}

async function loadSettings() {
  try {
    const { data } = await API.get('/settings');
    if (!data) return;

    document.querySelectorAll('[data-setting]').forEach(el => {
      const key = el.getAttribute('data-setting');
      if (data[key]) {
        if (el.tagName === 'A' && key === 'phone') {
          el.href = `tel:${data[key].replace(/\s/g, '')}`;
          el.textContent = data[key];
        } else if (el.tagName === 'A' && key === 'email') {
          el.href = `mailto:${data[key]}`;
          el.textContent = data[key];
        } else {
          el.textContent = data[key];
        }
      }
    });
  } catch (err) {
    console.warn('Settings load failed:', err.message);
  }
}

async function loadPrograms() {
  try {
    const { data } = await API.get('/programs');
    const fromApi = (data || []).filter(p => p.slug !== 'daycare');
    if (fromApi.length) renderPrograms(fromApi);
  } catch (err) {
    console.warn('Programs API failed, using fallback:', err.message);
  }
}

async function loadSchedule() {
  try {
    const { data } = await API.get('/schedule');
    if (data && data.length) renderSchedule(data);
  } catch (err) {
    console.warn('Schedule API failed, using fallback:', err.message);
  }
}

async function loadTimings() {
  try {
    const { data } = await API.get('/settings');
    renderTimings(
      data?.school_hours || '9:30 AM – 12:30 PM',
      data?.daycare_hours || '8:00 AM – 8:00 PM'
    );
  } catch (err) {
    console.warn('Timings load failed:', err.message);
  }
}

async function loadDaycareFacilities() {
  try {
    const { data } = await API.get('/daycare-facilities');
    if (data && data.length) renderDaycareFacilities(data);
  } catch (err) {
    console.warn('Daycare facilities API failed, using fallback:', err.message);
  }
}

async function loadGallery() {
  const containers = document.querySelectorAll('[data-content="gallery"]');
  if (!containers.length) return;

  try {
    const { data } = await API.get('/gallery');
    const items = (data || []).sort((a, b) => a.sort_order - b.sort_order);

    containers.forEach(container => {
      if (!items.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);grid-column:1/-1;">Gallery coming soon!</p>';
        return;
      }
      container.innerHTML = items.map(item => `
        <div class="gallery-item">
          <img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.caption || 'Gallery photo')}" loading="lazy">
          ${item.caption ? `<div class="gallery-caption">${escapeHtml(item.caption)}</div>` : ''}
        </div>
      `).join('');
    });
  } catch (err) {
    console.warn('Gallery load failed:', err.message);
  }
}

async function loadAnnouncements() {
  const container = document.getElementById('announcement-container');
  if (!container) return;

  try {
    const { data } = await API.get('/announcements');
    const active = (data || []).filter(a => a.active);
    if (!active.length) return;

    const announcement = active[0];
    container.innerHTML = `
      <div class="announcement-banner" role="alert">
        ${escapeHtml(announcement.title)}${announcement.body ? ': ' + escapeHtml(announcement.body) : ''}
      </div>
    `;
  } catch (err) {
    // Silent fail
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
