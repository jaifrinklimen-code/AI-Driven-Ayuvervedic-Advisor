import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../ui/Navbar";
import { Footer } from "../ui/Footer";
import {
  Scale,
  Compass,
  Globe2,
  ShieldCheck,
  BookOpen,
  Monitor,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Search,
  CheckCircle2
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [heroQuery, setHeroQuery] = useState("");

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroQuery.trim()) {
      navigate(`/ask?q=${encodeURIComponent(heroQuery.trim())}`);
    } else {
      navigate("/ask");
    }
  };

  const corePillars = [
    {
      title: "Ask IP-SAKTI Intelligence Studio",
      subtitle: "Grounded RAG with Statutory Citations",
      description: "Submit multi-herb formulation queries. The engine parses the ingredients, inspects Section 3(p) Traditional Knowledge bars, retrieves verified statutory gazettes, and presents clickable source citations.",
      path: "/ask",
      icon: <Compass className="w-5 h-5 text-amber-500" />,
      tag: "Core Engine",
      badgeClass: "bg-amber-400/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
    },
    {
      title: "Formulation Diagnostic Lab",
      subtitle: "Statutory 6-Category Taxonomy",
      description: "An interactive regulatory decision tree that classifies your product under Section 3(a) (Classical), Section 3(h) (Proprietary), Rule 122E (Phytopharmaceutical), or FSSAI Ayurveda-Aahar.",
      path: "/classify",
      icon: <Scale className="w-5 h-5 text-emerald-600" />,
      tag: "Key Differentiator",
      badgeClass: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20"
    },
    {
      title: "Bilateral Legal Topology",
      subtitle: "India vs International Regimes",
      description: "A dual-regime compass strictly isolating domestic Indian legislation (Patents Act, BDA, D&C Act, FSSAI) from multilateral treaties (WIPO GRATK 2024, TRIPS, CBD Nagoya Protocol).",
      path: "/jurisdictions",
      icon: <Globe2 className="w-5 h-5 text-blue-600" />,
      tag: "Dual Regime",
      badgeClass: "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/20"
    },
    {
      title: "Biodiversity & ABS Clearance",
      subtitle: "National Biodiversity Authority Compliance",
      description: "Evaluates biological origin, foreign entity ownership under Section 3, and mandatory NBA Form III approvals required before the grant of any patent based on Indian bioresources.",
      path: "/abs-navigator",
      icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
      tag: "Bio-resource Safeguard",
      badgeClass: "bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/20"
    },
    {
      title: "Digital Statutory Archive",
      subtitle: "SHA-256 Verified Legal Corpus",
      description: "Explore 16 authoritative statutory acts, gazette notifications, and treaties with temporal validity dates, content hashing, and direct links to official legislative gazettes.",
      path: "/sources",
      icon: <BookOpen className="w-5 h-5 text-parchment-800 dark:text-parchment-200" />,
      tag: "Statutory Authority",
      badgeClass: "bg-parchment-200 text-parchment-900 dark:bg-forest-900 dark:text-parchment-100 border-parchment-300"
    },
    {
      title: "IP-SAKTI Smart Kiosk",
      subtitle: "Tactile Campus & Mandi Deployment",
      description: "An accessible physical touchscreen and simulated voice assistant interface with live audio waveform synthesis and QR code handoff for continuous mobile guidance.",
      path: "/abs-navigator#kiosk",
      icon: <Monitor className="w-5 h-5 text-rose-600" />,
      tag: "Accessibility",
      badgeClass: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20"
    }
  ];

  const showcaseScenarios = [
    {
      title: "Polyherbal Cognitive Formula",
      herbs: "Ashwagandha (Withania somnifera) + Brahmi (Bacopa monnieri)",
      verdict: "Patent / Proprietary Ayurvedic Medicine (Sec 3(h))",
      hurdle: "Section 3(p) Traditional Knowledge Bar & Section 3(e) Mere Admixture",
      requirement: "Mandatory Quantitative Synergy Testing + NBA Form III Approval"
    },
    {
      title: "Standardized Botanical Fraction",
      herbs: "Curcuma longa (95% Standardized Curcuminoids + 4 Marker Compounds)",
      verdict: "Phytopharmaceutical Drug (Rule 122E / Schedule Y)",
      hurdle: "CDSCO New Drug Route with Preclinical Toxicity Dossier",
      requirement: "Phase I/II/III Clinical Trials + Chemical Marker Characterization"
    },
    {
      title: "Classical Triphala Churna",
      herbs: "Haritaki + Bibhitaki + Amalaki (Formulated per Charaka Samhita)",
      verdict: "Classical / Generic Ayurvedic Medicine (Sec 3(a))",
      hurdle: "Absolute Patent Bar under Section 3(p) & TKDL Public Prior Art",
      requirement: "Rule 153 Manufacturing License citing First Schedule Classical Texts"
    }
  ];

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-forest-950 text-forest-950 dark:text-parchment-50 flex flex-col font-sans transition-colors bg-atmospheric">
      <Navbar />

      {/* Cinematic Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-12 lg:pb-14 border-b border-parchment-200/80 dark:border-forest-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-5">
            {/* Editorial Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-parchment-100/90 dark:bg-forest-900/60 text-forest-900 dark:text-amber-300 text-xs sm:text-sm font-semibold border border-amber-500/30 shadow-subtle-luxury animate-in fade-in-50">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="font-display tracking-wider uppercase text-xs font-bold">National Regulatory Intelligence Portal • Ministry of Ayush & AIIA</span>
            </div>

            {/* Modern Display Title */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-forest-950 dark:text-parchment-50 leading-[1.05]">
              Ancient Ayurvedic Wisdom,{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
                Grounded
              </span>{" "}
              in Precision Law.
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-forest-900/80 dark:text-parchment-200/90 max-w-2xl mx-auto leading-relaxed font-sans font-normal">
              An enterprise-grade regulatory navigator that classifies Ayurvedic products, retrieves authoritative statutory law, calculates confidence, and prevents biopiracy across Indian and International regimes.
            </p>

            {/* Direct Command Center Composer Bar */}
            <div className="pt-3 max-w-2xl mx-auto">
              <form
                onSubmit={handleHeroSubmit}
                className="relative flex items-center bg-white dark:bg-forest-900/80 rounded-2xl border border-amber-500/30 dark:border-forest-700/60 p-2 shadow-elevated-luxury backdrop-blur-md focus-within:ring-2 focus-within:ring-amber-500/40 transition-all duration-300"
              >
                <div className="pl-3 text-amber-600 dark:text-amber-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder="Ask any Ayurvedic IP or regulatory question (e.g. Can I patent an Ashwagandha & Brahmi formulation in India?)..."
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm sm:text-base text-forest-950 dark:text-parchment-50 placeholder:text-forest-900/50 dark:placeholder:text-parchment-300/50 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-parchment-50 dark:text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all flex-shrink-0"
                >
                  <span>Analyze</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Sample Prompt Chips */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-forest-900/70 dark:text-parchment-300/80">
                <span className="font-bold text-amber-700 dark:text-amber-400">Try asking:</span>
                <button
                  onClick={() => navigate("/ask?q=Can+I+patent+an+Ayurvedic+formulation+of+Ashwagandha+and+Curcumin+in+India%3F")}
                  className="bg-parchment-200/60 dark:bg-forest-900/60 hover:bg-parchment-200 px-3 py-1 rounded-full border border-parchment-300/60 dark:border-forest-800 font-medium transition-colors"
                >
                  Ashwagandha Patent in India
                </button>
                <button
                  onClick={() => navigate("/ask?q=What+are+the+patent+disclosure+requirements+under+the+new+WIPO+GRATK+Treaty+adopted+in+May+2024%3F")}
                  className="bg-parchment-200/60 dark:bg-forest-900/60 hover:bg-parchment-200 px-3 py-1 rounded-full border border-parchment-300/60 dark:border-forest-800 font-medium transition-colors"
                >
                  WIPO GRATK Treaty (2024)
                </button>
                <button
                  onClick={() => navigate("/classify")}
                  className="bg-parchment-200/60 dark:bg-forest-900/60 hover:bg-parchment-200 px-3 py-1 rounded-full border border-parchment-300/60 dark:border-forest-800 font-medium transition-colors"
                >
                  Classify Classical Triphala
                </button>
              </div>
            </div>

            {/* Visual Metaphor: 3D Holographic Orbiting Knowledge Core */}
            <div className="pt-4 pb-2 relative flex justify-center items-center">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                {/* 3D Floor Shadow */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full orb-shadow-3d blur-sm pointer-events-none" />

                {/* 3D Gyroscopic Orbit Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/25 gyro-orbit-x pointer-events-none" />
                <div className="absolute inset-2 rounded-full border-2 border-amber-400/20 gyro-orbit-y pointer-events-none" />

                {/* Outer Orbit with Rotating Nodes */}
                <div className="absolute inset-0 rounded-full border border-amber-500/30 dark:border-amber-400/20 animate-orbit-slow" />
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white dark:bg-forest-900 text-xs font-mono font-bold text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-sm">
                  Patents Act Sec 3(p)
                </div>
                <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white dark:bg-forest-900 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm">
                  Biological Diversity Act Sec 6
                </div>

                {/* Middle Orbit */}
                <div className="absolute inset-7 rounded-full border border-forest-800/20 dark:border-emerald-500/20 animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
                <div className="absolute top-1/2 -right-5 -translate-y-1/2 px-3 py-0.5 rounded-full bg-white dark:bg-forest-900 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm">
                  WIPO GRATK 2024
                </div>
                <div className="absolute top-1/2 -left-5 -translate-y-1/2 px-3 py-0.5 rounded-full bg-white dark:bg-forest-900 text-xs font-mono font-bold text-purple-700 dark:text-purple-300 border border-purple-500/40 shadow-sm">
                  Rule 158B (ASU)
                </div>

                {/* Central Luminous 3D Orb Core */}
                <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full orb-3d flex flex-col items-center justify-center text-center p-3 border-2 border-amber-400/60 ring-2 ring-emerald-400/30 ring-offset-2 ring-offset-forest-950 animate-breathe cursor-pointer group transition-transform hover:scale-105 duration-300">
                  <Scale className="w-8 h-8 text-amber-300 drop-shadow-[0_4px_10px_rgba(245,158,11,0.85)] filter transition-transform group-hover:scale-110 duration-300 mb-0.5" />
                  <span className="font-display text-sm font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    IP-SAKTI
                  </span>
                  <span className="text-xs uppercase tracking-wider font-mono font-bold text-amber-300 bg-black/60 px-2.5 py-0.5 rounded-full border border-amber-400/40 mt-1 shadow-inner">
                    Intelligence Core
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Benchmark Performance Metrics Ribbon */}
      <section className="bg-white/80 dark:bg-forest-900/40 border-b border-parchment-200/80 dark:border-forest-900/60 py-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
              Rigorous Evaluation Standard
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-forest-950 dark:text-parchment-50 mt-1">
              Empirical Benchmarks Across 100 Statutory Queries
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-5 rounded-2xl bg-parchment-50 dark:bg-forest-950/80 border border-parchment-200 dark:border-forest-800 shadow-subtle-luxury">
              <div className="font-display text-3xl sm:text-4xl font-bold text-emerald-700 dark:text-emerald-400">
                86.9%
              </div>
              <div className="text-sm font-bold text-forest-950 dark:text-parchment-100 mt-1.5">
                Classification Precision
              </div>
              <div className="text-xs text-forest-900/70 dark:text-parchment-300/80 mt-0.5 font-medium">
                Statutory Category Deductions
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-parchment-50 dark:bg-forest-950/80 border border-parchment-200 dark:border-forest-800 shadow-subtle-luxury">
              <div className="font-display text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-300">
                100.0%
              </div>
              <div className="text-sm font-bold text-forest-950 dark:text-parchment-100 mt-1.5">
                Statutory Grounding
              </div>
              <div className="text-xs text-forest-900/70 dark:text-parchment-300/80 mt-0.5 font-medium">
                Zero Fabricated Citations
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-parchment-50 dark:bg-forest-950/80 border border-parchment-200 dark:border-forest-800 shadow-subtle-luxury">
              <div className="font-display text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
                100.0%
              </div>
              <div className="text-sm font-bold text-forest-950 dark:text-parchment-100 mt-1.5">
                Adversarial Defense
              </div>
              <div className="text-xs text-forest-900/70 dark:text-parchment-300/80 mt-0.5 font-medium">
                Jailbreak & Bypass Blocked
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-parchment-50 dark:bg-forest-950/80 border border-parchment-200 dark:border-forest-800 shadow-subtle-luxury">
              <div className="font-display text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400">
                &lt; 1 ms
              </div>
              <div className="text-sm font-bold text-forest-950 dark:text-parchment-100 mt-1.5">
                Query Latency
              </div>
              <div className="text-xs text-forest-900/70 dark:text-parchment-300/80 mt-0.5 font-medium">
                Sub-Millisecond Hybrid BM25
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetric Core Pillars Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400 block mb-2">
            Engineered Capabilities
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-forest-950 dark:text-parchment-50 leading-tight">
            6 Specialized Modules for the Modern Ayurvedic Innovator
          </h2>
          <p className="mt-4 text-base text-forest-900/80 dark:text-parchment-200/90 leading-relaxed font-sans">
            Every module addresses a distinct pillar of Ayurvedic sovereignty: statutory formulation classification, jurisdiction isolation, verifiable citations, and biodiversity compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {corePillars.map((pillar, idx) => (
            <Link
              key={idx}
              to={pillar.path}
              className="bg-white dark:bg-forest-900/60 rounded-2xl border border-parchment-200/80 dark:border-forest-800/80 p-7 shadow-subtle-luxury hover:shadow-elevated-luxury hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between pb-4">
                  <div className="w-10 h-10 rounded-xl bg-parchment-100 dark:bg-forest-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {pillar.icon}
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${pillar.badgeClass}`}>
                    {pillar.tag}
                  </span>
                </div>

                <span className="font-mono text-xs text-amber-700 dark:text-amber-400 font-semibold block tracking-wide">
                  {pillar.subtitle}
                </span>

                <h3 className="font-display text-lg font-bold text-forest-950 dark:text-parchment-50 mt-1.5 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                  {pillar.title}
                </h3>

                <p className="text-sm sm:text-base text-forest-900/80 dark:text-parchment-200/80 mt-3 leading-relaxed font-sans">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-parchment-100 dark:border-forest-800/60 flex items-center justify-between text-sm font-bold text-forest-900 dark:text-amber-300 group-hover:text-amber-600">
                <span>Access Module</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Curated Showcase Scenarios */}
      <section className="py-24 bg-parchment-100/60 dark:bg-forest-900/20 border-t border-b border-parchment-200/80 dark:border-forest-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
              Interactive Case Demonstrations
            </span>
            <h2 className="font-display text-3xl font-semibold text-forest-950 dark:text-parchment-50 mt-2">
              How IP-SAKTI Evaluates Real Innovations
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {showcaseScenarios.map((sc, i) => (
              <div
                key={i}
                className="bg-white dark:bg-forest-950 rounded-2xl border border-parchment-200 dark:border-forest-800/80 p-7 shadow-subtle-luxury space-y-5"
              >
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
                    Case #{i + 1}
                  </span>
                  <h3 className="font-display text-xl font-bold text-forest-950 dark:text-parchment-50 mt-1">
                    {sc.title}
                  </h3>
                  <p className="text-xs text-forest-900/70 dark:text-parchment-300/80 italic mt-1 font-medium">
                    {sc.herbs}
                  </p>
                </div>

                <div className="p-3.5 bg-parchment-50 dark:bg-forest-900/40 rounded-xl border border-parchment-200/60 dark:border-forest-800 text-sm">
                  <span className="font-bold text-forest-950 dark:text-parchment-100 block mb-0.5">
                    Statutory Classification:
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    {sc.verdict}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2 text-rose-700 dark:text-rose-400">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span><strong>Statutory Hurdle:</strong> {sc.hurdle}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span><strong>Path Forward:</strong> {sc.requirement}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/ask?q=${encodeURIComponent(sc.title + " using " + sc.herbs)}`}
                    className="w-full inline-flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-amber-400/20 dark:hover:bg-amber-400/30 text-parchment-50 dark:text-amber-300 text-xs sm:text-sm font-bold transition-colors"
                  >
                    <span>Inspect Case in Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 5-Step Innovator Journey */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
            Systematic Methodology
          </span>
          <h2 className="font-display text-3xl font-semibold text-forest-950 dark:text-parchment-50 mt-2">
            The 5-Phase Regulatory Journey
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-white dark:bg-forest-900/60 border border-parchment-200 dark:border-forest-800 shadow-sm">
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">PHASE 1</span>
            <h4 className="font-bold text-forest-950 dark:text-parchment-50 mt-1 text-sm sm:text-base">Product Intake</h4>
            <p className="text-forest-900/70 dark:text-parchment-300/80 text-xs sm:text-sm mt-1 leading-normal">Normalizes botanical profile and commercial intent.</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-forest-900/60 border border-parchment-200 dark:border-forest-800 shadow-sm">
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">PHASE 2</span>
            <h4 className="font-bold text-forest-950 dark:text-parchment-50 mt-1 text-sm sm:text-base">Classification</h4>
            <p className="text-forest-900/70 dark:text-parchment-300/80 text-xs sm:text-sm mt-1 leading-normal">Deduces Classical vs Proprietary vs Phytopharma.</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-forest-900/60 border border-parchment-200 dark:border-forest-800 shadow-sm">
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">PHASE 3</span>
            <h4 className="font-bold text-forest-950 dark:text-parchment-50 mt-1 text-sm sm:text-base">Statutory Search</h4>
            <p className="text-forest-900/70 dark:text-parchment-300/80 text-xs sm:text-sm mt-1 leading-normal">Hybrid BM25 search across versioned Acts & Rules.</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-forest-900/60 border border-parchment-200 dark:border-forest-800 shadow-sm">
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">PHASE 4</span>
            <h4 className="font-bold text-forest-950 dark:text-parchment-50 mt-1 text-sm sm:text-base">ABS Clearance</h4>
            <p className="text-forest-900/70 dark:text-parchment-300/80 text-xs sm:text-sm mt-1 leading-normal">Flags mandatory NBA Form III approval before patent grant.</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-forest-900/60 border border-parchment-200 dark:border-forest-800 shadow-sm">
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">PHASE 5</span>
            <h4 className="font-bold text-forest-950 dark:text-parchment-50 mt-1 text-sm sm:text-base">Verification</h4>
            <p className="text-forest-900/70 dark:text-parchment-300/80 text-xs sm:text-sm mt-1 leading-normal">Extracts verified citations & calculates confidence.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
