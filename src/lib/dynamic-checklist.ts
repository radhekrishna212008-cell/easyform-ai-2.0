// Dynamic Document Checklist Generator for EasyForm AI 2.0
// Produces tailored document requirements classified into REQUIRED, CONDITIONAL, and OPTIONAL
// based on selected form, user answers (category, qualification, PwD, income, state).

import { getRequirements, type DocReq } from "@/lib/requirements";
import type { UserEligibilityInput } from "@/lib/eligibility";
import { loadProfile } from "@/lib/profile";

export type ChecklistTier = "REQUIRED" | "CONDITIONAL" | "OPTIONAL";

export type ChecklistItem = {
  doc: DocReq;
  tier: ChecklistTier;
  reasonEn: string;
  reasonHi: string;
  conditionMet: boolean;
};

export function generateDynamicChecklist(
  examId: string,
  eligibilityInput?: UserEligibilityInput | null
): {
  required: ChecklistItem[];
  conditional: ChecklistItem[];
  optional: ChecklistItem[];
  allApplicable: DocReq[];
} {
  const baseDocs = getRequirements(examId);
  const profile = typeof window !== "undefined" ? loadProfile() : null;

  const userCat = eligibilityInput?.category || "General";
  const userEdu = eligibilityInput?.educationLevel || "graduate";
  const isPwd = eligibilityInput?.isPwd || false;

  const required: ChecklistItem[] = [];
  const conditional: ChecklistItem[] = [];
  const optional: ChecklistItem[] = [];

  for (const doc of baseDocs) {
    // 1. Mandatory Identity / Photo / Signature
    if (doc.id === "photo") {
      required.push({
        doc,
        tier: "REQUIRED",
        reasonEn: "Mandatory standard passport photograph with light background.",
        reasonHi: "हल्के बैकग्राउंड वाली अनिवार्य पासपोर्ट फोटो।",
        conditionMet: true,
      });
      continue;
    }

    if (doc.id === "sign") {
      required.push({
        doc,
        tier: "REQUIRED",
        reasonEn: "Mandatory applicant signature on white background.",
        reasonHi: "सफेद कागज पर अनिवार्य हस्ताक्षर।",
        conditionMet: true,
      });
      continue;
    }

    if (doc.id === "identity" || doc.id === "aadhaar") {
      required.push({
        doc,
        tier: "REQUIRED",
        reasonEn: "Government-issued identity verification.",
        reasonHi: "सरकारी पहचान प्रमाण पत्र।",
        conditionMet: true,
      });
      continue;
    }

    // 2. Category / Reservation Certificates
    if (doc.id === "categoryCert") {
      if (userCat === "SC" || userCat === "ST" || userCat === "OBC") {
        conditional.push({
          doc: {
            ...doc,
            nameEn: `${userCat} Category Certificate`,
            nameHi: `${userCat} श्रेणी प्रमाणपत्र`,
            hintEn: `Official Central/State ${userCat} certificate`,
            hintHi: `आधिकारिक ${userCat} प्रमाणपत्र`,
          },
          tier: "CONDITIONAL",
          reasonEn: `Required because you selected category '${userCat}' to claim age/fee relaxation.`,
          reasonHi: `आपने '${userCat}' श्रेणी चुनी है, अतः छूट के लिए यह प्रमाणपत्र आवश्यक है।`,
          conditionMet: true,
        });
      } else {
        optional.push({
          doc,
          tier: "OPTIONAL",
          reasonEn: "Applicable only if claiming category reservation.",
          reasonHi: "केवल आरक्षण का दावा करने पर लागू।",
          conditionMet: false,
        });
      }
      continue;
    }

    if (doc.id === "ews-certificate" || doc.id === "income") {
      if (userCat === "EWS" || examId.includes("scholarship") || examId === "nsp") {
        conditional.push({
          doc,
          tier: "CONDITIONAL",
          reasonEn: "Income / EWS verification is required for fee concession or scholarship eligibility.",
          reasonHi: "छात्रवृत्ति अथवा EWS आरक्षण के लिए आय प्रमाणपत्र आवश्यक है।",
          conditionMet: true,
        });
      } else {
        optional.push({
          doc,
          tier: "OPTIONAL",
          reasonEn: "Optional unless claiming financial reservation.",
          reasonHi: "आर्थिक आरक्षण का दावा न करने पर वैकल्पिक।",
          conditionMet: false,
        });
      }
      continue;
    }

    // 3. Marksheet & Qualifications
    if (doc.id === "marksheet10" || doc.id === "birth") {
      required.push({
        doc,
        tier: "REQUIRED",
        reasonEn: "Serves as mandatory proof of Date of Birth and matriculation.",
        reasonHi: "जन्म तिथि और 10वीं पास के आधिकारिक प्रमाण हेतु अनिवार्य।",
        conditionMet: true,
      });
      continue;
    }

    if (doc.id === "marksheet12") {
      if (userEdu !== "10th") {
        required.push({
          doc,
          tier: "REQUIRED",
          reasonEn: "Mandatory qualification certificate for Higher Secondary criteria.",
          reasonHi: "उच्चतर माध्यमिक योग्यता के सत्यापन हेतु अनिवार्य।",
          conditionMet: true,
        });
      } else {
        conditional.push({
          doc,
          tier: "CONDITIONAL",
          reasonEn: "Required if applying for posts demanding 10+2 qualification.",
          reasonHi: "12वीं स्तर के पदों के लिए आवश्यक।",
          conditionMet: false,
        });
      }
      continue;
    }

    if (doc.id === "graduation" || doc.id === "qualification") {
      if (userEdu === "graduate" || userEdu === "postgraduate") {
        required.push({
          doc,
          tier: "REQUIRED",
          reasonEn: "Degree / provisional certificate required for graduate level posts.",
          reasonHi: "स्नातक स्तरीय पदों के लिए डिग्री/मार्कशीट अनिवार्य।",
          conditionMet: true,
        });
      } else {
        conditional.push({
          doc,
          tier: "CONDITIONAL",
          reasonEn: "Required if you possess a degree or higher qualification.",
          reasonHi: "यदि स्नातक हैं तो डिग्री संलग्न करना आवश्यक।",
          conditionMet: false,
        });
      }
      continue;
    }

    // 4. Default classification
    required.push({
      doc,
      tier: "REQUIRED",
      reasonEn: "Required for this form's submission verification.",
      reasonHi: "इस फॉर्म के सत्यापन हेतु अनिवार्य।",
      conditionMet: true,
    });
  }

  // 5. PwD Certificate if user marked PwD
  if (isPwd) {
    conditional.push({
      doc: {
        id: "pwd-certificate",
        nameEn: "PwD / Disability Certificate",
        nameHi: "दिव्यांगता प्रमाणपत्र (PwD)",
        hintEn: "Civil Surgeon / Medical Board issued (40%+ disability)",
        hintHi: "मेडिकल बोर्ड द्वारा जारी 40%+ प्रमाणपत्र",
        accept: "image/jpeg,image/png,application/pdf",
        iconKey: "file",
      },
      tier: "CONDITIONAL",
      reasonEn: "Required to claim PwD reservation & age/scribe relaxation.",
      reasonHi: "दिव्यांगता आरक्षण व छूट के सत्यापन हेतु आवश्यक।",
      conditionMet: true,
    });
  }

  // 6. Domicile Certificate if state quota relevant
  if (eligibilityInput?.state) {
    optional.push({
      doc: {
        id: "domicile",
        nameEn: "Domicile / State Residence Certificate",
        nameHi: "मूल निवास प्रमाणपत्र",
        hintEn: "Issued by competent Tehsildar / SDM",
        hintHi: "तहसीलदार / एसडीएम द्वारा जारी",
        accept: "image/jpeg,image/png,application/pdf",
        iconKey: "address",
      },
      tier: "OPTIONAL",
      reasonEn: `Helpful for claiming ${eligibilityInput.state} state domicile quota.`,
      reasonHi: `राज्य आरक्षण कोटे के सत्यापन में सहायक।`,
      conditionMet: true,
    });
  }

  // Compile all applicable docs that the user actually needs to upload
  const allApplicable = [
    ...required.map((i) => i.doc),
    ...conditional.filter((i) => i.conditionMet).map((i) => i.doc),
  ];

  return {
    required,
    conditional,
    optional,
    allApplicable,
  };
}
