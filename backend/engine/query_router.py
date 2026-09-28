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

# Detected botanical herbs database with comprehensive multilingual aliases
KNOWN_HERBS = {
    "ashwagandha": {
        "botanical": "Withania somnifera Dunal",
        "family": "Solanaceae",
        "sanskrit": "अश्वगंधा (Ashwagandha)",
        "tamil": "அஸ்வகந்தா (அமுக்கரா)",
        "tamil_clean": "அஸ்வகந்தா",
        "source_pdf": "API-Vol-1.pdf",
        "page": 31,
        "actives": "withanolides (withaferin A, withanolide D), somniferine",
        "classical_use": "Balya (strength promoting), Rasayana (rejuvenator), Medhya, Sandhivata",
        "tkdl_status": "Documented in Charaka Samhita and Sushruta Samhita; classical prior art.",
        "aliases": ["ashwagandha", "withania", "somnifera", "asvagandha", "அஸ்வகந்தா", "அமுக்கரா", "அமுக்கிராகிழங்கு", "अश्वगंधा", "अश्वगन्धा"]
    },
    "brahmi": {
        "botanical": "Bacopa monnieri (L.) Pennell",
        "family": "Plantaginaceae",
        "sanskrit": "ब्राह्मी (Brahmi)",
        "tamil": "பிராமி (Brahmi)",
        "tamil_clean": "பிராமி",
        "source_pdf": "API-Vol-2.1.pdf",
        "page": 92,
        "actives": "bacosides (bacoside A, bacoside B), brahmine",
        "classical_use": "Medhya Rasayana (cognitive enhancer), Smritiprada, Unmada",
        "tkdl_status": "Documented in Charaka Samhita; prior art for memory and nootropic uses.",
        "aliases": ["brahmi", "bacopa", "monnieri", "பிராமி", "வல்லாரை", "ब्राह्मी"]
    },
    "turmeric": {
        "botanical": "Curcuma longa L.",
        "family": "Zingiberaceae",
        "sanskrit": "हरिद्रा (Haridra / Curcumin)",
        "tamil": "மஞ்சள் (Turmeric)",
        "tamil_clean": "மஞ்சள்",
        "source_pdf": "API-Vol-1.pdf",
        "page": 45,
        "actives": "curcuminoids (curcumin, demethoxycurcumin), volatile oils",
        "classical_use": "Varnya, Krimighna, Kushtaghna, Pramehahara",
        "tkdl_status": "Landmark CSIR patent revocation (US Patent 5,401,504) based on classical TKDL prior art.",
        "aliases": ["turmeric", "curcuma", "longa", "haldi", "haridra", "மஞ்சள்", "ஹரித்ரா", "हल्दी", "हरिद्रा"]
    },
    "curcumin": {
        "botanical": "Curcuma longa L. (Curcumin)",
        "family": "Zingiberaceae",
        "sanskrit": "हरिद्रा (Haridra)",
        "tamil": "மஞ்சள் சாறு (Curcumin)",
        "tamil_clean": "மஞ்சள் சாறு (குர்குமின்)",
        "source_pdf": "API-Vol-1.pdf",
        "page": 45,
        "actives": "curcuminoids (95% standard fraction)",
        "classical_use": "Anti-inflammatory, wound healing, antioxidant",
        "tkdl_status": "Documented in TKDL; isolated fractions require Rule 122E CDSCO phytopharmaceutical clearance or Section 3(d) therapeutic efficacy proof.",
        "aliases": ["curcumin", "curcuminoids", "குர்குமின்", "மஞ்சள் சாறு", "करक्यूमिन"]
    },
    "neem": {
        "botanical": "Azadirachta indica A. Juss.",
        "family": "Meliaceae",
        "sanskrit": "निम्ब (Nimba)",
        "tamil": "வேம்பு (Neem)",
        "tamil_clean": "வேம்பு",
        "source_pdf": "API-Vol-2.pdf",
        "page": 115,
        "actives": "azadirachtin, nimbin, nimbidin",
        "classical_use": "Krimighna, Kushtaghna, Kandughna (antimicrobial, skin care)",
        "tkdl_status": "Landmark EPO revocation (EP 436257) based on Indian traditional knowledge.",
        "aliases": ["neem", "azadirachta", "indica", "nimba", "வேம்பு", "வேப்பிலை", "நீம்", "नीम", "निम्ब"]
    },
    "tulsi": {
        "botanical": "Ocimum sanctum L.",
        "family": "Lamiaceae",
        "sanskrit": "तुलसी (Tulsi)",
        "tamil": "துளசி (Tulsi)",
        "tamil_clean": "துளசி",
        "source_pdf": "API-Vol-2.pdf",
        "page": 165,
        "actives": "eugenol, rosmarinic acid, caryophyllene",
        "classical_use": "Svasahara, Kasahara, Hridya (respiratory and adaptogenic)",
        "tkdl_status": "Documented across classical Ayurvedic literature; prior art against biopiracy.",
        "aliases": ["tulsi", "ocimum", "sanctum", "துளசி", "தும்பை", "तुलसी"]
    },
    "triphala": {
        "botanical": "Emblica officinalis + Terminalia chebula + Terminalia bellirica",
        "family": "Polyherbal Classical Combination",
        "sanskrit": "त्रिफला (Triphala)",
        "tamil": "திரிபலா (Triphala)",
        "tamil_clean": "திரிபலா",
        "source_pdf": "API-Vol-1.pdf",
        "page": 25,
        "actives": "gallic acid, ellagic acid, chebulagic acid, vitamin C",
        "classical_use": "Chakshushya, Deepana, Rasayana, Anulomana",
        "tkdl_status": "First Schedule classical formulation; public domain; barred from patenting under Sec 3(p) and generic trademark monopoly under Sec 9(1)(b).",
        "aliases": ["triphala", "திரிபலா", "திரிபலை", "கடுக்காய்", "त्रिफला"]
    },
    "giloy": {
        "botanical": "Tinospora cordifolia (Willd.) Miers",
        "family": "Menispermaceae",
        "sanskrit": "गुडूची / गिलोय (Guduchi / Giloy)",
        "tamil": "சீந்தில் கொடி (Giloy)",
        "tamil_clean": "சீந்தில் கொடி",
        "source_pdf": "API-Vol-1.pdf",
        "page": 41,
        "actives": "tinosporide, cordifolide, berberine",
        "classical_use": "Jvarahara, Rasayana, Dahaprashamana, Tridoshashamana",
        "tkdl_status": "Prominent classical immunomodulator; extensively cataloged in TKDL.",
        "aliases": ["giloy", "guduchi", "tinospora", "cordifolia", "சீந்தில்", "சீந்தில் கொடி", "கிலோய்", "गिलोय", "गुडूची"]
    },
    "amla": {
        "botanical": "Emblica officinalis Gaertn.",
        "family": "Phyllanthaceae",
        "sanskrit": "आमलकी (Amalaki / Amla)",
        "tamil": "நெல்லிக்காய் (Amla)",
        "tamil_clean": "நெல்லிக்காய்",
        "source_pdf": "API-Vol-1.pdf",
        "page": 5,
        "actives": "ascorbic acid (vitamin C), emblicanin A & B, punigluconin",
        "classical_use": "Rasayana, Chakshushya, Vayasthapana, Pittashamana",
        "tkdl_status": "Revered premier Rasayana in Charaka Samhita; prior art for metabolic, hair, and anti-aging remedies.",
        "aliases": ["amla", "amalaki", "emblica", "officinalis", "நெல்லிக்காய்", "நெல்லி", "आंवला", "आमलकी"]
    },
    "shatavari": {
        "botanical": "Asparagus racemosus Willd.",
        "family": "Asparagaceae",
        "sanskrit": "शतावरी (Shatavari)",
        "tamil": "சதாவரி (தண்ணீர்விட்டான் கிழங்கு)",
        "tamil_clean": "சதாவரி",
        "source_pdf": "API-Vol-1.pdf",
        "page": 105,
        "actives": "shatavarins (I-IV), sarsasapogenin, asparagamine A",
        "classical_use": "Stanyajanana, Rasayana, Pittahara, Shukrala (female reproductive and hormonal health)",
        "tkdl_status": "Documented in Charaka and Sushruta Samhita; traditional rasayana prior art in TKDL.",
        "aliases": ["shatavari", "asparagus", "racemosus", "சதாவரி", "தண்ணீர்விட்டான்", "शतावरी"]
    },
    "chyawanprash": {
        "botanical": "Polyherbal Classical Formulation (Emblica officinalis base with 40+ herbs)",
        "family": "Classical Rasayana Formulation",
        "sanskrit": "च्यवनप्राश (Chyawanprash)",
        "tamil": "சியவனபிராசம் (Chyawanprash)",
        "tamil_clean": "சியவனபிராசம்",
        "source_pdf": "API-Vol-1.pdf",
        "page": 12,
        "actives": "polyphenols, flavonoids, vitamin C, piperine",
        "classical_use": "Kaphapittahara, Rasayana, Kasasvasahara, Ojas promoter",
        "tkdl_status": "Described in Charaka Samhita Chikitsasthana Chapter 1; classical formulation in public domain.",
        "aliases": ["chyawanprash", "chavanprash", "சியவனபிராசம்", "சயவன்பிராஷ்", "च्यवनप्राश"]
    },
    "trikatu": {
        "botanical": "Zingiber officinale + Piper nigrum + Piper longum",
        "family": "Classical Trikatu Formulation",
        "sanskrit": "त्रिकटु (Trikatu)",
        "tamil": "திரிகடுகம் (சுக்கு, மிளகு, திப்பிலி)",
        "tamil_clean": "திரிகடுகம்",
        "source_pdf": "API-Vol-1.pdf",
        "page": 110,
        "actives": "gingerols, piperine, chavicine",
        "classical_use": "Deepana, Pachana, Sleshmahara, Galashundikahara",
        "tkdl_status": "Classical bioavailability enhancer and digestive stimulant documented in Charaka Samhita.",
        "aliases": ["trikatu", "திரிகடுகம்", "திரிகடுகு", "त्रिकटु"]
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
    """Extract recognized herbs, statutes, institutions, and sections from query in EN, TA, and HI."""
    herbs_found = []
    seen = set()
    for herb_key, data in KNOWN_HERBS.items():
        aliases = data.get("aliases", [herb_key, data["botanical"].lower()])
        if any(a.lower() in query_norm for a in aliases):
            if herb_key not in seen:
                herbs_found.append({"key": herb_key, **data})
                seen.add(herb_key)

    sections_found = []
    sec_terms = [
        "3(p)", "3(e)", "3(d)", "3(a)", "3(h)", "3(aaa)", "10(4)", "158b", "161", "170", "33eea",
        "rule 122e", "section 6", "section 7", "section 3", "section 39", "form iii", "form 24-d", "form 32-a",
        "பிரிவு 3(p)", "பிரிவு 3(e)", "பிரிவு 3(d)", "பிரிவு 6", "பிரிவு 39", "விதி 158b", "படிவம் iii", "படிவம் 24-d",
        "धारा 3(p)", "धारा 3(e)", "धारा 3(d)", "धारा 6", "धारा 39", "नियम 158b", "फॉर्म iii", "फॉर्म 24-d"
    ]
    for sec in sec_terms:
        if sec in query_norm:
            sections_found.append(sec)

    return {
        "herbs": herbs_found,
        "sections": sections_found
    }


def classify_query_intent(query: str, selected_jurisdiction: str = "India") -> Dict[str, Any]:
    """
    Deterministically routes user query to its statutory domain, intent, and target evidence.
    Supports English, Hindi, and Tamil input.
    """
    q_norm = normalize_query(query)
    entities = extract_entities(q_norm)
    words = [w for w in re.split(r"\W+", q_norm) if w]

    # Detect language if Tamil or Hindi script is present
    language = "en"
    if any('\u0b80' <= c <= '\u0bff' for c in query):
        language = "ta"
    elif any('\u0900' <= c <= '\u097f' for c in query):
        language = "hi"

    # Detect jurisdiction preference from query or toggle
    jurisdiction = "International" if ("international" in q_norm or "abroad" in q_norm or "foreign" in q_norm or "wipo" in q_norm or "pct" in q_norm or selected_jurisdiction.lower() == "international") else "India"

    # -------------------------------------------------------------
    # 0. OUT-OF-SCOPE / NON-AYURVEDIC INQUIRIES
    # -------------------------------------------------------------
    # Plant breeding / agricultural hybridization / non-Ayurvedic non-IP topics
    # Detect plant breeding in EN, HI, or TA
    is_plant_breeding = (
        (bool(re.search(r"\b(breed|breeding|crossbreed|cross-breed|hybridize|hybridization|graft|grafting)\b", q_norm)) and any(
            w in q_norm for w in ["brinjal", "tomato", "potato", "plant", "plants", "crop", "crops", "eggplant", "vegetable", "species", "fruit", "wheat", "rice", "maize", "seed", "seeds", "grain"]
        )) or
        any(w in q_norm for w in ["संकरण", "पादप प्रजनन", "क्रॉस-ब्रीड", "बैंगन और टमाटर", "टमाटर और बैंगन", "गेहूं"]) or
        any(w in q_norm for w in ["கலப்பினம்", "இனப்பெருக்கம்", "கத்தரிக்காய்", "தக்காளி", "கோதுமை"])
    )
    is_general_out_of_scope = (
        not entities["herbs"] and not entities["sections"] and
        not any(w in q_norm for w in ["ayurveda", "ayurvedic", "asu", "siddha", "unani", "ayush", "patent", "tkdl", "trademark", "fssai", "nba", "sbb", "cosmetic", "medicine", "herb", "drug", "herbal", "formulation", "phytopharmaceutical", "extract"]) and
        any(w in q_norm for w in ["crypto", "bitcoin", "weather", "cricket", "football", "stock market", "stock price", "stock", "share price", "tesla", "apple stock", "coding", "python", "javascript", "car", "engine", "movie", "song", "recipe", "cooking", "election", "politics", "game", "gaming", "salary", "real estate", "mortgage", "flight", "hotel", "vacation", "instagram", "tiktok", "youtube", "facebook", "twitter", "elon musk", "jeff bezos", "netflix", "spotify"])
    )

    if is_plant_breeding or is_general_out_of_scope:
        return {
            "domain": "Out-of-Scope / Non-Ayurvedic",
            "intent": "OUT_OF_SCOPE",
            "category": "Out-of-Scope Inquiry — Non-Ayurvedic / Plant Breeding Topic",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "GENERAL_GUIDANCE",
            "needs_clarification": False,
            "keywords": ["out of scope", "plant breeding", "ayurveda scope"]
        }

    # -------------------------------------------------------------
    # 1. AMBIGUOUS / VAGUE QUERIES (Needs Clarification)
    # -------------------------------------------------------------
    # 1A. "Can I use ayurvedha?" / "Can I use ayurveda?"
    if re.match(r"^can\s+i\s+use\s+(ayurveda|ayurvedha|ayurweda|ayush)(\s+medicine|\s+herbs)?\??$", q_norm) or \
       (len(words) <= 4 and "use" in words and any(w in q_norm for w in ["ayurveda", "ayurvedha", "ayurweda"]) and not entities["herbs"] and not entities["sections"] and not any(w in words for w in ["patent", "sell", "trademark", "breed"])):
        return {
            "domain": "Clarification",
            "intent": "VAGUE_USE_AYURVEDA",
            "category": "Ayurvedic General Use & Multi-Pathway Clarification",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "GENERAL_CATALOG",
            "needs_clarification": True,
            "keywords": ["ayurveda", "licensing", "patent", "formulation", "commercialization"]
        }

    # 1B. "Can I patent this?" / "Can this be patented?" (when no specific herb/entity is supplied)
    if (re.match(r"^can\s+i\s+patent\s+(this|it)\??$", q_norm) or re.match(r"^(is\s+this|can\s+this\s+be)\s+patentable\??$", q_norm) or q_norm in ["can i patent this", "can i patent this?", "patent this", "can i patent it", "is this patentable", "is this patentable?"]) and not entities["herbs"] and not entities["sections"]:
        return {
            "domain": "Clarification",
            "intent": "VAGUE_PATENT_THIS",
            "category": "Patentability Assessment — Target Invention Specification Required",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "PATENT_STATUTE",
            "needs_clarification": True,
            "keywords": ["patentability", "invention", "ayurveda", "section 3(p)", "section 3(e)"]
        }

    # 1C. Other brief vague questions
    vague_patterns = [
        r"^is\s+(ayurveda|ayurvedic)\s+(allowed|legal|valid)\??$",
        r"^can\s+i\s+(sell|register|make)\s+this\??$",
        r"^is\s+this\s+(legal|allowed)\??$",
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
            "category": f"Classical / Generic Botanical Monograph — {entities['herbs'][0]['botanical']}",
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
    if any(p in q_norm for p in ["what is ayurveda", "what are ayurvedic formulations", "what is an ayurvedic formulation", "principles of ayurveda", "concept of ayurveda", "how ayurveda works", "definition of ayurveda", "ஆயுர்வேதம் என்றால் என்ன", "ஆயுர்வேதம் எப்படி செயல்படுகிறது", "आयुर्वेद क्या है"]):
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
    # 3B. DOSHA THEORY & HARMONIZATION (Vata, Pitta, Kapha)
    # -------------------------------------------------------------
    dosha_terms = [
        "dosha", "doshas", "vata", "pitta", "kapha", "tridosha", "prakriti", "vikriti",
        "balance pitta", "balance vata", "balance kapha", "reduce pitta", "reduce vata", "reduce kapha",
        "pitta dosha", "vata dosha", "kapha dosha", "tridoshic",
        "வாதம்", "பித்தம்", "கபம்", "திரிதோஷம்", "தோஷங்கள்", "தோஷம்", "பித்தத்தை", "வாதத்தை", "கபத்தை",
        "वात", "पित्त", "कफ", "त्रिदोष", "दोष", "प्रकृति"
    ]
    if any(w in q_norm for w in dosha_terms):
        return {
            "domain": "Ayurveda Foundations & Dosha Harmony",
            "intent": "DOSHA_THEORY_PRACTICE",
            "category": "Classical Ayurvedic Tridosha Theory & Dosha Harmonization (Vata, Pitta, Kapha)",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "CLASSICAL_COMPENDIUM",
            "needs_clarification": False,
            "keywords": ["tridosha", "vata", "pitta", "kapha", "charaka samhita", "prakriti", "ritucharya"]
        }

    # -------------------------------------------------------------
    # 3C. CLASSICAL FORMULATIONS & HEALTH BENEFITS (Triphala, Chyawanprash, etc.)
    # -------------------------------------------------------------
    classical_form_terms = [
        "triphala", "chyawanprash", "trikatu", "dashamula", "sitopaladi", "brahmi ghrita",
        "ashwagandharishta", "churnam", "arishta", "asava", "kwatha", "taila", "rasayana", "rasayanas",
        "திரிபலா", "சியவனபிராசம்", "திரிகடுகம்", "சூரணம்", "தைலம்", "திரிபலை", "கசாயம்",
        "त्रिफला", "च्यवनप्राश", "त्रिकटु", "दशमूल", "चूर्ण", "अरिष्ट", "आसव", "रसायन"
    ]
    if any(w in q_norm for w in classical_form_terms) and not any(w in q_norm for w in ["patent", "trademark", "infring"]):
        return {
            "domain": "Classical Formulations & Health Benefits",
            "intent": "CLASSICAL_FORMULATION_HEALTH",
            "category": "First Schedule Classical Ayurvedic Formulation & Therapeutic Indications",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "CLASSICAL_COMPENDIUM",
            "needs_clarification": False,
            "keywords": ["classical formulation", "rasayana", "therapeutic use", "charaka samhita", "first schedule"]
        }

    # -------------------------------------------------------------
    # 3D. AYURVEDIC THERAPEUTICS & CLINICAL PROTOCOLS
    # -------------------------------------------------------------
    clinical_terms = [
        "treatment", "treat", "cure", "therapy", "remedy", "panchakarma", "vamana", "virechana",
        "basti", "nasya", "raktamokshana", "digestion", "digestive", "agni", "ama", "insomnia", "sleep",
        "arthritis", "joint pain", "sandhivata", "diabetes", "madhumeha", "immunity", "ojas",
        "cough", "cold", "headache", "weight loss", "swastha", "dinacharya", "ritucharya",
        "சிகிச்சை", "பஞ்சகர்மா", "மருத்துவம்", "செரிமானம்", "மூட்டு வலி", "தூக்கமின்மை", "நோய்", "குணப்படுத்த",
        "चिकित्सा", "पंचकर्म", "पाचन", "अग्नि", "आम", "अनिद्रा", "संधिवात", "मधुमेह", "रोग उपचार", "दिनचर्या"
    ]
    if any(w in q_norm for w in clinical_terms) and not any(w in q_norm for w in ["patent", "trademark", "infring"]):
        return {
            "domain": "Ayurvedic Clinical Therapeutics",
            "intent": "AYURVEDIC_THERAPEUTICS_CLINICAL",
            "category": "Ayurvedic Clinical Therapeutics & Holistic Disease Management",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "CLASSICAL_COMPENDIUM",
            "needs_clarification": False,
            "keywords": ["therapeutics", "panchakarma", "shamana", "shodhana", "charaka", "sushruta"]
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
    if any(w in q_norm for w in ["admixture", "mere admixture", "3(e)", "mixing known", "combine known substances", "aggregation of properties", "வெறும் கலவை", "கலவை", "பிரிவு 3(e)", "சேர்க்கை", "मात्र मिश्रण", "साधारण मिश्रण", "धारा 3(e)"]):
        return {
            "domain": "Patent Law",
            "intent": "PATENTABILITY_MERE_ADMIXTURE",
            "category": "Patent / Proprietary — Section 3(e) Mere Admixture Prohibition",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "PATENT_STATUTE",
            "needs_clarification": False,
            "keywords": ["mere admixture", "section 3(e)", "patents act 1970", "aggregation of properties", "synergy"]
        }

    # -------------------------------------------------------------
    # 6. PATENTABILITY — NOVEL COMBINATIONS (Ashwagandha + Curcumin, etc.)
    # -------------------------------------------------------------
    poly_terms = [
        "patent", "novel", "combination", "formulation", "modified",
        "காப்புரிமை", "கலவை", "சேர்த்து", "மருந்து", "தயாரிக்கும்", "தயாரிப்பு",
        "पेटेंट", "संयोजन", "मिश्रण", "दवा", "फार्मूलेशन"
    ]
    if any(w in q_norm for w in poly_terms) and len(entities["herbs"]) >= 2:
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
    # 7. PATENTABILITY — TRADITIONAL KNOWLEDGE (Section 3(p))
    # -------------------------------------------------------------
    patent_terms = ["patent", "ipr", "காப்புரிமை", "காப்புரிமைச்", "पेटेंट"]
    tk_terms = [
        "traditional", "classical", "ancient", "recipe", "3(p)", "charaka", "first schedule", "known use", "ayurvedic medicine", "ayurvedic formulation",
        "பாரம்பரிய", "பழமையான", "சாஸ்திர", "பிரிவு 3(p)", "சரகர்", "மருந்து",
        "पारंपरिक", "शास्त्रीय", "धारा 3(p)", "चरक"
    ]
    is_tk_patent = (any(p in q_norm for p in patent_terms) and any(t in q_norm for t in tk_terms)) or (len(entities["herbs"]) == 1 and any(p in q_norm for p in patent_terms))
    if is_tk_patent and not ("admixture" in q_norm or "வெறும் கலவை" in q_norm or len(entities["herbs"]) >= 2):
        return {
            "domain": "Patent Law",
            "intent": "PATENTABILITY_TRADITIONAL_KNOWLEDGE",
            "category": "Patent / Proprietary & Classical / Generic — Section 3(p) Traditional Knowledge Exclusion",
            "jurisdiction": jurisdiction,
            "language": language,
            "entities": entities,
            "source_type": "PATENT_STATUTE",
            "needs_clarification": False,
            "keywords": ["section 3(p)", "patents act 1970", "traditional knowledge", "prior art", "classical formulation"]
        }

    # -------------------------------------------------------------
    # 8. BIODIVERSITY & ABS APPROVAL (NBA / BDA Act)
    # -------------------------------------------------------------
    if any(w in q_norm for w in ["biodiversity", "biodiversity approval", "abs", "national biodiversity", "nba", "sbb", "biological diversity act", "form iii", "form 3", "benefit sharing", "state biodiversity board", "பல்லுயிர்", "பன்முகத்தன்மை", "தேசிய பல்லுயிர்", "படிவம் iii", "படிவம் 3", "जैव विविधता", "एनबीए", "फॉर्म iii", "फॉर्म 3"]):
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

    if any(w in q_norm for w in ["internationally", "international", "abroad", "outside india", "foreign patent", "foreign filing", "foreign", "overseas", "wipo", "gratk", "pct application", "pct", "treaty", "export ip", "section 39", "paris convention"]):
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
    if any(w in q_norm for w in ["brand", "protect my brand", "trademark", "trade mark", "logo", "brand name", "class 5", "class 3", "prefix", "ayurshakti", "section 9", "anti-dissection", "section 17", "வர்த்தக முத்திரை", "ட்ரேட்மார்க்", "ट्रेडमार्क"]):
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
    if any(w in q_norm for w in ["sell", "commercial", "commercially", "manufacturing license", "manufacture", "drug license", "start business", "market ayurvedic", "rule 158b", "form 24-d", "gmp license", "sla", "விற்பனை", "வணிக", "உரிமம்", "உற்பத்தி", "படிவம் 24-d", "விதி 158b", "தயாரித்து விற்க", "பயன்படுத்தலாமா", "बिक्री", "व्यावसायिक", "निर्माण", "लाइसेंस", "फॉर्म 24-d", "नियम 158b"]):
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
