"""
FAISS Semantic & Hybrid Search Retriever for IP-SAKTI Sahayak
Loads pre-built FAISS vectorstore indexed from backend/data/*.pdf
Performs top-k hybrid retrieval combining dense semantic embeddings with
intent-aware lexical boosting, source prioritization, and precision filtering.
"""

import os
import re
import json
import logging
from typing import List, Dict, Any, Optional, Tuple, Set

try:
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_community.vectorstores import FAISS
except ImportError:
    from langchain.embeddings import HuggingFaceEmbeddings
    from langchain.vectorstores import FAISS

from .query_router import classify_query_intent, normalize_query, KNOWN_HERBS

logger = logging.getLogger("rag.retriever")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data")
CORPUS_PATH = os.path.join(BASE_DIR, "corpus", "legal_corpus.json")
FAISS_PATH = os.path.join(BASE_DIR, "vectorstore", "db_faiss")
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

MULTILINGUAL_EXPANSION = {
    # Tamil
    "அஸ்வகந்தா": "ashwagandha withania somnifera medicinal plant",
    "அமுக்கரா": "ashwagandha withania somnifera",
    "துளசி": "tulsi ocimum sanctum holy basil",
    "மஞ்சள்": "turmeric curcuma longa curcumin",
    "வேம்பு": "neem azadirachta indica",
    "முருங்கை": "moringa oleifera",
    "பிராமி": "brahmi bacopa monnieri",
    "கடுக்காய்": "haritaki terminalia chebula",
    "நெல்லிக்காய்": "amla amalaki phyllanthus emblica",
    "சீந்தில்": "giloy tinospora cordifolia",
    "நிலவேம்பு": "kalmegh andrographis paniculata",
    "ஏற்றுமதி": "export commercial utilization form iii section 20 national biodiversity authority nba",
    "காப்புரிமை": "patent patents act section 3(p) section 3(e) prior art novelty",
    "உயிரியல்": "biological diversity act 2002 bda nba",
    "பன்முகத்தன்மை": "biodiversity access benefit sharing abs",
    "பாரம்பரிய": "traditional knowledge tkdl prior art",
    "அறிவு": "knowledge tkdl digital library",
    "ஆராய்ச்சி": "research form i section 3 nba approval",
    "வணிக": "commercial utilization section 2(f)",
    "அனுமதி": "approval mandatory nba sbb permission",
    "விதிமுறைகள்": "regulations compliance rules act 2002 guidelines",
    "சட்டம்": "act section statutory provision legal",
    "ஆயுர்வேதம்": "ayurveda asu drugs and cosmetics rule 158b",
    
    # Hindi
    "अश्वगंधा": "ashwagandha withania somnifera medicinal plant",
    "तुलसी": "tulsi ocimum sanctum holy basil",
    "हल्दी": "turmeric curcuma longa curcumin",
    "नीम": "neem azadirachta indica",
    "सहजन": "moringa oleifera",
    "ब्राह्मी": "brahmi bacopa monnieri",
    "हरड़": "haritaki terminalia chebula",
    "आंवला": "amla amalaki phyllanthus emblica",
    "गिलोय": "giloy tinospora cordifolia",
    "कालमेघ": "kalmegh andrographis paniculata",
    "निर्यात": "export commercial utilization form iii section 20 national biodiversity authority nba",
    "पेटेंट": "patent patents act section 3(p) section 3(e) prior art novelty",
    "जैव": "biological diversity act 2002 bda nba",
    "विविधता": "biodiversity access benefit sharing abs",
    "पारंपरिक": "traditional knowledge tkdl prior art",
    "ज्ञान": "knowledge tkdl digital library",
    "अनुसंधान": "research form i section 3 nba approval",
    "शोध": "research form i section 3",
    "व्यावसायिक": "commercial utilization section 2(f)",
    "अनुमति": "approval mandatory nba sbb permission",
    "नियम": "regulations rules compliance act 2002 guidelines",
    "कानून": "act statutory provision legal section",
    "आयुर्वेद": "ayurveda asu drugs and cosmetics rule 158b",
}


def clean_pdf_text(text: str) -> str:
    """Filter out PDF font artifacts, control characters, binary dumps, and non-printable Mojibake."""
    if not text:
        return ""
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', ' ', text)
    cleaned = re.sub(r'[A-Za-z0-9+/=]{45,}', ' ', cleaned)  # base64 / binary artifact dumps
    cleaned = re.sub(r'[^\w\s\.,\(\)\-\':;\?\!/\u0900-\u097F\u0B80-\u0BFF%]', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


def extract_focused_excerpt(text: str, query: str, max_len: int = 320) -> str:
    """Extract a representative, clean sentence excerpt matching the query concepts."""
    clean = clean_pdf_text(text)
    if not clean:
        return ""

    q_lower = query.lower()
    t_lower = clean.lower()

    # Priority target terms based on query intent & content
    priority_terms = []
    if "3(e)" in q_lower or "admixture" in q_lower:
        priority_terms.extend(["mere admixture", "(e) a substance obtained", "aggregation of the properties"])
    if "3(p)" in q_lower or "traditional" in q_lower:
        priority_terms.extend(["(p) an invention which", "traditional knowledge", "known properties"])
    if "3(d)" in q_lower or "efficacy" in q_lower:
        priority_terms.extend(["(d) the mere discovery", "known efficacy", "enhancement of the known efficacy"])
    if "10(4)" in q_lower or "origin" in q_lower or "biological" in q_lower:
        priority_terms.extend(["geographical origin", "biological material", "source and geographical origin"])
    if "section 39" in q_lower or "foreign" in q_lower or "international" in q_lower:
        priority_terms.extend(["39. residents not to apply", "outside india without prior permission", "six weeks"])
    if "ashwagandha" in q_lower or "withania" in q_lower:
        priority_terms.extend(["withania somnifera", "ashwagandha", "asvagandha", "dried mature roots", "withanolides"])
    if "curcumin" in q_lower or "turmeric" in q_lower or "curcuma" in q_lower:
        priority_terms.extend(["curcuma longa", "haridra", "curcuminoids", "rhizome"])
    if "brahmi" in q_lower or "bacopa" in q_lower:
        priority_terms.extend(["bacopa monnieri", "brahmi", "bacoside"])
    if "neem" in q_lower or "azadirachta" in q_lower:
        priority_terms.extend(["azadirachta indica", "nimba"])
    if "tulsi" in q_lower or "ocimum" in q_lower:
        priority_terms.extend(["ocimum sanctum", "tulasi"])

    # Fallback standard markers
    priority_terms.extend([
        "(p) an invention which",
        "traditional knowledge",
        "(e) a substance obtained",
        "mere admixture",
        "withania somnifera",
        "curcuma longa",
        "bacopa monnieri",
        "science of life",
        "charaka samhita",
        "ayurvedic pharmacopoeia"
    ])

    best_idx = -1
    for term in priority_terms:
        idx = t_lower.find(term.lower())
        if idx != -1:
            if best_idx == -1 or idx < best_idx:
                best_idx = idx

    if best_idx != -1 and best_idx > 30:
        start = max(0, best_idx - 15)
        snippet = clean[start:].strip()
        if len(snippet) > max_len:
            snippet = snippet[:max_len] + "..."
        if start > 0:
            snippet = "..." + snippet
        return snippet

    if len(clean) > max_len:
        return clean[:max_len] + "..."
    return clean


class FAISSSemanticRetriever:
    def __init__(self, corpus_path: str = CORPUS_PATH, faiss_path: str = FAISS_PATH):
        self.corpus_path = corpus_path
        self.faiss_path = faiss_path
        self.documents: List[Dict[str, Any]] = []
        self.db: Optional[FAISS] = None
        self.embeddings: Optional[HuggingFaceEmbeddings] = None
        self.is_ready: bool = False
        self.load_error: Optional[str] = None
        
        # Load statutory catalog for backward compatibility with /api/corpus and /health
        self.load_corpus()
        
        # Load FAISS index
        self.load_faiss_index()

    def load_corpus(self):
        """Preserve legal_corpus.json loading so /api/corpus and catalog lookups continue working."""
        if os.path.exists(self.corpus_path):
            try:
                with open(self.corpus_path, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
                logger.info("Loaded %d legal corpus catalog entries from %s", len(self.documents), self.corpus_path)
            except Exception as e:
                logger.warning("Could not load legal_corpus.json: %s", e)
                self.documents = []
        else:
            self.documents = []

    def load_faiss_index(self):
        """Load the FAISS vector database from disk using the matching HuggingFace embedding model."""
        if not os.path.exists(self.faiss_path):
            self.load_error = f"FAISS index path not found at: {self.faiss_path}"
            self.is_ready = False
            logger.warning("FAISS index not found at %s. Please run ingest.py.", self.faiss_path)
            return

        index_file = os.path.join(self.faiss_path, "index.faiss")
        pkl_file = os.path.join(self.faiss_path, "index.pkl")
        if not os.path.exists(index_file) or not os.path.exists(pkl_file):
            self.load_error = f"FAISS index files (index.faiss/index.pkl) missing in {self.faiss_path}"
            self.is_ready = False
            logger.error(self.load_error)
            return

        try:
            logger.info("Initializing HuggingFace embeddings (%s)...", EMBEDDING_MODEL_NAME)
            self.embeddings = HuggingFaceEmbeddings(
                model_name=EMBEDDING_MODEL_NAME,
                model_kwargs={'device': 'cpu'}
            )
            logger.info("Loading FAISS vectorstore from %s...", self.faiss_path)
            self.db = FAISS.load_local(
                self.faiss_path,
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            self.is_ready = True
            self.load_error = None
            logger.info("FAISS vectorstore successfully loaded (%d vectors).", self.db.index.ntotal)
        except Exception as e:
            self.db = None
            self.is_ready = False
            self.load_error = f"Error loading FAISS vectorstore: {str(e)}"
            logger.error("Failed to load FAISS index: %s", e)

    def get_vector_count(self) -> int:
        """Return total indexed vectors in FAISS index."""
        if self.db and hasattr(self.db, "index") and self.db.index:
            return int(self.db.index.ntotal)
        return 0

    def expand_multilingual_query(self, query: str) -> str:
        """Expand non-English query terms (Tamil, Hindi) and botanical keywords for semantic retrieval."""
        expanded_parts = [query]
        q_lower = query.lower()
        for term, expansion in MULTILINGUAL_EXPANSION.items():
            if term in q_lower:
                expanded_parts.append(expansion)
        return " ".join(expanded_parts)

    def infer_authority(self, filename: str) -> str:
        """Determine statutory or institutional authority from PDF filename."""
        fname_lower = filename.lower()
        if "patents_act" in fname_lower:
            return "Parliament of India / Office of CGPDTM (Indian Patent Office)"
        elif "api-vol" in fname_lower:
            return "Ministry of Ayush / Pharmacopoeia Commission for Indian Medicine (PCIM&H)"
        elif "charaka" in fname_lower:
            return "Classical Ayurvedic Compendium (First Schedule, Drugs & Cosmetics Act)"
        elif "frawley" in fname_lower or "lad" in fname_lower:
            return "Authoritative Ayurvedic Pharmacognosy & Clinical Literature"
        return "Government of India / Ministry of Ayush"

    def retrieve(
        self,
        query: str,
        jurisdiction: Optional[str] = "India",
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Perform top-k hybrid retrieval combining dense FAISS semantic similarity with
        intent-aware lexical boosting, source prioritization, and precision filtering.
        """
        if self.db is None:
            self.load_faiss_index()

        if self.db is None or not self.is_ready:
            logger.warning("FAISS database unavailable for retrieval: %s", self.load_error)
            return []

        # Step 1: Detect intent and normalize query
        router_info = classify_query_intent(query, jurisdiction or "India")
        intent = router_info.get("intent", "GENERAL")
        q_norm = normalize_query(query)
        expanded_query = self.expand_multilingual_query(q_norm)
        q_lower = q_norm.lower()

        # Step 2: Base semantic similarity search via FAISS
        candidates_map: Dict[str, Tuple[Any, float]] = {}

        try:
            primary_candidates = self.db.similarity_search_with_score(expanded_query, k=50)
            for doc, dist in primary_candidates:
                key = f"{doc.metadata.get('source', '')}-{doc.metadata.get('page', 0)}-{doc.page_content[:40]}"
                candidates_map[key] = (doc, float(dist))
        except Exception as e:
            logger.error("FAISS primary similarity search error: %s", e)

        # Step 3: Targeted query expansions for statutory sections & botanical entities
        targeted_queries = []
        if "3(p)" in q_lower or "traditional" in q_lower or intent == "PATENTABILITY_TRADITIONAL_KNOWLEDGE":
            targeted_queries.append("Section 3(p) traditional knowledge patents act 1970")
        if "3(e)" in q_lower or "admixture" in q_lower or intent == "PATENTABILITY_MERE_ADMIXTURE":
            targeted_queries.append("Section 3(e) mere admixture aggregation properties patents act 1970")
        if "3(d)" in q_lower:
            targeted_queries.append("Section 3(d) mere discovery new form known substance efficacy")
        if "section 39" in q_lower or intent == "INTERNATIONAL_IP":
            targeted_queries.append("Section 39 residents not to apply for patents outside India without prior permission")
        if "ashwagandha" in q_lower or "withania" in q_lower:
            targeted_queries.append("Withania somnifera ashwagandha dried mature roots API monograph")
        if "curcumin" in q_lower or "turmeric" in q_lower or "curcuma" in q_lower:
            targeted_queries.append("Curcuma longa rhizome turmeric curcuminoids API monograph")
        if "brahmi" in q_lower or "bacopa" in q_lower:
            targeted_queries.append("Bacopa monnieri brahmi bacoside API monograph")

        for tq in targeted_queries:
            try:
                t_candidates = self.db.similarity_search_with_score(tq, k=10)
                for doc, dist in t_candidates:
                    key = f"{doc.metadata.get('source', '')}-{doc.metadata.get('page', 0)}-{doc.page_content[:40]}"
                    if key not in candidates_map or dist < candidates_map[key][1]:
                        candidates_map[key] = (doc, float(dist))
            except Exception as e:
                logger.debug("Targeted query search failed for '%s': %s", tq, e)

        # Step 4: Hybrid Scoring (Dense distance + Lexical & Statutory Ranking Aid)
        scored_candidates = []
        for key, (doc, raw_dist) in candidates_map.items():
            meta = doc.metadata or {}
            src = meta.get("source", meta.get("file_name", "")).lower()
            page = int(meta.get("page", 0)) + 1
            text_lower = doc.page_content.lower()

            # Adjusted distance starts at raw FAISS Euclidean distance
            adj_dist = raw_dist

            # Lexical entity matching boost
            if "ashwagandha" in q_lower or "withania" in q_lower:
                if "withania somnifera" in text_lower or "asvagandha" in text_lower:
                    adj_dist -= 0.25
            if "curcumin" in q_lower or "turmeric" in q_lower or "curcuma" in q_lower:
                if "curcuma longa" in text_lower or "haridra" in text_lower or "curcumin" in text_lower:
                    adj_dist -= 0.25
            if "brahmi" in q_lower or "bacopa" in q_lower:
                if "bacopa monnieri" in text_lower or "brahmi" in text_lower:
                    adj_dist -= 0.25
            if "neem" in q_lower or "azadirachta" in q_lower:
                if "azadirachta indica" in text_lower or "nimba" in text_lower:
                    adj_dist -= 0.25
            if "tulsi" in q_lower or "ocimum" in q_lower:
                if "ocimum sanctum" in text_lower or "tulsi" in text_lower:
                    adj_dist -= 0.25

            # Statutory section lexical match boost
            if ("3(p)" in q_lower or "traditional" in q_lower or intent == "PATENTABILITY_TRADITIONAL_KNOWLEDGE") and "patents_act" in src:
                if "traditional knowledge" in text_lower or "(p) an invention" in text_lower:
                    adj_dist -= 0.40
            if ("3(e)" in q_lower or "admixture" in q_lower or intent == "PATENTABILITY_MERE_ADMIXTURE") and "patents_act" in src:
                if "mere admixture" in text_lower or "(e) a substance" in text_lower:
                    adj_dist -= 0.40
            if ("3(d)" in q_lower) and "patents_act" in src:
                if "known efficacy" in text_lower or "(d) the mere discovery" in text_lower:
                    adj_dist -= 0.40
            if ("section 39" in q_lower or "foreign" in q_lower or intent == "INTERNATIONAL_IP") and "patents_act" in src:
                if "residents not to apply" in text_lower or "outside india" in text_lower:
                    adj_dist -= 0.40

            # Intent-based source weighting (Ranking Aid)
            if intent in ("HERB_MONOGRAPH", "GENERAL_AYURVEDA") and "patents_act" in src:
                adj_dist += 1.5  # Demote patent statute when asking about herb pharmacopoeia
            elif intent.startswith("PATENTABILITY") and "patents_act" in src:
                # Demote purely procedural patent pages (administrative tables)
                if page in (41, 42, 44, 45, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65):
                    if "mere admixture" not in text_lower and "traditional knowledge" not in text_lower:
                        adj_dist += 1.0

            scored_candidates.append((doc, max(0.01, adj_dist)))

        # Step 5: Rank and Deduplicate
        scored_candidates.sort(key=lambda x: x[1])

        results = []
        seen_chunks: Set[str] = set()

        for doc, dist in scored_candidates:
            meta = doc.metadata or {}
            source_raw = meta.get("source", meta.get("file_name", "unknown.pdf"))
            pdf_filename = os.path.basename(source_raw)
            page_num = int(meta.get("page", 0)) + 1
            chunk_text = doc.page_content.strip()

            # Deduplication key based on document, page, and chunk signature
            clean_snippet = clean_pdf_text(chunk_text[:100])
            dedup_key = f"{pdf_filename}#p{page_num}#{clean_snippet}"
            if dedup_key in seen_chunks:
                continue
            seen_chunks.add(dedup_key)

            # Convert distance to normalized relevance score [0.0, 1.0]
            relevance_score = round(1.0 / (1.0 + float(dist)), 4)
            authority = self.infer_authority(pdf_filename)
            doc_id = f"{pdf_filename.replace('.pdf', '')}-p{page_num}"
            focused_excerpt = extract_focused_excerpt(chunk_text, query)

            results.append({
                "pdf_filename": pdf_filename,
                "page_number": page_num,
                "chunk_text": focused_excerpt,
                "full_chunk_text": chunk_text,
                "similarity_score": relevance_score,
                "raw_distance": round(float(dist), 4),
                "relevance_score": relevance_score,
                "document": {
                    "document_id": doc_id,
                    "title": pdf_filename,
                    "section": f"Page {page_num}",
                    "authority": authority,
                    "jurisdiction": jurisdiction or "India",
                    "version": "Official Standard",
                    "source_url": f"/data/{pdf_filename}#page={page_num}",
                    "text": focused_excerpt
                }
            })

            if len(results) >= top_k:
                break

        # Log diagnostics without leaking sensitive data
        logger.info(
            "Retrieval for query '%s' [Intent: %s]: %d results returned (top score: %s, top file: %s p.%s)",
            query[:50],
            intent,
            len(results),
            results[0]["relevance_score"] if results else "N/A",
            results[0]["pdf_filename"] if results else "None",
            results[0]["page_number"] if results else "None"
        )

        return results


# Global singleton instance
retriever_instance = FAISSSemanticRetriever()
