export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { event, data, sessionId } = req.body;
  const timestamp = new Date().toISOString();
  const entry = { timestamp, event, sessionId: sessionId || 'anonymous', data };
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      await kv.lpush('skyline:events', JSON.stringify(entry));
      await kv.ltrim('skyline:events', 0, 9999);
      if (event === 'career_match_completed') {
        await kv.incr('skyline:stats:total_assessments');
        if (data?.top_career) await kv.zincrby('skyline:stats:top_careers', 1, data.top_career);
        if (data?.top_field) await kv.zincrby('skyline:stats:top_fields', 1, data.top_field);
        if (data?.stream) await kv.zincrby('skyline:stats:streams', 1, data.stream);
      }
      if (event === 'concours_viewed') {
        if (data?.concours) await kv.zincrby('skyline:stats:top_concours', 1, data.concours);
        await kv.incr('skyline:stats:total_concours_views');
      }
      if (event === 'session_start') await kv.incr('skyline:stats:total_sessions');
    } else {
      console.log('[SKYLINE_ANALYTICS]', JSON.stringify(entry));
    }
  } catch (err) {
    console.error('Analytics error:', err.message);
  }
  return res.status(200).json({ ok: true });
}
