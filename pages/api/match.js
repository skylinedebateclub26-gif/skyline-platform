export const config = { maxDuration: 60 };

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
// STRUCTURED CALL HELPER
// The schema is enforced by the API through grammar-constrained sampling.
// The model cannot emit JSON that violates it. No fallback parser needed.
// ─────────────────────────────────────────────────────────────────────────────
async function callStructured({ model, maxTokens, prompt, schema, label }) {
  const msg = await client.messages.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
    output_config: {
      format: { type: 'json_schema', schema }
    }
  });

  console.log(
    `[${label}] stop_reason=${msg.stop_reason} ` +
    `in=${msg.usage?.input_tokens} out=${msg.usage?.output_tokens}`
  );

  if (msg.stop_reason === 'max_tokens') {
    throw new Error(
      `Response was cut off at ${maxTokens} output tokens. Raise max_tokens for ${label}.`
    );
  }
  if (msg.stop_reason === 'refusal') {
    throw new Error(`The model declined this ${label} request.`);
  }

  const block = msg.content.find(b => b.type === 'text');
  if (!block || !block.text) {
    throw new Error(
      `No text block returned for ${label}. Got: ${msg.content.map(b => b.type).join(', ') || 'nothing'}`
    );
  }

  try {
    return JSON.parse(block.text);
  } catch (e) {
    // Should be unreachable. If it ever fires, the raw text is in the Vercel log.
    console.error(`[${label}] RAW AI RESPONSE >>>`, block.text);
    throw new Error(`Parse failed despite structured outputs: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// Every property is required and every object sets additionalProperties: false.
// Both are deliberate: optional properties count against the API's complexity
// budget, and additionalProperties: false is mandatory for structured outputs.
// ─────────────────────────────────────────────────────────────────────────────

const MATCH_SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string', description: '8 to 10 word headline personalised to this student' },
    summary: { type: 'string', description: 'Two sentences about their profile and honest challenges' },
    riasec_primary: { type: 'string', enum: ['R', 'I', 'A', 'S', 'E', 'C'] },
    riasec_secondary: { type: 'string', enum: ['R', 'I', 'A', 'S', 'E', 'C'] },
    profile_tags: { type: 'array', items: { type: 'string' } },
    careers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          field: { type: 'string' },
          score: { type: 'integer', description: '30 to 92. Top match between 82 and 92.' },
          score_breakdown: {
            type: 'object',
            properties: {
              personality_fit: { type: 'integer' },
              values_alignment: { type: 'integer' },
              academic_match: { type: 'integer' }
            },
            required: ['personality_fit', 'values_alignment', 'academic_match'],
            additionalProperties: false
          },
          why: { type: 'string', description: 'Three sentences referencing the student actual answers' },
          entry_path: { type: 'string' },
          duration: { type: 'string' },
          concours: { type: 'array', items: { type: 'string' } },
          concours_detail: {
            type: 'object',
            properties: {
              exam_format: { type: 'string' },
              key_subjects: { type: 'array', items: { type: 'string' } },
              places: { type: 'string' },
              centres: { type: 'string' },
              fee: { type: 'string' },
              deadline: { type: 'string' },
              age_limit: { type: 'string' },
              eligibility_note: { type: 'string' }
            },
            required: ['exam_format', 'key_subjects', 'places', 'centres', 'fee', 'deadline', 'age_limit', 'eligibility_note'],
            additionalProperties: false
          },
          global_perspective: { type: 'string' },
          civil_service: { type: 'boolean' }
        },
        required: ['title', 'field', 'score', 'score_breakdown', 'why', 'entry_path', 'duration', 'concours', 'concours_detail', 'global_perspective', 'civil_service'],
        additionalProperties: false
      }
    }
  },
  required: ['headline', 'summary', 'riasec_primary', 'riasec_secondary', 'profile_tags', 'careers'],
  additionalProperties: false
};

const CONCOURS_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    short_name: { type: 'string' },
    institution: { type: 'string' },
    location: { type: 'string' },
    field: { type: 'string' },
    overview: { type: 'string' },
    exam_format: {
      type: 'object',
      properties: {
        papers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              subject: { type: 'string' },
              duration: { type: 'string' },
              coefficient: { type: 'number' },
              questions: { type: 'string' },
              note: { type: 'string' }
            },
            required: ['subject', 'duration', 'coefficient', 'questions', 'note'],
            additionalProperties: false
          }
        },
        total_duration: { type: 'string' },
        structure_note: { type: 'string' }
      },
      required: ['papers', 'total_duration', 'structure_note'],
      additionalProperties: false
    },
    places: { type: 'string' },
    centres: { type: 'array', items: { type: 'string' } },
    eligibility: {
      type: 'object',
      properties: {
        diplomas: { type: 'array', items: { type: 'string' } },
        subjects_required: { type: 'array', items: { type: 'string' } },
        age_limit: { type: 'string' },
        other: { type: 'string' }
      },
      required: ['diplomas', 'subjects_required', 'age_limit', 'other'],
      additionalProperties: false
    },
    registration: {
      type: 'object',
      properties: {
        method: { type: 'string' },
        website: { type: 'string' },
        fee: { type: 'string' },
        deadline: { type: 'string' },
        documents: { type: 'array', items: { type: 'string' } }
      },
      required: ['method', 'website', 'fee', 'deadline', 'documents'],
      additionalProperties: false
    },
    difficulty: {
      type: 'object',
      properties: {
        level: { type: 'string' },
        acceptance_rate_estimate: { type: 'string' },
        hardest_paper: { type: 'string' },
        honest_assessment: { type: 'string' }
      },
      required: ['level', 'acceptance_rate_estimate', 'hardest_paper', 'honest_assessment'],
      additionalProperties: false
    },
    preparation: {
      type: 'object',
      properties: {
        timeline: { type: 'string' },
        key_topics: { type: 'array', items: { type: 'string' } },
        common_mistakes: { type: 'array', items: { type: 'string' } },
        study_strategy: { type: 'string' },
        past_questions: { type: 'string' }
      },
      required: ['timeline', 'key_topics', 'common_mistakes', 'study_strategy', 'past_questions'],
      additionalProperties: false
    },
    career_outcomes: {
      type: 'object',
      properties: {
        degree_awarded: { type: 'string' },
        duration: { type: 'string' },
        career_paths: { type: 'array', items: { type: 'string' } },
        civil_service: { type: 'boolean' },
        salary_range_cameroon: { type: 'string' }
      },
      required: ['degree_awarded', 'duration', 'career_paths', 'civil_service', 'salary_range_cameroon'],
      additionalProperties: false
    },
    global_perspective: {
      type: 'object',
      properties: {
        comparable_to: { type: 'string' },
        international_recognition: { type: 'string' },
        study_abroad_pathway: { type: 'string' },
        work_abroad_pathway: { type: 'string' },
        cameroon_vs_abroad: { type: 'string' }
      },
      required: ['comparable_to', 'international_recognition', 'study_abroad_pathway', 'work_abroad_pathway', 'cameroon_vs_abroad'],
      additionalProperties: false
    },
    insider_tips: { type: 'array', items: { type: 'string' } }
  },
  required: ['name', 'short_name', 'institution', 'location', 'field', 'overview', 'exam_format', 'places', 'centres', 'eligibility', 'registration', 'difficulty', 'preparation', 'career_outcomes', 'global_perspective', 'insider_tips'],
  additionalProperties: false
};

const GLOBAL_SCHEMA = {
  type: 'object',
  properties: {
    field: { type: 'string' },
    cameroon_overview: { type: 'string' },
    cameroon_strengths: { type: 'array', items: { type: 'string' } },
    cameroon_challenges: { type: 'array', items: { type: 'string' } },
    comparison: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          country: { type: 'string' },
          system: { type: 'string' },
          similarities: { type: 'string' },
          differences: { type: 'string' },
          mutual_recognition: { type: 'string' }
        },
        required: ['country', 'system', 'similarities', 'differences', 'mutual_recognition'],
        additionalProperties: false
      }
    },
    qualification_journey: {
      type: 'object',
      properties: {
        to_study_in_france: { type: 'string' },
        to_study_in_uk: { type: 'string' },
        to_study_in_us: { type: 'string' },
        to_work_in_france: { type: 'string' },
        to_work_in_uk: { type: 'string' },
        to_work_in_us: { type: 'string' }
      },
      required: ['to_study_in_france', 'to_study_in_uk', 'to_study_in_us', 'to_work_in_france', 'to_work_in_uk', 'to_work_in_us'],
      additionalProperties: false
    },
    reality_check: { type: 'string' },
    opportunity_hotspots: { type: 'array', items: { type: 'string' } },
    cameroonian_advantage: { type: 'string' }
  },
  required: ['field', 'cameroon_overview', 'cameroon_strengths', 'cameroon_challenges', 'comparison', 'qualification_journey', 'reality_check', 'opportunity_hotspots', 'cameroonian_advantage'],
  additionalProperties: false
};

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

const SKYLAR = `You are Skylar, the AI mentor of Skyline Academy. You are warm, gentle and soft-spoken on the surface, but deeply perceptive underneath. You are the brilliant, intuitive older sister who went through this system herself and understands exactly what it costs a Cameroonian student to navigate it. You never sound clinical or generic. You speak truth kindly. Write naturally, in full warm sentences, the way you would speak to a student who is nervous about their future.`;

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, profile, concours, field } = req.body;

  // Analytics needs no AI call and no knowledge lookup.
  if (type === 'analytics') {
    console.log('[ANALYTICS]', JSON.stringify({
      timestamp: new Date().toISOString(),
      event: req.body.event,
      data: req.body.data
    }));
    return res.status(200).json({ ok: true });
  }

  const liveUpdates = await getLiveKnowledgeUpdates();

  // ── CAREER MATCH ──────────────────────────────────────────────────────────
  if (type === 'match' || !type) {
    if (!profile) return res.status(400).json({ error: 'No profile provided' });

    const prompt = `${SKYLAR}

You combine Holland RIASEC psychology expertise with encyclopaedic knowledge of Cameroonian entrance examinations.

${KB}${liveUpdates}

Student profile from the 25-question assessment:
${JSON.stringify(profile, null, 2)}

ANSWER CODES: RIASEC R=Realistic I=Investigative A=Artistic S=Social E=Enterprising C=Conventional. q8, q12 and q20 are Likert 1-5. q25 is open dream text.

Produce exactly 7 career matches spanning at least 4 different fields. Scores range from 30 to 92, with the top match between 82 and 92. Every factual detail about exams, fees, places, centres, age limits and eligibility must come from the knowledge base above. Never invent a figure. In each "why", reference the student's actual answers specifically rather than speaking in generalities.`;

    try {
      const data = await callStructured({
        model: 'claude-sonnet-4-6',
        maxTokens: 8000,
        prompt,
        schema: MATCH_SCHEMA,
        label: 'MATCH'
      });
      return res.status(200).json(data);
    } catch (err) {
      console.error('MATCH ERROR:', err.message);
      return res.status(500).json({ error: 'Match failed: ' + err.message });
    }
  }

  // ── CONCOURS GUIDE ────────────────────────────────────────────────────────
  if (type === 'concours') {
    if (!concours) return res.status(400).json({ error: 'No concours specified' });

    const prompt = `${SKYLAR}

You know every competitive entrance examination in Cameroon in detail.

${KB}${liveUpdates}

A student wants a complete guide to: ${concours}

Every factual detail must come from the knowledge base above. Never invent a figure. Where the knowledge base does not specify something, say so plainly rather than guessing. Be honest about how competitive this is; do not soften it into meaninglessness, but do not frighten the student either.`;

    try {
      const data = await callStructured({
        model: 'claude-haiku-4-5-20251001',
        maxTokens: 8000,
        prompt,
        schema: CONCOURS_SCHEMA,
        label: 'CONCOURS'
      });
      return res.status(200).json(data);
    } catch (err) {
      console.error('CONCOURS ERROR:', err.message);
      return res.status(500).json({ error: 'Concours guide failed: ' + err.message });
    }
  }

  // ── GLOBAL PERSPECTIVE ────────────────────────────────────────────────────
  if (type === 'global') {
    if (!field) return res.status(400).json({ error: 'No field specified' });

    const prompt = `${SKYLAR}

You speak with excitement and honesty about global career pathways for Cameroonian students.

${KB}${liveUpdates}

A student wants to understand the global landscape for this field: ${field}

Compare Cameroon with Nigeria, Ghana, France, the United Kingdom and the United States, in that order. Be honest in the reality check: name the real barriers, not just the opportunities. Every factual claim about recognition and equivalence must come from the knowledge base above.`;

    try {
      const data = await callStructured({
        model: 'claude-haiku-4-5-20251001',
        maxTokens: 8000,
        prompt,
        schema: GLOBAL_SCHEMA,
        label: 'GLOBAL'
      });
      return res.status(200).json(data);
    } catch (err) {
      console.error('GLOBAL ERROR:', err.message);
      return res.status(500).json({ error: 'Global perspective failed: ' + err.message });
    }
  }

  return res.status(400).json({ error: 'Invalid request type' });
}