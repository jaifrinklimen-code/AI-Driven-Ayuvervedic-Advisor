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
  nav_prakruti: {
    en: "Prakruti Diagnostic",
    hi: "प्रकृति परीक्षण",
    ta: "பிரகிருதி பரிசோதனை",
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
  abs_badge: {
    en: "Biological Diversity Act (2002 & 2023)",
    hi: "जैविक विविधता अधिनियम (2002 एवं 2023)",
    ta: "உயிரியல் பன்முகத்தன்மை சட்டம் (2002 & 2023)",
  },
  abs_title: {
    en: "ABS & Traditional Knowledge Terminal",
    hi: "ABS एवं पारंपरिक ज्ञान टर्मिनल",
    ta: "உயிரியல் பன்முகத்தன்மை மற்றும் பாரம்பரிய அறிவு தளம்",
  },
  abs_subtitle: {
    en: "Evaluate National Biodiversity Authority (NBA Form I/III) filings, SBB commercial intimation, and TKDL defensive prior-art pointers.",
    hi: "राष्ट्रीय जैव विविधता प्राधिकरण (NBA फॉर्म I/III) फाइलिंग, SBB सूचना और TKDL संदर्भों का मूल्यांकन करें।",
    ta: "தேசிய பல்லுயிர் ஆணையம் (NBA படிவம் I/III) மனுக்கள், மாநில பல்லுயிர் வாரிய அறிவிப்பு மற்றும் பாரம்பரிய அறிவு நூலக (TKDL) வழிகாட்டல்களை மதிப்பிடுங்கள்.",
  },
  bio_profile: {
    en: "Biological Resource Profile",
    hi: "जैविक संसाधन प्रोफ़ाइल",
    ta: "உயிரியல் வள விபரம்",
  },
  botanical_name: {
    en: "Resource Botanical / Sanskrit Name",
    hi: "संसाधन का वानस्पतिक / संस्कृत नाम",
    ta: "தாவரவியல் / சமஸ்கிருத பெயர்",
  },
  applicant_entity: {
    en: "Applicant Legal Entity Type",
    hi: "आवेदक कानूनी इकाई का प्रकार",
    ta: "விண்ணப்பதாரர் சட்டப்பூர்வ வகை",
  },
  indian_entity_opt: {
    en: "Indian Entity (Section 7 SBB Intimation Only)",
    hi: "भारतीय इकाई (केवल धारा 7 SBB सूचना)",
    ta: "இந்திய நிறுவனம் (பிரிவு 7 SBB தகவல் மட்டும்)",
  },
  foreign_entity_opt: {
    en: "Foreign Entity / Co. with Foreign Equity (Section 3 NBA Prior Approval Mandatory)",
    hi: "विदेशी इकाई / विदेशी पूंजी युक्त कंपनी (धारा 3 NBA पूर्व अनुमोदन अनिवार्य)",
    ta: "வெளிநாட்டு நிறுவனம் / முதலீடு (பிரிவு 3 NBA முன்அனுமதி கட்டாயம்)",
  },
  nri_opt: {
    en: "Non-Resident Indian (NRI / OCI)",
    hi: "अनिवासी भारतीय (NRI / OCI)",
    ta: "வெளிநாடு வாழ் இந்தியர் (NRI / OCI)",
  },
  resource_origin_label: {
    en: "Resource Biological Origin",
    hi: "संसाधन का जैविक उद्गम",
    ta: "உயிரியல் வளத்தின் மூலம்",
  },
  cultivated_opt: {
    en: "Cultivated / Agro-Farmed (Cultivator Exemption under Section 7)",
    hi: "कृषि-उत्पादित / खेती (धारा 7 के तहत छूट)",
    ta: "பயிரிடப்பட்டது / விவசாயம் (பிரிவு 7 கீழ் விலக்கு)",
  },
  wild_harvested_opt: {
    en: "Wild-Harvested / Forest Produce (Strict NBA/SBB Access Clearance)",
    hi: "जंगल से एकत्र / वन उत्पाद (सख्त NBA/SBB अनुमति आवश्यक)",
    ta: "காட்டு விளைபொருள் / காட்டில் சேகரிப்பு (கட்டாய NBA/SBB அனுமதி)",
  },
  mandi_commodity_opt: {
    en: "Commercial Mandi Commodity / Value Added (Section 40 Exemption)",
    hi: "व्यावसायिक मंडी वस्तु (धारा 40 छूट)",
    ta: "சந்தை வணிகப் பொருள் (பிரிவு 40 கீழ் விலக்கு)",
  },
  imported_opt: {
    en: "Imported from outside India",
    hi: "भारत के बाहर से आयातित",
    ta: "இந்தியாவிற்கு வெளியே இருந்து இறக்குமதி செய்யப்பட்டது",
  },
  commercial_purpose: {
    en: "Commercial Utilization Purpose",
    hi: "व्यावसायिक उपयोग का उद्देश्य",
    ta: "வணிக பயன்பாட்டின் நோக்கம்",
  },
  commercial_mfg_opt: {
    en: "Commercial Utilization / Manufacturing Drug",
    hi: "व्यावसायिक उपयोग / औषधि निर्माण",
    ta: "மருந்து உற்பத்தி / வணிகப் பயன்பாடு",
  },
  bio_survey_opt: {
    en: "Bio-Survey / Bio-Utilization",
    hi: "जैव सर्वेक्षण / जैव उपयोग",
    ta: "உயிரியல் ஆய்வு / பயன்பாடு",
  },
  patent_filing_opt: {
    en: "Filing Patent / IP Rights (Section 6 Form III Compulsory)",
    hi: "पेटेंट / बौद्धिक संपदा फाइलिंग (धारा 6 फॉर्म III अनिवार्य)",
    ta: "காப்புரிமை விண்ணப்பம் (பிரிவு 6 படிவம் III கட்டாயம்)",
  },
  academic_research_opt: {
    en: "Research / Academic Non-Commercial Study",
    hi: "अनुसंधान / गैर-व्यावसायिक अध्ययन",
    ta: "கல்வி ஆராய்ச்சி / வணிகமற்ற ஆய்வு",
  },
  tk_checkbox: {
    en: "Traditional Knowledge / Classical Monograph Involved",
    hi: "पारंपरिक ज्ञान / शास्त्रीय ग्रंथ का संदर्भ शामिल है",
    ta: "பாரம்பரிய அறிவு / சாஸ்திர நூல்கள் தொடர்பு கொண்டது",
  },
  eval_abs_btn: {
    en: "Evaluate Mandatory Statutory Filings",
    hi: "अनिवार्य वैधानिक फाइलिंग का मूल्यांकन करें",
    ta: "சட்டப்பூர்வ விண்ணப்பங்களை மதிப்பிடுங்கள்",
  },
  evaluating_abs: {
    en: "Evaluating NBA Compliance...",
    hi: "NBA अनुपालन का विश्लेषण जारी...",
    ta: "பல்லுயிர் விதிமுறைகளை ஆராய்கிறது...",
  },
  abs_audit_title: {
    en: "Run Biodiversity Clearance Audit",
    hi: "जैव विविधता क्लीयरेंस ऑडिट चलाएं",
    ta: "பல்லுயிர் அனுமதி ஆய்வை இயக்கவும்",
  },
  abs_audit_desc: {
    en: "Specify whether biological material was wild-harvested or cultivated to determine Section 6 / Section 7 NBA filing mandates.",
    hi: "धारा 6 / धारा 7 के तहत आवश्यक फॉर्म निर्धारित करने के लिए सामग्री का विवरण चुनें।",
    ta: "பிரிவு 6 / 7 விதிகளின் கீழ் தேவையான படிவங்களை அறிய மூலப்பொருளை தேர்வு செய்யவும்.",
  },
  compliance_flags_title: {
    en: "Statutory Compliance Flags",
    hi: "वैधानिक अनुपालन चेतावनी",
    ta: "சட்டப்பூர்வ எச்சரிக்கைகள்",
  },
  required_filings_title: {
    en: "Mandatory Statutory Filings Required",
    hi: "आवश्यक अनिवार्य वैधानिक फॉर्म",
    ta: "சமர்ப்பிக்க வேண்டிய கட்டாய படிவங்கள்",
  },
  tkdl_pointer_title: {
    en: "Traditional Knowledge Digital Library (TKDL) Pointer",
    hi: "पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL) संदर्भ",
    ta: "பாரம்பரிய அறிவு டிஜிட்டல் நூலக (TKDL) வழிகாட்டல்",
  },
  kiosk_hardware_title: {
    en: "IP-SAKTI Smart Kiosk Simulator",
    hi: "IP-SAKTI स्मार्ट कियोस्क सिम्युलेटर",
    ta: "IP-SAKTI ஸ்மார்ட் கியோஸ்க் மாதிரி",
  },
  kiosk_hardware_sub: {
    en: "Tactile hardware kiosk interface designed for deployment across Ayurvedic colleges, incubation centers, and herbal farmer mandis.",
    hi: "आयुर्वेदिक कॉलेजों, ऊष्मायन केंद्रों और किसान मंडियों के लिए स्पर्श-सुलभ हार्डवेयर इंटरफ़ेस।",
    ta: "ஆயுர்வேத கல்லூரிகள், ஆராய்ச்சி மையங்கள் மற்றும் மூலிகை விவசாயிகளுக்கான தொடுதிரை கியோஸ்க் இடைமுகம்.",
  },
  physical_layer_badge: {
    en: "Accessible Physical Deployment Layer",
    hi: "सुलभ भौतिक उपकरण प्रणाली",
    ta: "நேரடி பயன்பாட்டுக்கான உபகரணம்",
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
