import { requireAdmin } from '../../lib/adminAuth';
import { getRedis, parseEntry, toInt } from '../../lib/redis';

export const config = { maxDuration: 30 };

function pairs(flat) {
  const out = [];
  for (let i = 0; i < (flat || []).length; i += 2) out.push([String(flat[i]), toInt(flat[i + 1])]);
  return out;
}

function lastDays(count) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => new Date(now - i * 86400000).toISOString().slice(0, 10));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const redis = getRedis();
  if (!redis) {
    return res.status(200).json({ stats: { error: 'Storage is not connected yet.' }, recent_events: [] });
  }

  try {
    const top = key => redis.zrange(key, 0, 9, { rev: true, withScores: true });
    const [sessions, assessments, concoursViews, careers, concours, fields, streams, events, activeWeek, matchSpeed, guideSpeed] = await Promise.all([
      redis.get('skyline:stats:total_sessions'),
      redis.get('skyline:stats:total_assessments'),
      redis.get('skyline:stats:total_concours_views'),
      top('skyline:stats:top_careers'),
      top('skyline:stats:top_concours'),
      top('skyline:stats:top_fields'),
      top('skyline:stats:streams'),
      redis.lrange('skyline:events', 0, 49),
      // Distinct browser sessions seen over the last 7 days (one HyperLogLog per day).
      redis.pfcount(...lastDays(7).map(day => `skyline:active:${day}`)),
      // Timing records written by pages/api/match.js, newest first.
      redis.lrange('skyline:perf:match', 0, 99),
      redis.lrange('skyline:perf:guide', 0, 99),
    ]);

    return res.status(200).json({
      stats: {
        total_sessions: toInt(sessions),
        total_assessments: toInt(assessments),
        total_concours_views: toInt(concoursViews),
        active_this_week: toInt(activeWeek),
        top_careers: pairs(careers),
        top_concours: pairs(concours),
        top_fields: pairs(fields),
        streams: pairs(streams),
        speed: {
          match: (matchSpeed || []).map(parseEntry).filter(Boolean),
          guide: (guideSpeed || []).map(parseEntry).filter(Boolean),
        },
      },
      recent_events: (events || []).map(parseEntry).filter(Boolean),
    });
  } catch (err) {
    console.error('ADMIN STATS ERROR:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
