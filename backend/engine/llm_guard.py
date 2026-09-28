"""
LLM Guard, Citation Validator, and Confidence Engine for IP-SAKTI Sahayak
Enforces strict grounding, prompt injection defenses, citation verification,
safe abstention, intent routing, and multilingual grounded synthesis.
Grounded directly in retrieved FAISS chunks from backend/data/*.pdf.
"""

import os
import re
import logging
from typing import Dict, Any, List, Optional
from .retriever import retriever_instance, DATA_PATH
from .query_router import classify_query_intent, normalize_query
from .statutory_synthesis import generate_dynamic_statutory_response

logger = logging.getLogger("rag.llm_guard")

# Adversarial prompt injection keywords & patterns
ADVERSARIAL_PATTERNS = [
    r"ignore\s+(previous|above|all)\s+instructions",
    r"system\s+prompt",
    r"reveal\s+(the\s+)?(developer\s+)?prompt",
    r"invent\s+(a\s+)?(fake\s+)?(section|law|regulation)",
    r"tell\s+me\s+i\s+am\s+legally\s+compliant",
    r"bypass\s+(the\s+)?(act|law|regulation|nba)",
    r"give\s+me\s+confidential\s+tkdl",
    r"act\s+as\s+a\s+hacker",
]


class LLMGuard:
    def __init__(self):
        # Read API keys strictly from environment variables; never hardcode or log them
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    def detect_prompt_injection(self, query: str) -> Optional[str]:
        for pattern in ADVERSARIAL_PATTERNS:
            if re.search(pattern, query, re.IGNORECASE):
                logger.warning("Adversarial prompt injection pattern detected in query.")
                return (
                    "Security Notice: Prompt injection or instruction override attempt detected. "
                    "IP-SAKTI Sahayak strictly processes legal queries based on verified statutory corpus. "
                    "System instructions cannot be revealed or bypassed."
                )
        return None

    def calculate_confidence(
        self,
        query: str,
        retrieved_docs: List[Dict[str, Any]],
        intent: str,
        citations: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Dynamically calculate confidence based on actual retrieval scores,
        citation validation, and domain grounding.
        """
        if intent == "OUT_OF_SCOPE":
            return {
                "score": 85,
                "label": "HIGH",
                "evidence_quality": "OUT_OF_SCOPE_DETECTED",
                "sources_found": 0,
                "abstain_recommended": True,
                "reason": "Query identified as outside Ayurvedic statutory scope (plant breeding / non-Ayush topic). Abstention with boundary guidance enforced."
            }

        if not retrieved_docs:
            return {
                "score": 20,
                "label": "LOW",
                "evidence_quality": "INSUFFICIENT",
                "sources_found": 0,
                "abstain_recommended": True,
                "reason": "No authoritative statutory provisions matching this query were found in the indexed PDF corpus."
            }

        num_docs = len(retrieved_docs)
        top_score = retrieved_docs[0].get("similarity_score", 0.0)

        # For vague queries that need clarification
        if intent in ("VAGUE_CLARIFICATION", "VAGUE_USE_AYURVEDA", "VAGUE_PATENT_THIS"):
            return {
                "score": 75,
                "label": "MEDIUM",
                "evidence_quality": "EXPLORATORY",
                "sources_found": num_docs,
                "abstain_recommended": False,
                "reason": "Structured multi-pathway clarification options generated across AYUSH statutory pathways."
            }

        # Count verified citations that actively support the claim
        verified_count = 0
        if citations:
            verified_count = sum(1 for c in citations if c.get("supports_claim", False))

        # Dynamic formula based on actual retrieval distance and citation grounding
        if top_score >= 0.55 and verified_count >= 1:
            score = min(94, int(60 + (top_score * 35)))
            label = "HIGH"
            quality = "STRONG"
            abstain = False
            reason = "Authoritative statutory provisions and pharmacopoeial standards verified in vectorstore."
        elif top_score >= 0.45:
            score = min(78, int(45 + (top_score * 30)))
            label = "MEDIUM"
            quality = "MODERATE"
            abstain = False
            reason = "Relevant statutory or pharmacopoeial passages retrieved with moderate confidence."
        else:
            score = max(25, int(top_score * 50))
            label = "LOW"
            quality = "WEAK"
            abstain = True
            reason = "Retrieval relevance score below confidence safety threshold."

        return {
            "score": score,
            "label": label,
            "evidence_quality": quality,
            "sources_found": num_docs,
            "verified_citations": verified_count,
            "abstain_recommended": abstain,
            "reason": reason
        }

    def verify_citations(
        self,
        raw_citations: List[Dict[str, Any]],
        retrieved_docs: List[Dict[str, Any]],
        query: str = "",
        intent: str = "GENERAL_STATUTORY_QUERY"
    ) -> List[Dict[str, Any]]:
        """
        Verify citations based on actual source existence, valid page numbers,
        and whether the retrieved chunk text supports the query/claim.
        """
        if intent == "OUT_OF_SCOPE":
            return []

        verified = []
        q_lower = query.lower()

        # Map doc_id to full chunk text
        doc_texts = {}
        for d in retrieved_docs:
            doc_dict = d.get("document", {})
            doc_id = doc_dict.get("document_id")
            if doc_id:
                doc_texts[doc_id] = (d.get("full_chunk_text", "") + " " + d.get("chunk_text", "")).lower()

        for c in raw_citations:
            doc_id = c.get("document_id")
            title = c.get("title", "")
            fname = os.path.basename(title)
            page_str = c.get("section", "")
            
            # Verify file exists on disk
            pdf_disk_path = os.path.join(DATA_PATH, fname)
            file_exists = os.path.exists(pdf_disk_path) and os.path.isfile(pdf_disk_path)
            
            # Extract page number
            page_match = re.search(r"\d+", page_str)
            page_num = int(page_match.group()) if page_match else 1
            page_valid = (page_num > 0)

            if not file_exists or not page_valid or doc_id not in doc_texts:
                c["verification_status"] = "SUPPLEMENTARY_RECORD"
                c["supports_claim"] = False
                verified.append(c)
                continue

            text = doc_texts[doc_id]
            supports = False
            statutory = False

            # Content verification based on retrieved text
            if "patents_act" in fname.lower():
                statutory = True
                if "3(p)" in q_lower or "traditional knowledge" in q_lower or intent == "PATENTABILITY_TRADITIONAL_KNOWLEDGE":
                    if "traditional knowledge" in text or "(p) an invention" in text:
                        supports = True
                elif "3(e)" in q_lower or "admixture" in q_lower or intent == "PATENTABILITY_MERE_ADMIXTURE":
                    if "mere admixture" in text or "(e) a substance" in text:
                        supports = True
                elif "3(d)" in q_lower or "efficacy" in q_lower:
                    if "known efficacy" in text or "(d) the mere discovery" in text:
                        supports = True
                elif "section 39" in q_lower or intent == "INTERNATIONAL_IP":
                    if "residents not to apply" in text or "outside india" in text:
                        supports = True
                elif any(k in text for k in ["invention", "patent", "specification", "biological"]):
                    supports = True
            elif "api-vol" in fname.lower() or "charaka" in fname.lower() or "frawley" in fname.lower():
                # Pharmacopoeial / classical compendium
                if any(h in text for h in ["withania", "ashwagandha", "curcuma", "haridra", "bacopa", "brahmi", "azadirachta", "nimba", "ocimum", "tulsi", "tinospora", "triphala", "rasayana", "dosha"]):
                    supports = True

            if supports:
                c["verification_status"] = "VERIFIED_STATUTORY_RECORD" if statutory else "VERIFIED_MONOGRAPH_RECORD"
                c["supports_claim"] = True
            else:
                c["verification_status"] = "SUPPLEMENTARY_RECORD"
                c["supports_claim"] = False

            verified.append(c)

        return verified

    def call_gemini_synthesis(
        self,
        query: str,
        retrieved_docs: List[Dict[str, Any]],
        category: str,
        jurisdiction: str,
        language: str = "en",
        intent: str = "GENERAL_STATUTORY_QUERY"
    ) -> Optional[str]:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None

        try:
            import requests
            model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"

            # Format retrieved evidence strictly from actual PDF chunks
            evidence_lines = []
            for i, d in enumerate(retrieved_docs[:5], 1):
                pdf = d.get("pdf_filename", "document.pdf")
                page = d.get("page_number", 1)
                txt = d.get("chunk_text", "")[:350]
                evidence_lines.append(f"[{i}] PDF Source: {pdf}, Page {page}\nExcerpt: \"{txt}\"")
            doc_context = "\n\n".join(evidence_lines)

            if language == "ta":
                lang_instruction = (
                    "MANDATORY: Write your ENTIRE response in natural fluent Tamil (தமிழ்). "
                    "Use authentic legal and medical Tamil terminology. Do NOT mix English sentences."
                )
            elif language == "hi":
                lang_instruction = (
                    "MANDATORY: Write your ENTIRE response in natural fluent Hindi (हिंदी). "
                    "Use authentic legal and AYUSH Hindi terminology. Do NOT mix English sentences."
                )
            else:
                lang_instruction = "Write response in clear, authoritative, professional English."

            prompt = (
                f"You are IP-SAKTI Sahayak, the statutory AI advisor for the Ministry of Ayush & AIIA.\n"
                f"User Question: {query}\n"
                f"Question Intent: {intent}\n"
                f"Product Classification: {category}\n"
                f"Jurisdiction: {jurisdiction}\n\n"
                f"--- RETRIEVED STATUTORY & BOTANICAL EVIDENCE ---\n"
                f"{doc_context}\n"
                f"-----------------------------------------------\n\n"
                f"{lang_instruction}\n\n"
                f"CRITICAL GROUNDING RULES:\n"
                f"1. If the question is ambiguous (e.g. 'Can I use ayurveda'), ask a clear structured clarification across Formulation, Commercial Licensing, and IP pathways.\n"
                f"2. Make ONLY claims that are directly supported by the retrieved excerpts or official statutory standards.\n"
                f"3. Do NOT invent legal sections, citations, mathematical formulas, or external requirements not present in the excerpts.\n"
                f"4. Cite the retrieved PDF filenames and page numbers accurately."
            )
            resp = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=10.0)
            if resp.status_code == 200:
                data = resp.json()
                text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if text and len(text.strip()) > 50:
                    return text.strip()
        except Exception as e:
            logger.debug("Gemini API call skipped/failed: %s", e)
        return None

    def synthesize_grounded_response(
        self,
        query: str,
        jurisdiction: str = "India",
        language: str = "en"
    ) -> Dict[str, Any]:
        # Step 1: Security Audit on Query (Prompt Injection Defense)
        injection_alert = self.detect_prompt_injection(query)
        if injection_alert:
            return {
                "status": "BLOCKED",
                "short_answer": injection_alert,
                "product_classification": "N/A",
                "jurisdiction": jurisdiction.upper(),
                "applicable_ip_regimes": [],
                "regulatory_pathway": "N/A",
                "abs_considerations": "N/A",
                "citations": [],
                "confidence": {
                    "score": 0,
                    "label": "ZERO",
                    "evidence_quality": "BLOCKED",
                    "sources_found": 0,
                    "abstain_recommended": True,
                    "reason": "Adversarial security filter triggered."
                },
                "important_limitations": "Adversarial security filter triggered.",
                "actionable_next_steps": ["Submit an authentic IP or regulatory question."],
                "disclaimer": "Security policy enforced. Information only — not legal advice."
            }

        # Step 2: Intelligent Query Intent Routing & Entity Extraction
        router_info = classify_query_intent(query, selected_jurisdiction=jurisdiction)
        intent = router_info.get("intent", "GENERAL")
        detected_language = router_info.get("language", "en")
        if language == "en" and detected_language in ("ta", "hi"):
            language = detected_language

        # Step 3: Handle OUT_OF_SCOPE Queries (Wheat breeding, non-Ayurvedic topics)
        if intent == "OUT_OF_SCOPE":
            dynamic_answer, dynamic_cat, dynamic_ip_regimes, dynamic_reg_pathway = generate_dynamic_statutory_response(
                query=query,
                retrieved_docs=[],
                jurisdiction=jurisdiction,
                language=language
            )
            confidence = self.calculate_confidence(query, [], intent=intent)
            return {
                "status": "ABSTAINED",
                "short_answer": dynamic_answer,
                "product_classification": dynamic_cat or "Out-of-Scope Inquiry — Non-Ayurvedic / Plant Breeding Topic",
                "jurisdiction": jurisdiction.upper(),
                "applicable_ip_regimes": dynamic_ip_regimes,
                "regulatory_pathway": dynamic_reg_pathway,
                "abs_considerations": "Not applicable for non-Ayurvedic agricultural breeding inquiries.",
                "traditional_knowledge_guidance": "Not applicable.",
                "citations": [],
                "confidence": confidence,
                "important_limitations": "This system specializes exclusively in Ayurvedic intellectual property, ASU drug regulations, and biological diversity access compliance.",
                "actionable_next_steps": [
                    "Consult the Protection of Plant Varieties and Farmers' Rights Authority (PPV&FRA) for plant variety registration.",
                    "Review Section 3(j) of the Patents Act, 1970 regarding the patent exclusion of plants and essentially biological processes."
                ],
                "disclaimer": "Informational notice. Non-Ayurvedic agricultural query."
            }

        # Step 4: Hybrid Semantic Retrieval via FAISS
        retrieved = retriever_instance.retrieve(query, jurisdiction=jurisdiction, top_k=5)

        # Step 5: Build Raw Citations from Retrieved PDF Chunks
        raw_citations = []
        for idx, item in enumerate(retrieved):
            pdf_fname = item.get("pdf_filename", "document.pdf")
            page_num = item.get("page_number", 1)
            chunk_txt = item.get("chunk_text", "")
            doc_dict = item.get("document", {})

            raw_citations.append({
                "citation_index": idx + 1,
                "document_id": doc_dict.get("document_id", f"{pdf_fname.replace('.pdf', '')}-p{page_num}"),
                "title": pdf_fname,
                "section": f"Page {page_num}",
                "authority": doc_dict.get("authority", "Statutory Regulatory Authority"),
                "jurisdiction": jurisdiction.capitalize(),
                "version": "Official Standard",
                "source_url": f"/data/{pdf_fname}#page={page_num}",
                "excerpt": chunk_txt[:260] + ("..." if len(chunk_txt) > 260 else "")
            })

        verified_citations = self.verify_citations(raw_citations, retrieved, query=query, intent=intent)
        confidence = self.calculate_confidence(query, retrieved, intent, citations=verified_citations)

        # Step 6: Dynamic Question-Specific Statutory Intelligence & Grounded Synthesis
        dynamic_answer, dynamic_cat, dynamic_ip_regimes, dynamic_reg_pathway = generate_dynamic_statutory_response(
            query=query,
            retrieved_docs=retrieved,
            jurisdiction=jurisdiction,
            language=language
        )

        category = dynamic_cat or router_info.get("category", "General")
        ip_regimes = dynamic_ip_regimes
        reg_pathway = dynamic_reg_pathway

        # Try Gemini dynamic synthesis if configured
        gemini_answer = self.call_gemini_synthesis(
            query=query,
            retrieved_docs=retrieved,
            category=category,
            jurisdiction=jurisdiction,
            language=language,
            intent=intent
        )

        short_answer = gemini_answer if gemini_answer else dynamic_answer

        # Determine overall execution status
        status = "SUCCESS"
        if confidence.get("abstain_recommended", False) and not retrieved:
            status = "INSUFFICIENT_EVIDENCE"

        # Localized disclaimer & action steps
        if language == "hi":
            disclaimer = "यह सूचना केवल प्रारंभिक मार्गदर्शन के लिए है — यह कोई कानूनी सलाह नहीं है। आधिकारिक पेटेंट एजेंट या आयुष विशेषज्ञ से परामर्श अवश्य करें।"
            action_steps = [
                "भारतीय पेटेंट कार्यालय (InPASS) और TKDL (tkdl.res.in) पर पूर्व कला खोज करें।",
                "NBA कार्यालय से जांच करें कि क्या आप भारतीय जैविक संसाधनों का उपयोग कर रहे हैं।",
                "अपने विशिष्ट उत्पाद वर्ग के लिए अधिकृत AYUSH नियामक सलाहकार से संपर्क करें।"
            ]
        elif language == "ta":
            disclaimer = "இது தகவல் நோக்கங்களுக்கான ஆரம்ப மதிப்பீடு மட்டுமே — சட்ட ஆலோசனை அல்ல. தகுதிவாய்ந்த அறிவுசார் சொத்து நிபுணரை அணுகவும்."
            action_steps = [
                "இந்திய காப்புரிமை அலுவலகத்தில் (InPASS) மற்றும் TKDL (tkdl.res.in)-ல் முன் கலை தேடல் நடத்தவும்.",
                "NBA அலுவலகத்திடம் இந்திய உயிரியல் வளங்களை பயன்படுத்துகிறீர்களா என்பதை சரிபார்க்கவும்.",
                "உங்கள் குறிப்பிட்ட தயாரிப்பு வகைக்கு தகுதிவாய்ந்த ஆயுஷ் ஒழுங்குமுறை ஆலோசகரை தொடர்பு கொள்ளவும்."
            ]
        else:
            disclaimer = (
                "This is a preliminary informational assessment based on retrieved statutory sources and pharmacopoeial standards. "
                "Not legal advice. Verify with an authorized patent attorney or AYUSH regulatory consultant before commercial or legal action."
            )
            action_steps = [
                "Conduct prior-art clearance searches on InPASS (ipindia.gov.in) and TKDL (tkdl.res.in).",
                "Verify NBA biodiversity access requirements with the National Biodiversity Authority (Form III).",
                "Ensure formulation and manufacturing comply with State AYUSH licensing (Form 24-D / Rule 158B) and Schedule T GMP standards."
            ]

        return {
            "status": status,
            "short_answer": short_answer,
            "product_classification": category,
            "jurisdiction": jurisdiction.upper(),
            "applicable_ip_regimes": ip_regimes,
            "regulatory_pathway": reg_pathway,
            "abs_considerations": (
                "Biological resources from India trigger NBA Section 3 approval for foreign entities, "
                "SBB Section 7 prior intimation for Indian commercial manufacturers, and NBA Form III before patent grant."
            ),
            "traditional_knowledge_guidance": (
                "Classical Ayurvedic literature documented in TKDL acts as destructive prior art against patent claims. "
                "Novelty must be proven through technical processing or synergistic efficacy data not in TKDL."
            ),
            "citations": verified_citations,
            "confidence": confidence,
            "important_limitations": (
                "Assessments depend on user-supplied ingredient profiles and intended claims. "
                "Does not replace statutory Freedom-To-Operate (FTO) patent searches or state drug licensing inspections."
            ),
            "actionable_next_steps": action_steps,
            "disclaimer": disclaimer
        }


llm_guard_instance = LLMGuard()
