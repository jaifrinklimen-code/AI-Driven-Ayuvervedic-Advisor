import React, { createContext, useContext, useState, useEffect } from "react";

export type SupportedLanguage = "en" | "hi" | "ta";

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    ta: string;
  };
}

const translations: Translations = {
  // Ministerial Banner
  portal_subtitle: {
    en: "Ministry of Ayush • All India Institute of Ayurveda (AIIA)",
    hi: "आयुष मंत्रालय • अखिल भारतीय आयुर्वेद संस्थान (AIIA)",
    ta: "ஆயுஷ் அமைச்சகம் • அகில இந்திய ஆயுர்வேத நிறுவனம் (AIIA)",
  },
  portal_role: {
    en: "Sovereign Intellectual Property & Regulatory Clearance Portal",
    hi: "संप्रभु बौद्धिक संपदा एवं नियामक क्लीयरेंस पोर्टल",
    ta: "அறிவுசார் சொத்துரிமை மற்றும் ஒழுங்குமுறை அனுமதி தளம்",
  },
  rag_active: {
    en: "Authoritative RAG Engine • Active",
    hi: "प्रामाणिक RAG इंजन • सक्रिय",
    ta: "நம்பகமான RAG இயந்திரம் • இயங்குகிறது",
  },
  sign_in: {
    en: "Sign In",
    hi: "साइन इन",
    ta: "உள்நுழைக",
  },
  sign_out: {
    en: "Sign Out",
    hi: "साइन आउट",
    ta: "வெளியேறு",
  },

  // Navbar
  nav_ask: {
    en: "Ask IP-SAKTI",
    hi: "पूछें IP-SAKTI",
    ta: "கேளுங்கள் IP-SAKTI",
  },
  nav_classify: {
    en: "Formulation Classifier",
    hi: "औषधि वर्गीकरण",
    ta: "மருந்து வகைப்பாடு",
  },
  nav_jurisdictions: {
    en: "Jurisdictions",
    hi: "क्षेत्राधिकार",
    ta: "அதிகார வரம்புகள்",
  },
  nav_abs: {
    en: "ABS & TKDL",
    hi: "जैव विविधता व TKDL",
    ta: "உயிரியல் பன்முகத்தன்மை",
  },
  nav_archive: {
    en: "Statutory Archive",
    hi: "कानूनी अभिलेखागार",
    ta: "சட்டக் காப்பகம்",
  },
  nav_kiosk: {
    en: "Smart Kiosk",
    hi: "स्मार्ट कियोस्क",
    ta: "ஸ்மார்ட் கியோஸ்க்",
  },
  nav_studio: {
    en: "Launch Studio",
    hi: "अनुसंधान स्टूडियो",
    ta: "ஆராய்ச்சி மையம்",
  },

  // Chatbot / Query Studio
  studio_badge: {
    en: "IP-SAKTI Regulatory Intelligence Studio",
    hi: "IP-SAKTI नियामक अनुसंधान केंद्र",
    ta: "IP-SAKTI ஒழுங்குமுறை நுண்ணறிவு மையம்",
  },
  studio_title: {
    en: "Statutory Research & Clearance Engine",
    hi: "वैधानिक अनुसंधान एवं नियामक क्लीयरेंस इंजन",
    ta: "சட்டப்பூர்வ ஆராய்ச்சி மற்றும் ஒழுங்குமுறை இயந்திரம்",
  },
  jurisdiction_label: {
    en: "Jurisdiction:",
    hi: "क्षेत्राधिकार:",
    ta: "அதிகார வரம்பு:",
  },
  india_domestic: {
    en: "India Domestic",
    hi: "भारत घरेलू कानून",
    ta: "இந்திய உள்நாட்டு சட்டம்",
  },
  intl_treaties: {
    en: "International Treaties",
    hi: "अंतर्राष्ट्रीय संधियां",
    ta: "சர்வதேச ஒப்பந்தங்கள்",
  },
  delivery_label: {
    en: "Delivery Language:",
    hi: "प्रतिक्रिया भाषा:",
    ta: "மொழித் தேர்வு:",
  },
  query_placeholder: {
    en: "Enter your formulation or regulatory query (e.g. Can I patent a novel Ayurvedic combination of Ashwagandha and Brahmi for cognitive health in India?)...",
    hi: "अपनी आयुर्वेदिक औषधि या पेटेंट संबंधी प्रश्न दर्ज करें (उदा. क्या मैं भारत में अश्वगंधा और ब्राह्मी के संयोजन पर पेटेंट प्राप्त कर सकता हूँ?)...",
    ta: "உங்கள் ஆயுர்வேத அல்லது ஒழுங்குமுறை கேள்வியை உள்ளிடவும் (எ.கா. இந்தியாவில் அஸ்வகந்தா மற்றும் பிராமி மருந்துக்கு காப்புரிமை பெற முடியுமா?)...",
  },
  submit_btn: {
    en: "Submit",
    hi: "जमा करें",
    ta: "சமர்ப்பிக்கவும்",
  },
  analyzing_btn: {
    en: "Analyzing...",
    hi: "विश्लेषण जारी...",
    ta: "ஆராய்கிறது...",
  },
  explore_graph: {
    en: "Explore Legal Nodes",
    hi: "कानूनी संबंध देखें",
    ta: "சட்ட வலைப்பின்னல்",
  },
  hide_graph: {
    en: "Hide Knowledge Graph",
    hi: "ज्ञान ग्राफ छिपाएं",
    ta: "வரைபடத்தை மறைக்கவும்",
  },
  dossiers_btn: {
    en: "Dossiers",
    hi: "अभिलेख",
    ta: "கோப்புகள்",
  },

  // Kiosk
  kiosk_badge: {
    en: "IP-SAKTI KIOSK OS V2.4 • STATION AIIA-01",
    hi: "IP-SAKTI कियोस्क OS V2.4 • स्टेशन AIIA-01",
    ta: "IP-SAKTI கியோஸ்க் OS V2.4 • நிலையம் AIIA-01",
  },
  kiosk_title: {
    en: "Touch to Ask IP-SAKTI",
    hi: "IP-SAKTI से पूछने के लिए स्पर्श करें",
    ta: "IP-SAKTI இடம் கேட்க தொடவும்",
  },
  kiosk_subtitle: {
    en: "Multi-lingual Voice Assistance in English, Hindi, and Tamil",
    hi: "अंग्रेजी, हिंदी और तमिल में बहुभाषी आवाज सहायता",
    ta: "ஆங்கிலம், இந்தி மற்றும் தமிழில் குரல் உதவி",
  },
  speak_btn: {
    en: "Tap to Speak Regulatory Inquiry",
    hi: "बोलने के लिए माइक दबाएं",
    ta: "பேச மைக்ரோஃபோனைத் தொடவும்",
  },
  simulate_audio: {
    en: "Simulate Audio Speech",
    hi: "मार्गदर्शन सुनें",
    ta: "வழிகாட்டலை உரக்கக் கேட்கவும்",
  },
  stop_audio: {
    en: "Stop Audio",
    hi: "ऑडियो रोकें",
    ta: "ஆடியோவை நிறுத்து",
  },
  mobile_handoff_title: {
    en: "Scan QR Code to save dossier",
    hi: "दस्तावेज़ सहेजने के लिए QR स्कैन करें",
    ta: "மொபைலில் சேமிக்க QR ஸ்கேன் செய்யவும்",
  },
  mobile_handoff_sub: {
    en: "Carries session history to phone",
    hi: "सत्र का विवरण फोन पर स्थानांतरित करता है",
    ta: "மொபைல் சாதனத்தில் தொடர்ந்து பார்க்கவும்",
  },
  inquiry_examples: {
    en: "Inquiry Examples:",
    hi: "उदाहरण प्रश्न:",
    ta: "உதாரண வினாக்கள்:",
  },
  statutory_verdict: {
    en: "Statutory Verdict & Finding",
    hi: "वैधानिक निर्णय एवं निष्कर्ष",
    ta: "சட்டப்பூர்வ தீர்ப்பு மற்றும் முடிவு",
  },
  applicable_regimes: {
    en: "Applicable IP Regimes",
    hi: "लागू बौद्धिक संपदा व्यवस्था",
    ta: "பொருந்தக்கூடிய காப்புரிமை முறைகள்",
  },
  regulatory_pathway: {
    en: "Regulatory Clearance Pathway",
    hi: "नियामक अनुमोदन मार्ग",
    ta: "ஒழுங்குமுறை அனுமதி பாதை",
  },
  biodiversity_abs: {
    en: "Biological Diversity & ABS Guidance",
    hi: "जैव विविधता एवं ABS मार्गदर्शन",
    ta: "உயிரியல் பன்முகத்தன்மை வழிகாட்டல்",
  },
  authoritative_citations: {
    en: "Authoritative Statutory Citations",
    hi: "प्रामाणिक वैधानिक संदर्भ",
    ta: "அங்கீகரிக்கப்பட்ட சட்ட மேற்கோள்கள்",
  },
  actionable_steps: {
    en: "Actionable Next Steps",
    hi: "आवश्यक आगामी कदम",
    ta: "அடுத்த கட்ட நடவடிக்கைகள்",
  },
  statutory_disclaimer: {
    en: "Statutory Legal Disclaimer",
    hi: "वैधानिक अस्वीकरण",
    ta: "சட்டப்பூர்வ மறுப்பு",
  },
  copy_finding: {
    en: "Copy Finding",
    hi: "प्रतिलिपि बनाएँ",
    ta: "நகலெடு",
  },
  export_dossier: {
    en: "Export Dossier",
    hi: "दस्तावेज़ निर्यात",
    ta: "கோப்பு ஏற்றுமதி",
  },
  bookmark: {
    en: "Bookmark",
    hi: "सहेजें",
    ta: "புக்மார்க்",
  },
  bookmarked: {
    en: "Saved",
    hi: "सहेजा गया",
    ta: "சேமிக்கப்பட்டது",
  },
  listen_response: {
    en: "Listen to Response",
    hi: "उत्तर सुनें",
    ta: "பதிலை உரக்கக் கேட்க",
  },
  pause_audio: {
    en: "Pause Audio",
    hi: "ऑडियो रोकें",
    ta: "ஆடியோவை நிறுத்து",
  },
  kiosk_instant_verdict: {
    en: "Instant Regulatory Classification",
    hi: "त्वरित नियामक वर्गीकरण",
    ta: "உடனடி ஒழுங்குமுறை வகைப்பாடு",
  },
  kiosk_spoken_response: {
    en: "Auditory Regulatory Verdict",
    hi: "ध्वनि नियामक निष्कर्ष",
    ta: "குரல் வழி ஒழுங்குமுறை முடிவு",
  },
  kiosk_analyzing: {
    en: "Analyzing Ayurvedic Regulatory Statutes...",
    hi: "आयुर्वेदिक नियमों का विश्लेषण हो रहा है...",
    ta: "ஆயுர்வேத ஒழுங்குமுறை சட்டங்களை ஆராய்கிறது...",
  },
  kiosk_tap_hint: {
    en: "Tap mic to speak your regulatory inquiry",
    hi: "अपनी जांच बोलने के लिए माइक दबाएं",
    ta: "உங்கள் ஒழுங்குமுறை கேள்வியைக் கேட்க மைக்கைத் தொடவும்",
  },
  read_statute: {
    en: "Read Statute",
    hi: "अधिनियम पढ़ें",
    ta: "சட்டத்தைப் படிக்க",
  },
  sha_verified: {
    en: "SHA-256 Verified Gazette",
    hi: "SHA-256 सत्यापित राजपत्र",
    ta: "SHA-256 சரிபார்க்கப்பட்ட அரசிதழ்",
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem("ipsakti_lang");
    if (saved === "en" || saved === "hi" || saved === "ta") return saved;
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("ipsakti_lang", language);
  }, [language]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
