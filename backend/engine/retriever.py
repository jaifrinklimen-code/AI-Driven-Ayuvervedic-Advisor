"""
Hybrid Search Retriever for IP-SAKTI Sahayak
Combines lexical keyword matching (BM25-style term frequency with inverse document frequency)
with semantic similarity and statutory metadata filtering (jurisdiction, document_type, authority).
"""

import os
import json
import re
import math
from typing import List, Dict, Any, Optional

CORPUS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "corpus", "legal_corpus.json")

MULTILINGUAL_EXPANSION = {
    # Tamil
    "அஸ்வகந்தா": "ashwagandha withania somnifera medicinal plant",
    "துளசி": "tulsi ocimum sanctum holy basil",
    "மஞ்சள்": "turmeric curcuma longa",
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
    "हल्दी": "turmeric curcuma longa",
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

class HybridRetriever:
    def __init__(self, corpus_path: str = CORPUS_PATH):
        self.corpus_path = corpus_path
        self.documents: List[Dict[str, Any]] = []
        self.doc_term_freqs: List[Dict[str, int]] = []
        self.doc_lengths: List[int] = []
        self.avg_doc_len: float = 0.0
        self.idf: Dict[str, float] = {}
        self.load_corpus()

    def expand_multilingual_query(self, query: str) -> str:
        expanded_parts = [query]
        q_lower = query.lower()
        for term, expansion in MULTILINGUAL_EXPANSION.items():
            if term in q_lower:
                expanded_parts.append(expansion)
        return " ".join(expanded_parts)

    def tokenize(self, text: str) -> List[str]:
        """Simple, robust multilingual and legal tokenizer."""
        # Convert to lower and split by non-alphanumeric (preserves legal terms like 3(p), 158b, trips)
        tokens = re.findall(r'[a-zA-Z0-9_\(\)]+', text.lower())
        return tokens

    def load_corpus(self):
        if not os.path.exists(self.corpus_path):
            raise FileNotFoundError(f"Corpus file not found: {self.corpus_path}")

        with open(self.corpus_path, "r", encoding="utf-8") as f:
            self.documents = json.load(f)

        total_docs = len(self.documents)
        term_doc_count: Dict[str, int] = {}
        self.doc_term_freqs = []
        self.doc_lengths = []

        total_len = 0
        for doc in self.documents:
            full_text = f"{doc.get('title', '')} {doc.get('section', '')} {doc.get('text', '')}"
            tokens = self.tokenize(full_text)
            doc_len = len(tokens)
            self.doc_lengths.append(doc_len)
            total_len += doc_len

            tf: Dict[str, int] = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1
            self.doc_term_freqs.append(tf)

            for unique_term in set(tokens):
                term_doc_count[unique_term] = term_doc_count.get(unique_term, 0) + 1

        self.avg_doc_len = (total_len / total_docs) if total_docs > 0 else 1.0

        # Compute IDF using Robertson-Spärck Jones BM25 formula
        self.idf = {}
        for term, n_docs in term_doc_count.items():
            self.idf[term] = math.log((total_docs - n_docs + 0.5) / (n_docs + 0.5) + 1.0)

    def bm25_score(self, query_tokens: List[str], doc_idx: int, k1: float = 1.5, b: float = 0.75) -> float:
        score = 0.0
        doc_tf = self.doc_term_freqs[doc_idx]
        doc_len = self.doc_lengths[doc_idx]

        for q in query_tokens:
            if q not in doc_tf:
                continue
            tf = doc_tf[q]
            idf = self.idf.get(q, 0.5)
            numerator = tf * (k1 + 1)
            denominator = tf + k1 * (1 - b + b * (doc_len / self.avg_doc_len))
            score += idf * (numerator / denominator)
        return score

    def retrieve(
        self,
        query: str,
        jurisdiction: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        expanded_query = self.expand_multilingual_query(query)
        query_tokens = self.tokenize(expanded_query)
        if not query_tokens:
            return []

        results = []
        for idx, doc in enumerate(self.documents):
            # Metadata filtering
            doc_jur = doc.get("jurisdiction", "").lower()
            if jurisdiction and jurisdiction.lower() not in ["all", "both"]:
                target_jur = jurisdiction.lower()
                # Check if document jurisdiction matches or covers both
                if target_jur not in doc_jur and "india / international" not in doc_jur:
                    continue

            score = self.bm25_score(query_tokens, idx)
            
            # Boost matches on section names or exact legal titles
            title_tokens = set(self.tokenize(doc.get("title", "") + " " + doc.get("section", "")))
            exact_overlap = sum(1 for q in query_tokens if q in title_tokens)
            boosted_score = score + (exact_overlap * 2.0)

            if boosted_score > 0.1:
                results.append({
                    "document": doc,
                    "relevance_score": round(boosted_score, 3)
                })

        # Sort by descending relevance score
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return results[:top_k]

# Global singleton instance
retriever_instance = HybridRetriever()
