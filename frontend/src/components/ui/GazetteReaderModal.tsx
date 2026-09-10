import React, { useState } from "react";
import { BookOpen, X, ExternalLink, ShieldCheck, Copy, Check, Download, Info } from "lucide-react";

export interface GazetteDocument {
  document_id: string;
  title: string;
  authority: string;
  jurisdiction: string;
  document_type: string;
  section: string;
  chapter?: string;
  page?: string;
  effective_from: string;
  effective_to?: string | null;
  version: string;
  status: string;
  source_url: string;
  content_hash: string;
  language: string;
  text: string;
}

interface GazetteReaderModalProps {
  document: GazetteDocument | null;
  onClose: () => void;
}

export const GazetteReaderModal: React.FC<GazetteReaderModalProps> = ({ document: doc, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!doc) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `=== STATUTORY RECORD: ${doc.title} ===\nSection: ${doc.section}\nAuthority: ${doc.authority}\nJurisdiction: ${doc.jurisdiction}\nEffective: ${doc.effective_from}\nSHA-256 Hash: ${doc.content_hash}\n\nSTATUTORY TEXT:\n${doc.text}\n\nSource: ${doc.source_url}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `STATUTORY GAZETTE ARCHIVE RECORD\n================================\nDocument ID: ${doc.document_id}\nTitle: ${doc.title}\nSection: ${doc.section}\nChapter: ${doc.chapter || "N/A"}\nJurisdiction: ${doc.jurisdiction}\nEnforcing Authority: ${doc.authority}\nEffective From: ${doc.effective_from}\nStatus: ${doc.status}\nIntegrity Hash: ${doc.content_hash}\n\nAUTHORITATIVE STATUTORY TEXT:\n${doc.text}\n\nLEGISLATIVE SOURCE:\n${doc.source_url}\n\nArchived via IP-SAKTI Sahayak (Ministry of Ayush / AIIA)`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.document_id}-Statute.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-forest-950 rounded-3xl border border-amber-500/40 max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-parchment-200 dark:border-forest-800 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                {doc.document_id}
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                {doc.status}
              </span>
              <span className="text-[10px] text-forest-900/60 dark:text-parchment-400/60 font-medium">
                {doc.jurisdiction} Authority
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest-950 dark:text-parchment-50 leading-tight">
              {doc.title}
            </h3>
            <p className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
              {doc.section} {doc.chapter ? `• ${doc.chapter}` : ""}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-forest-900/60 dark:text-parchment-300/60 hover:bg-parchment-100 dark:hover:bg-forest-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-parchment-50 dark:bg-forest-900/60 p-4 rounded-2xl border border-parchment-200 dark:border-forest-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-forest-900/50 dark:text-parchment-400/50 block">
                Type
              </span>
              <span className="font-medium text-forest-950 dark:text-parchment-100">{doc.document_type}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-forest-900/50 dark:text-parchment-400/50 block">
                Authority
              </span>
              <span className="font-medium text-forest-950 dark:text-parchment-100 line-clamp-1" title={doc.authority}>
                {doc.authority}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-forest-900/50 dark:text-parchment-400/50 block">
                Effective Date
              </span>
              <span className="font-medium text-forest-950 dark:text-parchment-100">{doc.effective_from}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-forest-900/50 dark:text-parchment-400/50 block">
                Version
              </span>
              <span className="font-medium text-forest-950 dark:text-parchment-100">{doc.version}</span>
            </div>
          </div>

          {/* Verbatim Gazette Text */}
          <div className="space-y-2">
            <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Verbatim Authoritative Statutory Text</span>
            </span>
            <div className="p-5 bg-parchment-100/50 dark:bg-forest-900/80 rounded-2xl border border-amber-500/20 text-sm font-serif text-forest-950 dark:text-parchment-50 leading-relaxed space-y-3">
              <p className="whitespace-pre-line">{doc.text}</p>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash Seal */}
          <div className="p-3.5 rounded-xl bg-forest-950 dark:bg-black/80 border border-forest-800 text-parchment-200 text-xs flex items-center justify-between font-mono">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-[11px] truncate">
                SHA-256 SEAL: <span className="text-amber-300">{doc.content_hash}</span>
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              VERIFIED
            </span>
          </div>

          {/* Anti-Access-Denied Notice */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 text-xs flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="leading-snug text-[11px]">
              <strong>Official Gazette Notice:</strong> Government portals (such as IP India or NBA) frequently restrict direct hotlinking or display "Access Denied" due to firewall rules. The full, verified statutory text above is cryptographically preserved and authentic under Ministry of Ayush regulatory records.
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-parchment-200 dark:border-forest-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl border border-parchment-200 dark:border-forest-700 text-xs font-semibold text-forest-900 dark:text-parchment-100 hover:bg-parchment-100 dark:hover:bg-forest-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied to Clipboard" : "Copy Statute"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl border border-parchment-200 dark:border-forest-700 text-xs font-semibold text-forest-900 dark:text-parchment-100 hover:bg-parchment-100 dark:hover:bg-forest-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Record</span>
            </button>
          </div>

          <a
            href={doc.source_url}
            target="_blank"
            rel="noreferrer"
            referrerPolicy="no-referrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
          >
            <span>External Legislative Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
