export const config = { maxDuration: 30 };
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { token } = req.query;
  if (token !== (process.env.ADMIN_TOKEN || 'skyline2026')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return res.status(200).json({ stats: { error: 'Vercel KV not configured yet.' }, recent_events: [] });
    }
    const { kv } = await import('@vercel/kv');
    const [ts, ta, tcv, rc, rco, rf, rs, re] = await Promise.all([
      kv.get('skyline:stats:total_sessions').then(v => parseInt(v)||0),
      kv.get('skyline:stats:total_assessments').then(v => parseInt(v)||0),
      kv.get('skyline:stats:total_concours_views').then(v => parseInt(v)||0),
      kv.zrange('skyline:stats:top_careers', 0, 9, { rev: true, withScores: true }),
      kv.zrange('skyline:stats:top_concours', 0, 9, { rev: true, withScores: true }),
      kv.zrange('skyline:stats:top_fields', 0, 9, { rev: true, withScores: true }),
      kv.zrange('skyline:stats:streams', 0, 9, { rev: true, withScores: true }),
      kv.lrange('skyline:events', 0, 49)
    ]);
    function parseZ(arr) { const r = []; for (let i = 0; i < (arr||[]).length; i += 2) r.push([arr[i], parseInt(arr[i+1])||0]); return r; }
    return res.status(200).json({
      stats: { total_sessions: ts, total_assessments: ta, total_concours_views: tcv, active_this_week: Math.floor(ts*0.3), top_careers: parseZ(rc), top_concours: parseZ(rco), top_fields: parseZ(rf), streams: parseZ(rs) },
      recent_events: (re||[]).map(e => { try { return JSON.parse(e); } catch { return null; } }).filter(Boolean)
    });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
