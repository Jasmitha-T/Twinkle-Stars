import { sql } from '@vercel/postgres';
import { requireAuth } from '../_lib/auth.js';
import { setCors, json, sanitizeString } from '../_lib/utils.js';

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  const itemId = parseInt(id, 10);
  if (!itemId) return json(res, 400, { error: 'Invalid ID' });

  const auth = requireAuth(req);
  if (auth.error) return json(res, auth.status, { error: auth.error });

  try {
    if (req.method === 'PUT') {
      const body = req.body || {};
      const { rows } = await sql`
        UPDATE schedule_items SET
          title = COALESCE(${body.title ? sanitizeString(body.title) : null}, title),
          description = COALESCE(${body.description !== undefined ? sanitizeString(body.description, 2000) : null}, description),
          sort_order = COALESCE(${body.sort_order !== undefined ? body.sort_order : null}, sort_order)
        WHERE id = ${itemId}
        RETURNING *
      `;
      if (!rows.length) return json(res, 404, { error: 'Not found' });
      return json(res, 200, { data: rows[0] });
    }

    if (req.method === 'DELETE') {
      const { rowCount } = await sql`DELETE FROM schedule_items WHERE id = ${itemId}`;
      if (!rowCount) return json(res, 404, { error: 'Not found' });
      return json(res, 200, { success: true });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('Schedule ID error:', err);
    return json(res, 500, { error: 'Server error' });
  }
}
