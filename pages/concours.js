import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';

const CONCOURS_LIST = [
  { id: 'ENSPY', name: 'ENSPY — Polytechnique Yaoundé', field: 'Engineering', icon: '⚙️' },
  { id: 'FET', name: 'FET — Faculty of Engineering & Technology, UB', field: 'Engineering', icon: '⚙️' },
  { id: 'COT', name: 'COT — College of Technology, UB', field: 'Engineering', icon: '⚙️' },
  { id: 'ENSPD', name: 'ENSPD — Polytechnique Douala', field: 'Engineering', icon: '⚙️' },
  { id: 'ENAFM_Medicine', name: 'ENAFM — General Medicine (FMSB/FHS)', field: 'Health Sciences', icon: '🏥' },
  { id: 'ENAFM_Pharmacy', name: 'ENAFM — Pharmacy', field: 'Health Sciences', icon: '🏥' },
  { id: 'ENAFM_Dentistry', name: 'ENAFM — Dentistry / Odontostomatology', field: 'Health Sciences', icon: '🏥' },
  { id: 'FHS_Nursing', name: 'FHS Buea — Nursing', field: 'Health Sciences', icon: '🏥' },
  { id: 'FHS_MLS', name: 'FHS Buea — Medical Laboratory Sciences', field: 'Health Sciences', icon: '🏥' },
  { id: 'FHS_Midwifery', name: 'FHS Buea — Midwifery', field: 'Health Sciences', icon: '🏥' },
  { id: 'FHS_BMS', name: 'FHS Buea — Biomedical Sciences', field: 'Health Sciences', icon: '🏥' },
  { id: 'FHS_PublicHealth', name: 'FHS Buea — Public Health', field: 'Health Sciences', icon: '🏥' },
  { id: 'FASA', name: 'FASA — Faculty of Agriculture, Dschang', field: 'Agriculture', icon: '🌱' },
  { id: 'FAVM', name: 'FAVM — Faculty of Agriculture & Vet Medicine, UB', field: 'Agriculture', icon: '🌱' },
  { id: 'ESMV', name: 'ESMV — School of Veterinary Medicine, Ngaoundéré', field: 'Agriculture', icon: '🌱' },
  { id: 'ENAM', name: 'ENAM — National School of Administration & Magistracy', field: 'Administration', icon: '⚖️' },
  { id: 'EMIA', name: 'EMIA — Combined Military Academy', field: 'Military', icon: '🎖️' },
  { id: 'ENIEG', name: 'ENIEG/GTTC — Teacher Training (Primary)', field: 'Education', icon: '📚' },
];

const FIELDS = [...new Set(CONCOURS_LIST.map(c => c.field))];

export default function ConcoursPage() {
  const [selectedField, setSelectedField] = useState('All');
  const [selectedConcours, setSelectedConcours] = useState(null);
  const [guide, setGuide] = useState(null);
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('guide'); // 'guide' | 'global'

  const filtered = selectedField === 'All'
    ? CONCOURS_LIST
    : CONCOURS_LIST.filter(c => c.field === selectedField);

  async function loadGuide(concours) {
    setSelectedConcours(concours);
    setGuide(null);
    setGlobalData(null);
    setTab('guide');
    setLoading(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'concours', concours: concours.name })
      });
      const data = await res.json();
      setGuide(data);
    } catch (e) {
      setGuide({ error: 'Failed to load. Please try again.' });
    }
    setLoading(false);
  }

  async function loadGlobal() {
    if (!guide) return;
    setTab('global');
    if (globalData) return;
    setLoading(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'global', field: guide.field || selectedConcours.field })
      });
      const data = await res.json();
      setGlobalData(data);
    } catch (e) {
      setGlobalData({ error: 'Failed to load. Please try again.' });
    }
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Concours Guide — Skyline Academy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <style>{`
        :root {
          --navy: #0E7C8A; --navy-mid: #14A3B3; --navy-light: #5CC8D6;
          --amber: #F7941E; --cream: #F8F6F1; --gray-light: #E8E6E1;
          --gray-mid: #C2BFB8; --gray-text: #7A776F; --white: #FFFFFF;
          --green: #1A7F5A; --red: #C0392B;
          --radius: 12px; --radius-sm: 8px;
          --shadow: 0 2px 16px rgba(11,31,58,0.10);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: var(--cream); color: #1a1a2e; min-height: 100vh; line-height: 1.6; }
        .header { background: var(--white); padding: 10px 24px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--gray-light); }
        .brand { color: var(--navy); font-size: 16px; font-weight: 700; }
        .brand span { color: var(--amber); }
        .nav-links { margin-left: auto; display: flex; gap: 16px; }
        .nav-links a { color: var(--gray-text); text-decoration: none; font-size: 14px; font-weight: 500; }
        .nav-links a:hover, .nav-links a.active { color: var(--navy); }
        .layout { display: grid; grid-template-columns: 280px 1fr; min-height: calc(100vh - 56px); }
        .sidebar { background: var(--white); border-right: 1px solid var(--gray-light); padding: 20px 0; overflow-y: auto; }
        .sidebar-title { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--gray-text); padding: 0 16px; margin-bottom: 12px; }
        .field-filter { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px; margin-bottom: 16px; }
        .field-btn { padding: 4px 10px; border-radius: 20px; border: 1.5px solid var(--gray-light); background: transparent; color: var(--gray-text); font-size: 12px; cursor: pointer; font-family: inherit; transition: all .15s; }
        .field-btn:hover { border-color: var(--navy-light); color: var(--navy); }
        .field-btn.active { background: var(--navy); border-color: var(--navy); color: white; }
        .concours-item { padding: 12px 16px; cursor: pointer; border-left: 3px solid transparent; transition: all .15s; }
        .concours-item:hover { background: var(--cream); border-left-color: var(--navy-light); }
        .concours-item.active { background: rgba(14,124,138,.07); border-left-color: var(--amber); }
        .concours-item-name { font-size: 13px; font-weight: 600; color: var(--navy); line-height: 1.3; }
        .concours-item-field { font-size: 11px; color: var(--gray-text); margin-top: 2px; }
        .main { padding: 32px 28px; overflow-y: auto; }
        .empty-state { text-align: center; padding: 80px 20px; color: var(--gray-text); }
        .empty-state h2 { font-size: 22px; color: var(--navy); margin-bottom: 8px; }
        .tabs { display: flex; gap: 4px; margin-bottom: 24px; background: var(--gray-light); padding: 4px; border-radius: var(--radius-sm); width: fit-content; }
        .tab { padding: 8px 20px; border-radius: 6px; border: none; background: transparent; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--gray-text); font-family: inherit; transition: all .15s; }
        .tab.active { background: white; color: var(--navy); box-shadow: 0 1px 4px rgba(0,0,0,.1); }
        .guide-header { background: var(--navy); border-radius: var(--radius); padding: 28px; margin-bottom: 24px; }
        .guide-header .eyebrow { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--amber); font-weight: 700; margin-bottom: 8px; }
        .guide-header h1 { font-size: 24px; font-weight: 700; color: white; margin-bottom: 6px; }
        .guide-header .sub { font-size: 14px; color: rgba(255,255,255,.65); }
        .section { background: white; border-radius: var(--radius); padding: 22px; margin-bottom: 16px; box-shadow: var(--shadow); }
        .section-title { font-size: 14px; font-weight: 700; color: var(--navy); margin-bottom: 14px; text-transform: uppercase; letter-spacing: .05em; display: flex; align-items: center; gap: 8px; }
        .section-title span { font-size: 16px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .info-block { background: var(--cream); border-radius: var(--radius-sm); padding: 12px 14px; }
        .info-label { font-size: 11px; color: var(--gray-text); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
        .info-value { font-size: 14px; color: var(--navy); font-weight: 500; }
        .paper-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: var(--radius-sm); border: 1.5px solid var(--gray-light); margin-bottom: 8px; }
        .paper-subject { font-size: 15px; font-weight: 700; color: var(--navy); flex: 1; }
        .paper-meta { display: flex; gap: 8px; }
        .paper-chip { background: var(--cream); color: var(--gray-text); font-size: 12px; font-weight: 600; padding: 3px 9px; border-radius: 20px; border: 1px solid var(--gray-light); }
        .paper-chip.coeff { background: rgba(14,124,138,.1); color: var(--navy); border-color: var(--navy-light); }
        .difficulty-bar { height: 8px; background: var(--gray-light); border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .difficulty-fill { height: 100%; border-radius: 4px; }
        .tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag { background: var(--cream); border: 1px solid var(--gray-light); color: var(--navy); font-size: 13px; padding: 5px 12px; border-radius: 20px; }
        .tag.amber { background: rgba(247,148,30,.12); border-color: rgba(247,148,30,.3); color: #9a5a00; }
        .tag.red { background: rgba(192,57,43,.08); border-color: rgba(192,57,43,.2); color: var(--red); }
        .tag.green { background: rgba(26,127,90,.08); border-color: rgba(26,127,90,.2); color: var(--green); }
        .tip-item { padding: 10px 14px; border-left: 3px solid var(--amber); background: rgba(247,148,30,.05); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; margin-bottom: 8px; font-size: 14px; color: #4a4740; line-height: 1.55; }
        .global-country { border: 1.5px solid var(--gray-light); border-radius: var(--radius); padding: 18px; margin-bottom: 12px; }
        .country-name { font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 10px; }
        .country-row { display: flex; gap: 8px; margin-bottom: 6px; font-size: 13px; }
        .country-label { color: var(--gray-text); font-weight: 600; min-width: 110px; }
        .country-val { color: #333; }
        .loading { text-align: center; padding: 60px; }
        .loader { width: 44px; height: 44px; border: 3px solid var(--gray-light); border-top-color: var(--navy); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .btn-global { background: var(--navy); color: white; border: none; padding: 10px 22px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 4px; }
        .btn-global:hover { background: var(--navy-mid); }
        @media (max-width: 768px) {
          .layout { grid-template-columns: 1fr; }
          .sidebar { border-right: none; border-bottom: 1px solid var(--gray-light); max-height: 280px; }
          .grid2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="header">
        <Image src="/skyline-logo.jpeg" alt="Skyline" width={36} height={36} style={{borderRadius:6,objectFit:'contain'}} />
        <div className="brand">Skyline <span>Academy</span></div>
        <nav className="nav-links">
          <a href="/">Career Match</a>
          <a href="/concours" className="active">Concours Guide</a>
        </nav>
      </header>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-title">Browse Concours</div>
          <div className="field-filter">
            <button className={`field-btn${selectedField==='All'?' active':''}`} onClick={()=>setSelectedField('All')}>All</button>
            {FIELDS.map(f => (
              <button key={f} className={`field-btn${selectedField===f?' active':''}`} onClick={()=>setSelectedField(f)}>{f}</button>
            ))}
          </div>
          {filtered.map(c => (
            <div key={c.id}
              className={`concours-item${selectedConcours?.id===c.id?' active':''}`}
              onClick={() => loadGuide(c)}>
              <div className="concours-item-name">{c.icon} {c.id}</div>
              <div className="concours-item-field">{c.name.replace(`${c.id} — `, '')}</div>
            </div>
          ))}
        </aside>

        {/* Main */}
        <main className="main">
          {!selectedConcours && (
            <div className="empty-state">
              <div style={{fontSize:48,marginBottom:16}}>📋</div>
              <h2>Select a concours to get started</h2>
              <p>Choose any competitive entrance examination from the list on the left to get a complete guide — exam format, eligibility, preparation strategy, and global perspective.</p>
            </div>
          )}

          {selectedConcours && (
            <>
              <div className="tabs">
                <button className={`tab${tab==='guide'?' active':''}`} onClick={()=>setTab('guide')}>📖 Complete Guide</button>
                <button className={`tab${tab==='global'?' active':''}`} onClick={loadGlobal}>🌍 Global Perspective</button>
              </div>

              {loading && (
                <div className="loading">
                  <div className="loader"></div>
                  <div style={{color:'var(--navy)',fontWeight:600}}>Loading your guide...</div>
                  <div style={{color:'var(--gray-text)',fontSize:13,marginTop:4}}>Consulting Skyline's knowledge base</div>
                </div>
              )}

              {!loading && tab === 'guide' && guide && !guide.error && (
                <>
                  <div className="guide-header">
                    <div className="eyebrow">{guide.field}</div>
                    <h1>{guide.name}</h1>
                    <div className="sub">{guide.institution} · {guide.location}</div>
                  </div>

                  {/* Overview */}
                  <div className="section">
                    <div className="section-title"><span>📌</span> Overview</div>
                    <p style={{fontSize:15,color:'#333',lineHeight:1.65}}>{guide.overview}</p>
                  </div>

                  {/* Exam Format */}
                  {guide.exam_format && (
                    <div className="section">
                      <div className="section-title"><span>📝</span> Exam Format</div>
                      {guide.exam_format.papers?.map((p, i) => (
                        <div key={i} className="paper-row">
                          <div className="paper-subject">{p.subject}</div>
                          <div className="paper-meta">
                            {p.duration && <span className="paper-chip">{p.duration}</span>}
                            {p.coefficient && <span className="paper-chip coeff">Coeff {p.coefficient}</span>}
                            {p.questions && <span className="paper-chip">{p.questions}</span>}
                          </div>
                        </div>
                      ))}
                      {guide.exam_format.structure_note && (
                        <div className="tip-item" style={{marginTop:12}}>{guide.exam_format.structure_note}</div>
                      )}
                    </div>
                  )}

                  {/* Key Numbers */}
                  <div className="section">
                    <div className="section-title"><span>📊</span> Key Numbers</div>
                    <div className="grid2">
                      <div className="info-block">
                        <div className="info-label">Places Available</div>
                        <div className="info-value">{guide.places || '—'}</div>
                      </div>
                      <div className="info-block">
                        <div className="info-label">Registration Fee</div>
                        <div className="info-value">{guide.registration?.fee || '—'}</div>
                      </div>
                      <div className="info-block">
                        <div className="info-label">Age Limit</div>
                        <div className="info-value">{guide.eligibility?.age_limit || 'None published'}</div>
                      </div>
                      <div className="info-block">
                        <div className="info-label">Study Duration</div>
                        <div className="info-value">{guide.career_outcomes?.duration || '—'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Eligibility */}
                  {guide.eligibility && (
                    <div className="section">
                      <div className="section-title"><span>✅</span> Who Can Apply</div>
                      <div className="tag-list" style={{marginBottom:10}}>
                        {guide.eligibility.diplomas?.map((d,i) => <span key={i} className="tag">{d}</span>)}
                      </div>
                      {guide.eligibility.subjects_required?.length > 0 && (
                        <>
                          <div style={{fontSize:12,color:'var(--gray-text)',fontWeight:600,marginBottom:6,marginTop:8}}>REQUIRED SUBJECTS</div>
                          <div className="tag-list">
                            {guide.eligibility.subjects_required.map((s,i) => <span key={i} className="tag amber">{s}</span>)}
                          </div>
                        </>
                      )}
                      {guide.eligibility.other && (
                        <div className="tip-item" style={{marginTop:12}}>{guide.eligibility.other}</div>
                      )}
                    </div>
                  )}

                  {/* Difficulty */}
                  {guide.difficulty && (
                    <div className="section">
                      <div className="section-title"><span>🎯</span> Competition Level</div>
                      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                        <span style={{fontSize:18,fontWeight:700,color:guide.difficulty.level==='Extremely Competitive'?'var(--red)':guide.difficulty.level==='Very Competitive'?'#c47e0a':guide.difficulty.level==='Competitive'?'var(--navy)':'var(--green)'}}>{guide.difficulty.level}</span>
                        {guide.difficulty.acceptance_rate_estimate && (
                          <span style={{fontSize:13,color:'var(--gray-text)'}}>~{guide.difficulty.acceptance_rate_estimate} acceptance</span>
                        )}
                      </div>
                      <p style={{fontSize:14,color:'#4a4740',lineHeight:1.6}}>{guide.difficulty.honest_assessment}</p>
                      {guide.difficulty.hardest_paper && (
                        <div style={{marginTop:10,fontSize:13,color:'var(--gray-text)'}}>
                          <strong>Hardest paper:</strong> {guide.difficulty.hardest_paper}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preparation */}
                  {guide.preparation && (
                    <div className="section">
                      <div className="section-title"><span>📚</span> How to Prepare</div>
                      {guide.preparation.timeline && (
                        <div className="info-block" style={{marginBottom:14}}>
                          <div className="info-label">Recommended Prep Time</div>
                          <div className="info-value">{guide.preparation.timeline}</div>
                        </div>
                      )}
                      <p style={{fontSize:14,color:'#333',lineHeight:1.65,marginBottom:14}}>{guide.preparation.study_strategy}</p>
                      {guide.preparation.key_topics?.length > 0 && (
                        <>
                          <div style={{fontSize:12,color:'var(--gray-text)',fontWeight:600,marginBottom:8}}>KEY TOPICS TO MASTER</div>
                          <div className="tag-list" style={{marginBottom:14}}>
                            {guide.preparation.key_topics.map((t,i) => <span key={i} className="tag">{t}</span>)}
                          </div>
                        </>
                      )}
                      {guide.preparation.common_mistakes?.length > 0 && (
                        <>
                          <div style={{fontSize:12,color:'var(--gray-text)',fontWeight:600,marginBottom:8}}>COMMON MISTAKES TO AVOID</div>
                          <div className="tag-list">
                            {guide.preparation.common_mistakes.map((m,i) => <span key={i} className="tag red">{m}</span>)}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Career Outcomes */}
                  {guide.career_outcomes && (
                    <div className="section">
                      <div className="section-title"><span>🚀</span> Where This Takes You</div>
                      <div className="grid2" style={{marginBottom:14}}>
                        <div className="info-block">
                          <div className="info-label">Degree Awarded</div>
                          <div className="info-value">{guide.career_outcomes.degree_awarded}</div>
                        </div>
                        {guide.career_outcomes.salary_range_cameroon && (
                          <div className="info-block">
                            <div className="info-label">Entry Salary (Cameroon)</div>
                            <div className="info-value">{guide.career_outcomes.salary_range_cameroon}</div>
                          </div>
                        )}
                      </div>
                      <div className="tag-list">
                        {guide.career_outcomes.career_paths?.map((c,i) => <span key={i} className="tag green">{c}</span>)}
                      </div>
                    </div>
                  )}

                  {/* Insider Tips */}
                  {guide.insider_tips?.length > 0 && (
                    <div className="section">
                      <div className="section-title"><span>💡</span> Insider Tips</div>
                      {guide.insider_tips.map((t,i) => <div key={i} className="tip-item">{t}</div>)}
                    </div>
                  )}

                  <div style={{textAlign:'center',padding:'16px 0 32px'}}>
                    <button className="btn-global" onClick={loadGlobal}>
                      🌍 See Global Perspective & International Pathways →
                    </button>
                  </div>
                </>
              )}

              {!loading && tab === 'global' && globalData && !globalData.error && (
                <>
                  <div className="guide-header">
                    <div className="eyebrow">Global Perspective</div>
                    <h1>{globalData.field} — Cameroon vs The World</h1>
                    <div className="sub">How your Cameroonian qualification compares internationally</div>
                  </div>

                  <div className="section">
                    <div className="section-title"><span>🇨🇲</span> In Cameroon</div>
                    <p style={{fontSize:15,lineHeight:1.65,marginBottom:14}}>{globalData.cameroon_overview}</p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                      <div>
                        <div style={{fontSize:12,color:'var(--green)',fontWeight:700,marginBottom:8}}>STRENGTHS</div>
                        {globalData.cameroon_strengths?.map((s,i) => <div key={i} className="tag green" style={{marginBottom:6,display:'block'}}>{s}</div>)}
                      </div>
                      <div>
                        <div style={{fontSize:12,color:'var(--red)',fontWeight:700,marginBottom:8}}>CHALLENGES</div>
                        {globalData.cameroon_challenges?.map((c,i) => <div key={i} className="tag red" style={{marginBottom:6,display:'block'}}>{c}</div>)}
                      </div>
                    </div>
                  </div>

                  {globalData.comparison?.map((country, i) => (
                    <div key={i} className="global-country">
                      <div className="country-name">🌐 {country.country}</div>
                      <div className="country-row"><span className="country-label">Their system:</span><span className="country-val">{country.system}</span></div>
                      <div className="country-row"><span className="country-label">Similar to Cameroon:</span><span className="country-val">{country.similarities}</span></div>
                      <div className="country-row"><span className="country-label">Key differences:</span><span className="country-val">{country.differences}</span></div>
                      <div className="country-row"><span className="country-label">Can you work there?</span><span className="country-val" style={{color:'var(--navy)',fontWeight:500}}>{country.mutual_recognition}</span></div>
                    </div>
                  ))}

                  {globalData.qualification_journey && (
                    <div className="section">
                      <div className="section-title"><span>🗺️</span> Your Pathway Abroad</div>
                      {[
                        ['Study in France', globalData.qualification_journey.to_study_in_france],
                        ['Study in UK', globalData.qualification_journey.to_study_in_uk],
                        ['Study in USA', globalData.qualification_journey.to_study_in_us],
                        ['Work in France', globalData.qualification_journey.to_work_in_france],
                        ['Work in UK', globalData.qualification_journey.to_work_in_uk],
                        ['Work in USA', globalData.qualification_journey.to_work_in_us],
                      ].map(([label, val], i) => (
                        <div key={i} style={{marginBottom:12}}>
                          <div style={{fontSize:13,fontWeight:700,color:'var(--navy)',marginBottom:4}}>{label}</div>
                          <div style={{fontSize:14,color:'#4a4740',lineHeight:1.6}}>{val}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="section" style={{background:'rgba(14,124,138,.04)',border:'1.5px solid rgba(14,124,138,.15)'}}>
                    <div className="section-title"><span>🎯</span> Reality Check</div>
                    <p style={{fontSize:15,lineHeight:1.65,marginBottom:14}}>{globalData.reality_check}</p>
                    {globalData.cameroonian_advantage && (
                      <div className="tip-item">{globalData.cameroonian_advantage}</div>
                    )}
                  </div>
                </>
              )}

              {!loading && guide?.error && (
                <div style={{background:'#fdecea',border:'1px solid #f5c6c4',color:'var(--red)',padding:20,borderRadius:12,textAlign:'center'}}>
                  {guide.error}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
