// Server-side admin authentication.
// The password lives only in server environment variables (never NEXT_PUBLIC_),
// and a successful login sets a signed, HttpOnly session cookie.
import crypto from 'crypto';
import { getRedis } from './redis';

const COOKIE = 'skyline_admin';
const SESSION_SECONDS = 8 * 60 * 60;
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_SECONDS = 15 * 60;

const password = () => process.env.ADMIN_PASSWORD || '';
const secret = () => process.env.ADMIN_SESSION_SECRET || '';

export function adminConfigured() {
  return password().length >= 12 && secret().length >= 32;
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function cookie(value, maxAge) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export function checkPassword(candidate) {
  return adminConfigured() && typeof candidate === 'string' && safeEqual(candidate, password());
}

export function issueSession(res) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `admin.${expires}`;
  res.setHeader('Set-Cookie', cookie(`${payload}.${sign(payload)}`, SESSION_SECONDS));
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', cookie('', 0));
}

export function hasSession(req) {
  if (!adminConfigured()) return false;
  const token = req.cookies?.[COOKIE];
  if (!token) return false;
  const cut = token.lastIndexOf('.');
  if (cut < 1) return false;
  const payload = token.slice(0, cut);
  if (!safeEqual(token.slice(cut + 1), sign(payload))) return false;
  const expires = Number(payload.split('.')[1]);
  return Number.isFinite(expires) && expires > Date.now() / 1000;
}

// Returns true when the request may continue. Otherwise it has already responded.
export function requireAdmin(req, res) {
  if (!adminConfigured()) {
    res.status(503).json({ error: 'Admin access is not configured on the server.' });
    return false;
  }
  if (!hasSession(req)) {
    res.status(401).json({ error: 'Your admin session has ended. Please log in again.' });
    return false;
  }
  return true;
}

// Best-effort brute-force protection (needs Redis). Only failed attempts count,
// so a correct login is never blocked by its own earlier successes.
function attemptsKey(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '');
  const ip = forwarded.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  return `skyline:admin:login-failures:${ip}`;
}

export async function loginBlocked(req) {
  const redis = getRedis();
  if (!redis) return false;
  const failures = parseInt(await redis.get(attemptsKey(req)), 10) || 0;
  return failures >= MAX_LOGIN_ATTEMPTS;
}

export async function recordFailedLogin(req) {
  const redis = getRedis();
  if (!redis) return;
  const key = attemptsKey(req);
  const failures = await redis.incr(key);
  if (failures === 1) await redis.expire(key, LOGIN_WINDOW_SECONDS);
}
