import { sql } from '@vercel/postgres';
import { requireAuth } from '../_lib/auth.js';
import { setCors, json, sanitizeString } from '../_lib/utils.js';

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = requireAuth(req);
  if (auth.error) return json(res, auth.status, { error: auth.error });

  const { id } = req.query;
  const admissionId = parseInt(id, 10);
  if (!admissionId) return json(res, 400, { error: 'Invalid ID' });

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM admissions WHERE id = ${admissionId}`;
      if (!rows.length) return json(res, 404, { error: 'Not found' });
      return json(res, 200, { data: rows[0] });
    }

    if (req.method === 'PUT') {
      const body = req.body || {};
      const status = sanitizeString(body.status, 50);
      const validStatuses = ['new', 'contacted', 'enrolled', 'archived'];
      if (status && !validStatuses.includes(status)) {
        return json(res, 400, { error: 'Invalid status' });
      }

      const { rows } = await sql`
        UPDATE admissions SET
          status = COALESCE(${status || null}, status),
          child_name = COALESCE(${body.child_name ? sanitizeString(body.child_name) : null}, child_name),
          age = COALESCE(${body.age ? sanitizeString(body.age) : null}, age),
          program = COALESCE(${body.program ? sanitizeString(body.program) : null}, program),
          parent_name = COALESCE(${body.parent_name ? sanitizeString(body.parent_name) : null}, parent_name),
          phone = COALESCE(${body.phone ? sanitizeString(body.phone) : null}, phone),
          email = COALESCE(${body.email ? sanitizeString(body.email) : null}, email),
          message = COALESCE(${body.message !== undefined ? sanitizeString(body.message) : null}, message)
        WHERE id = ${admissionId}
        RETURNING *
      `;
      if (!rows.length) return json(res, 404, { error: 'Not found' });
      return json(res, 200, { data: rows[0] });
    }

    if (req.method === 'DELETE') {
      const { rowCount } = await sql`DELETE FROM admissions WHERE id = ${admissionId}`;
      if (!rowCount) return json(res, 404, { error: 'Not found' });
      return json(res, 200, { success: true });
    }

    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('Admission ID error:', err);
    return json(res, 500, { error: 'Server error' });
  }
}
