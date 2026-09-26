import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — EasyForm" },
      {
        name: "description",
        content:
          "How EasyForm collects, uses, stores, protects, and deletes your data. EasyForm is a guidance app and is not affiliated with any government organization.",
      },
    ],
  }),
  component: Privacy,
});

const EN = [
  {
    h: "About EasyForm",
    p: "EasyForm is an independent form guidance and document verification platform. EasyForm is NOT affiliated with, endorsed by, or connected to any government organization, ministry, board, or official examination authority. All trademarks and exam names belong to their respective owners.",
  },
  {
    h: "What we collect",
    p: "We collect only the information you choose to provide: profile details (name, date of birth, contact, address, ID numbers) and documents you upload (photos, signatures, marksheets, ID cards). Voice input is processed by your browser's speech engine and is not recorded by us.",
  },
  {
    h: "How we use it",
    p: "Your data is used solely to guide you through form preparation and to run automated verification checks on your uploaded documents (format, size, clarity). We do not sell, rent, or share your information with advertisers or third parties.",
  },
  {
    h: "Where it's stored",
    p: "Your profile, uploaded documents, and reminder preferences are stored locally in your device's browser storage. They never leave your device unless you explicitly export or share them.",
  },
  {
    h: "How we protect it",
    p: "Because your data stays on your device, only you control it. We recommend using a passcode or biometric lock on your device. Clearing your browser data will remove all EasyForm information.",
  },
  {
    h: "Deletion on request",
    p: "You can delete your data at any time by clearing your saved profile and uploaded documents from inside the app, or by clearing this site's storage in your browser settings. Once cleared, the data cannot be recovered by us.",
  },
  {
    h: "Children",
    p: "EasyForm is intended for users above the legal age for the forms they are preparing. Younger users should use the app with a parent or guardian.",
  },
  {
    h: "Contact",
    p: "For privacy questions, please reach out to the EasyForm support channel listed in the app store or website where you obtained EasyForm.",
  },
];

const HI = [
  {
    h: "EasyForm के बारे में",
    p: "EasyForm एक स्वतंत्र फॉर्म मार्गदर्शन और दस्तावेज़ सत्यापन प्लेटफ़ॉर्म है। EasyForm किसी भी सरकारी संस्था, मंत्रालय, बोर्ड या आधिकारिक परीक्षा प्राधिकरण से संबद्ध, समर्थित या जुड़ा हुआ नहीं है।",
  },
  {
    h: "हम क्या एकत्र करते हैं",
    p: "हम केवल वही जानकारी एकत्र करते हैं जो आप स्वयं देते हैं: प्रोफ़ाइल विवरण (नाम, जन्म तिथि, संपर्क, पता, पहचान संख्या) और आपके अपलोड किए गए दस्तावेज़ (फोटो, हस्ताक्षर, मार्कशीट, पहचान पत्र)। वॉइस इनपुट आपके ब्राउज़र द्वारा संसाधित होता है, हम उसे रिकॉर्ड नहीं करते।",
  },
  {
    h: "हम इसका उपयोग कैसे करते हैं",
    p: "आपके डेटा का उपयोग केवल फॉर्म तैयारी में मार्गदर्शन और अपलोड किए गए दस्तावेज़ों की स्वचालित जांच (फॉर्मेट, साइज़, स्पष्टता) के लिए होता है। हम आपकी जानकारी बेचते या साझा नहीं करते।",
  },
  {
    h: "यह कहाँ संग्रहीत है",
    p: "आपकी प्रोफ़ाइल, दस्तावेज़ और रिमाइंडर सेटिंग्स केवल आपके डिवाइस के ब्राउज़र स्टोरेज में रहती हैं। ये कभी आपके डिवाइस से बाहर नहीं जातीं।",
  },
  {
    h: "सुरक्षा",
    p: "चूँकि डेटा आपके डिवाइस पर ही रहता है, उसका नियंत्रण केवल आपके पास है। हम अनुशंसा करते हैं कि आप अपने डिवाइस पर पासकोड या बायोमेट्रिक लॉक का उपयोग करें।",
  },
  {
    h: "हटाने का अनुरोध",
    p: "आप कभी भी ऐप के अंदर से अपनी सेव की गई प्रोफ़ाइल और दस्तावेज़ हटा सकते हैं, या ब्राउज़र सेटिंग्स से इस साइट का स्टोरेज क्लियर कर सकते हैं।",
  },
  {
    h: "बच्चे",
    p: "EasyForm का उपयोग केवल उन्हीं उपयोगकर्ताओं के लिए है जो जिस फॉर्म की तैयारी कर रहे हैं, उसकी निर्धारित आयु से ऊपर हों।",
  },
  {
    h: "संपर्क",
    p: "गोपनीयता संबंधी प्रश्नों के लिए कृपया EasyForm सहायता चैनल से संपर्क करें।",
  },
];

function Privacy() {
  const [lang] = useLang();
  const data = lang === "hi" ? HI : EN;
  return (
    <AppShell title={lang === "hi" ? "गोपनीयता नीति" : "Privacy Policy"} back="/">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {lang === "hi" ? "गोपनीयता नीति" : "Privacy Policy"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {lang === "hi" ? "अंतिम अपडेट: जून 2026" : "Last updated: June 2026"}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {data.map((s) => (
          <section key={s.h} className="rounded-2xl glass p-4 shadow-card">
            <h2 className="text-sm font-semibold">{s.h}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>

      <p className="mt-6 rounded-xl border border-dashed border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
        {lang === "hi"
          ? "EasyForm एक मार्गदर्शन ऐप है — किसी भी सरकारी संस्था से संबद्ध नहीं।"
          : "EasyForm is a guidance app — not affiliated with any government body."}
      </p>
    </AppShell>
  );
}
