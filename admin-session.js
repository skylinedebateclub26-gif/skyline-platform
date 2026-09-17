import {
  adminConfigured,
  checkPassword,
  clearSession,
  hasSession,
  issueSession,
  loginBlocked,
  recordFailedLogin,
} from '../../lib/adminAuth';

export const config = { maxDuration: 10 };

// GET: is there a valid session?  POST: log in.  DELETE: log out.
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ authed: hasSession(req), configured: adminConfigured() });
  }
  if (req.method === 'DELETE') {
    clearSession(res);
    return res.status(200).json({ ok: true });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!adminConfigured()) {
    return res.status(503).json({ error: 'Admin access is not configured on the server.' });
  }
  try {
    if (await loginBlocked(req)) {
      return res.status(429).json({ error: 'Too many failed attempts. Please wait 15 minutes and try again.' });
    }
  } catch (err) {
    console.error('LOGIN THROTTLE ERROR:', err.message);
  }
  if (!checkPassword(req.body?.password)) {
    await recordFailedLogin(req).catch(err => console.error('LOGIN THROTTLE ERROR:', err.message));
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  issueSession(res);
  return res.status(200).json({ ok: true });
}
