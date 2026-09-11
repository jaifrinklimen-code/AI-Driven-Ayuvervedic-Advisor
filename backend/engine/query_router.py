"""
Query Router, Normalization, and Intent Classifier for IP-SAKTI Sahayak
Provides domain classification, entity extraction, intent detection, and ambiguity resolution
for Ayurvedic IP, regulatory, pharmacopoeial, and general queries in EN, HI, and TA.
"""

import re
from typing import Dict, Any, List, Optional, Tuple

# Common typos and normalization dictionary
TERM_NORMALIZATIONS = {
    r"\bayurvedha\b": "ayurveda",
    r"\bayurweda\b": "ayurveda",
    r"\bayur\b": "ayur",
    r"\basu\b": "ayurveda siddha unani",
    r"\bwithania\s+somnifera\b": "ashwagandha",
    r"\basvagandha\b": "ashwagandha",
    r"\bbacopa\s+monnieri\b": "brahmi",
    r"\bcurcuma\s+longa\b": "curcumin turmeric",
    r"\bhaldi\b": "turmeric",
    r"\bharidra\b": "turmeric",
    r"\bazadirachta\s+indica\b": "neem",
    r"\bnimba\b": "neem",
    r"\btinospora\s+cordifolia\b": "giloy",
    r"\bguduchi\b": "giloy",
    r"\bocimum\s+sanctum\b": "tulsi",
    r"\bholy\s+basil\b": "tulsi",
    r"\bchyawanprash\b": "chyawanprash",
    r"\bchavanprash\b": "chyawanprash",
}

# Detected botanical herbs database
KNOWN_HERBS = {
    "ashwagandha": {
        "botanical": "Withania somnifera Dunal",
        "family": "Solanaceae",
        "sanskrit": "अश्वगंधा (Ashwagandha)",
        "tamil": "அஸ்வகந்தா (அமுக்கரா)",
        "source_pdf": "API-Vol-1.pdf",
        "page": 31,
        "actives": "withanolides (withaferin A, withanolide D), somniferine",
        "classical_use": "Balya (strength promoting), Rasayana (rejuvenator), Medhya, Sandhivata",
        "tkdl_status": "Documented in Charaka Samhita and Sushruta Samhita; classical prior art."
    },
    "brahmi": {
        "botanical": "Bacopa monnieri (L.) Pennell",
        "family": "Plantaginaceae",
        "sanskrit": "ब्राह्मी (Brahmi)",
        "tamil": "பிராமி (Brahmi)",
        "source_pdf": "API-Vol-2.1.pdf",
        "page": 92,
        "actives": "bacosides (bacoside A, bacoside B), brahmine",
        "classical_use": "Medhya Rasayana (cognitive enhancer), Smritiprada, Unmada",
        "tkdl_status": "Documented in Charaka Samhita; prior art for memory and nootropic uses."
    },
    "turmeric": {
        "botanical": "Curcuma longa L.",
        "family": "Zingiberaceae",
        "sanskrit": "हरिद्रा (Haridra / Curcumin)",
        "tamil": "மஞ்சள் (Turmeric)",
        "source_pdf": "API-Vol-1.pdf",
        "page": 45,
        "actives": "curcuminoids (curcumin, demethoxycurcumin), volatile oils",
        "classical_use": "Varnya, Krimighna, Kushtaghna, Pramehahara",
        "tkdl_status": "Landmark CSIR patent revocation (US Patent 5,401,504) based on classical TKDL prior art."
    },
    "curcumin": {
        "botanical": "Curcuma longa L. (Curcumin)",
        "family": "Zingiberaceae",
        "sanskrit": "हरिद्रा (Haridra)",
        "tamil": "மஞ்சள் சாறு (Curcumin)",
        "source_pdf": "API-Vol-1.pdf",
        "page": 45,
        "actives": "curcuminoids (95% standard fraction)",
        "classical_use": "Anti-inflammatory, wound healing, antioxidant",
        "tkdl_status": "Documented in TKDL; isolated fractions require Rule 122E CDSCO phytopharmaceutical clearance or Section 3(d) therapeutic efficacy proof."
    },
    "neem": {
        "botanical": "Azadirachta indica A. Juss.",
        "family": "Meliaceae",
        "sanskrit": "निम्ब (Nimba)",
        "tamil": "வேம்பு (Neem)",
        "source_pdf": "API-Vol-2.pdf",
        "page": 115,
        "actives": "azadirachtin, nimbin, nimbidin",
        "classical_use": "Krimighna, Kushtaghna, Kandughna (antimicrobial, skin care)",
        "tkdl_status": "Landmark EPO revocation (EP 436257) based on Indian traditional knowledge."
    },
    "tulsi": {
        "botanical": "Ocimum sanctum L.",
        "family": "Lamiaceae",
        "sanskrit": "तुलसी (Tulsi)",
        "tamil": "துளசி (Tulsi)",
        "source_pdf": "API-Vol-2.pdf",
        "page": 165,
        "actives": "eugenol, rosmarinic acid, caryophyllene",
        "classical_use": "Svasahara, Kasahara, Hridya (respiratory and adaptogenic)",
        "tkdl_status": "Documented across classical Ayurvedic literature; prior art against biopiracy."
    },
    "triphala": {
        "botanical": "Emblica officinalis + Terminalia chebula + Terminalia bellirica",
        "family": "Polyherbal Classical Combination",
        "sanskrit": "त्रिफला (Triphala)",
        "tamil": "திரிபலா (Triphala)",
        "source_pdf": "API-Vol-1.pdf",
        "page": 25,
        "actives": "gallic acid, ellagic acid, chebulagic acid, vitamin C",
        "classical_use": "Chakshushya, Deepana, Rasayana, Anulomana",
        "tkdl_status": "First Schedule classical formulation; public domain; barred from patenting under Sec 3(p) and generic trademark monopoly under Sec 9(1)(b)."
    },
    "giloy": {
        "botanical": "Tinospora cordifolia (Willd.) Miers",
        "family": "Menispermaceae",
        "sanskrit": "गुडूची / गिलोय (Guduchi / Giloy)",
        "tamil": "சீந்தில் கொடி (Giloy)",
        "source_pdf": "API-Vol-1.pdf",
        "page": 41,
        "actives": "tinosporide, cordifolide, berberine",
        "classical_use": "Jvarahara, Rasayana, Dahaprashamana, Tridoshashamana",
        "tkdl_status": "Prominent classical immunomodulator; extensively cataloged in TKDL."
    }
}


def normalize_query(query: str) -> str:
    """Normalize common typos, transliterations, and abbreviations in user query."""
    q = query.strip()
    q_norm = q.lower()
    for pattern, replacement in TERM_NORMALIZATIONS.items():
        q_norm = re.sub(pattern, replacement, q_norm, flags=re.IGNORECASE)
    return q_norm


def extract_entities(query_norm: str) -> Dict[str, Any]:
    """Extract recognized herbs, statutes, institutions, and sections from query."""
    herbs_found = []
    for herb_key, data in KNOWN_HERBS.items():
        if herb_key in query_norm or data["botanical"].lower() in query_norm:
            herbs_found.append({"key": herb_key, **data})

    sections_found = []
    for sec in ["3(p)", "3(e)", "3(d)", "3(a)", "3(h)", "3(aaa)", "10(4)", "158b", "161", "170", "33eea", "rule 122e", "section 6", "section 7", "section 3", "section 39", "form iii", "form 24-d", "form 32-a"]:
        if sec in query_norm:
            sections_found.append(sec)

    return {
        "herbs": herbs_found,
        "sections": sections_found
    }


def classify_query_intent(query: str, selected_jurisdiction: str = "India") -> Dict[str, Any]:
    """
    Intelligent routing of user queries into structured domain, intent, jurisdiction,
    target source types, and ambiguity status.
    """
    q_norm = normalize_query(query)
    q_lower = query.lower()
    entities = extract_entities(q_norm)
    words = [w for w in re.findall(r"\w+", q_norm) if len(w) > 2]

    # Detect language
    is_tamil = any('\u0b80' <= c <= '\u0bff' for c in query)
    is_hindi = any('\u0900' <= c <= '\u097f' for c in query)
    language = "ta" if is_tamil else ("hi" if is_hindi else "en")

    # Detect jurisdiction preference from query or toggle
    jurisdiction = "International" if ("international" in q_norm or "abroad" in q_norm or "foreign" in q_norm or "wipo" in q_norm or "pct" in q_norm or selected_jurisdiction.lower() == "international") else "India"

    # -------------------------------------------------------------
    # 1. AMBIGUOUS / VAGUE QUERIES (Needs Clarification)
    # -------------------------------------------------------------
    # Brief queries without specific ingredients, actions, or sections
    vague_patterns = [
        r"^can\s+i\s+use\s+(ayurveda|ayurvedic|ayurvedha|ayush)(\s+medicine|\s+herbs)?\??$",
        r"^is\s+(ayurveda|ayurvedic)\s+(allowed|legal|valid)\??$",
        r"^can\s+i\s+(sell|patent|register|make)\s+this\??$",
        r"^is\s+this\s+(legal|allowed|patentable)\??$",
        r"^can\s+i\s+do\s+ayurveda\??$",
        r"^how\s+to\s+use\s+ayurveda\??$"
    ]
    is_vague = any(re.match(p, q_norm) for p in vague_patterns) or (len(words) <= 3 and any(w in ["use", "allowed", "legal", "can"] for w in words) and "ayurveda" in q_norm and not entities["herbs"] and not entities["sections"])

    if is_vague:
        return {
            "domain": "Clarification",
            "intent": "VAGUE_CLARIFICATION",
            "category": "Patent / Proprietary & Classical Ayurvedic Framework — Multi-Pathway Inquiry",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "GENERAL_CATALOG",
            "needs_clarification": True,
            "keywords": ["ayurveda", "licensing", "patent", "formulation", "commercialization"]
        }

    # -------------------------------------------------------------
    # 2. HERB MONOGRAPHS ("What is Ashwagandha?", etc.)
    # -------------------------------------------------------------
    if (len(entities["herbs"]) == 1 and any(w in q_norm for w in ["what is", "tell me about", "details of", "monograph", "properties of", "benefits of", "profile of", "botanical name", "active compound", "uses of", "என்ன", "என்னது", "क्या है", "विवरण"])) and not any(w in q_norm for w in ["patent", "trademark", "license", "sell", "export", "infringement"]):
        return {
            "domain": "Ayurveda Pharmacopoeia",
            "intent": "HERB_MONOGRAPH",
            "category": f"Classical / Generic Ayurvedic Monograph & Pharmacopoeial Standard — {entities['herbs'][0]['botanical']}",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "BOTANICAL_MONOGRAPH",
            "needs_clarification": False,
            "keywords": [entities["herbs"][0]["key"], entities["herbs"][0]["botanical"].lower(), "pharmacopoeia", "monograph"]
        }

    # -------------------------------------------------------------
    # 3. GENERAL AYURVEDA OVERVIEW ("What is Ayurveda?", etc.)
    # -------------------------------------------------------------
    if any(p in q_norm for p in ["what is ayurveda", "what are ayurvedic formulations", "what is an ayurvedic formulation", "principles of ayurveda", "concept of ayurveda", "how ayurveda works", "definition of ayurveda", "ஆயுர்வேதம் என்றால் என்ன", "आयुर्वेद क्या है"]):
        return {
            "domain": "Ayurveda Foundations",
            "intent": "GENERAL_AYURVEDA",
            "category": "Classical / Generic Ayurvedic Foundations — Dosha Theory, First Schedule & ASU Compendiums",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "CLASSICAL_COMPENDIUM",
            "needs_clarification": False,
            "keywords": ["ayurveda", "charaka", "doshas", "classical texts", "herbal medicine", "formulation"]
        }

    # -------------------------------------------------------------
    # 4. TRADITIONAL KNOWLEDGE & TKDL ("What is TKDL?", etc.)
    # -------------------------------------------------------------
    if any(p in q_norm for p in ["what is tkdl", "traditional knowledge digital library", "what is traditional knowledge", "what is tk", "biopiracy defense", "csir tkdl", "prior art library", "டிகேடிஎல்", "टीकेडीएल"]):
        return {
            "domain": "Traditional Knowledge Defense",
            "intent": "TRADITIONAL_KNOWLEDGE_TKDL",
            "category": "Classical / Generic Heritage & Patent / Proprietary Defensive Standard — TKDL Prior Art",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "TKDL_STATUTORY",
            "needs_clarification": False,
            "keywords": ["tkdl", "traditional knowledge", "prior art", "biopiracy", "csir", "section 3(p)"]
        }

    # -------------------------------------------------------------
    # 5. PATENTABILITY — MERE ADMIXTURE (Section 3(e))
    # -------------------------------------------------------------
    if any(w in q_norm for w in ["admixture", "mere admixture", "3(e)", "mixing known", "combine known substances", "aggregation of properties"]):
        return {
            "domain": "Patent Law",
            "intent": "PATENTABILITY_MERE_ADMIXTURE",
            "category": "Patent / Proprietary Assessment — Section 3(e) Mere Admixture Prohibition",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "PATENT_STATUTE",
            "needs_clarification": False,
            "keywords": ["mere admixture", "section 3(e)", "patents act 1970", "aggregation of properties", "synergy"]
        }

    # -------------------------------------------------------------
    # 6. PATENTABILITY — TRADITIONAL KNOWLEDGE (Section 3(p))
    # -------------------------------------------------------------
    if (("patent" in q_norm or "ipr" in q_norm or "காப்புரிமை" in q_norm or "पेटेंट" in q_norm) and any(w in q_norm for w in ["traditional", "classical", "ancient", "recipe", "3(p)", "charaka", "first schedule", "known use", "ayurvedic medicine", "ayurvedic formulation"])) and not ("admixture" in q_norm or "novel combination" in q_norm):
        return {
            "domain": "Patent Law",
            "intent": "PATENTABILITY_TRADITIONAL_KNOWLEDGE",
            "category": "Patent / Proprietary & Classical Assessment — Section 3(p) Traditional Knowledge Exclusion",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "PATENT_STATUTE",
            "needs_clarification": False,
            "keywords": ["section 3(p)", "patents act 1970", "traditional knowledge", "prior art", "classical formulation"]
        }

    # -------------------------------------------------------------
    # 7. PATENTABILITY — NOVEL COMBINATIONS (Ashwagandha + Brahmi, etc.)
    # -------------------------------------------------------------
    if ("patent" in q_norm or "novel" in q_norm or "combination" in q_norm) and len(entities["herbs"]) >= 2:
        return {
            "domain": "Patent Law",
            "intent": "PATENTABILITY_POLYHERBAL_COMBINATION",
            "category": f"Patent / Proprietary Polyherbal Assessment — {' + '.join([h['key'].capitalize() for h in entities['herbs']])}",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "PATENT_STATUTE",
            "needs_clarification": False,
            "keywords": ["section 3(e)", "section 3(p)", "synergy", "polyherbal combination"] + [h["key"] for h in entities["herbs"]]
        }

    # -------------------------------------------------------------
    # 8. BIODIVERSITY & ABS APPROVAL (NBA / BDA Act)
    # -------------------------------------------------------------
    if any(w in q_norm for w in ["biodiversity", "biodiversity approval", "abs", "national biodiversity", "nba", "sbb", "biological diversity act", "form iii", "form 3", "benefit sharing", "state biodiversity board"]):
        return {
            "domain": "Biodiversity & ABS",
            "intent": "BIODIVERSITY_ABS",
            "category": "Patent / Proprietary & Biological Diversity Act, 2002 — Access and Benefit Sharing (ABS)",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "BIODIVERSITY_STATUTE",
            "needs_clarification": False,
            "keywords": ["biological diversity act", "nba", "form iii", "section 6", "section 7", "abs"]
        }

    # -------------------------------------------------------------
    # 9. INTERNATIONAL PATENTING & WIPO TREATIES
    # -------------------------------------------------------------
    if any(w in q_norm for w in ["internationally", "outside india", "foreign patent", "wipo", "gratk", "pct application", "treaty", "export ip", "section 39", "foreign filing"]):
        return {
            "domain": "International IP",
            "intent": "INTERNATIONAL_IP",
            "category": "Patent / Proprietary International IP — Section 39 Patents Act, WIPO GRATK Treaty & PCT Route",
            "jurisdiction": "International",
            "language": language,
            "entities": entities,
            "source_type": "INTERNATIONAL_TREATY",
            "needs_clarification": False,
            "keywords": ["section 39", "foreign filing license", "pct", "wipo gratk treaty 2024", "mandatory origin disclosure"]
        }

    # -------------------------------------------------------------
    # 10. CLASSICAL VS PROPRIETARY AYURVEDIC MEDICINE
    # -------------------------------------------------------------
    if any(w in q_norm for w in ["classical formulation", "classical ayurvedic", "proprietary ayurvedic", "proprietary medicine", "section 3(a)", "section 3(h)", "difference between classical", "generic ayurvedic"]):
        return {
            "domain": "AYUSH Regulatory Classification",
            "intent": "CLASSICAL_VS_PROPRIETARY",
            "category": "Classical / Generic (Sec 3(a)) vs Patent / Proprietary (Sec 3(h)) Ayurvedic Classification",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "REGULATORY_STATUTE",
            "needs_clarification": False,
            "keywords": ["section 3(a)", "section 3(h)", "drugs and cosmetics act 1940", "first schedule", "rule 158b"]
        }

    # -------------------------------------------------------------
    # 11. BRAND PROTECTION & TRADEMARKS
    # -------------------------------------------------------------
    if any(w in q_norm for w in ["brand", "protect my brand", "trademark", "trade mark", "logo", "brand name", "class 5", "class 3", "prefix", "ayurshakti", "section 9", "anti-dissection", "section 17"]):
        return {
            "domain": "Trade Marks",
            "intent": "BRAND_PROTECTION_TRADEMARK",
            "category": "Patent / Proprietary Brand Protection — Trade Marks Act 1999 (Nice Classes 3/5/30)",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "TRADEMARK_STATUTE",
            "needs_clarification": False,
            "keywords": ["trade marks act 1999", "section 9(1)(b)", "section 17", "class 5", "class 3", "brand protection"]
        }

    # -------------------------------------------------------------
    # 12. COMMERCIAL SALE, LICENSING & MANUFACTURING
    # -------------------------------------------------------------
    if any(w in q_norm for w in ["sell", "commercial", "commercially", "manufacturing license", "manufacture", "drug license", "start business", "market ayurvedic", "rule 158b", "form 24-d", "gmp license", "sla"]):
        return {
            "domain": "AYUSH Commercial Licensing",
            "intent": "COMMERCIAL_SALE_LICENSING",
            "category": "Patent / Proprietary & Classical Manufacturing License — Rule 158B / Form 24-D",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "REGULATORY_STATUTE",
            "needs_clarification": False,
            "keywords": ["rule 158b", "form 24-d", "state licensing authority", "schedule t gmp", "commercial sale"]
        }

    # -------------------------------------------------------------
    # 13. COSMETICS (Form 32-A, Section 3(aaa))
    # -------------------------------------------------------------
    if any(w in q_norm for w in ["cosmetic", "hair oil", "shampoo", "face wash", "cream", "skin care", "beauty", "form 32-a", "form 32"]):
        return {
            "domain": "Cosmetics",
            "intent": "COSMETIC_REGULATION",
            "category": "Ayurvedic Cosmetic Regulation — Section 3(aaa) & Form 32-A (D&C Act 1940)",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "REGULATORY_STATUTE",
            "needs_clarification": False,
            "keywords": ["section 3(aaa)", "form 32-a", "cosmetic", "schedule s", "drugs and cosmetics act"]
        }

    # -------------------------------------------------------------
    # 14. AYURVEDA AAHAR & NUTRACEUTICALS (FSSAI 2022)
    # -------------------------------------------------------------
    if any(w in q_norm for w in ["ayurveda aahar", "fssai", "food supplement", "dietary supplement", "herbal tea", "herbal biscuit", "health drink"]):
        return {
            "domain": "Ayurveda Aahar",
            "intent": "NUTRACEUTICAL_AAHAR",
            "category": "Ayurveda Aahar Food Regulations, 2022 (FSSAI / Ministry of Ayush)",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "REGULATORY_STATUTE",
            "needs_clarification": False,
            "keywords": ["ayurveda aahar", "fssai 2022", "food safety and standards act", "not for medicinal use"]
        }

    # -------------------------------------------------------------
    # 15. DEFAULT STATUTORY QUERY
    # -------------------------------------------------------------
    return {
        "domain": "Ayurvedic IP & Regulatory Guidance",
        "intent": "GENERAL_STATUTORY_QUERY",
        "category": "Ayurvedic Intellectual Property & Statutory Regulatory Assessment",
        "jurisdiction": jurisdiction,
        "language": language,
        "entities": entities,
        "source_type": "STATUTORY_CATALOG",
        "needs_clarification": False,
        "keywords": words[:5]
    }
