import Head from 'next/head';
import Image from 'next/image';

export default function CareerMatch() {
  return (
    <>
      <Head>
        <title>My Career Match — Skyline Academy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <style>{`
        :root {
          --navy: #0E7C8A; --navy-mid: #14A3B3; --navy-light: #5CC8D6;
          --amber: #F7941E; --amber-light: #FFC97A;
          --cream: #F8F6F1; --gray-light: #E8E6E1; --gray-mid: #C2BFB8;
          --gray-text: #7A776F; --white: #FFFFFF;
          --green: #1A7F5A; --green-light: #E3F5ED;
          --red: #C0392B; --red-light: #FDECEA;
          --radius: 12px; --radius-sm: 8px;
          --shadow: 0 2px 16px rgba(11,31,58,0.10);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: var(--cream); color: var(--navy); min-height: 100vh; line-height: 1.6; }
        .site-header { background: var(--white); padding: 10px 24px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--gray-light); box-shadow: 0 1px 8px rgba(14,124,138,0.06); }
        .logo-img { border-radius: 6px; object-fit: contain; }
        .brand { color: var(--navy); font-size: 16px; font-weight: 700; letter-spacing: .01em; }
        .brand span { color: var(--amber); }
        .nav-links { margin-left: auto; display: flex; gap: 20px; }
        .nav-links a { color: var(--gray-text); text-decoration: none; font-size: 14px; font-weight: 500; transition: color .15s; }
        .nav-links a:hover { color: var(--navy); }
        .nav-links a.active { color: var(--navy); font-weight: 700; }
        .container { max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; }
        .step { display: none; animation: fadeIn .3s ease; }
        .step.active { display: block; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .hero { background: var(--navy); border-radius: var(--radius); padding: 48px 36px; text-align: center; margin-bottom: 24px; position: relative; overflow: hidden; }
        .hero::before { content:''; position:absolute; top:-60px; right:-60px; width:220px; height:220px; background:var(--amber); opacity:.06; border-radius:50%; }
        .hero-eyebrow { font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--amber); font-weight:700; margin-bottom:16px; }
        .hero-logo-badge { width:84px; height:84px; background:white; border-radius:18px; display:flex; align-items:center; justify-content:center; margin:0 auto 18px; box-shadow:0 6px 24px rgba(0,0,0,.18); overflow:hidden; }
        .hero h1 { font-size:34px; font-weight:700; color:white; line-height:1.2; margin-bottom:14px; }
        .hero h1 em { color:var(--amber); font-style:normal; }
        .hero p { font-size:16px; color:rgba(255,255,255,.72); max-width:460px; margin:0 auto 28px; line-height:1.65; }
        .hero-stats { display:flex; gap:24px; justify-content:center; flex-wrap:wrap; margin-bottom:32px; }
        .hero-stat .num { font-size:22px; font-weight:700; color:var(--amber); }
        .hero-stat .lbl { font-size:11px; color:rgba(255,255,255,.55); text-transform:uppercase; letter-spacing:.05em; }
        .progress-wrap { margin-bottom:28px; }
        .progress-meta { display:flex; justify-content:space-between; margin-bottom:8px; }
        .progress-label { font-size:12px; color:var(--gray-text); letter-spacing:.04em; text-transform:uppercase; font-weight:600; }
        .progress-frac { font-size:12px; color:var(--gray-text); }
        .progress-track { height:5px; background:var(--gray-light); border-radius:3px; overflow:hidden; }
        .progress-bar { height:100%; background:linear-gradient(90deg,var(--navy-light),var(--amber)); border-radius:3px; transition:width .5s; }
        .section-eyebrow { font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--amber); font-weight:700; margin-bottom:6px; }
        .section-title { font-size:21px; font-weight:700; color:var(--navy); line-height:1.25; margin-bottom:6px; }
        .section-sub { font-size:14px; color:var(--gray-text); line-height:1.6; margin-bottom:22px; }
        .q-card { background:white; border-radius:var(--radius); padding:22px 24px; margin-bottom:16px; box-shadow:var(--shadow); border:1px solid rgba(11,31,58,.06); }
        .q-number { font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--amber); margin-bottom:8px; }
        .q-text { font-size:16px; font-weight:600; color:var(--navy); margin-bottom:16px; line-height:1.45; }
        .q-scenario { font-size:13px; color:var(--gray-text); background:var(--cream); border-left:3px solid var(--amber); padding:10px 14px; border-radius:0 6px 6px 0; margin-bottom:16px; line-height:1.55; font-style:italic; }
        .options { display:flex; flex-direction:column; gap:10px; }
        .opt-btn { display:flex; align-items:flex-start; gap:14px; padding:14px 16px; border-radius:var(--radius-sm); border:1.5px solid var(--gray-light); background:var(--cream); cursor:pointer; text-align:left; font-family:inherit; transition:all .18s; width:100%; }
        .opt-btn:hover { border-color:var(--navy-light); background:white; }
        .opt-btn.selected { border-color:var(--navy); background:var(--navy); color:white; }
        .opt-btn.selected .opt-letter { background:var(--amber); color:var(--navy); }
        .opt-btn.selected .opt-text { color:white; }
        .opt-btn.selected .opt-sub { color:rgba(255,255,255,.65); }
        .opt-letter { width:28px; height:28px; border-radius:50%; background:var(--gray-light); color:var(--gray-text); font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; transition:all .18s; }
        .opt-text { font-size:15px; font-weight:500; color:var(--navy); line-height:1.4; }
        .opt-sub { font-size:13px; color:var(--gray-text); margin-top:3px; line-height:1.4; }
        .likert-wrap { display:flex; gap:8px; }
        .likert-labels { display:flex; justify-content:space-between; font-size:11px; color:var(--gray-text); margin-top:6px; }
        .likert-btn { flex:1; height:40px; border-radius:6px; border:1.5px solid var(--gray-light); background:var(--cream); cursor:pointer; font-size:13px; font-weight:600; color:var(--gray-text); transition:all .15s; font-family:inherit; }
        .likert-btn:hover { border-color:var(--navy-light); color:var(--navy); }
        .likert-btn.selected { background:var(--navy); border-color:var(--navy); color:white; }
        .nav-row { display:flex; justify-content:space-between; align-items:center; margin-top:24px; gap:12px; }
        .btn { padding:13px 28px; border-radius:var(--radius-sm); font-size:15px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .18s; border:1.5px solid transparent; }
        .btn-secondary { background:transparent; border-color:var(--gray-mid); color:var(--gray-text); }
        .btn-secondary:hover { border-color:var(--navy); color:var(--navy); }
        .btn-primary { background:var(--navy); color:white; flex:1; max-width:260px; border-color:var(--navy); }
        .btn-primary:hover { background:var(--navy-mid); }
        .btn-amber { background:var(--amber); color:var(--navy); font-weight:700; border:none; padding:15px 36px; font-size:16px; border-radius:var(--radius-sm); cursor:pointer; font-family:inherit; transition:all .18s; }
        .btn-amber:hover { background:#e09520; }
        .err-msg { display:none; background:var(--red-light); color:var(--red); font-size:13px; padding:10px 14px; border-radius:var(--radius-sm); margin-top:12px; border-left:3px solid var(--red); }
        .stream-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:6px; }
        .stream-card { padding:18px 16px; border-radius:var(--radius); border:1.5px solid var(--gray-light); background:white; cursor:pointer; text-align:left; transition:all .18s; font-family:inherit; width:100%; }
        .stream-card:hover { border-color:var(--navy-mid); }
        .stream-card.selected { border-color:var(--navy); background:var(--navy); }
        .stream-card.selected .stream-title { color:white; }
        .stream-card.selected .stream-subs { color:rgba(255,255,255,.6); }
        .stream-card.selected .stream-badge { background:var(--amber); color:var(--navy); }
        .stream-badge { display:inline-block; background:var(--gray-light); color:var(--gray-text); font-size:11px; font-weight:700; padding:2px 9px; border-radius:20px; margin-bottom:8px; }
        .stream-title { font-size:15px; font-weight:700; color:var(--navy); margin-bottom:4px; }
        .stream-subs { font-size:12px; color:var(--gray-text); line-height:1.5; }
        .subject-grid { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:6px; }
        .subject-chip { padding:7px 14px; border-radius:20px; border:1.5px solid var(--gray-light); background:white; color:var(--navy); font-size:13px; font-weight:500; cursor:pointer; font-family:inherit; transition:all .15s; }
        .subject-chip:hover { border-color:var(--navy-mid); }
        .subject-chip.selected { background:var(--navy); border-color:var(--navy); color:white; }
        .info-note { font-size:12px; color:var(--gray-text); margin-top:8px; display:flex; align-items:flex-start; gap:6px; line-height:1.5; }
        .loading-wrap { text-align:center; padding:64px 20px; }
        .loader-ring { width:56px; height:56px; border:4px solid var(--gray-light); border-top-color:var(--navy); border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 24px; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .loading-title { font-size:20px; font-weight:700; color:var(--navy); margin-bottom:8px; }
        .loading-sub { font-size:14px; color:var(--gray-text); }
        .load-stage { display:flex; align-items:center; gap:10px; padding:8px 0; font-size:14px; color:var(--gray-text); opacity:.4; transition:opacity .4s; }
        .load-stage.active { opacity:1; color:var(--navy); font-weight:500; }
        .load-stage.done { opacity:.7; color:var(--green); }
        .load-dot { width:8px; height:8px; border-radius:50%; background:var(--gray-mid); flex-shrink:0; }
        .load-stage.active .load-dot { background:var(--amber); }
        .load-stage.done .load-dot { background:var(--green); }
        .result-hero { background:var(--navy); border-radius:var(--radius); padding:32px 28px; margin-bottom:24px; text-align:center; }
        .result-hero .eyebrow { color:var(--amber); font-size:11px; letter-spacing:.1em; text-transform:uppercase; font-weight:700; margin-bottom:10px; }
        .result-hero h2 { color:white; font-size:26px; font-weight:700; margin-bottom:8px; line-height:1.25; }
        .result-hero p { color:rgba(255,255,255,.65); font-size:14px; line-height:1.6; }
        .profile-badges { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:16px; }
        .profile-badge { background:rgba(245,166,35,.15); border:1px solid rgba(245,166,35,.3); color:var(--amber-light); font-size:12px; font-weight:600; padding:5px 12px; border-radius:20px; }
        .careers-label { font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--gray-text); margin-bottom:14px; margin-top:4px; }
        .career-card { background:white; border-radius:var(--radius); padding:22px 24px; margin-bottom:14px; box-shadow:var(--shadow); border:1.5px solid var(--gray-light); opacity:0; transform:translateY(16px); transition:opacity .5s ease, transform .5s ease; }
        .career-card.visible { opacity:1; transform:translateY(0); }
        .career-card.top-match { border-color:var(--amber); }
        .card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:14px; }
        .top-badge-pill { display:inline-block; background:var(--amber); color:var(--navy); font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; margin-bottom:6px; }
        .career-title { font-size:18px; font-weight:700; color:var(--navy); line-height:1.2; margin-bottom:3px; }
        .career-field { font-size:13px; color:var(--gray-text); }
        .score-circle { width:62px; height:62px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-direction:column; flex-shrink:0; border:3px solid var(--gray-light); }
        .score-circle .score-num { font-size:20px; font-weight:700; color:var(--navy); line-height:1; }
        .score-circle .score-pct { font-size:10px; color:var(--gray-text); font-weight:600; }
        .score-circle.high { border-color:var(--green); }
        .score-circle.high .score-num { color:var(--green); }
        .score-circle.mid { border-color:var(--amber); }
        .score-circle.mid .score-num { color:#c47e0a; }
        .bar-wrap { margin-bottom:14px; }
        .bar-label { display:flex; justify-content:space-between; font-size:12px; color:var(--gray-text); margin-bottom:5px; }
        .bar-track { height:7px; background:var(--gray-light); border-radius:4px; overflow:hidden; }
        .bar-fill { height:100%; border-radius:4px; width:0; transition:width 1.2s cubic-bezier(.4,0,.2,1); }
        .bar-navy { background:var(--navy); } .bar-amber { background:var(--amber); } .bar-green { background:var(--green); }
        .card-why { font-size:14px; color:#4A4740; line-height:1.65; margin-bottom:14px; padding:12px 14px; background:var(--cream); border-radius:var(--radius-sm); border-left:3px solid var(--navy-light); }
        .concours-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--gray-text); margin-bottom:7px; }
        .concours-chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
        .concours-chip { background:var(--cream); border:1px solid var(--gray-light); color:var(--navy-mid); font-size:12px; font-weight:600; padding:4px 11px; border-radius:20px; }
        .dim-bars { display:flex; gap:8px; margin-top:12px; }
        .dim-bar-item { flex:1; }
        .dim-bar-label { font-size:11px; color:var(--gray-text); margin-bottom:4px; text-align:center; }
        .dim-bar-track { height:5px; background:var(--gray-light); border-radius:3px; overflow:hidden; }
        .dim-bar-fill { height:100%; border-radius:3px; width:0; transition:width 1.4s cubic-bezier(.4,0,.2,1); background:var(--navy-light); }
        .concours-detail-box { background:var(--cream); border-radius:var(--radius-sm); border:1px solid var(--gray-light); padding:14px 16px; margin-bottom:12px; }
        .concours-detail-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--navy); margin-bottom:10px; }
        .concours-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .cd-item { }
        .cd-label { font-size:10px; color:var(--gray-text); font-weight:600; text-transform:uppercase; letter-spacing:.05em; }
        .cd-value { font-size:13px; color:var(--navy); font-weight:500; line-height:1.4; }
        .global-pill { display:inline-block; background:rgba(14,124,138,.08); border:1px solid rgba(14,124,138,.2); color:var(--navy); font-size:13px; padding:10px 14px; border-radius:var(--radius-sm); line-height:1.55; margin-bottom:12px; }
        .result-footer { text-align:center; margin-top:32px; padding-top:24px; border-top:1px solid var(--gray-light); }
        .result-footer p { font-size:14px; color:var(--gray-text); margin-bottom:16px; }
        .footer-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
        .btn-outline-navy { background:transparent; border:1.5px solid var(--navy); color:var(--navy); padding:12px 24px; border-radius:var(--radius-sm); font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; text-decoration:none; display:inline-block; }
        .btn-outline-navy:hover { background:var(--navy); color:white; }
        textarea:focus { outline:2px solid var(--navy-light); }
        @media (max-width:520px) {
          .hero { padding:32px 20px; }
          .hero h1 { font-size:26px; }
          .stream-grid { grid-template-columns:1fr; }
          .concours-detail-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <header className="site-header">
        <Image src="/skyline-logo.jpeg" alt="Skyline Academy" width={44} height={44} className="logo-img" priority />
        <div className="brand">My Career <span>Match</span></div>
        <nav className="nav-links">
          <a href="/" className="active">Career Match</a>
          <a href="/concours">Concours Guide</a>
        </nav>
      </header>

      <div className="container">

        {/* STEP 0 — HERO */}
        <div className="step active" id="step-0">
          <div className="hero">
            <div className="hero-logo-badge">
              <Image src="/skyline-logo.jpeg" alt="Skyline Academy" width={64} height={64} />
            </div>
            <div className="hero-eyebrow">Skyline Academy presents</div>
            <h1>My Career <em>Match</em></h1>
            <p>A deep assessment rooted in career psychology that maps your personality, values, and academic profile to real career paths in Cameroon.</p>
            <div className="hero-stats">
              <div className="hero-stat"><div className="num">25</div><div className="lbl">Questions</div></div>
              <div className="hero-stat"><div className="num">6</div><div className="lbl">Stages</div></div>
              <div className="hero-stat"><div className="num">60+</div><div className="lbl">Career paths</div></div>
              <div className="hero-stat"><div className="num">AI</div><div className="lbl">Powered</div></div>
            </div>
            <button className="btn-amber" onClick={() => window.goTo(1)}>Begin my assessment →</button>
          </div>
          <div className="q-card" style={{borderLeft:'4px solid var(--amber)'}}>
            <div className="q-number">How this works</div>
            <p style={{fontSize:'15px',color:'var(--navy)',lineHeight:'1.65'}}>You will go through 6 stages covering your <strong>thinking style</strong>, <strong>core values</strong>, <strong>how you work</strong>, <strong>what drives you</strong>, your <strong>academic background</strong>, and your <strong>ambitions</strong>. Our AI then analyses your full profile against Cameroon's real educational and professional landscape to find your best matches — including the specific concours you need to write and how your qualification compares globally.</p>
          </div>
        </div>

        {/* STEP 1 */}
        <div className="step" id="step-1">
          <div className="progress-wrap">
            <div className="progress-meta"><span className="progress-label">Stage 1 of 6 — How you think</span><span className="progress-frac">1 / 6</span></div>
            <div className="progress-track"><div className="progress-bar" style={{width:'16%'}}></div></div>
          </div>
          <div className="section-eyebrow">Cognitive style</div>
          <div className="section-title">How do you naturally think and solve problems?</div>
          <div className="section-sub">Answer based on what feels most natural — not what you think you should answer.</div>
          <div className="q-card">
            <div className="q-number">Question 1</div>
            <div className="q-text">A new student joins your class. They look confused and lost. What is your first instinct?</div>
            <div className="options" data-q="q1">
              <button className="opt-btn" data-v="S" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">Go up and introduce yourself, find out their name and make them feel welcome</div></div></button>
              <button className="opt-btn" data-v="I" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">Watch from a distance first, try to understand the situation before acting</div></div></button>
              <button className="opt-btn" data-v="R" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">Point them to the right place or give them a direct practical solution</div></div></button>
              <button className="opt-btn" data-v="A" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">Think of a creative way to break the ice — maybe a joke or an interesting conversation starter</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 2</div>
            <div className="q-text">Your group is given a difficult assignment with no clear instructions. You:</div>
            <div className="options" data-q="q2">
              <button className="opt-btn" data-v="I" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">Start researching deeply to understand every aspect before doing anything</div></div></button>
              <button className="opt-btn" data-v="E" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">Take charge, assign roles to everyone and push the group to start immediately</div></div></button>
              <button className="opt-btn" data-v="C" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">Create a structured plan with steps, deadlines and a clear format</div></div></button>
              <button className="opt-btn" data-v="A" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">Suggest a fresh angle nobody has thought of yet — something creative and unexpected</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 3</div>
            <div className="q-text">Which of these activities would you most enjoy spending an entire afternoon doing?</div>
            <div className="options" data-q="q3">
              <button className="opt-btn" data-v="R" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">Fixing or assembling something physical — a machine, a device, a structure</div><div className="opt-sub">Hands-on, tangible results</div></div></button>
              <button className="opt-btn" data-v="I" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">Reading deeply about how the universe, the body, or society works</div><div className="opt-sub">Understanding complex systems</div></div></button>
              <button className="opt-btn" data-v="A" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">Creating something — writing, drawing, designing, composing</div><div className="opt-sub">Expression and originality</div></div></button>
              <button className="opt-btn" data-v="S" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">Teaching, mentoring or organising activities for people around you</div><div className="opt-sub">Impact through relationships</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 4</div>
            <div className="q-text">When you are given a maths or science problem, which best describes you?</div>
            <div className="options" data-q="q4">
              <button className="opt-btn" data-v="I_high" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">I genuinely enjoy it — problems feel like puzzles I want to crack</div></div></button>
              <button className="opt-btn" data-v="I_med" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">I can do it well but it is not what excites me most</div></div></button>
              <button className="opt-btn" data-v="I_low" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">I find it difficult and prefer other types of thinking</div></div></button>
              <button className="opt-btn" data-v="I_prac" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">I prefer applying concepts practically over solving abstract problems</div></div></button>
            </div>
          </div>
          <div className="err-msg" id="err-1">Please answer all four questions before continuing.</div>
          <div className="nav-row">
            <button className="btn btn-secondary" onClick={()=>window.goTo(0)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>window.nextStep(1,2,['q1','q2','q3','q4'])}>Continue →</button>
          </div>
        </div>

        {/* STEP 2 */}
        <div className="step" id="step-2">
          <div className="progress-wrap">
            <div className="progress-meta"><span className="progress-label">Stage 2 of 6 — What drives you</span><span className="progress-frac">2 / 6</span></div>
            <div className="progress-track"><div className="progress-bar" style={{width:'33%'}}></div></div>
          </div>
          <div className="section-eyebrow">Core values & motivations</div>
          <div className="section-title">What truly matters to you in life and work?</div>
          <div className="section-sub">These questions get at what you will find meaningful — not just enjoyable — in a career.</div>
          <div className="q-card">
            <div className="q-number">Question 5</div>
            <div className="q-text">You have just finished your studies. Which scenario feels most fulfilling to you?</div>
            <div className="options" data-q="q5">
              <button className="opt-btn" data-v="val_service" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">I am working in a rural health centre, and patients who would have died are alive because of me</div><div className="opt-sub">Service — impact on human lives</div></div></button>
              <button className="opt-btn" data-v="val_achievement" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">I have built a company that employs 50 people and is growing fast</div><div className="opt-sub">Achievement — building something great</div></div></button>
              <button className="opt-btn" data-v="val_knowledge" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">I have made a scientific discovery or written something that changes how people think</div><div className="opt-sub">Knowledge — advancing understanding</div></div></button>
              <button className="opt-btn" data-v="val_security" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">I have a stable, respected position that allows me to take care of my family comfortably</div><div className="opt-sub">Security — stability and family</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 6</div>
            <div className="q-scenario">Imagine two people: one earns 500,000 FCFA/month doing work they find meaningless, and another earns 200,000 FCFA/month doing work they are passionate about.</div>
            <div className="q-text">Which would you choose?</div>
            <div className="options" data-q="q6">
              <button className="opt-btn" data-v="meaning_first" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">I would choose meaning over money — purpose matters more than pay</div></div></button>
              <button className="opt-btn" data-v="balance" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">I want both — I believe I can find work that is meaningful and well-paid</div></div></button>
              <button className="opt-btn" data-v="security_first" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">Financial security comes first — I can find meaning in other areas of life</div></div></button>
              <button className="opt-btn" data-v="flexible" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">It depends on circumstances — I am realistic about what life requires</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 7</div>
            <div className="q-text">In 20 years, how do you want people to describe you?</div>
            <div className="options" data-q="q7">
              <button className="opt-btn" data-v="desc_expert" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">"They are one of the best in their field — a true expert and professional"</div></div></button>
              <button className="opt-btn" data-v="desc_leader" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">"They built something important and led people to great things"</div></div></button>
              <button className="opt-btn" data-v="desc_helper" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">"They dedicated their life to helping others and making the community better"</div></div></button>
              <button className="opt-btn" data-v="desc_creator" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">"They created things that were original and changed how people see the world"</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 8</div>
            <div className="q-text">How important is it to work in a field that directly serves your community or country?</div>
            <div className="likert-wrap" id="lk-q8">
              {[1,2,3,4,5].map(n=><button key={n} className="likert-btn" data-q="q8" data-v={String(n)} onClick={e=>window.pickLikert(e.currentTarget)}>{n}</button>)}
            </div>
            <div className="likert-labels"><span>Not important at all</span><span>Extremely important</span></div>
          </div>
          <div className="err-msg" id="err-2">Please answer all questions before continuing.</div>
          <div className="nav-row">
            <button className="btn btn-secondary" onClick={()=>window.goTo(1)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>window.nextStep(2,3,['q5','q6','q7','q8'])}>Continue →</button>
          </div>
        </div>

        {/* STEP 3 */}
        <div className="step" id="step-3">
          <div className="progress-wrap">
            <div className="progress-meta"><span className="progress-label">Stage 3 of 6 — How you work</span><span className="progress-frac">3 / 6</span></div>
            <div className="progress-track"><div className="progress-bar" style={{width:'50%'}}></div></div>
          </div>
          <div className="section-eyebrow">Working style & environment</div>
          <div className="section-title">How do you function best?</div>
          <div className="section-sub">Career satisfaction is deeply tied to your working environment — not just the job title.</div>
          <div className="q-card">
            <div className="q-number">Question 9</div>
            <div className="q-text">You perform best when:</div>
            <div className="options" data-q="q9">
              <button className="opt-btn" data-v="w_structure" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">There are clear rules, procedures and expectations</div></div></button>
              <button className="opt-btn" data-v="w_autonomy" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">I have freedom to decide how I approach a problem</div></div></button>
              <button className="opt-btn" data-v="w_collab" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">I am working closely with a team — collaboration energises me</div></div></button>
              <button className="opt-btn" data-v="w_mission" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">I deeply believe in what I am working on — the mission matters most</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 10</div>
            <div className="q-text">A friend comes to you with a serious personal problem. What do you do?</div>
            <div className="options" data-q="q10">
              <button className="opt-btn" data-v="emp_high" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">Listen carefully and help them process their feelings before offering any advice</div></div></button>
              <button className="opt-btn" data-v="emp_solve" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">Listen briefly then focus on finding a practical solution</div></div></button>
              <button className="opt-btn" data-v="emp_research" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">Research the topic thoroughly so I can give the most accurate information</div></div></button>
              <button className="opt-btn" data-v="emp_refer" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">Connect them with someone more qualified to help</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 11</div>
            <div className="q-text">Which work environment excites you most?</div>
            <div className="options" data-q="q11">
              <button className="opt-btn" data-v="env_clinical" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">Hospital, clinic or laboratory — precise, high-stakes, helping people heal</div></div></button>
              <button className="opt-btn" data-v="env_field" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">Outside, on-site or in the field — construction, agriculture, engineering, nature</div></div></button>
              <button className="opt-btn" data-v="env_office" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">Office, institution or government — policy, administration, law, finance</div></div></button>
              <button className="opt-btn" data-v="env_dynamic" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">Dynamic, varied — studio, community, travel</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 12</div>
            <div className="q-text">How comfortable are you with high-pressure situations where mistakes have serious consequences?</div>
            <div className="likert-wrap" id="lk-q12">
              {[1,2,3,4,5].map(n=><button key={n} className="likert-btn" data-q="q12" data-v={String(n)} onClick={e=>window.pickLikert(e.currentTarget)}>{n}</button>)}
            </div>
            <div className="likert-labels"><span>Very uncomfortable</span><span>Thrive under pressure</span></div>
          </div>
          <div className="err-msg" id="err-3">Please answer all questions before continuing.</div>
          <div className="nav-row">
            <button className="btn btn-secondary" onClick={()=>window.goTo(2)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>window.nextStep(3,4,['q9','q10','q11','q12'])}>Continue →</button>
          </div>
        </div>

        {/* STEP 4 */}
        <div className="step" id="step-4">
          <div className="progress-wrap">
            <div className="progress-meta"><span className="progress-label">Stage 4 of 6 — Academic background</span><span className="progress-frac">4 / 6</span></div>
            <div className="progress-track"><div className="progress-bar" style={{width:'66%'}}></div></div>
          </div>
          <div className="section-eyebrow">Education & subjects</div>
          <div className="section-title">Tell us about your studies</div>
          <div className="section-sub">Your stream and subject strengths directly determine which concours and programmes are open to you.</div>
          <div className="q-card">
            <div className="q-number">Question 13 — Your educational system</div>
            <div className="q-text">Which system did you study under?</div>
            <div className="options" data-q="q13">
              <button className="opt-btn" data-v="sys_gce" onClick={e=>{window.pickOpt(e.currentTarget);window.renderStreams('sys_gce');}}><span className="opt-letter">A</span><div><div className="opt-text">Anglophone — GCE O Levels / A Levels</div><div className="opt-sub">Cameroon GCE Board</div></div></button>
              <button className="opt-btn" data-v="sys_bac" onClick={e=>{window.pickOpt(e.currentTarget);window.renderStreams('sys_bac');}}><span className="opt-letter">B</span><div><div className="opt-text">Francophone — BEPC / Baccalauréat</div><div className="opt-sub">Office du Baccalauréat</div></div></button>
              <button className="opt-btn" data-v="sys_both" onClick={e=>{window.pickOpt(e.currentTarget);window.renderStreams('sys_both');}}><span className="opt-letter">C</span><div><div className="opt-text">Both systems (bilingual school)</div></div></button>
            </div>
          </div>
          <div className="q-card" id="stream-card">
            <div className="q-number">Question 14 — Your stream</div>
            <div className="q-text">What stream / series are you in?</div>
            <div className="stream-grid" id="stream-grid"></div>
          </div>
          <div className="q-card" id="subjects-card" style={{display:'none'}}>
            <div className="q-number">Question 15 — Your strongest subjects</div>
            <div className="q-text">Which subjects do you genuinely excel in? <span style={{color:'var(--gray-text)',fontWeight:'400',fontSize:'14px'}}>(Select all that apply)</span></div>
            <div className="subject-grid" id="subject-chips"></div>
            <div className="info-note"><span style={{color:'var(--amber)'}}>ⓘ</span><span>Select subjects where you consistently perform well — not just ones you enjoy.</span></div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 16 — Academic performance</div>
            <div className="q-text">How would you honestly describe your overall academic performance?</div>
            <div className="options" data-q="q16">
              <button className="opt-btn" data-v="perf_excellent" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">Excellent — I regularly top my class or score very highly</div></div></button>
              <button className="opt-btn" data-v="perf_good" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">Good — I perform above average consistently</div></div></button>
              <button className="opt-btn" data-v="perf_average" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">Average — I pass but do not stand out academically</div></div></button>
              <button className="opt-btn" data-v="perf_improving" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">I have struggled but I am working hard and improving</div></div></button>
            </div>
          </div>
          <div className="err-msg" id="err-4">Please answer all questions and select at least one subject.</div>
          <div className="nav-row">
            <button className="btn btn-secondary" onClick={()=>window.goTo(3)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>window.nextStep(4,5,['q13','q16'])}>Continue →</button>
          </div>
        </div>

        {/* STEP 5 */}
        <div className="step" id="step-5">
          <div className="progress-wrap">
            <div className="progress-meta"><span className="progress-label">Stage 5 of 6 — Ambitions & realities</span><span className="progress-frac">5 / 6</span></div>
            <div className="progress-track"><div className="progress-bar" style={{width:'83%'}}></div></div>
          </div>
          <div className="section-eyebrow">Ambitions & real-world context</div>
          <div className="section-title">What does your future look like?</div>
          <div className="section-sub">These questions help us give you realistic, not just idealistic, matches for Cameroon's context.</div>
          <div className="q-card">
            <div className="q-number">Question 17</div>
            <div className="q-text">How many years are you willing to study after secondary school?</div>
            <div className="options" data-q="q17">
              <button className="opt-btn" data-v="study_2" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">1–2 years — I want to enter the workforce quickly</div><div className="opt-sub">BTS, DUT, professional certificates</div></div></button>
              <button className="opt-btn" data-v="study_3" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">3 years — a bachelor's degree or equivalent</div><div className="opt-sub">Licence / BSc</div></div></button>
              <button className="opt-btn" data-v="study_5" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">4–5 years — I am willing to invest in a longer qualification</div><div className="opt-sub">Master's, grandes écoles, engineering</div></div></button>
              <button className="opt-btn" data-v="study_7plus" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">6 years or more — I want the highest professional qualification</div><div className="opt-sub">Medicine, law, doctorate</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 18</div>
            <div className="q-text">Where do you see yourself working in the future?</div>
            <div className="options" data-q="q18">
              <button className="opt-btn" data-v="loc_cameroon" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">In Cameroon — I want to build my career here and serve my country</div></div></button>
              <button className="opt-btn" data-v="loc_africa" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">Across Africa — I see opportunities continent-wide</div></div></button>
              <button className="opt-btn" data-v="loc_global" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">Internationally — I want a global career</div></div></button>
              <button className="opt-btn" data-v="loc_open" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">I am open — wherever the best opportunities are</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 19</div>
            <div className="q-text">Which challenge in Cameroon concerns you most — and that you could see yourself working to solve?</div>
            <div className="options" data-q="q19">
              <button className="opt-btn" data-v="ch_health" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">Healthcare access — too many people die from preventable diseases</div></div></button>
              <button className="opt-btn" data-v="ch_edu" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">Education quality — too many young people lack access to good teaching</div></div></button>
              <button className="opt-btn" data-v="ch_econ" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">Economic development — unemployment and poverty need structural solutions</div></div></button>
              <button className="opt-btn" data-v="ch_infra" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">Infrastructure & technology — we need better roads, energy, and digital systems</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 20</div>
            <div className="q-text">How important is a guaranteed government salary (fonctionnaire position) to you?</div>
            <div className="likert-wrap" id="lk-q20">
              {[1,2,3,4,5].map(n=><button key={n} className="likert-btn" data-q="q20" data-v={String(n)} onClick={e=>window.pickLikert(e.currentTarget)}>{n}</button>)}
            </div>
            <div className="likert-labels"><span>Not important</span><span>Top priority</span></div>
          </div>
          <div className="err-msg" id="err-5">Please answer all questions before continuing.</div>
          <div className="nav-row">
            <button className="btn btn-secondary" onClick={()=>window.goTo(4)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>window.nextStep(5,6,['q17','q18','q19','q20'])}>Continue →</button>
          </div>
        </div>

        {/* STEP 6 */}
        <div className="step" id="step-6">
          <div className="progress-wrap">
            <div className="progress-meta"><span className="progress-label">Stage 6 of 6 — Final scenarios</span><span className="progress-frac">6 / 6</span></div>
            <div className="progress-track"><div className="progress-bar" style={{width:'100%'}}></div></div>
          </div>
          <div className="section-eyebrow">Real-world scenarios</div>
          <div className="section-title">How would you react?</div>
          <div className="section-sub">These final scenarios reveal things about you that standard questions cannot.</div>
          <div className="q-card">
            <div className="q-number">Question 21</div>
            <div className="q-scenario">You are walking through your neighbourhood and find a child sitting alone, crying. They cannot understand what their teacher taught and are afraid of failing.</div>
            <div className="q-text">What is your natural response?</div>
            <div className="options" data-q="q21">
              <button className="opt-btn" data-v="sc1_teach" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">Sit with them and explain the topic in a simpler way — I enjoy teaching</div></div></button>
              <button className="opt-btn" data-v="sc1_system" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">Think about why so many students face this — and what systemic change could fix it</div></div></button>
              <button className="opt-btn" data-v="sc1_comfort" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">Comfort them emotionally first — make sure they feel better before anything else</div></div></button>
              <button className="opt-btn" data-v="sc1_resource" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">Find them a proper tutor or resource — connect them with the right help</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 22</div>
            <div className="q-scenario">There is a shortage of nurses at a rural health centre. Three patients need attention at once: one is in severe pain, one needs urgent test results explained, one needs an IV inserted.</div>
            <div className="q-text">What does this scenario make you feel?</div>
            <div className="options" data-q="q22">
              <button className="opt-btn" data-v="sc2_energised" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">Energised — this is exactly the kind of challenge I would want to rise to</div></div></button>
              <button className="opt-btn" data-v="sc2_important" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">This kind of work feels deeply important to me, even if stressful</div></div></button>
              <button className="opt-btn" data-v="sc2_system" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">I would rather fix the system that causes this shortage than be in that room</div></div></button>
              <button className="opt-btn" data-v="sc2_notme" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">This does not appeal to me — I am better suited to a different kind of work</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 23</div>
            <div className="q-scenario">Your town's market has poor waste management causing flooding every rainy season. You have been asked to propose a solution to the local council.</div>
            <div className="q-text">What kind of solution would you naturally propose?</div>
            <div className="options" data-q="q23">
              <button className="opt-btn" data-v="sc3_tech" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">A drainage and engineering infrastructure plan — solve it with physical design</div></div></button>
              <button className="opt-btn" data-v="sc3_policy" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">A policy and enforcement framework — change the rules and hold people accountable</div></div></button>
              <button className="opt-btn" data-v="sc3_community" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">A community education programme — change minds and habits</div></div></button>
              <button className="opt-btn" data-v="sc3_business" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">A waste-to-revenue business model — make clean-up financially sustainable</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 24</div>
            <div className="q-text">You get a surprise free week with no obligations. How do you naturally spend it?</div>
            <div className="options" data-q="q24">
              <button className="opt-btn" data-v="free_create" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">A</span><div><div className="opt-text">Working on a creative project — writing, music, design, or building something</div></div></button>
              <button className="opt-btn" data-v="free_learn" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">B</span><div><div className="opt-text">Diving deep into a subject I have always been curious about</div></div></button>
              <button className="opt-btn" data-v="free_social" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">C</span><div><div className="opt-text">Organising activities and spending quality time with people</div></div></button>
              <button className="opt-btn" data-v="free_plan" onClick={e=>window.pickOpt(e.currentTarget)}><span className="opt-letter">D</span><div><div className="opt-text">Planning and strategising — setting goals for the future</div></div></button>
            </div>
          </div>
          <div className="q-card">
            <div className="q-number">Question 25 — Open reflection</div>
            <div className="q-text">If money, difficulty, and social pressure were not factors — what would you most want to do with your life?</div>
            <textarea id="q25-text" placeholder="Write freely — this is the most important question. There are no wrong answers." style={{width:'100%',minHeight:'90px',borderRadius:'8px',border:'1.5px solid var(--gray-light)',padding:'12px 14px',fontFamily:'inherit',fontSize:'14px',color:'var(--navy)',background:'var(--cream)',resize:'vertical',lineHeight:'1.6'}} onChange={e=>{window._answers=window._answers||{};window._answers['q25']=e.target.value;}}></textarea>
          </div>
          <div className="err-msg" id="err-6">Please answer all questions before submitting.</div>
          <div className="nav-row">
            <button className="btn btn-secondary" onClick={()=>window.goTo(5)}>← Back</button>
            <button className="btn btn-primary" style={{background:'var(--amber)',color:'var(--navy)',borderColor:'var(--amber)',fontWeight:'700'}} onClick={()=>window.submitAssessment()}>Get my results →</button>
          </div>
        </div>

        {/* STEP 7 — LOADING */}
        <div className="step" id="step-7">
          <div className="loading-wrap">
            <div className="loader-ring"></div>
            <div className="loading-title">Analysing your profile…</div>
            <div className="loading-sub">Our AI is mapping you to Cameroon's career landscape</div>
            <div style={{marginTop:'24px'}}>
              {['Reading your personality profile','Mapping your Holland RIASEC codes','Aligning your values and motivations','Cross-referencing Cameroon\'s concours system','Calculating compatibility scores','Preparing your personalised report'].map((s,i)=>
                <div key={i} className="load-stage" id={`ls-${i}`}><span className="load-dot"></span>{s}</div>
              )}
            </div>
          </div>
        </div>

        {/* STEP 8 — RESULTS */}
        <div className="step" id="step-8">
          <div className="result-hero">
            <div className="eyebrow">Your career match report</div>
            <h2 id="result-headline">Your results are ready</h2>
            <p id="result-summary"></p>
            <div className="profile-badges" id="profile-badges"></div>
          </div>
          <div className="careers-label">Your matches — ranked by compatibility</div>
          <div id="career-cards"></div>
          <div className="result-footer">
            <p>These results are based on your full psychological and academic profile.<br/>Discuss them with a Skyline Academy counsellor to plan your next steps.</p>
            <div className="footer-btns">
              <button className="btn btn-secondary" onClick={()=>window.restart()}>↩ Retake assessment</button>
              <a href="/concours" className="btn-outline-navy">📋 Explore Concours Guide</a>
              <button className="btn-amber" onClick={()=>window.print()}>Print / Save results</button>
            </div>
          </div>
        </div>

      </div>

      <script dangerouslySetInnerHTML={{__html:`
        window._answers = {};
        window._selectedSubjects = [];
        window._selectedStream = null;

        const STREAMS = {
          sys_gce: [
            {id:'gce_science',label:'Science',badge:'GCE S',subs:'Biology, Chemistry, Physics, Maths, Further Maths',subjects:['Biology','Chemistry','Physics','Mathematics','Further Mathematics','Computer Science','Technical Drawing','Agricultural Science']},
            {id:'gce_arts',label:'Arts',badge:'GCE A',subs:'Literature, History, Geography, Religious Studies, French',subjects:['Literature in English','History','Geography','Religious Studies','French','Government','Logic & Philosophy','Economics']},
            {id:'gce_tech',label:'Technical',badge:'GCE T',subs:'Technical Drawing, Workshop, Building, Electrical',subjects:['Technical Drawing','Workshop Technology','Building Construction','Electrical Installation','Home Economics','Computer Science','Mathematics','Physics']},
            {id:'gce_comm',label:'Commercial',badge:'GCE C',subs:'Accounts, Commerce, Economics, Business Maths, Law',subjects:['Principles of Accounts','Commerce','Business Mathematics','Economics','Commercial Law','Office Practice','French','English Language']}
          ],
          sys_bac: [
            {id:'bac_c',label:'Série C',badge:'BAC C',subs:'Maths, Physique-Chimie, Sciences',subjects:['Mathématiques','Physique-Chimie','SVT','Informatique','Philosophie','Français']},
            {id:'bac_d',label:'Série D',badge:'BAC D',subs:'SVT, Chimie, Maths, Physique',subjects:['SVT','Chimie','Mathématiques','Physique','Géographie','Français']},
            {id:'bac_a',label:'Série A',badge:'BAC A',subs:'Littérature, Philosophie, Histoire, Langues',subjects:['Philosophie','Histoire-Géographie','Littérature française','Langues vivantes','Latin','Sciences économiques']},
            {id:'bac_g',label:'Série G',badge:'BAC G',subs:'Comptabilité, Économie, Gestion, Commerce',subjects:['Comptabilité','Économie générale','Droit','Informatique de gestion','Commerce','Mathématiques']},
            {id:'bac_f',label:'Série F (Technique)',badge:'BAC F',subs:'Génie civil, Électronique, Mécanique',subjects:['Dessin technique','Construction mécanique','Électronique','Génie civil','Mathématiques techniques','Sciences physiques']}
          ],
          sys_both: [
            {id:'both_sci',label:'Science / Série C or D',badge:'SCI',subs:'Biology/SVT, Chemistry/Chimie, Physics, Maths',subjects:['Biology/SVT','Chemistry/Chimie','Physics/Physique','Mathematics','Further Maths','Computer Science']},
            {id:'both_arts',label:'Arts / Série A',badge:'ARTS',subs:'Literature, History, Philosophy, Languages',subjects:['Literature in English','Histoire-Géographie','Philosophie','French','Religious Studies','Economics']},
            {id:'both_comm',label:'Commercial / Série G',badge:'COMM',subs:'Accounts/Comptabilité, Commerce, Economics',subjects:['Principles of Accounts','Comptabilité','Commerce','Economics','Business Maths','Droit']},
            {id:'both_tech',label:'Technical / Série F',badge:'TECH',subs:'Technical Drawing, Workshop, Construction',subjects:['Technical Drawing','Workshop Technology','Electrical Installation','Building Construction','Mathematics','Physics']}
          ]
        };

        window.goTo = function(n) {
          document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
          document.getElementById('step-'+n).classList.add('active');
          window.scrollTo({top:0,behavior:'smooth'});
        };

        window.pickOpt = function(btn) {
          const container = btn.closest('[data-q]');
          if (!container) return;
          const q = container.dataset.q;
          container.querySelectorAll('.opt-btn').forEach(b=>b.classList.remove('selected'));
          btn.classList.add('selected');
          window._answers[q] = btn.dataset.v;
        };

        window.pickLikert = function(btn) {
          const q = btn.dataset.q;
          document.querySelectorAll('.likert-btn[data-q="'+q+'"]').forEach(b=>b.classList.remove('selected'));
          btn.classList.add('selected');
          window._answers[q] = btn.dataset.v;
        };

        window.renderStreams = function(sys) {
          const grid = document.getElementById('stream-grid');
          grid.innerHTML = '';
          window._selectedStream = null;
          window._selectedSubjects = [];
          document.getElementById('subjects-card').style.display = 'none';
          (STREAMS[sys]||[]).forEach(st=>{
            const btn = document.createElement('button');
            btn.className = 'stream-card';
            btn.innerHTML = '<span class="stream-badge">'+st.badge+'</span><div class="stream-title">'+st.label+'</div><div class="stream-subs">'+st.subs+'</div>';
            btn.onclick = ()=>{
              document.querySelectorAll('.stream-card').forEach(b=>b.classList.remove('selected'));
              btn.classList.add('selected');
              window._selectedStream = st.label;
              window._answers['stream'] = st.id;
              window.renderSubjects(st.subjects);
            };
            grid.appendChild(btn);
          });
        };

        window.renderSubjects = function(subs) {
          const card = document.getElementById('subjects-card');
          const grid = document.getElementById('subject-chips');
          card.style.display = 'block';
          grid.innerHTML = '';
          window._selectedSubjects = [];
          subs.forEach(s=>{
            const btn = document.createElement('button');
            btn.className = 'subject-chip';
            btn.textContent = s;
            btn.onclick = ()=>{
              if (btn.classList.contains('selected')) {
                btn.classList.remove('selected');
                window._selectedSubjects = window._selectedSubjects.filter(x=>x!==s);
              } else {
                btn.classList.add('selected');
                window._selectedSubjects.push(s);
              }
              window._answers['subjects'] = window._selectedSubjects.join(', ');
            };
            grid.appendChild(btn);
          });
        };

        window.nextStep = function(from, to, qs) {
          const errEl = document.getElementById('err-'+from);
          if (from === 4) {
            if (!window._answers['q13'] || !window._selectedStream || window._selectedSubjects.length===0 || !window._answers['q16']) {
              errEl.style.display='block'; return;
            }
          } else if (qs.some(q=>!window._answers[q])) {
            errEl.style.display='block'; return;
          }
          errEl.style.display='none';
          window.goTo(to);
        };

        window.submitAssessment = function() {
          const q25 = document.getElementById('q25-text').value.trim();
          window._answers['q25'] = q25;
          const required = ['q21','q22','q23','q24'];
          if (required.some(q=>!window._answers[q]) || !q25) {
            document.getElementById('err-6').style.display='block'; return;
          }
          document.getElementById('err-6').style.display='none';
          window.goTo(7);
          window.animateLoadStages();
          window.callAPI();
        };

        window.animateLoadStages = function() {
          let i=0;
          const iv = setInterval(()=>{
            if(i>0){const prev=document.getElementById('ls-'+(i-1));if(prev){prev.classList.remove('active');prev.classList.add('done');}}
            const cur=document.getElementById('ls-'+i);
            if(cur){cur.classList.add('active');}
            i++;
            if(i>5)clearInterval(iv);
          },1800);
        };

        window.callAPI = async function() {
          try {
            const res = await fetch('/api/match',{
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify({type:'match', profile:window._answers})
            });
            if(!res.ok) throw new Error('Server error '+res.status);
            const data = await res.json();
            if(data.error) throw new Error(data.error);
            window.renderResults(data);
          } catch(e) {
            document.querySelector('#step-7 .loading-wrap').innerHTML =
              '<div style="background:var(--red-light);border:1px solid #f5c6c4;color:var(--red);padding:20px;border-radius:12px;text-align:center"><strong>Something went wrong.</strong><br/>'+(e.message||'Please try again.')+'<br/><br/><button class="btn btn-secondary" onclick="window.goTo(6)" style="margin:0 auto;display:block">← Go back and retry</button></div>';
          }
        };

        window.renderResults = function(data) {
          document.getElementById('result-headline').textContent = data.headline||'Your career matches are ready';
          document.getElementById('result-summary').textContent = data.summary||'';
          const badges = document.getElementById('profile-badges');
          badges.innerHTML='';
          (data.profile_tags||[]).forEach(tag=>{
            const b=document.createElement('span');
            b.className='profile-badge';
            b.textContent=tag;
            badges.appendChild(b);
          });
          const container = document.getElementById('career-cards');
          container.innerHTML='';
          const sorted=(data.careers||[]).sort((a,b)=>b.score-a.score);
          sorted.forEach((c,i)=>{
            const isTop=i===0;
            const sc=c.score>=75?'high':c.score>=55?'mid':'';
            const bc=c.score>=75?'bar-green':c.score>=55?'bar-amber':'bar-navy';
            const cd=c.concours_detail||{};
            const gp=c.global_perspective||'';
            const card=document.createElement('div');
            card.className='career-card'+(isTop?' top-match':'');

            // Concours detail grid
            const cdItems=[
              ['Exam format',cd.exam_format],
              ['Places',cd.places],
              ['Centres',cd.centres],
              ['Fee',cd.fee],
              ['Age limit',cd.age_limit],
              ['Deadline',cd.deadline],
              ['Key subjects',(cd.key_subjects||[]).join(', ')],
              ['Eligibility note',cd.eligibility_note]
            ].filter(([,v])=>v);

            const cdHTML = cdItems.length ? \`
              <div class="concours-detail-box">
                <div class="concours-detail-title">📋 Concours at a glance</div>
                <div class="concours-detail-grid">
                  \${cdItems.map(([l,v])=>\`<div class="cd-item"><div class="cd-label">\${l}</div><div class="cd-value">\${v}</div></div>\`).join('')}
                </div>
              </div>\` : '';

            const gpHTML = gp ? \`<div class="global-pill">🌍 <strong>Globally:</strong> \${gp}</div>\` : '';

            card.innerHTML=
              (isTop?'<div class="top-badge-pill">★ Best match</div>':'')+
              '<div class="card-top"><div>'+
              '<div class="career-title">'+c.title+'</div>'+
              '<div class="career-field">'+c.field+(c.civil_service?' · Fonctionnaire track':'')+' · '+c.duration+'</div>'+
              '</div><div class="score-circle '+sc+'"><div class="score-num" id="sn-'+i+'">0</div><div class="score-pct">match</div></div></div>'+
              '<div class="bar-wrap"><div class="bar-label"><span>Overall compatibility</span><span>'+c.score+'%</span></div><div class="bar-track"><div class="bar-fill '+bc+'" id="bf-'+i+'" style="width:0%"></div></div></div>'+
              '<div class="dim-bars">'+
              '<div class="dim-bar-item"><div class="dim-bar-label">Personality</div><div class="dim-bar-track"><div class="dim-bar-fill" id="dp-'+i+'" data-w="'+(c.score_breakdown?.personality_fit||0)+'%"></div></div></div>'+
              '<div class="dim-bar-item"><div class="dim-bar-label">Values</div><div class="dim-bar-track"><div class="dim-bar-fill" id="dv-'+i+'" data-w="'+(c.score_breakdown?.values_alignment||0)+'%"></div></div></div>'+
              '<div class="dim-bar-item"><div class="dim-bar-label">Academic fit</div><div class="dim-bar-track"><div class="dim-bar-fill" id="da-'+i+'" data-w="'+(c.score_breakdown?.academic_match||0)+'%"></div></div></div>'+
              '</div>'+
              '<div class="card-why" style="margin-top:14px">'+c.why+'</div>'+
              '<div class="concours-label" style="margin-top:8px">How to enter in Cameroon</div>'+
              '<div class="concours-chips">'+(c.concours||[]).map(x=>'<span class="concours-chip">'+x+'</span>').join('')+'</div>'+
              cdHTML+
              gpHTML;
            container.appendChild(card);
          });
          window.goTo(8);
          setTimeout(()=>{
            sorted.forEach((c,i)=>{
              setTimeout(()=>{
                const card=container.children[i];
                if(card)card.classList.add('visible');
                window.animNum('sn-'+i,0,c.score,900);
                const bf=document.getElementById('bf-'+i);if(bf)bf.style.width=c.score+'%';
                ['dp','dv','da'].forEach(pre=>{const el=document.getElementById(pre+'-'+i);if(el)el.style.width=el.dataset.w;});
              },i*180);
            });
          },200);
        };

        window.animNum = function(id,from,to,dur) {
          const el=document.getElementById(id);if(!el)return;
          const start=performance.now();
          const tick=now=>{const t=Math.min((now-start)/dur,1);el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-t,3)));if(t<1)requestAnimationFrame(tick);};
          requestAnimationFrame(tick);
        };

        window.restart = function() {
          window._answers={};window._selectedSubjects=[];window._selectedStream=null;
          document.querySelectorAll('.opt-btn,.stream-card,.subject-chip,.likert-btn').forEach(b=>b.classList.remove('selected'));
          document.querySelectorAll('.err-msg').forEach(e=>e.style.display='none');
          const ta=document.getElementById('q25-text');if(ta)ta.value='';
          document.getElementById('subjects-card').style.display='none';
          document.getElementById('stream-grid').innerHTML='';
          window.goTo(0);
        };
      `}} />
    </>
  );
}
