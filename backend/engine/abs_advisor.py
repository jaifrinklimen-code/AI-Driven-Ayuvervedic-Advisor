"""
ABS (Access and Benefit-Sharing) and Traditional Knowledge / TKDL Advisor
Assesses regulatory requirements under the Biological Diversity Act, 2002
(amended 2023), NBA Guidelines, and Traditional Knowledge Prior Art frameworks.
"""

from typing import Dict, Any, List

class ABSAdvisor:
    def evaluate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Input data:
        - entity_type: str (indian_entity | foreign_entity | nri)
        - resource_origin: str (cultivated | wild_harvested | market_commodity | imported)
        - purpose: str (commercial_utilization | research | ip_application | bio_survey)
        - traditional_knowledge_involved: bool
        - biological_resource_name: Optional[str]
        """
        entity_type = str(data.get("entity_type", "indian_entity")).lower()
        resource_origin = str(data.get("resource_origin", "cultivated")).lower()
        purpose = str(data.get("purpose", "commercial_utilization")).lower()
        tk_involved = bool(data.get("traditional_knowledge_involved", False))
        resource_name = str(data.get("biological_resource_name", "Herbal / Botanical Resource")).strip()

        is_foreign = "foreign" in entity_type or "nri" in entity_type
        is_ip = "ip" in purpose or "patent" in purpose
        is_commercial = "commercial" in purpose

        # NTAC (Normally Traded as Commodities) check
        ntac_applicable = (resource_origin == "market_commodity")

        flags: List[Dict[str, str]] = []
        mandatory_filings: List[str] = []
        statutory_citations: List[str] = []

        # Check 1: Foreign entity accessing Indian biological resource (Section 3)
        if is_foreign and resource_origin != "imported":
            flags.append({
                "severity": "CRITICAL",
                "title": "NBA Section 3 Prior Approval Required",
                "description": f"Foreign nationals, non-residents, and foreign-owned/controlled entities MUST obtain prior approval from the National Biodiversity Authority (NBA) before accessing any biological resource occurring in India ({resource_name})."
            })
            mandatory_filings.append("NBA Form I (Access to Biological Resources and Associated Knowledge)")
            statutory_citations.append("Biological Diversity Act 2002, Section 3")

        # Check 2: Indian entity accessing for commercial utilization (Section 7)
        if not is_foreign and is_commercial and resource_origin != "imported":
            if ntac_applicable:
                flags.append({
                    "severity": "INFO",
                    "title": "Normally Traded as Commodities (NTAC) Exemption Check",
                    "description": f"Under Section 40 of the Biological Diversity Act, biological resources listed as Normally Traded as Commodities (NTAC) are exempt from SBB intimation when traded as agricultural produce for consumption, but value-added medicinal utilization may still be monitored."
                })
                statutory_citations.append("Biological Diversity Act 2002, Section 40 & NTAC Notification")
            else:
                flags.append({
                    "severity": "HIGH",
                    "title": "State Biodiversity Board (SBB) Prior Intimation Required",
                    "description": "Indian citizens and corporate bodies must give prior intimation to the concerned State Biodiversity Board (SBB) before obtaining biological resources for commercial utilization (unless local vaids or hakims practicing indigenous medicine)."
                })
                mandatory_filings.append("State Biodiversity Board (SBB) Intimation Form")
                statutory_citations.append("Biological Diversity Act 2002, Section 7")

        # Check 3: Intellectual Property Application based on biological resources (Section 6)
        if is_ip or purpose == "ip_application":
            flags.append({
                "severity": "CRITICAL",
                "title": "Mandatory NBA Form III Approval Before Patent Grant",
                "description": "Under Section 6(1) of the Biological Diversity Act, 2002 (as updated by 2023 Amendment Act), no person shall apply for an IP right in or outside India based on Indian biological resources or associated knowledge without obtaining NBA approval before the grant of the patent."
            })
            mandatory_filings.append("NBA Form III (Application for seeking prior approval for applying for Intellectual Property Right)")
            statutory_citations.append("Biological Diversity Act 2002, Section 6 & Patents Act 1970, Section 10(4)(d)(ii)")

        # Check 4: Traditional Knowledge Involvement & TKDL
        if tk_involved:
            flags.append({
                "severity": "WARNING",
                "title": "Traditional Knowledge (TK) & Prior Art Barrier",
                "description": "Under Section 3(p) of the Patents Act, inventions that are mere aggregations or duplication of known traditional knowledge are unpatentable. Furthermore, India's Traditional Knowledge Digital Library (TKDL) contains >500,000 Ayurvedic formulations accessible by international patent examiners to oppose biopiracy."
            })
            statutory_citations.append("Patents Act 1970, Section 3(p) & CSIR-TKDL Database Directives")

        return {
            "resource_analyzed": resource_name,
            "overall_status": "ABS ACTION REQUIRED" if mandatory_filings else "LOW ABS EXPOSURE",
            "regulatory_authority": "National Biodiversity Authority (NBA) / State Biodiversity Boards (SBB)",
            "compliance_flags": flags,
            "required_statutory_filings": mandatory_filings,
            "applicable_statutes": statutory_citations,
            "tkdl_guidance": {
                "is_tkdl_public_domain": True,
                "status_note": "TKDL is a defensive prior-art repository that examiner teams across USPTO, EPO, and CGPDTM consult to reject claims lacking novelty. Applicants cannot claim proprietary ownership over classical Sanskrit knowledge recorded in TKDL.",
                "verification_step": "Search AYUSH research portals and published Ayurvedic Pharmacopoeia of India (API) monographs prior to filing."
            },
            "disclaimer": "This is an automated regulatory informational assessment under the Biological Diversity Act, 2002 and 2023 Amendments. Not formal legal representation."
        }

abs_advisor_instance = ABSAdvisor()
