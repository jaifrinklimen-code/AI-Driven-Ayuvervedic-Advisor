import React, { useState } from "react";
import { Navbar } from "../ui/Navbar";
import { Footer } from "../ui/Footer";
import { Globe2 } from "lucide-react";

export const JurisdictionComparison: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<"all" | "patent" | "biodiversity" | "ayush">("all");

  const indiaPillars = [
    {
      topic: "patent",
      title: "Patents Act, 1970 — Section 3(p) Traditional Knowledge",
      description: "Explicit statutory exclusion against patenting traditional knowledge or mere aggregations of known herbal components. Requires unexpected synergistic efficacy data (Combination Index < 1.0).",
      authority: "Office of CGPDTM (IP India)",
      keyRule: "Section 10(4)(d)(ii) mandatory disclosure of Indian biological source origin."
    },
    {
      topic: "patent",
      title: "Patents Act, 1970 — Section 3(e) Mere Admixture",
      description: "Substances resulting merely from the aggregation of the properties of known components cannot be granted a patent unless synergistic technical interaction is established.",
      authority: "Office of CGPDTM",
      keyRule: "Section 3(e) strictly tested against classical Sanskrit texts."
    },
    {
      topic: "biodiversity",
      title: "Biological Diversity Act, 2002 & 2023 Amendments",
      description: "Mandatory prior approval from National Biodiversity Authority (NBA Form III) before grant of patent based on Indian bioresources.",
      authority: "National Biodiversity Authority (NBA) & State Biodiversity Boards (SBB)",
      keyRule: "Section 3 (Foreign approval), Section 6 (IP approval), Section 7 (SBB intimation)."
    },
    {
      topic: "ayush",
      title: "Drugs & Cosmetics Act, 1940 & Rules 1945",
      description: "Chapter IV-A regulates Ayurvedic, Siddha, and Unani (ASU) medicines. Differentiates classical medicines (Sec 3(a)) from proprietary medicines (Sec 3(h)).",
      authority: "Ministry of Ayush / State Licensing Authorities",
      keyRule: "Rule 158B licensing safety and effectiveness requirements; Schedule T GMP standards."
    },
    {
      topic: "ayush",
      title: "FSSAI Ayurveda Aahar Regulations, 2022",
      description: "Dedicated regulatory framework for food/dietary preparations prepared according to classical Ayurvedic recipes.",
      authority: "Food Safety and Standards Authority of India (FSSAI)",
      keyRule: "Mandatory logo and 'NOT FOR MEDICINAL USE' disclaimer."
    }
  ];

  const internationalPillars = [
    {
      topic: "patent",
      title: "WIPO GRATK Treaty (Adopted May 2024)",
      description: "Historic treaty establishing mandatory patent disclosure of the country of origin of genetic resources and indigenous traditional knowledge.",
      authority: "World Intellectual Property Organization (Geneva)",
      keyRule: "Enforces international transparency against biopiracy of Ayurveda and traditional medicines."
    },
    {
      topic: "patent",
      title: "WTO TRIPS Agreement (Article 27)",
      description: "Sets minimum patent standards. Article 27.2 allows exclusion to protect ordre public/health. Article 27.3(b) allows exclusion of plants and animals.",
      authority: "World Trade Organization (WTO)",
      keyRule: "Permits sui generis plant variety protection."
    },
    {
      topic: "biodiversity",
      title: "Nagoya Protocol on Access & Benefit-Sharing",
      description: "Supplementary agreement to the Convention on Biological Diversity (CBD) governing international utilization of genetic resources and traditional knowledge.",
      authority: "CBD Secretariat (UN Environment)",
      keyRule: "Requires Prior Informed Consent (PIC) and Mutually Agreed Terms (MAT)."
    },
    {
      topic: "patent",
      title: "Patent Cooperation Treaty (PCT)",
      description: "Unified procedure for filing patent applications in over 155 contracting states simultaneously.",
      authority: "WIPO PCT Division",
      keyRule: "Single international phase followed by national phase examinations."
    },
    {
      topic: "ayush",
      title: "Madrid System for Trademarks",
      description: "Centralized protection of Ayurvedic brand names across multiple jurisdictions through a single application.",
      authority: "WIPO Brands and Designs Sector",
      keyRule: "Cost-effective international brand expansion."
    }
  ];

  const filteredIndia = activeTopic === "all" ? indiaPillars : indiaPillars.filter(p => p.topic === activeTopic);
  const filteredIntl = activeTopic === "all" ? internationalPillars : internationalPillars.filter(p => p.topic === activeTopic);

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-forest-950 text-forest-950 dark:text-parchment-50 flex flex-col font-sans transition-colors bg-atmospheric">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-parchment-200/60 dark:bg-forest-900/60 text-forest-900 dark:text-amber-300 text-xs font-semibold border border-amber-500/20 shadow-subtle-luxury">
            <Globe2 className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-display">Dual-Regime Topology</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-light tracking-tight text-forest-950 dark:text-parchment-50">
            Jurisdiction Separation Navigator
          </h1>
          <p className="text-sm sm:text-base text-forest-900/70 dark:text-parchment-200/70 leading-relaxed max-w-xl mx-auto">
            Visually isolating Indian Domestic Sovereignty from Multilateral International Treaties to prevent legal conflation.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap p-1.5 bg-white dark:bg-forest-900/70 rounded-2xl border border-amber-500/30 dark:border-forest-800 shadow-subtle-luxury gap-1">
            {[
              { id: "all", label: "All Regulatory Domains" },
              { id: "patent", label: "Patentability & TK Bars" },
              { id: "biodiversity", label: "Biodiversity & ABS" },
              { id: "ayush", label: "AYUSH & Licensing" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTopic(t.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTopic === t.id
                    ? "bg-forest-900 text-parchment-50 dark:bg-amber-400 dark:text-forest-950 shadow-sm"
                    : "text-forest-900/70 dark:text-parchment-200/70 hover:text-forest-950 hover:bg-parchment-100 dark:hover:bg-forest-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Bilateral Topology Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* India Sovereign Column */}
          <div className="bg-white dark:bg-forest-900/60 rounded-3xl border-2 border-emerald-500/30 p-6 sm:p-8 shadow-elevated-luxury space-y-6">
            <div className="flex items-center space-x-3.5 pb-5 border-b border-parchment-200 dark:border-forest-800">
              <span className="text-3xl">🇮🇳</span>
              <div>
                <span className="font-display text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block">
                  National Sovereign Regime
                </span>
                <h2 className="font-display text-2xl font-bold text-forest-950 dark:text-parchment-50">
                  India Domestic Law
                </h2>
                <p className="text-sm text-forest-900/60 dark:text-parchment-300/60 font-sans">
                  Ministry of Ayush • CGPDTM • National Biodiversity Authority
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {filteredIndia.map((p, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-parchment-50/70 dark:bg-forest-950/60 border border-parchment-200 dark:border-forest-800 space-y-2.5 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-display text-base font-bold text-forest-950 dark:text-parchment-100">
                      {p.title}
                    </h3>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/20">
                      Domestic
                    </span>
                  </div>
                  <p className="text-sm text-forest-900/70 dark:text-parchment-300/70 leading-relaxed font-sans">
                    {p.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-forest-900/70 dark:text-parchment-300/70 border-t border-parchment-200/60 dark:border-forest-800/60">
                    <span>Authority: <strong>{p.authority}</strong></span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">{p.keyRule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* International Treaties Column */}
          <div className="bg-white dark:bg-forest-900/60 rounded-3xl border-2 border-blue-500/30 p-6 sm:p-8 shadow-elevated-luxury space-y-6">
            <div className="flex items-center space-x-3.5 pb-5 border-b border-parchment-200 dark:border-forest-800">
              <Globe2 className="w-8 h-8 text-blue-600" />
              <div>
                <span className="font-display text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 block">
                  Multilateral Treaty Regime
                </span>
                <h2 className="font-display text-2xl font-bold text-forest-950 dark:text-parchment-50">
                  International Frameworks
                </h2>
                <p className="text-sm text-forest-900/60 dark:text-parchment-300/60 font-sans">
                  WIPO • WTO TRIPS • CBD Nagoya Protocol
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {filteredIntl.map((p, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-parchment-50/70 dark:bg-forest-950/60 border border-parchment-200 dark:border-forest-800 space-y-2.5 hover:border-blue-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-display text-base font-bold text-forest-950 dark:text-parchment-100">
                      {p.title}
                    </h3>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-800 dark:text-blue-300 font-bold border border-blue-500/20">
                      Treaty
                    </span>
                  </div>
                  <p className="text-sm text-forest-900/70 dark:text-parchment-300/70 leading-relaxed font-sans">
                    {p.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-forest-900/70 dark:text-parchment-300/70 border-t border-parchment-200/60 dark:border-forest-800/60">
                    <span>Authority: <strong>{p.authority}</strong></span>
                    <span className="text-blue-700 dark:text-blue-400 font-medium">{p.keyRule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JurisdictionComparison;
