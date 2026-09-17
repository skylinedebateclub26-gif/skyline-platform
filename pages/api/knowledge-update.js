import crypto from 'crypto';
import { requireAdmin } from '../../lib/adminAuth';
import { getRedis, parseEntry } from '../../lib/redis';

export const config = { maxDuration: 30 };

const KEY = 'skyline:knowledge_updates';
const MAX_UPDATES = 200;
const CATEGORIES = [
  'Concours Update', 'Fee Change', 'New Institution',
  'Eligibility Change', 'Exam Date', 'Places Available',
  'Registration Info', 'General Knowledge', 'Correction',
];

// Updates are injected into Skylar's prompt one per line, so collapse whitespace.
const clean = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const redis = getRedis();
  if (!redis) {
    return res.status(503).json({
      error: 'Storage is not connected, so nothing was saved. Connect the Upstash Redis store to this Vercel project, then redeploy.',
    });
  }

  const { action, update } = req.body || {};
  try {
    if (action === 'add') {
      const title = clean(update?.title, 160);
      const content = clean(update?.content, 2000);
      if (!title || !content) return res.status(400).json({ error: 'Please fill in both the title and the content.' });
      const category = CATEGORIES.includes(update?.category) ? update.category : 'General Knowledge';
      const entry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        category,
        title,
        content,
        addedBy: 'Skyline Admin',
      };
      await redis.lpush(KEY, JSON.stringify(entry));
      await redis.ltrim(KEY, 0, MAX_UPDATES - 1);
      return res.status(200).json({ ok: true, id: entry.id });
    }

    if (action === 'list') {
      const raw = await redis.lrange(KEY, 0, MAX_UPDATES - 1);
      return res.status(200).json({ updates: (raw || []).map(parseEntry).filter(Boolean) });
    }

    if (action === 'delete') {
      const id = String(update?.id ?? '');
      const raw = await redis.lrange(KEY, 0, -1);
      const stored = (raw || []).find(r => String(parseEntry(r)?.id) === id);
      if (!stored) return res.status(404).json({ error: 'That update was not found. It may already have been removed.' });
      // Remove the exact stored string, so nothing else in the list is touched.
      await redis.lrem(KEY, 1, stored);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('KNOWLEDGE UPDATE ERROR:', err.message);
    return res.status(500).json({ error: 'Storage error: ' + err.message });
  }
}
