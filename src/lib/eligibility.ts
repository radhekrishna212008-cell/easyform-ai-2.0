// Smart Eligibility Rules & Evaluation Engine for EasyForm AI 2.0
// Provides dynamic eligibility questions, age calculation, reservation relaxations,
// and responsible non-definitive evaluation with direct official guidance notices.

export type EligibilityCriteriaResult = {
  id: string;
  criterionEn: string;
  criterionHi: string;
  status: "satisfied" | "needs_confirmation" | "not_satisfied";
  userAnswer: string;
  requirementEn: string;
  requirementHi: string;
  explanationEn: string;
  explanationHi: string;
};

export type UserEligibilityInput = {
  dob: string;
  educationLevel: "10th" | "12th" | "diploma" | "graduate" | "postgraduate";
  stream?: string;
  percentage?: number;
  category: "General" | "OBC" | "SC" | "ST" | "EWS";
  isPwd?: boolean;
  state?: string;
  nationality: "Indian" | "Other";
  customAnswers?: Record<string, string>;
};

export type FormEligibilityRule = {
  minAge: number;
  maxAgeGeneral: number;
  ageRelaxation: {
    OBC: number;
    SC: number;
    ST: number;
    EWS: number;
    PwD: number;
  };
  requiredEducation: ("10th" | "12th" | "diploma" | "graduate" | "postgraduate")[];
  minPercentage?: number;
  mandatoryStream?: string;
  nationality: ("Indian" | "Other")[];
  formSpecificQuestions?: {
    id: string;
    questionEn: string;
    questionHi: string;
    type: "select" | "boolean";
    options?: { label: string; value: string }[];
    expectedValue?: string;
    explanationEn: string;
    explanationHi: string;
  }[];
  officialNotificationNoteEn: string;
  officialNotificationNoteHi: string;
};

// Form specific criteria mappings
const ELIGIBILITY_RULES: Record<string, FormEligibilityRule> = {
  "ssc-cgl": {
    minAge: 18,
    maxAgeGeneral: 32,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, EWS: 0, PwD: 10 },
    requiredEducation: ["graduate", "postgraduate"],
    nationality: ["Indian"],
    officialNotificationNoteEn: "SSC CGL requires a Bachelor's Degree from a recognized university. Age cut-off date is determined by official SSC notice.",
    officialNotificationNoteHi: "SSC CGL के लिए मान्यता प्राप्त विश्वविद्यालय से स्नातक (Bachelor's Degree) अनिवार्य है।",
  },
  "ssc-chsl": {
    minAge: 18,
    maxAgeGeneral: 27,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, EWS: 0, PwD: 10 },
    requiredEducation: ["12th", "diploma", "graduate", "postgraduate"],
    nationality: ["Indian"],
    officialNotificationNoteEn: "Candidates must have passed 12th Standard or equivalent from a recognized board.",
    officialNotificationNoteHi: "उम्मीदवार को किसी मान्यता प्राप्त बोर्ड से 12वीं या समकक्ष उत्तीर्ण होना चाहिए।",
  },
  "ssc-mts": {
    minAge: 18,
    maxAgeGeneral: 25,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, EWS: 0, PwD: 10 },
    requiredEducation: ["10th", "12th", "diploma", "graduate", "postgraduate"],
    nationality: ["Indian"],
    officialNotificationNoteEn: "Matriculation (10th Standard) pass from a recognized board.",
    officialNotificationNoteHi: "10वीं कक्षा उत्तीर्ण होना आवश्यक है।",
  },
  "railway": {
    minAge: 18,
    maxAgeGeneral: 33,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, EWS: 0, PwD: 10 },
    requiredEducation: ["10th", "12th", "diploma", "graduate", "postgraduate"],
    nationality: ["Indian"],
    officialNotificationNoteEn: "RRB eligibility varies by post level (10th/ITI for Group D, 12th/Graduate for NTPC).",
    officialNotificationNoteHi: "आरआरबी पद स्तर के अनुसार 10वीं/12वीं/स्नातक योग्यता निर्धारित होती है।",
  },
  "nda": {
    minAge: 16.5,
    maxAgeGeneral: 19.5,
    ageRelaxation: { OBC: 0, SC: 0, ST: 0, EWS: 0, PwD: 0 },
    requiredEducation: ["12th", "graduate", "postgraduate"],
    nationality: ["Indian"],
    formSpecificQuestions: [
      {
        id: "maritalStatus",
        questionEn: "Are you an unmarried candidate?",
        questionHi: "क्या आप अविवाहित हैं?",
        type: "boolean",
        expectedValue: "true",
        explanationEn: "Only unmarried male and female candidates are eligible for NDA as per UPSC guidelines.",
        explanationHi: "यूपीएससी नियमों के अनुसार केवल अविवाहित उम्मीदवार ही एनडीए के लिए पात्र हैं।",
      },
    ],
    officialNotificationNoteEn: "Strict age bracket 16.5 to 19.5 years. No category relaxation in age for NDA.",
    officialNotificationNoteHi: "एनडीए के लिए आयु सीमा 16.5 से 19.5 वर्ष सख्त है।",
  },
  "upsc": {
    minAge: 21,
    maxAgeGeneral: 32,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, EWS: 0, PwD: 10 },
    requiredEducation: ["graduate", "postgraduate"],
    nationality: ["Indian"],
    officialNotificationNoteEn: "Degree from an incorporated university or institution recognized by UGC.",
    officialNotificationNoteHi: "यूजीसी मान्यता प्राप्त संस्थान से स्नातक की डिग्री अनिवार्य है।",
  },
  "jee-main": {
    minAge: 16,
    maxAgeGeneral: 26,
    ageRelaxation: { OBC: 0, SC: 5, ST: 5, EWS: 0, PwD: 5 },
    requiredEducation: ["12th", "graduate"],
    minPercentage: 75,
    formSpecificQuestions: [
      {
        id: "pcmSubject",
        questionEn: "Did you study Physics, Chemistry, and Mathematics (PCM) in Class 12?",
        questionHi: "क्या आपने 12वीं में भौतिकी, रसायन विज्ञान और गणित (PCM) पढ़ा है?",
        type: "boolean",
        expectedValue: "true",
        explanationEn: "PCM is required for B.E./B.Tech programs in JEE Main.",
        explanationHi: "बी.ई./बी.टेक कार्यक्रमों के लिए 12वीं में पीसीएम होना आवश्यक है।",
      },
    ],
    officialNotificationNoteEn: "Candidate must have passed Class 12 with Physics & Math. 75% or top 20 percentile for NIT/IIT admission.",
    officialNotificationNoteHi: "12वीं में भौतिक विज्ञान व गणित अनिवार्य है।",
  },
  "neet-ug": {
    minAge: 17,
    maxAgeGeneral: 30,
    ageRelaxation: { OBC: 5, SC: 5, ST: 5, EWS: 0, PwD: 5 },
    requiredEducation: ["12th", "graduate"],
    minPercentage: 50,
    formSpecificQuestions: [
      {
        id: "pcbSubject",
        questionEn: "Did you study Physics, Chemistry, and Biology/Biotechnology in Class 12?",
        questionHi: "क्या आपने 12वीं में भौतिकी, रसायन विज्ञान और जीव विज्ञान (PCB) पढ़ा है?",
        type: "boolean",
        expectedValue: "true",
        explanationEn: "Biology/Biotechnology is mandatory for medical entrance exams.",
        explanationHi: "मेडिकल प्रवेश के लिए जीव विज्ञान होना अनिवार्य है।",
      },
    ],
    officialNotificationNoteEn: "Candidate must complete 17 years by Dec 31 of admission year with PCB subjects.",
    officialNotificationNoteHi: "उम्मीदवार को प्रवेश वर्ष के 31 दिसंबर तक 17 वर्ष पूर्ण करना आवश्यक है।",
  },
  "nsp": {
    minAge: 14,
    maxAgeGeneral: 35,
    ageRelaxation: { OBC: 0, SC: 0, ST: 0, EWS: 0, PwD: 0 },
    requiredEducation: ["10th", "12th", "diploma", "graduate", "postgraduate"],
    formSpecificQuestions: [
      {
        id: "familyIncome",
        questionEn: "Is your annual family income within the prescribed scholarship ceiling (usually under ₹2.5 Lakh or ₹8 Lakh depending on scheme)?",
        questionHi: "क्या आपकी वार्षिक पारिवारिक आय निर्धारित सीमा के भीतर है?",
        type: "boolean",
        expectedValue: "true",
        explanationEn: "Income ceiling varies per central/state scheme. Valid income certificate is required.",
        explanationHi: "आय सीमा योजना के अनुसार निर्धारित होती है। आय प्रमाणपत्र अनिवार्य है।",
      },
    ],
    nationality: ["Indian"],
    officialNotificationNoteEn: "Different NSP schemes (Pre-matric, Post-matric, Top Class) have specific income and merit cut-offs.",
    officialNotificationNoteHi: "राष्ट्रीय छात्रवृत्ति पोर्टल पर विभिन्न योजनाओं के लिए अलग-अलग आय व योग्यता मानदंड हैं।",
  },
  "pm-internship": {
    minAge: 21,
    maxAgeGeneral: 24,
    ageRelaxation: { OBC: 0, SC: 0, ST: 0, EWS: 0, PwD: 0 },
    requiredEducation: ["10th", "12th", "diploma", "graduate", "postgraduate"],
    nationality: ["Indian"],
    officialNotificationNoteEn: "Age between 21 and 24 years. Candidate must not be engaged in full-time employment.",
    officialNotificationNoteHi: "उम्मीदवार की आयु 21 से 24 वर्ष के बीच होनी चाहिए तथा पूर्णकालिक नौकरी में नहीं होना चाहिए।",
  },
};

// Default fallback rule for other categories
const DEFAULT_RULE: FormEligibilityRule = {
  minAge: 18,
  maxAgeGeneral: 30,
  ageRelaxation: { OBC: 3, SC: 5, ST: 5, EWS: 0, PwD: 5 },
  requiredEducation: ["10th", "12th", "diploma", "graduate", "postgraduate"],
  nationality: ["Indian"],
  officialNotificationNoteEn: "Eligibility criteria are based on standard government notifications. Always consult the official notification.",
  officialNotificationNoteHi: "पात्रता मानदंड सामान्य अधिसूचना पर आधारित हैं। कृपया आधिकारिक अधिसूचना देखें।",
};

export function getEligibilityRule(examId: string): FormEligibilityRule {
  return ELIGIBILITY_RULES[examId] || DEFAULT_RULE;
}

export function calculateAge(dobIso: string): number {
  if (!dobIso) return 0;
  const dob = new Date(dobIso);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function evaluateEligibility(
  examId: string,
  user: UserEligibilityInput
): {
  overallStatus: "satisfied" | "needs_confirmation" | "not_satisfied";
  criteria: EligibilityCriteriaResult[];
  officialNoticeEn: string;
  officialNoticeHi: string;
} {
  const rule = getEligibilityRule(examId);
  const criteria: EligibilityCriteriaResult[] = [];
  const age = calculateAge(user.dob);

  // 1. Nationality Check
  if (rule.nationality.includes(user.nationality)) {
    criteria.push({
      id: "nationality",
      criterionEn: "Nationality / Citizenship",
      criterionHi: "नागरिकता",
      status: "satisfied",
      userAnswer: user.nationality,
      requirementEn: "Citizen of India",
      requirementHi: "भारत का नागरिक",
      explanationEn: "Based on the information provided, you appear to meet the citizenship criterion.",
      explanationHi: "दी गई जानकारी के अनुसार आप नागरिकता मानदंड को पूरा करते प्रतीत होते हैं।",
    });
  } else {
    criteria.push({
      id: "nationality",
      criterionEn: "Nationality / Citizenship",
      criterionHi: "नागरिकता",
      status: "not_satisfied",
      userAnswer: user.nationality,
      requirementEn: "Citizen of India",
      requirementHi: "भारत का नागरिक",
      explanationEn: "This form generally requires Indian citizenship. Please verify special eligibility clauses in the official notification.",
      explanationHi: "इस फॉर्म के लिए भारतीय नागरिकता अपेक्षित है। कृपया आधिकारिक अधिसूचना देखें।",
    });
  }

  // 2. Age Check with Relaxation
  let allowedMaxAge = rule.maxAgeGeneral;
  if (user.category === "OBC") allowedMaxAge += rule.ageRelaxation.OBC;
  if (user.category === "SC") allowedMaxAge += rule.ageRelaxation.SC;
  if (user.category === "ST") allowedMaxAge += rule.ageRelaxation.ST;
  if (user.category === "EWS") allowedMaxAge += rule.ageRelaxation.EWS;
  if (user.isPwd) allowedMaxAge += rule.ageRelaxation.PwD;

  if (age >= rule.minAge && age <= allowedMaxAge) {
    criteria.push({
      id: "age",
      criterionEn: "Age Requirement",
      criterionHi: "आयु सीमा",
      status: "satisfied",
      userAnswer: `${age} years (Born: ${user.dob || "Provided"})`,
      requirementEn: `${rule.minAge} to ${allowedMaxAge} years (including ${user.category} relaxation)`,
      requirementHi: `${rule.minAge} से ${allowedMaxAge} वर्ष (${user.category} छूट सहित)`,
      explanationEn: `Based on your stated DOB, your calculated age (${age} years) appears to meet this criterion.`,
      explanationHi: `आपकी जन्मतिथि के अनुसार आपकी आयु (${age} वर्ष) इस मानदंड के अनुकूल प्रतीत होती है।`,
    });
  } else if (age < rule.minAge) {
    criteria.push({
      id: "age",
      criterionEn: "Age Requirement",
      criterionHi: "आयु सीमा",
      status: "not_satisfied",
      userAnswer: `${age} years`,
      requirementEn: `Minimum ${rule.minAge} years required`,
      requirementHi: `न्यूनतम ${rule.minAge} वर्ष आवश्यक`,
      explanationEn: `You appear to be under the minimum age of ${rule.minAge} years. Please verify the official notification cut-off date.`,
      explanationHi: `आप न्यूनतम आयु ${rule.minAge} वर्ष से कम प्रतीत होते हैं। कृपया अधिसूचना में कट-ऑफ तारीख देखें।`,
    });
  } else {
    criteria.push({
      id: "age",
      criterionEn: "Age Requirement",
      criterionHi: "आयु सीमा",
      status: "not_satisfied",
      userAnswer: `${age} years`,
      requirementEn: `Maximum ${allowedMaxAge} years for ${user.category}`,
      requirementHi: `${user.category} श्रेणी के लिए अधिकतम ${allowedMaxAge} वर्ष`,
      explanationEn: `Calculated age exceeds upper limit of ${allowedMaxAge} years for ${user.category}. Please check if any other relaxation applies.`,
      explanationHi: `आपकी आयु ${user.category} के लिए निर्धारित अधिकतम आयु सीमा से अधिक प्रतीत होती है।`,
    });
  }

  // 3. Educational Qualification Check
  const meetsEdu = rule.requiredEducation.includes(user.educationLevel);
  if (meetsEdu) {
    criteria.push({
      id: "education",
      criterionEn: "Educational Qualification",
      criterionHi: "शैक्षणिक योग्यता",
      status: "satisfied",
      userAnswer: user.educationLevel.toUpperCase(),
      requirementEn: rule.requiredEducation.join(" / ").toUpperCase(),
      requirementHi: rule.requiredEducation.join(" / ").toUpperCase(),
      explanationEn: "Your declared qualification level meets the eligibility baseline for this form.",
      explanationHi: "आपकी शैक्षणिक योग्यता इस फॉर्म के प्रारंभिक मानदंड को पूरा करती प्रतीत होती है।",
    });
  } else {
    criteria.push({
      id: "education",
      criterionEn: "Educational Qualification",
      criterionHi: "शैक्षणिक योग्यता",
      status: "not_satisfied",
      userAnswer: user.educationLevel.toUpperCase(),
      requirementEn: `Requires at least: ${rule.requiredEducation[0].toUpperCase()}`,
      requirementHi: `न्यूनतम आवश्यकता: ${rule.requiredEducation[0].toUpperCase()}`,
      explanationEn: "Based on the information provided, the required qualification level may not be satisfied.",
      explanationHi: "दी गई जानकारी के अनुसार आवश्यक शैक्षणिक योग्यता पूरी नहीं होती प्रतीत होती है।",
    });
  }

  // 4. Minimum Percentage if applicable
  if (rule.minPercentage) {
    const userPct = user.percentage ?? 0;
    if (userPct >= rule.minPercentage) {
      criteria.push({
        id: "percentage",
        criterionEn: "Minimum Marks / Percentage",
        criterionHi: "न्यूनतम अंक / प्रतिशत",
        status: "satisfied",
        userAnswer: `${userPct}%`,
        requirementEn: `Minimum ${rule.minPercentage}% required`,
        requirementHi: `न्यूनतम ${rule.minPercentage}% आवश्यक`,
        explanationEn: `Your score (${userPct}%) appears to meet the ${rule.minPercentage}% minimum threshold.`,
        explanationHi: `आपका स्कोर (${userPct}%) न्यूनतम सीमा को पूरा करता प्रतीत होता है।`,
      });
    } else if (userPct > 0) {
      criteria.push({
        id: "percentage",
        criterionEn: "Minimum Marks / Percentage",
        criterionHi: "न्यूनतम अंक / प्रतिशत",
        status: "not_satisfied",
        userAnswer: `${userPct}%`,
        requirementEn: `Minimum ${rule.minPercentage}% required`,
        requirementHi: `न्यूनतम ${rule.minPercentage}% आवश्यक`,
        explanationEn: `Reported percentage (${userPct}%) is below the listed benchmark of ${rule.minPercentage}%.`,
        explanationHi: `आपका प्रतिशत न्यूनतम आवश्यक प्रतिशत से कम प्रतीत होता है।`,
      });
    } else {
      criteria.push({
        id: "percentage",
        criterionEn: "Minimum Marks / Percentage",
        criterionHi: "न्यूनतम अंक / प्रतिशत",
        status: "needs_confirmation",
        userAnswer: "Not specified",
        requirementEn: `Minimum ${rule.minPercentage}% required`,
        requirementHi: `न्यूनतम ${rule.minPercentage}% आवश्यक`,
        explanationEn: "Please enter your qualifying percentage to confirm this criterion.",
        explanationHi: "इस मानदंड की पुष्टि के लिए कृपया अपने प्राप्तांक दर्ज करें।",
      });
    }
  }

  // 5. Form specific questions
  if (rule.formSpecificQuestions) {
    for (const q of rule.formSpecificQuestions) {
      const ans = user.customAnswers?.[q.id];
      if (ans === q.expectedValue) {
        criteria.push({
          id: q.id,
          criterionEn: q.questionEn,
          criterionHi: q.questionHi,
          status: "satisfied",
          userAnswer: "Yes",
          requirementEn: "Required",
          requirementHi: "अनिवार्य",
          explanationEn: q.explanationEn,
          explanationHi: q.explanationHi,
        });
      } else if (ans !== undefined) {
        criteria.push({
          id: q.id,
          criterionEn: q.questionEn,
          criterionHi: q.questionHi,
          status: "not_satisfied",
          userAnswer: "No",
          requirementEn: "Required",
          requirementHi: "अनिवार्य",
          explanationEn: q.explanationEn,
          explanationHi: q.explanationHi,
        });
      } else {
        criteria.push({
          id: q.id,
          criterionEn: q.questionEn,
          criterionHi: q.questionHi,
          status: "needs_confirmation",
          userAnswer: "Pending Response",
          requirementEn: "Required",
          requirementHi: "अनिवार्य",
          explanationEn: "Criteria requires your confirmation.",
          explanationHi: "इस मानदंड की पुष्टि आवश्यक है।",
        });
      }
    }
  }

  // Overall evaluation
  const hasNotSatisfied = criteria.some((c) => c.status === "not_satisfied");
  const hasNeedsConfirmation = criteria.some((c) => c.status === "needs_confirmation");

  let overallStatus: "satisfied" | "needs_confirmation" | "not_satisfied" = "satisfied";
  if (hasNotSatisfied) {
    overallStatus = "not_satisfied";
  } else if (hasNeedsConfirmation) {
    overallStatus = "needs_confirmation";
  }

  return {
    overallStatus,
    criteria,
    officialNoticeEn: rule.officialNotificationNoteEn,
    officialNoticeHi: rule.officialNotificationNoteHi,
  };
}

export const STORAGE_KEY_ELIGIBILITY_PREFIX = "easyform:eligibility:";

export function saveEligibilityState(examId: string, data: UserEligibilityInput) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${STORAGE_KEY_ELIGIBILITY_PREFIX}${examId}`, JSON.stringify(data));
  } catch {}
}

export function loadEligibilityState(examId: string): UserEligibilityInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY_ELIGIBILITY_PREFIX}${examId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
