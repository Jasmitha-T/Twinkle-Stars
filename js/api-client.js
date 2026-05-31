// API client with demo mode fallback (localStorage)

const DEMO_KEY = 'twinkle_stars_demo_data_v2';
const isDemoMode = () => new URLSearchParams(window.location.search).has('demo');

const defaultDemoData = {
  admissions: [],
  programs: [
    { id: 1, name: 'Little Comets', slug: 'little-comets', age_range: 'Age: 1.5–2 yrs', description: 'Gentle introduction to learning through sensory play, songs, and cosmic exploration for our youngest stars.', icon: '☄️', sort_order: 1 },
    { id: 2, name: 'Bright Stars', slug: 'bright-stars', age_range: 'Age: 2.5–3.5 yrs', description: 'Building foundational skills through creative play, early literacy, and social development in a nurturing environment.', icon: '⭐', sort_order: 2 },
    { id: 3, name: 'SuperNovas', slug: 'supernovas', age_range: 'Age: 3.5–5 yrs', description: 'Preparing little explorers for school with structured learning, problem-solving, and confidence-building activities.', icon: '💫', sort_order: 3 }
  ],
  schedule_items: [
    { id: 1, title: 'Welcome Circle and Songs', description: '', sort_order: 1 },
    { id: 2, title: 'Story Time', description: '', sort_order: 2 },
    { id: 3, title: 'Art and Messy Play', description: '', sort_order: 3 },
    { id: 4, title: 'Outdoor Exploration', description: '', sort_order: 4 },
    { id: 5, title: 'Healthy Snack Time', description: '', sort_order: 5 },
    { id: 6, title: 'Music and Movement', description: '', sort_order: 6 }
  ],
  daycare_facilities: [
    { id: 1, title: 'Full Time Care', description: '', sort_order: 1 },
    { id: 2, title: 'Part Time Care', description: '', sort_order: 2 },
    { id: 3, title: 'Holiday Care', description: '', sort_order: 3 },
    { id: 4, title: 'Tuition', description: '', sort_order: 4 },
    { id: 5, title: 'Projector and Toy Room', description: '', sort_order: 5 },
    { id: 6, title: 'AC & Power', description: '', sort_order: 6 },
    { id: 7, title: 'AC Transport', description: '', sort_order: 7 },
    { id: 8, title: 'CCTV', description: '', sort_order: 8 }
  ],
  gallery: [
    { id: 1, image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80', caption: 'Happy learning moments', sort_order: 1 },
    { id: 2, image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80', caption: 'Creative art time', sort_order: 2 },
    { id: 3, image_url: 'https://images.unsplash.com/photo-1560421337-19d275b5e265?w=600&q=80', caption: 'Outdoor adventures', sort_order: 3 },
    { id: 4, image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', caption: 'Story time magic', sort_order: 4 },
    { id: 5, image_url: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=600&q=80', caption: 'Music and movement', sort_order: 5 },
    { id: 6, image_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&q=80', caption: 'Playful discovery', sort_order: 6 }
  ],
  announcements: [],
  settings: {
    slogan: 'Knowledge is Power',
    hero_tagline: 'Knowledge is Power',
    mission_quote: 'Nurturing Minds, Building Future',
    mission: 'To provide a safe, joyful, and stimulating cosmic learning environment where every child discovers their unique potential through play, exploration, and caring guidance.',
    vision: 'To be the brightest star in early childhood education — shaping confident, curious, and compassionate young minds ready to explore the universe of knowledge.',
    daycare_quote: 'Where every child finds a SPARK',
    phone: '+91 12345 67890',
    email: 'info@twinklestars.com',
    address: '123 Starlight Avenue, Galaxy City',
    school_hours: '9:30 AM – 12:30 PM',
    daycare_hours: '8:00 AM – 8:00 PM'
  }
};

function getDemoData() {
  const stored = localStorage.getItem(DEMO_KEY);
  let data;
  if (stored) {
    try {
      data = JSON.parse(stored);
    } catch {
      data = { ...defaultDemoData };
    }
  } else {
    data = JSON.parse(JSON.stringify(defaultDemoData));
    localStorage.setItem(DEMO_KEY, JSON.stringify(data));
  }
  if (!data.programs?.length) data.programs = [...defaultDemoData.programs];
  if (!data.schedule_items?.length) data.schedule_items = [...defaultDemoData.schedule_items];
  if (!data.daycare_facilities?.length) data.daycare_facilities = [...defaultDemoData.daycare_facilities];
  return data;
}

function saveDemoData(data) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(data));
}

function getAuthToken() {
  return sessionStorage.getItem('admin_token');
}

function setAuthToken(token) {
  if (token) sessionStorage.setItem('admin_token', token);
  else sessionStorage.removeItem('admin_token');
}

async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, auth = false } = options;
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // Demo mode
  if (isDemoMode()) {
    return handleDemoRequest(endpoint, method, body, auth);
  }

  try {
    const res = await fetch(`/api${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    return data;
  } catch (err) {
    // Fallback to demo mode if API unreachable
    if (!auth && method === 'GET') {
      console.warn('API unavailable, using demo data:', err.message);
      return handleDemoRequest(endpoint, method, body, auth);
    }
    if (method === 'POST' && endpoint === '/admissions') {
      return handleDemoRequest(endpoint, method, body, auth);
    }
    throw err;
  }
}

function handleDemoRequest(endpoint, method, body, auth) {
  const data = getDemoData();

  // Auth
  if (endpoint === '/auth/login' && method === 'POST') {
    if (body?.password === 'admin123') {
      const token = 'demo-token-' + Date.now();
      setAuthToken(token);
      return { token, demo: true };
    }
    throw new Error('Invalid password (demo: admin123)');
  }

  // Admissions
  if (endpoint === '/admissions') {
    if (method === 'GET') return { data: data.admissions };
    if (method === 'POST') {
      const admission = { id: Date.now(), ...body, status: 'new', created_at: new Date().toISOString() };
      data.admissions.unshift(admission);
      saveDemoData(data);
      return { data: admission, demo: true };
    }
  }

  const admissionMatch = endpoint.match(/^\/admissions\/(\d+)$/);
  if (admissionMatch) {
    const id = parseInt(admissionMatch[1]);
    const idx = data.admissions.findIndex(a => a.id === id);
    if (method === 'GET') return { data: data.admissions[idx] };
    if (method === 'PUT' && idx >= 0) {
      data.admissions[idx] = { ...data.admissions[idx], ...body };
      saveDemoData(data);
      return { data: data.admissions[idx] };
    }
    if (method === 'DELETE' && idx >= 0) {
      data.admissions.splice(idx, 1);
      saveDemoData(data);
      return { success: true };
    }
  }

  // Generic CRUD helpers
  const resources = {
    '/programs': 'programs',
    '/schedule': 'schedule_items',
    '/daycare-facilities': 'daycare_facilities',
    '/gallery': 'gallery',
    '/announcements': 'announcements',
    '/settings': 'settings'
  };

  for (const [path, key] of Object.entries(resources)) {
    if (endpoint === path) {
      if (method === 'GET') {
        if (key === 'settings') return { data: data.settings };
        return { data: data[key] };
      }
      if (method === 'POST' && key !== 'settings') {
        const item = { id: Date.now(), ...body, sort_order: body.sort_order || data[key].length + 1 };
        data[key].push(item);
        saveDemoData(data);
        return { data: item };
      }
      if (method === 'PUT' && key === 'settings') {
        data.settings = { ...data.settings, ...body };
        saveDemoData(data);
        return { data: data.settings };
      }
    }

    const match = endpoint.match(new RegExp(`^${path}/(\\d+)$`));
    if (match && key !== 'settings') {
      const id = parseInt(match[1]);
      const idx = data[key].findIndex(i => i.id === id);
      if (method === 'GET') return { data: data[key][idx] };
      if (method === 'PUT' && idx >= 0) {
        data[key][idx] = { ...data[key][idx], ...body };
        saveDemoData(data);
        return { data: data[key][idx] };
      }
      if (method === 'DELETE' && idx >= 0) {
        data[key].splice(idx, 1);
        saveDemoData(data);
        return { success: true };
      }
    }
  }

  if (endpoint === '/seed' && method === 'POST') {
    saveDemoData(defaultDemoData);
    return { success: true, message: 'Database seeded (demo)' };
  }

  throw new Error('Demo endpoint not found: ' + endpoint);
}

const API = {
  isDemoMode,
  getAuthToken,
  setAuthToken,
  get: (endpoint, auth = false) => apiRequest(endpoint, { auth }),
  post: (endpoint, body, auth = false) => apiRequest(endpoint, { method: 'POST', body, auth }),
  put: (endpoint, body, auth = false) => apiRequest(endpoint, { method: 'PUT', body, auth }),
  delete: (endpoint, auth = false) => apiRequest(endpoint, { method: 'DELETE', auth })
};

window.API = API;
