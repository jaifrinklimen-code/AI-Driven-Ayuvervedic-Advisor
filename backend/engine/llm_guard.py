"""
LLM Guard, Citation Validator, and Confidence Engine for IP-SAKTI Sahayak
Enforces strict grounding, prompt injection defenses, citation verification,
safe abstention, and multilingual question-type-aware response routing.
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
    # Patent / IP
    if any(w in q for w in ["patent", "ip protect", "intellectual property", "section 3(p)", "section 3(e)",
                             "3(p)", "3(e)", "novelty", "inventive step", "claim", "patentab",
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


# Rich localized statutory knowledge base keyed by question type
STATUTORY_KB = {
    "tkdl": {
        "en": (
            "The Traditional Knowledge Digital Library (TKDL) is India's pioneering defensive publication database "
            "containing over 360,000 documented classical Ayurvedic, Siddha, Unani, and Yoga formulations "
            "from ancient Sanskrit, Urdu, Tamil and Arabic texts. Established by CSIR & Ministry of Ayush, TKDL "
            "is shared with 13 major patent offices worldwide (USPTO, EPO, JPO) as prior art evidence to block biopiracy. "
            "When a foreign entity tries to patent a known Ayurvedic remedy — e.g., turmeric wound healing, neem "
            "antibacterial, Ashwagandha adaptogen — patent examiners consult TKDL to reject the application as non-novel. "
            "TKDL has successfully defended 200+ biopiracy attempts. Under the WIPO Treaty on IP and Genetic Resources "
            "(2024), mandatory disclosure of traditional knowledge country of origin is now required globally. "
            "To file a legitimate novel invention, prove: (1) Technical novelty beyond TKDL prior art, (2) Unexpected "
            "synergistic therapeutic effect (Combination Index < 1.0), and (3) NBA Form III approval under "
            "Section 6 of the Biological Diversity Act, 2002."
        ),
        "hi": (
            "पारंपरिक ज्ञान डिजिटल पुस्तकालय (TKDL) भारत का अग्रणी रक्षात्मक डेटाबेस है जिसमें 3,60,000 से अधिक "
            "आयुर्वेद, सिद्ध, यूनानी और योग फॉर्मूलेशन दर्ज हैं। CSIR और आयुष मंत्रालय द्वारा स्थापित यह "
            "USPTO, EPO, JPO सहित 13 पेटेंट कार्यालयों को पूर्व कला साक्ष्य के रूप में साझा किया जाता है। "
            "जब कोई विदेशी संस्था हल्दी के घाव-भरने, नीम के जीवाणुरोधी या अश्वगंधा जैसे ज्ञात उपाय पर पेटेंट "
            "करने की कोशिश करती है, तो TKDL से पूर्व कला स्थापित करके आवेदन खारिज किया जाता है। TKDL ने "
            "200+ बायोपाइरेसी प्रयास रोके हैं। WIPO संधि 2024 अब पेटेंट आवेदनों में पारंपरिक ज्ञान के मूल देश "
            "का अनिवार्य खुलासा मांगती है। वैध पेटेंट के लिए: (1) TKDL से परे तकनीकी नवीनता, (2) अप्रत्याशित "
            "सिनर्जी प्रभाव (Combination Index < 1.0), (3) जैव विविधता अधिनियम 2002 धारा 6 के तहत NBA Form III।"
        ),
        "ta": (
            "பாரம்பரிய அறிவு டிஜிட்டல் நூலகம் (TKDL) என்பது இந்தியாவின் முன்னோடி தடுப்பு வெளியீட்டு தரவுத்தளம். "
            "சமஸ்கிருதம், உருது, தமிழ், அரபி நூல்களில் இருந்து 3,60,000-க்கும் மேற்பட்ட ஆயுர்வேத, சித்த, யுனானி, "
            "யோக சூத்திரங்கள் ஆவணப்படுத்தப்பட்டுள்ளன. CSIR மற்றும் ஆயுஷ் அமைச்சகம் இணைந்து நிறுவிய TKDL, "
            "USPTO, EPO, JPO உட்பட 13 காப்புரிமை அலுவலகங்களுக்கு முன் கலை சான்றாக பகிரப்படுகிறது. "
            "மஞ்சள் காயம் ஆற்றும் தன்மை, வேம்பின் நுண்கிருமி எதிர்ப்பு போன்றவற்றுக்கு காப்புரிமை கோரும்போது "
            "TKDL மூலம் முன் கலை நிறுவி மறுக்கப்படுகிறது. TKDL 200-க்கும் மேற்பட்ட உயிரியல் திருட்டு "
            "முயற்சிகளை தடுத்துள்ளது. WIPO 2024 ஒப்பந்தம் அனைத்து காப்புரிமை விண்ணப்பங்களிலும் "
            "பாரம்பரிய அறிவின் தோற்று நாட்டை கட்டாயமாக வெளிப்படுத்த கோருகிறது. செல்லுபடியாகும் "
            "காப்புரிமைக்கு: (1) TKDL-ல் இல்லாத தொழில்நுட்ப புதுமை, (2) நிரூபிக்கப்பட்ட ஒருங்கிணைந்த விளைவு, "
            "(3) NBA படிவம் III அனுமதி கட்டாயமாகும்."
        ),
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
        "en": (
            "Access and Benefit Sharing (ABS) is mandated under the Biological Diversity Act, 2002 (amended 2023) "
            "and the Nagoya Protocol. Indian entities accessing biological resources for commercial use must notify "
            "the State Biodiversity Board (SBB) under Section 7. Foreign entities, NRIs, and corporate bodies must "
            "obtain prior approval from the National Biodiversity Authority (NBA) under Section 3. Before filing "
            "any patent involving Indian biological resources, NBA Form III under Section 6(1) is mandatory — "
            "its absence bars patent grant by the Indian Patent Office. "
            "ABS compliance requires: (1) NBA Form III for patent-related biodiversity access, (2) SBB Form I/II "
            "for commercial manufacturing, (3) benefit sharing with local communities (typically 1-5% net profits), "
            "(4) Nagoya Protocol access agreement if resources are exported. "
            "The 2023 BD Amendment streamlined AYUSH practitioner compliance and set penalties up to ₹50 lakhs."
        ),
        "hi": (
            "जैव विविधता अधिनियम, 2002 (संशोधित 2023) और नागोया प्रोटोकॉल के तहत ABS अनिवार्य है। "
            "भारतीय संस्थाओं को व्यावसायिक उपयोग के लिए धारा 7 के तहत राज्य जैव विविधता बोर्ड (SBB) को "
            "पूर्व सूचना देनी होगी। विदेशी संस्थाओं को धारा 3 के तहत NBA की पूर्व अनुमति चाहिए। "
            "किसी भी पेटेंट से पहले धारा 6(1) के तहत NBA Form III अनिवार्य है। "
            "ABS अनुपालन: (1) NBA Form III, (2) SBB Form I/II, "
            "(3) स्थानीय समुदायों को शुद्ध लाभ का 1-5% लाभ-साझाकरण, "
            "(4) संसाधन निर्यात पर नागोया प्रोटोकॉल समझौता। "
            "2023 संशोधन ने AYUSH चिकित्सकों के लिए प्रक्रिया सरल की और ₹50 लाख तक जुर्माना निर्धारित किया।"
        ),
        "ta": (
            "உயிரியல் பன்முகத்தன்மை சட்டம் 2002 (திருத்தம் 2023) மற்றும் நாகோயா நெறிமுறை படி ABS கட்டாயமாகும். "
            "இந்திய நிறுவனங்கள் வணிக பயன்பாட்டிற்கு உயிரியல் வளங்களை பயன்படுத்த பிரிவு 7-ன் கீழ் "
            "மாநில பல்லுயிர் வாரியத்திற்கு (SBB) முன் அறிவிப்பு அளிக்க வேண்டும். வெளிநாட்டு நிறுவனங்களுக்கு "
            "பிரிவு 3-ன் கீழ் NBA முன் அனுமதி தேவை. எந்த காப்புரிமைக்கும் முன் பிரிவு 6(1)-ன் கீழ் "
            "NBA படிவம் III கட்டாயமாகும். ABS இணக்கம்: (1) NBA படிவம் III, (2) SBB படிவம் I/II, "
            "(3) உள்ளூர் சமூகங்களுடன் நிகர லாபத்தில் 1-5% பகிர்வு, "
            "(4) வளங்கள் ஏற்றுமதி செய்யும்போது நாகோயா நெறிமுறை ஒப்பந்தம். "
            "2023 திருத்தம் AYUSH பயிற்சியாளர்களுக்கு செயல்முறையை எளிமைப்படுத்தியது மற்றும் ₹50 லட்சம் வரை அபராதம்."
        ),
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
        "en": (
            "Export of Ayurvedic raw materials and formulations from India is regulated under: "
            "(1) DGFT Export Policy — most botanical herbs are under the 'Free' export category, but Schedule VI "
            "items require CITES permits; (2) CITES — endangered plants (Appendix II/III: Agarwood, Sandalwood, "
            "certain Orchids) require CITES documentation; (3) Biological Diversity Act, 2002 — export of "
            "biological resources by foreign entities requires NBA approval under Section 3; NBA Form III is "
            "mandatory for patent-linked exports under Section 6; (4) AYUSH GMP License — finished Ayurvedic "
            "products require a GMP-certified manufacturing facility and valid state drug license before export; "
            "(5) FSSAI clearance for Ayurveda Aahar supplements targeting foreign food-grade markets. "
            "Material Transfer Agreements (MTA) under BD Act Sections 19-21 must be executed when sharing "
            "biological samples with foreign research institutions."
        ),
        "hi": (
            "भारत से आयुर्वेदिक कच्चे माल का निर्यात कई ढांचों से नियंत्रित होता है: "
            "(1) DGFT निर्यात नीति — अधिकांश जड़ी-बूटियां 'मुक्त' श्रेणी में हैं लेकिन अनुसूची VI को CITES परमिट चाहिए; "
            "(2) CITES — संकटग्रस्त पौधों (अगरवुड, चंदन) को CITES दस्तावेज; "
            "(3) जैव विविधता अधिनियम 2002 — विदेशी संस्थाओं द्वारा निर्यात के लिए धारा 3 के तहत NBA अनुमोदन; "
            "पेटेंट-जुड़े निर्यात के लिए धारा 6 के तहत NBA Form III; "
            "(4) GMP-प्रमाणित सुविधा और राज्य ड्रग लाइसेंस; (5) विदेशी खाद्य बाजारों के लिए FSSAI मंजूरी। "
            "विदेशी संस्थाओं के साथ जैविक नमूने साझा करने पर BD अधिनियम धाराओं 19-21 के तहत MTA निष्पादित करें।"
        ),
        "ta": (
            "இந்தியாவில் இருந்து ஆயுர்வேத மூலப்பொருட்கள் ஏற்றுமதி பல கட்டமைப்புகளால் கட்டுப்படுத்தப்படுகிறது: "
            "(1) DGFT ஏற்றுமதி கொள்கை — பெரும்பாலான மூலிகைகள் 'இலவச' வகையில்; அட்டவணை VI பொருட்களுக்கு CITES அனுமதி; "
            "(2) CITES — அழிவின் விளிம்பிலுள்ள தாவரங்களுக்கு (அகர், சந்தனம்) CITES ஆவணங்கள்; "
            "(3) உயிரியல் பன்முகத்தன்மை சட்டம் 2002 — வெளிநாட்டு நிறுவனங்களால் ஏற்றுமதிக்கு பிரிவு 3 NBA அனுமதி; "
            "காப்புரிமை தொடர்பான ஏற்றுமதிக்கு பிரிவு 6 NBA படிவம் III; "
            "(4) GMP சான்றளிக்கப்பட்ட வசதி மற்றும் மாநில மருந்து உரிமம்; (5) வெளிநாட்டு சந்தைகளுக்கு FSSAI ஒப்புதல். "
            "வெளிநாட்டு ஆராய்ச்சி நிறுவனங்களுடன் உயிரியல் மாதிரிகள் பகிர்வதற்கு BD சட்டம் பிரிவுகள் 19-21 MTA தேவை."
        ),
        "category": "Export Compliance — DGFT / CITES / NBA Regulated",
        "ip_regimes": [
            "Biological Diversity Act, 2002 (Sections 3, 19-21)",
            "CITES — Convention on International Trade in Endangered Species",
            "DGFT Foreign Trade Policy (Botanical Herbs Export Schedule)",
            "Drugs & Cosmetics Act, 1940 — GMP Requirements for Export"
        ],
        "reg_pathway": "Obtain GMP certificate and state drug license; check DGFT ITCHS code; file NBA Form III for patent-related exports; get CITES permit if product contains Schedule VI plants."
    },
    "patent": {
        "en": (
            "Under Indian Patent Law, pure Ayurvedic herbal formulations face stringent statutory exclusions under "
            "Section 3(p) (Traditional Knowledge) and Section 3(e) (Mere Admixture) of the Patents Act, 1970. "
            "Simply combining known herbs — Ashwagandha, Brahmi, Neem, or Turmeric — cannot be patented because "
            "they are extensively documented in TKDL as prior art. "
            "To obtain a valid patent: (1) Technical Novelty — a new process, delivery system, or standardized "
            "extract not disclosed in TKDL or published literature; (2) Inventive Step — unexpected synergistic "
            "therapeutic effect (Combination Index < 1.0) scientifically proven; (3) Section 3(d) bars mere new "
            "use of a known compound without enhanced efficacy. Additionally, under Section 6(1) of the Biological "
            "Diversity Act, 2002, NBA Form III approval is mandatory BEFORE the Indian Patent Office grants any "
            "patent involving Indian biological resources. TKDL is actively consulted by 13 international patent "
            "offices to prevent biopiracy."
        ),
        "hi": (
            "भारतीय पेटेंट कानून के तहत, शुद्ध आयुर्वेदिक हर्बल फॉर्मूलेशन को पेटेंट अधिनियम, 1970 की "
            "धारा 3(p) (पारंपरिक ज्ञान) और धारा 3(e) (मात्र मिश्रण) के तहत सख्त प्रतिबंधों का सामना करना पड़ता है। "
            "केवल अश्वगंधा, ब्राह्मी, नीम, हल्दी मिलाकर पेटेंट नहीं मिल सकता — ये सभी TKDL में पूर्व कला हैं। "
            "वैध पेटेंट के लिए: (1) TKDL से परे तकनीकी नवीनता — नई प्रक्रिया, वितरण प्रणाली, मानकीकृत अर्क; "
            "(2) अप्रत्याशित सिनर्जिस्टिक प्रभाव (Combination Index < 1.0) वैज्ञानिक रूप से सिद्ध; "
            "(3) धारा 3(d) — ज्ञात यौगिक के नए उपयोग पर बाधा। जैव विविधता अधिनियम 2002 धारा 6(1) के तहत "
            "पेटेंट से पहले NBA Form III अनिवार्य है।"
        ),
        "ta": (
            "இந்திய காப்புரிமை சட்டத்தின் கீழ், தூய ஆயுர்வேத மூலிகை கலவைகளுக்கு காப்புரிமை சட்டம் 1970 "
            "பிரிவு 3(p) (பாரம்பரிய அறிவு) மற்றும் பிரிவு 3(e) (வெறும் கலவை) கடுமையான சட்டப்பூர்வ விலக்குகள் உள்ளன. "
            "அஸ்வகந்தா, பிராமி, வேம்பு, மஞ்சள் போன்றவற்றை வெறுமனே கலப்பதால் காப்புரிமை பெற முடியாது — "
            "அவை TKDL-ல் முன் கலையாக பதிவாகியுள்ளன. செல்லுபடியாகும் காப்புரிமைக்கு: "
            "(1) TKDL-ல் இல்லாத தொழில்நுட்ப புதுமை; (2) நிரூபிக்கப்பட்ட ஒருங்கிணைந்த சிகிச்சை விளைவு "
            "(Combination Index < 1.0); (3) பிரிவு 3(d) — அறியப்பட்ட சேர்மத்தின் புதிய பயன்பாட்டிற்கு மட்டும் "
            "காப்புரிமை இல்லை. உயிரியல் பன்முகத்தன்மை சட்டம் 2002 பிரிவு 6(1)-ன் கீழ் "
            "காப்புரிமை வழங்கலுக்கு முன் NBA படிவம் III கட்டாயமாகும்."
        ),
        "category": "Patent Assessment — Patents Act 1970 Sections 3(p), 3(e), 3(d)",
        "ip_regimes": [
            "Patents Act, 1970 — Sections 3(p), 3(e), 3(d), 10(4)(d)(ii)",
            "Biological Diversity Act, 2002 — Section 6(1) NBA Form III",
            "WIPO Treaty on IP, Genetic Resources & TK (2024)",
            "Traditional Knowledge Digital Library (TKDL) — Prior Art"
        ],
        "reg_pathway": "Conduct InPASS & TKDL prior art search; file NBA Form III; document Combination Index < 1.0 for synergy claim; include Section 10(4)(d)(ii) disclosure in patent application."
    },
    "cosmetic": {
        "en": (
            "Ayurvedic cosmetic products (hair oils, shampoos, face washes, creams, soaps) are regulated under "
            "Drugs & Cosmetics Act, 1940 — Section 3(aaa). Manufacturing license requires Form 32-A filed with "
            "the State Licensing Authority. Key restrictions: (1) No disease cure claims — the label must NOT "
            "claim to treat, cure, or prevent any specific disease; (2) Classical formulations must cite "
            "Ayurvedic texts on label; (3) GMP compliance per Schedule T is mandatory; (4) For export — "
            "additional compliance with EU Cosmetic Regulation 1223/2009 or FDA 21 CFR Part 700. "
            "If a therapeutic disease-cure claim is added, the product becomes an Ayurvedic Drug under "
            "Section 3(b) and requires full Rule 158B drug licensing."
        ),
        "hi": (
            "आयुर्वेदिक सौंदर्य उत्पाद ड्रग्स और कॉस्मेटिक्स अधिनियम, 1940 — धारा 3(aaa) के तहत नियंत्रित हैं। "
            "राज्य लाइसेंसिंग प्राधिकरण को Form 32-A दाखिल करें। मुख्य प्रतिबंध: "
            "(1) कोई रोग उपचार दावा नहीं; (2) क्लासिकल फॉर्मूलेशन पर ग्रंथ उद्धरण; "
            "(3) Schedule T GMP अनुपालन; (4) निर्यात के लिए EU/FDA सौंदर्य नियम। "
            "चिकित्सीय दावे जोड़ने पर उत्पाद धारा 3(b) दवा बन जाता है — Rule 158B लाइसेंस आवश्यक।"
        ),
        "ta": (
            "ஆயுர்வேத அழகுசாதன தயாரிப்புகள் மருந்துகள் மற்றும் அழகுசாதனப் பொருட்கள் சட்டம் 1940 — "
            "பிரிவு 3(aaa)-ன் கீழ் கட்டுப்படுத்தப்படுகின்றன. மாநில உரிம அதிகாரியிடம் படிவம் 32-A தாக்கல். "
            "முக்கிய கட்டுப்பாடுகள்: (1) நோய் குணமாக்கும் கூற்றுகள் இல்லாமல்; "
            "(2) பாரம்பரிய சூத்திரங்களில் ஆயுர்வேத நூல்கள் மேற்கோள்; (3) Schedule T GMP இணக்கம்; "
            "(4) ஏற்றுமதிக்கு EU/FDA அழகுசாதன விதிமுறைகள். சிகிச்சை கூற்றுகள் இருந்தால் "
            "தயாரிப்பு பிரிவு 3(b) மருந்தாக வகைப்படுத்தப்பட்டு விதி 158B உரிமம் தேவை."
        ),
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
        "en": (
            "Ayurvedic health supplements, herbal teas, and nutraceuticals sold as food are regulated by FSSAI "
            "under the Food Safety and Standards (Ayurveda Aahar) Regulations, 2022. Requirements: "
            "(1) FSSAI Central/State license depending on turnover; (2) Only structure/function claims allowed — "
            "e.g., 'supports immunity', 'promotes digestion' — NO disease cure claims; (3) Label must carry "
            "'NOT FOR MEDICINAL USE' disclaimer; (4) Ingredients must be from FSSAI-approved Ayurveda Aahar list. "
            "If a medicinal/disease-cure claim is added, the product automatically migrates to Ayurvedic Drug "
            "classification under D&C Act and requires Rule 158B state drug license. "
            "For export of Ayurveda Aahar products, APEDA AGMARK or equivalent certification may be required."
        ),
        "hi": (
            "FSSAI के खाद्य सुरक्षा और मानक (आयुर्वेद आहार) विनियम, 2022 के तहत आयुर्वेदिक स्वास्थ्य पूरक "
            "और हर्बल चाय नियंत्रित हैं। आवश्यकताएं: (1) FSSAI केंद्रीय/राज्य लाइसेंस; "
            "(2) केवल संरचना/कार्य दावे — 'प्रतिरक्षा समर्थन', 'पाचन बढ़ावा' — रोग उपचार दावे नहीं; "
            "(3) लेबल पर 'चिकित्सीय उपयोग के लिए नहीं'; (4) FSSAI-स्वीकृत आयुर्वेद आहार सामग्री। "
            "चिकित्सीय दावे जोड़ने पर D&C Act के तहत दवा बन जाती है — Rule 158B आवश्यक।"
        ),
        "ta": (
            "FSSAI-ன் உணவு பாதுகாப்பு மற்றும் தரநிலைகள் (ஆயுர்வேத ஆகார) ஒழுங்குமுறைகள் 2022-ன் கீழ் "
            "ஆயுர்வேத சுகாதார பூரணங்கள் மற்றும் மூலிகை தேயிலைகள் கட்டுப்படுத்தப்படுகின்றன. தேவைகள்: "
            "(1) FSSAI மத்திய/மாநில உரிமம்; (2) கட்டமைப்பு/செயல்பாடு கூற்றுகள் மட்டும் — "
            "'நோய் எதிர்ப்பு சக்தியை ஆதரிக்கிறது' — நோய் குணமாக்கும் கூற்றுகள் இல்லாமல்; "
            "(3) லேபிளில் 'மருத்துவ பயன்பாட்டிற்காக அல்ல'; (4) FSSAI-அங்கீகரிக்கப்பட்ட ஆகார பட்டியல். "
            "சிகிச்சை கூற்றுகள் சேர்த்தால் D&C சட்டத்தின் கீழ் மருந்தாக வகைப்படுத்தப்படும் — விதி 158B தேவை."
        ),
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
        "en": (
            "Manufacturing Ayurvedic, Siddha, and Unani (ASU) drugs in India requires a state drug manufacturing "
            "license under Rule 158B of the Drugs & Cosmetics Rules, 1945, issued by the State Licensing Authority (SLA). "
            "Requirements: (1) Qualified Technical Director — Ayurvedic or pharmacognosy graduate; "
            "(2) GMP-compliant premises per Schedule T of the D&C Rules; (3) Quality Control lab meeting "
            "Ayurvedic Pharmacopoeia of India (API) standards; (4) Product-specific Form 24-D for "
            "Patent/Proprietary medicines; (5) Safety and stability studies for new/non-classical formulations. "
            "Licenses are renewed annually. For Phytopharmaceuticals, CDSCO New Drug approval under Rule 122E "
            "is required additionally. Classical formulations under the First Schedule can be manufactured under "
            "Rule 153 without clinical trials, citing classical text references."
        ),
        "hi": (
            "भारत में ASU दवाओं के निर्माण के लिए ड्रग्स और कॉस्मेटिक्स नियम 1945 के नियम 158B के तहत "
            "राज्य ड्रग विनिर्माण लाइसेंस आवश्यक है। आवश्यकताएं: "
            "(1) योग्य तकनीकी निदेशक — आयुर्वेदिक/फार्माकोग्नोसी स्नातक; "
            "(2) Schedule T GMP-अनुपालन परिसर; (3) API गुणवत्ता QC लैब; "
            "(4) P&P दवाओं के लिए Form 24-D; (5) नए फॉर्मूलेशन के लिए सुरक्षा अध्ययन। "
            "लाइसेंस वार्षिक नवीकरणीय। फाइटोफार्मास्युटिकल के लिए Rule 122E CDSCO अनुमोदन अतिरिक्त।"
        ),
        "ta": (
            "இந்தியாவில் ASU மருந்துகளை உற்பத்தி செய்ய மருந்துகள் மற்றும் அழகுசாதனப் பொருட்கள் விதிகள் 1945-ன் "
            "விதி 158B-ன் கீழ் மாநில மருந்து உற்பத்தி உரிமம் தேவை. தேவைகள்: "
            "(1) தகுதிவாய்ந்த தொழில்நுட்ப இயக்குனர்; (2) Schedule T GMP-இணக்க வளாகம்; "
            "(3) API தர QC ஆய்வகம்; (4) தனியுரிம மருந்துகளுக்கு படிவம் 24-D; "
            "(5) புதிய சூத்திரங்களுக்கு பாதுகாப்பு ஆய்வுகள். உரிமம் ஆண்டுதோறும் புதுப்பிக்கப்படுகிறது. "
            "ஃபைட்டோபார்மாசூட்டிக்கல்களுக்கு விதி 122E CDSCO அனுமதி கூடுதலாக தேவை."
        ),
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
        "en": (
            "IP-SAKTI Sahayak can answer questions about Ayurvedic intellectual property and regulatory compliance. "
            "Based on your query, the relevant statutory framework includes: "
            "For product classification: classical ASU drugs (Section 3(a), Rule 153), patent/proprietary medicines "
            "(Section 3(h), Rule 158B), cosmetics (Section 3(aaa), Form 32-A), nutraceuticals (FSSAI Aahar 2022). "
            "For IP protection: patents require novelty beyond TKDL (Section 3(p) exclusion), trademarks protect "
            "brand identity (Trade Marks Act 1999), GI tags protect origin-linked products (GI Act 1999). "
            "For biological resources: NBA approval (BD Act 2002 Section 3/6) is mandatory for foreign entities "
            "and before any patent grant. "
            "Please ask a specific question for a precise statutory answer — e.g., 'Can I patent Ashwagandha extract?', "
            "'How to get NBA ABS clearance?', or 'What license do I need to manufacture Triphala churna?'"
        ),
        "hi": (
            "IP-SAKTI Sahayak आयुर्वेदिक बौद्धिक संपदा और नियामक अनुपालन पर उत्तर दे सकता है। "
            "आपके प्रश्न के आधार पर संबंधित ढांचा: उत्पाद वर्गीकरण — क्लासिकल ASU (धारा 3(a), नियम 153), "
            "पेटेंट/प्रोप्राइटरी (धारा 3(h), नियम 158B), कॉस्मेटिक (धारा 3(aaa)), FSSAI आहार। "
            "IP: पेटेंट के लिए TKDL से परे नवीनता, ट्रेडमार्क, GI टैग। "
            "जैव संसाधन: NBA अनुमोदन अनिवार्य। "
            "कृपया एक विशिष्ट प्रश्न पूछें जैसे 'क्या मैं अश्वगंधा अर्क पर पेटेंट ले सकता हूं?'"
        ),
        "ta": (
            "IP-SAKTI Sahayak ஆயுர்வேத அறிவுசார் சொத்து மற்றும் ஒழுங்குமுறை இணக்கம் பற்றிய கேள்விகளுக்கு "
            "பதில் அளிக்க முடியும். உங்கள் கேள்வியின் அடிப்படையில்: தயாரிப்பு வகைப்பாடு — பாரம்பரிய ASU "
            "(பிரிவு 3(a), விதி 153), தனியுரிம மருந்துகள் (பிரிவு 3(h), விதி 158B), அழகுசாதனம் (பிரிவு 3(aaa)), "
            "FSSAI ஆகார. IP: காப்புரிமைக்கு TKDL-க்கு அப்பால் புதுமை, வர்த்தகமுத்திரை, GI பட்டை. "
            "உயிரியல் வளங்கள்: NBA அனுமதி கட்டாயம். "
            "மிகவும் குறிப்பிட்ட கேள்வி கேட்கவும் — உதாரணம்: 'அஸ்வகந்தா சாறுக்கு காப்புரிமை பெற முடியுமா?'"
        ),
        "category": "Ayurvedic IP & Regulatory Multi-Framework Query",
        "ip_regimes": [
            "Drugs & Cosmetics Act, 1940",
            "Biological Diversity Act, 2002",
            "Patents Act, 1970",
            "Trade Marks Act, 1999"
        ],
        "reg_pathway": "Please specify product type, intended use, and specific regulatory question for targeted guidance."
    }
}

# Fill in remaining types with condensed answers
STATUTORY_KB["trademark"] = {
    "en": (
        "Trademarks for Ayurvedic products are governed by the Trade Marks Act, 1999. Register under Class 5 "
        "(pharmaceuticals/medicinal products) or Class 3 (cosmetics/toiletries). Restrictions: (1) Generic herbal "
        "names (Ashwagandha, Neem, Tulsi) cannot be registered as trademarks — they are in public domain; "
        "(2) Descriptive marks indicating healing properties are prohibited; (3) GI-protected product names "
        "cannot be appropriated. File Form TM-A online at ipindia.gov.in; examination takes 12-18 months. "
        "Registration is valid for 10 years (renewable). A registered trademark gives exclusive commercial rights."
    ),
    "hi": (
        "आयुर्वेदिक उत्पादों के लिए ट्रेडमार्क व्यापार चिह्न अधिनियम, 1999 द्वारा संचालित। Class 5 या Class 3 में पंजीकरण। "
        "प्रतिबंध: सामान्य हर्बल नाम पंजीकृत नहीं होते; चिकित्सीय दावे वाले वर्णनात्मक चिह्न निषिद्ध। "
        "ipindia.gov.in पर Form TM-A दाखिल करें; 10 वर्ष के लिए वैध।"
    ),
    "ta": (
        "ஆயுர்வேத தயாரிப்புகளுக்கான வர்த்தகமுத்திரைகள் வர்த்தக முத்திரைகள் சட்டம் 1999-ஆல் நிர்வகிக்கப்படுகின்றன. "
        "Class 5 அல்லது Class 3 கீழ் பதிவு. கட்டுப்பாடுகள்: பொதுவான மூலிகை பெயர்கள் பதிவு செய்ய முடியாது. "
        "ipindia.gov.in-ல் படிவம் TM-A தாக்கல்; 10 ஆண்டுகளுக்கு செல்லுபடியாகும்."
    ),
    "category": "Trademark Registration — Trade Marks Act 1999",
    "ip_regimes": ["Trade Marks Act, 1999", "Geographical Indications Act, 1999", "Drugs & Cosmetics Act — Labelling"],
    "reg_pathway": "File Form TM-A on ipindia.gov.in under Class 5 (medicinal) or Class 3 (cosmetic); respond to examination objections; registration valid 10 years (renewable)."
}
STATUTORY_KB["gi"] = {
    "en": (
        "Geographical Indications (GI) protect Ayurvedic products tied to specific geographic origin and traditional "
        "knowledge under the Geographical Indications of Goods Act, 1999. A GI tag prevents unauthorized commercial "
        "exploitation. Examples: Mysuru Agarbathi, Darjeeling Tea, Malabar Pepper. Requirements: documented evidence "
        "of traditional production in the region, quality linked to geographic origin, a producer association as applicant. "
        "File with the GI Registry, Chennai (girindia.in). GI protection lasts 10 years (renewable). "
        "For Ayurvedic inputs like Kashmiri Kesar or Spiti Ashwagandha, GI registration strengthens ABS claims."
    ),
    "hi": (
        "भौगोलिक संकेत (GI) भौगोलिक संकेत अधिनियम 1999 के तहत विशिष्ट भौगोलिक क्षेत्र से जुड़े आयुर्वेदिक "
        "उत्पादों की रक्षा करते हैं। उदाहरण: मैसूर अगरबत्ती, दार्जिलिंग चाय। आवश्यकताएं: क्षेत्र में परंपरागत "
        "उत्पादन का साक्ष्य, उत्पादक संघ। GI Registry, चेन्नई में आवेदन; 10 वर्ष वैध।"
    ),
    "ta": (
        "புவியியல் குறிப்பீடுகள் சட்டம் 1999-ன் கீழ் குறிப்பிட்ட புவியியல் தோற்றத்துடன் தொடர்புடைய ஆயுர்வேத "
        "தயாரிப்புகளை GI பட்டை பாதுகாக்கிறது. எடுத்துக்காட்டுகள்: மைசூர் அகர்பத்தி, தார்ஜிலிங் தேயிலை. "
        "GI பதிவாளர், சென்னை (girindia.in)-ல் விண்ணப்பம்; 10 ஆண்டுகளுக்கு செல்லுபடியாகும்."
    ),
    "category": "Geographical Indication — GI Act 1999",
    "ip_regimes": ["Geographical Indications of Goods Act, 1999", "TRIPS Agreement — Article 22-24"],
    "reg_pathway": "File GI application with GI Registry Chennai (girindia.in); provide documentation of traditional production and geographic linkage."
}
STATUTORY_KB["phytopharmaceutical"] = {
    "en": (
        "Phytopharmaceutical drugs are a distinct regulatory category under Rule 122E of the D&C Rules (2015 amendment). "
        "They are standardized botanical drug products requiring at least 4 authenticated chemical markers and clinical "
        "efficacy data. Requirements: (1) Minimum 4 chemical markers quantified per dose; (2) IND application to CDSCO "
        "for clinical trials; (3) Phase I safety and Phase II efficacy trials; (4) New Drug Application (NDA) to CDSCO; "
        "(5) State license under Rule 158B. Patent eligibility exists if a non-obvious novel standardized formulation "
        "with quantified synergistic effect is demonstrated, but NBA Form III is still mandatory."
    ),
    "hi": (
        "फाइटोफार्मास्युटिकल दवाएं D&C नियमों के नियम 122E (2015) के तहत नई श्रेणी हैं। कम से कम 4 रासायनिक "
        "मार्करों और नैदानिक प्रभावकारिता डेटा के साथ मानकीकृत। आवश्यकताएं: IND → Phase I/II → NDA CDSCO; "
        "Rule 158B राज्य लाइसेंस; NBA Form III।"
    ),
    "ta": (
        "ஃபைட்டோபார்மாசூட்டிக்கல் மருந்துகள் D&C விதிகளின் விதி 122E (2015)-ன் கீழ் புதிய வகை. "
        "குறைந்தது 4 வேதியியல் குறிப்பான்கள் மற்றும் மருத்துவ செயல்திறன் தரவுகள் தேவை. "
        "IND → Phase I/II → NDA CDSCO; விதி 158B மாநில உரிமம்; NBA படிவம் III."
    ),
    "category": "Phytopharmaceutical Drug — Rule 122E New Drug Category",
    "ip_regimes": ["Drugs & Cosmetics Rules — Rule 122E", "New Drugs & Clinical Trials Rules, 2019", "Patents Act, 1970 Section 3(d)"],
    "reg_pathway": "Conduct Phase I/II clinical trials; file IND then NDA with CDSCO; get state manufacturing license Rule 158B; file NBA Form III."
}
STATUTORY_KB["classical"] = {
    "en": (
        "Classical Ayurvedic formulations documented in Charaka Samhita, Sushruta Samhita, Ashtanga Hridayam and "
        "listed in the First Schedule of the D&C Act can be manufactured under Rule 153 WITHOUT clinical trials. "
        "These are Section 3(a) 'Classical/Generic Ayurvedic Medicines'. Requirements: (1) State drug manufacturing "
        "license; (2) Classical text reference cited on label; (3) Formulation must exactly match classical text "
        "proportions — any ratio change makes it non-classical (Rule 158B); (4) API quality standards. "
        "Patent exclusion: Classical formulations documented in TKDL cannot be patented under Section 3(p)."
    ),
    "hi": (
        "चरक संहिता, सुश्रुत संहिता में दर्ज और प्रथम अनुसूची में सूचीबद्ध फॉर्मूलेशन नियम 153 के तहत "
        "नैदानिक परीक्षण के बिना निर्मित। धारा 3(a) 'क्लासिकल दवाएं'। आवश्यकताएं: राज्य लाइसेंस; "
        "लेबल पर ग्रंथ उद्धरण; API गुणवत्ता। पेटेंट बहिष्करण: धारा 3(p) के तहत पेटेंट नहीं।"
    ),
    "ta": (
        "சரக சம்ஹிதா, சுஸ்ருத சம்ஹிதாவில் பதிவான முதல் அட்டவணை சூத்திரங்களை விதி 153-ன் கீழ் "
        "மருத்துவ சோதனை இல்லாமல் உற்பத்தி செய்யலாம். பிரிவு 3(a) 'பாரம்பரிய மருந்துகள்'. "
        "தேவைகள்: மாநில உரிமம்; நூல் மேற்கோள்; API தரநிலைகள். "
        "காப்புரிமை விலக்கு: TKDL-ல் பதிவான சூத்திரங்கள் பிரிவு 3(p)-ன் கீழ் காப்புரிமை பெற முடியாது."
    ),
    "category": "Classical Ayurvedic Medicine — Section 3(a), Rule 153",
    "ip_regimes": ["Drugs & Cosmetics Act Section 3(a), First Schedule", "Rule 153 D&C Rules", "Patents Act 1970 Section 3(p)"],
    "reg_pathway": "Obtain state drug manufacturing license; cite exact classical text on label; maintain API standards; no clinical trial needed under Rule 153."
}
STATUTORY_KB["ayush"] = {
    "en": (
        "The Ministry of Ayush oversees regulation of Ayurveda, Yoga, Unani, Siddha, Sowa Rigpa, and Homeopathy "
        "in India. Key bodies: (1) CCRAS — Central Council for Research in Ayurvedic Sciences (funds research); "
        "(2) PCIM&H — Pharmacopoeia Commission publishes API, Siddha, Unani pharmacopoeias; "
        "(3) AIIA — All India Institute of Ayurveda, premier research hospital; (4) NIA, Jaipur — education. "
        "Manufacturing licenses are issued by State Licensing Authorities; quality standards from API/PCIM&H; "
        "post-market surveillance by CDSCO. AYUSH and allopathic drugs are regulated separately "
        "but the same GMP Schedule T applies."
    ),
    "hi": (
        "आयुष मंत्रालय भारत में आयुर्वेद, योग, यूनानी, सिद्ध, सोवा रिग्पा और होम्योपैथी का नियमन करता है। "
        "मुख्य निकाय: CCRAS, PCIM&H, AIIA, NIA। लाइसेंस राज्य प्राधिकरण से; "
        "गुणवत्ता API/PCIM&H से; CDSCO द्वारा निगरानी।"
    ),
    "ta": (
        "ஆயுஷ் அமைச்சகம் இந்தியாவில் ஆயுர்வேதம், யோகா, யுனானி, சித்தம், சோவா ரிக்பா மற்றும் "
        "ஹோமியோபதி நிர்வாகம் மேற்பார்வையிடுகிறது. முக்கிய அமைப்புகள்: CCRAS, PCIM&H, AIIA, NIA. "
        "உரிமங்கள் மாநில அதிகாரிகளிடம்; தரம் API/PCIM&H இல் இருந்து; CDSCO மூலம் கண்காணிப்பு."
    ),
    "category": "AYUSH Regulatory Framework — Ministry of Ayush",
    "ip_regimes": ["Drugs & Cosmetics Act, 1940", "Biological Diversity Act, 2002", "Ministry of Ayush Schemes"],
    "reg_pathway": "Contact Ministry of Ayush for policy; manufacturing licenses from State Licensing Authority; consult CCRAS for research; refer API/PCIM&H for quality standards."
}


class LLMGuard:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")

    def call_gemini_synthesis(self, query: str, retrieved_docs: List[Dict[str, Any]], category: str, jurisdiction: str, language: str = "en", question_type: str = "general") -> Optional[str]:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        try:
            import requests
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            doc_context = "\n".join([
                f"- [{d['document']['section']}] {d['document']['title']}: {d['document']['text'][:200]}"
                for d in retrieved_docs[:4]
            ])
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
                lang_instruction = "Write response in clear professional English."

            prompt = (
                f"You are IP-SAKTI Sahayak, an authoritative statutory AI advisor for Ministry of Ayush & AIIA.\n"
                f"User Question: {query}\n"
                f"Question Category: {question_type}\n"
                f"Product Category: {category}\n"
                f"Jurisdiction: {jurisdiction}\n"
                f"Retrieved Statutory Sources:\n{doc_context}\n\n"
                f"{lang_instruction}\n\n"
                f"Instructions:\n"
                f"1. Directly and specifically answer the user's actual question — do not give generic template.\n"
                f"2. Cite the exact statutory sections (Section numbers, Rule numbers, Form numbers) from the sources.\n"
                f"3. Provide 2-3 paragraphs of authoritative analysis relevant to THIS specific question.\n"
                f"4. Do NOT fabricate sections not in the context.\n"
                f"5. Do NOT repeat the same template for every query — answer THIS specific question.\n"
            )
            resp = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=7.0)
            if resp.status_code == 200:
                data = resp.json()
                text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if text and len(text.strip()) > 50:
                    return text.strip()
        except Exception:
            pass
        return None

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
        # Auto-detect language if Tamil or Hindi script is present in query
        if any('\u0b80' <= c <= '\u0bff' for c in query):
            language = "ta"
        elif any('\u0900' <= c <= '\u097f' for c in query):
            language = "hi"
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

        # Step 2: Detect question type early (before abstention, so we can use KB for non-English)
        question_type = detect_question_type(query)

        # Step 3: Hybrid Retrieval
        retrieved = retriever_instance.retrieve(query, jurisdiction=jurisdiction, top_k=5)
        confidence = self.calculate_confidence(query, retrieved)

        # Step 4: Safe Abstention Protocol
        # Only truly abstain if retrieval is empty AND no specific question type could be detected
        # (i.e., don't abstain for Hindi/Tamil queries just because BM25 scored them low)
        should_abstain = confidence["abstain_recommended"] and question_type == "general"
        if should_abstain:

            if language == "ta":
                abstain_answer = (
                    "இந்தக் கேள்விக்கு போதிய அதிகாரப்பூர்வ சட்ட சான்றுகள் கிடைக்கவில்லை. "
                    "சட்ட விதிகளைத் தவறாக ஊகிக்க இயலாது. உங்கள் மூலப்பொருள், நோக்கம் அல்லது அதிகார வரம்பு பற்றிய கூடுதல் விவரங்களை வழங்கவும்."
                )
                abstain_class = "தெளிவற்றது / போதிய தகவல் இல்லை"
                abstain_limits = "நம்பகத்தன்மை வரம்பு குறைவாக உள்ளதால் கற்பனைத் தகவல் (hallucination) தடுப்பதற்காக விலகல் முறை பயன்படுத்தப்பட்டது."
                abstain_steps = [
                    "தாவர மூலப்பொருட்கள் மற்றும் பாரம்பரிய நூல்களின் பெயர்களைக் குறிப்பிடவும்.",
                    "இது சிகிச்சை மருந்தா அல்லது உணவுப் பொருளா என்பதைத் தெளிவுபடுத்தவும்.",
                    "அங்கீகரிக்கப்பட்ட காப்புரிமை ஆலோசகர் அல்லது ஆயுஷ் அதிகாரியிடம் ஆலோசனை பெறவும்."
                ]
                abstain_disc = "முதற்கட்ட தகவல் மதிப்பீடு மட்டுமே — இது சட்ட ஆலோசனை அல்ல."
            elif language == "hi":
                abstain_answer = (
                    "इस प्रश्न का विश्वसनीय उत्तर देने के लिए पर्याप्त आधिकारिक वैधानिक साक्ष्य उपलब्ध नहीं हैं। "
                    "हम कानूनी नियमों का मनमाना अनुमान नहीं लगा सकते। कृपया घटक, प्रयोजन या क्षेत्राधिकार का स्पष्ट विवरण दें।"
                )
                abstain_class = "अनिश्चित / अपर्याप्त डेटा"
                abstain_limits = "विश्वसनीयता सुरक्षित सीमा से कम होने के कारण काल्पनिक उत्तर रोकने हेतु सुरक्षित निष्कासन सक्रिय हुआ।"
                abstain_steps = [
                    "सटीक वानस्पतिक घटकों और शास्त्रीय ग्रंथों के नाम स्पष्ट करें।",
                    "यह स्पष्ट करें कि उपयोग चिकित्सीय है अथवा खाद्य पूरक।",
                    "अधिकृत पेटेंट एजेंट या आयुष विनियामक विशेषज्ञ से परामर्श करें।"
                ]
                abstain_disc = "प्रारंभिक सूचनात्मक मूल्यांकन — यह कानूनी सलाह नहीं है।"
            else:
                abstain_answer = (
                    "I could not find sufficient authoritative statutory evidence to answer this query reliably. "
                    "I will not guess or fabricate legal provisions. Please provide more specific details regarding "
                    "the formulation, ingredients, intended therapeutic claim, or jurisdiction."
                )
                abstain_class = "Uncertain / Insufficient Data"
                abstain_limits = "Confidence score is below safe threshold. Abstention triggered to prevent hallucination."
                abstain_steps = [
                    "Specify exact botanical ingredients and classical text sources if known.",
                    "Clarify whether the intended use is therapeutic, cosmetic, or a dietary food supplement.",
                    "Consult an authorized patent agent or AYUSH regulatory consultant."
                ]
                abstain_disc = "Preliminary informational assessment — not legal advice."

            return {
                "status": "ABSTAINED",
                "short_answer": abstain_answer,
                "product_classification": abstain_class,
                "jurisdiction": jurisdiction.upper(),
                "applicable_ip_regimes": [],
                "regulatory_pathway": "Unverified without additional formulation facts.",
                "abs_considerations": "Unable to verify biological origin.",
                "citations": [],
                "confidence": confidence,
                "important_limitations": abstain_limits,
                "actionable_next_steps": abstain_steps,
                "disclaimer": abstain_disc
            }

        # Step 5: Extract Grounded Citations from Retrieved Corpus
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

        # Step 5: Use question_type to route to STATUTORY_KB for rich, specific answers
        kb = STATUTORY_KB.get(question_type, STATUTORY_KB["general"])
        lang_key = language if language in ("ta", "hi") else "en"

        # Try Gemini dynamic synthesis first (question-type aware, longer timeout)
        gemini_answer = self.call_gemini_synthesis(
            query, retrieved,
            kb["category"], jurisdiction,
            language=language, question_type=question_type
        )

        if gemini_answer:
            short_answer = gemini_answer
        else:
            # Use rich STATUTORY_KB answer for this specific question type
            short_answer = kb.get(lang_key, kb.get("en", ""))

        category = kb["category"]
        ip_regimes = kb["ip_regimes"]
        reg_pathway = kb["reg_pathway"]

        # Localized disclaimer
        if language == "hi":
            disclaimer = "यह सूचना केवल प्रारंभिक मार्गदर्शन के लिए है — यह कोई कानूनी सलाह नहीं है। आधिकारिक पेटेंट एजेंट या आयुष विशेषज्ञ से परामर्श अवश्य करें।"
        elif language == "ta":
            disclaimer = "இது தகவல் நோக்கங்களுக்கான ஆரம்ப மதிப்பீடு மட்டுமே — சட்ட ஆலோசனை அல்ல. தகுதிவாய்ந்த அறிவுசார் சொத்து நிபுணரை அணுகவும்."
        else:
            disclaimer = (
                "This is a preliminary informational assessment based on retrieved statutory sources. "
                "Not legal advice. Verify with an appropriate IP/regulatory professional before legal action."
            )

        # Localized action steps
        if language == "ta":
            action_steps = [
                "இந்திய காப்புரிமை அலுவலகத்தில் (InPASS) மற்றும் TKDL (tkdl.res.in)-ல் முன் கலை தேடல் நடத்தவும்.",
                "NBA அலுவலகத்திடம் இந்திய உயிரியல் வளங்களை பயன்படுத்துகிறீர்களா என்பதை சரிபார்க்கவும்.",
                "உங்கள் குறிப்பிட்ட தயாரிப்பு வகைக்கு தகுதிவாய்ந்த ஆயுஷ் ஒழுங்குமுறை ஆலோசகரை தொடர்பு கொள்ளவும்."
            ]
        elif language == "hi":
            action_steps = [
                "भारतीय पेटेंट कार्यालय (InPASS) और TKDL (tkdl.res.in) पर पूर्व कला खोज करें।",
                "NBA कार्यालय से जांच करें कि आप भारतीय जैविक संसाधनों का उपयोग करते हैं या नहीं।",
                "अपने विशिष्ट उत्पाद श्रेणी के लिए योग्य AYUSH नियामक सलाहकार से संपर्क करें।"
            ]
        else:
            action_steps = [
                "Conduct prior-art search on InPASS (ipindia.gov.in) and TKDL (tkdl.res.in).",
                "Verify NBA biodiversity access requirements with the National Biodiversity Authority.",
                "Consult a qualified AYUSH regulatory consultant for product-specific licensing pathway."
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
                "Does not replace statutory FTO patent searches or state drug licensing inspections."
            ),
            "actionable_next_steps": action_steps,
            "disclaimer": disclaimer
        }

llm_guard_instance = LLMGuard()
