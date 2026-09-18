import Head from 'next/head';
import { useState, useEffect } from 'react';
import { CONCOURS_LIST, FIELDS } from '../lib/concours';

// Speed figures for the dashboard, from the timing records Skylar keeps in Redis.
function median(values) {
  const v = values.filter(n => Number.isFinite(n)).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : Math.round((v[mid - 1] + v[mid]) / 2);
}

const secs = ms => (Number.isFinite(ms) ? `${(ms / 1000).toFixed(1)} s` : 'No data yet');

function speedSummary(speed) {
  const recent = (speed?.match || []).slice(0, 20);
  const runs = recent.filter(m => Number.isFinite(m.first_ms));
  const problems = recent.filter(m => !m.ok).length;
  const guides = (speed?.guide || []).slice(0, 50).filter(g => g.ok);
  const fresh = guides.filter(g => g.cache !== 'hit');
  const ready = guides.filter(g => g.cache === 'hit');
  return [
    ['Career Match, first results', secs(median(runs.map(m => m.first_ms))), `median of the last ${runs.length}`],
    ['Career Match, full report', secs(median(runs.map(m => m.total_ms))), `${problems} of the last ${recent.length} had a problem`],
    ['Guide written on the spot', secs(median(fresh.map(g => g.total_ms))), `median of the last ${fresh.length}`],
    ['Guide already prepared', secs(median(ready.map(g => g.total_ms))), `median of the last ${ready.length}`],
  ];
}

function speedNote(m) {
  if (m.error) return `Failed (${m.error})`;
  if (m.details_failed) return `${m.details_failed} explanation(s) missing`;
  return m.model;
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pw, setPw] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState('stats'); // stats | knowledge | activity
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [newUpdate, setNewUpdate] = useState({ category: 'Concours Update', title: '', content: '' });
  const [warm, setWarm] = useState(null); // progress of "Prepare all guides"

  const CATEGORIES = [
    'Concours Update', 'Fee Change', 'New Institution',
    'Eligibility Change', 'Exam Date', 'Places Available',
    'Registration Info', 'General Knowledge', 'Correction'
  ];

  useEffect(() => {
    fetch('/api/admin-session')
      .then(r => r.json())
      .then(d => setAuthed(Boolean(d.authed)))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  async function login() {
    if (!pw || loggingIn) return;
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setPw('');
        setAuthed(true);
      } else {
        setLoginError(data.error || 'Login failed. Please try again.');
      }
    } catch {
      setLoginError('Network error. Please try again.');
    }
    setLoggingIn(false);
  }

  async function logout() {
    await fetch('/api/admin-session', { method: 'DELETE' }).catch(() => {});
    setAuthed(false);
  }

  useEffect(() => {
    if (!authed) return;
    loadStats();
    loadUpdates();
  }, [authed]);

  async function loadStats() {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin-stats');
      if (res.status === 401) { setAuthed(false); setStatsLoading(false); return; }
      const data = await res.json();
      setStats(data.stats || { error: data.error || 'Could not load statistics.' });
      setEvents(data.recent_events || []);
    } catch { setStats({ error: 'Could not load statistics. Check the storage connection.' }); }
    setStatsLoading(false);
  }

  async function loadUpdates() {
    try {
      const res = await fetch('/api/knowledge-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });
      if (res.status === 401) { setAuthed(false); return; }
      const data = await res.json();
      setUpdates(data.updates || []);
    } catch {}
  }

  async function saveUpdate() {
    if (!newUpdate.title.trim() || !newUpdate.content.trim()) {
      setSaveMsg('Please fill in both the title and the content.'); return;
    }
    setSaving(true); setSaveMsg('');
    try {
      const res = await fetch('/api/knowledge-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', update: newUpdate })
      });
      if (res.status === 401) { setAuthed(false); setSaving(false); return; }
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSaveMsg('✓ Skylar has been updated. She will use this in all future responses immediately.');
        setNewUpdate({ category: 'Concours Update', title: '', content: '' });
        loadUpdates();
      } else {
        setSaveMsg('Not saved: ' + (data.error || 'Unknown error'));
      }
    } catch (e) { setSaveMsg('Network error. Try again.'); }
    setSaving(false);
  }

  async function deleteUpdate(id) {
    if (!confirm('Remove this update from Skylar\'s knowledge?')) return;
    try {
      const res = await fetch('/api/knowledge-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', update: { id } })
      });
      if (res.status === 401) { setAuthed(false); return; }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Could not remove this update.');
      }
    } catch { alert('Network error. Please try again.'); }
    loadUpdates();
  }

  // Writes every exam guide and global perspective in advance (three at a time),
  // so students are served instantly and the president can review them first.
  async function prepareGuides() {
    if (warm?.running) return;
    const jobs = [
      ...CONCOURS_LIST.map(c => ({ label: c.id, body: { type: 'concours', concoursId: c.id } })),
      ...FIELDS.map(f => ({ label: `Global: ${f}`, body: { type: 'global', field: f } })),
    ];
    const total = jobs.length;
    const failed = [];
    let generated = 0;
    let done = 0;
    setWarm({ running: true, done, total, generated, failed: [] });
    const worker = async () => {
      while (jobs.length) {
        const job = jobs.shift();
        try {
          const res = await fetch('/api/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(job.body)
          });
          if (!res.ok) failed.push(job.label);
          else if (res.headers.get('X-Skyline-Cache') === 'miss') generated += 1;
        } catch {
          failed.push(job.label);
        }
        done += 1;
        setWarm({ running: true, done, total, generated, failed: [...failed] });
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    setWarm({ running: false, done, total, generated, failed: [...failed] });
  }

  if (checking) return (
    <div style={{minHeight:'100vh',background:'#F8F6F1',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,sans-serif',color:'#7A776F'}}>
      <Head><title>Admin | Skyline Academy</title></Head>
      Checking your session…
    </div>
  );

  if (!authed) return (
    <div style={{minHeight:'100vh',background:'#F8F6F1',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,sans-serif'}}>
      <Head><title>Admin | Skyline Academy</title></Head>
      <div style={{background:'white',borderRadius:16,padding:40,width:340,boxShadow:'0 4px 32px rgba(14,124,138,.12)',textAlign:'center'}}>
        <div style={{width:56,height:56,background:'linear-gradient(135deg,#0E7C8A,#14A3B3)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:24}}>🔒</div>
        <h2 style={{color:'#0E7C8A',marginBottom:4,fontSize:20}}>Skyline Admin</h2>
        <p style={{color:'#7A776F',fontSize:13,marginBottom:24}}>Dashboard & Skylar Knowledge Panel</p>
        <input type="password" placeholder="Admin password" value={pw}
          onChange={e=>setPw(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&login()}
          style={{width:'100%',padding:'11px 14px',borderRadius:8,border:'1.5px solid #E8E6E1',fontSize:14,marginBottom:12,fontFamily:'inherit',outline:'none'}} />
        <button onClick={login} disabled={loggingIn}
          style={{width:'100%',background:loggingIn?'#C2BFB8':'#0E7C8A',color:'white',border:'none',padding:12,borderRadius:8,fontSize:15,fontWeight:700,cursor:loggingIn?'wait':'pointer',fontFamily:'inherit'}}>
          {loggingIn ? 'Checking…' : 'Enter Dashboard →'}
        </button>
        {loginError && <div style={{marginTop:12,fontSize:13,color:'#C0392B'}}>{loginError}</div>}
      </div>
    </div>
  );

  return (
    <>
      <Head><title>Admin | Skyline Academy</title></Head>
      <style dangerouslySetInnerHTML={{__html:`
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif; background:#F8F6F1; }
        .header { background:#0E7C8A; padding:14px 28px; display:flex; align-items:center; gap:16px; }
        .header-title { color:white; font-size:17px; font-weight:700; }
        .header-sub { color:rgba(255,255,255,.6); font-size:13px; }
        .tab-bar { background:white; border-bottom:1px solid #E8E6E1; padding:0 28px; display:flex; gap:0; }
        .tab-btn { padding:14px 22px; border:none; background:transparent; font-size:14px; font-weight:600; color:#7A776F; cursor:pointer; font-family:inherit; border-bottom:3px solid transparent; transition:all .15s; }
        .tab-btn.active { color:#0E7C8A; border-bottom-color:#F7941E; }
        .tab-btn:hover { color:#0E7C8A; }
        .container { max-width:1100px; margin:0 auto; padding:28px 20px 64px; }
        .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
        .stat-card { background:white; border-radius:12px; padding:20px; box-shadow:0 2px 12px rgba(0,0,0,.06); }
        .stat-num { font-size:34px; font-weight:700; color:#0E7C8A; line-height:1; margin-bottom:6px; }
        .stat-label { font-size:13px; color:#7A776F; }
        .card { background:white; border-radius:12px; padding:24px; margin-bottom:20px; box-shadow:0 2px 12px rgba(0,0,0,.06); }
        .card-title { font-size:14px; font-weight:700; color:#0E7C8A; text-transform:uppercase; letter-spacing:.06em; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
        .bar-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
        .bar-label { font-size:13px; color:#333; min-width:190px; line-height:1.3; }
        .bar-track { flex:1; height:8px; background:#E8E6E1; border-radius:4px; overflow:hidden; }
        .bar-fill { height:100%; border-radius:4px; transition:width .8s; }
        .bar-count { font-size:13px; font-weight:700; color:#0E7C8A; min-width:32px; text-align:right; }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        .speed-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; }
        .speed-item { background:#F4F8F9; border-radius:10px; padding:14px; }
        .speed-num { font-size:22px; font-weight:700; color:#0E7C8A; }
        .speed-label { font-size:12px; font-weight:600; color:#1B2A3A; margin-top:4px; }
        .speed-hint { font-size:11px; color:#7A776F; margin-top:2px; }
        .speed-table { width:100%; border-collapse:collapse; font-size:13px; }
        .speed-table th { text-align:left; color:#7A776F; font-weight:600; padding:6px 8px; border-bottom:1px solid #E8E6E0; }
        .speed-table td { padding:6px 8px; border-bottom:1px solid #F1EFEA; }
        /* Knowledge panel */
        .ku-form label { display:block; font-size:12px; font-weight:700; color:#7A776F; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
        .ku-form select, .ku-form input, .ku-form textarea { width:100%; padding:11px 14px; border:1.5px solid #E8E6E1; border-radius:8px; font-size:14px; font-family:inherit; color:#1a1a2e; background:#F8F6F1; transition:border .15s; margin-bottom:16px; }
        .ku-form select:focus, .ku-form input:focus, .ku-form textarea:focus { outline:none; border-color:#0E7C8A; background:white; }
        .ku-form textarea { min-height:120px; resize:vertical; line-height:1.6; }
        .btn-save { background:#0E7C8A; color:white; border:none; padding:12px 28px; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition:background .15s; }
        .btn-save:hover { background:#14A3B3; }
        .btn-save:disabled { background:#C2BFB8; cursor:not-allowed; }
        .save-msg { margin-top:12px; font-size:14px; padding:10px 14px; border-radius:8px; }
        .save-msg.ok { background:#E3F5ED; color:#1A7F5A; border:1px solid rgba(26,127,90,.2); }
        .save-msg.warn { background:#FFF8E7; color:#9a5a00; border:1px solid rgba(247,148,30,.3); }
        .update-item { border:1.5px solid #E8E6E1; border-radius:10px; padding:16px; margin-bottom:10px; position:relative; }
        .update-item:hover { border-color:#5CC8D6; }
        .update-category { display:inline-block; background:rgba(14,124,138,.1); color:#0E7C8A; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; margin-bottom:8px; }
        .update-title { font-size:15px; font-weight:700; color:#1a1a2e; margin-bottom:6px; }
        .update-content { font-size:13px; color:#4a4740; line-height:1.6; }
        .update-meta { font-size:11px; color:#C2BFB8; margin-top:8px; }
        .btn-delete { position:absolute; top:12px; right:12px; background:rgba(192,57,43,.08); border:1px solid rgba(192,57,43,.2); color:#C0392B; font-size:12px; font-weight:600; padding:4px 10px; border-radius:6px; cursor:pointer; font-family:inherit; }
        .btn-delete:hover { background:#C0392B; color:white; }
        .empty-state { text-align:center; padding:40px; color:#7A776F; font-size:14px; }
        .event-row { display:flex; gap:16px; padding:10px 0; border-bottom:1px solid #F0EDE8; font-size:13px; }
        .event-time { color:#7A776F; min-width:150px; flex-shrink:0; }
        .event-type { font-weight:600; color:#0E7C8A; min-width:160px; }
        .event-data { color:#4a4740; flex:1; word-break:break-all; }
        .refresh-btn { margin-left:auto; background:#F7941E; color:white; border:none; padding:7px 18px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; }
        .skylar-note { background:rgba(14,124,138,.05); border:1.5px solid rgba(14,124,138,.15); border-radius:10px; padding:16px; margin-bottom:20px; display:flex; gap:12px; align-items:flex-start; }
        .skylar-dot { width:34px; height:34px; background:linear-gradient(135deg,#0E7C8A,#14A3B3); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:13px; font-weight:700; flex-shrink:0; }
        .no-kv-banner { background:#FFF8E7; border:1.5px solid rgba(247,148,30,.3); border-radius:10px; padding:16px; margin-bottom:20px; font-size:14px; color:#9a5a00; line-height:1.6; }
        @media (max-width:768px) { .stat-grid { grid-template-columns:1fr 1fr; } .grid2 { grid-template-columns:1fr; } .speed-grid { grid-template-columns:1fr 1fr; } }
      `}} />

      <div className="header">
        <div>
          <div className="header-title">📊 Skyline Academy — Admin Dashboard</div>
          <div className="header-sub">Logged in as Brandon · Skyline President</div>
        </div>
        <button onClick={loadStats} className="refresh-btn">↻ Refresh</button>
        <button onClick={logout} className="refresh-btn" style={{marginLeft:8,background:'rgba(255,255,255,.15)'}}>Log out</button>
      </div>

      <div className="tab-bar">
        {[['stats','📈 Analytics'],['knowledge','🧠 Update Skylar'],['activity','🕐 Live Activity']].map(([id,label])=>
          <button key={id} className={`tab-btn${tab===id?' active':''}`} onClick={()=>setTab(id)}>{label}</button>
        )}
      </div>

      <div className="container">

        {/* ── ANALYTICS TAB ── */}
        {tab === 'stats' && (<>
          {statsLoading && <div style={{textAlign:'center',padding:60,color:'#7A776F'}}>Loading analytics…</div>}

          {!statsLoading && stats?.error && (
            <div className="no-kv-banner">
              <strong>⚠️ Storage is not connected yet.</strong> Analytics and Skylar updates start saving once an Upstash Redis store is connected to this Vercel project (see the Live Activity tab for the steps). Until then, events only appear in the Vercel function logs.
            </div>
          )}

          {!statsLoading && stats && !stats.error && (<>
            <div className="stat-grid">
              {[
                ['Total Sessions','👤',stats.total_sessions||0,'#0E7C8A'],
                ['Assessments Done','✅',stats.total_assessments||0,'#1A7F5A'],
                ['Concours Views','📋',stats.total_concours_views||0,'#F7941E'],
                ['Active (last 7 days)','🔥',stats.active_this_week||0,'#C0392B'],
              ].map(([label,icon,num,color])=>(
                <div key={label} className="stat-card">
                  <div style={{fontSize:24,marginBottom:8}}>{icon}</div>
                  <div className="stat-num" style={{color}}>{num.toLocaleString()}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>

            <div className="grid2">
              <div className="card">
                <div className="card-title">🏆 Top Career Matches</div>
                {(stats.top_careers||[]).length ? stats.top_careers.map(([career,count],i)=>(
                  <div key={i} className="bar-row">
                    <div className="bar-label">{career}</div>
                    <div className="bar-track"><div className="bar-fill" style={{width:`${(count/(stats.top_careers[0]?.[1]||1))*100}%`,background:'#0E7C8A'}}></div></div>
                    <div className="bar-count">{count}</div>
                  </div>
                )) : <div className="empty-state">No data yet</div>}
              </div>

              <div className="card">
                <div className="card-title">📋 Most Viewed Concours</div>
                {(stats.top_concours||[]).length ? stats.top_concours.map(([name,count],i)=>(
                  <div key={i} className="bar-row">
                    <div className="bar-label">{name}</div>
                    <div className="bar-track"><div className="bar-fill" style={{width:`${(count/(stats.top_concours[0]?.[1]||1))*100}%`,background:'#F7941E'}}></div></div>
                    <div className="bar-count">{count}</div>
                  </div>
                )) : <div className="empty-state">No data yet</div>}
              </div>

              <div className="card">
                <div className="card-title">🎓 Student Streams</div>
                {(stats.streams||[]).length ? stats.streams.map(([stream,count],i)=>(
                  <div key={i} className="bar-row">
                    <div className="bar-label">{stream}</div>
                    <div className="bar-track"><div className="bar-fill" style={{width:`${(count/(stats.streams[0]?.[1]||1))*100}%`,background:'#1A7F5A'}}></div></div>
                    <div className="bar-count">{count}</div>
                  </div>
                )) : <div className="empty-state">No data yet</div>}
              </div>

              <div className="card">
                <div className="card-title">🌍 Top Fields</div>
                {(stats.top_fields||[]).length ? stats.top_fields.map(([field,count],i)=>(
                  <div key={i} className="bar-row">
                    <div className="bar-label">{field}</div>
                    <div className="bar-track"><div className="bar-fill" style={{width:`${(count/(stats.top_fields[0]?.[1]||1))*100}%`,background:'#14A3B3'}}></div></div>
                    <div className="bar-count">{count}</div>
                  </div>
                )) : <div className="empty-state">No data yet</div>}
              </div>
            </div>

            <div className="card" style={{marginTop:20}}>
              <div className="card-title">⏱ Skylar speed</div>
              <div className="speed-grid">
                {speedSummary(stats.speed).map(([label, value, hint]) => (
                  <div key={label} className="speed-item">
                    <div className="speed-num">{value}</div>
                    <div className="speed-label">{label}</div>
                    <div className="speed-hint">{hint}</div>
                  </div>
                ))}
              </div>
              {(stats.speed?.match || []).length ? (
                <table className="speed-table">
                  <thead><tr><th>When</th><th>First results</th><th>Full report</th><th>Notes</th></tr></thead>
                  <tbody>
                    {stats.speed.match.slice(0, 8).map((m, i) => (
                      <tr key={`${m.at}-${i}`}>
                        <td>{new Date(m.at).toLocaleString()}</td>
                        <td>{Number.isFinite(m.first_ms) ? secs(m.first_ms) : '-'}</td>
                        <td>{secs(m.total_ms)}</td>
                        <td>{speedNote(m)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="empty-state" style={{padding:16}}>Career Match timings appear here after the first student finishes.</div>}
            </div>
          </>)}
        </>)}

        {/* ── KNOWLEDGE UPDATE TAB ── */}
        {tab === 'knowledge' && (<>
          <div className="skylar-note">
            <div className="skylar-dot">S</div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:'#0E7C8A',marginBottom:4}}>Skylar's Live Knowledge Panel</div>
              <div style={{fontSize:14,color:'#4a4740',lineHeight:1.65}}>
                Anything you add here goes directly into Skylar's brain — she will use it in every response from the moment you save it. No redeployment needed. Use this to add new concours fees, new institutions, exam date changes, corrections, or anything else. It works instantly.
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">➕ Add New Knowledge</div>
            <div className="ku-form">
              <label>Category</label>
              <select value={newUpdate.category} onChange={e=>setNewUpdate({...newUpdate,category:e.target.value})}>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>

              <label>Title <span style={{color:'#C2BFB8',fontWeight:400,textTransform:'none',letterSpacing:0}}>(short description of what you're adding)</span></label>
              <input
                type="text"
                placeholder="e.g. FHS Buea 2026 registration fee updated"
                value={newUpdate.title}
                onChange={e=>setNewUpdate({...newUpdate,title:e.target.value})}
              />

              <label>Content <span style={{color:'#C2BFB8',fontWeight:400,textTransform:'none',letterSpacing:0}}>(write exactly what Skylar should know — be specific)</span></label>
              <textarea
                placeholder={`Example:\nFHS Buea registration fee for 2026-2027 academic year is now 25,000 FCFA (increased from 20,000 FCFA). This applies to all programmes: Nursing, MLS, Midwifery, BMS, and Public Health. Registration opens 1 July 2026 and closes 31 August 2026.`}
                value={newUpdate.content}
                onChange={e=>setNewUpdate({...newUpdate,content:e.target.value})}
              />

              <button className="btn-save" onClick={saveUpdate} disabled={saving}>
                {saving ? 'Saving…' : '✓ Save to Skylar\'s Knowledge'}
              </button>

              {saveMsg && (
                <div className={`save-msg ${saveMsg.startsWith('✓')?'ok':'warn'}`}>{saveMsg}</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title">📚 Current Knowledge Updates ({updates.length})</div>
            {updates.length === 0 && (
              <div className="empty-state">
                No updates added yet. Use the form above to teach Skylar something new.
              </div>
            )}
            {updates.map((u,i)=>(
              <div key={u.id||i} className="update-item">
                <button className="btn-delete" onClick={()=>deleteUpdate(u.id)}>Remove</button>
                <div className="update-category">{u.category}</div>
                <div className="update-title">{u.title}</div>
                <div className="update-content">{u.content}</div>
                <div className="update-meta">Added {new Date(u.timestamp).toLocaleString('en-GB')} · {u.addedBy}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">📖 Prepare the Concours guides</div>
            <p style={{fontSize:14,color:'#4a4740',lineHeight:1.65,marginBottom:14}}>
              Each guide is written once and then served instantly to every student. When you add or remove an update above, the guides refresh themselves the next time someone opens them. Before an event, press this button to prepare all {CONCOURS_LIST.length} exam guides and {FIELDS.length} global perspectives in advance, then open the Concours page and check each one for accuracy. This can take several minutes, so keep this tab open.
            </p>
            <button className="btn-save" onClick={prepareGuides} disabled={Boolean(warm?.running)}>
              {warm?.running ? `Preparing… ${warm.done} of ${warm.total}` : 'Prepare all guides'}
            </button>
            {warm && !warm.running && (
              <div className={`save-msg ${warm.failed.length ? 'warn' : 'ok'}`}>
                {warm.failed.length
                  ? `Finished, but these did not load: ${warm.failed.join(', ')}. Press the button again to retry them.`
                  : `✓ All ${warm.total} guides are ready (${warm.generated} newly written, ${warm.total - warm.generated} already up to date).`}
              </div>
            )}
          </div>

          <div className="card" style={{background:'rgba(14,124,138,.03)',border:'1.5px solid rgba(14,124,138,.12)'}}>
            <div className="card-title">💡 What to add here</div>
            {[
              ['Concours Update','A new communiqué was released — update the fee, date, places, or exam format'],
              ['New Institution','A new school or programme has been gazetted and is accepting students'],
              ['Fee Change','Any registration fee that has increased or decreased'],
              ['Exam Date','Official exam date for any concours for the current academic year'],
              ['Correction','Something in Skylar\'s existing knowledge that is wrong — correct it here'],
              ['General Knowledge','Anything useful about Cameroon\'s educational system Skylar should know'],
            ].map(([cat,desc])=>(
              <div key={cat} style={{display:'flex',gap:12,marginBottom:12,fontSize:14}}>
                <span style={{background:'rgba(14,124,138,.1)',color:'#0E7C8A',fontWeight:700,padding:'3px 10px',borderRadius:20,fontSize:12,flexShrink:0,height:'fit-content',marginTop:1}}>{cat}</span>
                <span style={{color:'#4a4740',lineHeight:1.6}}>{desc}</span>
              </div>
            ))}
          </div>
        </>)}

        {/* ── LIVE ACTIVITY TAB ── */}
        {tab === 'activity' && (<>
          <div className="card">
            <div className="card-title" style={{justifyContent:'space-between'}}>
              🕐 Recent Activity
              <button onClick={loadStats} className="refresh-btn" style={{marginLeft:'auto'}}>↻ Refresh</button>
            </div>
            {statsLoading && <div className="empty-state">Loading…</div>}
            {!statsLoading && events.length === 0 && (
              <div className="empty-state">
                No activity yet, or storage is not connected.<br/>
                <span style={{fontSize:12,marginTop:8,display:'block'}}>Until storage is connected, events are only written to the Vercel function logs.</span>
              </div>
            )}
            {events.slice(0,30).map((ev,i)=>(
              <div key={i} className="event-row">
                <div className="event-time">{new Date(ev.timestamp).toLocaleString('en-GB')}</div>
                <div className="event-type">{(ev.event||'').replace(/_/g,' ')}</div>
                <div className="event-data">{typeof ev.data === 'object' ? JSON.stringify(ev.data).slice(0,100) : String(ev.data||'')}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">📌 Connect storage (Upstash Redis)</div>
            <ol style={{fontSize:14,color:'#4a4740',lineHeight:2.2,paddingLeft:20}}>
              <li>Open your <strong>Vercel dashboard</strong> and select the Skyline project</li>
              <li>Open <strong>Storage</strong>. If a Redis store (Upstash) is already listed, make sure it is connected to this project</li>
              <li>Otherwise choose <strong>Create Database</strong>, pick <strong>Upstash for Redis</strong> from the Marketplace, and pick a region close to your functions</li>
              <li>Connect it to the project. Vercel adds the connection variables automatically</li>
              <li>Redeploy once. Analytics and Skylar updates will then be saved ✓</li>
            </ol>
          </div>
        </>)}

      </div>
    </>
  );
}
