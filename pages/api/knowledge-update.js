export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, action, update } = req.body;
  if (token !== (process.env.ADMIN_TOKEN || 'skyline2026')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      if (action === 'add') {
        const entry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          category: update.category || 'General',
          title: update.title,
          content: update.content,
          addedBy: 'Brandon — Skyline Admin'
        };
        await kv.lpush('skyline:knowledge_updates', JSON.stringify(entry));
        await kv.ltrim('skyline:knowledge_updates', 0, 199);
        return res.status(200).json({ ok: true, id: entry.id });
      }
      if (action === 'list') {
        const raw = await kv.lrange('skyline:knowledge_updates', 0, 49);
        const updates = raw.map(r => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
        return res.status(200).json({ updates });
      }
      if (action === 'delete') {
        const raw = await kv.lrange('skyline:knowledge_updates', 0, -1);
        const remaining = raw.filter(r => { try { return JSON.parse(r).id !== update.id; } catch { return true; } });
        await kv.del('skyline:knowledge_updates');
        if (remaining.length > 0) await kv.rpush('skyline:knowledge_updates', ...remaining);
        return res.status(200).json({ ok: true });
      }
    } else {
      console.log('[SKYLINE_KNOWLEDGE_UPDATE]', JSON.stringify(update));
      if (action === 'list') return res.status(200).json({ updates: [] });
      return res.status(200).json({ ok: true, warning: 'KV not configured — update logged but not persisted.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
  return res.status(400).json({ error: 'Unknown action' });
}
