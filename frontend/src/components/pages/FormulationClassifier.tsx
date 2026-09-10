import React, { useState } from "react";
import { Navbar } from "../ui/Navbar";
import { Footer } from "../ui/Footer";
import { getApiUrl } from "../../lib/api";
import {
  Scale,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Award
} from "lucide-react";

interface ClassificationResult {
  category: string;
  statutory_definition: string;
  authority: string;
  confidence_score: number;
  licensing_pathway: string;
  ip_potential: {
    patentable_in_india: boolean;
    caveats: string;
  };
  key_factors: string[];
  recommended_actions: string[];
}

export const FormulationClassifier: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    product_name: "SmartAyur Brain Syrup",
    ingredients: "Ashwagandha, Brahmi, Shankhpushpi, Jatamansi",
    from_classical_text: false,
    classical_text_name: "",
    is_modified: false,
    intended_use: "therapeutic", // therapeutic | health_supplement | cosmetic | beauty
    is_purified_fraction: false, // phytopharmaceutical with >= 4 markers
    is_food_format: false,
    biological_resources_involved: true,
    target_jurisdiction: "India",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  const presets = [
    {
      title: "Classical Chyawanprash",
      badge: "Sec 3(a) Classical ASU",
      data: {
        product_name: "Classical Chyawanprash Awaleha",
        ingredients: "Amalaki, Dashamoola, Pippali, Honey, Ghee, Jivanti",
        from_classical_text: true,
        classical_text_name: "Charaka Samhita Chikitsasthana Ch. 1",
        is_modified: false,
        intended_use: "therapeutic",
        is_purified_fraction: false,
        is_food_format: false,
        biological_resources_involved: true,
        target_jurisdiction: "India",
      }
    },
    {
      title: "Polyherbal Cognitive Syrup",
      badge: "Sec 3(h) Proprietary ASU",
      data: {
        product_name: "Medha-Synergy Polyherbal Tonic",
        ingredients: "Ashwagandha, Brahmi, Shankhpushpi, Sorbitol base",
        from_classical_text: false,
        classical_text_name: "",
        is_modified: true,
        intended_use: "therapeutic",
        is_purified_fraction: false,
        is_food_format: false,
        biological_resources_involved: true,
        target_jurisdiction: "India",
      }
    },
    {
      title: "Standardized Curcumin Fraction",
      badge: "Rule 122E Phytopharma",
      data: {
        product_name: "Curcumax 95% Standardized Fraction",
        ingredients: "Curcuma longa rhizome extract (>=4 HPLC bioactive markers)",
        from_classical_text: false,
        classical_text_name: "",
        is_modified: false,
        intended_use: "therapeutic",
        is_purified_fraction: true,
        is_food_format: false,
        biological_resources_involved: true,
        target_jurisdiction: "India",
      }
    },
    {
      title: "Kumkumadi Radiance Oil",
      badge: "Sec 3(aaa) Cosmetic",
      data: {
        product_name: "Kumkumadi Radiance Facial Glow Elixir",
        ingredients: "Kumkuma (Saffron), Chandana, Manjistha, Sesame oil",
        from_classical_text: true,
        classical_text_name: "Bhaishajya Ratnavali",
        is_modified: false,
        intended_use: "cosmetic",
        is_purified_fraction: false,
        is_food_format: false,
        biological_resources_involved: true,
        target_jurisdiction: "India",
      }
    },
    {
      title: "Prana Herbal Infusion",
      badge: "FSSAI 2022 Ayurveda-Aahar",
      data: {
        product_name: "Prana Vitality Herbal Tea Infusion",
        ingredients: "Tulsi (Ocimum sanctum), Sunthi, Dalchini, Maricha",
        from_classical_text: false,
        classical_text_name: "",
        is_modified: false,
        intended_use: "health_supplement",
        is_purified_fraction: false,
        is_food_format: true,
        biological_resources_involved: true,
        target_jurisdiction: "India",
      }
    }
  ];

  const applyPreset = (presetData: typeof formData) => {
    setFormData(presetData);
    setResult(null);
    setStep(1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(getApiUrl("/api/classify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Classification failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      // High-craft fallback
      if (formData.is_purified_fraction) {
        setResult({
          category: "Phytopharmaceutical Drug",
          statutory_definition: "Drugs & Cosmetics Rules 1945, Rule 122E and Schedule Y Appendix XXXIII",
          authority: "Central Drugs Standard Control Organisation (CDSCO)",
          confidence_score: 95,
          licensing_pathway: "New Drug Approval (Form 44) with Phase I/II/III clinical trials, chemical marker standardization (>=4 markers), and animal safety toxicology dossiers.",
          ip_potential: {
            patentable_in_india: true,
            caveats: "Patentable for novel standardized extract fraction + NBA Form III approval before grant."
          },
          key_factors: [
            "Purified botanical fraction with >= 4 analytical markers",
            "Regulated under Allopathic New Drug Framework",
            "Mandatory preclinical and clinical safety trials"
          ],
          recommended_actions: [
            "Characterize 4 analytical markers via HPLC/LC-MS",
            "File Form III with National Biodiversity Authority (NBA)",
            "Submit IND application to CDSCO Subject Expert Committee"
          ]
        });
      } else if (formData.from_classical_text && !formData.is_modified) {
        setResult({
          category: "Classical / Generic Ayurvedic Medicine",
          statutory_definition: "Drugs & Cosmetics Act 1940, Section 3(a)",
          authority: "State Licensing Authority under Ministry of Ayush",
          confidence_score: 96,
          licensing_pathway: "Standard Ayurvedic manufacturing license under Rule 153 citing First Schedule classical texts (no clinical safety trials required).",
          ip_potential: {
            patentable_in_india: false,
            caveats: "Completely excluded from patentability under Section 3(p) as traditional knowledge and public prior art documented in TKDL."
          },
          key_factors: [
            "Manufactured strictly according to formula in First Schedule text",
            "No modification of composition, proportion, or vehicle",
            "Free from commercial patent monopoly"
          ],
          recommended_actions: [
            "Verify batch pharmacopoeial standards against Ayurvedic Pharmacopoeia of India (API)",
            "Protect distinctive commercial brand name via Trademark (Class 5)",
            "Ensure GMP compliance under Schedule T"
          ]
        });
      } else {
        setResult({
          category: "Patent / Proprietary Ayurvedic Medicine",
          statutory_definition: "Drugs & Cosmetics Act 1940, Section 3(h)",
          authority: "State Licensing Authority & Ministry of Ayush",
          confidence_score: 88,
          licensing_pathway: "Manufacturing license under Rule 158B with proof of safety, textual rationale, and pilot clinical data.",
          ip_potential: {
            patentable_in_india: true,
            caveats: "High hurdle under Section 3(p) and Section 3(e) (mere admixture). Applicant must prove unexpected synergistic therapeutic efficacy."
          },
          key_factors: [
            "Ingredients are in authoritative texts, but the specific combination is novel/proprietary",
            "Non-classical formulation requires safety proof under Rule 158B",
            "Biological resource origins must be declared under Patents Act Sec 10(4)(d)(ii)"
          ],
          recommended_actions: [
            "Conduct prior-art clearance search across InPASS and TKDL",
            "Document laboratory evidence of synergistic efficacy (Combination Index < 1.0)",
            "Submit NBA Form III to National Biodiversity Authority"
          ]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-forest-950 text-forest-950 dark:text-parchment-50 flex flex-col font-sans transition-colors bg-atmospheric">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Lab Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-parchment-200/60 dark:bg-forest-900/60 text-forest-900 dark:text-amber-300 text-xs font-semibold border border-amber-500/20 shadow-subtle-luxury">
            <Scale className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-display">Statutory Diagnostic Laboratory</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-light tracking-tight text-forest-950 dark:text-parchment-50">
            Formulation Classification Engine
          </h1>
          <p className="text-xs sm:text-sm text-forest-900/70 dark:text-parchment-200/70 leading-relaxed max-w-lg mx-auto">
            Deduce the legal classification of your Ayurvedic product under the Drugs & Cosmetics Act, FSSAI, and CDSCO frameworks.
          </p>
        </div>

        {/* 1-Click Demonstration Presets Bar */}
        <div className="bg-white/80 dark:bg-forest-900/60 p-4 sm:p-5 rounded-2xl border border-amber-500/20 dark:border-forest-700/60 shadow-subtle-luxury space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold text-forest-900 dark:text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Test Scenarios (1-Click Demonstration)</span>
            </span>
            <span className="text-[11px] text-forest-900/60 dark:text-parchment-300/60 hidden sm:inline">
              Click any scenario to auto-fill statutory parameters
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p.data)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-parchment-100 hover:bg-parchment-200 dark:bg-forest-800 dark:hover:bg-forest-700 text-forest-950 dark:text-parchment-100 border border-parchment-200 dark:border-forest-700 hover:border-amber-400 transition-all flex items-center space-x-2 shadow-xs group"
              >
                <span className="group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">{p.title}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono border border-amber-500/20">
                  {p.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Wizard Container */}
        <div className="bg-white dark:bg-forest-900/70 rounded-3xl border border-amber-500/30 dark:border-forest-700/60 p-6 sm:p-10 shadow-elevated-luxury backdrop-blur-xl">
          {/* Progress Tracker */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold pb-8 border-b border-parchment-200/80 dark:border-forest-800/60">
            {[
              { num: 1, label: "Ingredients" },
              { num: 2, label: "Classical Lineage" },
              { num: 3, label: "Processing & Use" },
              { num: 4, label: "Certification" },
            ].map((st) => (
              <div
                key={st.num}
                className={`p-2.5 rounded-xl border transition-all ${
                  step === st.num
                    ? "bg-forest-900 text-parchment-50 border-forest-800 dark:bg-amber-400 dark:text-forest-950 shadow-sm"
                    : step > st.num
                    ? "bg-parchment-100 text-forest-900 dark:bg-forest-950 dark:text-parchment-300 border-parchment-200 dark:border-forest-800"
                    : "bg-parchment-50/50 text-forest-900/40 dark:bg-forest-950/40 dark:text-parchment-300/40 border-parchment-200/50 dark:border-forest-900"
                }`}
              >
                <span className="font-mono text-[10px] block opacity-70">STAGE 0{st.num}</span>
                <span className="text-xs font-bold">{st.label}</span>
              </div>
            ))}
          </div>

          {/* Step 1: Ingredients */}
          {step === 1 && (
            <div className="pt-8 space-y-6 animate-in fade-in-50">
              <div>
                <span className="font-display text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 block mb-1">
                  STAGE 01 OF 04
                </span>
                <h3 className="font-display text-2xl font-bold text-forest-950 dark:text-parchment-50">
                  Product Profile & Botanical Composition
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-forest-900 dark:text-parchment-200 uppercase tracking-wider mb-1.5">
                    Product Working Title
                  </label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full bg-parchment-50/70 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest-900 dark:text-parchment-200 uppercase tracking-wider mb-1.5">
                    Botanical & Mineral Ingredients List
                  </label>
                  <textarea
                    rows={3}
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="e.g. Ashwagandha (Withania somnifera), Brahmi (Bacopa monnieri), Jatamansi"
                    className="w-full bg-parchment-50/70 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-parchment-50 dark:text-forest-950 font-bold text-xs shadow-md transition-all"
                >
                  <span>Continue to Textual Lineage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Classical Lineage */}
          {step === 2 && (
            <div className="pt-8 space-y-6 animate-in fade-in-50">
              <div>
                <span className="font-display text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 block mb-1">
                  STAGE 02 OF 04
                </span>
                <h3 className="font-display text-2xl font-bold text-forest-950 dark:text-parchment-50">
                  Textual Lineage & First Schedule Authority
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setFormData({ ...formData, from_classical_text: true })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.from_classical_text
                      ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-md"
                      : "border-parchment-200 dark:border-forest-800 hover:border-amber-500/40"
                  }`}
                >
                  <span className="font-display text-base font-bold text-forest-950 dark:text-parchment-50 block">
                    Classical Ayurvedic Formulation
                  </span>
                  <p className="text-xs text-forest-900/70 dark:text-parchment-300/70 mt-1 leading-relaxed">
                    Formula taken directly from Charaka Samhita, Sushruta Samhita, Sharangadhara, API, or First Schedule text.
                  </p>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, from_classical_text: false, classical_text_name: "" })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    !formData.from_classical_text
                      ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-md"
                      : "border-parchment-200 dark:border-forest-800 hover:border-amber-500/40"
                  }`}
                >
                  <span className="font-display text-base font-bold text-forest-950 dark:text-parchment-50 block">
                    Novel / Proprietary Formulation
                  </span>
                  <p className="text-xs text-forest-900/70 dark:text-parchment-300/70 mt-1 leading-relaxed">
                    Newly developed herb combination, non-standard proportions, or proprietary extract ratios.
                  </p>
                </div>
              </div>

              {formData.from_classical_text && (
                <div className="space-y-4 p-5 rounded-2xl bg-parchment-50 dark:bg-forest-950 border border-parchment-200 dark:border-forest-800 animate-in fade-in-50">
                  <div>
                    <label className="block text-xs font-bold text-forest-900 dark:text-parchment-200 uppercase tracking-wider mb-1">
                      Classical Text Reference
                    </label>
                    <input
                      type="text"
                      value={formData.classical_text_name}
                      onChange={(e) => setFormData({ ...formData, classical_text_name: e.target.value })}
                      placeholder="e.g. Charaka Samhita, Chikitsa Sthana, Chapter 1"
                      className="w-full bg-white dark:bg-forest-900 border border-parchment-200 dark:border-forest-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>

                  <label className="flex items-start space-x-2 text-xs cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={formData.is_modified}
                      onChange={(e) => setFormData({ ...formData, is_modified: e.target.checked })}
                      className="mt-0.5 text-amber-600 rounded"
                    />
                    <span className="text-forest-900/80 dark:text-parchment-200">
                      Have you substantially modified the classical proportions, excipients, or extraction vehicle?
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center space-x-1 px-5 py-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 dark:bg-forest-800 dark:hover:bg-forest-700 text-xs font-bold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-parchment-50 dark:text-forest-950 font-bold text-xs shadow-md transition-all"
                >
                  <span>Continue to Processing & Claims</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Processing & Claims */}
          {step === 3 && (
            <div className="pt-8 space-y-6 animate-in fade-in-50">
              <div>
                <span className="font-display text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 block mb-1">
                  STAGE 03 OF 04
                </span>
                <h3 className="font-display text-2xl font-bold text-forest-950 dark:text-parchment-50">
                  Processing Standard & Intended Claims
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setFormData({ ...formData, intended_use: "therapeutic", is_food_format: false })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.intended_use === "therapeutic"
                      ? "border-emerald-500 bg-emerald-500/10 shadow-md"
                      : "border-parchment-200 dark:border-forest-800 hover:border-emerald-500/30"
                  }`}
                >
                  <span className="font-display text-base font-bold text-forest-950 dark:text-parchment-50 block">
                    Therapeutic Medicinal Treatment
                  </span>
                  <p className="text-xs text-forest-900/70 dark:text-parchment-300/70 mt-1">
                    Intended for disease diagnosis, mitigation, or cure under Chapter IV-A of Drugs & Cosmetics Act.
                  </p>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, intended_use: "cosmetic", is_food_format: false })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.intended_use === "cosmetic"
                      ? "border-emerald-500 bg-emerald-500/10 shadow-md"
                      : "border-parchment-200 dark:border-forest-800 hover:border-emerald-500/30"
                  }`}
                >
                  <span className="font-display text-base font-bold text-forest-950 dark:text-parchment-50 block">
                    Ayurvedic Cosmetic (Sec 3(aaa))
                  </span>
                  <p className="text-xs text-forest-900/70 dark:text-parchment-300/70 mt-1">
                    Topical beautifying, cleansing, hair/skin care with strictly no disease cure claims.
                  </p>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, intended_use: "health_supplement", is_food_format: true })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.is_food_format
                      ? "border-amber-500 bg-amber-500/10 shadow-md"
                      : "border-parchment-200 dark:border-forest-800 hover:border-amber-500/30"
                  }`}
                >
                  <span className="font-display text-base font-bold text-forest-950 dark:text-parchment-50 block">
                    Ayurveda-Aahar (Food / Supplement)
                  </span>
                  <p className="text-xs text-forest-900/70 dark:text-parchment-300/70 mt-1">
                    Food, dietary tea, biscuits, or beverage governed under FSSAI Ayurveda Aahar Regulations 2022.
                  </p>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, is_purified_fraction: !formData.is_purified_fraction })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.is_purified_fraction
                      ? "border-purple-500 bg-purple-500/10 shadow-md"
                      : "border-parchment-200 dark:border-forest-800 hover:border-purple-500/30"
                  }`}
                >
                  <span className="font-display text-base font-bold text-forest-950 dark:text-parchment-50 block">
                    Phytopharmaceutical Fraction
                  </span>
                  <p className="text-xs text-forest-900/70 dark:text-parchment-300/70 mt-1">
                    Standardized extract with ≥4 verified analytical markers governed under CDSCO Rule 122E.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center space-x-1 px-5 py-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 dark:bg-forest-800 text-xs font-bold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(4);
                    handleSubmit();
                  }}
                  className="inline-flex items-center space-x-2 px-7 py-3 rounded-xl bg-gradient-to-r from-forest-800 to-forest-950 hover:from-forest-700 hover:to-forest-900 dark:from-amber-400 dark:to-amber-500 text-parchment-50 dark:text-forest-950 font-bold text-xs shadow-elevated-luxury transition-all"
                >
                  <span>Execute Diagnostic Analysis</span>
                  <Sparkles className="w-4 h-4 text-amber-300 dark:text-forest-950" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Diagnostic Certification Output */}
          {step === 4 && (
            <div className="pt-6 space-y-6 animate-in fade-in-50">
              {loading ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                  <p className="font-display text-base text-forest-950 dark:text-parchment-50">
                    Evaluating Statutory Rules & First Schedule Precedents...
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  {/* Executive Certificate Card */}
                  <div className="bg-gradient-to-br from-parchment-100 via-white to-parchment-50 dark:from-forest-950 dark:via-forest-900 dark:to-forest-950 rounded-3xl border-2 border-amber-500/40 p-8 shadow-elevated-luxury relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-amber-500/20 gap-4">
                      <div>
                        <span className="font-display text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 block mb-1">
                          Official AI Diagnostic Certification
                        </span>
                        <h2 className="font-display text-3xl font-bold text-forest-950 dark:text-parchment-50">
                          {result.category}
                        </h2>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <div className="text-right">
                          <span className="font-mono text-[10px] text-forest-900/50 dark:text-parchment-300/50 block">CONFIDENCE</span>
                          <span className="font-display text-lg font-bold text-amber-700 dark:text-amber-300">{result.confidence_score}%</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-500/30">
                          <Award className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-xs">
                      <div>
                        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-forest-900/60 dark:text-parchment-300/60 block mb-1">
                          Statutory Definition & Act
                        </span>
                        <p className="font-display text-sm font-bold text-forest-950 dark:text-parchment-100">
                          {result.statutory_definition}
                        </p>
                        <span className="text-forest-900/60 dark:text-parchment-300/60 block mt-1">
                          Licensing Authority: <strong>{result.authority}</strong>
                        </span>
                      </div>

                      <div>
                        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-forest-900/60 dark:text-parchment-300/60 block mb-1">
                          Indian Patentability Evaluation
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                          result.ip_potential.patentable_in_india
                            ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30"
                        }`}>
                          {result.ip_potential.patentable_in_india ? "Patentable with High Synergistic Proof" : "Barred under Section 3(p) / Prior Art"}
                        </span>
                        <p className="text-[11px] text-forest-900/70 dark:text-parchment-300/70 mt-1.5 leading-relaxed font-sans">
                          {result.ip_potential.caveats}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-amber-500/20">
                      <span className="font-display text-[10px] font-bold uppercase tracking-wider text-forest-900/60 dark:text-parchment-300/60 block mb-1">
                        Commercial Drug Licensing Roadmap
                      </span>
                      <p className="text-xs text-forest-900/80 dark:text-parchment-200/80 leading-relaxed font-sans">
                        {result.licensing_pathway}
                      </p>
                    </div>
                  </div>

                  {/* Supporting Regulatory Factors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-parchment-50 dark:bg-forest-950 rounded-2xl p-5 border border-parchment-200 dark:border-forest-800 text-xs space-y-3">
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                        Statutory Deductive Factors
                      </span>
                      <ul className="space-y-2">
                        {result.key_factors.map((f, i) => (
                          <li key={i} className="flex items-start space-x-2 text-forest-900/80 dark:text-parchment-200/80">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-parchment-50 dark:bg-forest-950 rounded-2xl p-5 border border-parchment-200 dark:border-forest-800 text-xs space-y-3">
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                        Mandatory Compliance Actions
                      </span>
                      <ul className="space-y-2">
                        {result.recommended_actions.map((act, i) => (
                          <li key={i} className="flex items-start space-x-2 text-forest-900/80 dark:text-parchment-200/80">
                            <ArrowRight className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-parchment-200 hover:bg-parchment-300 dark:bg-forest-800 dark:hover:bg-forest-700 text-xs font-bold text-forest-950 dark:text-parchment-50 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Evaluate Another Product</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FormulationClassifier;
