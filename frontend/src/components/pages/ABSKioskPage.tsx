import React, { useState } from "react";
import { Navbar } from "../ui/Navbar";
import { Footer } from "../ui/Footer";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Mic,
  Volume2,
  QrCode,
  Monitor
} from "lucide-react";

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
  const [entityType, setEntityType] = useState("indian_entity");
  const [resourceOrigin, setResourceOrigin] = useState("cultivated");
  const [purpose, setPurpose] = useState("commercial_utilization");
  const [resourceName, setResourceName] = useState("Withania somnifera (Ashwagandha)");
  const [tkInvolved, setTkInvolved] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ABSComplianceResult | null>(null);

  // Kiosk Showcase State
  const [kioskLanguage, setKioskLanguage] = useState<"en" | "hi" | "ta">("en");
  const [isRecording, setIsRecording] = useState(false);
  const [kioskSpeaking, setKioskSpeaking] = useState(false);
  const [kioskQuery, setKioskQuery] = useState("Can I patent an Ayurvedic brain syrup made with Ashwagandha and Brahmi?");

  const handleEvaluateABS = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/abs-check", {
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

  const handleVoiceSimulation = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setKioskQuery("Do I need NBA Form III approval before patent grant for a Curcumin extract?");
    }, 1800);
  };

  const handleSpeak = () => {
    setKioskSpeaking(true);
    setTimeout(() => {
      setKioskSpeaking(false);
    }, 3200);
  };

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-forest-950 text-forest-950 dark:text-parchment-50 flex flex-col font-sans transition-colors bg-atmospheric">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* SECTION 1: ABS Clearance Engine */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-parchment-200/60 dark:bg-forest-900/60 text-forest-900 dark:text-amber-300 text-xs font-semibold border border-amber-500/20 shadow-subtle-luxury">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-cinzel">Biological Diversity Act (2002 & 2023)</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-forest-950 dark:text-parchment-50">
              ABS & Traditional Knowledge Terminal
            </h1>
            <p className="text-xs sm:text-sm text-forest-900/70 dark:text-parchment-200/70 leading-relaxed max-w-xl mx-auto">
              Evaluate National Biodiversity Authority (NBA Form I/III) filings, SBB commercial intimation, and TKDL defensive prior-art pointers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Input Card */}
            <div className="lg:col-span-5 bg-white dark:bg-forest-900/70 rounded-3xl p-6 sm:p-8 border border-amber-500/30 dark:border-forest-700/60 shadow-elevated-luxury space-y-5 backdrop-blur-xl">
              <h2 className="font-serif text-lg font-bold text-forest-950 dark:text-parchment-50 pb-3 border-b border-parchment-200 dark:border-forest-800">
                Biological Resource Profile
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70 mb-1.5">
                  Resource Botanical / Sanskrit Name
                </label>
                <input
                  type="text"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  className="w-full bg-parchment-50 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70 mb-1.5">
                  Entity Legal Status
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full bg-parchment-50 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="indian_entity">Indian Citizen / Domestic Corporate Entity</option>
                  <option value="foreign_entity">Foreign National / Foreign-Controlled Entity (Section 3)</option>
                  <option value="nri">Non-Resident Indian (NRI)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70 mb-1.5">
                  Source of Biological Resource
                </label>
                <select
                  value={resourceOrigin}
                  onChange={(e) => setResourceOrigin(e.target.value)}
                  className="w-full bg-parchment-50 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="cultivated">Cultivated from Indian Agricultural Lands</option>
                  <option value="wild_harvested">Wild-Harvested from Indian Forests (High ABS Exposure)</option>
                  <option value="market_commodity">Normally Traded Commodity (NTAC Exemption Sec 40)</option>
                  <option value="imported">Imported from Outside India</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900/70 dark:text-parchment-200/70 mb-1.5">
                  Intended Activity Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-parchment-50 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="commercial_utilization">Commercial Utilization / Manufacturing</option>
                  <option value="ip_application">Filing Patent / IP Right Application (Section 6)</option>
                  <option value="research">Collaborative Academic / Industrial Research</option>
                  <option value="bio_survey">Bio-survey and Bio-utilization</option>
                </select>
              </div>

              <label className="flex items-center space-x-2 text-xs cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={tkInvolved}
                  onChange={(e) => setTkInvolved(e.target.checked)}
                  className="text-amber-600 rounded"
                />
                <span className="text-forest-900/80 dark:text-parchment-200">
                  Associated Traditional Knowledge involved
                </span>
              </label>

              <button
                type="button"
                onClick={handleEvaluateABS}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-parchment-50 dark:text-forest-950 text-xs font-bold shadow-md transition-all mt-4"
              >
                {loading ? "Analyzing NBA / SBB Statutes..." : "Evaluate ABS & TKDL Requirements"}
              </button>
            </div>

            {/* Assessment Dossier Output */}
            <div className="lg:col-span-7">
              {result ? (
                <div className="bg-white dark:bg-forest-900/70 rounded-3xl p-6 sm:p-8 border border-amber-500/30 dark:border-forest-700/60 shadow-elevated-luxury space-y-6 animate-in fade-in-50">
                  <div className="flex items-center justify-between pb-4 border-b border-parchment-200 dark:border-forest-800">
                    <div>
                      <span className="font-cinzel text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 block mb-0.5">
                        ABS Compliance Assessment
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-forest-950 dark:text-parchment-50">
                        {result.resource_analyzed}
                      </h3>
                    </div>
                    <span className="px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-500/30">
                      {result.overall_status}
                    </span>
                  </div>

                  {/* Compliance Flags */}
                  <div className="space-y-3">
                    <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-forest-900/60 dark:text-parchment-300/60 block">
                      Statutory Compliance Flags
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
                    <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-forest-900/60 dark:text-parchment-300/60 block">
                      Mandatory Filings Required
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
                    <span className="font-cinzel font-bold text-amber-700 dark:text-amber-400 block">
                      Traditional Knowledge Digital Library (TKDL) Pointer
                    </span>
                    <p className="text-forest-900/80 dark:text-parchment-300/80 leading-relaxed font-sans">
                      {result.tkdl_guidance.status_note}
                    </p>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block pt-1">
                      Action: {result.tkdl_guidance.verification_step}
                    </span>
                  </div>

                  <div className="text-[11px] text-forest-900/60 dark:text-parchment-300/60 bg-parchment-50 dark:bg-forest-950 p-3 rounded-xl border border-parchment-200 dark:border-forest-800">
                    <strong>Statutory Disclaimer:</strong> {result.disclaimer}
                  </div>
                </div>
              ) : (
                <div className="h-full bg-white dark:bg-forest-900/60 rounded-3xl p-12 border border-parchment-200 dark:border-forest-800 shadow-subtle-luxury flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-parchment-100 dark:bg-forest-800 flex items-center justify-center text-amber-500">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-forest-950 dark:text-parchment-50">
                    Run Biodiversity Clearance Audit
                  </h3>
                  <p className="text-xs text-forest-900/60 dark:text-parchment-300/60 max-w-sm">
                    Specify whether biological material was wild-harvested or cultivated to determine Section 6 / Section 7 NBA filing mandates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: IP-SAKTI Smart Kiosk Showcase */}
        <section id="kiosk" className="pt-12 border-t border-parchment-200/80 dark:border-forest-900/60 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-parchment-200/60 dark:bg-forest-900/60 text-forest-900 dark:text-amber-300 text-xs font-semibold border border-amber-500/20 shadow-subtle-luxury">
              <Monitor className="w-3.5 h-3.5 text-rose-600" />
              <span className="font-cinzel">Accessible Physical Deployment Layer</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-forest-950 dark:text-parchment-50">
              IP-SAKTI Smart Kiosk Simulator
            </h2>
            <p className="text-xs sm:text-sm text-forest-900/70 dark:text-parchment-200/70 leading-relaxed max-w-md mx-auto">
              Tactile hardware kiosk interface designed for deployment across Ayurvedic colleges, incubation centers, and herbal farmer mandis.
            </p>
          </div>

          {/* Luxury Hardware Kiosk Chassis */}
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-forest-950 to-black text-parchment-50 rounded-3xl p-6 sm:p-10 border-4 border-forest-900/80 shadow-2xl space-y-6">
            {/* Kiosk Bezel Header */}
            <div className="flex items-center justify-between pb-6 border-b border-forest-900 text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-amber-300 font-bold tracking-widest text-[10px] uppercase">
                  IP-SAKTI KIOSK OS v2.4 • STATION AIIA-01
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSpeak}
                  className="px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-amber-300 flex items-center space-x-1.5 font-bold transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{kioskSpeaking ? "Synthesizing Audio..." : "Simulate Audio Speech"}</span>
                </button>
              </div>
            </div>

            {/* Touchscreen Glass Area */}
            <div className="bg-forest-900/70 rounded-2xl p-6 sm:p-8 border border-forest-800 space-y-6 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">Touch to Ask IP-SAKTI</h3>
                  <p className="text-xs text-parchment-300/70 font-sans">Multi-lingual Voice Assistance in English, Hindi, and Tamil</p>
                </div>
                <div className="flex space-x-1.5">
                  {(["en", "hi", "ta"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setKioskLanguage(l)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        kioskLanguage === l
                          ? "bg-amber-400 text-forest-950 font-extrabold"
                          : "bg-forest-950 text-parchment-300 hover:bg-forest-800"
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Central Audio Microphone Simulator */}
              <div className="flex flex-col items-center justify-center py-10 bg-forest-950/80 rounded-2xl border border-forest-800 space-y-4">
                <button
                  onClick={handleVoiceSimulation}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording
                      ? "bg-rose-600 scale-110 shadow-lg shadow-rose-600/50 animate-pulse"
                      : "bg-gradient-to-br from-amber-400 to-amber-600 text-forest-950 hover:scale-105 shadow-glow-gold"
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>
                <span className="text-xs font-bold text-parchment-200">
                  {isRecording ? "Listening to Voice Input..." : "Tap to Speak Regulatory Inquiry"}
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

                <p className="text-xs text-parchment-300/70 italic max-w-md text-center px-4">
                  "{kioskQuery}"
                </p>
              </div>

              {/* Screen Split: Immediate Verdict + Mobile QR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-forest-950 border border-forest-800 space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 block">
                    Instant Classification
                  </span>
                  <p className="font-serif text-base font-bold text-white">
                    Patent / Proprietary Ayurvedic Medicine
                  </p>
                  <span className="text-parchment-300/60 block font-sans">
                    Regulated under Drugs & Cosmetics Act Section 3(h)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-forest-950 border border-forest-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block">
                      Mobile Session Handoff
                    </span>
                    <p className="text-parchment-200 text-xs font-semibold">
                      Scan QR Code to save dossier
                    </p>
                    <span className="text-[10px] text-parchment-300/60 block font-sans">
                      Carries session history to phone
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <QrCode className="w-12 h-12 text-forest-950" />
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
