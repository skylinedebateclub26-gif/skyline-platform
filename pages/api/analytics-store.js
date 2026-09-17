import { getRedis } from '../../lib/redis';

export const config = { maxDuration: 10 };

const EVENTS = new Set(['session_start', 'career_match_completed', 'concours_viewed']);
const clip = (value, max = 120) => (value == null || value === '' ? undefined : String(value).slice(0, max));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { event, data, sessionId } = req.body || {};
  if (!EVENTS.has(event)) return res.status(400).json({ error: 'Unknown event' });

  const sid = clip(sessionId, 64) || 'anonymous';
  const fields = {
    top_career: clip(data?.top_career),
    top_field: clip(data?.top_field),
    stream: clip(data?.stream),
    concours: clip(data?.concours),
  };
  const cleanData = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
  const entry = { timestamp: new Date().toISOString(), event, sessionId: sid, data: cleanData };

  const redis = getRedis();
  if (!redis) {
    console.log('[SKYLINE_ANALYTICS]', JSON.stringify(entry));
    return res.status(200).json({ ok: true, stored: false });
  }

  try {
    const day = entry.timestamp.slice(0, 10);
    const p = redis.pipeline();
    p.lpush('skyline:events', JSON.stringify(entry));
    p.ltrim('skyline:events', 0, 9999);
    p.pfadd(`skyline:active:${day}`, sid);
    p.expire(`skyline:active:${day}`, 8 * 86400);
    if (event === 'session_start') p.incr('skyline:stats:total_sessions');
    if (event === 'career_match_completed') {
      p.incr('skyline:stats:total_assessments');
      if (cleanData.top_career) p.zincrby('skyline:stats:top_careers', 1, cleanData.top_career);
      if (cleanData.top_field) p.zincrby('skyline:stats:top_fields', 1, cleanData.top_field);
      if (cleanData.stream) p.zincrby('skyline:stats:streams', 1, cleanData.stream);
    }
    if (event === 'concours_viewed') {
      p.incr('skyline:stats:total_concours_views');
      if (cleanData.concours) p.zincrby('skyline:stats:top_concours', 1, cleanData.concours);
    }
    await p.exec();
  } catch (err) {
    console.error('ANALYTICS ERROR:', err.message);
  }
  return res.status(200).json({ ok: true });
}
