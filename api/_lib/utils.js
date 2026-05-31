export function setCors(res, req) {
  const origin = req.headers.origin || req.headers.Origin || '';
  const allowed = process.env.ALLOWED_ORIGIN || '*';
  if (allowed === '*' || origin === allowed || !origin) {
    res.setHeader('Access-Control-Allow-Origin', allowed === '*' ? '*' : origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function json(res, status, data) {
  res.status(status).json(data);
}

export function sanitizeString(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
  return /^[\d\s+\-()]{10,}$/.test(phone);
}

const rateLimitMap = new Map();

export function rateLimit(ip, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const key = ip || 'unknown';
  const entry = rateLimitMap.get(key) || { count: 0, reset: now + windowMs };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + windowMs;
  }
  entry.count++;
  rateLimitMap.set(key, entry);
  return entry.count <= limit;
}
