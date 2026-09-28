import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "../ui/Navbar";
import { Footer } from "../ui/Footer";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Mic,
  Volume2,
  VolumeX,
  Monitor,
  Sparkles,
  BookOpen,
  FileText,
  ExternalLink,
} from "lucide-react";
import { QRCodeCanvas } from "../ui/QRCodeCanvas";
import { useLanguage, SupportedLanguage } from "../../context/LanguageContext";
import { getApiUrl, formatCitationUrl } from "../../lib/api";
import { generateClientStatutoryResponse } from "../../lib/clientStatutoryEngine";

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

interface Citation {
  citation_index: number;
  document_id: string;
  title: string;
  section: string;
  authority: string;
  jurisdiction: string;
  version: string;
  source_url: string;
  excerpt: string;
  verification_status?: string;
  supports_claim?: boolean;
}

type VoiceState = "idle" | "listening" | "transcribing" | "processing" | "speaking";

export const ABSKioskPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [entityType, setEntityType] = useState("indian_entity");
  const [resourceOrigin, setResourceOrigin] = useState("cultivated");
  const [purpose, setPurpose] = useState("commercial_utilization");
  const [resourceName, setResourceName] = useState("Withania somnifera (Ashwagandha)");
  const [tkInvolved, setTkInvolved] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ABSComplianceResult | null>(null);

  // Kiosk Voice Agent State Machine
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [kioskQuery, setKioskQuery] = useState<string>("");
  const [transcriptPreview, setTranscriptPreview] = useState<string>("");
  const [kioskAnswer, setKioskAnswer] = useState<string>("");
  const [kioskClassification, setKioskClassification] = useState<string>("");
  const [kioskStatute, setKioskStatute] = useState<string>("");
  const [kioskCitations, setKioskCitations] = useState<Citation[]>([]);
  const [kioskConfidence, setKioskConfidence] = useState<{ score: number; label: string; evidence_quality?: string } | null>(null);
  const [kioskErrorMessage, setKioskErrorMessage] = useState<string | null>(null);

  // Audio player & recognition refs for interruptibility and cleanup
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>("");

  // Localized sample prompt suggestions
  const samplePrompts: Record<SupportedLanguage, string[]> = {
    en: [
      "Can I patent an Ayurvedic brain syrup made with Ashwagandha and Brahmi?",
      "Can a mere admixture of known substances be patented in India?",
      "What is TKDL?",
      "Can I sell my Ayurvedic medicine?",
      "Can I breed brinjal and tomato?"
    ],
    hi: [
      "क्या मैं अश्वगंधा और ब्राह्मी से बने आयुर्वेदिक सिरप पर पेटेंट प्राप्त कर सकता हूँ?",
      "क्या ज्ञात आयुर्वेदिक पदार्थों के केवल मिश्रण पर पेटेंट मिल सकता है?",
      "TKDL क्या है?",
      "क्या मैं अपनी आयुर्वेदिक दवा व्यावसायिक रूप से बेच सकता हूँ?",
      "क्या मैं बैंगन और टमाटर का संकरण कर सकता हूँ?"
    ],
    ta: [
      "அஸ்வகந்தா மற்றும் பிராமி கொண்டு தயாரிக்கப்படும் ஆயுர்வேத மருந்துக்கு காப்புரிமை பெற முடியுமா?",
      "பாரம்பரிய மருந்துகளின் எளிய கலவைக்கு காப்புரிமை கிடைக்குமா?",
      "TKDL என்றால் என்ன?",
      "எனது ஆயுர்வேத மருந்தை நான் வணிகரீதியாக விற்க முடியுமா?",
      "நான் கத்தரிக்காயையும் தக்காளியையும் கலப்பினம் செய்யலாமா?"
    ]
  };

  const defaultPlaceholder = samplePrompts[language]?.[0] || samplePrompts.en[0];

  // Language update handler: update botanical name in form if untouched
  useEffect(() => {
    if (language === "ta") {
      setResourceName("விதானியா சோம்னிஃபெரா (அஸ்வகந்தா)");
    } else if (language === "hi") {
      setResourceName("विथानिया सोम्निफेरा (अश्वगंधा)");
    } else {
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

  // Stop any active TTS audio or synthesis
  const stopAllAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Browser SpeechSynthesis fallback
  // Browser SpeechSynthesis
  const fallbackBrowserSpeech = (cleanText: string, targetLang: SupportedLanguage) => {
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const langCode = targetLang === "ta" ? "ta-IN" : targetLang === "hi" ? "hi-IN" : "en-IN";
        utterance.lang = langCode;

        // Try to match specific language voice if available
        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetLang) || v.lang.toLowerCase().includes(langCode.toLowerCase()));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.rate = 0.95;
        utterance.onstart = () => setVoiceState("speaking");
        utterance.onend = () => setVoiceState("idle");
        utterance.onerror = () => {
          setVoiceState("idle");
          // If browser speech synthesis failed, fallback to backend gTTS
          playBackendTts(cleanText, targetLang);
        };
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Browser speech synthesis failed:", err);
        playBackendTts(cleanText, targetLang);
      }
    } else {
      playBackendTts(cleanText, targetLang);
    }
  };

  // Play audio stream from backend gTTS
  const playBackendTts = (cleanSnippet: string, targetLang: SupportedLanguage) => {
    const backendUrl = getApiUrl("");
    const streamUrl = `${backendUrl}/api/tts?text=${encodeURIComponent(cleanSnippet)}&lang=${targetLang}`;

    setVoiceState("speaking");

    const audio = new Audio(streamUrl);
    audioPlayerRef.current = audio;

    audio.onended = () => {
      setVoiceState("idle");
      audioPlayerRef.current = null;
    };

    audio.onerror = (e) => {
      console.warn("Backend TTS stream error:", e);
      audioPlayerRef.current = null;
      setVoiceState("idle");
    };

    audio.play().catch((err) => {
      console.warn("Audio autoplay blocked or stream failed:", err);
      setVoiceState("idle");
    });
  };

  // Natural Text-to-Speech Streaming (Instant browser speech with backend fallback)
  const speakTextAloud = (text: string) => {
    if (!text || !text.trim()) {
      setVoiceState("idle");
      return;
    }

    stopAllAudio();

    // Auto-detect language script from response text
    let targetLang: SupportedLanguage = language;
    if (/[\u0B80-\u0BFF]/.test(text)) {
      targetLang = "ta";
    } else if (/[\u0900-\u097F]/.test(text)) {
      targetLang = "hi";
    }

    // Limit text length to clean natural spoken sentences without markdown or citations
    const cleanSnippet = text
      .replace(/[*_#`[\]()]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\bPage\s+\d+\b/gi, "")
      .replace(/\b\d+\.\s+/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 320);

    // If Tamil or Hindi, verify if browser actually has a voice for it; otherwise use backend gTTS
    const voices = "speechSynthesis" in window ? window.speechSynthesis.getVoices() : [];
    const hasDedicatedVoice = voices.some((v) => v.lang.toLowerCase().startsWith(targetLang));

    if ("speechSynthesis" in window && (targetLang === "en" || hasDedicatedVoice)) {
      fallbackBrowserSpeech(cleanSnippet, targetLang);
      return;
    }

    // Backend TTS for high-fidelity Tamil/Hindi
    playBackendTts(cleanSnippet, targetLang);
  };

  // Query Backend RAG Pipeline with real transcript
  const handleProcessKioskQuery = async (userQuery: string) => {
    const trimmed = userQuery.trim();
    if (!trimmed) return;

    // Detect language from script if present
    let targetLang: SupportedLanguage = language;
    if (/[\u0B80-\u0BFF]/.test(trimmed)) {
      targetLang = "ta";
      setLanguage("ta");
    } else if (/[\u0900-\u097F]/.test(trimmed)) {
      targetLang = "hi";
      setLanguage("hi");
    }

    setHasInteracted(true);
    setKioskQuery(trimmed);
    setVoiceState("processing");
    setKioskErrorMessage(null);
    stopAllAudio();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    try {
      const res = await fetch(getApiUrl("/api/query"), {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          jurisdiction: "India",
          language: targetLang
        })
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Backend service error (${res.status})`);
      }

      const data = await res.json();
      const answerText = data.short_answer || data.answer || "Query analyzed under statutory provisions.";
      setKioskAnswer(answerText);
      setKioskClassification(data.product_classification || "Statutory ASU Evaluation");
      setKioskStatute(data.regulatory_pathway || `Regulated under ${data.jurisdiction || "India"} Patents & Ayush Norms`);
      setKioskCitations(data.citations || []);
      setKioskConfidence(data.confidence || null);

      // Trigger realistic auditory playback of the ACTUAL generated response
      speakTextAloud(answerText);
    } catch (err) {
      console.warn("Kiosk backend query failed, falling back to autonomous client statutory engine:", err);
      try {
        const clientRes = await generateClientStatutoryResponse(trimmed, "India", targetLang);
        setKioskAnswer(clientRes.short_answer);
        setKioskClassification(clientRes.product_classification);
        setKioskStatute(clientRes.regulatory_pathway);
        setKioskCitations(clientRes.citations);
        setKioskConfidence(clientRes.confidence);
        speakTextAloud(clientRes.short_answer);
      } catch (fallbackErr) {
        const errMsg =
          targetLang === "ta"
            ? "IP-SAKTI அறிவு சேவையை தொடர்பு கொள்ள முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
            : targetLang === "hi"
            ? "IP-SAKTI ज्ञान सेवा से संपर्क नहीं हो सका। कृपया थोड़ी देर बाद पुनः प्रयास करें।"
            : "I couldn't reach the IP-SAKTI knowledge service right now. Please try again.";
        setKioskAnswer(errMsg);
        setKioskErrorMessage(errMsg);
        setVoiceState("idle");
      }
    }
  };

  // Toggle Audio Playback
  const handleToggleSpeak = () => {
    if (voiceState === "speaking") {
      stopAllAudio();
      setVoiceState("idle");
    } else if (kioskAnswer) {
      speakTextAloud(kioskAnswer);
    }
  };

  // Start Real Speech Recognition
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setKioskErrorMessage(
        language === "ta"
          ? "இந்த உலாவியில் குரல் அறிதல் ஆதரிக்கப்படவில்லை. Google Chrome அல்லது Edge உலாவியைப் பயன்படுத்தவும்."
          : language === "hi"
          ? "इस ब्राउज़र में वॉयस रिकग्निशन समर्थित नहीं है। कृपया Google Chrome या Edge का उपयोग करें।"
          : "Speech recognition is not supported in this browser. Please use Chrome/Edge or type your question in Chatbot."
      );
      return;
    }

    // Stop active audio and clear timers
    stopAllAudio();
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      const langLocales: Record<SupportedLanguage, string> = {
        en: "en-IN",
        hi: "hi-IN",
        ta: "ta-IN"
      };
      recognition.lang = langLocales[language] || "en-IN";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      setVoiceState("listening");
      setKioskErrorMessage(null);
      setTranscriptPreview("");
      latestTranscriptRef.current = "";

      recognition.onstart = () => {
        setVoiceState("listening");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + " ";
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const combined = (final.trim() ? final.trim() + " " : "") + interim;
        const currentClean = combined.trim();
        if (currentClean) {
          latestTranscriptRef.current = currentClean;
          setVoiceState("transcribing");
          setTranscriptPreview(currentClean);
        }

        // Reset silence timer on every speech event
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        // When user pauses for 1400ms after speaking, automatically finalize and submit the full question
        silenceTimerRef.current = setTimeout(async () => {
          const finalQuery = latestTranscriptRef.current.trim();
          if (finalQuery && finalQuery.length >= 3) {
            try {
              recognition.stop();
            } catch (e) {}
            setTranscriptPreview("");
            setKioskQuery(finalQuery);
            setVoiceState("processing");
            await handleProcessKioskQuery(finalQuery);
          }
        }, 1400);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setKioskErrorMessage(
            language === "ta"
              ? "மைக்ரோஃபோன் அணுகல் மறுக்கப்பட்டது. உங்கள் உலாவி அமைப்புகளில் அனுமதியை வழங்கவும்."
              : language === "hi"
              ? "माइक्रोफ़ोन एक्सेस अस्वीकृत कर दिया गया। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।"
              : "Microphone access is required for voice inquiries. You can also type your question in the chatbot."
          );
        } else if (event.error === "no-speech") {
          setKioskErrorMessage(
            language === "ta"
              ? "குரல் தெளிவாகக் கேட்கவில்லை. மீண்டும் மைக்ரோஃபோனைத் தட்டிப் பேசவும்."
              : language === "hi"
              ? "आवाज़ स्पष्ट सुनाई नहीं दी। कृपया पुनः माइक दबाकर बोलें।"
              : "I couldn't clearly hear that. Please tap the microphone and try again."
          );
        } else if (event.error !== "aborted") {
          setKioskErrorMessage(
            language === "ta"
              ? `குரல் பதிவு பிழை (${event.error}). மீண்டும் முயற்சிக்கவும்.`
              : language === "hi"
              ? `ध्वनि पहचान में त्रुटि (${event.error})। कृपया पुनः प्रयास करें।`
              : `Speech recognition error (${event.error}). Please try again.`
          );
        }
        setVoiceState("idle");
      };

      recognition.onend = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        const finalQuery = latestTranscriptRef.current.trim();
        // If question was not already sent to processing, send now
        if (finalQuery && finalQuery.length >= 3 && voiceState !== "processing" && voiceState !== "speaking") {
          setTranscriptPreview("");
          setKioskQuery(finalQuery);
          setVoiceState("processing");
          handleProcessKioskQuery(finalQuery);
        } else if (voiceState === "listening" || voiceState === "transcribing") {
          setVoiceState("idle");
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setVoiceState("idle");
      setKioskErrorMessage("Failed to initialize microphone service.");
    }
  };

  // Main Microphone Button Controller (Supports Interruptions and Done-Speaking Trigger)
  const handleMicrophoneClick = () => {
    if (voiceState === "speaking") {
      // User tapped mic while AI was speaking -> interrupt speech and immediately listen
      stopAllAudio();
      setVoiceState("idle");
      startListening();
    } else if (voiceState === "listening" || voiceState === "transcribing") {
      // User tapped mic while listening -> stop and immediately submit the full query
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      const finalQuery = latestTranscriptRef.current.trim() || transcriptPreview.trim();
      if (finalQuery && finalQuery.length >= 3) {
        setTranscriptPreview("");
        setKioskQuery(finalQuery);
        setVoiceState("processing");
        handleProcessKioskQuery(finalQuery);
      } else {
        setVoiceState("idle");
      }
    } else {
      // Idle or error state -> start speech recognition
      startListening();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

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
                  className="w-full bg-parchment-50 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="indian_entity">{t("entity_indian")}</option>
                  <option value="foreign_entity">{t("entity_foreign")}</option>
                  <option value="nri">{t("entity_nri")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70 mb-1.5">
                  {t("resource_source")}
                </label>
                <select
                  value={resourceOrigin}
                  onChange={(e) => setResourceOrigin(e.target.value)}
                  className="w-full bg-parchment-50 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="cultivated">{t("source_cultivated")}</option>
                  <option value="wild_harvested">{t("source_wild")}</option>
                  <option value="market_commodity">{t("source_market")}</option>
                  <option value="imported">{t("source_imported")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70 mb-1.5">
                  {t("intended_purpose")}
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-parchment-50 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="commercial_utilization">{t("purpose_commercial")}</option>
                  <option value="research">{t("purpose_research")}</option>
                  <option value="ip_application">{t("purpose_ip")}</option>
                  <option value="bio_survey">{t("purpose_bio")}</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="tk"
                  checked={tkInvolved}
                  onChange={(e) => setTkInvolved(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/40"
                />
                <label htmlFor="tk" className="text-xs font-bold text-forest-900/80 dark:text-parchment-200/80">
                  {t("tk_involved")}
                </label>
              </div>

              <button
                onClick={handleEvaluateABS}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition-all flex items-center justify-center space-x-2 text-sm neon-border-emerald"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t("evaluating")}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t("evaluate_btn")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Display */}
            <div className="lg:col-span-7 bg-white dark:bg-forest-900/70 rounded-3xl p-6 sm:p-8 border border-parchment-200 dark:border-forest-800 shadow-elevated-luxury space-y-6 backdrop-blur-xl">
              <h2 className="font-display text-lg font-bold text-forest-950 dark:text-parchment-50 pb-3 border-b border-parchment-200 dark:border-forest-800 flex items-center justify-between">
                <span>{t("statutory_status")}</span>
                {result && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    result.overall_status === "COMPLIANT"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                  }`}>
                    {result.overall_status}
                  </span>
                )}
              </h2>

              {!result ? (
                <div className="py-16 text-center text-forest-900/40 dark:text-parchment-200/40 space-y-2">
                  <ShieldCheck className="w-12 h-12 mx-auto stroke-1" />
                  <p className="text-sm">{t("no_result_msg")}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Authority Banner */}
                  <div className="p-4 rounded-xl bg-parchment-100/60 dark:bg-forest-950/60 border border-parchment-200 dark:border-forest-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-900/60 dark:text-parchment-200/60 block mb-1">
                      {t("competent_authority")}
                    </span>
                    <span className="text-sm font-bold text-forest-950 dark:text-parchment-50">
                      {result.regulatory_authority}
                    </span>
                  </div>

                  {/* Compliance Flags */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70">
                      {t("statutory_obligations")}
                    </h4>
                    {result.compliance_flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex items-start space-x-3 ${
                          flag.severity === "CRITICAL"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-950 dark:text-rose-200"
                            : flag.severity === "HIGH"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-950 dark:text-amber-200"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-200"
                        }`}
                      >
                        {flag.severity === "CRITICAL" || flag.severity === "HIGH" ? (
                          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <span className="text-xs font-bold block">{flag.title}</span>
                          <p className="text-xs text-forest-900/80 dark:text-parchment-200/80 leading-relaxed">
                            {flag.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Required Statutory Filings */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70">
                      {t("mandatory_filings")}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.required_statutory_filings.map((filing, i) => (
                        <div key={i} className="p-3 rounded-lg bg-parchment-100/40 dark:bg-forest-950/40 border border-parchment-200/60 dark:border-forest-800/60 text-xs font-semibold text-forest-900 dark:text-parchment-200 flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{filing}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Applicable Statutes */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70">
                      {t("governing_statutes")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.applicable_statutes.map((statute, i) => (
                        <span key={i} className="px-3 py-1 rounded-md bg-forest-900/5 dark:bg-forest-950/60 border border-parchment-200 dark:border-forest-800 text-[11px] font-mono text-forest-800 dark:text-parchment-300">
                          {statute}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* TKDL Guidance */}
                  {result.tkdl_guidance && (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-xs font-bold text-forest-950 dark:text-parchment-50">
                          {t("tkdl_status_title")}
                        </h4>
                      </div>
                      <p className="text-xs text-forest-900/80 dark:text-parchment-200/80 leading-relaxed">
                        {result.tkdl_guidance.status_note}
                      </p>
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block">
                        {result.tkdl_guidance.verification_step}
                      </span>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <p className="text-[10px] text-forest-900/50 dark:text-parchment-200/50 italic border-t border-parchment-200 dark:border-forest-800 pt-3">
                    {result.disclaimer}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: Interactive Voice IP-SAKTI Kiosk Station */}
        <section className="space-y-8 pt-8 border-t border-parchment-200 dark:border-forest-800">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Monitor className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-display">{t("kiosk_badge")}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-light tracking-tight text-forest-950 dark:text-parchment-50">
              {t("kiosk_title")}
            </h2>
            <p className="text-xs sm:text-sm text-forest-900/70 dark:text-parchment-200/70 leading-relaxed max-w-xl mx-auto">
              {t("kiosk_subtitle")}
            </p>
          </div>

          {/* Kiosk Station Frame */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-forest-950 p-4 sm:p-8 shadow-2xl border-4 border-forest-800 relative overflow-hidden">
            {/* Top Status Bar with Live Indicator & Quick Controls */}
            <div className="flex items-center justify-between pb-6 border-b border-forest-800/80 text-xs text-parchment-300/80 font-mono">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  voiceState === "listening" || voiceState === "transcribing"
                    ? "bg-rose-500 animate-ping"
                    : voiceState === "processing"
                    ? "bg-amber-400 animate-pulse"
                    : voiceState === "speaking"
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-emerald-500"
                }`} />
                <span className="text-white font-bold tracking-wider">IP-SAKTI KIOSK 2.0</span>
                <span className="hidden sm:inline text-parchment-400/60">• REAL-TIME MULTILINGUAL VOICE & LEGAL RAG</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleToggleSpeak}
                  disabled={!kioskAnswer}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    !kioskAnswer
                      ? "opacity-40 cursor-not-allowed bg-forest-900 text-parchment-400 border border-forest-800"
                      : voiceState === "speaking"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                      : "bg-forest-900 hover:bg-forest-800 text-amber-300 border border-amber-500/30"
                  }`}
                  title={voiceState === "speaking" ? "Stop audio speech" : "Listen to audio explanation"}
                  aria-label={voiceState === "speaking" ? "Stop audio speech" : "Listen to audio explanation"}
                >
                  {voiceState === "speaking" ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{voiceState === "speaking" ? t("stop_audio") : t("simulate_audio")}</span>
                </button>
              </div>
            </div>

            {/* Touchscreen Glass Area */}
            <div className="bg-forest-900/80 rounded-2xl p-6 sm:p-8 border border-emerald-500/30 space-y-6 backdrop-blur-md mt-6">
              {/* Header inside Touchscreen: Live AI Badge + Language Selector */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    <span>{t("kiosk_title")}</span>
                    <span className="px-2.5 py-0.5 text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-md">
                      {voiceState === "listening" ? "RECORDING" : voiceState === "processing" ? "REASONING" : voiceState === "speaking" ? "SPEAKING" : "READY"}
                    </span>
                  </h3>
                  <p className="text-sm text-parchment-300/80 font-sans mt-0.5">
                    {language === "ta"
                      ? "தமிழ், இந்தி அல்லது ஆங்கிலத்தில் சட்ட கேள்விகளைக் கேளுங்கள்"
                      : language === "hi"
                      ? "हिंदी, तमिल या अंग्रेजी में कानूनी प्रश्न पूछें"
                      : "Speak your inquiry in English, Hindi, or Tamil"}
                  </p>
                </div>
                <div className="flex space-x-1.5 bg-forest-950/80 p-1.5 rounded-xl border border-forest-800">
                  {(["en", "hi", "ta"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      aria-label={`Switch language to ${l.toUpperCase()}`}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        language === l
                          ? "bg-amber-400 text-forest-950 font-extrabold shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                          : "text-parchment-300 hover:bg-forest-800"
                      }`}
                    >
                      {l === "ta" ? "தமிழ் (Tamil)" : l === "hi" ? "हिंदी (Hindi)" : "EN (English)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Central Voice Station with Animated Interactive States */}
              <div className="flex flex-col items-center justify-center py-8 bg-forest-950/90 rounded-2xl border border-forest-800 space-y-4 relative">
                {/* Active Mic Language Indicator */}
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest-900 border border-amber-500/30 text-amber-300 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>
                    {language === "ta"
                      ? "குரல் மொழி: தமிழ் (ta-IN)"
                      : language === "hi"
                      ? "ध्वनि भाषा: हिंदी (hi-IN)"
                      : "Voice Language: English (en-IN)"}
                  </span>
                </div>
                <button
                  onClick={handleMicrophoneClick}
                  aria-label={
                    voiceState === "speaking"
                      ? "Interrupt speech and speak new question"
                      : voiceState === "listening" || voiceState === "transcribing"
                      ? "Stop listening"
                      : "Start voice inquiry"
                  }
                  title={
                    voiceState === "speaking"
                      ? "Interrupt speech and speak new question"
                      : voiceState === "listening" || voiceState === "transcribing"
                      ? "Stop listening"
                      : "Click to speak"
                  }
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                    voiceState === "listening" || voiceState === "transcribing"
                      ? "bg-rose-600 scale-110 shadow-[0_0_30px_rgba(225,29,72,0.7)] animate-pulse ring-4 ring-rose-400/50"
                      : voiceState === "speaking"
                      ? "bg-emerald-600 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.7)] ring-4 ring-emerald-400/40"
                      : voiceState === "processing"
                      ? "bg-amber-500 scale-100 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-spin"
                      : "bg-gradient-to-br from-amber-400 to-amber-600 text-forest-950 hover:scale-105 shadow-[0_0_25px_rgba(245,158,11,0.5)] ring-2 ring-amber-300/40"
                  }`}
                >
                  {voiceState === "speaking" ? (
                    <Volume2 className="w-10 h-10 text-white animate-bounce" />
                  ) : voiceState === "processing" ? (
                    <Sparkles className="w-10 h-10 text-forest-950" />
                  ) : (
                    <Mic className="w-10 h-10 text-forest-950" />
                  )}
                </button>

                {/* State Label Caption */}
                <div className="text-center space-y-1">
                  <span className="text-base font-bold text-parchment-100 block">
                    {voiceState === "listening"
                      ? (language === "ta" ? "உங்கள் குரல் கேட்கப்படுகிறது (பேசவும்)..." : language === "hi" ? "आपकी आवाज सुनी जा रही है (बोलें)..." : "Listening... Speak your regulatory inquiry now")
                      : voiceState === "transcribing"
                      ? (language === "ta" ? "குரல் படியெடுக்கப்படுகிறது..." : language === "hi" ? "आवाज ट्रांसक्राइब हो रही है..." : "Transcribing your voice...")
                      : voiceState === "processing"
                      ? (language === "ta" ? "சட்ட தரவுத்தளத்தில் ஆய்வு செய்யப்படுகிறது..." : language === "hi" ? "वैधानिक डेटाबेस में विश्लेषण हो रहा है..." : "Analyzing inquiry with Statutory RAG Pipeline...")
                      : voiceState === "speaking"
                      ? (language === "ta" ? "IP-SAKTI பதிலளிக்கிறது (குரல்)..." : language === "hi" ? "IP-SAKTI उत्तर दे रहा है (ऑडियो)..." : "IP-SAKTI is speaking... (Tap mic to interrupt)")
                      : t("speak_btn")}
                  </span>
                  <span className="text-xs text-parchment-300/60 block font-mono">
                    {voiceState === "speaking"
                      ? "Click microphone button anytime to interrupt and speak a new question"
                      : "Click microphone to start / stop speech-to-text"}
                  </span>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="flex items-center space-x-1.5 h-8 pt-1">
                  {[6, 14, 24, 10, 20, 28, 16, 8, 22, 12, 26, 14, 20, 10].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        voiceState === "listening" || voiceState === "transcribing"
                          ? "bg-rose-400"
                          : voiceState === "speaking"
                          ? "bg-emerald-400"
                          : voiceState === "processing"
                          ? "bg-amber-400 animate-pulse"
                          : "bg-forest-800"
                      }`}
                      style={{
                        height: voiceState === "listening" || voiceState === "speaking" ? `${h}px` : voiceState === "transcribing" ? `${h * 0.7}px` : "4px"
                      }}
                    />
                  ))}
                </div>

                {/* Error Notice if Speech/Backend fails */}
                {kioskErrorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 max-w-md text-center">
                    {kioskErrorMessage}
                  </div>
                )}

                {/* Active Inquiry / Live Transcript Box */}
                <div className="w-full max-w-xl px-4">
                  <div className="p-3 bg-forest-900/60 border border-forest-800 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400/80 block mb-1">
                      {hasInteracted ? "Active Voice Transcript" : "Sample Inquiry (Speak or Tap to Ask)"}
                    </span>
                    <p className="text-sm font-medium text-parchment-200 italic">
                      "{transcriptPreview || kioskQuery || defaultPlaceholder}"
                    </p>
                  </div>
                </div>

                {/* Demo Suggestion Chips */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-2xl px-4">
                  <span className="text-xs font-mono text-parchment-400/60 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Quick Inquiries:</span>
                  </span>
                  {(samplePrompts[language] || samplePrompts.en).slice(0, 4).map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleProcessKioskQuery(sample)}
                      disabled={voiceState === "processing"}
                      className="px-2.5 py-1 rounded-lg bg-forest-900/90 hover:bg-forest-800 text-[11px] text-parchment-300 hover:text-amber-300 border border-forest-800 hover:border-amber-500/40 transition-all text-left truncate max-w-xs"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading State when query is being processed */}
              {voiceState === "processing" && (
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3 animate-pulse">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-amber-300">
                    {t("kiosk_analyzing")}
                  </p>
                  <p className="text-xs text-parchment-300/60 font-mono">
                    Checking Patents Act 1970, Ayurvedic Pharmacopoeia (API), and Biodiversity Act
                  </p>
                </div>
              )}

              {/* Spoken Auditory Verdict Box */}
              {voiceState !== "processing" && kioskAnswer && (
                <div className="p-6 rounded-2xl bg-forest-950/90 border border-amber-500/30 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-display text-sm font-bold text-amber-300 uppercase tracking-wider">
                        {t("kiosk_spoken_response")}
                      </span>
                    </div>
                    <button
                      onClick={handleToggleSpeak}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        voiceState === "speaking"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                          : "bg-forest-900 hover:bg-forest-800 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {voiceState === "speaking" ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{voiceState === "speaking" ? t("stop_audio") : t("simulate_audio")}</span>
                    </button>
                  </div>
                  <p className="font-display text-base sm:text-lg text-parchment-100 leading-relaxed font-light whitespace-pre-line">
                    {kioskAnswer}
                  </p>
                </div>
              )}

              {/* Verified Authoritative Citations Drawer */}
              {voiceState !== "processing" && kioskCitations.length > 0 && (
                <div className="p-5 rounded-2xl bg-forest-950/70 border border-forest-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-forest-800/80">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono text-xs uppercase font-bold text-emerald-300 tracking-wider">
                        Grounded Statutory Citations ({kioskCitations.length})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-parchment-400/60">
                      FAISS Vectorstore Grounding
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {kioskCitations.map((cit, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-forest-900/60 border border-forest-800/80 space-y-1.5 hover:border-emerald-500/40 transition-all"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-300 flex items-center gap-1 truncate max-w-[180px]">
                            <FileText className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            <span className="truncate">{cit.title}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            cit.verification_status === "VERIFIED_STATUTORY_RECORD"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}>
                            {cit.verification_status === "VERIFIED_STATUTORY_RECORD" ? "VERIFIED" : "RECORD"}
                          </span>
                        </div>
                        <p className="text-[11px] text-parchment-300/80 line-clamp-2 leading-relaxed italic">
                          "{cit.excerpt}"
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-parchment-400/70 font-mono pt-1">
                          <span>{cit.section}</span>
                          <a
                            href={formatCitationUrl(cit.source_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 underline"
                          >
                            <span>View PDF</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Screen Split: Immediate Verdict + Mobile QR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-forest-950 border border-forest-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold text-emerald-400 block">
                      {t("kiosk_instant_verdict")}
                    </span>
                    {kioskConfidence && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
                        {kioskConfidence.score}% CONFIDENCE
                      </span>
                    )}
                  </div>
                  <p className="font-display text-base sm:text-lg font-bold text-white">
                    {kioskClassification || "Statutory ASU Formulation Evaluation"}
                  </p>
                  <span className="text-xs sm:text-sm text-parchment-300/80 block font-sans">
                    {kioskStatute || "Regulated under Patents Act 1970 & Ayush Statutory Framework"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-forest-950 border border-forest-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-mono text-xs uppercase font-bold text-amber-400 block">
                      {t("mobile_handoff_title")}
                    </span>
                    <p className="text-parchment-200 text-xs sm:text-sm font-semibold">
                      {t("mobile_handoff_title")}
                    </p>
                    <span className="text-xs text-parchment-300/70 block font-sans">
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
