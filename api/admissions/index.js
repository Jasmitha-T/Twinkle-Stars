import { sql } from '@vercel/postgres';
import { requireAuth } from '../_lib/auth.js';
import { setCors, json, sanitizeString, validateEmail, validatePhone, rateLimit } from '../_lib/utils.js';

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const auth = requireAuth(req);
      if (auth.error) return json(res, auth.status, { error: auth.error });
      const { rows } = await sql`SELECT * FROM admissions ORDER BY created_at DESC`;
      return json(res, 200, { data: rows });
    }

    if (req.method === 'POST') {
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      if (!rateLimit(ip, 5, 60000)) {
        return json(res, 429, { error: 'Too many requests. Please try again later.' });
      }

      const body = req.body || {};
      const child_name = sanitizeString(body.child_name, 255);
      const age = sanitizeString(body.age, 50);
      const program = sanitizeString(body.program, 100);
      const parent_name = sanitizeString(body.parent_name, 255);
      const phone = sanitizeString(body.phone, 50);
      const email = sanitizeString(body.email, 255);
      const message = sanitizeString(body.message, 2000);
      const start_date = body.start_date || null;

      if (!child_name || child_name.length < 2) {
        return json(res, 400, { error: 'Child name is required' });
      }
      if (!age) return json(res, 400, { error: 'Age is required' });
      if (!program) return json(res, 400, { error: 'Program is required' });
      if (!parent_name) return json(res, 400, { error: 'Parent name is required' });
      if (!validatePhone(phone)) return json(res, 400, { error: 'Valid phone is required' });
      if (!validateEmail(email)) return json(res, 400, { error: 'Valid email is required' });

      const { rows } = await sql`
        INSERT INTO admissions (child_name, age, program, parent_name, phone, email, message, start_date, status)
        VALUES (${child_name}, ${age}, ${program}, ${parent_name}, ${phone}, ${email}, ${message || null}, ${start_date}, 'new')
        RETURNING *
      `;
      return json(res, 201, { data: rows[0] });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('Admissions error:', err);
    return json(res, 500, { error: 'Server error' });
  }
}
