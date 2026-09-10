import React, { useState, useEffect } from "react";
import { Navbar } from "../ui/Navbar";
import { Footer } from "../ui/Footer";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Mic,
  Volume2,
  VolumeX,
  Monitor
} from "lucide-react";
import { QRCodeCanvas } from "../ui/QRCodeCanvas";
import { useLanguage, SupportedLanguage } from "../../context/LanguageContext";
import { getApiUrl } from "../../lib/api";

interface ABSComplianceResult {
  resource_analyzed: string;
  overall_status: string;
  regulatory_authority: string;
  compliance_flags: Array<{
    severity: string;
    title: string;
    description: string;
  }>;
  required_statutory_filings: string[];
  applicable_statutes: string[];
  tkdl_guidance: {
    is_tkdl_public_domain: boolean;
    status_note: string;
    verification_step: string;
  };
  disclaimer: string;
}

export const ABSKioskPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [entityType, setEntityType] = useState("indian_entity");
  const [resourceOrigin, setResourceOrigin] = useState("cultivated");
  const [purpose, setPurpose] = useState("commercial_utilization");
  const [resourceName, setResourceName] = useState("Withania somnifera (Ashwagandha)");
  const [tkInvolved, setTkInvolved] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ABSComplianceResult | null>(null);

  // Kiosk Showcase State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingKiosk, setIsProcessingKiosk] = useState(false);
  const [kioskSpeaking, setKioskSpeaking] = useState(false);
  const [kioskQuery, setKioskQuery] = useState("Can I patent an Ayurvedic brain syrup made with Ashwagandha and Brahmi?");
  const [kioskAnswer, setKioskAnswer] = useState<string>(
    "Under Section 3(h) of the Drugs & Cosmetics Act, 1940, classical Ayurvedic formulations are regulated as Patent or Proprietary Medicines. Prior National Biodiversity Authority (NBA Form III) approval is mandatory under Section 6 of the Biological Diversity Act before any patent grant."
  );
  const [kioskClassification, setKioskClassification] = useState<string>("Patent / Proprietary Ayurvedic Medicine");
  const [kioskStatute, setKioskStatute] = useState<string>("Regulated under Drugs & Cosmetics Act Section 3(h) & BD Act Section 6");

  // Keep kiosk demo text in sync when user toggles language
  useEffect(() => {
    if (language === "ta") {
      setKioskQuery("அஸ்வகந்தா மற்றும் பிராமி கொண்டு தயாரிக்கப்படும் ஆயுர்வேத மருந்துக்கு காப்புரிமை பெற முடியுமா?");
      setKioskAnswer("ஆதாரப்பூர்வ சட்ட விதிகளின்படி, மருந்துகள் மற்றும் அழகுசாதனப் பொருட்கள் சட்டம் பிரிவு 3(h) கீழ் உங்கள் தயாரிப்பு கட்டுப்படுத்தப்படுகிறது. காப்புரிமை வழங்கும் முன் உயிரியல் பன்முகத்தன்மை சட்டம் பிரிவு 6-ன் கீழ் தேசிய பல்லுயிர் ஆணைய (NBA Form III) முன் அனுமதி பெறுவது கட்டாயமாகும்.");
      setKioskClassification("தனியுரிம ஆயுர்வேத மருந்து (பிரிவு 3(h))");
      setKioskStatute("பல்லுயிர் சட்டம் பிரிவு 6 மற்றும் காப்புரிமை சட்டம் பிரிவு 3(p)");
      setResourceName("விதானியா சோம்னிஃபெரா (அஸ்வகந்தா)");
    } else if (language === "hi") {
      setKioskQuery("क्या मैं अश्वगंधा और ब्राह्मी से बने आयुर्वेदिक सिरप पर पेटेंट प्राप्त कर सकता हूँ?");
      setKioskAnswer("औषधि एवं प्रसाधन सामग्री अधिनियम, 1940 की धारा 3(h) के अनुसार, पारंपरिक आयुर्वेदिक योग पेटेंट या प्रोप्राइटरी दवाओं के रूप में विनियमित होते हैं। किसी भी पेटेंट अनुदान से पूर्व जैविक विविधता अधिनियम की धारा 6 के तहत राष्ट्रीय जैव विविधता प्राधिकरण (NBA Form III) की पूर्व अनुमति अनिवार्य है।");
      setKioskClassification("पेटेंट / प्रोप्राइटरी आयुर्वेदिक औषधि");
      setKioskStatute("ड्रग्स एंड कॉस्मेटिक्स एक्ट धारा 3(h) एवं जैव विविधता अधिनियम धारा 6");
      setResourceName("विथानिया सोम्निफेरा (अश्वगंधा)");
    } else {
      setKioskQuery("Can I patent an Ayurvedic brain syrup made with Ashwagandha and Brahmi?");
      setKioskAnswer("Under Section 3(h) of the Drugs & Cosmetics Act, 1940, classical Ayurvedic formulations are regulated as Patent or Proprietary Medicines. Prior National Biodiversity Authority (NBA Form III) approval is mandatory under Section 6 of the Biological Diversity Act before any patent grant.");
      setKioskClassification("Patent / Proprietary Ayurvedic Medicine");
      setKioskStatute("Regulated under Drugs & Cosmetics Act Section 3(h) & BD Act Section 6");
      setResourceName("Withania somnifera (Ashwagandha)");
    }
  }, [language]);

  const handleEvaluateABS = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/abs-check"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: entityType,
          resource_origin: resourceOrigin,
          purpose: purpose,
          traditional_knowledge_involved: tkInvolved,
          biological_resource_name: resourceName,
        }),
      });

      if (!res.ok) throw new Error("ABS Evaluation Failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
        resource_analyzed: resourceName,
        overall_status: "ABS ACTION REQUIRED",
        regulatory_authority: "National Biodiversity Authority (NBA) & State Biodiversity Boards (SBB)",
        compliance_flags: [
          {
            severity: "CRITICAL",
            title: "Mandatory NBA Form III Approval Before Patent Grant",
            description: "Under Section 6(1) of Biological Diversity Act, 2002 (and 2023 Amendments), NBA approval is compulsory before grant of patent."
          },
          {
            severity: "HIGH",
            title: "State Biodiversity Board (SBB) Prior Intimation Required",
            description: "Indian entities obtaining biological resources for commercial utilization must intimate SBB under Section 7."
          }
        ],
        required_statutory_filings: [
          "NBA Form III (Prior Approval for Intellectual Property Right)",
          "State Biodiversity Board (SBB) Intimation Form"
        ],
        applicable_statutes: [
          "Biological Diversity Act 2002, Section 6",
          "Biological Diversity Act 2002, Section 7",
          "Patents Act 1970, Section 10(4)(d)(ii)"
        ],
        tkdl_guidance: {
          is_tkdl_public_domain: true,
          status_note: "TKDL contains >500,000 formulations used by patent examiners worldwide to defeat biopiracy and reject non-novel Ayurvedic patent claims.",
          verification_step: "Search published Ayurvedic Pharmacopoeia of India (API) monographs prior to filing."
        },
        disclaimer: "Automated regulatory informational assessment under the Biological Diversity Act, 2002. Not formal legal advice."
      });
    } finally {
      setLoading(false);
    }
  };

  // Audio player reference for native multilingual TTS streaming
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  const speakTextAloud = (text: string) => {
    if (!text || !text.trim()) return;

    // Stop any ongoing audio playback
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Auto-detect language script: Tamil, Hindi, or English
    let targetLang: SupportedLanguage = language;
    if (/[\u0B80-\u0BFF]/.test(text)) {
      targetLang = 'ta';
    } else if (/[\u0900-\u097F]/.test(text)) {
      targetLang = 'hi';
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    // Limit text length to 350 chars for prompt, responsive kiosk speech
    const cleanSnippet = text.replace(/[*_#`[\]()]/g, '').trim().slice(0, 350);
    const streamUrl = `${backendUrl}/api/tts?text=${encodeURIComponent(cleanSnippet)}&lang=${targetLang}`;

    const audio = new Audio(streamUrl);
    audioPlayerRef.current = audio;
    setKioskSpeaking(true);

    audio.onended = () => {
      setKioskSpeaking(false);
      audioPlayerRef.current = null;
    };

    audio.onerror = (e) => {
      console.warn("Backend audio stream error, falling back to Web Speech API:", e);
      audioPlayerRef.current = null;
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(cleanSnippet);
        utterance.lang = targetLang === 'ta' ? 'ta-IN' : targetLang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.92;
        utterance.onstart = () => setKioskSpeaking(true);
        utterance.onend = () => setKioskSpeaking(false);
        utterance.onerror = () => setKioskSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setKioskSpeaking(false);
      }
    };

    audio.play().catch((err) => {
      console.warn("Audio autoplay blocked or playback failed:", err);
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(cleanSnippet);
        utterance.lang = targetLang === 'ta' ? 'ta-IN' : targetLang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.onstart = () => setKioskSpeaking(true);
        utterance.onend = () => setKioskSpeaking(false);
        utterance.onerror = () => setKioskSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setKioskSpeaking(false);
      }
    });
  };


  const handleProcessKioskQuery = async (userQuery: string) => {
    if (!userQuery.trim()) return;
    setIsProcessingKiosk(true);
    setKioskSpeaking(false);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const lower = userQuery.toLowerCase();
      // Handle conversational greetings directly
      if (lower.includes("hi") || lower.includes("hello") || lower.includes("how are you") || lower.includes("answer me") || lower.includes("please")) {
        const greetingResponses: Record<SupportedLanguage, { answer: string; category: string; statute: string }> = {
          en: {
            answer: "Hello! I am IP-SAKTI, your statutory Ayurvedic advisor. You can ask me any question about patentability under Section 3(p), classical TKDL citations, or NBA biodiversity clearance under Section 6.",
            category: "Ayurvedic Regulatory Assistant • Active",
            statute: "Ministry of Ayush & National Biodiversity Authority Gateway"
          },
          hi: {
            answer: "नमस्ते! मैं IP-SAKTI, आपका कानूनी आयुर्वेदिक सलाहकार हूँ। आप मुझसे पेटेंट धारा 3(p), टीकेडीएल संदर्भों या एनबीए जैव विविधता अनुमति के बारे में पूछ सकते हैं।",
            category: "आयुर्वेदिक नियामक सहायक • सक्रिय",
            statute: "आयुष मंत्रालय एवं राष्ट्रीय जैव विविधता प्राधिकरण गेटवे"
          },
          ta: {
            answer: "வணக்கம்! நான் IP-SAKTI, உங்கள் ஆயுர்வேத சட்ட ஆலோசகர். காப்புரிமை பிரிவு 3(p), பாரம்பரிய அறிவு நூலக மேற்கோள்கள் மற்றும் பல்லுயிர் வாரிய அனுமதி பற்றி என்னிடம் கேட்கலாம்.",
            category: "ஆயுர்வேத ஒழுங்குமுறை உதவியாளர் • தயார்",
            statute: "ஆயுஷ் அமைச்சகம் மற்றும் தேசிய பல்லுயிர் ஆணைய தளம்"
          }
        };

        const res = greetingResponses[language] || greetingResponses.en;
        setKioskAnswer(res.answer);
        setKioskClassification(res.category);
        setKioskStatute(res.statute);
        setIsProcessingKiosk(false);
        speakTextAloud(res.answer);
        return;
      }

      // Query the live RAG backend with language
      const res = await fetch(getApiUrl("/api/query"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery, language: language })
      });

      if (res.ok) {
        const data = await res.json();
        const answerText = data.short_answer || data.answer || "Query analyzed under statutory provisions.";
        setKioskAnswer(answerText);
        setKioskClassification(data.product_classification || (language === "ta" ? "சட்டப்பூர்வ மருந்து மதிப்பீடு" : language === "hi" ? "वैधानिक औषधि मूल्यांकन" : "Statutory Formulation Evaluation"));
        setKioskStatute(`Regulated under ${data.jurisdiction || "India"} Patents & Ayush Norms`);
        setIsProcessingKiosk(false);
        speakTextAloud(answerText);
      } else {
        throw new Error("Backend query failed");
      }
    } catch (err) {
      console.warn("Kiosk query fallback:", err);
      const fallbackAnswers: Record<SupportedLanguage, string> = {
        en: `Regarding your inquiry on "${userQuery}". Pure Ayurvedic herbs face statutory exclusions under Section 3(p) for Traditional Knowledge and Section 3(e) for Mere Admixtures. Mandatory NBA Form III approval is required before patent grant.`,
        hi: `आपकी जांच: "${userQuery}" के संबंध में। पारंपरिक ज्ञान होने के कारण पेटेंट अधिनियम की धारा 3(p) और धारा 3(e) के तहत प्रतिबंध लागू होते हैं। पेटेंट अनुदान से पहले एनबीए फॉर्म 3 अनुमोदन अनिवार्य है।`,
        ta: `உங்கள் கேள்வி தொடர்பாக: "${userQuery}". பாரம்பரிய அறிவு மற்றும் எளிய கலவைகளுக்கு பிரிவு 3(p) மற்றும் 3(e) கீழ் காப்புரிமை விலக்குகள் பொருந்தும். காப்புரிமை வழங்கும் முன் என்பிஏ படிவம் 3 அனுமதி பெறுவது கட்டாயமாகும்.`
      };
      const fbAnswer = fallbackAnswers[language] || fallbackAnswers.en;
      setKioskAnswer(fbAnswer);
      setKioskClassification(language === "ta" ? "தனியுரிம ஆயுர்வேத மருந்து" : language === "hi" ? "पेटेंट / प्रोप्राइटरी आयुर्वेदिक औषधि" : "Patent / Proprietary Ayurvedic Medicine");
      setKioskStatute(language === "ta" ? "மருந்துகள் மற்றும் அழகுசாதனப் பொருட்கள் சட்டம் பிரிவு 3(h)" : language === "hi" ? "ड्रग्स एंड कॉस्मेटिक्स एक्ट धारा 3(h)" : "Regulated under Drugs & Cosmetics Act Section 3(h)");
      setIsProcessingKiosk(false);
      speakTextAloud(fbAnswer);
    }
  };

  const handleSpeak = () => {
    if (kioskSpeaking) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setKioskSpeaking(false);
      return;
    }

    speakTextAloud(kioskAnswer);
  };

  // Clean up any speaking when unmounting
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice recognition via Web Speech API with automatic query execution and speech feedback
  const handleVoiceSimulation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        const langLocales: Record<SupportedLanguage, string> = {
          en: "en-IN",
          hi: "hi-IN",
          ta: "ta-IN"
        };
        recognition.lang = langLocales[language] || "en-IN";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setKioskQuery(transcript);
            setIsRecording(false);
            await handleProcessKioskQuery(transcript);
          }
        };
        recognition.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          setIsRecording(false);
          const sampleQueries: Record<SupportedLanguage, string> = {
            en: "Can I patent an Ayurvedic brain syrup with Ashwagandha and Brahmi?",
            hi: "क्या मैं अश्वगंधा और ब्राह्मी से बने आयुर्वेदिक सिरप पर पेटेंट प्राप्त कर सकता हूँ?",
            ta: "அஸ்வகந்தா மற்றும் பிராமி கொண்டு தயாரிக்கப்படும் ஆயுர்வேத மருந்துக்கு காப்புரிமை பெற முடியுமா?"
          };
          const sample = sampleQueries[language] || sampleQueries.en;
          setKioskQuery(sample);
          handleProcessKioskQuery(sample);
        };
        recognition.onend = () => setIsRecording(false);
        recognition.start();
        return;
      } catch (err) {
        console.warn("Speech recognition initialization failed:", err);
      }
    }

    // Fallback simulation if browser blocks or lacks mic
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const sampleQueries: Record<SupportedLanguage, string> = {
        en: "Can I patent an Ayurvedic brain syrup with Ashwagandha and Brahmi?",
        hi: "क्या मैं अश्वगंधा और ब्राह्मी से बने आयुर्वेदिक सिरप पर पेटेंट प्राप्त कर सकता हूँ?",
        ta: "அஸ்வகந்தா மற்றும் பிராமி கொண்டு தயாரிக்கப்படும் ஆயுர்வேத மருந்துக்கு காப்புரிமை பெற முடியுமா?"
      };
      const sample = sampleQueries[language] || sampleQueries.en;
      setKioskQuery(sample);
      handleProcessKioskQuery(sample);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-forest-950 text-forest-950 dark:text-parchment-50 flex flex-col font-sans transition-colors bg-atmospheric">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* SECTION 1: ABS Clearance Engine */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/30 neon-border-emerald">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-display">{t("abs_badge")}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-light tracking-tight text-forest-950 dark:text-parchment-50">
              {t("abs_title")}
            </h1>
            <p className="text-xs sm:text-sm text-forest-900/70 dark:text-parchment-200/70 leading-relaxed max-w-xl mx-auto">
              {t("abs_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Input Card with Neon Border Accent */}
            <div className="lg:col-span-5 bg-white dark:bg-forest-900/70 rounded-3xl p-6 sm:p-8 border border-emerald-500/30 dark:border-emerald-500/40 shadow-elevated-luxury space-y-5 backdrop-blur-xl neon-glow-emerald">
              <h2 className="font-display text-lg font-bold text-forest-950 dark:text-parchment-50 pb-3 border-b border-parchment-200 dark:border-forest-800 flex items-center justify-between">
                <span>{t("bio_profile")}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70 mb-1.5">
                  {t("botanical_name")}
                </label>
                <input
                  type="text"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  className="w-full bg-parchment-50 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70 mb-1.5">
                  {t("applicant_entity")}
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full bg-parchment-50 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="indian_entity">{t("indian_entity_opt")}</option>
                  <option value="foreign_entity">{t("foreign_entity_opt")}</option>
                  <option value="nri">{t("nri_opt")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70 mb-1.5">
                  {t("resource_origin_label")}
                </label>
                <select
                  value={resourceOrigin}
                  onChange={(e) => setResourceOrigin(e.target.value)}
                  className="w-full bg-parchment-50 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="cultivated">{t("cultivated_opt")}</option>
                  <option value="wild_harvested">{t("wild_harvested_opt")}</option>
                  <option value="market_commodity">{t("mandi_commodity_opt")}</option>
                  <option value="imported">{t("imported_opt")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70 mb-1.5">
                  {t("commercial_purpose")}
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-parchment-50 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="commercial_utilization">{t("commercial_mfg_opt")}</option>
                  <option value="ip_application">{t("patent_filing_opt")}</option>
                  <option value="research">{t("academic_research_opt")}</option>
                  <option value="bio_survey">{t("bio_survey_opt")}</option>
                </select>
              </div>

              <label className="flex items-center space-x-2 text-xs cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={tkInvolved}
                  onChange={(e) => setTkInvolved(e.target.checked)}
                  className="text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-forest-900/80 dark:text-parchment-200">
                  {t("tk_checkbox")}
                </span>
              </label>

              <button
                type="button"
                onClick={handleEvaluateABS}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-parchment-50 dark:text-forest-950 text-xs font-bold shadow-md transition-all mt-4 border border-emerald-400/30"
              >
                {loading ? t("evaluating_abs") : t("eval_abs_btn")}
              </button>
            </div>

            {/* Assessment Dossier Output */}
            <div className="lg:col-span-7">
              {result ? (
                <div className="bg-white dark:bg-forest-900/70 rounded-3xl p-6 sm:p-8 border border-amber-500/30 dark:border-forest-700/60 shadow-elevated-luxury space-y-6 animate-in fade-in-50">
                  <div className="flex items-center justify-between pb-4 border-b border-parchment-200 dark:border-forest-800">
                    <div>
                      <span className="font-display text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 block mb-0.5">
                        {t("abs_audit_title")}
                      </span>
                      <h3 className="font-display text-2xl font-bold text-forest-950 dark:text-parchment-50">
                        {result.resource_analyzed}
                      </h3>
                    </div>
                    <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      {result.overall_status}
                    </span>
                  </div>

                  {/* Compliance Flags */}
                  <div className="space-y-3">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-forest-900/60 dark:text-parchment-300/60 block">
                      {t("compliance_flags_title")}
                    </span>
                    {result.compliance_flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border text-xs space-y-1 ${
                          flag.severity === "CRITICAL"
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 font-bold">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>{flag.title}</span>
                        </div>
                        <p className="leading-relaxed font-sans">{flag.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mandatory Filings */}
                  <div className="space-y-2">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-forest-900/60 dark:text-parchment-300/60 block">
                      {t("required_filings_title")}
                    </span>
                    {result.required_statutory_filings.map((filing, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-2.5 p-3 rounded-xl bg-parchment-50 dark:bg-forest-950 text-xs text-forest-950 dark:text-parchment-50 font-semibold border border-parchment-200 dark:border-forest-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{filing}</span>
                      </div>
                    ))}
                  </div>

                  {/* TKDL Guidance */}
                  <div className="p-4 rounded-2xl bg-parchment-100 dark:bg-forest-950 border border-amber-500/20 text-xs space-y-1.5">
                    <span className="font-display font-bold text-amber-700 dark:text-amber-400 block">
                      {t("tkdl_pointer_title")}
                    </span>
                    <p className="text-forest-900/80 dark:text-parchment-300/80 leading-relaxed font-sans">
                      {result.tkdl_guidance.status_note}
                    </p>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block pt-1">
                      Action: {result.tkdl_guidance.verification_step}
                    </span>
                  </div>

                  <div className="text-[11px] text-forest-900/60 dark:text-parchment-300/60 bg-parchment-50 dark:bg-forest-950 p-3 rounded-xl border border-parchment-200 dark:border-forest-800">
                    <strong>{t("statutory_disclaimer")}:</strong> {result.disclaimer}
                  </div>
                </div>
              ) : (
                <div className="h-full bg-white dark:bg-forest-900/60 rounded-3xl p-12 border border-parchment-200 dark:border-forest-800 shadow-subtle-luxury flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-forest-800 flex items-center justify-center text-emerald-500">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-forest-950 dark:text-parchment-50">
                    {t("abs_audit_title")}
                  </h3>
                  <p className="text-xs text-forest-900/60 dark:text-parchment-300/60 max-w-sm">
                    {t("abs_audit_desc")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: IP-SAKTI Smart Kiosk Showcase */}
        <section id="kiosk" className="pt-12 border-t border-parchment-200/80 dark:border-forest-900/60 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-rose-500/10 text-rose-800 dark:text-rose-300 text-xs font-semibold border border-rose-500/20 shadow-subtle-luxury">
              <Monitor className="w-3.5 h-3.5 text-rose-600" />
              <span className="font-display">{t("physical_layer_badge")}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-light text-forest-950 dark:text-parchment-50">
              {t("kiosk_hardware_title")}
            </h2>
            <p className="text-xs sm:text-sm text-forest-900/70 dark:text-parchment-200/70 leading-relaxed max-w-md mx-auto">
              {t("kiosk_hardware_sub")}
            </p>
          </div>

          {/* Luxury Hardware Kiosk Chassis with Neon Glow */}
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-forest-950 via-forest-900 to-black text-parchment-50 rounded-3xl p-6 sm:p-10 border-2 border-amber-400/40 shadow-2xl space-y-6 neon-glow-gold">
            {/* Kiosk Bezel Header */}
            <div className="flex items-center justify-between pb-6 border-b border-forest-800 text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="font-mono text-amber-300 font-bold tracking-widest text-[10px] uppercase">
                  {t("kiosk_badge")}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSpeak}
                  className={`px-3.5 py-1.5 rounded-xl flex items-center space-x-2 font-bold text-xs transition-all ${
                    kioskSpeaking
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                      : "bg-forest-900 hover:bg-forest-800 text-amber-300 border border-amber-500/30"
                  }`}
                  title={kioskSpeaking ? "Stop speech" : "Listen to audio explanation"}
                >
                  {kioskSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{kioskSpeaking ? t("stop_audio") : t("simulate_audio")}</span>
                </button>
              </div>
            </div>

            {/* Touchscreen Glass Area */}
            <div className="bg-forest-900/80 rounded-2xl p-6 sm:p-8 border border-emerald-500/30 space-y-6 backdrop-blur-md neon-border-emerald">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    <span>{t("kiosk_title")}</span>
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-md">LIVE AI</span>
                  </h3>
                  <p className="text-xs text-parchment-300/70 font-sans">{t("kiosk_subtitle")}</p>
                </div>
                <div className="flex space-x-1.5 bg-forest-950/80 p-1 rounded-xl border border-forest-800">
                  {(["en", "hi", "ta"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        language === l
                          ? "bg-amber-400 text-forest-950 font-extrabold shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                          : "text-parchment-300 hover:bg-forest-800"
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Central Audio Microphone Simulator */}
              <div className="flex flex-col items-center justify-center py-8 bg-forest-950/90 rounded-2xl border border-forest-800 space-y-4">
                <button
                  onClick={handleVoiceSimulation}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording
                      ? "bg-rose-600 scale-110 shadow-lg shadow-rose-600/50 animate-pulse"
                      : "bg-gradient-to-br from-amber-400 to-amber-600 text-forest-950 hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                  }`}
                  title="Tap to speak"
                >
                  <Mic className="w-8 h-8" />
                </button>
                <span className="text-xs font-bold text-parchment-200">
                  {isRecording
                    ? (language === "ta" ? "உங்கள் குரல் கேட்கப்படுகிறது (பேசவும்)..." : language === "hi" ? "आपकी आवाज सुनी जा रही है (बोलें)..." : "Listening to Voice Input (Web Speech API)...")
                    : t("speak_btn")}
                </span>

                {/* Animated Waveform Visualizer */}
                <div className="flex items-center space-x-1 h-6">
                  {[4, 12, 20, 8, 16, 24, 14, 6, 18, 10, 22, 12].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-amber-400/80 rounded-full transition-all duration-150"
                      style={{
                        height: isRecording || kioskSpeaking ? `${(h * 1.4)}px` : '4px'
                      }}
                    />
                  ))}
                </div>

                <p className="text-xs text-parchment-300/80 italic max-w-md text-center px-4 bg-forest-900/40 py-1.5 rounded-xl border border-forest-800/60">
                  "{kioskQuery}"
                </p>
              </div>

              {/* Loading State when query is being processed */}
              {isProcessingKiosk && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2 animate-pulse">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-amber-300">
                    {t("kiosk_analyzing")}
                  </p>
                </div>
              )}

              {/* Spoken Auditory Verdict Box */}
              {!isProcessingKiosk && kioskAnswer && (
                <div className="p-5 rounded-2xl bg-forest-950/90 border border-amber-500/30 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-display text-xs font-bold text-amber-300 uppercase tracking-wider">
                        {t("kiosk_spoken_response")}
                      </span>
                    </div>
                    <button
                      onClick={handleSpeak}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        kioskSpeaking
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                          : "bg-forest-900 hover:bg-forest-800 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {kioskSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{kioskSpeaking ? t("stop_audio") : t("simulate_audio")}</span>
                    </button>
                  </div>
                  <p className="font-display text-sm sm:text-base text-parchment-100 leading-relaxed font-light">
                    "{kioskAnswer}"
                  </p>
                </div>
              )}

              {/* Screen Split: Immediate Verdict + Mobile QR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-forest-950 border border-forest-800 space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 block">
                    {t("kiosk_instant_verdict")}
                  </span>
                  <p className="font-display text-base font-bold text-white">
                    {kioskClassification}
                  </p>
                  <span className="text-parchment-300/60 block font-sans">
                    {kioskStatute}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-forest-950 border border-forest-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block">
                      {t("mobile_handoff_title")}
                    </span>
                    <p className="text-parchment-200 text-xs font-semibold">
                      {t("mobile_handoff_title")}
                    </p>
                    <span className="text-[10px] text-parchment-300/60 block font-sans">
                      {t("mobile_handoff_sub")}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <QRCodeCanvas value={`${typeof window !== 'undefined' ? window.location.origin : 'https://ipsakti.ai'}/ask?ref=kiosk&lang=${language}`} size={64} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ABSKioskPage;
