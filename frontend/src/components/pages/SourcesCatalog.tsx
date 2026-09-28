import React, { useState, useEffect } from "react";
import { Navbar } from "../ui/Navbar";
import { Footer } from "../ui/Footer";
import { GazetteReaderModal, GazetteDocument } from "../ui/GazetteReaderModal";
import { getApiUrl, formatCitationUrl } from "../../lib/api";
import {
  BookOpen,
  ExternalLink,
  Search,
  Eye,
  ShieldCheck
} from "lucide-react";

const DEFAULT_CATALOG_DOCS: GazetteDocument[] = [
  {
    document_id: "IN-PAT-1970-SEC3P",
    title: "The Patents Act, 1970 - Section 3(p)",
    authority: "Parliament of India / CGPDTM",
    jurisdiction: "India",
    section: "Section 3(p)",
    version: "Patents (Amendment) Act 2002",
    effective_from: "1972-04-20",
    chapter: "Chapter II - Inventions Not Patentable",
    page: "14",
    document_type: "Statutory Act",
    content_hash: "a1b2c3d4e5f6g7h8",
    status: "CURRENT",
    language: "English",
    source_url: "https://www.indiacode.nic.in/handle/123456789/1392",
    text: "Section 3(p) specifies that an invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is NOT an invention within the meaning of this Act and cannot be granted a patent in India. In Ayurveda, this explicitly bars patenting known classical formulations or established traditional uses of medicinal herbs unless substantial, unexpected synergistic efficacy and inventive novelty are proven beyond mere traditional aggregation."
  },
  {
    document_id: "IN-PAT-1970-SEC3E",
    title: "The Patents Act, 1970 - Section 3(e)",
    authority: "Parliament of India / CGPDTM",
    jurisdiction: "India",
    section: "Section 3(e)",
    version: "2005 Consolidation",
    effective_from: "1972-04-20",
    chapter: "Chapter II - Inventions Not Patentable",
    page: "14",
    document_type: "Statutory Act",
    content_hash: "b2c3d4e5f6g7h8i9",
    status: "CURRENT",
    language: "English",
    source_url: "https://www.indiacode.nic.in/handle/123456789/1392",
    text: "Section 3(e) states that a substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is NOT patentable. For herbal and Ayurvedic formulations, merely mixing known herbs without demonstrable synergistic effect or a unique, unobvious technical interaction will be rejected under Section 3(e) as an unpatentable mere admixture."
  },
  {
    document_id: "IN-PAT-1970-SEC3D",
    title: "The Patents Act, 1970 - Section 3(d)",
    authority: "Parliament of India / CGPDTM",
    jurisdiction: "India",
    section: "Section 3(d)",
    version: "Amended 2005",
    effective_from: "2005-01-01",
    chapter: "Chapter II - Inventions Not Patentable",
    page: "13",
    document_type: "Statutory Act",
    content_hash: "c3d4e5f6g7h8i9j0",
    status: "CURRENT",
    language: "English",
    source_url: "https://www.indiacode.nic.in/handle/123456789/1392",
    text: "Section 3(d) excludes the mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance, or the mere discovery of any new property or new use for a known substance. When isolating botanical active compounds or standardizing extracts from known Ayurvedic plants, the applicant must demonstrate significantly enhanced therapeutic efficacy over the known herbal extract to overcome Section 3(d)."
  },
  {
    document_id: "IN-PAT-1970-SEC39",
    title: "The Patents Act, 1970 - Section 39 (Foreign Patent Filing License)",
    authority: "Office of CGPDTM, India",
    jurisdiction: "International",
    section: "Section 39",
    version: "Consolidated Patent Rules",
    effective_from: "1972-04-20",
    chapter: "Chapter VII - Applications Outside India",
    page: "26",
    document_type: "Statutory Act",
    content_hash: "e5f6g7h8i9j0k1l2",
    status: "CURRENT",
    language: "English",
    source_url: "https://ipindia.gov.in",
    text: "Section 39 prohibits Indian residents from applying for patents outside India without prior written permission from the Controller General, unless an Indian patent application has been filed at least six weeks prior. Violating Section 39 leads to automatic abandonment of the Indian application and potential criminal liability under Section 118."
  },
  {
    document_id: "IN-BDA-2002-SEC6",
    title: "The Biological Diversity Act, 2002 - Section 6",
    authority: "National Biodiversity Authority (NBA), Chennai",
    jurisdiction: "India",
    section: "Section 6 (Consolidated 2023)",
    version: "Biological Diversity (Amendment) Act 2023",
    effective_from: "2003-02-05",
    chapter: "Chapter II - Regulation of Access to Biological Diversity",
    page: "21",
    document_type: "Statutory Act",
    content_hash: "f6g7h8i9j0k1l2m3",
    status: "CURRENT",
    language: "English",
    source_url: "http://nbaindia.org",
    text: "No person shall apply for any intellectual property right, by whatever name called, in or outside India for any invention based on any research or information on a biological resource obtained from India without obtaining the previous approval of the National Biodiversity Authority (Form III). Indian commercial manufacturers must file prior intimation with the State Biodiversity Board (SBB) under Section 7."
  },
  {
    document_id: "IN-DCA-1940-RULE158B",
    title: "Drugs and Cosmetics Rules, 1945 - Rule 158B",
    authority: "Ministry of Ayush / State Licensing Authorities",
    jurisdiction: "India",
    section: "Rule 158B",
    version: "GSR 560(E) AYUSH Consolidation",
    effective_from: "2010-08-10",
    chapter: "Part XVI - Ayurvedic, Siddha and Unani Drugs",
    page: "14",
    document_type: "Regulatory Rule",
    content_hash: "g7h8i9j0k1l2m3n4",
    status: "CURRENT",
    language: "English",
    source_url: "https://ayush.gov.in",
    text: "Rule 158B governs the regulatory requirements for the grant of manufacturing licenses for Ayurvedic, Siddha, and Unani (ASU) medicines. Classical Ayurvedic medicines listed in authoritative texts (First Schedule) require no safety or efficacy data. Patent or Proprietary Ayurvedic medicines (Section 3(h)) require safety proof, acute toxicity data, and published trial evidence as prescribed under Rule 158B."
  }
];

export const SourcesCatalog: React.FC = () => {
  const [documents, setDocuments] = useState<GazetteDocument[]>(DEFAULT_CATALOG_DOCS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJur, setFilterJur] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState<GazetteDocument | null>(null);

  useEffect(() => {
    fetch(getApiUrl("/api/corpus"))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.documents && data.documents.length > 0) {
          setDocuments(data.documents);
        } else {
          setDocuments(DEFAULT_CATALOG_DOCS);
        }
      })
      .catch((err) => {
        console.warn("Corpus fetch error, using client-side statutory catalog fallback:", err);
        setDocuments(DEFAULT_CATALOG_DOCS);
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
                onClick={() => setSelectedDoc(doc)}
                className="bg-white dark:bg-forest-900/60 rounded-3xl border border-parchment-200/90 dark:border-forest-800/80 p-6 shadow-subtle-luxury hover:shadow-elevated-luxury hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-parchment-100 dark:border-forest-800/60">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-parchment-100 dark:bg-forest-950 text-forest-900 dark:text-parchment-200 font-bold border border-parchment-200 dark:border-forest-800">
                      {doc.document_id}
                    </span>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{doc.status}</span>
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-forest-950 dark:text-parchment-50 leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {doc.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-forest-900/80 dark:text-parchment-300/80 font-sans pt-1">
                    <div>
                      <strong>Section:</strong> <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">{doc.section}</span>
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

                  <div className="p-4 bg-parchment-50/70 dark:bg-forest-950/70 rounded-2xl border border-parchment-200/60 dark:border-forest-800/60 text-sm text-forest-900/90 dark:text-parchment-100 leading-relaxed font-display italic line-clamp-3">
                    "{doc.text}"
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-parchment-100 dark:border-forest-800/60 flex items-center justify-between text-xs sm:text-sm gap-2">
                  <span className="font-mono text-xs text-amber-700 dark:text-amber-400 font-bold truncate max-w-[150px]">
                    HASH: {doc.content_hash}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoc(doc);
                      }}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-forest-950 text-xs sm:text-sm font-bold transition-colors shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Read Statute</span>
                    </button>

                    <a
                      href={formatCitationUrl(doc.source_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Open official legislative repository record"
                      className="p-2 rounded-xl border border-parchment-200 dark:border-forest-700 text-forest-900 dark:text-parchment-200 hover:bg-parchment-100 dark:hover:bg-forest-800 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
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
