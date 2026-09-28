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
  supplementary_sources: {
    en: "Supplementary Sources",
    hi: "पूरक संदर्भ",
    ta: "கூடுதல் மூலங்கள்",
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

  // ABS Clearance Engine & Kiosk UI
  resource_source: {
    en: "Resource Origin / Source",
    hi: "संसाधन का स्रोत / उत्पत्ति",
    ta: "வளத்தின் தோற்றம் / ஆதாரம்",
  },
  intended_purpose: {
    en: "Intended Activity / Purpose",
    hi: "उद्देश्य / गतिविधि",
    ta: "உத்தேசிக்கப்பட்ட செயல்பாடு / நோக்கம்",
  },
  entity_indian: {
    en: "Indian Entity / Resident Citizen",
    hi: "भारतीय संस्था / निवासी नागरिक",
    ta: "இந்திய நிறுவனம் / குடிமகன்",
  },
  entity_foreign: {
    en: "Foreign Entity / Non-Resident / Overseas Company",
    hi: "विदेशी संस्था / अनिवासी / विदेशी कंपनी",
    ta: "வெளிநாட்டு நிறுவனம் / வெளிநாட்டு நிறுவனம்",
  },
  entity_nri: {
    en: "Non-Resident Indian (NRI)",
    hi: "अनिवासी भारतीय (NRI)",
    ta: "வெளிநாடு வாழ் இந்தியர் (NRI)",
  },
  source_cultivated: {
    en: "Cultivated / Farm Harvested",
    hi: "कृषि योग्य / खेत से काटा गया",
    ta: "பயிரிடப்பட்டது / பண்ணை அறுவடை",
  },
  source_wild: {
    en: "Wild Harvested / Forest Origin",
    hi: "वन्य संग्रह / वन उत्पत्ति",
    ta: "காட்டு வளர்ப்பு / வனத் தோற்றம்",
  },
  source_market: {
    en: "Market Commodity / Commercial Supply",
    hi: "बाजार वस्तु / वाणिज्यिक आपूर्ति",
    ta: "சந்தை பொருள் / வணிக விநியோகம்",
  },
  source_imported: {
    en: "Imported Biological Material",
    hi: "आयातित जैविक सामग्री",
    ta: "இறக்குமதி செய்யப்பட்ட உயிரியல் பொருள்",
  },
  purpose_commercial: {
    en: "Commercial Utilization & Manufacture",
    hi: "वाणिज्यिक उपयोग एवं निर्माण",
    ta: "வணிக பயன்பாடு மற்றும் உற்பத்தி",
  },
  purpose_research: {
    en: "Scientific Research & Development",
    hi: "वैज्ञानिक अनुसंधान एवं विकास",
    ta: "அறிவியல் ஆராய்ச்சி & வளர்ச்சி",
  },
  purpose_ip: {
    en: "Intellectual Property / Patent Application",
    hi: "बौद्धिक संपदा / पेटेंट आवेदन",
    ta: "அறிவுசார் சொத்துரிமை / காப்புரிமை விண்ணப்பம்",
  },
  purpose_bio: {
    en: "Bio-survey & Bio-utilization",
    hi: "जैव सर्वेक्षण एवं उपयोग",
    ta: "உயிரியல் கணக்கெடுப்பு & பயன்பாடு",
  },
  tk_involved: {
    en: "Associated Traditional Knowledge (TK) Involved",
    hi: "संबद्ध पारंपरिक ज्ञान (TK) शामिल है",
    ta: "தொடர்புடைய பாரம்பரிய அறிவு (TK) சேர்க்கப்பட்டுள்ளது",
  },
  evaluate_btn: {
    en: "Evaluate Statutory ABS Compliance",
    hi: "वैधानिक ABS अनुपालन का मूल्यांकन करें",
    ta: "சட்டப்பூர்வ ABS இணக்கத்தை மதிப்பிடுங்கள்",
  },
  evaluating: {
    en: "Evaluating Compliance Profile...",
    hi: "अनुपालन का मूल्यांकन हो रहा है...",
    ta: "மதிப்பீடு செய்யப்படுகிறது...",
  },
  no_result_msg: {
    en: "Configure biological resource profile to run automated NBA compliance assessment.",
    hi: "स्वचालित NBA अनुपालन मूल्यांकन चलाने के लिए जैविक संसाधन प्रोफ़ाइल कॉन्फ़िगर करें।",
    ta: "தானியங்கி NBA இணக்க மதிப்பீட்டை இயக்க உயிரியல் வள விவரக்குறிப்பை உள்ளிடவும்.",
  },
  statutory_status: {
    en: "Statutory ABS Compliance Assessment",
    hi: "वैधानिक ABS अनुपालन मूल्यांकन",
    ta: "சட்டப்பூர்வ ABS இணக்க மதிப்பீடு",
  },
  competent_authority: {
    en: "Competent Statutory Authority",
    hi: "सक्षम वैधानिक प्राधिकरण",
    ta: "தகுதியான சட்டப்பூர்வ அதிகாரம்",
  },
  statutory_obligations: {
    en: "Statutory Obligations & Compliance Flags",
    hi: "वैधानिक दायित्व एवं अनुपालन संकेत",
    ta: "சட்டப்பூர்வ கடமைகள் மற்றும் இணக்க எச்சரிக்கைகள்",
  },
  mandatory_filings: {
    en: "Mandatory Statutory Filings Required",
    hi: "अनिवार्य वैधानिक आवेदन आवश्यक",
    ta: "கட்டாய சட்டப்பூர்வ ஆவணத் தாக்கல்",
  },
  governing_statutes: {
    en: "Governing Statutes & Legal Provisions",
    hi: "शासी कानून एवं कानूनी प्रावधान",
    ta: "நிர்வகிக்கும் சட்டங்கள் & சட்ட விதிகள்",
  },
  tkdl_status_title: {
    en: "TKDL & Public Domain Verification",
    hi: "TKDL एवं सार्वजनिक डोमेन सत्यापन",
    ta: "TKDL & பொதுக் களச் சரிபார்ப்பு",
  },
  api_error_title: {
    en: "Service Unavailable",
    hi: "सेवा अनुपलब्ध",
    ta: "சேவை கிடைக்கவில்லை",
  },
  api_error_desc: {
    en: "Unable to connect to the statutory guidance engine. Please verify the backend service is running and retry.",
    hi: "वैधानिक मार्गदर्शन इंजन से कनेक्ट करने में असमर्थ। कृपया जांचें कि बैकएंड सेवा चालू है और पुनः प्रयास करें।",
    ta: "சட்ட வழிகாட்டல் இயந்திரத்துடன் இணைக்க முடியவில்லை. பின்தள சேவை இயங்குகிறதா என்பதை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
  },
  retry_btn: {
    en: "Retry Query",
    hi: "पुनः प्रयास करें",
    ta: "மீண்டும் முயற்சிக்கவும்",
  },
  
  // FormulationClassifier keys
  fc_badge: { en: 'Statutory Diagnostic Laboratory', hi: 'वैधानिक नैदानिक प्रयोगशाला', ta: 'சட்டப்பூர்வ ஆய்வுக்கூடம்' },
  fc_title: { en: 'Formulation Classification Engine', hi: 'औषधि वर्गीकरण इंजन', ta: 'மருந்து வகைப்பாடு இயந்திரம்' },
  fc_subtitle: { en: 'Deduce the legal classification of your Ayurvedic product under the Drugs & Cosmetics Act, FSSAI, and CDSCO frameworks.', hi: 'औषधि एवं प्रसाधन सामग्री अधिनियम, FSSAI और CDSCO ढांचे के तहत अपने आयुर्वेदिक उत्पाद का कानूनी वर्गीकरण ज्ञात करें।', ta: 'மருந்து மற்றும் அழகுசாதன சட்டம், FSSAI மற்றும் CDSCO கட்டமைப்புகளின் கீழ் உங்கள் ஆயுர்வேத தயாரிப்பின் சட்ட வகைப்பாட்டை அறியவும்.' },
  fc_presets_title: { en: 'Instant Test Scenarios (1-Click Demonstration)', hi: 'त्वरित परीक्षण परिदृश्य (1-क्लिक प्रदर्शन)', ta: 'உடனடி சோதனை காட்சிகள் (1-கிளிக் செயல்விளக்கம்)' },
  fc_presets_hint: { en: 'Click any scenario to auto-fill statutory parameters', hi: 'वैधानिक मापदंड भरने के लिए किसी भी परिदृश्य पर क्लिक करें', ta: 'சட்ட அளவுருக்களை தானாக நிரப்ப ஏதேனும் ஒரு காட்சியை கிளிக் செய்யவும்' },
  fc_stage_of: { en: 'STAGE', hi: 'चरण', ta: 'நிலை' },
  fc_of: { en: 'OF', hi: 'का', ta: 'இல்' },
  fc_stage_ingredients: { en: 'Ingredients', hi: 'सामग्री', ta: 'பொருட்கள்' },
  fc_stage_lineage: { en: 'Classical Lineage', hi: 'शास्त्रीय वंशावली', ta: 'பாரம்பரிய வரிசை' },
  fc_stage_processing: { en: 'Processing & Use', hi: 'प्रसंस्करण एवं उपयोग', ta: 'பதப்படுத்தல் & பயன்பாடு' },
  fc_stage_certification: { en: 'Certification', hi: 'प्रमाणन', ta: 'சான்றிதழ்' },
  fc_s1_title: { en: 'Product Profile & Botanical Composition', hi: 'उत्पाद प्रोफ़ाइल एवं वानस्पतिक संरचना', ta: 'தயாரிப்பு விவரம் & தாவரவியல் கலவை' },
  fc_product_title: { en: 'Product Working Title', hi: 'उत्पाद का कार्यकारी नाम', ta: 'தயாரிப்பின் பெயர்' },
  fc_ingredients_label: { en: 'Botanical & Mineral Ingredients List', hi: 'वानस्पतिक एवं खनिज सामग्री सूची', ta: 'தாவர & கனிம பொருட்கள் பட்டியல்' },
  fc_ingredients_placeholder: { en: 'e.g. Ashwagandha (Withania somnifera), Brahmi (Bacopa monnieri), Jatamansi', hi: 'उदा. अश्वगंधा (Withania somnifera), ब्राह्मी (Bacopa monnieri), जटामांसी', ta: 'எ.கா. அஸ்வகந்தா (Withania somnifera), பிராமி (Bacopa monnieri), ஜடாமான்சி' },
  fc_continue_lineage: { en: 'Continue to Textual Lineage', hi: 'शास्त्रीय वंशावली पर जारी रखें', ta: 'நூல் வரிசைக்கு தொடரவும்' },
  fc_s2_title: { en: 'Textual Lineage & First Schedule Authority', hi: 'शास्त्रीय वंशावली एवं प्रथम अनुसूची प्राधिकरण', ta: 'நூல் வரிசை & முதல் அட்டவணை அதிகாரம்' },
  fc_classical_option: { en: 'Classical Ayurvedic Formulation', hi: 'शास्त्रीय आयुर्वेदिक योग', ta: 'பாரம்பரிய ஆயுர்வேத மருந்து' },
  fc_classical_desc: { en: 'Formula taken directly from Charaka Samhita, Sushruta Samhita, Sharangadhara, API, or First Schedule text.', hi: 'चरक संहिता, सुश्रुत संहिता, शारंगधर, API या प्रथम अनुसूची ग्रंथ से सीधे लिया गया सूत्र।', ta: 'சரக சம்ஹிதா, சுஸ்ருத சம்ஹிதா, சாரங்கதர, API அல்லது முதல் அட்டவணை நூலிலிருந்து நேரடியாக எடுக்கப்பட்ட சூத்திரம்.' },
  fc_novel_option: { en: 'Novel / Proprietary Formulation', hi: 'नवीन / मालिकाना योग', ta: 'புதிய / தனியுரிம மருந்து' },
  fc_novel_desc: { en: 'Newly developed herb combination, non-standard proportions, or proprietary extract ratios.', hi: 'नई विकसित जड़ी-बूटी संयोजन, गैर-मानक अनुपात, या मालिकाना अर्क अनुपात।', ta: 'புதிதாக உருவாக்கப்பட்ட மூலிகை கலவை, தரமற்ற விகிதங்கள் அல்லது தனியுரிம சாறு விகிதங்கள்.' },
  fc_text_ref: { en: 'Classical Text Reference', hi: 'शास्त्रीय ग्रंथ संदर्भ', ta: 'பாரம்பரிய நூல் குறிப்பு' },
  fc_text_ref_placeholder: { en: 'e.g. Charaka Samhita, Chikitsa Sthana, Chapter 1', hi: 'उदा. चरक संहिता, चिकित्सा स्थान, अध्याय 1', ta: 'எ.கா. சரக சம்ஹிதா, சிகிச்சா ஸ்தானம், அத்தியாயம் 1' },
  fc_modified_q: { en: 'Have you substantially modified the classical proportions, excipients, or extraction vehicle?', hi: 'क्या आपने शास्त्रीय अनुपात, सहायक पदार्थ, या निष्कर्षण विधि में महत्वपूर्ण बदलाव किए हैं?', ta: 'நீங்கள் பாரம்பரிய விகிதங்கள், துணைப்பொருட்கள் அல்லது சாறெடுக்கும் முறையை கணிசமாக மாற்றியுள்ளீர்களா?' },
  fc_back: { en: 'Back', hi: 'वापस', ta: 'பின்செல்' },
  fc_continue_processing: { en: 'Continue to Processing & Claims', hi: 'प्रसंस्करण एवं दावों पर जारी रखें', ta: 'பதப்படுத்தல் & உரிமைகளுக்கு தொடரவும்' },
  fc_s3_title: { en: 'Processing Standard & Intended Claims', hi: 'प्रसंस्करण मानक एवं अभीष्ट दावे', ta: 'பதப்படுத்தல் தரம் & நோக்கிய உரிமைகள்' },
  fc_therapeutic: { en: 'Therapeutic Medicinal Treatment', hi: 'चिकित्सा औषधीय उपचार', ta: 'சிகிச்சை மருத்துவ சிகிச்சை' },
  fc_therapeutic_desc: { en: 'Intended for disease diagnosis, mitigation, or cure under Chapter IV-A of Drugs & Cosmetics Act.', hi: 'औषधि एवं प्रसाधन सामग्री अधिनियम के अध्याय IV-A के तहत रोग निदान, शमन या उपचार हेतु।', ta: 'மருந்து & அழகுசாதன சட்டத்தின் அத்தியாயம் IV-A கீழ் நோய் கண்டறிதல், தணிப்பு அல்லது சிகிச்சைக்காக.' },
  fc_cosmetic: { en: 'Ayurvedic Cosmetic (Sec 3(aaa))', hi: 'आयुर्वेदिक प्रसाधन (धारा 3(aaa))', ta: 'ஆயுர்வேத அழகுசாதனம் (பிரிவு 3(aaa))' },
  fc_cosmetic_desc: { en: 'Topical beautifying, cleansing, hair/skin care with strictly no disease cure claims.', hi: 'बाहरी सौंदर्य, सफाई, बाल/त्वचा देखभाल, रोग निवारण का कोई दावा नहीं।', ta: 'மேற்பூச்சு அழகூட்டல், சுத்திகரிப்பு, முடி/தோல் பராமரிப்பு, நோய் குணப்படுத்தும் உரிமை இல்லை.' },
  fc_food: { en: 'Ayurveda-Aahar (Food / Supplement)', hi: 'आयुर्वेद-आहार (खाद्य / पूरक)', ta: 'ஆயுர்வேத-ஆஹார் (உணவு / சத்துணவு)' },
  fc_food_desc: { en: 'Food, dietary tea, biscuits, or beverage governed under FSSAI Ayurveda Aahar Regulations 2022.', hi: 'FSSAI आयुर्वेद आहार विनियमन 2022 के तहत खाद्य, आहार चाय, बिस्कुट या पेय।', ta: 'FSSAI ஆயுர்வேத ஆஹார் விதிகள் 2022 கீழ் உணவு, உணவுத் தேநீர், பிஸ்கட் அல்லது பானம்.' },
  fc_phyto: { en: 'Phytopharmaceutical Fraction', hi: 'फाइटोफार्मास्यूटिकल अंश', ta: 'தாவர மருந்துப் பிரிவு' },
  fc_phyto_desc: { en: 'Standardized extract with ≥4 verified analytical markers governed under CDSCO Rule 122E.', hi: 'CDSCO नियम 122E के तहत ≥4 सत्यापित विश्लेषणात्मक मार्करों वाला मानकीकृत अर्क।', ta: 'CDSCO விதி 122E கீழ் ≥4 சரிபார்க்கப்பட்ட பகுப்பாய்வு குறிகாட்டிகளுடன் கூடிய தரநிலை சாறு.' },
  fc_execute: { en: 'Execute Diagnostic Analysis', hi: 'नैदानिक विश्लेषण चलाएं', ta: 'ஆய்வு பகுப்பாய்வை இயக்கவும்' },
  fc_loading: { en: 'Evaluating Statutory Rules & First Schedule Precedents...', hi: 'वैधानिक नियमों एवं प्रथम अनुसूची मिसालों का मूल्यांकन...', ta: 'சட்ட விதிகள் & முதல் அட்டவணை முன்னுதாரணங்களை மதிப்பீடு செய்கிறது...' },
  fc_cert_title: { en: 'Official AI Diagnostic Certification', hi: 'आधिकारिक AI नैदानिक प्रमाणन', ta: 'அதிகாரப்பூர்வ AI ஆய்வு சான்றிதழ்' },
  fc_confidence: { en: 'CONFIDENCE', hi: 'विश्वसनीयता', ta: 'நம்பகத்தன்மை' },
  fc_stat_def: { en: 'Statutory Definition & Act', hi: 'वैधानिक परिभाषा एवं अधिनियम', ta: 'சட்ட வரையறை & சட்டம்' },
  fc_licensing_auth: { en: 'Licensing Authority:', hi: 'लाइसेंसिंग प्राधिकरण:', ta: 'உரிம ஆணையம்:' },
  fc_patent_eval: { en: 'Indian Patentability Evaluation', hi: 'भारतीय पेटेंटयोग्यता मूल्यांकन', ta: 'இந்திய காப்புரிமை தகுதி மதிப்பீடு' },
  fc_patentable: { en: 'Patentable with High Synergistic Proof', hi: 'उच्च सहक्रियात्मक प्रमाण के साथ पेटेंटयोग्य', ta: 'உயர் ஒருங்கிணைப்பு ஆதாரத்துடன் காப்புரிமை பெறத்தக்கது' },
  fc_barred: { en: 'Barred under Section 3(p) / Prior Art', hi: 'धारा 3(p) / पूर्व कला के तहत वर्जित', ta: 'பிரிவு 3(p) / முன் கலை கீழ் தடை செய்யப்பட்டது' },
  fc_licensing_roadmap: { en: 'Commercial Drug Licensing Roadmap', hi: 'व्यावसायिक औषधि लाइसेंसिंग मार्गदर्शिका', ta: 'வணிக மருந்து உரிம வழிகாட்டி' },
  fc_key_factors: { en: 'Statutory Deductive Factors', hi: 'वैधानिक निगमनात्मक कारक', ta: 'சட்ட அனுமான காரணிகள்' },
  fc_compliance: { en: 'Mandatory Compliance Actions', hi: 'अनिवार्य अनुपालन कार्रवाई', ta: 'கட்டாய இணக்க நடவடிக்கைகள்' },
  fc_reset: { en: 'Evaluate Another Product', hi: 'अन्य उत्पाद का मूल्यांकन करें', ta: 'மற்றொரு தயாரிப்பை மதிப்பிடுங்கள்' },

  // LandingPage keys
  lp_ribbon: { en: 'National Regulatory Intelligence Portal • Ministry of Ayush & AIIA', hi: 'राष्ट्रीय नियामक खुफिया पोर्टल • आयुष मंत्रालय एवं AIIA', ta: 'தேசிய ஒழுங்குமுறை நுண்ணறிவு தளம் • ஆயுஷ் அமைச்சகம் & AIIA' },
  lp_hero_title: { en: 'Ancient Ayurvedic Wisdom, Grounded in Precision Law.', hi: 'प्राचीन आयुर्वेदिक ज्ञान, सटीक कानून पर आधारित।', ta: 'பண்டைய ஆயுர்வேத ஞானம், துல்லியமான சட்டத்தில் நிலைநிறுத்தப்பட்டது.' },
  lp_hero_subtitle: { en: 'An enterprise-grade regulatory navigator that classifies Ayurvedic products, retrieves authoritative statutory law, calculates confidence, and prevents biopiracy across Indian and International regimes.', hi: 'एक उद्यम-श्रेणी नियामक नेविगेटर जो आयुर्वेदिक उत्पादों का वर्गीकरण करता है, प्रामाणिक कानून प्राप्त करता है, विश्वसनीयता की गणना करता है, और जैव चोरी रोकता है।', ta: 'ஆயுர்வேத தயாரிப்புகளை வகைப்படுத்தும், அதிகாரப்பூர்வ சட்டங்களை மீட்டெடுக்கும், நம்பகத்தன்மையை கணக்கிடும், உயிரிக் கொள்ளையை தடுக்கும் நிறுவன தர ஒழுங்குமுறை வழிகாட்டி.' },
  lp_search_placeholder: { en: 'Ask regulatory or formulation question (e.g. Can I patent Ashwagandha & Curcumin in India?)...', hi: 'नियामक या औषधि संबंधी प्रश्न पूछें (उदा. क्या मैं भारत में अश्वगंधा और हल्दी पर पेटेंट ले सकता हूँ?)...', ta: 'ஒழுங்குமுறை அல்லது மருந்து கேள்வி கேளுங்கள் (எ.கா. இந்தியாவில் அஸ்வகந்தா & மஞ்சளுக்கு காப்புரிமை பெற முடியுமா?)...' },
  lp_ask_engine: { en: 'Ask Engine', hi: 'इंजन से पूछें', ta: 'இயந்திரத்திடம் கேளுங்கள்' },
  lp_sample_inquiries: { en: 'Sample inquiries:', hi: 'उदाहरण प्रश्न:', ta: 'மாதிரி வினாக்கள்:' },
  lp_metric_directives: { en: 'Statutory Directives', hi: 'वैधानिक निर्देश', ta: 'சட்ட உத்தரவுகள்' },
  lp_metric_directives_sub: { en: '16 Gazette Acts & Treaties Indexed', hi: '16 राजपत्र अधिनियम एवं संधियां अनुक्रमित', ta: '16 அரசிதழ் சட்டங்கள் & ஒப்பந்தங்கள் குறியிடப்பட்டுள்ளன' },
  lp_metric_rag: { en: 'RAG Verification', hi: 'RAG सत्यापन', ta: 'RAG சரிபார்ப்பு' },
  lp_metric_rag_sub: { en: 'Ground Truth Citations with Zero Hallucination', hi: 'शून्य भ्रम के साथ मूल प्रमाणित उद्धरण', ta: 'பூஜ்ய மாயத்தோற்றத்துடன் அடிப்படை உண்மை மேற்கோள்கள்' },
  lp_metric_scope: { en: 'Cross-Border Scope', hi: 'सीमा-पार दायरा', ta: 'எல்லை தாண்டிய दायरा' },
  lp_metric_scope_sub: { en: 'Indian Domestic vs WIPO / TRIPS / Nagoya', hi: 'भारतीय घरेलू बनाम WIPO / TRIPS / नागोया', ta: 'இந்திய உள்நாட்டு vs WIPO / TRIPS / நகோயா' },
  lp_metric_abs: { en: 'ABS Clearance', hi: 'ABS क्लीयरेंस', ta: 'ABS அனுமதி' },
  lp_metric_abs_sub: { en: 'Automated NBA Section 6 Compliance Engine', hi: 'स्वचालित NBA धारा 6 अनुपालन इंजन', ta: 'தானியங்கி NBA பிரிவு 6 இணக்க இயந்திரம்' },
  lp_explore: { en: 'Explore Engine', hi: 'इंजन देखें', ta: 'இயந்திரத்தை ஆராயுங்கள்' },
  lp_precedents: { en: 'Statutory Precedents', hi: 'वैधानिक मिसालें', ta: 'சட்ட முன்னுதாரணங்கள்' },
  lp_real_world: { en: 'Real-World Regulatory Scenarios', hi: 'वास्तविक नियामक परिदृश्य', ta: 'நிஜ உலக ஒழுங்குமுறை சூழல்கள்' },
  lp_verdict: { en: 'Regulatory Verdict', hi: 'नियामक निर्णय', ta: 'ஒழுங்குமுறை தீர்ப்பு' },
  lp_hurdle: { en: 'Statutory Hurdle', hi: 'वैधानिक बाधा', ta: 'சட்டத் தடை' },
  lp_prerequisite: { en: 'Mandatory Prerequisite', hi: 'अनिवार्य पूर्वापेक्षा', ta: 'கட்டாய முன்நிபந்தனை' },
  lp_inspect: { en: 'Inspect Case in Studio', hi: 'स्टूडियो में केस जांचें', ta: 'ஸ்டூடியோவில் வழக்கை ஆராயுங்கள்' },
  lp_methodology: { en: 'Systematic Methodology', hi: 'व्यवस्थित कार्यप्रणाली', ta: 'முறையான வழிமுறை' },
  lp_5phase: { en: 'The 5-Phase Regulatory Journey', hi: '5-चरण नियामक यात्रा', ta: '5-கட்ட ஒழுங்குமுறை பயணம்' },
  lp_phase_intake: { en: 'Product Intake', hi: 'उत्पाद ग्रहण', ta: 'தயாரிப்பு உள்ளீடு' },
  lp_phase_classify: { en: 'Classification', hi: 'वर्गीकरण', ta: 'வகைப்பாடு' },
  lp_phase_search: { en: 'Statutory Search', hi: 'वैधानिक खोज', ta: 'சட்ட தேடல்' },
  lp_phase_abs: { en: 'ABS Clearance', hi: 'ABS क्लीयरेंस', ta: 'ABS அனுமதி' },
  lp_phase_verify: { en: 'Verification', hi: 'सत्यापन', ta: 'சரிபார்ப்பு' },

  // JurisdictionComparison keys
  jc_badge: { en: 'Dual-Regime Topology', hi: 'दोहरी-व्यवस्था टोपोलॉजी', ta: 'இரட்டை-ஆட்சி இடவியல்' },
  jc_title: { en: 'Jurisdiction Separation Navigator', hi: 'क्षेत्राधिकार पृथक्करण नेविगेटर', ta: 'அதிகார வரம்பு பிரிப்பு வழிகாட்டி' },
  jc_subtitle: { en: 'Visually isolating Indian Domestic Sovereignty from Multilateral International Treaties to prevent legal conflation.', hi: 'कानूनी भ्रम रोकने के लिए भारतीय घरेलू संप्रभुता को बहुपक्षीय अंतरराष्ट्रीय संधियों से दृश्यात्मक रूप से अलग करना।', ta: 'சட்ட குழப்பத்தை தவிர்க்க இந்திய உள்நாட்டு இறையாண்மையை பன்முக சர்வதேச ஒப்பந்தங்களிலிருந்து காட்சிப்படுத்தி பிரித்தல்.' },
  jc_filter_all: { en: 'All Regulatory Domains', hi: 'सभी नियामक क्षेत्र', ta: 'அனைத்து ஒழுங்குமுறை பகுதிகள்' },
  jc_filter_patent: { en: 'Patentability & TK Bars', hi: 'पेटेंटयोग्यता एवं TK प्रतिबंध', ta: 'காப்புரிமை தகுதி & TK தடைகள்' },
  jc_filter_bio: { en: 'Biodiversity & ABS', hi: 'जैव विविधता एवं ABS', ta: 'உயிரியல் பன்முகத்தன்மை & ABS' },
  jc_filter_ayush: { en: 'AYUSH & Licensing', hi: 'AYUSH एवं लाइसेंसिंग', ta: 'AYUSH & உரிமம்' },
  jc_national: { en: 'National Sovereign Regime', hi: 'राष्ट्रीय संप्रभु व्यवस्था', ta: 'தேசிய இறையாண்மை ஆட்சி' },
  jc_india_law: { en: 'India Domestic Law', hi: 'भारत घरेलू कानून', ta: 'இந்திய உள்நாட்டு சட்டம்' },
  jc_india_auth: { en: 'Ministry of Ayush • CGPDTM • National Biodiversity Authority', hi: 'आयुष मंत्रालय • CGPDTM • राष्ट्रीय जैव विविधता प्राधिकरण', ta: 'ஆயுஷ் அமைச்சகம் • CGPDTM • தேசிய பல்லுயிர் ஆணையம்' },
  jc_intl: { en: 'Multilateral Treaty Regime', hi: 'बहुपक्षीय संधि व्यवस्था', ta: 'பன்முக ஒப்பந்த ஆட்சி' },
  jc_intl_law: { en: 'International Frameworks', hi: 'अंतरराष्ट्रीय ढांचे', ta: 'சர்வதேச கட்டமைப்புகள்' },
  jc_intl_auth: { en: 'WIPO • WTO TRIPS • CBD Nagoya Protocol', hi: 'WIPO • WTO TRIPS • CBD नागोया प्रोटोकॉल', ta: 'WIPO • WTO TRIPS • CBD நகோயா நெறிமுறை' },
  jc_domestic: { en: 'Domestic', hi: 'घरेलू', ta: 'உள்நாட்டு' },
  jc_treaty: { en: 'Treaty', hi: 'संधि', ta: 'ஒப்பந்தம்' },
  jc_authority: { en: 'Authority:', hi: 'प्राधिकरण:', ta: 'அதிகாரம்:' },

  // AuthModal keys
  am_create_title: { en: 'Create IP-SAKTI Account', hi: 'IP-SAKTI खाता बनाएं', ta: 'IP-SAKTI கணக்கை உருவாக்கவும்' },
  am_access_title: { en: 'Access Regulatory Portal', hi: 'नियामक पोर्टल एक्सेस करें', ta: 'ஒழுங்குமுறை தளத்தை அணுகவும்' },
  am_secure_desc: { en: 'Secure authentication powered by Supabase with Row Level Security.', hi: 'Row Level Security के साथ Supabase द्वारा संचालित सुरक्षित प्रमाणीकरण।', ta: 'Row Level Security உடன் Supabase மூலம் இயக்கப்படும் பாதுகாப்பான அங்கீகாரம்.' },
  am_oneclick: { en: '1-Click Jury / Evaluator Sign-In', hi: '1-क्लिक निर्णायक / मूल्यांकनकर्ता साइन-इन', ta: '1-கிளிக் நடுவர் / மதிப்பீட்டாளர் உள்நுழைவு' },
  am_oneclick_desc: { en: 'Instant verification for competition judges & reviewers', hi: 'प्रतियोगिता निर्णायकों और समीक्षकों के लिए त्वरित सत्यापन', ta: 'போட்டி நடுவர்கள் & மதிப்பாய்வாளர்களுக்கான உடனடி சரிபார்ப்பு' },
  am_name: { en: 'Full Name', hi: 'पूरा नाम', ta: 'முழு பெயர்' },
  am_email: { en: 'Official Email', hi: 'आधिकारिक ईमेल', ta: 'அதிகாரப்பூர்வ மின்னஞ்சல்' },
  am_password: { en: 'Security Password', hi: 'सुरक्षा पासवर्ड', ta: 'பாதுகாப்பு கடவுச்சொல்' },
  am_signin_btn: { en: 'Sign In to Portal', hi: 'पोर्टल में साइन इन करें', ta: 'தளத்தில் உள்நுழையவும்' },
  am_signup_btn: { en: 'Create Account', hi: 'खाता बनाएं', ta: 'கணக்கை உருவாக்கவும்' },
  am_switch_signup: { en: 'Switch to Sign Up', hi: 'साइन अप पर जाएं', ta: 'பதிவுக்கு மாறவும்' },
  am_has_account: { en: 'Already have an account?', hi: 'पहले से खाता है?', ta: 'ஏற்கனவே கணக்கு உள்ளதா?' },
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
