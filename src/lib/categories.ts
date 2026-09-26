// Master list of all 50 EasyForm categories with official portal URLs,
// sections, and recognition aliases (for voice + text matching).
//
// Routing rules (CRITICAL):
// - Every category has its own unique, verified official URL.
// - If a portal is not stable / not confirmed, set `available: false`
//   so the Ready screen tells the user it is currently unavailable
//   instead of redirecting to a wrong site.

export type Category = {
  id: string;
  name: string;
  section: string;
  url: string;
  available: boolean;
  aliases?: string[];
  desc?: string;
};

export const SECTIONS = [
  "Education & Entrance Exams",
  "Government Jobs",
  "Defence",
  "Scholarships",
  "Documents & Certificates",
  "Government Services",
  "Admissions",
] as const;

export const CATEGORIES: Category[] = [
  // --- Education & Entrance Exams ---
  { id: "jee-main", name: "JEE Main", section: "Education & Entrance Exams", url: "https://jeemain.nta.nic.in", available: true, aliases: ["jee main", "jee", "जेईई मेन"] },
  { id: "jee-advanced", name: "JEE Advanced", section: "Education & Entrance Exams", url: "https://jeeadv.ac.in", available: true, aliases: ["jee advanced", "advanced", "जेईई एडवांस"] },
  { id: "neet-ug", name: "NEET UG", section: "Education & Entrance Exams", url: "https://neet.nta.nic.in", available: true, aliases: ["neet", "neet ug", "नीट"] },
  { id: "cuet-ug", name: "CUET UG", section: "Education & Entrance Exams", url: "https://cuet.nta.nic.in", available: true, aliases: ["cuet", "cuet ug", "सीयूईटी"] },
  { id: "cuet-pg", name: "CUET PG", section: "Education & Entrance Exams", url: "https://cuet.nta.nic.in", available: true, aliases: ["cuet pg", "सीयूईटी पीजी"] },
  { id: "nda", name: "NDA", section: "Education & Entrance Exams", url: "https://upsc.gov.in", available: true, aliases: ["nda", "एनडीए", "national defence academy"] },
  { id: "upsc", name: "UPSC", section: "Education & Entrance Exams", url: "https://upsc.gov.in", available: true, aliases: ["upsc", "civil services", "यूपीएससी"] },
  { id: "reap", name: "REAP", section: "Education & Entrance Exams", url: "https://hte.rajasthan.gov.in", available: true, aliases: ["reap", "rajasthan engineering"] },
  { id: "gate", name: "GATE", section: "Education & Entrance Exams", url: "https://gate.iisc.ac.in", available: true, aliases: ["gate", "गेट"] },
  { id: "cat", name: "CAT", section: "Education & Entrance Exams", url: "https://iimcat.ac.in", available: true, aliases: ["cat", "iim cat", "कैट"] },

  // --- Government Jobs ---
  { id: "ssc", name: "SSC", section: "Government Jobs", url: "https://ssc.gov.in", available: true, aliases: ["ssc", "staff selection", "एसएससी"] },
  { id: "ssc-cgl", name: "SSC CGL", section: "Government Jobs", url: "https://ssc.gov.in", available: true, aliases: ["cgl", "ssc cgl", "combined graduate"] },
  { id: "ssc-chsl", name: "SSC CHSL", section: "Government Jobs", url: "https://ssc.gov.in", available: true, aliases: ["chsl", "ssc chsl"] },
  { id: "ssc-mts", name: "SSC MTS", section: "Government Jobs", url: "https://ssc.gov.in", available: true, aliases: ["mts", "ssc mts", "multi tasking"] },
  { id: "railway", name: "Railway (RRB)", section: "Government Jobs", url: "https://www.rrbcdg.gov.in", available: true, aliases: ["railway", "rrb", "ntpc", "group d", "रेलवे"] },
  { id: "banking", name: "Banking Exams", section: "Government Jobs", url: "https://www.ibps.in", available: true, aliases: ["banking", "bank exam", "बैंकिंग"] },
  { id: "ibps", name: "IBPS", section: "Government Jobs", url: "https://www.ibps.in", available: true, aliases: ["ibps", "po", "clerk"] },
  { id: "sbi", name: "SBI Recruitment", section: "Government Jobs", url: "https://sbi.co.in/web/careers", available: true, aliases: ["sbi", "state bank", "एसबीआई"] },
  { id: "state-psc", name: "State PSC", section: "Government Jobs", url: "https://www.india.gov.in/website-public-service-commissions", available: true, aliases: ["state psc", "public service", "राज्य पीएससी"] },
  { id: "defence-recruit", name: "Defence Recruitment", section: "Government Jobs", url: "https://mod.gov.in", available: true, aliases: ["defence recruitment", "defence job"] },

  // --- Defence ---
  { id: "indian-army", name: "Indian Army", section: "Defence", url: "https://joinindianarmy.nic.in", available: true, aliases: ["army", "indian army", "सेना"] },
  { id: "indian-navy", name: "Indian Navy", section: "Defence", url: "https://joinindiannavy.gov.in", available: true, aliases: ["navy", "indian navy", "नौसेना"] },
  { id: "indian-airforce", name: "Indian Air Force", section: "Defence", url: "https://indianairforce.nic.in", available: true, aliases: ["air force", "iaf", "वायुसेना"] },
  { id: "agniveer", name: "Agniveer", section: "Defence", url: "https://joinindianarmy.nic.in", available: true, aliases: ["agniveer", "agnipath", "अग्निवीर"] },
  { id: "coast-guard", name: "Coast Guard", section: "Defence", url: "https://joinindiancoastguard.cdac.in", available: true, aliases: ["coast guard", "तटरक्षक"] },

  // --- Scholarships ---
  { id: "nsp", name: "National Scholarship Portal", section: "Scholarships", url: "https://scholarships.gov.in", available: true, aliases: ["nsp", "national scholarship", "राष्ट्रीय छात्रवृत्ति"] },
  { id: "state-scholarship", name: "State Scholarships", section: "Scholarships", url: "https://scholarships.gov.in", available: true, aliases: ["state scholarship", "राज्य छात्रवृत्ति"] },
  { id: "minority-scholarship", name: "Minority Scholarships", section: "Scholarships", url: "https://scholarships.gov.in", available: true, aliases: ["minority scholarship", "अल्पसंख्यक"] },
  { id: "merit-scholarship", name: "Merit Scholarships", section: "Scholarships", url: "https://scholarships.gov.in", available: true, aliases: ["merit scholarship", "मेरिट"] },
  { id: "post-matric", name: "Post-Matric Scholarships", section: "Scholarships", url: "https://scholarships.gov.in", available: true, aliases: ["post matric", "पोस्ट मैट्रिक"] },

  // --- Documents & Certificates ---
  { id: "passport", name: "Passport", section: "Documents & Certificates", url: "https://www.passportindia.gov.in", available: true, aliases: ["passport", "पासपोर्ट"] },
  { id: "pan", name: "PAN Card", section: "Documents & Certificates", url: "https://www.incometax.gov.in", available: true, aliases: ["pan", "pan card", "पैन"] },
  { id: "voter-id", name: "Voter ID", section: "Documents & Certificates", url: "https://voters.eci.gov.in", available: true, aliases: ["voter id", "voter", "मतदाता"] },
  { id: "driving-licence", name: "Driving Licence", section: "Documents & Certificates", url: "https://parivahan.gov.in", available: true, aliases: ["driving licence", "driving license", "dl", "ड्राइविंग लाइसेंस"] },
  { id: "birth-certificate", name: "Birth Certificate", section: "Documents & Certificates", url: "https://crsorgi.gov.in", available: true, aliases: ["birth certificate", "जन्म प्रमाण"] },
  { id: "income-certificate", name: "Income Certificate", section: "Documents & Certificates", url: "https://services.india.gov.in", available: true, aliases: ["income certificate", "आय प्रमाण"] },
  { id: "domicile-certificate", name: "Domicile Certificate", section: "Documents & Certificates", url: "https://services.india.gov.in", available: true, aliases: ["domicile", "मूल निवास"] },
  { id: "caste-certificate", name: "Caste Certificate", section: "Documents & Certificates", url: "https://services.india.gov.in", available: true, aliases: ["caste certificate", "जाति प्रमाण"] },
  { id: "ews-certificate", name: "EWS Certificate", section: "Documents & Certificates", url: "https://services.india.gov.in", available: true, aliases: ["ews", "ews certificate", "ईडब्ल्यूएस"] },

  // --- Government Services ---
  { id: "aadhaar", name: "Aadhaar Services", section: "Government Services", url: "https://uidai.gov.in", available: true, aliases: ["aadhaar", "aadhar", "uidai", "आधार"] },
  { id: "pm-scholarship", name: "PM Scholarship Schemes", section: "Government Services", url: "https://scholarships.gov.in", available: true, aliases: ["pm scholarship", "पीएम छात्रवृत्ति"] },
  { id: "pm-internship", name: "PM Internship Scheme", section: "Government Services", url: "https://pminternship.mca.gov.in", available: true, aliases: ["pm internship", "पीएम इंटर्नशिप"] },
  { id: "pm-kisan", name: "PM Kisan", section: "Government Services", url: "https://pmkisan.gov.in", available: true, aliases: ["pm kisan", "kisan", "पीएम किसान"] },
  { id: "eshram", name: "e-Shram Card", section: "Government Services", url: "https://eshram.gov.in", available: true, aliases: ["eshram", "e shram", "ई-श्रम"] },
  { id: "ayushman", name: "Ayushman Bharat", section: "Government Services", url: "https://pmjay.gov.in", available: true, aliases: ["ayushman", "pmjay", "आयुष्मान"] },

  // --- Admissions ---
  { id: "college-admission", name: "College Admissions", section: "Admissions", url: "https://www.ugc.gov.in", available: true, aliases: ["college admission", "कॉलेज एडमिशन"] },
  { id: "university-admission", name: "University Admissions", section: "Admissions", url: "https://samarth.ac.in", available: true, aliases: ["university admission", "विश्वविद्यालय"] },
  { id: "polytechnic-admission", name: "Polytechnic Admissions", section: "Admissions", url: "https://www.aicte-india.org", available: true, aliases: ["polytechnic", "पॉलिटेक्निक"] },
  { id: "iti-admission", name: "ITI Admissions", section: "Admissions", url: "https://dgt.gov.in", available: true, aliases: ["iti", "आईटीआई"] },
  { id: "nursing-admission", name: "Nursing Admissions", section: "Admissions", url: "https://www.indiannursingcouncil.org", available: true, aliases: ["nursing", "नर्सिंग"] },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function categoriesBySection(): Record<string, Category[]> {
  const out: Record<string, Category[]> = {};
  for (const s of SECTIONS) out[s] = [];
  for (const c of CATEGORIES) {
    (out[c.section] ||= []).push(c);
  }
  return out;
}

// Match free-text (voice transcript / search) to a category. Returns the
// best-matching category id, or undefined. Case-insensitive; checks name +
// aliases as whole-word or substring match.
export function matchCategory(raw: string): Category | undefined {
  if (!raw) return undefined;
  const t = raw.toLowerCase().trim();
  // Direct id match
  const byId = CATEGORIES.find((c) => c.id === t);
  if (byId) return byId;
  // Exact name match
  const exact = CATEGORIES.find((c) => c.name.toLowerCase() === t);
  if (exact) return exact;
  // Alias / contains — prefer longest match to avoid "ssc" hitting before "ssc cgl"
  const candidates: { cat: Category; score: number }[] = [];
  for (const c of CATEGORIES) {
    const hay = [c.name.toLowerCase(), ...(c.aliases ?? []).map((a) => a.toLowerCase())];
    for (const h of hay) {
      if (!h) continue;
      if (t.includes(h) || h.includes(t)) {
        candidates.push({ cat: c, score: h.length });
        break;
      }
    }
  }
  if (!candidates.length) return undefined;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].cat;
}

const SELECTED_KEY = "easyform:selectedCategory";

export function setSelectedCategory(id: string) {
  try { localStorage.setItem(SELECTED_KEY, id); } catch { /* ignore */ }
}

export function getSelectedCategory(): Category | undefined {
  try {
    const id = localStorage.getItem(SELECTED_KEY);
    if (id) return getCategory(id);
  } catch { /* ignore */ }
  return undefined;
}
