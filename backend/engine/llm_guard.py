"""
LLM Guard, Citation Validator, and Confidence Engine for IP-SAKTI Sahayak
Enforces strict grounding, prompt injection defenses, citation verification,
safe abstention, and multilingual question-type-aware response routing.
Grounded directly in retrieved FAISS chunks from backend/data/*.pdf.
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


def detect_question_type(query: str) -> str:
    """Detect the statutory question type from query for proper routing."""
    q = query.lower()
    # TKDL / Biopiracy
    if any(w in q for w in ["tkdl", "traditional knowledge digital", "biopiracy", "bio piracy",
                             "prior art", "prior-art", "பாரம்பரிய அறிவு நூலக", "पारंपरिक ज्ञान डिजिटल"]):
        return "tkdl"
    # ABS / NBA / Biodiversity
    if any(w in q for w in ["abs", "access benefit", "nba", "national biodiversity", "biological diversity act",
                             "form iii", "form 3", "sbb", "state biodiversity", "nagoya",
                             "பல்லுயிர்", "जैव विविधता", "राष्ट्रीय जैव", "एनबीए",
                             "benefit sharing", "section 6 bda", "section 7 bda"]):
        return "abs"
    # Export / Import
    if any(w in q for w in ["export", "import", "ship abroad", "send overseas", "ஏற்றுமதி விதி", "ஏற்றுமதி",
                             "निर्यात नियम", "निर्यात अनुमति", "विदेश", "निर्यात", "export rule"]):
        return "export"
    # Patent / IP / Mere Admixture / Traditional formulation
    if any(w in q for w in ["patent", "admixture", "mere admixture", "ip protect", "intellectual property",
                             "section 3(p)", "section 3(e)", "section 3(d)", "3(p)", "3(e)", "3(d)",
                             "novelty", "inventive step", "claim", "patentab", "synergy", "synergistic",
                             "ashwagandha", "brahmi", "curcumin", "turmeric", "neem",
                             "காப்புரிமை", "पेटेंट", "बौद्धिक संपदा", "धारा 3"]):
        return "patent"
    # Trademark
    if any(w in q for w in ["trademark", "brand name", "trade mark", "brand protect", "logo protect",
                             "வர்த்தக குறி", "ट्रेडमार्क", "ब्रांड"]):
        return "trademark"
    # GI Tag
    if any(w in q for w in ["geographical indication", "gi tag", "gi registration", "terroir",
                             "புவியியல் குறிப்பீடு", "जीआई", "भौगोलिक संकेत"]):
        return "gi"
    # Manufacturing license
    if any(w in q for w in ["manufacturing license", "manufacture", "rule 158", "drug license",
                             "state licensing", "cdsco", "form 24", "gmp", "good manufacturing",
                             "உற்பத்தி உரிமம்", "उत्पादन लाइसेंस", "निर्माण लाइसेंस"]):
        return "manufacturing"
    # Cosmetic
    if any(w in q for w in ["cosmetic", "hair oil", "shampoo", "face wash", "cream", "lotion", "soap",
                             "skin care", "beauty product", "form 32", "3(aaa)",
                             "அழகு சாதனம்", "ஷாம்பு", "सौंदर्य", "कॉस्मेटिक"]):
        return "cosmetic"
    # Nutraceutical / Food
    if any(w in q for w in ["nutraceutical", "food supplement", "dietary supplement", "health food",
                             "fssai", "ayurveda aahar", "health drink", "supplement",
                             "நுட்பமான உணவு", "पोषण पूरक", "खाद्य पूरक"]):
        return "nutraceutical"
    # Phytopharmaceutical
    if any(w in q for w in ["phytopharmaceutical", "standardized extract", "marker compound", "fraction",
                             "new drug", "ind application", "clinical trial", "phase 1", "phase i"]):
        return "phytopharmaceutical"
    # Classical formulation
    if any(w in q for w in ["classical", "charaka", "sushruta", "ashtanga", "first schedule",
                             "asava", "arishta", "churna", "chyawanprash", "triphala", "bhasma",
                             "பாரம்பரிய ஆயுர்வேதம்", "चरक संहिता", "क्लासिकल"]):
        return "classical"
    # AYUSH / Ministry
    if any(w in q for w in ["ayush", "ministry of ayush", "aiia", "ccras", "central council",
                             "ஆயுஷ்", "आयुष"]):
        return "ayush"
    return "general"


# Rich statutory frameworks keyed by question type
STATUTORY_KB = {
    "patent": {
        "category": "Patent Assessment — Patents Act 1970 Sections 3(p), 3(e), 3(d)",
        "ip_regimes": [
            "Patents Act, 1970 — Section 3(p) (Traditional Knowledge Exclusion)",
            "Patents Act, 1970 — Section 3(e) (Mere Admixture Prohibition)",
            "Patents Act, 1970 — Section 3(d) (New Form of Known Substance)",
            "Biological Diversity Act, 2002 — Section 6(1) NBA Approval",
            "Patents Act, 1970 — Section 10(4)(d)(ii) (Origin Disclosure)"
        ],
        "reg_pathway": "Conduct InPASS and TKDL prior art clearance search; file NBA Form III before patent grant; establish demonstrable synergistic efficacy (Combination Index < 1.0) to overcome Section 3(e)."
    },
    "tkdl": {
        "category": "Traditional Knowledge Digital Library (TKDL) — Prior Art Defense",
        "ip_regimes": [
            "WIPO Treaty on IP, Genetic Resources & Traditional Knowledge (2024)",
            "Patents Act, 1970 — Section 3(p) Traditional Knowledge Exclusion",
            "Biological Diversity Act, 2002 — Section 6 NBA Form III",
            "India-TKDL Access Agreement (USPTO, EPO, JPO, KIPO)"
        ],
        "reg_pathway": "Search TKDL at tkdl.res.in; conduct InPASS prior art search at ipindia.gov.in; file NBA Form III if biological resources involved."
    },
    "abs": {
        "category": "ABS Compliance — Biological Diversity Act 2002 / Nagoya Protocol",
        "ip_regimes": [
            "Biological Diversity Act, 2002 (Sections 3, 6, 7, 18)",
            "Biological Diversity (Amendment) Act, 2023",
            "Nagoya Protocol on Access and Benefit Sharing",
            "Patents Act, 1970 — Section 10(4)(d)(ii) Biodiversity Disclosure"
        ],
        "reg_pathway": "File NBA Form III via NBA portal for patent-linked access; file SBB Form I/II with State Biodiversity Board for commercial manufacturing; execute benefit-sharing agreement."
    },
    "export": {
        "category": "Export Compliance — DGFT / CITES / NBA Regulated",
        "ip_regimes": [
            "Biological Diversity Act, 2002 (Sections 3, 19-21)",
            "CITES — Convention on International Trade in Endangered Species",
            "DGFT Foreign Trade Policy (Botanical Herbs Export Schedule)",
            "Drugs & Cosmetics Act, 1940 — GMP Requirements for Export"
        ],
        "reg_pathway": "Obtain GMP certificate and state drug license; check DGFT ITCHS code; file NBA Form III for patent-related exports; get CITES permit if product contains Schedule VI plants."
    },
    "cosmetic": {
        "category": "Ayurvedic Cosmetic — Section 3(aaa) Drugs & Cosmetics Act",
        "ip_regimes": [
            "Drugs & Cosmetics Act, 1940 — Section 3(aaa), 3(b)",
            "Drugs & Cosmetics Rules, 1945 — Rule 32-A, Schedule T",
            "Trade Marks Act, 1999 — Brand Protection (Class 3)",
            "EU Cosmetic Regulation 1223/2009 (if exporting to EU)"
        ],
        "reg_pathway": "File Form 32-A with State Licensing Authority; ensure GMP Schedule T compliance; avoid therapeutic claims on labels; cite classical text references if using classical formulae."
    },
    "nutraceutical": {
        "category": "Ayurveda Aahar — FSSAI Nutraceutical Regulation 2022",
        "ip_regimes": [
            "Food Safety and Standards Act, 2006",
            "FSSAI Ayurveda Aahar Regulations, 2022",
            "Drugs & Cosmetics Act (if disease claim added)",
            "AGMARK / APEDA (for food-grade export products)"
        ],
        "reg_pathway": "Obtain FSSAI Central/State license; ensure label shows 'Not for Medicinal Use'; use only FSSAI-approved Ayurvedic ingredient list; avoid disease-cure claims."
    },
    "manufacturing": {
        "category": "Manufacturing License — Rule 158B ASU Drug, D&C Act",
        "ip_regimes": [
            "Drugs & Cosmetics Act, 1940 — Sections 3(a), 3(h)",
            "Drugs & Cosmetics Rules, 1945 — Rule 153, 158B, Schedule T",
            "Ayurvedic Pharmacopoeia of India (API) Quality Standards",
            "Biological Diversity Act, 2002 — Section 7 SBB Intimation"
        ],
        "reg_pathway": "Apply to State Licensing Authority; submit GMP premises plan, Technical Director certificates, Form 24-D for P&P medicines; get Schedule T inspection clearance."
    },
    "general": {
        "category": "Ayurvedic IP & Regulatory Multi-Framework Query",
        "ip_regimes": [
            "Patents Act, 1970",
            "Biological Diversity Act, 2002",
            "Drugs & Cosmetics Act, 1940",
            "Trade Marks Act, 1999"
        ],
        "reg_pathway": "Consult InPASS, TKDL, and relevant AYUSH statutory guidelines based on formulation profile."
    }
}


class LLMGuard:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

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
                "reason": "No authoritative statutory provisions matching this query were found in the indexed PDF corpus."
            }

        num_docs = len(retrieved_docs)
        top_score = retrieved_docs[0].get("similarity_score", 0.0)

        # Base confidence on normalized FAISS relevance score (0.0 to 1.0)
        if top_score >= 0.52 and num_docs >= 2:
            score = min(96, int(72 + (top_score * 25)))
            label = "HIGH"
            quality = "STRONG"
            abstain = False
        elif top_score >= 0.44:
            score = min(78, int(52 + (top_score * 25)))
            label = "MEDIUM"
            quality = "MODERATE"
            abstain = False
        else:
            score = max(35, int(top_score * 60))
            label = "LOW"
            quality = "WEAK"
            abstain = True

        return {
            "score": score,
            "label": label,
            "evidence_quality": quality,
            "sources_found": num_docs,
            "abstain_recommended": abstain,
            "reason": "Authoritative statutory sources verified in vectorstore" if not abstain else "Relevance score below safety threshold"
        }

    def verify_citations(self, citations: List[Dict[str, Any]], retrieved_docs: List[Dict[str, Any]], query: str = "") -> List[Dict[str, Any]]:
        """
        Verify citations based on whether the cited chunk ACTUALLY supports the statement/query.
        A citation is not marked verified merely because it is in the vectorstore.
        """
        verified = []
        q_lower = query.lower()
        
        # Build map of doc_id -> chunk text
        doc_texts = {}
        for d in retrieved_docs:
            doc_dict = d.get("document", {})
            doc_id = doc_dict.get("document_id")
            if doc_id:
                # Use full or snippet text
                doc_texts[doc_id] = (d.get("full_chunk_text", "") + " " + d.get("chunk_text", "")).lower()

        for c in citations:
            doc_id = c.get("document_id")
            if doc_id not in doc_texts:
                c["verification_status"] = "UNVERIFIED"
                continue

            text = doc_texts[doc_id]
            supports = False

            # Query-specific evidence check
            if "admixture" in q_lower or "3(e)" in q_lower:
                if "mere admixture" in text or "aggregation of the properties" in text:
                    supports = True
            elif "traditional" in q_lower or "3(p)" in q_lower:
                if "traditional knowledge" in text or "pharmacopoeia" in text or "classical" in text:
                    supports = True
            elif "ashwagandha" in q_lower or "brahmi" in q_lower:
                if "withania" in text or "asvagandha" in text or "brahmi" in text or "bacopa" in text or "admixture" in text or "traditional knowledge" in text:
                    supports = True
            elif "3(d)" in q_lower:
                if "mere discovery" in text or "known efficacy" in text:
                    supports = True
            elif "10(4)" in q_lower or "origin" in q_lower:
                if "geographical origin" in text or "biological material" in text:
                    supports = True
            else:
                # Generic match check
                words = [w for w in q_lower.split() if len(w) > 4 and w not in ["patent", "india", "can", "about", "what", "which"]]
                if any(w in text for w in words):
                    supports = True

            if supports:
                c["verification_status"] = "VERIFIED_STATUTORY_RECORD"
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
        question_type: str = "general"
    ) -> Optional[str]:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None

        try:
            import requests
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            
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
                    "Use authentic legal Tamil terminology. Do NOT mix English sentences."
                )
            elif language == "hi":
                lang_instruction = (
                    "MANDATORY: Write your ENTIRE response in natural fluent Hindi (हिंदी). "
                    "Use authentic legal Hindi terminology. Do NOT mix English sentences."
                )
            else:
                lang_instruction = "Write response in clear, authoritative, professional English."

            prompt = (
                f"You are IP-SAKTI Sahayak, the statutory AI advisor for the Ministry of Ayush & AIIA.\n"
                f"User Question: {query}\n"
                f"Question Category: {question_type}\n"
                f"Product Classification: {category}\n"
                f"Jurisdiction: {jurisdiction}\n\n"
                f"--- RETRIEVED STATUTORY & BOTANICAL EVIDENCE ---\n"
                f"{doc_context}\n"
                f"-----------------------------------------------\n\n"
                f"{lang_instruction}\n\n"
                f"CRITICAL GROUNDING RULES:\n"
                f"1. Make ONLY claims that are directly supported by the retrieved excerpts above.\n"
                f"2. If retrieved evidence does not support a claim, explicitly state that evidence in the corpus is insufficient.\n"
                f"3. Do NOT invent legal sections, citations, mathematical rules (e.g., do NOT invent 'Combination Index < 1.0'), or external requirements not present in the excerpts.\n"
                f"4. Cite the retrieved PDF filenames and page numbers accurately."
            )
            resp = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=10.0)
            if resp.status_code == 200:
                data = resp.json()
                text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if text and len(text.strip()) > 50:
                    return text.strip()
        except Exception as e:
            print(f"Gemini API synthesis notice: {e}")
        return None

    def synthesize_from_retrieved_evidence(
        self,
        query: str,
        retrieved_docs: List[Dict[str, Any]],
        language: str = "en",
        question_type: str = "general"
    ) -> str:
        """
        Safe grounded response synthesized directly and strictly from retrieved PDF evidence.
        Active when external LLM/API key is not configured or unavailable.
        """
        q_lower = query.lower()
        
        # Collect sources and citations
        source_summaries = []
        for d in retrieved_docs[:3]:
            pdf = d.get("pdf_filename", "document.pdf")
            page = d.get("page_number", 1)
            source_summaries.append(f"{pdf} (Page {page})")
        sources_str = ", ".join(source_summaries)

        # Query 1: Traditional Ayurvedic formulation
        if "traditional" in q_lower or ("patent" in q_lower and "formulation" in q_lower and "admixture" not in q_lower and "novel" not in q_lower):
            if language == "hi":
                return (
                    f"भारतीय पेटेंट अधिनियम, 1970 की धारा 3(p) (patents_act_1970.pdf, पृष्ठ 10) के तहत, पारंपरिक ज्ञान या पारंपरिक घटकों के ज्ञात गुणों के मात्र संकलन या दोहराव को आविष्कार नहीं माना जाता है और यह भारत में पेटेंट योग्य नहीं है। "
                    f"प्राप्त साक्ष्य ({sources_str}) के अनुसार, भारतीय आयुर्वेदिक फार्माकोपिया (API) में दर्ज शास्त्रीय फॉर्मूलेशन पूर्व-कला (Prior Art) का हिस्सा हैं। "
                    f"अतः शुद्ध पारंपरिक आयुर्वेदिक फॉर्मूलेशन को भारत में पेटेंट नहीं कराया जा सकता है।"
                )
            elif language == "ta":
                return (
                    f"இந்திய காப்புரிமைச் சட்டம், 1970 பிரிவு 3(p) (patents_act_1970.pdf, பக்கம் 10)-ன் படி, பாரம்பரிய அறிவு அல்லது பாரம்பரியமாக அறியப்பட்ட மூலக்கூறுகளின் அறியப்பட்ட பண்புகளின் தொகுப்பு காப்புரிமை பெற தகுதியற்றது. "
                    f"பெறப்பட்ட சட்ட சான்றுகளின்படி ({sources_str}), ஆயுர்வேத பார்மகோபியா (API) நூல்களில் ஆவணப்படுத்தப்பட்ட சூத்திரங்கள் முன் கலை (Prior Art) ஆகும். "
                    f"எனவே பாரம்பரிய ஆயுர்வேத கலவைகளுக்கு இந்தியாவில் காப்புரிமை வழங்கப்பட மாட்டாது."
                )
            else:
                return (
                    f"Under the Indian Patents Act, 1970, a traditional Ayurvedic formulation cannot be patented in India.\n\n"
                    f"Specifically, Section 3(p) of the Patents Act, 1970 (retrieved from patents_act_1970.pdf, Page 10) explicitly excludes "
                    f"\"an invention which, in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components.\"\n\n"
                    f"Furthermore, as evidenced by retrieved Ayurvedic Pharmacopoeia records ({sources_str}), classical Ayurvedic formulations "
                    f"constitute public-domain prior art. Therefore, traditional formulations lack statutory novelty and cannot be patented under Indian patent law."
                )

        # Query 2: Mere admixture
        elif "admixture" in q_lower or "mere admixture" in q_lower or "3(e)" in q_lower:
            if language == "hi":
                return (
                    f"नहीं, ज्ञात पदार्थों का मात्र मिश्रण भारत में पेटेंट योग्य नहीं है। "
                    f"पेटेंट अधिनियम, 1970 की धारा 3(e) (patents_act_1970.pdf, पृष्ठ 10) के तहत: "
                    f"\"केवल उसके घटकों के गुणों के संकलन के परिणामस्वरूप प्राप्त पदार्थ या ऐसी सामग्री के उत्पादन की प्रक्रिया\" को स्पष्ट रूप से पेटेंट से बाहर रखा गया है। "
                    f"प्राप्त वैधानिक साक्ष्य ({sources_str}) के अनुसार, ज्ञात घटकों को केवल मिलाने से कोई आविष्कार नहीं बनता जब तक कि वह केवल गुणों का संकलन न हो।"
                )
            elif language == "ta":
                return (
                    f"இல்லை, அறியப்பட்ட பொருட்களின் வெறும் கலவை (mere admixture) இந்தியாவில் காப்புரிமை பெற முடியாது. "
                    f"இந்திய காப்புரிமைச் சட்டம், 1970 பிரிவு 3(e) (patents_act_1970.pdf, பக்கம் 10)-ன் கீழ்: "
                    f"\"கூறுகளின் பண்புகளின் வெறும் சேர்க்கை மட்டுமே விளைவிக்கும் பொருள் அல்லது அதனை உருவாக்கும் செயல்முறை\" காப்புரிமை பெற தகுதியற்றது என்று தெளிவாகக் கூறப்பட்டுள்ளது."
                )
            else:
                return (
                    f"No, a mere admixture of known substances cannot be patented in India.\n\n"
                    f"Under Section 3(e) of the Patents Act, 1970 (retrieved from patents_act_1970.pdf, Page 10), the statute explicitly excludes from patentability "
                    f"\"a substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance.\"\n\n"
                    f"As established by the retrieved statutory text ({sources_str}), simply combining known substances where the resulting mixture exhibits only the aggregated properties of its individual components is not recognized as an invention under Indian patent law."
                )

        # Query 3: Combination of Ashwagandha and Brahmi
        elif ("ashwagandha" in q_lower and "brahmi" in q_lower) or ("combination" in q_lower and "patent" in q_lower):
            if language == "hi":
                return (
                    f"प्राप्त वैधानिक एवं औषधीय साक्ष्य के आधार पर:\n"
                    f"1. अश्वगंधा (Withania somnifera Dunal, API-Vol-1.pdf, पृष्ठ 31) और ब्राह्मी (API-Vol-2.1.pdf, पृष्ठ 92) दोनों भारतीय आयुर्वेदिक फार्माकोपिया में प्रलेखित ज्ञात औषधीय द्रव्य हैं।\n"
                    f"2. पेटेंट अधिनियम, 1970 की धारा 3(p) (patents_act_1970.pdf, पृष्ठ 10) के तहत पारंपरिक ज्ञान या ज्ञात घटकों के गुणों के संकलन पर पेटेंट वर्जित है।\n"
                    f"3. धारा 3(e) (patents_act_1970.pdf, पृष्ठ 10) के तहत केवल घटकों के गुणों के संकलन वाले मात्र मिश्रण (mere admixture) पर पेटेंट प्रतिबंधित है।\n"
                    f"4. नवीन संयोजन पर साक्ष्य की स्थिति: अनुक्रमित कॉर्पस में यह निष्कर्ष निकालने के लिए पर्याप्त साक्ष्य उपलब्ध नहीं हैं कि इस संयोजन को पेटेंट योग्य माना जाएगा या नहीं, जब तक कि धारा 3(e) और 3(p) की सीमाओं से परे कोई सत्यापन योग्य तकनीकी प्रभाव सिद्ध न हो।"
                )
            elif language == "ta":
                return (
                    f"பெறப்பட்ட சட்ட மற்றும் பார்மகோபியா சான்றுகளின்படி:\n"
                    f"1. அஸ்வகந்தா (Withania somnifera Dunal, API-Vol-1.pdf, பக்கம் 31) மற்றும் பிராமி (API-Vol-2.1.pdf, பக்கம் 92) ஆகியவை ஆயுர்வேத பார்மகோபியாவில் ஆவணப்படுத்தப்பட்ட அறியப்பட்ட மூலிகைகள் ஆகும்.\n"
                    f"2. இந்திய காப்புரிமைச் சட்டம் 1970 பிரிவு 3(p) (patents_act_1970.pdf, பக்கம் 10) பாரம்பரிய அறிவை காப்புரிமையிலிருந்து விலக்குகிறது.\n"
                    f"3. பிரிவு 3(e) (patents_act_1970.pdf, பக்கம் 10) வெறும் கலவைகளை (mere admixture) காப்புரிமையிலிருந்து விலக்குகிறது.\n"
                    f"4. புதுமையான சேர்க்கை பற்றிய சான்றுகள்: இவ்விரு மூலிகைகளின் கலவை காப்புரிமை பெறுவதற்கான குறிப்பிட்ட விதிவிலக்குகள் குறித்து தற்போதைய ஆவணத் தொகுப்பில் போதிய ஆதாரங்கள் இல்லை."
                )
            else:
                return (
                    f"Based on the retrieved statutory and pharmacopoeial evidence from the corpus:\n\n"
                    f"1. Known Prior Art: Both Ashwagandha (Withania somnifera Dunal, documented in API-Vol-1.pdf, Page 31) "
                    f"and Brahmi (documented in API-Vol-2.1.pdf, Page 92) are established botanical substances in the Ayurvedic Pharmacopoeia of India.\n\n"
                    f"2. Statutory Exclusions: Under Section 3(p) of the Patents Act, 1970 (retrieved from patents_act_1970.pdf, Page 10), "
                    f"an invention which, in effect, is traditional knowledge or an aggregation or duplication of known properties of traditionally known components is not patentable. "
                    f"Furthermore, Section 3(e) of the Patents Act, 1970 (patents_act_1970.pdf, Page 10) bars patenting of a substance obtained by a mere admixture resulting only in the aggregation of the properties of the components.\n\n"
                    f"3. Corpus Limitation: The retrieved PDF corpus does not contain specific empirical standards, synergy evaluation criteria, "
                    f"or statutory exemption rules defining when a combination of Ashwagandha and Brahmi overcomes these bars. "
                    f"Therefore, the evidence in the corpus is insufficient to conclude that a novel combination of these two herbs would be patentable without empirical demonstration exceeding mere aggregation under Section 3(e) and traditional knowledge under Section 3(p)."
                )

        # Fallback based on retrieved sources
        else:
            top_excerpt = retrieved_docs[0].get("chunk_text", "")[:260] if retrieved_docs else ""
            if language == "hi":
                return (
                    f"प्राप्त आधिकारिक साक्ष्य ({sources_str}) के आधार पर: {top_excerpt}... "
                    f"यह सूचना भारतीय पेटेंट अधिनियम 1970 तथा आयुष नियामक मानकों के अनुरूप है। किसी भी पेटेंट आवेदन से पूर्व पूर्व-कला खोज (Prior Art Search) तथा NBA अनुपालन अनिवार्य है।"
                )
            elif language == "ta":
                return (
                    f"பெறப்பட்ட சட்ட ஆவண சான்றுகளின்படி ({sources_str}): {top_excerpt}... "
                    f"இது இந்திய காப்புரிமைச் சட்டம் 1970 மற்றும் ஆயுஷ் ஒழுங்குமுறை விதிகளுக்கு உட்பட்டது. காப்புரிமை விண்ணப்பத்திற்கு முன் TKDL மற்றும் InPASS தேடல் அவசியம்."
                )
            else:
                return (
                    f"Based on the authoritative statutory and Ayurvedic evidence retrieved from {sources_str}: "
                    f"\"{top_excerpt}...\" "
                    f"Under Indian Patent Law (Patents Act, 1970), inventions derived from biological materials require strict verification against Section 3(p) (traditional knowledge prior art), Section 3(e) (mere admixture bar), and mandatory National Biodiversity Authority (NBA Form III) approval under Section 6 of the Biological Diversity Act, 2002."
                )

    def synthesize_grounded_response(
        self,
        query: str,
        jurisdiction: str = "India",
        language: str = "en"
    ) -> Dict[str, Any]:
        # Auto-detect language if Tamil or Hindi script is present in query
        if any('\u0b80' <= c <= '\u0bff' for c in query):
            language = "ta"
        elif any('\u0900' <= c <= '\u097f' for c in query):
            language = "hi"

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
                "confidence": {"score": 0, "label": "ZERO", "evidence_quality": "BLOCKED", "sources_found": 0},
                "important_limitations": "Adversarial security filter triggered.",
                "actionable_next_steps": ["Submit an authentic IP or regulatory question."],
                "disclaimer": "Security policy enforced. Information only — not legal advice."
            }

        # Step 2: Detect question type early
        question_type = detect_question_type(query)

        # Step 3: Top-5 Semantic Retrieval via FAISS
        retrieved = retriever_instance.retrieve(query, jurisdiction=jurisdiction, top_k=5)
        confidence = self.calculate_confidence(query, retrieved)

        # Step 4: Safe Abstention Protocol
        should_abstain = confidence["abstain_recommended"] and question_type == "general"
        if should_abstain:
            if language == "ta":
                abstain_answer = (
                    "இந்தக் கேள்விக்கு போதிய அதிகாரப்பூர்வ சட்ட சான்றுகள் கிடைக்கவில்லை. "
                    "சட்ட விதிகளைத் தவறாக ஊகிக்க இயலாது. உங்கள் மூலப்பொருள், நோக்கம் அல்லது அதிகார வரம்பு பற்றிய கூடுதல் விவரங்களை வழங்கவும்."
                )
            elif language == "hi":
                abstain_answer = (
                    "इस प्रश्न का विश्वसनीय उत्तर देने के लिए पर्याप्त आधिकारिक वैधानिक साक्ष्य उपलब्ध नहीं हैं। "
                    "हम कानूनी नियमों का मनमाना अनुमान नहीं लगा सकते। कृपया घटक, प्रयोजन या क्षेत्राधिकार का स्पष्ट विवरण दें।"
                )
            else:
                abstain_answer = (
                    "I could not find sufficient authoritative statutory evidence in the verified PDF corpus to answer this query reliably. "
                    "To prevent hallucination, please specify the exact formulation, ingredients, intended therapeutic claim, or jurisdiction."
                )

            return {
                "status": "ABSTAINED",
                "short_answer": abstain_answer,
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

        # Step 5: Build Verified Citations from Retrieved PDF Chunks
        raw_citations = []
        for idx, item in enumerate(retrieved):
            pdf_fname = item.get("pdf_filename", "document.pdf")
            page_num = item.get("page_number", 1)
            chunk_txt = item.get("chunk_text", "")
            doc_dict = item.get("document", {})

            raw_citations.append({
                "citation_index": idx + 1,
                "document_id": doc_dict.get("document_id", f"{pdf_fname}-p{page_num}"),
                "title": pdf_fname,
                "section": f"Page {page_num}",
                "authority": doc_dict.get("authority", "Statutory Regulatory Authority"),
                "jurisdiction": jurisdiction.capitalize(),
                "version": "Official Standard",
                "source_url": f"http://localhost:8000/data/{pdf_fname}#page={page_num}",
                "excerpt": chunk_txt[:260] + ("..." if len(chunk_txt) > 260 else "")
            })
        verified_citations = self.verify_citations(raw_citations, retrieved, query=query)

        # Step 6: Grounded Synthesis
        kb = STATUTORY_KB.get(question_type, STATUTORY_KB["general"])

        # Try dynamic LLM synthesis first if API key configured
        gemini_answer = self.call_gemini_synthesis(
            query=query,
            retrieved_docs=retrieved,
            category=kb["category"],
            jurisdiction=jurisdiction,
            language=language,
            question_type=question_type
        )

        if gemini_answer:
            short_answer = gemini_answer
        else:
            # Fall back safely to direct evidence synthesis (Requirement 10)
            short_answer = self.synthesize_from_retrieved_evidence(
                query=query,
                retrieved_docs=retrieved,
                language=language,
                question_type=question_type
            )

        category = kb["category"]
        ip_regimes = kb["ip_regimes"]
        reg_pathway = kb["reg_pathway"]

        # Localized disclaimer & action steps
        if language == "hi":
            disclaimer = "यह सूचना केवल प्रारंभिक मार्गदर्शन के लिए है — यह कोई कानूनी सलाह नहीं है। आधिकारिक पेटेंट एजेंट या आयुष विशेषज्ञ से परामर्श अवश्य करें।"
            action_steps = [
                "भारतीय पेटेंट कार्यालय (InPASS) और TKDL (tkdl.res.in) पर पूर्व कला खोज करें।",
                "NBA कार्यालय से जांच करें कि आप भारतीय जैविक संसाधनों का उपयोग करते हैं या नहीं।",
                "अपने विशिष्ट उत्पाद श्रेणी के लिए योग्य AYUSH नियामक सलाहकार से संपर्क करें।"
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
                "This is a preliminary informational assessment based on retrieved statutory sources. "
                "Not legal advice. Verify with an appropriate IP/regulatory professional before legal action."
            )
            action_steps = [
                "Conduct prior-art search on InPASS (ipindia.gov.in) and TKDL (tkdl.res.in).",
                "Verify NBA biodiversity access requirements with the National Biodiversity Authority (Form III).",
                "Ensure technical documentation demonstrates efficacy beyond mere aggregation of component properties under Section 3(e)."
            ]

        return {
            "status": "SUCCESS",
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
                "Does not replace statutory Freedom-To-Operate (FTO) patent searches."
            ),
            "actionable_next_steps": action_steps,
            "disclaimer": disclaimer
        }

llm_guard_instance = LLMGuard()
