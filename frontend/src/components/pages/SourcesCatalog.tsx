import React, { useState, useEffect } from "react";
import { Navbar } from "../ui/Navbar";
import { Footer } from "../ui/Footer";
import { GazetteReaderModal, GazetteDocument } from "../ui/GazetteReaderModal";
import { getApiUrl } from "../../lib/api";
import {
  BookOpen,
  ExternalLink,
  Search,
  Eye,
  ShieldCheck
} from "lucide-react";

export const SourcesCatalog: React.FC = () => {
  const [documents, setDocuments] = useState<GazetteDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJur, setFilterJur] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState<GazetteDocument | null>(null);

  useEffect(() => {
    fetch(getApiUrl("/api/corpus"))
      .then((res) => res.json())
      .then((data) => {
        if (data && data.documents) {
          setDocuments(data.documents);
        }
      })
      .catch((err) => {
        console.error("Corpus fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.authority.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesJur =
      filterJur === "All" ||
      doc.jurisdiction.toLowerCase().includes(filterJur.toLowerCase());

    return matchesSearch && matchesJur;
  });

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-forest-950 text-forest-950 dark:text-parchment-50 flex flex-col font-sans transition-colors bg-atmospheric">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Archive Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-parchment-200/60 dark:bg-forest-900/60 text-forest-900 dark:text-amber-300 text-xs font-semibold border border-amber-500/20 shadow-subtle-luxury">
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-display">Official Gazette Repository</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-light tracking-tight text-forest-950 dark:text-parchment-50">
            Digital Statutory Archive
          </h1>
          <p className="text-xs sm:text-sm text-forest-900/70 dark:text-parchment-200/70 leading-relaxed max-w-xl mx-auto">
            16 verified statutory acts, rules, and multilateral treaties indexed with SHA-256 cryptographic hashes, temporal versioning, and instant in-app text access.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-forest-900/70 p-4 sm:p-5 rounded-3xl border border-amber-500/30 dark:border-forest-800 shadow-subtle-luxury flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-amber-600 dark:text-amber-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by section, act, or keyword..."
              className="w-full bg-parchment-50 dark:bg-forest-950 border border-parchment-200 dark:border-forest-800 rounded-xl pl-10 pr-4 py-2 text-xs text-forest-950 dark:text-parchment-50 placeholder:text-forest-900/40 dark:placeholder:text-parchment-300/40 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-forest-900/60 dark:text-parchment-300/60 font-medium">Jurisdiction Filter:</span>
            <select
              value={filterJur}
              onChange={(e) => setFilterJur(e.target.value)}
              className="bg-parchment-50 dark:bg-forest-950 border border-parchment-200 dark:border-forest-800 text-xs font-semibold rounded-xl px-3.5 py-2 text-forest-950 dark:text-parchment-50 focus:outline-none"
            >
              <option value="All">All Jurisdictions ({documents.length})</option>
              <option value="India">India Domestic</option>
              <option value="International">International Treaties</option>
            </select>
          </div>
        </div>

        {/* Document Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-forest-900/60 dark:text-parchment-300/60 font-mono">
              Loading cryptographic statutory corpus...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.document_id}
                className="bg-white dark:bg-forest-900/60 rounded-3xl border border-parchment-200/90 dark:border-forest-800/80 p-6 shadow-subtle-luxury hover:shadow-elevated-luxury hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-parchment-100 dark:border-forest-800/60">
                    <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-parchment-100 dark:bg-forest-950 text-forest-900 dark:text-parchment-200 font-bold border border-parchment-200 dark:border-forest-800">
                      {doc.document_id}
                    </span>
                    <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{doc.status}</span>
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-forest-950 dark:text-parchment-50 leading-snug">
                    {doc.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-forest-900/60 dark:text-parchment-300/60 font-sans pt-1">
                    <div>
                      <strong>Section:</strong> <span className="font-mono text-amber-700 dark:text-amber-400">{doc.section}</span>
                    </div>
                    <div>
                      <strong>Jurisdiction:</strong> {doc.jurisdiction}
                    </div>
                    <div>
                      <strong>Authority:</strong> {doc.authority}
                    </div>
                    <div>
                      <strong>Effective:</strong> {doc.effective_from}
                    </div>
                  </div>

                  <div className="p-4 bg-parchment-50/70 dark:bg-forest-950/70 rounded-2xl border border-parchment-200/60 dark:border-forest-800/60 text-xs text-forest-900/80 dark:text-parchment-200/80 leading-relaxed font-display italic line-clamp-3">
                    "{doc.text}"
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-parchment-100 dark:border-forest-800/60 flex items-center justify-between text-xs gap-2">
                  <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400/80 truncate max-w-[140px]">
                    HASH: {doc.content_hash}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-forest-950 text-xs font-bold transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Statute</span>
                    </button>

                    <a
                      href={doc.source_url}
                      target="_blank"
                      rel="noreferrer"
                      referrerPolicy="no-referrer"
                      title="Open external government portal (may require direct network access)"
                      className="p-1.5 rounded-xl border border-parchment-200 dark:border-forest-700 text-forest-900 dark:text-parchment-200 hover:bg-parchment-100 dark:hover:bg-forest-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* In-App Gazette Reader Modal - Guaranteed Zero Access Denied */}
      <GazetteReaderModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />

      <Footer />
    </div>
  );
};

export default SourcesCatalog;
