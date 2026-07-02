export const config = { maxDuration: 60 };

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Safely parse AI JSON response ────────────────────────────────────────────
// The AI sometimes returns apostrophes/special chars that break JSON.parse()
// This function tries multiple strategies to extract valid JSON.
function safeParseJSON(text) {
  if (!text || typeof text !== 'string') throw new Error('Empty response from AI');

  // Strategy 1: direct parse
  try { return JSON.parse(text); } catch (_) {}

  // Strategy 2: strip markdown fences
  try {
    const s = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(s);
  } catch (_) {}

  // Strategy 3: extract first complete {...} block
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
  } catch (_) {}

  // Strategy 4: sanitize then extract
  try {
    // Remove actual control characters (not escaped ones)
    let sanitized = '';
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      // Keep printable chars, newlines, tabs
      if (code >= 32 || code === 9 || code === 10 || code === 13) {
        sanitized += text[i];
      }
    }
    const m = sanitized.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
  } catch (_) {}

  // Strategy 5: aggressive cleanup - fix unescaped apostrophes inside strings
  try {
    // This regex finds unescaped single quotes inside JSON strings and escapes them
    // Only run this as last resort
    let fixed = text;
    // Remove anything before first { and after last }
    const start = fixed.indexOf('{');
    const end = fixed.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      fixed = fixed.substring(start, end + 1);
    }
    // Fix common issues: trailing commas before } or ]
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(fixed);
  } catch (e) {
    throw new Error(`Could not parse AI response as JSON. Raw text length: ${text.length}. Parse error: ${e.message}`);
  }
}

// ── Live knowledge updates from admin panel ───────────────────────────────────
async function getLiveKnowledgeUpdates() {
  try {
    if (!process.env.KV_REST_API_URL) return '';
    const { kv } = await import('@vercel/kv');
    const raw = await kv.lrange('skyline:knowledge_updates', 0, 49);
    if (!raw || raw.length === 0) return '';
    const updates = raw
      .map(r => { try { return JSON.parse(r); } catch { return null; } })
      .filter(Boolean);
    if (updates.length === 0) return '';
    const block = updates.map(u => `[${u.category}] ${u.title}\n${u.content}`).join('\n\n');
    return `\n\n=== LIVE UPDATES FROM SKYLINE ADMIN ===\n${block}\n=== END LIVE UPDATES ===`;
  } catch (e) {
    console.error('Failed to fetch live knowledge updates:', e.message);
    return '';
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MASTER KNOWLEDGE BASE — verified from official communiqués and Skyline Academy
// ══════════════════════════════════════════════════════════════════════════════
const CONCOURS_KNOWLEDGE = `
=== CAMEROON COMPETITIVE ENTRANCE EXAMINATIONS — VERIFIED KNOWLEDGE BASE ===

--- ENGINEERING & TECHNOLOGY ---

ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
- Tracks: Sciences and Technologies (400 places), Digital Arts (30), Digital Humanities (60)
- Written exam: 2 x Mathematics papers + 2 x Physics papers, each 3 hours, equal weight
- Online registration at polytechnique.cm/concours
- Centres: Bafoussam, Bamenda, Bertoua, Buea, Douala, Ebolowa, Garoua, Maroua, Ngaoundere, Yaounde
- Eligibility: Bac C/D/E/F or GCE A/L with Further Maths and Physics
- No published age limit
- Leads to Ingenieur de Conception diploma (5-year equivalent)

FET (Faculty of Engineering and Technology, University of Buea)
- Written exam: Mathematics (coefficient 3, 3 hours) + Physics (coefficient 3, 3 hours)
- Written exam only at 1st year — no file component
- 470 places total. BEng (BAC+4) and MEng (BAC+5)
- Centres: Buea, Bamenda, Douala, Yaounde
- Registration: ubuea.cm. Fee: 20,000 FCFA
- Eligibility: GCE A/L minimum 2 subjects including Maths and Physics, or Bac C/D/E/F
- Nature: intellectually and scientifically oriented. More competitive than COT for general science students
- FET vs COT: FET promotes scientific thinking and theory. COT promotes practical application.

COT (College of Technology, University of Buea)
- Written exam (60% weight): Mathematics (coefficient 4, 3 hours) + Physics (coefficient 4, 3 hours) + Language/English (coefficient 1, 1 hour)
- Study of academic file: 40% weight — school grades matter here
- 230 places: Computer Engineering, Electrical and Electronic Engineering, Mechanical Engineering, Mechatronics
- Centres: Buea, Bamenda, Douala, Yaounde. Fee: 20,000 FCFA
- Eligibility: GCE O/L (5 subjects including English, Maths, Physics) + GCE A/L (minimum 2 including Maths and Physics), or Bac C/D/E/F1/F2/F3, or GCE Technical O/L and A/L
- Nature: practically and applicatively oriented. Technical and vocational background students have a natural advantage at COT.
- COT awards Bachelor of Technology (B.Tech) — 3 years from 1st year

FASA Dschang (Faculty of Agronomy and Agricultural Sciences)
- Written exam: Biology + Mathematics + Chemistry + General Knowledge (4 subjects — harder than FAVM)
- 330 public places at Dschang + Bafia campuses plus 1200 places through affiliated IPES institutes
- Centres: Bafia, Bamenda, Douala, Dschang, Maroua, Ngaoundere, Yaounde
- Eligibility: Bac A/C/D/Agricultural or GCE A/L minimum 2 science subjects
- FASA is significantly more demanding than FAVM because it tests 4 subjects instead of 2

FAVM Buea (Faculty of Agriculture and Veterinary Medicine, University of Buea)
- Written exam: Biology (3 hours) + Chemistry (3 hours). Written = 60%, file = 40%
- 300 places across 9 programmes: Agricultural Economics (40), Animal Science (30), Crop Production (40), Forestry and Wildlife (30), Food Science (30), Fisheries (30), Plant Health (30), Soil Science (30), Veterinary Medicine (40)
- Centres: Buea, Bamenda, Douala, Yaounde. Fee: 20,000 FCFA
- More accessible than FASA Dschang

ESMV Ngaoundere (School of Veterinary Medicine and Sciences)
- Two tracks: Veterinary Doctors (100 places) and Animal Production Engineers (100 places)
- Written exam: Biology (coefficient 4, 2 hours) + Physics/Chemistry (coefficient 3, 2 hours) + Mathematics (coefficient 3, 2 hours) + General Knowledge (coefficient 2, 2 hours)
- Score below 4/20 in any paper = eliminated
- Age limit: maximum 26 years as of 31 December of exam year
- Centres: Ngaoundere, Buea, Dschang, Maroua, Yaounde. Fee: 20,000 FCFA

--- HEALTH SCIENCES ---

ENAFM (Examen National d Aptitude a la Formation Medicale)
- Single national exam for General Medicine, Pharmacy, and Dentistry at ALL accredited institutions
- Same paper, same day, same time across all 10 regions simultaneously
- Institutions: FMSB Yaounde I, FMSP Dschang, FMSP Douala, FHS Buea (Medicine), FMSB Garoua, UdM Bagangte
- Students must choose ONE institution and ONE track at registration

ENAFM Paper 1 (3 hours): 100 MCQs total — Biology 50 questions, Chemistry 25 questions, Physics 25 questions
ENAFM Paper 2 (1.5 hours, after 2 hour break): 50 MCQs — General Knowledge 35 questions (scientific + civic/political knowledge of Cameroon), French 15 questions

Coefficient differences:
- Medicine and Dentistry: Biology has highest coefficient. Chemistry and Physics are equal.
- Pharmacy: Chemistry has highest coefficient. Biology and Physics are equal.

ENAFM Registration: candidates must provide region of origin, grades in Biology and Chemistry, writing centre (for convenience), institution of choice (where they want to study). Writing centre and institution choice are INDEPENDENT. A student can write in Buea while competing for a seat at FMSB Yaounde.

ENAFM Eligibility: Bac C or D only (Francophone) or GCE A/L with Biology and Chemistry mandatory (Anglophone). GCE O/L must include Biology, Chemistry, and Physics or Maths in same session. Age limit: MAXIMUM 23 years old as of 1 January of exam year. Fee: 20,000 FCFA.

Medical pathway after ENAFM:
- Years 1-3: Preclinical (anatomy, physiology, biochemistry, pharmacology)
- Years 4-6: Clinical (hospital rotations, patient contact, applied medicine)
- End of Year 6: Examen National de Synthese Clinique et Therapeutique
- Year 7: Final year, thesis, graduation as Docteur en Medecine (General Practitioner)
- After graduation: competitive specialization — Gynaecology, Surgery, Cardiology, Dermatology, Nephrology, Paediatrics, Ophthalmology, Psychiatry and others
- Some Cameroonian doctors go to France, UK, or US to specialize then return to practice

FHS Buea (Faculty of Health Sciences, University of Buea) — SEPARATE from ENAFM
- Programmes: Nursing (60 places), Medical Laboratory Sciences MLS (60 places), Biomedical Sciences BMS (60 places), Midwifery (60 places), Public Health (60 places)
- FHS Buea runs its own INTERNAL exam — NOT the national ENAFM paper
- Written Section: 100 MCQs — Biology 40, Chemistry 20, Physics 20, English 20
- Oral Section: approximately 5 minutes before a jury of lecturers, doctors, and professors
- Both done same day with approximately 3 hour break between written and oral
- Eligibility: GCE A/L minimum 2 subjects including Biology AND Chemistry, GCE O/L minimum 5 subjects including English and Mathematics, or Bac C or D
- Fee: 20,000 FCFA. Single centre: FHS campus Buea.
- BMS specifically: Biology coefficient 4, Chemistry coefficient 3, Physics coefficient 3. No Mathematics required.

FHS Bamenda (University of Bamenda) — Nursing, Midwifery, MLS:
- Written: Biology (coefficient 4) + Chemistry (coefficient 2) + Physics (coefficient 2), 3 hours total
- Oral examination also required
- Single centre: University of Bamenda FHS campus, Mile 3 Nkwen
- Age limit: maximum 28 years as of 1 January of exam year

--- ADMINISTRATION ---

ENAM (Ecole Nationale d Administration et de Magistrature):
- 4 divisions: Administrative, Judiciary/Magistrature, Financial (Customs/Tax/Treasury), Social Affairs
- Cycle A requires Licence (BAC+3). Cycle B requires BAC+2 minimum.
- Judiciary: 15 Auditeurs de Justice (requires Master in Law), 15 Greffiers Cycle B
- Registration: concours.enam.cm. Exams August-September 2026.

EMIA (Ecole Militaire Interarmees):
- Age: minimum 18, maximum 23 years. Must be single with no dependants.
- Eligibility: GCE A/L in 3 subjects (excluding Religious Knowledge) + 1 successful year of higher education, or Bac (all series) + 1 year higher education.
- Fee: 20,000 FCFA. Single centre: Yaounde. Exam: January typically.

ENIEG/GTTC (Primary Teacher Training Colleges):
- 7,000 places nationwide. Exam: Tuesday 30 July 2026, all regional capitals.
- Eligibility: Bac (all series) or GCE A/L equivalent, age 17-32 years as of 1 January 2026.
- Training: 2 years. Leads to primary school teaching post.

=== GLOBAL PERSPECTIVE — QUALIFICATION RECOGNITION ===

GCE A/L (Anglophone Cameroon):
- Directly recognized by UK universities — treated equivalent to UK GCE A Levels
- Can apply to UK universities directly via UCAS
- US universities: evaluated through WES (World Education Services)

Cameroon University Degrees (Licence/Master/Doctorat):
- Follow LMD system aligned with Bologna Process (European framework)
- Licence (3 years) comparable to UK Bachelor degree
- Master (5 years post-Bac) comparable to UK Master degree

Medical Degree (Cameroon):
- 7-year programme. International Medical Graduates classification.
- UK: must pass PLAB (2 parts) then register with GMC
- US: must pass USMLE Steps 1, 2, 3 plus ECFMG certification then complete US residency
- France: must pass EVC equivalence exams plus supervised practice
- Cameroon medical degree is internationally workable but requires country-specific licensing exams — this is true for ALL countries, not specific to Cameroon

Engineering degrees (ENSPY/FET/COT):
- Cameroon is NOT a Washington Accord signatory so degrees are not automatically recognized for professional registration in UK/US/Nigeria
- However widely accepted for Masters and PhD graduate admission internationally
- Many ENSPY graduates pursue MSc in France, Canada, US successfully

Cameroonian bilingual advantage:
- Bilingual graduates (French and English) can pursue both Francophone African pathways (France, Belgium, CEMAC) AND Anglophone pathways (UK, Nigeria, Ghana)
- This is a genuine and rare advantage most other nationalities do not have
`;

// ══════════════════════════════════════════════════════════════════════════════
// SKYLAR PERSONA — consistent across all three endpoints
// ══════════════════════════════════════════════════════════════════════════════
const SKYLAR_MATCH = `You are Skylar, Skyline Academy AI mentor, named for the sky that has no ceiling. You speak with gentle warmth that students immediately feel safe with, but beneath the softness is someone deeply perceptive who sees patterns in people that even they have not seen in themselves. You are the brilliant, intuitive older sister who went through this, understands what it costs, and speaks truth kindly. You combine deep expertise in Holland RIASEC career psychology with encyclopaedic knowledge of Cameroon educational system, competitive entrance examinations, and professional landscape.`;

const SKYLAR_CONCOURS = `You are Skylar, Skyline Academy AI mentor. You have a gentle, intuitive presence that makes students feel at ease, but you are also deeply precise and well-informed about every competitive entrance examination in Cameroon. Speak clearly, warmly, and specifically. No fluff, no fear-mongering. Honest, motivated guidance that makes a student feel capable and prepared.`;

const SKYLAR_GLOBAL = `You are Skylar, Skyline Academy AI mentor. When it comes to global career pathways, you speak with both excitement and honesty. You believe Cameroonian students deserve to see their full horizon, not just what is safe, but what is possible, and you help them understand exactly what it takes to get there from where they are. Your tone is warm, your information is precise, and your perspective is genuinely global while remaining rooted in Cameroonian reality.`;

// ══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ══════════════════════════════════════════════════════════════════════════════
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, profile, concours, field } = req.body;

  // ── 1. CAREER MATCH ─────────────────────────────────────────────────────────
  if (type === 'match' || !type) {
    if (!profile) return res.status(400).json({ error: 'No profile data provided' });

    const liveUpdates = await getLiveKnowledgeUpdates();

    const prompt = `${SKYLAR_MATCH}

${CONCOURS_KNOWLEDGE}${liveUpdates}

A student has completed a 25-question psychometric and academic assessment. Here is their full profile:

${JSON.stringify(profile, null, 2)}

Answer codes:
- RIASEC types: R=Realistic, I=Investigative, A=Artistic, S=Social, E=Enterprising, C=Conventional
- q8, q12, q20: Likert scale 1-5
- stream: school stream/series. subjects: strong subjects. q25: open-ended dream

IMPORTANT: Return ONLY a valid JSON object. No text before it. No text after it. No markdown code fences. No explanation. Just the JSON object starting with { and ending with }.

In all string values: do NOT use apostrophes or single quotes. Write "it is" instead of contractions. Write "Cameroon" without the possessive form. Rephrase all contractions. Use only straight double quotes for JSON. Do not put line breaks inside string values.

Return this exact structure:
{
  "headline": "personalised 8-10 word headline about this student",
  "summary": "2 sentences about their unique profile and what makes them suited or challenged",
  "riasec_primary": "R or I or A or S or E or C",
  "riasec_secondary": "R or I or A or S or E or C",
  "profile_tags": ["tag1", "tag2", "tag3"],
  "careers": [
    {
      "title": "specific career title",
      "field": "Health Sciences or Engineering and Technology or Agriculture and Environment or Business and Economics or Law and Governance or Education and Social Sciences or Arts and Communication or Technical and Vocational or Security and Defence",
      "score": 85,
      "score_breakdown": {"personality_fit": 88, "values_alignment": 82, "academic_match": 85},
      "why": "3 sentences: personality fit, academic match, honest challenge",
      "entry_path": "specific concours or programme name",
      "duration": "e.g. 7 years at FMSB Yaounde",
      "concours": ["Primary concours name"],
      "concours_detail": {
        "exam_format": "brief description of written exam format",
        "key_subjects": ["subject1", "subject2"],
        "places": "number of places available",
        "centres": "exam centre cities",
        "fee": "registration fee",
        "deadline": "typical application period",
        "age_limit": "age limit if any",
        "eligibility_note": "one key eligibility requirement"
      },
      "global_perspective": "2 sentences on how this qualification compares internationally and what doors it opens abroad",
      "civil_service": true
    }
  ]
}

Rules:
- Return exactly 7 career matches across at least 4 different fields
- Scores vary genuinely from 30 to 92. Top match: 82-92.
- Use real Cameroonian institutions from the knowledge base
- concours_detail must use VERIFIED data from the knowledge base only
- Reference the student actual answers in the why field
- If q25 dream is specific, weight it heavily`;

    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6-20260218',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });
      const parsed = safeParseJSON(message.content[0].text);
      return res.status(200).json(parsed);
    } catch (err) {
      console.error('Match API error:', err.message);
      return res.status(500).json({ error: 'Failed to generate results: ' + (err.message || 'Unknown error') });
    }
  }

  // ── 2. CONCOURS GUIDE ───────────────────────────────────────────────────────
  if (type === 'concours') {
    if (!concours) return res.status(400).json({ error: 'No concours specified' });

    const liveUpdates = await getLiveKnowledgeUpdates();

    const prompt = `${SKYLAR_CONCOURS}

${CONCOURS_KNOWLEDGE}${liveUpdates}

A student wants a complete guide to: "${concours}"

IMPORTANT: Return ONLY a valid JSON object. No text before it. No text after it. No markdown fences. Just JSON starting with { and ending with }.

In all string values: do NOT use apostrophes or single quotes. Write "it is" instead of contractions. Write "Cameroon" without the possessive form. Rephrase all contractions. Use only straight double quotes. Do not put line breaks inside string values.

Return this exact structure:
{
  "name": "full official name",
  "short_name": "abbreviation",
  "institution": "full institution name",
  "location": "city",
  "field": "field of study",
  "overview": "2-3 sentences: what this school or programme is, what it leads to, why it matters in Cameroon",
  "exam_format": {
    "papers": [
      {"subject": "subject name", "duration": "X hours", "coefficient": 3, "questions": "format e.g. MCQ or Essay", "note": "any special note"}
    ],
    "total_duration": "total exam time",
    "structure_note": "any important structural detail"
  },
  "places": "number of places",
  "centres": ["city1", "city2"],
  "eligibility": {
    "diplomas": ["required diploma 1"],
    "subjects_required": ["required subject 1"],
    "age_limit": "age limit or none",
    "other": "any other key requirement"
  },
  "registration": {
    "method": "online or in-person or both",
    "website": "registration website if known",
    "fee": "fee amount",
    "deadline": "typical deadline period",
    "documents": ["document 1", "document 2"]
  },
  "difficulty": {
    "level": "Accessible or Competitive or Very Competitive or Extremely Competitive",
    "acceptance_rate_estimate": "approximate percentage",
    "hardest_paper": "which subject is most challenging",
    "honest_assessment": "2 sentences of honest direct advice about competition level"
  },
  "preparation": {
    "timeline": "how many months of prep recommended",
    "key_topics": ["topic 1", "topic 2", "topic 3"],
    "common_mistakes": ["mistake 1", "mistake 2"],
    "study_strategy": "3-4 sentences of specific actionable preparation advice",
    "past_questions": "are past questions available and where"
  },
  "career_outcomes": {
    "degree_awarded": "degree name and level",
    "duration": "years of study",
    "career_paths": ["career path 1", "career path 2", "career path 3"],
    "civil_service": true,
    "salary_range_cameroon": "approximate entry-level salary range in FCFA per month"
  },
  "global_perspective": {
    "comparable_to": "what this is comparable to in UK or US or France",
    "international_recognition": "honest assessment of how this qualification is recognised abroad",
    "study_abroad_pathway": "can graduates pursue further studies abroad and how",
    "work_abroad_pathway": "what does a graduate need to do to work in this field abroad",
    "cameroon_vs_abroad": "2 sentences comparing what this career looks like in Cameroon vs internationally"
  },
  "insider_tips": ["tip 1", "tip 2", "tip 3"]
}

Use ONLY verified data from the knowledge base. If specific data is not in the knowledge base, say: to be confirmed with institution.`;

    try {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }]
      });
      const parsed = safeParseJSON(message.content[0].text);
      return res.status(200).json(parsed);
    } catch (err) {
      console.error('Concours API error:', err.message);
      return res.status(500).json({ error: 'Failed to load concours guide: ' + (err.message || 'Unknown error') });
    }
  }

  // ── 3. GLOBAL PERSPECTIVE ───────────────────────────────────────────────────
  if (type === 'global') {
    if (!field) return res.status(400).json({ error: 'No field specified' });

    const liveUpdates = await getLiveKnowledgeUpdates();

    const prompt = `${SKYLAR_GLOBAL}

${CONCOURS_KNOWLEDGE}${liveUpdates}

A student wants to understand the global landscape for: "${field}"

IMPORTANT: Return ONLY a valid JSON object. No text before it. No text after it. No markdown fences. Just JSON starting with { and ending with }.

In all string values: do NOT use apostrophes or single quotes. Write "it is" instead of contractions. Rephrase all contractions. Use only straight double quotes. Do not put line breaks inside string values.

Return this exact structure:
{
  "field": "${field}",
  "cameroon_overview": "2-3 sentences: what this field looks like in Cameroon, demand, salaries, career ceiling",
  "cameroon_strengths": ["strength 1", "strength 2", "strength 3"],
  "cameroon_challenges": ["challenge 1", "challenge 2"],
  "comparison": [
    {
      "country": "Nigeria",
      "system": "brief description of their equivalent training pathway",
      "similarities": "how Cameroon system is similar",
      "differences": "key differences",
      "mutual_recognition": "can a Cameroonian professional work there"
    },
    {
      "country": "Ghana",
      "system": "brief description",
      "similarities": "similarities",
      "differences": "differences",
      "mutual_recognition": "recognition situation"
    },
    {
      "country": "France",
      "system": "brief description",
      "similarities": "similarities",
      "differences": "differences",
      "mutual_recognition": "recognition situation"
    },
    {
      "country": "United Kingdom",
      "system": "brief description",
      "similarities": "similarities",
      "differences": "differences",
      "mutual_recognition": "recognition situation"
    },
    {
      "country": "United States",
      "system": "brief description",
      "similarities": "similarities",
      "differences": "differences",
      "mutual_recognition": "recognition situation"
    }
  ],
  "qualification_journey": {
    "to_study_in_france": "step by step: what a Cameroonian graduate needs to continue studies in France",
    "to_study_in_uk": "step by step: what they need for UK",
    "to_study_in_us": "step by step: what they need for USA",
    "to_work_in_france": "what licensing or registration steps are needed to work in France in this field",
    "to_work_in_uk": "what steps for UK",
    "to_work_in_us": "what steps for USA"
  },
  "reality_check": "3-4 sentences of honest direct advice: real opportunities and realistic challenges for a Cameroonian student in this field",
  "opportunity_hotspots": ["where in the world are Cameroonians in this field most successfully building careers"],
  "cameroonian_advantage": "1-2 sentences: what unique advantage does being a bilingual Cameroonian give in this field globally"
}`;

    try {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }]
      });
      const parsed = safeParseJSON(message.content[0].text);
      return res.status(200).json(parsed);
    } catch (err) {
      console.error('Global API error:', err.message);
      return res.status(500).json({ error: 'Failed to load global perspective: ' + (err.message || 'Unknown error') });
    }
  }

  // ── 4. ANALYTICS ────────────────────────────────────────────────────────────
  if (type === 'analytics') {
    const { event, data } = req.body;
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({ timestamp, event, data }));
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Invalid request type' });
}
