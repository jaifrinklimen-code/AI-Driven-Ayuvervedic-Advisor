import React, { useState } from "react";
import { Navbar } from "../ui/Navbar";
import { Footer } from "../ui/Footer";
import { Activity, ShieldCheck } from "lucide-react";

export const PrakrutiAnalyzerPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-forest-950 text-forest-950 dark:text-parchment-50 flex flex-col font-sans transition-colors bg-atmospheric">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 flex flex-col">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200 dark:border-forest-800/60">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-parchment-200/60 dark:bg-forest-900/60 text-forest-900 dark:text-amber-300 text-xs font-semibold border border-amber-500/20 shadow-subtle-luxury mb-2">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-cinzel">Clinical & Diagnostic Heritage</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-light tracking-tight text-forest-950 dark:text-parchment-50">
              Prakruti Constitution Assessment
            </h1>
            <p className="text-xs sm:text-sm text-forest-900/70 dark:text-parchment-200/70 mt-1">
              Determine phenotypic dosha balance (Vata, Pitta, Kapha) to establish diagnostic relevance for therapeutic formulation claims.
            </p>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-forest-900 border border-parchment-200 dark:border-forest-700 text-xs font-medium text-forest-900/80 dark:text-parchment-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DPDP Act 2023 Compliant</span>
          </div>
        </div>

        {/* Embedded Interactive Diagnostic Frame */}
        <div className="flex-1 w-full bg-white dark:bg-forest-900/70 rounded-3xl border border-amber-500/20 dark:border-forest-700/60 shadow-elevated-luxury overflow-hidden relative min-h-[680px]">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-parchment-50/80 dark:bg-forest-950/80 backdrop-blur-md z-10 space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              <div className="text-center space-y-1">
                <p className="font-cinzel text-xs font-bold uppercase tracking-widest text-forest-950 dark:text-amber-300">
                  Initializing Assessment Frame
                </p>
                <p className="text-xs text-forest-900/60 dark:text-parchment-300/60">
                  Connecting to encrypted diagnostic questionnaire...
                </p>
              </div>
            </div>
          )}

          <iframe
            src="https://tripetto.app/run/TIOR5D98J8"
            title="Prakruti Constitution Assessment"
            className="w-full h-full min-h-[680px] border-0"
            onLoad={() => setLoading(false)}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrakrutiAnalyzerPage;
