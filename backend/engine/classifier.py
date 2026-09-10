"""
Formulation Classification Engine for IP-SAKTI Sahayak
Implements hybrid Rule-Based Decision Tree + Statutory Legal Mapping
distinguishing:
1. Classical / Generic Ayurvedic Medicine (Drugs & Cosmetics Act Sec 3(a))
2. Patent / Proprietary Ayurvedic Medicine (Drugs & Cosmetics Act Sec 3(h))
3. New / Non-Classical Ayurvedic Drug (Rule 158B Category C / substantial modification)
4. Phytopharmaceutical Drug (Rule 122E / Schedule Y Appendix XXXIII)
5. Ayurveda-Aahar / Nutraceutical (FSSAI Ayurveda Aahar Regulations 2022)
6. Cosmetic (Drugs & Cosmetics Act Sec 3(aaa))
"""

from typing import Dict, Any, List

class FormulationClassifier:
    def classify(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Input data fields:
        - product_name: str
        - ingredients: List[str] or str
        - from_classical_text: bool
        - classical_text_name: Optional[str]
        - is_modified: bool (modified composition or preparation process)
        - intended_use: str (therapeutic | health_supplement | cosmetic | wellness)
        - is_purified_fraction: bool (phytopharmaceutical extract with >= 4 markers)
        - is_food_format: bool (dietary / food / tea / biscuit / beverage)
        - biological_resources_involved: bool
        - target_jurisdiction: str (India | International)
        """
        intended_use = str(data.get("intended_use", "")).lower()
        from_classical_text = bool(data.get("from_classical_text", False))
        is_modified = bool(data.get("is_modified", False))
        is_purified_fraction = bool(data.get("is_purified_fraction", False))
        is_food_format = bool(data.get("is_food_format", False))
        classical_text_name = str(data.get("classical_text_name", "")).strip()

        # Step 1: Check for Phytopharmaceutical
        if is_purified_fraction:
            return {
                "category": "Phytopharmaceutical Drug",
                "statutory_definition": "Drugs & Cosmetics Rules 1945, Rule 122E and Schedule Y Appendix XXXIII",
                "authority": "Central Drugs Standard Control Organisation (CDSCO)",
                "confidence_score": 95,
                "licensing_pathway": "New Drug Approval (Form 44) with Phase I/II/III clinical trials, chemical standardization with minimum 4 active markers, and animal safety toxicology dossiers.",
                "ip_potential": {
                    "patentable_in_india": True,
                    "caveats": "Can be patented if novel extraction process, enhanced therapeutic efficacy (Section 3(d)), and non-obvious standardized bioactive fraction are demonstrated. Mandatory NBA Form III required before patent grant under Section 6 of Biological Diversity Act."
                },
                "key_factors": [
                    "Purified and standardized botanical fraction with identified marker compounds",
                    "Regulated under Allopathic New Drug Framework, not standard AYUSH licensing",
                    "Requires rigorous clinical validation"
                ],
                "recommended_actions": [
                    "Conduct HPLC/LC-MS marker characterization for at least 4 analytical markers",
                    "File Form III with National Biodiversity Authority (NBA) prior to patent filing",
                    "Submit IND application to CDSCO Subject Expert Committee (SEC)"
                ]
            }

        # Step 2: Check for Cosmetic
        if "cosmetic" in intended_use or intended_use == "beauty":
            return {
                "category": "Ayurvedic Cosmetic",
                "statutory_definition": "Drugs & Cosmetics Act 1940, Section 3(aaa)",
                "authority": "State Licensing Authority (SLA) under Ministry of Ayush",
                "confidence_score": 90,
                "licensing_pathway": "Ayurvedic Cosmetic Manufacturing License (Form 32-A) under Chapter IV-A of Drugs & Cosmetics Act.",
                "ip_potential": {
                    "patentable_in_india": False,
                    "caveats": "Cosmetic herbal blends are generally excluded under Section 3(p) (traditional knowledge) and Section 3(e) (mere admixture). Strongest IP protection is Trademark for brand and Industrial Design for novel packaging."
                },
                "key_factors": [
                    "Intended strictly for cleansing, beautifying, or altering appearance without medicinal/therapeutic disease claims",
                    "Ingredients must be listed in authoritative books or generally recognized safe Ayurvedic pharmacopoeia",
                    "Cannot make therapeutic disease-treatment claims on labels"
                ],
                "recommended_actions": [
                    "Ensure formulation contains only approved ingredients from Ayurvedic Pharmacopoeia",
                    "Register trademark brand name avoiding generic descriptive plant names",
                    "Verify non-infringement with State Licensing Authority label guidelines"
                ]
            }

        # Step 3: Check for Ayurveda Aahar / Nutraceutical
        if is_food_format or "supplement" in intended_use or "health_supplement" in intended_use:
            return {
                "category": "Ayurveda-Aahar (Nutraceutical / Food)",
                "statutory_definition": "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022",
                "authority": "Food Safety and Standards Authority of India (FSSAI) in consultation with Ministry of Ayush",
                "confidence_score": 92,
                "licensing_pathway": "FSSAI Central / State License with dedicated Ayurveda Aahar category endorsement.",
                "ip_potential": {
                    "patentable_in_india": False,
                    "caveats": "Food preparations made from traditional herbs are barred from patenting under Section 3(p). Process patents for novel food stabilization/delivery systems are possible if inventive step is established."
                },
                "key_factors": [
                    "Prepared in accordance with recipes or ingredients described in authoritative books of Ayurveda listed in Schedule A of FSSAI regulations",
                    "Exclusively intended to promote health and nutritional well-being",
                    "Mandatory Ayurveda Aahar logo and statutory disclaimer: 'NOT FOR MEDICINAL USE'"
                ],
                "recommended_actions": [
                    "Verify all ingredients exist in Schedule A authoritative texts of Ayurveda Aahar regulations",
                    "Apply for FSSAI Ayurveda Aahar license with approved labeling compliance",
                    "Do not make curative disease prevention claims in marketing"
                ]
            }

        # Step 4: Check Classical vs Proprietary vs New Ayurvedic Drug
        if from_classical_text and not is_modified:
            return {
                "category": "Classical / Generic Ayurvedic Medicine",
                "statutory_definition": "Drugs & Cosmetics Act 1940, Section 3(a)",
                "authority": "State Licensing Authority (SLA) / Ministry of Ayush",
                "confidence_score": 96,
                "licensing_pathway": "Standard Ayurvedic Manufacturing License under Rule 153/154. Requires citation of First Schedule text (e.g. Charaka Samhita, Sharangadhara Samhita, API). No clinical trial data required.",
                "ip_potential": {
                    "patentable_in_india": False,
                    "caveats": "Completely excluded from patentability under Section 3(p) of the Patents Act, 1970 as traditional knowledge and public prior art documented in TKDL. Cannot be registered as a trademark for generic text names (e.g., 'Chyawanprash' or 'Triphala')."
                },
                "key_factors": [
                    f"Manufactured strictly according to formula in classical text: {classical_text_name or 'First Schedule Authoritative Book'}",
                    "No modification of composition, vehicle, or classical manufacturing method",
                    "Freely manufacturable by any licensed Ayurvedic pharmaceutical manufacturer"
                ],
                "recommended_actions": [
                    "Verify batch pharmacopoeial standards against Ayurvedic Pharmacopoeia of India (API)",
                    "Protect distinctive branding through distinctive trademark (e.g. 'BrandName Triphala')",
                    "Ensure GMP compliance under Schedule T"
                ]
            }

        elif from_classical_text and is_modified:
            return {
                "category": "New / Non-Classical Ayurvedic Drug",
                "statutory_definition": "Drugs & Cosmetics Rules 1945, Rule 158B (Category B/C)",
                "authority": "State Licensing Authority & Ministry of Ayush",
                "confidence_score": 85,
                "licensing_pathway": "License under Rule 158B with proof of safety, published literature, or pilot clinical safety study.",
                "ip_potential": {
                    "patentable_in_india": True,
                    "caveats": "Patentable ONLY if the modification demonstrates non-obvious synergistic therapeutic efficacy (Section 3(d) and 3(e)). Mere minor modifications or standard extract changes are rejected under Section 3(p)."
                },
                "key_factors": [
                    "Derived from classical concepts but incorporates non-classical proportions, excipients, or delivery forms",
                    "Requires safety validation before commercial manufacturing approval",
                    "Requires NBA Form III if biological resources from India are involved"
                ],
                "recommended_actions": [
                    "Generate comparative synergy data (Combination Index < 1.0) against individual classical ingredients",
                    "Conduct safety/toxicity evaluation as per AYUSH Good Clinical Practice guidelines",
                    "File NBA approval before commercialization or patent grant"
                ]
            }

        else:
            # Not from classical text, novel formulation
            return {
                "category": "Patent / Proprietary Ayurvedic Medicine",
                "statutory_definition": "Drugs & Cosmetics Act 1940, Section 3(h)",
                "authority": "State Licensing Authority (SLA) & Ministry of Ayush",
                "confidence_score": 88,
                "licensing_pathway": "Manufacturing license under Rule 158B. Requires submission of textual evidence for ingredients, justification of combination, and proof of safety/effectiveness.",
                "ip_potential": {
                    "patentable_in_india": True,
                    "caveats": "High risk of objection under Section 3(p) (traditional knowledge) and Section 3(e) (mere admixture). To secure a patent, applicant MUST establish synergistic effect, novel processing, and enhanced bio-availability."
                },
                "key_factors": [
                    "Ingredients are mentioned in authoritative Ayurvedic texts, but the specific combination/formula is new",
                    "Proprietary to the manufacturer",
                    "Requires compliance with Rule 158B safety criteria"
                ],
                "recommended_actions": [
                    "Conduct prior-art search across public literature and patent databases",
                    "Document laboratory evidence of synergistic efficacy to overcome Section 3(e)",
                    "Ensure complete disclosure of biological origin under Patents Act Section 10(4)(d)(ii) and file NBA Form III"
                ]
            }

classifier_instance = FormulationClassifier()
