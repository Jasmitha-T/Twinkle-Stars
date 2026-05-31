import { requireAuth } from './_lib/auth.js';
import { setCors, json } from './_lib/utils.js';

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const auth = requireAuth(req);
  if (auth.error) return json(res, auth.status, { error: auth.error });

  try {
    return json(res, 200, {
      success: true,
      message: 'Run sql/schema.sql in your Vercel Postgres SQL console to seed the database.'
    });
  } catch (err) {
    console.error('Seed error:', err);
    return json(res, 500, { error: 'Seed failed' });
  }
}
