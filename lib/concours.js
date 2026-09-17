// The 18 entrance examinations Skylar covers. Shared by the Concours page,
// the admin dashboard and the API (which only accepts exams from this list).
export const CONCOURS_LIST = [
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

export const FIELDS = [...new Set(CONCOURS_LIST.map(c => c.field))];
