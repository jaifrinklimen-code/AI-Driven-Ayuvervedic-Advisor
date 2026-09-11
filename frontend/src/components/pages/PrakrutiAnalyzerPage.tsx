import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../ui/Navbar";
import { Footer } from "../ui/Footer";
import {
  Activity,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Copy,
  Flame,
  Wind,
  Droplets,
  BookOpen
} from "lucide-react";

interface QuestionOption {
  text: string;
  dosha: "vata" | "pitta" | "kapha";
  description: string;
}

interface DiagnosticQuestion {
  id: number;
  category: string;
  sanskritTerm: string;
  question: string;
  options: QuestionOption[];
}

const QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    category: "Physical Build & Frame",
    sanskritTerm: "Sharira Bandha (अस्थि-मांस)",
    question: "How would you describe your natural physical frame and bone structure?",
    options: [
      { text: "Slender, light, or prominent joints", dosha: "vata", description: "Narrow shoulders/hips, difficulty gaining weight." },
      { text: "Medium, athletic, well-proportioned", dosha: "pitta", description: "Moderate muscular development, easily maintains weight." },
      { text: "Broad, sturdy, solid bone structure", dosha: "kapha", description: "Well-developed chest, gains weight easily, loses weight slowly." }
    ]
  },
  {
    id: 2,
    category: "Skin Texture & Temperature",
    sanskritTerm: "Twak Sparsha (त्वक्)",
    question: "What are the natural characteristics of your skin?",
    options: [
      { text: "Dry, cool, slightly rough or prone to cracking", dosha: "vata", description: "Prefers warm moisture, minimal perspiration." },
      { text: "Warm, sensitive, prone to redness or freckles", dosha: "pitta", description: "Sweats easily, reacts quickly to sun or spices." },
      { text: "Thick, soft, cool, and naturally hydrated", dosha: "kapha", description: "Smooth, lustrous, rarely irritated or dehydrated." }
    ]
  },
  {
    id: 3,
    category: "Hair Texture & Growth",
    sanskritTerm: "Kesha Lakshana (केश)",
    question: "How is your hair in its natural state?",
    options: [
      { text: "Dry, fine, kinky or prone to split ends", dosha: "vata", description: "Thinning easily, feels coarse without oiling." },
      { text: "Soft, fine, reddish or blonde tinge, early graying", dosha: "pitta", description: "Moderate density, sensitive scalp." },
      { text: "Thick, lustrous, wavy, deep-rooted and oily", dosha: "kapha", description: "Abundant volume, shiny and rich texture." }
    ]
  },
  {
    id: 4,
    category: "Metabolism & Digestion",
    sanskritTerm: "Agni / Jathara Agni (अग्नि)",
    question: "What best describes your appetite and digestion?",
    options: [
      { text: "Irregular (Vishama Agni)", dosha: "vata", description: "Sometimes voracious, sometimes forgets to eat, prone to bloating/gas." },
      { text: "Intense & Sharp (Tikshna Agni)", dosha: "pitta", description: "Becomes irritable when hungry, fast digestion, prone to acidity." },
      { text: "Slow & Steady (Manda Agni)", dosha: "kapha", description: "Can skip meals comfortably, heavy digestion, sluggish post-meal." }
    ]
  },
  {
    id: 5,
    category: "Sleep Quality & Dreams",
    sanskritTerm: "Nidra & Swapna (निद्रा)",
    question: "How do you sleep and what are your common dream themes?",
    options: [
      { text: "Light, interrupted, 5-6 hours", dosha: "vata", description: "Awakens easily; dreams of flying, running, or movement." },
      { text: "Moderate, sound, 6-7 hours", dosha: "pitta", description: "Wakes refreshed; dreams of intensity, colors, fire, or problem-solving." },
      { text: "Deep, heavy, 8+ hours, hard to wake", dosha: "kapha", description: "Wakes slowly; dreams of calm waters, lakes, or romance." }
    ]
  },
  {
    id: 6,
    category: "Mental Rhythm & Learning",
    sanskritTerm: "Medha & Smriti (धी-धृति-स्मृति)",
    question: "How do you assimilate information and remember things?",
    options: [
      { text: "Quick to learn, quick to forget", dosha: "vata", description: "High creative bursts, easily distracted, restless thoughts." },
      { text: "Sharp, analytical, critical retention", dosha: "pitta", description: "Precise comprehension, logical organization, goal-oriented." },
      { text: "Methodical, deliberate, enduring recall", dosha: "kapha", description: "Takes time to learn, but never forgets once mastered." }
    ]
  },
  {
    id: 7,
    category: "Stress & Emotional Response",
    sanskritTerm: "Manasika Bhava (मानस)",
    question: "When under acute stress, what is your first instinctive reaction?",
    options: [
      { text: "Anxiety, worry, or restless overthinking", dosha: "vata", description: "Fear-driven, difficulty calming thoughts." },
      { text: "Irritability, impatience, or fiery argumentation", dosha: "pitta", description: "Takes control aggressively, frustrated with delays." },
      { text: "Withdrawal, resistance to change, or complacency", dosha: "kapha", description: "Avoids conflict, seeks comfort food or prolonged sleep." }
    ]
  },
  {
    id: 8,
    category: "Climate & Environmental Comfort",
    sanskritTerm: "Ritu Satmya (ऋतु सात्म्य)",
    question: "Which weather condition do you find most uncomfortable?",
    options: [
      { text: "Cold, dry winds and fluctuating autumn weather", dosha: "vata", description: "Thrives in warm, sunny, humid environments." },
      { text: "Direct harsh sun, humid summer heat", dosha: "pitta", description: "Thrives in cool breeze, mountain climate, and shade." },
      { text: "Damp, cloudy, rainy or freezing winter chill", dosha: "kapha", description: "Thrives in dry heat, active warm sunshine." }
    ]
  },
  {
    id: 9,
    category: "Physical Activity & Stamina",
    sanskritTerm: "Bala & Vyayama (बल-व्यायाम)",
    question: "How do you exert physical energy during sports or workout?",
    options: [
      { text: "Spurts of rapid energy followed by sudden fatigue", dosha: "vata", description: "Enjoys speed and agility; low sustained endurance." },
      { text: "Strong, competitive, precise physical performance", dosha: "pitta", description: "Medium endurance, hates losing, overheats quickly." },
      { text: "High endurance, slow start, steady strength", dosha: "kapha", description: "High natural stamina, enjoys calm routine movement." }
    ]
  },
  {
    id: 10,
    category: "Speech & Communication",
    sanskritTerm: "Vak Pravritti (वाक्)",
    question: "How would friends describe your natural speaking manner?",
    options: [
      { text: "Fast, energetic, changing topics quickly", dosha: "vata", description: "Talkative, expressive hands, sometimes loses thread." },
      { text: "Clear, persuasive, direct, and authoritative", dosha: "pitta", description: "Sharp articulation, precise vocabulary, convincing." },
      { text: "Calm, slow, gentle, and measured", dosha: "kapha", description: "Pleasant voice, listens more than speaks, soothing presence." }
    ]
  }
];

export const PrakrutiAnalyzerPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "vata" | "pitta" | "kapha">>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelect = (questionId: number, dosha: "vata" | "pitta" | "kapha") => {
    const updated = { ...answers, [questionId]: dosha };
    setAnswers(updated);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
  };

  // Calculate scores
  const totalAnswered = Object.keys(answers).length;
  const vataCount = Object.values(answers).filter(v => v === "vata").length;
  const pittaCount = Object.values(answers).filter(v => v === "pitta").length;
  const kaphaCount = Object.values(answers).filter(v => v === "kapha").length;

  const vataPct = totalAnswered ? Math.round((vataCount / totalAnswered) * 100) : 33;
  const pittaPct = totalAnswered ? Math.round((pittaCount / totalAnswered) * 100) : 33;
  const kaphaPct = totalAnswered ? Math.round((kaphaCount / totalAnswered) * 100) : 34;

  const getDominantConstitution = () => {
    const scores = [
      { name: "Vata", pct: vataPct, key: "vata" },
      { name: "Pitta", pct: pittaPct, key: "pitta" },
      { name: "Kapha", pct: kaphaPct, key: "kapha" },
    ].sort((a, b) => b.pct - a.pct);

    const diff = scores[0].pct - scores[1].pct;
    if (diff <= 8) {
      return `${scores[0].name}-${scores[1].name} (Dvidoshaja)`;
    } else if (scores[0].pct >= 55) {
      return `Pure ${scores[0].name} (Ekadoshaja)`;
    } else {
      return `${scores[0].name} Dominant with ${scores[1].name} Secondary`;
    }
  };

  const currentQ = QUESTIONS[currentStep];

  const handleConsultChatbot = () => {
    const constitution = getDominantConstitution();
    const prompt = `What regulatory considerations, classical Ayurvedic textual citations, and intellectual property requirements apply to formulations designed for a ${constitution} phenotypic constitution?`;
    navigate(`/ask?q=${encodeURIComponent(prompt)}`);
  };

  const handleCopySummary = () => {
    const constitution = getDominantConstitution();
    const summary = `=== IP-SAKTI PRAKRUTI CLINICAL DOSSIER ===\nConstitution: ${constitution}\nVata: ${vataPct}%\nPitta: ${pittaPct}%\nKapha: ${kaphaPct}%\nClassical Reference: Charaka Samhita Sutrasthana Ch. 7 (Prakruti Pariksha)\nGenerated via IP-SAKTI Sahayak (Ministry of Ayush / AIIA)`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-forest-950 text-forest-950 dark:text-parchment-50 flex flex-col font-sans transition-colors bg-atmospheric">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex flex-col">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200 dark:border-forest-800/60">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/20 shadow-subtle-luxury mb-2">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-display">Clinical & Diagnostic Heritage • Charaka Samhita</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-forest-950 dark:text-parchment-50">
              Prakruti Constitution Assessment
            </h1>
            <p className="text-xs sm:text-sm text-forest-900/70 dark:text-parchment-200/70 mt-1 max-w-2xl">
              Evaluate bio-energetic phenotype balance (Vata, Pitta, Kapha) to establish statutory diagnostic relevance for therapeutic Ayurvedic formulation claims.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-forest-900 border border-parchment-200 dark:border-forest-700 text-xs font-medium text-forest-900/80 dark:text-parchment-200 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Offline & DPDP Act 2023 Compliant</span>
            </div>
            {totalAnswered > 0 && (
              <button
                onClick={handleReset}
                className="p-2 rounded-xl border border-parchment-200 dark:border-forest-700 bg-white dark:bg-forest-900 text-forest-800 dark:text-parchment-200 hover:text-rose-500 transition-colors"
                title="Restart Assessment"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live Dosha Spectrum Header Bar */}
        <div className="bg-white/80 dark:bg-forest-900/50 backdrop-blur-md p-4 rounded-2xl border border-amber-500/20 dark:border-forest-700/60 shadow-subtle-luxury space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-forest-900/80 dark:text-parchment-300/80 uppercase tracking-wider font-display">
              Current Dosha Distribution ({totalAnswered} of {QUESTIONS.length} Analyzed)
            </span>
            <span className="text-amber-600 dark:text-amber-300 font-display italic">
              {isCompleted ? getDominantConstitution() : "Assessment in Progress"}
            </span>
          </div>

          {/* Tri-Color Split Bar */}
          <div className="h-3 w-full rounded-full bg-parchment-200/80 dark:bg-forest-950 flex overflow-hidden shadow-inner">
            <div
              style={{ width: `${vataPct}%` }}
              className="bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500 relative group"
              title={`Vata: ${vataPct}%`}
            />
            <div
              style={{ width: `${pittaPct}%` }}
              className="bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500 relative group"
              title={`Pitta: ${pittaPct}%`}
            />
            <div
              style={{ width: `${kaphaPct}%` }}
              className="bg-gradient-to-r from-emerald-400 to-teal-600 transition-all duration-500 relative group"
              title={`Kapha: ${kaphaPct}%`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="flex items-center justify-center space-x-1.5 py-1 px-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 font-medium">
              <Wind className="w-3.5 h-3.5 text-sky-500" />
              <span>Vata: {vataPct}%</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5 py-1 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Pitta: {pittaPct}%</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5 py-1 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-medium">
              <Droplets className="w-3.5 h-3.5 text-emerald-500" />
              <span>Kapha: {kaphaPct}%</span>
            </div>
          </div>
        </div>

        {/* Main Interactive Questionnaire or Results Card */}
        {!isCompleted ? (
          <div className="bg-white dark:bg-forest-900/60 rounded-3xl border border-amber-500/20 dark:border-forest-700/60 p-6 sm:p-10 shadow-elevated-luxury space-y-8 animate-in fade-in">
            {/* Step Counter & Category */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-full bg-forest-900 text-parchment-50 dark:bg-amber-400 dark:text-forest-950 flex items-center justify-center text-xs font-bold">
                  {currentStep + 1}
                </span>
                <span className="text-xs uppercase tracking-wider font-semibold text-forest-800 dark:text-amber-300">
                  {currentQ.category}
                </span>
              </div>
              <span className="text-xs text-forest-900/60 dark:text-parchment-300/60 italic font-display">
                {currentQ.sanskritTerm}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl sm:text-2xl font-display font-medium text-forest-950 dark:text-parchment-50 leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-4">
              {currentQ.options.map((opt, i) => {
                const isSelected = answers[currentQ.id] === opt.dosha;
                const doshaBadge =
                  opt.dosha === "vata"
                    ? "text-sky-600 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 border-sky-300"
                    : opt.dosha === "pitta"
                    ? "text-amber-600 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border-amber-300"
                    : "text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300";

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(currentQ.id, opt.dosha)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-200 flex items-start justify-between group ${
                      isSelected
                        ? "border-forest-800 bg-forest-50 dark:bg-forest-800/60 shadow-md ring-2 ring-amber-400/40"
                        : "border-parchment-200 dark:border-forest-700/60 bg-parchment-50/50 dark:bg-forest-900/40 hover:border-amber-400/60 hover:bg-white dark:hover:bg-forest-800/30"
                    }`}
                  >
                    <div className="space-y-1.5 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${doshaBadge}`}>
                          {opt.dosha}
                        </span>
                        <span className="font-semibold text-sm sm:text-base text-forest-950 dark:text-parchment-50">
                          {opt.text}
                        </span>
                      </div>
                      <p className="text-sm text-forest-900/70 dark:text-parchment-300/70 leading-relaxed pl-0.5">
                        {opt.description}
                      </p>
                    </div>

                    <div className="pt-1">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-forest-900 bg-forest-900 dark:border-amber-400 dark:bg-amber-400 text-white dark:text-forest-950"
                          : "border-parchment-300 dark:border-forest-600 group-hover:border-amber-500"
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stepper Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-parchment-200 dark:border-forest-800/60">
              <button
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-forest-800 dark:text-parchment-200 disabled:opacity-30 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Parameter</span>
              </button>

              <div className="flex items-center space-x-1.5">
                {QUESTIONS.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentStep(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentStep
                        ? "bg-amber-500 scale-125 ring-2 ring-amber-400/40"
                        : answers[q.id]
                        ? "bg-emerald-500"
                        : "bg-parchment-300 dark:bg-forest-800"
                    }`}
                    title={`Question ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  if (currentStep < QUESTIONS.length - 1) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    setIsCompleted(true);
                  }
                }}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-forest-900 dark:text-amber-300 hover:underline"
              >
                <span>{currentStep === QUESTIONS.length - 1 ? "Review Verdict" : "Next Parameter"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Comprehensive Diagnostic Results Report */
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="bg-white dark:bg-forest-900/80 rounded-3xl border border-amber-500/30 dark:border-forest-700/80 p-8 sm:p-12 shadow-elevated-luxury space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-400/10 via-emerald-400/5 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

              {/* Verdict Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-parchment-200 dark:border-forest-800/60">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Constitutional Analysis Verdict</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-display font-light text-forest-950 dark:text-parchment-50">
                    {getDominantConstitution()}
                  </h2>
                  <p className="text-xs text-forest-900/70 dark:text-parchment-300/70">
                    Calculated from 10 anatomical and metabolic parameters documented in Charaka Samhita Sutrasthana.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopySummary}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-parchment-100 dark:bg-forest-800 text-forest-900 dark:text-parchment-100 text-xs font-semibold border border-parchment-200 dark:border-forest-700 hover:bg-parchment-200 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? "Copied!" : "Copy Dossier"}</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-parchment-100 dark:bg-forest-800 text-forest-900 dark:text-parchment-100 text-xs font-semibold border border-parchment-200 dark:border-forest-700 hover:bg-parchment-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>

              {/* Grid of Clinical Guidance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-800/40 space-y-2">
                  <div className="flex items-center space-x-2 text-sky-700 dark:text-sky-300 font-bold text-xs">
                    <Wind className="w-4 h-4" />
                    <span>Vata Sub-System ({vataPct}%)</span>
                  </div>
                  <p className="text-xs text-forest-900/80 dark:text-parchment-200/80 leading-relaxed">
                    Governs biological movement, neuromuscular transmission, and sensory conduction. Requires warm, grounding, unctuous (Snigdha) herbal vehicles like sesame oil (Tila Taila) and Ashwagandha.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
                    <Flame className="w-4 h-4" />
                    <span>Pitta Sub-System ({pittaPct}%)</span>
                  </div>
                  <p className="text-xs text-forest-900/80 dark:text-parchment-200/80 leading-relaxed">
                    Governs enzymatic digestion, cellular thermogenesis, and endocrine balance. Requires cooling (Sheeta), bitter and astringent botanicals like Shatavari, Amalaki, and Chandana.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                    <Droplets className="w-4 h-4" />
                    <span>Kapha Sub-System ({kaphaPct}%)</span>
                  </div>
                  <p className="text-xs text-forest-900/80 dark:text-parchment-200/80 leading-relaxed">
                    Governs structural lubrication, immune resilience (Ojas), and tissue stability. Benefits from warming, pungent, stimulating spices like Pippali, Trikatu, and Guggulu.
                  </p>
                </div>
              </div>

              {/* Regulatory Formulation Implications */}
              <div className="p-6 rounded-2xl bg-parchment-100/70 dark:bg-forest-950/60 border border-amber-500/20 space-y-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-display text-sm font-bold text-forest-950 dark:text-parchment-50">
                    Statutory & IP Implications for Formulators
                  </h3>
                </div>
                <div className="text-xs text-forest-900/80 dark:text-parchment-200/80 space-y-2">
                  <p>
                    • <strong>Section 3(a) Classical Linage</strong>: If you prepare formulations explicitly documented in Charaka Samhita or Sushruta Samhita for this dosha constitution (e.g. <em>Brahmi Ghrita</em> or <em>Drakshadi Kwatha</em>), it qualifies as a Classical Generic Drug requiring a Rule 153 license without patent exclusivity.
                  </p>
                  <p>
                    • <strong>Section 3(h) Proprietary Synergies</strong>: When designing novel polyherbal blends tailored to this constitutional phenotype, proof of non-obvious synergistic efficacy (Combination Index &lt; 1.0) must be demonstrated to overcome Section 3(p) and Section 3(e) patent exclusions.
                  </p>
                  <p>
                    • <strong>Biological Diversity Act Compliance</strong>: Sourcing rare Himalayan herbs (e.g. <em>Jatamansi</em> or <em>Kutki</em>) requires mandatory Form III clearance from the National Biodiversity Authority before filing patent applications.
                  </p>
                </div>
              </div>

              {/* Direct Link to RAG Query Engine */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-forest-900/60 dark:text-parchment-300/60 italic">
                  Take these findings directly into the IP-SAKTI statutory retrieval engine for grounded legal analysis.
                </p>
                <button
                  onClick={handleConsultChatbot}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-full bg-forest-900 hover:bg-forest-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-forest-950 text-xs font-bold shadow-lg transition-all"
                >
                  <span>Query IP-SAKTI RAG Engine with this Dosha</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PrakrutiAnalyzerPage;
