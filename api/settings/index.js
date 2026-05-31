import { sql } from '@vercel/postgres';
import { requireAuth } from '../_lib/auth.js';
import { setCors, json } from '../_lib/utils.js';

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT value FROM settings WHERE key = 'site'`;
      const siteSettings = rows[0]?.value || {};
      return json(res, 200, { data: siteSettings });
    }

    const auth = requireAuth(req);
    if (auth.error) return json(res, auth.status, { error: auth.error });

    if (req.method === 'PUT') {
      const body = req.body || {};
      const { rows: existing } = await sql`SELECT value FROM settings WHERE key = 'site'`;
      const current = existing[0]?.value || {};
      const updated = { ...current, ...body };
      const jsonValue = JSON.stringify(updated);

      await sql`
        INSERT INTO settings (key, value)
        VALUES ('site', ${jsonValue}::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = ${jsonValue}::jsonb
      `;
      return json(res, 200, { data: updated });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('Settings error:', err);
    return json(res, 500, { error: 'Server error' });
  }
}
