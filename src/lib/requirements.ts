// Per-category document requirements. EasyForm AI shows ONLY the documents
// relevant to the chosen category so users are never asked for the wrong ones.

import { getCategory } from "@/lib/categories";

export type IconKey =
  | "user" | "sign" | "id" | "file" | "address" | "birth" | "bank" | "income";

export type DocReq = {
  id: string;
  nameEn: string;
  nameHi: string;
  hintEn: string;
  hintHi: string;
  accept: string;
  iconKey: IconKey;
};

const A_IMG = "image/jpeg,image/png";
const A_ANY = "image/jpeg,image/png,application/pdf";

// Atomic document definitions, composed into per-category lists below.
const ATOMS = {
  photo: { id: "photo", nameEn: "Passport Photo", nameHi: "पासपोर्ट फोटो", hintEn: "JPEG · 20–50 KB", hintHi: "JPEG · 20–50 KB", accept: A_IMG, iconKey: "user" } as DocReq,
  sign: { id: "sign", nameEn: "Signature", nameHi: "हस्ताक्षर", hintEn: "Black ink · 10–20 KB", hintHi: "काली स्याही · 10–20 KB", accept: A_IMG, iconKey: "sign" } as DocReq,
  aadhaar: { id: "aadhaar", nameEn: "Aadhaar Card", nameHi: "आधार कार्ड", hintEn: "PDF or Image", hintHi: "PDF या इमेज", accept: A_ANY, iconKey: "id" } as DocReq,
  identity: { id: "identity", nameEn: "Identity Proof", nameHi: "पहचान प्रमाण", hintEn: "Aadhaar / PAN / Voter ID", hintHi: "आधार / पैन / वोटर आईडी", accept: A_ANY, iconKey: "id" } as DocReq,
  address: { id: "address", nameEn: "Address Proof", nameHi: "पता प्रमाण", hintEn: "Bill / Aadhaar / Passport", hintHi: "बिल / आधार / पासपोर्ट", accept: A_ANY, iconKey: "address" } as DocReq,
  birth: { id: "birth", nameEn: "Birth Proof", nameHi: "जन्म प्रमाण", hintEn: "Birth Certificate / 10th", hintHi: "जन्म प्रमाणपत्र / 10वीं", accept: A_ANY, iconKey: "birth" } as DocReq,
  marksheet10: { id: "marksheet10", nameEn: "Class 10 Marksheet", nameHi: "10वीं की मार्कशीट", hintEn: "PDF / Image", hintHi: "PDF / इमेज", accept: A_ANY, iconKey: "file" } as DocReq,
  marksheet12: { id: "marksheet12", nameEn: "Class 12 Marksheet", nameHi: "12वीं की मार्कशीट", hintEn: "PDF / Image", hintHi: "PDF / इमेज", accept: A_ANY, iconKey: "file" } as DocReq,
  graduation: { id: "graduation", nameEn: "Graduation Certificate", nameHi: "स्नातक प्रमाणपत्र", hintEn: "Degree / Provisional", hintHi: "डिग्री / प्रोविज़नल", accept: A_ANY, iconKey: "file" } as DocReq,
  qualification: { id: "qualification", nameEn: "Educational Qualification", nameHi: "शैक्षणिक योग्यता", hintEn: "10th / 12th / Degree", hintHi: "10वीं / 12वीं / डिग्री", accept: A_ANY, iconKey: "file" } as DocReq,
  marksheetGeneric: { id: "marksheet", nameEn: "Marksheet", nameHi: "मार्कशीट", hintEn: "Latest qualification", hintHi: "नवीनतम योग्यता", accept: A_ANY, iconKey: "file" } as DocReq,
  categoryCert: { id: "categoryCert", nameEn: "Category Certificate (if applicable)", nameHi: "श्रेणी प्रमाणपत्र (यदि लागू)", hintEn: "SC / ST / OBC / EWS", hintHi: "SC / ST / OBC / EWS", accept: A_ANY, iconKey: "file" } as DocReq,
  income: { id: "income", nameEn: "Income Certificate", nameHi: "आय प्रमाणपत्र", hintEn: "Tehsil / SDM issued", hintHi: "तहसील / SDM जारी", accept: A_ANY, iconKey: "income" } as DocReq,
  bank: { id: "bank", nameEn: "Bank Details", nameHi: "बैंक विवरण", hintEn: "Passbook / Cancelled Cheque", hintHi: "पासबुक / रद्द चेक", accept: A_ANY, iconKey: "bank" } as DocReq,
  learnerLicence: { id: "learnerLicence", nameEn: "Learner Licence (if applicable)", nameHi: "लर्नर लाइसेंस (यदि लागू)", hintEn: "Optional", hintHi: "वैकल्पिक", accept: A_ANY, iconKey: "file" } as DocReq,
};

// Category-specific overrides. Anything not listed falls back to a sensible
// per-section default below.
const BY_ID: Record<string, DocReq[]> = {
  // Education & Entrance Exams
  "jee-main": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet10, ATOMS.identity],
  "jee-advanced": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet10, ATOMS.marksheet12, ATOMS.identity],
  "neet-ug": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet10, ATOMS.marksheet12, ATOMS.identity],
  "cuet-ug": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet10, ATOMS.marksheet12, ATOMS.identity],
  "cuet-pg": [ATOMS.photo, ATOMS.sign, ATOMS.graduation, ATOMS.identity],
  "nda": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet10, ATOMS.marksheet12, ATOMS.identity],
  "upsc": [ATOMS.photo, ATOMS.sign, ATOMS.graduation, ATOMS.identity],
  "gate": [ATOMS.photo, ATOMS.sign, ATOMS.graduation, ATOMS.identity],
  "cat": [ATOMS.photo, ATOMS.sign, ATOMS.graduation, ATOMS.identity],
  "reap": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet12, ATOMS.identity],

  // Government Jobs
  "ssc": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.marksheet10, ATOMS.categoryCert],
  "ssc-cgl": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.marksheet10, ATOMS.graduation, ATOMS.categoryCert],
  "ssc-chsl": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.marksheet10, ATOMS.marksheet12, ATOMS.categoryCert],
  "ssc-mts": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.marksheet10, ATOMS.categoryCert],
  "railway": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.qualification],
  "banking": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.graduation],
  "ibps": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.graduation, ATOMS.categoryCert],
  "sbi": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.graduation],
  "state-psc": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.graduation, ATOMS.categoryCert],
  "defence-recruit": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.qualification],

  // Defence
  "indian-army": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.marksheet10, ATOMS.marksheet12],
  "indian-navy": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.marksheet10, ATOMS.marksheet12],
  "indian-airforce": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.marksheet10, ATOMS.marksheet12],
  "agniveer": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.marksheet10],
  "coast-guard": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.marksheet10, ATOMS.marksheet12],

  // Scholarships
  "nsp": [ATOMS.marksheetGeneric, ATOMS.income, ATOMS.aadhaar, ATOMS.bank],
  "state-scholarship": [ATOMS.marksheetGeneric, ATOMS.income, ATOMS.aadhaar, ATOMS.bank],
  "minority-scholarship": [ATOMS.marksheetGeneric, ATOMS.income, ATOMS.aadhaar, ATOMS.bank],
  "merit-scholarship": [ATOMS.marksheetGeneric, ATOMS.aadhaar, ATOMS.bank],
  "post-matric": [ATOMS.marksheet10, ATOMS.income, ATOMS.aadhaar, ATOMS.bank],

  // Documents & Certificates
  "passport": [ATOMS.address, ATOMS.identity, ATOMS.birth, ATOMS.photo],
  "pan": [ATOMS.identity, ATOMS.address, ATOMS.photo],
  "voter-id": [ATOMS.identity, ATOMS.address, ATOMS.photo],
  "driving-licence": [ATOMS.identity, ATOMS.address, ATOMS.learnerLicence],
  "birth-certificate": [ATOMS.identity, ATOMS.address],
  "income-certificate": [ATOMS.identity, ATOMS.address, ATOMS.aadhaar],
  "domicile-certificate": [ATOMS.identity, ATOMS.address, ATOMS.aadhaar],
  "caste-certificate": [ATOMS.identity, ATOMS.address, ATOMS.aadhaar],
  "ews-certificate": [ATOMS.identity, ATOMS.address, ATOMS.income, ATOMS.aadhaar],

  // Government Services
  "aadhaar": [ATOMS.identity, ATOMS.address, ATOMS.photo],
  "pm-scholarship": [ATOMS.marksheetGeneric, ATOMS.income, ATOMS.aadhaar, ATOMS.bank],
  "pm-internship": [ATOMS.photo, ATOMS.aadhaar, ATOMS.qualification, ATOMS.bank],
  "pm-kisan": [ATOMS.aadhaar, ATOMS.address, ATOMS.bank],
  "eshram": [ATOMS.aadhaar, ATOMS.bank, ATOMS.photo],
  "ayushman": [ATOMS.aadhaar, ATOMS.address, ATOMS.photo],

  // Admissions
  "college-admission": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet10, ATOMS.marksheet12, ATOMS.identity],
  "university-admission": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet10, ATOMS.marksheet12, ATOMS.identity],
  "polytechnic-admission": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet10, ATOMS.identity],
  "iti-admission": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet10, ATOMS.identity],
  "nursing-admission": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet10, ATOMS.marksheet12, ATOMS.identity],
};

const SECTION_DEFAULTS: Record<string, DocReq[]> = {
  "Education & Entrance Exams": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet10, ATOMS.marksheet12, ATOMS.identity],
  "Government Jobs": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.marksheet10, ATOMS.categoryCert],
  "Defence": [ATOMS.photo, ATOMS.sign, ATOMS.aadhaar, ATOMS.marksheet10, ATOMS.marksheet12],
  "Scholarships": [ATOMS.marksheetGeneric, ATOMS.income, ATOMS.aadhaar, ATOMS.bank],
  "Documents & Certificates": [ATOMS.identity, ATOMS.address, ATOMS.photo],
  "Government Services": [ATOMS.aadhaar, ATOMS.identity, ATOMS.photo],
  "Admissions": [ATOMS.photo, ATOMS.sign, ATOMS.marksheet10, ATOMS.marksheet12, ATOMS.identity],
};

const FALLBACK: DocReq[] = [ATOMS.photo, ATOMS.sign, ATOMS.identity];

export function getRequirements(categoryId?: string): DocReq[] {
  if (!categoryId) return FALLBACK;
  const direct = BY_ID[categoryId];
  if (direct) return direct;
  const cat = getCategory(categoryId);
  if (cat && SECTION_DEFAULTS[cat.section]) return SECTION_DEFAULTS[cat.section];
  return FALLBACK;
}

export function docName(d: DocReq, lang: "en" | "hi"): string {
  return lang === "hi" ? d.nameHi : d.nameEn;
}

export function docHint(d: DocReq, lang: "en" | "hi"): string {
  return lang === "hi" ? d.hintHi : d.hintEn;
}
