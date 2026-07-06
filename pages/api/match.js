export const config = { maxDuration: 60 };

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// SAFE JSON PARSER — 5 fallback strategies
// ─────────────────────────────────────────────────────────────────────────────
function safeParseJSON(text) {
  if (!text) throw new Error('Empty response from AI');

  // 1. Direct
  try { return JSON.parse(text); } catch (_) {}

  // 2. Strip markdown fences
  try {
    const s = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(s);
  } catch (_) {}

  // 3. Extract outermost { }
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(text.slice(start, end + 1));
  } catch (_) {}

  // 4. Remove control characters then try
  try {
    let clean = '';
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c === 9 || c === 10 || c === 13 || c >= 32) clean += text[i];
    }
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(clean.slice(start, end + 1));
  } catch (_) {}

  // 5. Fix trailing commas
  try {
    let s = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    s = s.replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(s);
  } catch (e) {
    throw new Error('JSON parse failed after 5 attempts. Error: ' + e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE KNOWLEDGE UPDATES
// ─────────────────────────────────────────────────────────────────────────────
async function getLiveKnowledgeUpdates() {
  try {
    if (!process.env.KV_REST_API_URL) return '';
    const { kv } = await import('@vercel/kv');
    const raw = await kv.lrange('skyline:knowledge_updates', 0, 49);
    if (!raw || !raw.length) return '';
    const updates = raw.map(r => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
    if (!updates.length) return '';
    return '\n\n=== LIVE ADMIN UPDATES ===\n' +
      updates.map(u => `[${u.category}] ${u.title}: ${u.content}`).join('\n') +
      '\n=== END UPDATES ===';
  } catch { return ''; }
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE
// ─────────────────────────────────────────────────────────────────────────────
const KB = `
CAMEROON COMPETITIVE ENTRANCE EXAMINATIONS

ENGINEERING
ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde): Sciences and Technologies track (400 places) tests 2x Maths papers + 2x Physics papers each 3 hours equal weight. Digital Arts track (30 places) tests Maths, Computer Science, General Arts. Online registration at polytechnique.cm/concours. Centres: all 10 regional capitals. Eligibility: Bac C/D/E/F or GCE A/L with Further Maths and Physics. No age limit published. Leads to Ingenieur de Conception diploma (5-year equivalent). Considered the most competitive engineering school in Cameroon.

FET (Faculty of Engineering and Technology, University of Buea): Written exam only. Mathematics coefficient 3 (3 hours) + Physics coefficient 3 (3 hours). 470 places. BEng (BAC+4) and MEng (BAC+5). Centres: Buea, Bamenda, Douala, Yaounde. Registration: ubuea.cm. Fee: 20000 FCFA. Eligibility: GCE A/L minimum 2 subjects including Maths and Physics, or Bac C/D/E/F. Nature: intellectually and scientifically oriented engineering. More competitive than COT for general science students. FET promotes scientific thinking and theory.

COT (College of Technology, University of Buea): Mathematics coefficient 4 (3 hours) + Physics coefficient 4 (3 hours) + English coefficient 1 (1 hour). Written exam = 60%, academic file = 40% (school grades matter). 230 places across Computer Engineering, Electrical and Electronic Engineering, Mechanical Engineering, Mechatronics. Centres: Buea, Bamenda, Douala, Yaounde. Fee: 20000 FCFA. Eligibility: GCE O/L in 5 subjects including English, Maths, Physics plus GCE A/L minimum 2 including Maths and Physics, or Bac C/D/E/F1/F2/F3, or GCE Technical. Nature: practically oriented. Technical and vocational students have a natural advantage. Awards Bachelor of Technology (B.Tech) in 3 years.

ENSPD (Ecole Nationale Superieure Polytechnique de Douala): Engineering sciences. Similar format to ENSPY. Located in Douala. Covers Telecom/ICT, Industrial Safety, Process Engineering, Civil Engineering, Chemical Engineering.

FASA Dschang (Faculty of Agronomy and Agricultural Sciences, University of Dschang): Written exam: Biology + Mathematics + Chemistry + General Knowledge (4 subjects). 330 public places at Dschang plus Bafia campuses. Plus 1200 places through affiliated IPES institutes. Centres: Bafia, Bamenda, Douala, Dschang, Maroua, Ngaoundere, Yaounde. Eligibility: Bac A/C/D/Agricultural or GCE A/L minimum 2 science subjects. Significantly more demanding than FAVM because tests 4 subjects. Leads to Ingenieur Agronome.

FAVM Buea (Faculty of Agriculture and Veterinary Medicine, University of Buea): Written exam: Biology (3 hours) + Chemistry (3 hours). Written = 60%, file = 40%. 300 places across 9 programmes including Veterinary Medicine (40), Crop Production (40), Animal Science (30), Agricultural Economics (40), Forestry and Wildlife (30), Food Science (30), Fisheries (30), Plant Health (30), Soil Science (30). Centres: Buea, Bamenda, Douala, Yaounde. Fee: 20000 FCFA. More accessible than FASA Dschang.

ESMV Ngaoundere (School of Veterinary Medicine and Sciences, University of Ngaoundere): Two tracks: Veterinary Doctors (100 places) and Animal Production Engineers (100 places). Written exam: Biology coefficient 4 (2 hours) + Physics/Chemistry coefficient 3 (2 hours) + Mathematics coefficient 3 (2 hours) + General Knowledge coefficient 2 (2 hours). Score below 4/20 in any paper means elimination. Age limit: maximum 26 years as of 31 December of exam year. Centres: Ngaoundere, Buea, Dschang, Maroua, Yaounde. Fee: 20000 FCFA.

HEALTH SCIENCES
ENAFM (Examen National d Aptitude a la Formation Medicale): Single national exam for General Medicine, Pharmacy, and Dentistry at all accredited institutions nationwide. Same paper, same day, same time across all 10 regions simultaneously. Institutions covered: FMSB Yaounde I, FMSP Dschang, FMSP Douala, FHS Buea Medicine track, FMSB Garoua, UdM Bagangte. Students choose ONE institution and ONE track at registration. Writing centre and institution choice are independent - a student can write in Buea while competing for a seat at FMSB Yaounde.

ENAFM Paper 1 (3 hours): 100 MCQs total. Biology: 50 questions. Chemistry: 25 questions. Physics: 25 questions.
ENAFM Paper 2 (1.5 hours, after 2-hour break): 50 MCQs total. General Knowledge: 35 questions (scientific knowledge plus civic and political knowledge of Cameroon). French: 15 questions.

ENAFM coefficients: For Medicine and Dentistry, Biology has highest coefficient, Chemistry and Physics are equal. For Pharmacy, Chemistry has highest coefficient, Biology and Physics are equal.

ENAFM registration requires: region of origin, Biology and Chemistry grades from Bac/GCE, choice of writing centre, choice of institution.

ENAFM eligibility: Bac C or D (Francophone) or GCE A/L with Biology and Chemistry mandatory (Anglophone). GCE O/L must include Biology, Chemistry, and Physics or Maths in same session. Age limit: maximum 23 years old as of 1 January of exam year. Fee: 20000 FCFA.

Medical pathway after ENAFM: Years 1-3 preclinical (anatomy, physiology, biochemistry, pharmacology). Years 4-6 clinical (hospital rotations, patient contact, applied medicine). End of Year 6: Examen National de Synthese Clinique et Therapeutique. Year 7: final year, thesis, graduation as Docteur en Medecine (General Practitioner). After graduation: competitive specialization available in Gynaecology, Surgery, Cardiology, Dermatology, Nephrology, Paediatrics, Ophthalmology, Psychiatry and others. Some Cameroonian doctors go to France, UK, or US to specialize then return to practice.

FHS Buea (Faculty of Health Sciences, University of Buea) - INTERNAL EXAM, NOT ENAFM: Programmes with 60 places each: Nursing, Medical Laboratory Sciences (MLS), Biomedical Sciences (BMS), Midwifery, Public Health. Written section: 100 MCQs total. Biology: 40 questions. Chemistry: 20 questions. Physics: 20 questions. English: 20 questions. Oral section: approximately 5 minutes before a jury of lecturers, doctors, and professors. Both done same day with approximately 3-hour break between written and oral. Eligibility: GCE A/L minimum 2 subjects including Biology AND Chemistry, GCE O/L minimum 5 subjects including English and Mathematics, or Bac C or D. Fee: 20000 FCFA. Single centre: FHS campus Buea. BMS has Biology coefficient 4, Chemistry coefficient 3, Physics coefficient 3, no Mathematics required.

FHS Bamenda: Nursing, Midwifery, MLS. Written: Biology coefficient 4 + Chemistry coefficient 2 + Physics coefficient 2 (3 hours total). Oral examination required. Single centre: University of Bamenda FHS campus, Mile 3 Nkwen. Age limit: maximum 28 years as of 1 January of exam year.

ADMINISTRATION
ENAM (Ecole Nationale d Administration et de Magistrature): 4 divisions: Administrative (Cycle A requires Licence, Cycle B requires BAC+2), Judiciary (15 Auditeurs de Justice requires Master in Law, 15 Greffiers Cycle B), Financial (Customs, Tax, Treasury), Social Affairs (10 places). Registration: concours.enam.cm. Exams August-September 2026.

EMIA (Ecole Militaire Interarmees): Age 18-23 years, must be single with no dependants. Eligibility: GCE A/L in 3 subjects excluding Religious Knowledge plus 1 successful year of higher education, or Bac all series plus 1 year higher education. Fee: 20000 FCFA. Single centre: Yaounde. Exam in January typically.

ENIEG/GTTC (Primary Teacher Training Colleges): 7000 places nationwide. Exam 30 July 2026, all regional capitals. Eligibility: Bac all series or GCE A/L equivalent, age 17-32 years as of 1 January 2026. Training 2 years. Leads to primary school teaching post.

GLOBAL QUALIFICATIONS
GCE A/L from Cameroon is directly recognized by UK universities, equivalent to UK GCE A Levels. Can apply via UCAS. US universities evaluate through WES.

Cameroon degrees follow LMD system aligned with Bologna Process. Licence (3 years) comparable to UK Bachelor. Master (5 years post-Bac) comparable to UK Master.

Medical degree (7 years): To practice in UK, pass PLAB (2 parts) then register with GMC. To practice in US, pass USMLE Steps 1, 2, 3 plus ECFMG certification then complete US residency. To practice in France, pass EVC equivalence exams plus supervised practice. This is true for ALL countries - not specific to Cameroon.

Engineering degrees: Cameroon is not a Washington Accord signatory so degrees are not automatically recognized for professional registration in UK/US/Nigeria. However widely accepted for Masters and PhD admission internationally. Many ENSPY graduates pursue MSc in France, Canada, US.

Bilingual advantage: Cameroonian graduates (French and English) can pursue both Francophone African pathways (France, Belgium, CEMAC) and Anglophone pathways (UK, Nigeria, Ghana). This is a genuine and rare advantage.
`;

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, profile, concours, field } = req.body;
  const liveUpdates = await getLiveKnowledgeUpdates();

  // ── CAREER MATCH ──────────────────────────────────────────────────────────
  if (type === 'match' || !type) {
    if (!profile) return res.status(400).json({ error: 'No profile provided' });

    const prompt = `You are Skylar, Skyline Academy AI mentor. You are warm, deeply perceptive, and speak like the brilliant older sister who genuinely understands what it costs to navigate the Cameroonian educational system. You combine Holland RIASEC psychology expertise with encyclopaedic knowledge of Cameroon entrance examinations.

${KB}${liveUpdates}

Student profile from 25-question assessment:
${JSON.stringify(profile, null, 2)}

ANSWER CODES: RIASEC R=Realistic I=Investigative A=Artistic S=Social E=Enterprising C=Conventional. q8/q12/q20 are Likert 1-5. q25 is open dream text.

Return ONLY a JSON object. Start your response with { and end with }. No other text. No markdown. No explanation before or after.

Use only ASCII characters in all string values. Write "it is" not contractions. Write "Cameroon" not possessives. Keep each string value on one line only.

{
  "headline": "8-10 word headline personalised to this student",
  "summary": "Two sentences about their unique profile and honest challenges",
  "riasec_primary": "one letter R or I or A or S or E or C",
  "riasec_secondary": "one letter R or I or A or S or E or C",
  "profile_tags": ["tag1","tag2","tag3"],
  "careers": [
    {
      "title": "specific career title",
      "field": "Health Sciences",
      "score": 88,
      "score_breakdown": {"personality_fit": 90, "values_alignment": 85, "academic_match": 88},
      "why": "Three sentences referencing the student actual answers",
      "entry_path": "exact concours name",
      "duration": "e.g. 7 years at FMSB Yaounde",
      "concours": ["Concours name"],
      "concours_detail": {
        "exam_format": "e.g. 100 MCQs: Biology 50, Chemistry 25, Physics 25",
        "key_subjects": ["Biology","Chemistry"],
        "places": "60 places",
        "centres": "Buea, Yaounde, Douala",
        "fee": "20000 FCFA",
        "deadline": "July to August",
        "age_limit": "Maximum 23 years",
        "eligibility_note": "GCE A/L Biology and Chemistry mandatory"
      },
      "global_perspective": "Two sentences on international recognition and doors opened abroad",
      "civil_service": true
    }
  ]
}

Return exactly 7 careers across at least 4 different fields. Scores range from 30 to 92. Top match 82-92. Use only verified data from the knowledge base above.`;

    try {
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });
      return res.status(200).json(safeParseJSON(msg.content[0].text));
    } catch (err) {
      console.error('MATCH ERROR:', err.message);
      return res.status(500).json({ error: 'Match failed: ' + err.message });
    }
  }

  // ── CONCOURS GUIDE ────────────────────────────────────────────────────────
  if (type === 'concours') {
    if (!concours) return res.status(400).json({ error: 'No concours specified' });

    const prompt = `You are Skylar, Skyline Academy AI mentor. Warm, precise, honest. You know every competitive entrance examination in Cameroon in detail.

${KB}${liveUpdates}

Student wants a complete guide to: ${concours}

Return ONLY a JSON object. Start with { and end with }. No other text whatsoever. No markdown fences. No explanation.

Use only ASCII characters in string values. No apostrophes or contractions. Keep each string on one line only.

{
  "name": "full official name",
  "short_name": "abbreviation",
  "institution": "institution name",
  "location": "city",
  "field": "field of study",
  "overview": "Two to three sentences about this programme and why it matters",
  "exam_format": {
    "papers": [
      {"subject": "Biology", "duration": "3 hours", "coefficient": 4, "questions": "50 MCQs", "note": "highest weight subject"}
    ],
    "total_duration": "4.5 hours total",
    "structure_note": "Important structural detail about this exam"
  },
  "places": "number of places available",
  "centres": ["city1","city2","city3"],
  "eligibility": {
    "diplomas": ["GCE A/L","Bac C or D"],
    "subjects_required": ["Biology","Chemistry"],
    "age_limit": "Maximum 23 years or none",
    "other": "Any other key requirement"
  },
  "registration": {
    "method": "Online via ubuea.cm",
    "website": "ubuea.cm",
    "fee": "20000 FCFA",
    "deadline": "July to August",
    "documents": ["GCE A/L certificate","Birth certificate","National ID","Passport photos","Proof of payment"]
  },
  "difficulty": {
    "level": "Competitive",
    "acceptance_rate_estimate": "25 to 35 percent",
    "hardest_paper": "Biology",
    "honest_assessment": "Two sentences of honest direct advice about competition level"
  },
  "preparation": {
    "timeline": "4 to 6 months",
    "key_topics": ["topic1","topic2","topic3"],
    "common_mistakes": ["mistake1","mistake2"],
    "study_strategy": "Three to four sentences of specific actionable preparation advice",
    "past_questions": "Available through Skyline Academy and University prep networks"
  },
  "career_outcomes": {
    "degree_awarded": "BSc Nursing",
    "duration": "3 years",
    "career_paths": ["path1","path2","path3"],
    "civil_service": true,
    "salary_range_cameroon": "80000 to 200000 FCFA per month entry level"
  },
  "global_perspective": {
    "comparable_to": "UK BSc equivalent",
    "international_recognition": "Honest assessment of recognition abroad",
    "study_abroad_pathway": "How graduates can pursue further studies abroad",
    "work_abroad_pathway": "What a graduate needs to do to work in this field abroad",
    "cameroon_vs_abroad": "Two sentences comparing career in Cameroon vs internationally"
  },
  "insider_tips": ["tip1","tip2","tip3"]
}`;

    try {
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }]
      });
      return res.status(200).json(safeParseJSON(msg.content[0].text));
    } catch (err) {
      console.error('CONCOURS ERROR:', err.message);
      return res.status(500).json({ error: 'Concours guide failed: ' + err.message });
    }
  }

  // ── GLOBAL PERSPECTIVE ────────────────────────────────────────────────────
  if (type === 'global') {
    if (!field) return res.status(400).json({ error: 'No field specified' });

    const prompt = `You are Skylar, Skyline Academy AI mentor. You speak with excitement and honesty about global career pathways for Cameroonian students.

${KB}${liveUpdates}

Student wants to understand the global landscape for this field: ${field}

Return ONLY a JSON object. Start with { and end with }. No other text. No markdown. No explanation before or after.

Use only ASCII characters in string values. No apostrophes or contractions. Keep each string on one line only.

{
  "field": "${field}",
  "cameroon_overview": "Two to three sentences about this field in Cameroon",
  "cameroon_strengths": ["strength1","strength2","strength3"],
  "cameroon_challenges": ["challenge1","challenge2"],
  "comparison": [
    {"country": "Nigeria", "system": "Their training system", "similarities": "How similar to Cameroon", "differences": "Key differences", "mutual_recognition": "Can Cameroonian work there"},
    {"country": "Ghana", "system": "Their training system", "similarities": "How similar to Cameroon", "differences": "Key differences", "mutual_recognition": "Can Cameroonian work there"},
    {"country": "France", "system": "Their training system", "similarities": "How similar to Cameroon", "differences": "Key differences", "mutual_recognition": "Can Cameroonian work there"},
    {"country": "United Kingdom", "system": "Their training system", "similarities": "How similar to Cameroon", "differences": "Key differences", "mutual_recognition": "Can Cameroonian work there"},
    {"country": "United States", "system": "Their training system", "similarities": "How similar to Cameroon", "differences": "Key differences", "mutual_recognition": "Can Cameroonian work there"}
  ],
  "qualification_journey": {
    "to_study_in_france": "Steps to study in France after Cameroon degree",
    "to_study_in_uk": "Steps to study in UK after Cameroon degree",
    "to_study_in_us": "Steps to study in US after Cameroon degree",
    "to_work_in_france": "Steps to work professionally in France",
    "to_work_in_uk": "Steps to work professionally in UK",
    "to_work_in_us": "Steps to work professionally in US"
  },
  "reality_check": "Three to four sentences of honest direct advice about real opportunities and challenges",
  "opportunity_hotspots": ["country or region 1","country or region 2","country or region 3"],
  "cameroonian_advantage": "One to two sentences about the unique bilingual advantage"
}`;

    try {
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }]
      });
      return res.status(200).json(safeParseJSON(msg.content[0].text));
    } catch (err) {
      console.error('GLOBAL ERROR:', err.message);
      return res.status(500).json({ error: 'Global perspective failed: ' + err.message });
    }
  }

  // ── ANALYTICS ─────────────────────────────────────────────────────────────
  if (type === 'analytics') {
    console.log('[ANALYTICS]', JSON.stringify({ timestamp: new Date().toISOString(), event: req.body.event, data: req.body.data }));
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Invalid request type' });
}
