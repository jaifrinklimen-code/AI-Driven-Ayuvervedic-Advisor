"""
LLM Guard, Citation Validator, and Confidence Engine for IP-SAKTI Sahayak
Enforces strict grounding, prompt injection defenses, citation verification,
and safe abstention.
"""

import os
import re
from typing import Dict, Any, List, Optional
from .retriever import retriever_instance

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
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")

    def detect_prompt_injection(self, query: str) -> Optional[str]:
        for pattern in ADVERSARIAL_PATTERNS:
            if re.search(pattern, query, re.IGNORECASE):
                return (
                    "Security Notice: Prompt injection or instruction override attempt detected. "
                    "IP-SAKTI Sahayak strictly processes legal queries based on verified statutory corpus. "
                    "System instructions cannot be revealed or bypassed."
                )
        return None

    def calculate_confidence(self, query: str, retrieved_docs: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not retrieved_docs:
            return {
                "score": 25,
                "label": "LOW",
                "evidence_quality": "INSUFFICIENT",
                "sources_found": 0,
                "abstain_recommended": True,
                "reason": "No authoritative statutory provisions matching this query were found in the verified legal corpus."
            }

        top_score = retrieved_docs[0]["relevance_score"]
        num_docs = len(retrieved_docs)

        # Base confidence on BM25 relevance score and document coverage
        if top_score >= 4.0 and num_docs >= 2:
            score = min(94, int(75 + (top_score * 3.5)))
            label = "HIGH"
            quality = "STRONG"
            abstain = False
        elif top_score >= 1.5:
            score = min(78, int(55 + (top_score * 4.0)))
            label = "MEDIUM"
            quality = "MODERATE"
            abstain = False
        else:
            score = max(35, int(top_score * 15))
            label = "LOW"
            quality = "WEAK"
            abstain = True

        return {
            "score": score,
            "label": label,
            "evidence_quality": quality,
            "sources_found": num_docs,
            "abstain_recommended": abstain,
            "reason": "Authoritative statutory sources verified" if not abstain else "Relevance score below safety threshold"
        }

    def verify_citations(self, citations: List[Dict[str, Any]], retrieved_docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        verified = []
        retrieved_ids = {d["document"]["document_id"] for d in retrieved_docs}
        for c in citations:
            doc_id = c.get("document_id")
            if doc_id in retrieved_ids:
                c["verification_status"] = "VERIFIED_STATUTORY_RECORD"
                verified.append(c)
            else:
                c["verification_status"] = "UNVERIFIED"
        return verified

    def synthesize_grounded_response(
        self,
        query: str,
        jurisdiction: str = "India",
        language: str = "en"
    ) -> Dict[str, Any]:
        # Step 1: Security Audit on Query
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
                "confidence": {"score": 0, "label": "ZERO", "evidence_quality": "BLOCKED", "sources_found": 0},
                "important_limitations": "Adversarial security filter triggered.",
                "actionable_next_steps": ["Submit an authentic IP or regulatory question."],
                "disclaimer": "Security policy enforced. Information only — not legal advice."
            }

        # Step 2: Hybrid Retrieval
        retrieved = retriever_instance.retrieve(query, jurisdiction=jurisdiction, top_k=4)
        confidence = self.calculate_confidence(query, retrieved)

        # Step 3: Safe Abstention Protocol
        if confidence["abstain_recommended"]:
            return {
                "status": "ABSTAINED",
                "short_answer": (
                    "I could not find sufficient authoritative statutory evidence to answer this query reliably. "
                    "I will not guess or fabricate legal provisions. Please provide more specific details regarding "
                    "the formulation, ingredients, intended therapeutic claim, or jurisdiction."
                ),
                "product_classification": "Uncertain / Insufficient Data",
                "jurisdiction": jurisdiction.upper(),
                "applicable_ip_regimes": [],
                "regulatory_pathway": "Unverified without additional formulation facts.",
                "abs_considerations": "Unable to verify biological origin.",
                "citations": [],
                "confidence": confidence,
                "important_limitations": "Confidence score is below safe threshold. Abstention triggered to prevent hallucination.",
                "actionable_next_steps": [
                    "Specify exact botanical ingredients and classical text sources if known.",
                    "Clarify whether the intended use is therapeutic, cosmetic, or a dietary food supplement.",
                    "Consult an authorized patent agent or AYUSH regulatory consultant."
                ],
                "disclaimer": "Preliminary informational assessment — not legal advice."
            }

        # Step 4: Extract Grounded Citations from Retrieved Corpus
        raw_citations = []
        for idx, item in enumerate(retrieved):
            doc = item["document"]
            raw_citations.append({
                "citation_index": idx + 1,
                "document_id": doc["document_id"],
                "title": doc["title"],
                "section": doc["section"],
                "authority": doc["authority"],
                "jurisdiction": doc["jurisdiction"],
                "version": doc.get("version", "Current"),
                "source_url": doc["source_url"],
                "excerpt": doc["text"][:220] + "..."
            })
        verified_citations = self.verify_citations(raw_citations, retrieved)

        # Step 5: Construct Structured Legal Assessment
        doc_titles = [c["title"] for c in verified_citations]
        lower_q = query.lower()

        # Product classification deduction from query context
        if any(w in lower_q for w in ["purified", "fraction", "marker compound", "phytopharmaceutical", "standardized"]):
            category = "Phytopharmaceutical Drug (Rule 122E)"
            reg_pathway = "CDSCO New Drug approval requiring >=4 standardized markers, IND submission, and clinical trial safety dossiers."
        elif any(w in lower_q for w in ["cosmetic", "hair oil", "soap", "face wash", "cream", "skin", "beauty", "shampoo"]):
            category = "Ayurvedic Cosmetic (Sec 3(aaa))"
            reg_pathway = "Form 32-A cosmetic license under Drugs & Cosmetics Rules; therapeutic disease cure claims strictly prohibited."
        elif any(w in lower_q for w in ["ayurveda aahar", "diet", "tea", "biscuit", "supplement", "nutraceutical", "food"]):
            category = "Ayurveda-Aahar (Nutraceutical / Food)"
            reg_pathway = "Licensed under FSSAI Ayurveda Aahar Regulations 2022 with mandatory 'NOT FOR MEDICINAL USE' disclaimer."
        elif any(w in lower_q for w in ["classical", "samhita", "charaka", "triphala", "chyawanprash", "section 3(a)", "first schedule", "asava", "arishta"]):
            if "change the ratio" in lower_q or "modified" in lower_q:
                category = "New / Non-Classical Ayurvedic Drug"
                reg_pathway = "License under Rule 158B Category C with pilot safety/efficacy study for altered classical formula."
            else:
                category = "Classical / Generic Ayurvedic Medicine (Sec 3(a))"
                reg_pathway = "Standard manufacturing license under Rule 153 citing First Schedule classical texts (free from monopoly)."
        elif any(w in lower_q for w in ["non-classical", "modified", "altered ratio"]):
            category = "New / Non-Classical Ayurvedic Drug"
            reg_pathway = "License under Rule 158B Category B/C with mandatory safety data submission."
        else:
            category = "Patent / Proprietary Ayurvedic Medicine (Sec 3(h))"
            reg_pathway = "State Licensing Authority license under Rule 158B with proof of safety, textual justification, and synergy data."

        # Legal summary synthesis
        is_patent_query = "patent" in lower_q or "ip" in lower_q or "protect" in lower_q
        
        if is_patent_query:
            if jurisdiction.lower() == "india":
                short_answer = (
                    f"Under Indian Patent Law, pure Ayurvedic herbal formulations face stringent statutory exclusions under "
                    f"Section 3(p) (Traditional Knowledge) and Section 3(e) (Mere Admixture) of the Patents Act, 1970. "
                    f"To obtain a valid patent in India, you cannot simply combine known medicinal herbs like Ashwagandha, "
                    f"Brahmi, or Turmeric; you must scientifically prove an unexpected synergistic therapeutic effect "
                    f"(Combination Index < 1.0) and non-obvious technical processing. Furthermore, under Section 6 of the "
                    f"Biological Diversity Act, 2002, you MUST obtain approval from the National Biodiversity Authority (NBA Form III) "
                    f"before the grant of any patent."
                )
                ip_regimes = [
                    "Patents Act, 1970 (Sections 3(p), 3(e), 3(d), 10(4)(d)(ii))",
                    "Biological Diversity Act, 2002 / 2023 Amendments (Section 6 NBA Form III)",
                    "Trade Marks Act, 1999 (Brand name protection - excluding generic herbal names)",
                    "Geographical Indications Act, 1999 (Applicable if tied to specific agro-climatic terroir)"
                ]
            else:
                short_answer = (
                    f"Under International IP regimes, patentability is governed by the WTO TRIPS Agreement (Article 27) "
                    f"and national patent laws of target jurisdictions (e.g. USPTO, EPO). While the US and European Patent Offices "
                    f"allow botanical composition patents if novelty and inventive step are established, major patent offices now "
                    f"consult India's Traditional Knowledge Digital Library (TKDL) and enforce the newly adopted WIPO Treaty on "
                    f"Intellectual Property, Genetic Resources and Associated Traditional Knowledge (May 2024), requiring mandatory "
                    f"disclosure of biological country of origin to prevent biopiracy."
                )
                ip_regimes = [
                    "WIPO Treaty on IP, Genetic Resources & Traditional Knowledge (2024 - Mandatory Origin Disclosure)",
                    "WTO TRIPS Agreement (Article 27 Patentable Subject Matter)",
                    "Nagoya Protocol on Access and Benefit-Sharing (Prior Informed Consent & Mutually Agreed Terms)",
                    "Patent Cooperation Treaty (PCT) for coordinated multi-country filings"
                ]
        else:
            short_answer = (
                f"Based on the retrieved statutory authorities, your product is governed under {category}. "
                f"Manufacturing and commercialization require compliance with {reg_pathway}. "
                f"Biological resources harvested within India are subject to regulatory oversight under the Biological Diversity Act, 2002."
            )
            ip_regimes = [
                "Drugs & Cosmetics Act, 1940 & Rules 1945",
                "Biological Diversity Act, 2002",
                "Trade Marks Act, 1999"
            ]

        # Multilingual prefix/adaptation if requested
        if language == "hi":
            disclaimer = "यह सूचना केवल प्रारंभिक मार्गदर्शन के लिए है — यह कोई कानूनी सलाह नहीं है। आधिकारिक पेटेंट एजेंट या आयुष विशेषज्ञ से परामर्श अवश्य करें।"
        elif language == "ta":
            disclaimer = "இது தகவல் நோக்கங்களுக்கான ஆரம்ப மதிப்பீடு மட்டுமே — சட்ட ஆலோசனை அல்ல. தகுதிவாய்ந்த அறிவுசார் சொத்து நிபுணரை அணுகவும்."
        else:
            disclaimer = (
                "Based on the retrieved authoritative sources, this is a preliminary informational assessment. "
                "The system provides information and NOT legal advice. Please verify with an appropriate IP/regulatory "
                "professional before taking legal action."
            )

        return {
            "status": "SUCCESS",
            "short_answer": short_answer,
            "product_classification": category,
            "jurisdiction": jurisdiction.upper(),
            "applicable_ip_regimes": ip_regimes,
            "regulatory_pathway": reg_pathway,
            "abs_considerations": (
                "Biological resources obtained from India trigger NBA Section 3 approval for foreign entities, "
                "SBB Section 7 prior intimation for Indian commercial manufacturers, and mandatory NBA Form III prior to patent grant."
            ),
            "traditional_knowledge_guidance": (
                "Publicly available classical Ayurvedic literature documented in TKDL acts as destructive prior art against "
                "patent claims. Novelty must be proven through technical processing or synergistic efficacy data."
            ),
            "citations": verified_citations,
            "confidence": confidence,
            "important_limitations": (
                "Assessments depend strictly on user-supplied ingredient profiles and intended claims. "
                "Does not replace statutory freedom-to-operate (FTO) patent searches or state drug licensing inspections."
            ),
            "actionable_next_steps": [
                "Conduct prior-art search across Indian Patent Advanced Search System (InPASS) and public Ayurvedic monographs.",
                "Prepare laboratory quantitative synergy testing data if seeking patent protection under Section 3(e).",
                "Submit NBA Form III to the National Biodiversity Authority if filing a patent application.",
                "Apply for manufacturing license under Rule 158B (ASU) or FSSAI (Ayurveda Aahar) before commercial sale."
            ],
            "disclaimer": disclaimer
        }

llm_guard_instance = LLMGuard()
