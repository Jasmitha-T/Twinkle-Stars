import { createToken, checkAdminPassword } from '../_lib/auth.js';
import { setCors, json } from '../_lib/utils.js';

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const { password } = req.body || {};
    if (!password || !checkAdminPassword(password)) {
      return json(res, 401, { error: 'Invalid password' });
    }

    const token = createToken({ role: 'admin', sub: 'admin' });
    return json(res, 200, { token });
  } catch (err) {
    console.error('Login error:', err);
    return json(res, 500, { error: 'Login failed' });
  }
}
