export const config = { maxDuration: 60 };

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });


// ============================================================
// LIVE KNOWLEDGE UPDATES — fetched from Vercel KV at runtime
// Brandon can add updates from the admin panel without touching code
// ============================================================
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
    const block = updates.map(u =>
      `[${u.category}] ${u.title}\n${u.content}`
    ).join('\n\n');
    return `\n\n=== LIVE UPDATES FROM SKYLINE ADMIN (most recent first) ===\n${block}\n=== END LIVE UPDATES ===`;
  } catch (e) {
    console.error('Failed to fetch live knowledge updates:', e.message);
    return '';
  }
}

// ============================================================
// MASTER CONCOURS KNOWLEDGE BASE — verified from official communiqués
// ============================================================
const CONCOURS_KNOWLEDGE = `
=== CAMEROON COMPETITIVE ENTRANCE EXAMINATIONS — VERIFIED KNOWLEDGE BASE ===

--- ENGINEERING & TECHNOLOGY ---

ENSPY (École Nationale Supérieure Polytechnique de Yaoundé) — Polytechnique Yaoundé
- Tracks: Sciences & Technologies (400 places), Digital Arts (30 places), Digital Humanities (60 places)
- Sciences & Tech written exam: 2 × Mathematics papers + 2 × Physics papers, each 3 hours, equal weight
- Digital Arts: Mathematics + Computer Science + General Arts Culture
- Digital Humanities: Mathematics + Computer Science + General Social Sciences
- Registration: polytechnique.cm/concours (online only)
- Centres: Bafoussam, Bamenda, Bertoua, Buea, Douala, Ebolowa, Garoua, Maroua, Ngaoundéré, Yaoundé
- Eligibility: Bac C/D/E/F or GCE A/L with Further Maths and Physics minimum
- No published age limit
- Leads to: Ingénieur de Conception diploma (5-year equivalent), covers Civil, Electrical, Mechanical, Telecom, Computer, Industrial Engineering, Financial Engineering, Meteorology
- Difficulty: Most competitive engineering school in Cameroon — very high standard, Maths-heavy

FET (Faculty of Engineering and Technology, University of Buea)
- Written exam: Mathematics (coefficient 3, 3 hours) + Physics (coefficient 3, 3 hours). Written only, no file component at 1st year.
- 470 places total; awards BEng (BAC+4) and MEng (BAC+5)
- Centres: Buea, Bamenda, Douala, Yaoundé
- Registration: ubuea.cm (online); fee 20,000 FCFA, Banque Atlantique
- Eligibility: GCE A/L minimum 2 subjects including Maths and Physics; or Bac C/D/E/F
- Nature: Intellectually/scientifically oriented engineering — promotes scientific thinking and theoretical engineering
- More competitive than COT for general science students
- Application deadline: typically early-mid September; exam: mid-late September

COT (College of Technology, University of Buea)
- Written exam (60% weight): Mathematics (coefficient 4, 3 hours) + Physics (coefficient 4, 3 hours) + Language/English (coefficient 1, 1 hour)
- Study of files: 40% weight
- 230 places at 1st year: Computer Engineering, Electrical & Electronic Engineering, Mechanical Engineering
- Also offers: Bachelor of Technology in Mechatronics
- Registration: ubuea.cm (online); fee 20,000 FCFA
- Centres: Buea, Bamenda, Douala, Yaoundé
- Eligibility: GCE O/L (5 subjects incl. English, Maths, Physics) + GCE A/L (min 2 subjects incl. Maths and Physics); or Bac C/D/E/F1/F2/F3; or GCE Technical O/L and A/L
- Nature: Practically/applicatively oriented — hands-on engineering, trades-based
- Technical/vocational background students have a natural advantage
- General science students can succeed but need to adapt to practical focus
- Leads to: Bachelor of Technology (B.Tech) — 3 years from 1st year entry

COT vs FET comparison:
- FET: more intellectually oriented, scientific thinking, higher competition from general science stream
- COT: more practically oriented, technical/vocational background advantageous, 60/40 written-file split
- Both are engineering but different in philosophical approach
- Technical Bac students should strongly consider COT; science Bac students can aim for both

ENSPD / NHPSD (National Higher Polytechnic School of Douala)
- Subjects: Telecom/ICT, Industrial Fishing, Industrial Safety, Process Engineering, Civil Engineering, Chemical Engineering
- Similar format to ENSPY — written engineering sciences papers
- Centres include Douala as primary

COLTECH / ENSPB (National Higher Polytechnic Institute, University of Bamenda)
- Campus: Bambili, near Bamenda
- Written exam: Paper 1 (3hrs, coeff 5) — Mathematics and Physics primarily
- Cross-listed in both Engineering and Agriculture (Civil Engineering, Architecture, Built Environment)
- Leads to: Engineering degree in Civil Engineering and Architecture

FAVM BUEA (Faculty of Agriculture and Veterinary Medicine, University of Buea)
- Written: Biology (3 hours) + Chemistry (3 hours). Written = 60%, study of files = 40%.
- 300 total places across 9 programmes: Agricultural Economics (40), Animal Science (30), Crop Production (40), Forestry & Wildlife (30), Food Science & Technology (30), Fisheries (30), Plant Health Management (30), Soil Science (30), Veterinary Medicine (40)
- Centres: Buea, Bamenda, Douala, Yaoundé
- Registration: ubuea.cm; fee 20,000 FCFA
- Eligibility: GCE A/L in relevant science subjects; Bac C or D
- Nature: Broader in scope than FASA — covers agriculture, vet medicine, fisheries, forestry
- Relatively accessible compared to FASA Dschang

--- HEALTH SCIENCES ---

ENAFM (Examen National d'Aptitude à la Formation Médicale) — The National Medical Entrance Exam
- Covers: General Medicine, Pharmacy, Dentistry/Odontostomatology at ALL accredited institutions
- SAME paper, SAME day, SAME time across the entire national territory simultaneously
- Institutions covered: FMSB Yaoundé I, FMSP Dschang, FMSP Douala, FHS Buea (Medicine), FMSB Garoua, UdM Bagangte, CATUC, and all accredited private medical schools
- Students must choose ONE institution and ONE track at registration — cannot change after

ENAFM Paper 1 (3 hours):
- 100 MCQs total
- Biology: 50 questions
- Chemistry: 25 questions  
- Physics: 25 questions

ENAFM Paper 2 (1.5 hours, ~2 hour break after Paper 1):
- 50 MCQs total
- General Knowledge: 35 questions (split: Scientific Knowledge + Civic/Political Knowledge of Cameroon — political organization, institutions, history)
- French/Language: 15 questions

ENAFM Coefficient differences by programme:
- Medicine & Dentistry: Biology = highest coefficient; Chemistry = Physics (equal)
- Pharmacy: Chemistry = highest coefficient; Biology = Physics (equal)

ENAFM Registration details (candidates must provide):
1. Region of origin
2. Grades in Biology and Chemistry (from Bac/GCE results)
3. Writing centre (where they will physically sit — choose for convenience)
4. Institution of choice (where they want to study — choose strategically)
NOTE: Writing centre and institution choice are INDEPENDENT. You can write in Buea but be competing for a place at FMSB Yaoundé.

ENAFM Eligibility:
- Bac C or D ONLY (Francophone) / GCE A/L with Biology + Chemistry mandatory (Anglophone)
- GCE O/L must include Biology, Chemistry, Physics or Maths — all in same session
- Age limit: MAXIMUM 23 years old as of 1st January of the exam year
- Fee: 20,000 FCFA via Express Union to DAUQ agent, Warda branch Yaoundé
- Exam period: typically September; results published by MINESUP

ENAFM — What happens if you pass:
- You are admitted to your chosen institution in your chosen track
- Medical training: 7 years total
  * Years 1-3: Preclinical (anatomy, physiology, biochemistry, pharmacology, cell biology)
  * Years 4-6: Clinical (hospital rotations, patient contact, applied medicine across specialties)
  * End of Year 6: Examen National de Synthèse Clinique et Thérapeutique (200 MCQs + practical component)
  * Year 7: Final year, thesis/dissertation
  * Graduate as: Docteur en Médecine (General Practitioner / GP)
- After graduation → Specialization (competitive, requires further exams):
  Most sought-after specializations in Cameroon: Gynaecology & Obstetrics, General Surgery, Orthopaedic Surgery, Cardiology, Dermatology, Nephrology, Paediatrics, Ophthalmology, Psychiatry
  Some Cameroonian doctors go to France, UK, or US to specialize then return to practice

FHS Buea — Health Sciences programmes (SEPARATE from ENAFM national paper)
Programmes: Nursing (60 places), Medical Laboratory Sciences/MLS (60 places), Biomedical Sciences/BMS (60 places), Midwifery (60 places), Public Health (60 places)

FHS Buea Written Exam (100 MCQs total):
- Biology: 40 questions
- Chemistry: 20 questions
- Physics: 20 questions
- English: 20 questions

FHS Buea Oral Exam (~5 minutes before jury of lecturers, doctors, professors):
- Both written and oral done same day
- Approximately 3-hour break between written and oral sessions

FHS Buea Eligibility (all programmes):
- GCE A/L minimum 2 subjects including Biology AND Chemistry
- GCE O/L minimum 5 subjects including English and Mathematics
- Or Bac C or D

FHS Bamenda (University of Bamenda) — Nursing, Midwifery, MLS:
- Written paper: Biology (coefficient 4) + Chemistry (coefficient 2) + Physics (coefficient 2) — 3 hours total
- Oral examination also required
- Single centre: University of Bamenda FHS campus, Mile 3 Nkwen
- Age limit: maximum 28 years as of 1st January of the exam year
- Eligibility: GCE A/L minimum 2 science subjects including Biology; or Bac C, D or I

FMSB Yaoundé I (Faculté de Médecine et des Sciences Biomédicales):
- Uses ENAFM (national exam) — not a separate paper
- Most prestigious medical faculty in Cameroon
- Highest number of places among medical schools

FMSP Dschang (Faculté de Médecine et des Sciences Pharmaceutiques):
- Uses ENAFM — same national paper
- 50 places Medicine, 25 places Pharmacy annually (approximate)

FMSP Douala, FMSB Garoua, UdM Bagangte:
- All use ENAFM — same national paper

MINSANTE Health Personnel Schools (Nursing Assistants, State Registered Nurses, Health Technicians):
- Different from university-level — Ministry of Public Health exam
- Written exam: Saturday, 22 August 2026 session
- Centres: Bafoussam, Bamenda, Bertoua, Buea, Douala, Ebolowa, Garoua, Maroua, Ngaoundere, Yaoundé
- Programmes: General Nursing Assistants (GNA) — 4,680 places; Nursing; State Registered Nurse; Midwifery; Health Technicians (Clinical Analysis, Pharmacy, Mortuary) — various places
- Lower academic threshold than university-level nursing

--- AGRICULTURE ---

FASA Dschang (Faculty of Agronomy and Agricultural Sciences, University of Dschang):
- Written exam subjects: Biology + Mathematics + Chemistry + General Knowledge
- Written examination + assessment of academic file (Bac/Probatoire transcripts)
- 230 places at Dschang campus + 100 at Bafia campus = 330 public places; also 1,200 places through affiliated private institutes (IPES under FASA supervision)
- Centres: Bafia, Bamenda, Douala, Dschang, Maroua, Ngaoundéré, Yaoundé
- Eligibility: Bac A/C/D/Agricultural or GCE A/L minimum 2 science subjects. CEMAC nationals eligible
- Difficulty: Significantly more demanding than FAVM — 4 subjects vs 2
- Leads to: Ingénieur Agronome (Agronomist Engineer) — covers Agronomy, Animal Science, Agricultural Engineering, Food Science, Forestry

FAVM Buea (Faculty of Agriculture and Veterinary Medicine, University of Buea):
- Written: Biology (3 hours) + Chemistry (3 hours). Written = 60%, file = 40%
- 300 places across 9 programmes
- Relatively more accessible than FASA
- Cross-listed programmes: Veterinary Medicine (40 places within FAVM)

ESMV / SVMS (School of Veterinary Medicine and Sciences, University of Ngaoundéré):
Two separate tracks — different concours, same institution:

Track 1 — Docteurs Vétérinaires (Veterinary Doctors): 70 places (2024-2025), increasing to ~100 for 2026-2027
Track 2 — Ingénieurs des Travaux en Productions Animales (Animal Production Engineers): 50-100 places

ESMV Written Exam (both tracks):
- Biology: 2 hours, coefficient 4
- Physics/Chemistry: 2 hours, coefficient 3
- Mathematics: 2 hours, coefficient 3
- General Knowledge: 2 hours, coefficient 2
- Score below 4/20 in any paper = ELIMINATED regardless of total score

ESMV File Assessment also considered (Bac/Probatoire transcripts)

ESMV Eligibility:
- Bac C or D / GCE A/L minimum 3 science subjects including Biology + GCE O/L
- Age limit: MAXIMUM 26 years as of 31 December of exam year
- Fee: 20,000 FCFA via ECOBANK or Express Union to ESMV
- Application files submitted at ESMV Ngaoundéré, State University offices, or MINESUP website
- Centres: Ngaoundéré, Buea, Dschang, Maroua, Yaoundé (5 centres)
- Total 2026-2027: 200 places across both tracks
- Note: Up to 10 places per track by direct admission (scholarship holders only — 1,000,000 FCFA/year tuition)

ENEF Mbalmayo (École Nationale des Eaux et Forêts):
- Ministry of Forestry (MINFOF) school — not MINESUP
- Three tiers: ATEF (agents), TEF (technicians), TSEF (senior technicians, ~100 places)
- Forestry, wildlife, and water resource management
- Written exam, August session; fee 10,000–15,000 FCFA
- Centres: Lycée Général Leclerc Yaoundé + École de Faune de Garoua

--- ADMINISTRATION & PUBLIC SERVICE ---

ENAM (École Nationale d'Administration et de Magistrature) — Yaoundé:
- 4 Divisions: Administrative, Judiciary/Magistrature, Financial (Customs/Tax/Treasury), Social Affairs
- Cycle A (senior): requires Licence (BAC+3 minimum). 60 places Administrative Cycle A
- Cycle B (junior): requires BAC+2 minimum. 60 places Administrative Cycle B
- Judiciary: 15 Auditeurs de Justice (requires Master in Law), 15 Greffiers Cycle B
- Financial Division: Customs, Tax, Treasury tracks
- Social Affairs: 10 places
- Registration: concours.enam.cm (online); exams August-September 2026
- Application deadlines: 17-21 August 2026 depending on division
- Leads to: Career in Cameroonian civil service with guaranteed fonctionnaire salary

ENIEG / GTTC (Government Teacher Training Colleges — Primary level):
- 7,000 places nationwide
- Exam date 2026: Tuesday 30 July 2026, all regional capitals
- Eligibility: Bac (all series) or GCE A/L equivalent, age 17-32 years as of 1 January 2026
- Training: 2 years; leads to primary school teaching post (fonctionnaire)
- Fee structure: subsidized

EMIA (École Militaire Interarmées) — Combined Military Academy:
- Exam: January (typically 17-18 January), single centre Yaoundé
- Age: 18-23 years; must be single, no dependants; Cameroonian citizen
- Eligibility: GCE A/L in 3 subjects (excluding Religious Knowledge) + 1 successful year of higher education; or Bac (all series) + 1 year higher education
- Fee: 20,000 FCFA at Ministry of Defence
- Tracks: Category A (2nd Lieutenant), B (internal military), C & D (senior officers)
- Training subsidized by the State

=== GLOBAL PERSPECTIVE — QUALIFICATION RECOGNITION ===

GCE A/L (Anglophone Cameroon):
- Directly recognized by UK universities — treated as equivalent to UK GCE A Levels
- University of Warwick: Cameroon GCE A Level grades directly mapped to UK equivalents (AAA = AAA, AAB = AAB, etc.)
- University of Portsmouth, RGU and most UK universities accept Cameroon GCE A/L with Grade C minimum
- Can apply to UK universities directly via UCAS using GCE results
- For verification in UK: UK ENIC (formerly UK NARIC) issues comparability statements
- Nigerian universities: Cameroon GCE recognized through equivalency process
- US universities: evaluated through WES (World Education Services) or similar credential evaluators

Baccalauréat (Francophone Cameroon):
- Directly recognized by French universities — full access without additional requirements
- Belgium, Switzerland (French-speaking): accepted for university admission
- For UK: Bac at grade 12+ considered at postgraduate level by some UK universities (e.g. RGU)
- For US: evaluated through WES or similar

Cameroon University Degrees (Licence/Master/Doctorat):
- Follow the LMD (Licence-Master-Doctorat) system aligned with the Bologna Process (European framework)
- This means Cameroonian university degrees are theoretically comparable to European degrees
- Licence (3 years) = comparable to UK Bachelor's degree
- Master (5 years post-Bac) = comparable to UK Master's degree
- For UK recognition: apply to UK ENIC for Statement of Comparability
- For French universities: relatively straightforward academic recognition for further study
- For US graduate schools: evaluated on case-by-case basis through WES or NACES members

Medical Degree (Cameroon — Docteur en Médecine):
- 7-year programme; internationally trained doctors classed as International Medical Graduates (IMGs)
- To practice in UK: must pass PLAB (Professional and Linguistic Assessments Board) exam — 2 parts; then apply for GMC registration
- To practice in US: must pass USMLE (United States Medical Licensing Examination) Steps 1, 2, 3; ECFMG certification required; then complete US residency programme
- To practice in France: IMGs with non-EU degrees must pass equivalence exams (Épreuves de Vérification des Connaissances — EVC) and do additional supervised practice
- To continue specialization abroad: UK, US, and France each have their own competitive specialty training pathways that Cameroonian graduates can access after clearing licensure exams
- Within Africa: Cameroon medical degree recognized in most CEMAC and ECOWAS countries through bilateral agreements (though local registration usually still required)
- Key reality: A Cameroonian medical degree is a valid, internationally workable qualification, but practicing abroad requires country-specific licensing exams — this is true for doctors from ALL countries including UK doctors going to the US

Engineering Degree (ENSPY/FET/COT):
- Cameroon is NOT a signatory of the Washington Accord (the international engineering accreditation agreement covering US/ABET, UK/Engineering Council, Nigeria/COREN, etc.)
- Nigeria (COREN) joined Washington Accord in 2023 (provisional); UK and US have been signatories since 1989
- Practical implication: Cameroonian engineering degrees are NOT automatically recognized for professional engineer registration in UK/US/Nigeria
- To work as a professional engineer in the UK: need to apply to Engineering Council UK for review; may need additional exams or supervised experience
- To study further abroad (MSc/PhD): Cameroonian engineering degree widely accepted by international universities for graduate admission — this is different from professional practice recognition
- Many ENSPY graduates pursue MSc degrees in France, Canada, US successfully
- To work as engineer in Cameroon: the Ordre des Ingénieurs du Cameroun (OIC) governs professional registration

Agricultural/Veterinary degrees:
- Veterinary degrees (ESMV): require registration with local veterinary councils abroad; similar to medical pathway — licensing exams typically required to practice in foreign countries
- Agricultural engineering (FASA): accepted for further graduate study abroad; professional recognition varies by country

What Cameroonian students CAN do with their qualifications abroad:
1. STUDY FURTHER: University degrees from Cameroon are well-accepted for Masters and PhD programs in France, UK, Canada, US, Germany — this is the most common and straightforward pathway
2. WORK IN AFRICA: Intra-African mobility is growing; CEMAC and AU frameworks support regional movement; Cameroon professionals work across Francophone Africa especially
3. WORK IN EUROPE/US/UK: Requires professional licensing/registration in most regulated fields; process exists but takes time and additional exams
4. APPLY FOR JOBS: Many international organizations (UN, WHO, World Bank, NGOs) recognize Cameroonian degrees without additional licensing

Comparison with Nigeria and Ghana:
- Nigeria: Similar competitive entrance exam system (JAMB/UTME for universities, professional school exams); Nigerian medical and engineering degrees face same international recognition challenges
- Ghana: GCE system (Anglophone) similar to Cameroon's; WAEC exams used; KNUST engineering recognized in West Africa
- Key difference: Nigeria's larger scale means more international exposure and some bilateral agreements; Cameroon's bilingual system (GCE + Bac) actually gives students access to BOTH Anglophone and Francophone international pathways — a unique advantage

=== CAREER PATHWAYS IN CAMEROON ===

Medicine: 7 years → GP → specialization → hospital/private practice/research. High civil service demand; can enter public service as medical officer.

Engineering (ENSPY/FET): 5 years → Junior Engineer → Senior Engineer → Project Manager/Technical Director. Civil service (Travaux Publics, CAMTEL, AES-SONEL/ENEO, etc.) or private sector. ENSPY graduates often go to France/Canada for MSc then return or stay.

Agriculture/Veterinary: 5-7 years → Agricultural Engineer/Vet Doctor → MINEPIA (Ministry of Livestock), MINADER (Ministry of Agriculture), agribusiness, international NGOs (FAO, WFP). Growing demand with Cameroon's agricultural sector.

Nursing/MLS/Midwifery (FHS): 3 years BSc → clinical practice → specialization/masters possible → health sector careers. MINSANTE civil service tracks available.

Public Health (FHS): 3 years → public health officer roles → international health organizations → MINSANTE administration.

BMS (Biomedical Sciences): 3 years → laboratory careers, biomedical research, potential pathway to medical school (some graduates write the ENAFM again or the 4th year national entry exam to enter medical training at year 4 after a Licence Biomédicale).
`;

// ============================================================
// HANDLER
// ============================================================
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, profile, concours, field } = req.body;

  // ── 1. Career Match ──────────────────────────────────────
  if (type === 'match' || !type) {
    if (!profile) return res.status(400).json({ error: 'No profile data provided' });

    const liveUpdates = await getLiveKnowledgeUpdates();
    const prompt = `You are Skylar — Skyline Academy's AI mentor, named for the sky that has no ceiling. You speak with a gentle, warm energy that students immediately feel safe with, but beneath the softness is someone deeply perceptive, who sees patterns in people that even they haven't seen in themselves. You are not a textbook — you are the brilliant, intuitive older sister who went through this, understands what it costs, and speaks truth kindly. You combine deep expertise in Holland RIASEC career psychology with encyclopaedic knowledge of Cameroon's educational system, competitive entrance examinations, and professional landscape. When you speak to a student, they feel seen — not processed.

${CONCOURS_KNOWLEDGE}${liveUpdates}

A student has completed a 25-question psychometric and academic assessment. Here is their full profile:

${JSON.stringify(profile, null, 2)}

Answer codes:
- RIASEC types: R=Realistic, I=Investigative, A=Artistic, S=Social, E=Enterprising, C=Conventional
- q8, q12, q20: Likert scale 1-5
- stream: school stream/series; subjects: strong subjects; q25: open-ended dream

Return ONLY a valid JSON object — no markdown, no explanation:

{
  "headline": "personalised 8-10 word headline about this student",
  "summary": "2 sentences: their unique profile and what makes them suited or challenged",
  "riasec_primary": "R|I|A|S|E|C",
  "riasec_secondary": "R|I|A|S|E|C",
  "profile_tags": ["tag1","tag2","tag3"],
  "careers": [
    {
      "title": "specific career title",
      "field": "Health Sciences|Engineering & Technology|Agriculture & Environment|Business & Economics|Law & Governance|Education & Social Sciences|Arts & Communication|Technical & Vocational|Security & Defence",
      "score": 0-100,
      "score_breakdown": {"personality_fit": 0-100, "values_alignment": 0-100, "academic_match": 0-100},
      "why": "3 sentences: (1) personality fit, (2) academic background match, (3) honest challenge",
      "entry_path": "specific concours or programme name",
      "duration": "e.g. 7 years (FMSB Yaoundé)",
      "concours": ["Primary concours name", "Alternative concours if any"],
      "concours_detail": {
        "exam_format": "brief description of the written exam format",
        "key_subjects": ["subject1", "subject2"],
        "places": "number of places available",
        "centres": "exam centre cities",
        "fee": "registration fee",
        "deadline": "typical application period",
        "age_limit": "age limit if any",
        "eligibility_note": "one key eligibility requirement to know"
      },
      "global_perspective": "2 sentences: how this qualification compares internationally and what doors it opens abroad",
      "civil_service": true|false
    }
  ]
}

RULES:
- Return exactly 7 career matches across at least 4 different fields
- Scores vary genuinely from ~30 to ~92; top match: 82-92
- Use real Cameroonian institutions from the knowledge base
- concours_detail must use VERIFIED data from the knowledge base — never invent numbers
- global_perspective must be honest and specific — not generic encouragement
- Reference the student's actual answers in the "why" field
- If q25 dream is specific, weight it heavily
- CRITICAL JSON RULES: Use only straight double quotes. Never use curly quotes or special quote characters. Escape any apostrophe inside a string value as \' or rephrase to avoid it. Do not use line breaks inside JSON string values. Ensure all braces and brackets are balanced.`;

    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6-20260218',
        max_tokens: 3500,
        messages: [{ role: 'user', content: prompt }]
      });
      const rawText = message.content[0].text;
      let parsed;
      try {
        // Attempt 1: direct parse
        parsed = JSON.parse(rawText);
      } catch(_) {
        try {
          // Attempt 2: strip markdown fences
          const stripped = rawText.replace(/^```json\s*/,'').replace(/```\s*$/,'').trim();
          parsed = JSON.parse(stripped);
        } catch(_2) {
          try {
            // Attempt 3: extract outermost {...} block
            const m = rawText.match(/\{[\s\S]*\}/);
            if (!m) throw new Error('No JSON object found in response');
            parsed = JSON.parse(m[0]);
          } catch(e3) {
            // Attempt 4: sanitize control characters then try again
            const sanitized = rawText
              .replace(/[\u0000-\u001F\u007F]/g, ' ')
              .replace(/^[^{]*/,'')
              .replace(/[^}]*$/,'');
            parsed = JSON.parse(sanitized);
          }
        }
      }
      return res.status(200).json(parsed);
    } catch (err) {
      console.error('Match API error:', err?.message || err);
      return res.status(500).json({ error: 'Failed to generate results: ' + (err?.message || 'Unknown error') });
    }
  }

  // ── 2. Concours Deep Dive ────────────────────────────────
  if (type === 'concours') {
    if (!concours) return res.status(400).json({ error: 'No concours specified' });

    const liveUpdates = await getLiveKnowledgeUpdates();
    const prompt = `You are Skylar — Skyline Academy's AI mentor. You have a gentle, intuitive presence that makes students feel at ease, but you are also deeply precise and well-informed about every competitive entrance examination in Cameroon. You've coached hundreds of students and you know that what a student needs is not just information — it's the truth delivered with care. Speak clearly, warmly, and specifically. No fluff, no fear-mongering — just honest, motivated guidance that makes a student feel capable.

${CONCOURS_KNOWLEDGE}${liveUpdates}

A student wants a complete guide to: "${concours}"

Return ONLY valid JSON:

{
  "name": "full official name",
  "short_name": "abbreviation",
  "institution": "full institution name",
  "location": "city",
  "field": "field of study",
  "overview": "2-3 sentences: what this school/programme is, what it leads to, why it matters in Cameroon",
  "exam_format": {
    "papers": [
      {"subject": "subject name", "duration": "X hours", "coefficient": X, "questions": "format e.g. Essay / MCQ / Mixed", "note": "any special note"}
    ],
    "total_duration": "total exam time",
    "structure_note": "any important structural detail e.g. 60/40 written-file split, same day oral, etc."
  },
  "places": "number of places",
  "centres": ["city1", "city2"],
  "eligibility": {
    "diplomas": ["required diploma 1", "required diploma 2"],
    "subjects_required": ["required subject 1"],
    "age_limit": "age limit or none",
    "other": "any other key requirement"
  },
  "registration": {
    "method": "online/in-person/both",
    "website": "registration website if known",
    "fee": "fee amount",
    "deadline": "typical deadline period",
    "documents": ["document 1", "document 2", "document 3"]
  },
  "difficulty": {
    "level": "Accessible|Competitive|Very Competitive|Extremely Competitive",
    "acceptance_rate_estimate": "approximate percentage or range",
    "hardest_paper": "which subject/paper is most challenging",
    "honest_assessment": "2 sentences of honest, direct advice about the competition level"
  },
  "preparation": {
    "timeline": "how many months of prep are recommended",
    "key_topics": ["topic 1", "topic 2", "topic 3", "topic 4"],
    "common_mistakes": ["mistake 1", "mistake 2", "mistake 3"],
    "study_strategy": "3-4 sentences of specific, actionable preparation advice for this exact concours",
    "past_questions": "are past questions available and where"
  },
  "career_outcomes": {
    "degree_awarded": "degree name and level",
    "duration": "years of study",
    "career_paths": ["career path 1", "career path 2", "career path 3"],
    "civil_service": true|false,
    "salary_range_cameroon": "approximate entry-level salary range in FCFA/month"
  },
  "global_perspective": {
    "comparable_to": "what this is comparable to in UK/US/France",
    "international_recognition": "honest assessment of how this qualification is recognised abroad",
    "study_abroad_pathway": "can graduates pursue further studies abroad? How?",
    "work_abroad_pathway": "what does a graduate need to do to work in this field abroad?",
    "cameroon_vs_abroad": "2 sentences comparing what this career looks like in Cameroon vs internationally"
  },
  "insider_tips": ["tip 1", "tip 2", "tip 3"]
}

Use ONLY verified data from the knowledge base. If specific data is not in the knowledge base, say "to be confirmed with institution" rather than inventing figures.

CRITICAL: Return ONLY raw JSON. No markdown. No text before or after. Use straight double quotes only. Escape apostrophes by rephrasing (e.g. "it is" not "it's"). No line breaks inside string values. All braces balanced.`;

    try {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }]
      });
      const rawText = message.content[0].text;
      let parsed;
      try {
        // Attempt 1: direct parse
        parsed = JSON.parse(rawText);
      } catch(_) {
        try {
          // Attempt 2: strip markdown fences
          const stripped = rawText.replace(/^```json\s*/,'').replace(/```\s*$/,'').trim();
          parsed = JSON.parse(stripped);
        } catch(_2) {
          try {
            // Attempt 3: extract outermost {...} block
            const m = rawText.match(/\{[\s\S]*\}/);
            if (!m) throw new Error('No JSON object found in response');
            parsed = JSON.parse(m[0]);
          } catch(e3) {
            // Attempt 4: sanitize control characters then try again
            const sanitized = rawText
              .replace(/[\u0000-\u001F\u007F]/g, ' ')
              .replace(/^[^{]*/,'')
              .replace(/[^}]*$/,'');
            parsed = JSON.parse(sanitized);
          }
        }
      }
      return res.status(200).json(parsed);
    } catch (err) {
      console.error('Concours API error:', err?.message || err);
      return res.status(500).json({ error: 'Failed to load concours guide: ' + (err?.message || 'Unknown error') });
    }
  }

  // ── 3. Field Comparison / Global Perspective ─────────────
  if (type === 'global') {
    if (!field) return res.status(400).json({ error: 'No field specified' });

    const liveUpdates = await getLiveKnowledgeUpdates();
    const prompt = `You are Skylar — Skyline Academy's AI mentor. When it comes to global career pathways, you speak with both excitement and honesty. You believe Cameroonian students deserve to see their full horizon — not just what's safe, but what's possible — and you help them understand exactly what it takes to get there from where they are. Your tone is warm, your information is precise, and your perspective is genuinely global while remaining rooted in Cameroonian reality.

${CONCOURS_KNOWLEDGE}${liveUpdates}

A student wants to understand the global landscape for: "${field}"

Return ONLY valid JSON:

{
  "field": "${field}",
  "cameroon_overview": "2-3 sentences: what this field looks like in Cameroon — demand, salaries, career ceiling",
  "cameroon_strengths": ["strength 1", "strength 2", "strength 3"],
  "cameroon_challenges": ["challenge 1", "challenge 2"],
  "comparison": [
    {
      "country": "Nigeria",
      "system": "brief description of their equivalent training pathway",
      "similarities": "how Cameroon's system is similar",
      "differences": "key differences",
      "mutual_recognition": "can a Cameroonian professional work there and vice versa?"
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
    "to_study_in_france": "step-by-step: what a Cameroonian graduate needs to continue studies in France",
    "to_study_in_uk": "step-by-step: what they need for UK",
    "to_study_in_us": "step-by-step: what they need for USA",
    "to_work_in_france": "what licensing/registration steps are needed to WORK in France in this field",
    "to_work_in_uk": "what steps for UK",
    "to_work_in_us": "what steps for USA"
  },
  "reality_check": "3-4 sentences of honest, direct advice: what are the real opportunities and realistic challenges for a Cameroonian student in this field? What should they know before committing?",
  "opportunity_hotspots": ["where in the world are Cameroonians in this field most successfully building careers?"],
  "cameroonian_advantage": "1-2 sentences: what unique advantage does being a bilingual Cameroonian give in this field globally?"
}

CRITICAL: Return ONLY raw JSON. No markdown fences. No text before or after. Straight double quotes only. Rephrase to avoid apostrophes (use "it is" not "it's"). All braces balanced.`;

    try {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }]
      });
      const rawText = message.content[0].text;
      let parsed;
      try {
        // Attempt 1: direct parse
        parsed = JSON.parse(rawText);
      } catch(_) {
        try {
          // Attempt 2: strip markdown fences
          const stripped = rawText.replace(/^```json\s*/,'').replace(/```\s*$/,'').trim();
          parsed = JSON.parse(stripped);
        } catch(_2) {
          try {
            // Attempt 3: extract outermost {...} block
            const m = rawText.match(/\{[\s\S]*\}/);
            if (!m) throw new Error('No JSON object found in response');
            parsed = JSON.parse(m[0]);
          } catch(e3) {
            // Attempt 4: sanitize control characters then try again
            const sanitized = rawText
              .replace(/[\u0000-\u001F\u007F]/g, ' ')
              .replace(/^[^{]*/,'')
              .replace(/[^}]*$/,'');
            parsed = JSON.parse(sanitized);
          }
        }
      }
      return res.status(200).json(parsed);
    } catch (err) {
      console.error('Global API error:', err?.message || err);
      return res.status(500).json({ error: 'Failed to load global perspective: ' + (err?.message || 'Unknown error') });
    }
  }


  // ── 4. Analytics ─────────────────────────────────────────
  if (type === 'analytics') {
    // In production this writes to a lightweight store (Vercel KV, Supabase, or a JSON log)
    // For now we log server-side and return acknowledgement
    const { event, data } = req.body;
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({ timestamp, event, data }));
    // TODO: connect to Vercel KV or Supabase for persistent storage
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Invalid request type' });
}
