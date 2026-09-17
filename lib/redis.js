// Server-only access to the Upstash Redis store.
// Vercel KV stores were moved to Upstash in December 2024 and the @vercel/kv
// package is deprecated, so the app now talks to Upstash directly.
import { Redis } from '@upstash/redis';

let client;

export function getRedis() {
  if (client !== undefined) return client;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  // automaticDeserialization is switched off on purpose. We store JSON strings
  // and parse them ourselves. With it on, the client returns objects, our
  // JSON.parse calls throw, and the entries are silently dropped. That is the
  // bug that kept admin updates from ever reaching Skylar.
  client = url && token ? new Redis({ url, token, automaticDeserialization: false }) : null;
  return client;
}

// Accepts a stored entry in either shape (JSON string or already-parsed object).
export function parseEntry(raw) {
  if (raw && typeof raw === 'object') return raw;
  if (typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function toInt(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}
