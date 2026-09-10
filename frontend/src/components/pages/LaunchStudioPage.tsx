import React, { useState, useEffect } from "react";
import { Navbar } from "../ui/Navbar";
import { Footer } from "../ui/Footer";
import { RegulatoryKnowledgeGraph } from "../ui/RegulatoryKnowledgeGraph";
import { getQueryHistory, clearQueryHistory, QueryRecord } from "../../lib/supabase";
import {
  Sparkles,
  Download,
  Copy,
  Trash2,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LaunchStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<QueryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<QueryRecord | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getQueryHistory();
    setHistory(data);
    if (data.length > 0 && !selectedRecord) {
      setSelectedRecord(data[0]);
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear research history?")) {
      clearQueryHistory();
      setHistory([]);
      setSelectedRecord(null);
    }
  };

  const handleCopySummary = () => {
    if (!selectedRecord) return;
    const text = `=== IP-SAKTI REGULATORY RESEARCH DOSSIER ===\nQuery: ${selectedRecord.query}\nJurisdiction: ${selectedRecord.jurisdiction}\nClassification: ${selectedRecord.category}\nConfidence: ${selectedRecord.confidence_score}%\n\nFINDING:\n${selectedRecord.short_answer}\n\nSTATUTORY CITATIONS:\n${selectedRecord.citations.map((c: any) => `- [${c.section}] ${c.title}`).join("\n")}\n\nGenerated via IP-SAKTI Sahayak (Ministry of Ayush / AIIA)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedRecord) return;
    const text = `IP-SAKTI REGULATORY ASSESSMENT REPORT\n======================================\nDate: ${selectedRecord.created_at || new Date().toISOString()}\nQuery: ${selectedRecord.query}\nJurisdiction: ${selectedRecord.jurisdiction}\nProduct Classification: ${selectedRecord.category}\nConfidence Score: ${selectedRecord.confidence_score}%\n\nSTATUTORY FINDING:\n${selectedRecord.short_answer}\n\nVERIFIED CITATIONS:\n${selectedRecord.citations.map((c: any, i: number) => `${i + 1}. ${c.title} (${c.section}) - ${c.source_url}`).join("\n")}\n\nDISCLAIMER:\nThis report is an automated regulatory intelligence assessment generated via IP-SAKTI Sahayak. Not legal advice.`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IP-SAKTI-Dossier-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-forest-950 text-forest-950 dark:text-parchment-50 flex flex-col font-sans transition-colors bg-atmospheric">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Studio Command Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-parchment-200 dark:border-forest-800/60">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-cinzel">Executive Research Console</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-forest-950 dark:text-parchment-50">
              IP-SAKTI Innovation Studio
            </h1>
            <p className="text-xs sm:text-sm text-forest-900/70 dark:text-parchment-200/70 mt-1 max-w-2xl">
              Central workbench for research session tracking, regulatory dossiers, knowledge graph navigation, and statutory compliance exports.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/ask")}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-forest-950 text-xs font-bold shadow-md transition-all"
            >
              <span>New Regulatory Query</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Regulatory Knowledge Graph */}
        <RegulatoryKnowledgeGraph />

        {/* Saved Research Dossiers & Session History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* History Sidebar */}
          <div className="lg:col-span-4 bg-white dark:bg-forest-900/60 rounded-3xl border border-amber-500/20 dark:border-forest-700/60 p-5 shadow-subtle-luxury space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-parchment-200 dark:border-forest-800">
              <div className="flex items-center space-x-2 text-xs font-bold font-cinzel text-forest-950 dark:text-parchment-100">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Research Sessions ({history.length})</span>
              </div>
              {history.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-[10px] text-rose-600 hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-forest-900/30 dark:text-parchment-400/30" />
                <p className="text-xs text-forest-900/60 dark:text-parchment-400/60">
                  No previous queries in this session.
                </p>
                <button
                  onClick={() => navigate("/ask")}
                  className="text-xs font-bold text-amber-700 dark:text-amber-400 underline"
                >
                  Ask your first question
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {history.map((rec, idx) => {
                  const isSelected = selectedRecord?.id === rec.id;
                  return (
                    <button
                      key={rec.id || idx}
                      onClick={() => setSelectedRecord(rec)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/40 dark:bg-forest-800 dark:border-amber-400/40 shadow-sm"
                          : "bg-parchment-50/60 dark:bg-forest-950/60 border-parchment-200 dark:border-forest-800 hover:border-amber-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-forest-900/50 dark:text-parchment-400/50 mb-1">
                        <span className="font-mono font-bold uppercase">{rec.jurisdiction}</span>
                        <span>{rec.confidence_score}% Conf.</span>
                      </div>
                      <p className="font-medium text-forest-950 dark:text-parchment-100 line-clamp-2 leading-snug">
                        {rec.query}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dossier Viewer */}
          <div className="lg:col-span-8 bg-white dark:bg-forest-900/60 rounded-3xl border border-amber-500/20 dark:border-forest-700/60 p-6 sm:p-8 shadow-elevated-luxury">
            {selectedRecord ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-parchment-200 dark:border-forest-800 gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      {selectedRecord.category}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-forest-950 dark:text-parchment-50 mt-1">
                      {selectedRecord.query}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopySummary}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-parchment-200 dark:border-forest-700 text-xs font-medium hover:bg-parchment-100 dark:hover:bg-forest-800 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-forest-900 text-white dark:bg-emerald-600 text-xs font-medium hover:opacity-90 shadow-sm transition-opacity"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Report</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-forest-900/60 dark:text-parchment-300/60 block mb-1">
                      Statutory Finding
                    </span>
                    <p className="font-serif text-base text-forest-950/90 dark:text-parchment-100 leading-relaxed">
                      {selectedRecord.short_answer}
                    </p>
                  </div>

                  <div>
                    <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-forest-900/60 dark:text-parchment-300/60 block mb-2">
                      Cited Statutory Authorities ({selectedRecord.citations?.length || 0})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedRecord.citations?.map((cite: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-parchment-50 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">
                              {cite.section}
                            </span>
                            <span className="text-[10px] text-forest-900/50 dark:text-parchment-400/50">
                              {cite.jurisdiction}
                            </span>
                          </div>
                          <p className="font-medium text-forest-950 dark:text-parchment-100 line-clamp-1">
                            {cite.title}
                          </p>
                          <p className="text-[11px] text-forest-900/60 dark:text-parchment-400/60 line-clamp-2">
                            {cite.excerpt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <FileText className="w-12 h-12 mx-auto text-forest-900/30 dark:text-parchment-400/30" />
                <h4 className="font-serif text-lg font-bold text-forest-950 dark:text-parchment-50">
                  Select a Research Dossier
                </h4>
                <p className="text-xs text-forest-900/60 dark:text-parchment-300/60 max-w-sm mx-auto">
                  Click any query from your session history on the left, or launch a new statutory query.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LaunchStudioPage;
