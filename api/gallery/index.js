import { sql } from '@vercel/postgres';
import { requireAuth } from '../_lib/auth.js';
import { setCors, json, sanitizeString } from '../_lib/utils.js';

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM gallery ORDER BY sort_order ASC, id ASC`;
      return json(res, 200, { data: rows });
    }

    const auth = requireAuth(req);
    if (auth.error) return json(res, auth.status, { error: auth.error });

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.image_url) return json(res, 400, { error: 'Image URL is required' });
      const { rows } = await sql`
        INSERT INTO gallery (image_url, caption, sort_order)
        VALUES (${sanitizeString(body.image_url, 2000)}, ${sanitizeString(body.caption || '')}, ${body.sort_order ?? 0})
        RETURNING *
      `;
      return json(res, 201, { data: rows[0] });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('Gallery error:', err);
    return json(res, 500, { error: 'Server error' });
  }
}
