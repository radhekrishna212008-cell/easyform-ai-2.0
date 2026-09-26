// "Explain This Field" Component for EasyForm AI 2.0
// Renders an accessible interactive helper button that explains complex or confusing form fields.

import { useState } from "react";
import { HelpCircle, Volume2, X, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { speakBilingual } from "@/lib/voice";

export type FieldExplanationKey =
  | "fatherOccupation"
  | "annualIncome"
  | "domicileState"
  | "categorySubcaste"
  | "aadhaarNumber"
  | "rollNumberVsReg"
  | "ewsValidity"
  | "disabilityPercentage"
  | "identificationMark";

const FIELD_EXPLANATIONS: Record<
  FieldExplanationKey,
  {
    titleEn: string;
    titleHi: string;
    textEn: string;
    textHi: string;
    tipEn: string;
    tipHi: string;
  }
> = {
  fatherOccupation: {
    titleEn: "Father's / Guardian's Occupation",
    titleHi: "पिता / अभिभावक का व्यवसाय",
    textEn: "This field asks for the current occupation of your father or primary guardian. Choose or type the option that accurately describes their work (e.g., Agriculture, Government Service, Private Job, Business, or Retired).",
    textHi: "यह फ़ील्ड आपके पिता या अभिभावक के वर्तमान कार्य/व्यवसाय के बारे में पूछती है। जो विकल्प उनके कार्य से मेल खाता हो उसे चुनें (जैसे: कृषि, सरकारी नौकरी, निजी नौकरी, व्यापार)।",
    tipEn: "If deceased or unemployed, write 'Late' or 'None' according to the portal's dropdown instructions.",
    tipHi: "यदि स्वर्गवासी हैं, तो ड्रॉपडाउन के निर्देशानुसार भरें।",
  },
  annualIncome: {
    titleEn: "Annual Family Gross Income",
    titleHi: "वार्षिक पारिवारिक सकल आय",
    textEn: "Enter the combined annual income of all earning members of your household from all sources (salary, agriculture, business).",
    textHi: "अपने परिवार के सभी कमाने वाले सदस्यों की सभी स्रोतों (वेतन, कृषि, व्यापार) से मिलाकर होने वाली कुल वार्षिक आय दर्ज करें।",
    tipEn: "This must match the figure on your valid Tehsil/SDM issued Income Certificate for reservation/fee-waiver claims.",
    tipHi: "यह राशि आपके आय प्रमाणपत्र (Income Certificate) पर दर्ज राशि से हूबहू मेल खानी चाहिए।",
  },
  domicileState: {
    titleEn: "State of Domicile / Residence",
    titleHi: "मूल निवास राज्य",
    textEn: "The state where you are permanently settled and hold a legal Domicile / Residence Certificate (Mool Niwas Praman Patra).",
    textHi: "वह राज्य जहाँ आप स्थायी रूप से निवास करते हैं और जिसके लिए आपका मूल निवास प्रमाणपत्र बना हुआ है।",
    tipEn: "This determines your eligibility for State Reservation Quota seats.",
    tipHi: "यह राज्य स्तरीय आरक्षण सीटों की पात्रता तय करता है।",
  },
  categorySubcaste: {
    titleEn: "Sub-Caste / Community Name",
    titleHi: "उप-जाति / समुदाय का नाम",
    textEn: "Enter the exact caste or sub-caste name as officially spelled on your Category Certificate (OBC / SC / ST).",
    textHi: "अपनी जाति या उप-जाति का वही नाम लिखें जो आपके जाति प्रमाणपत्र पर दर्ज है।",
    tipEn: "For central government forms (like SSC/UPSC), ensure your caste is listed in the Central OBC list.",
    tipHi: "केंद्रीय फॉर्म के लिए सुनिश्चित करें कि आपकी जाति केंद्रीय सूची (Central List) में शामिल हो।",
  },
  aadhaarNumber: {
    titleEn: "Aadhaar Card Number",
    titleHi: "आधार कार्ड संख्या",
    textEn: "Your 12-digit unique identification number. In EasyForm AI, it is stored strictly on your local browser and masked for privacy.",
    textHi: "आपका 12 अंकों का विशिष्ट पहचान नंबर। EasyForm AI में यह केवल आपके फ़ोन/कंप्यूटर में सुरक्षित रहता है।",
    tipEn: "Ensure your name and date of birth in Aadhaar match your Class 10th marksheet.",
    tipHi: "ध्यान रहे कि आधार में आपका नाम व जन्मतिथि 10वीं की मार्कशीट से मेल खाती हो।",
  },
  rollNumberVsReg: {
    titleEn: "Roll Number vs Registration Number",
    titleHi: "रोल नंबर बनाम रजिस्ट्रेशन नंबर",
    textEn: "Roll Number is the exam seat number printed on your admit card/marksheet. Registration Number is the unique student enrolment number issued by your school/board.",
    textHi: "रोल नंबर वह संख्या है जिस पर आपने परीक्षा दी थी। रजिस्ट्रेशन नंबर बोर्ड/विश्वविद्यालय द्वारा जारी छात्र पंजीकरण संख्या होती है।",
    tipEn: "Check your 10th marksheet carefully: Roll No. and Enrolment/Registration No. are printed in different columns.",
    tipHi: "10वीं की मार्कशीट पर रोल नंबर और रजिस्ट्रेशन नंबर अलग-अलग कॉलम में होते हैं।",
  },
  ewsValidity: {
    titleEn: "EWS Certificate Validity Year",
    titleHi: "EWS प्रमाणपत्र की वैधता",
    textEn: "EWS certificates are valid for the Financial Year (April 1 to March 31) following the gross family income evaluation year.",
    textHi: "EWS प्रमाणपत्र वित्तीय वर्ष (1 अप्रैल से 31 मार्च) के लिए मान्य होता है।",
    tipEn: "Most national exams require the EWS certificate to be issued in the current financial year.",
    tipHi: "अधिकांश राष्ट्रीय परीक्षाओं में चालू वित्तीय वर्ष का बना प्रमाणपत्र ही मान्य होता है।",
  },
  disabilityPercentage: {
    titleEn: "Disability Percentage (PwD / Divyangjan)",
    titleHi: "दिव्यांगता प्रतिशत",
    textEn: "The permanent impairment percentage certified on your UDID card or competent Medical Authority certificate.",
    textHi: "सक्षम चिकित्सा प्राधिकारी या UDID कार्ड द्वारा प्रमाणित दिव्यांगता का प्रतिशत।",
    tipEn: "Standard reservation benefits require 40% or higher permanent benchmark disability.",
    tipHi: "आरक्षण लाभ के लिए न्यूनतम 40% दिव्यांगता होना अनिवार्य है।",
  },
  identificationMark: {
    titleEn: "Visible Identification Mark",
    titleHi: "पहचान चिन्ह",
    textEn: "A permanent visible mark on your face, neck, or hands (e.g., 'A mole on right cheek', 'A cut mark on left forehead').",
    textHi: "चेहरे, गर्दन या हाथ पर कोई स्थायी निशान (जैसे: 'दाहिने गाल पर तिल' या 'माथे पर कट का निशान')।",
    tipEn: "Write 'None' only if you genuinely have no visible moles, scars, or marks.",
    tipHi: "यदि कोई स्पष्ट निशान नहीं है तभी 'None' या 'Nil' लिखें।",
  },
};

export function ExplainField({
  fieldKey,
  label,
}: {
  fieldKey: FieldExplanationKey;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [lang] = useLang();
  const info = FIELD_EXPLANATIONS[fieldKey];

  if (!info) return null;

  const title = lang === "hi" ? info.titleHi : info.titleEn;
  const text = lang === "hi" ? info.textHi : info.textEn;
  const tip = lang === "hi" ? info.tipHi : info.tipEn;

  const handleSpeak = () => {
    speakBilingual(info.textEn, info.textHi);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        title="Explain this field"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        <span>{label || (lang === "hi" ? "समझें" : "Explain")}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-card p-5 shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl gradient-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold">{title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <p className="leading-relaxed text-foreground">{text}</p>
              <div className="rounded-2xl bg-primary/10 p-3 text-xs text-primary">
                <span className="font-semibold">💡 Tip: </span>
                {tip}
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={handleSpeak}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-semibold hover:bg-muted"
              >
                <Volume2 className="h-4 w-4 text-primary" />
                {lang === "hi" ? "सुनें" : "Listen"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl gradient-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm"
              >
                {lang === "hi" ? "समझ गया" : "Got it"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
