import React, { useState, useMemo } from "react";
import {
  Brain,
  Zap,
  ShieldCheck,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Search,
  RotateCcw,
  Compass,
  ArrowRight,
  Activity,
  Globe,
  Leaf,
  Building2,
  Utensils
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface RegulatoryNode {
  id: string;
  label: string;
  shortLabel: string;
  lobe: "ip_patents" | "biodiversity_abs" | "ayush_licensing" | "ayurveda_aahar" | "defensive_treaties" | "phytopharmaceutical";
  statutory_basis: string;
  authority: string;
  jurisdiction: "India" | "International";
  description: string;
  legal_standard: string;
  key_implication: string;
  safe_harbor: string;
  external_url: string;
  sample_query: string;
  x: number;
  y: number;
  color: string;
}

export interface RegulatoryEdge {
  from: string;
  to: string;
  relation: string;
  type: "mandates" | "restricts" | "clears" | "cross_examines";
}

export interface SimulationScenario {
  id: string;
  name: string;
  product_type: string;
  description: string;
  active_nodes: string[];
  safe_nodes: string[];
  warning_nodes: string[];
  barrier_nodes: string[];
  clearance_summary: string;
  recommended_strategy: string;
}

interface RegulatoryKnowledgeGraphProps {
  onQuerySelect?: (query: string) => void;
}

export const RegulatoryKnowledgeGraph: React.FC<RegulatoryKnowledgeGraphProps> = ({ onQuerySelect }) => {
  const navigate = useNavigate();
  const [selectedNodeId, setSelectedNodeId] = useState<string>("sec3p");
  const [activeLobe, setActiveLobe] = useState<string>("all");
  const [activeScenarioId, setActiveScenarioId] = useState<string>("none");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);
  const [animateSynapses, setAnimateSynapses] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // -------------------------------------------------------------
  // 24 COMPREHENSIVE STATUTORY NODES ACROSS 6 REGULATORY LOBES
  // -------------------------------------------------------------
  const nodes: RegulatoryNode[] = useMemo(
    () => [
      // LOBE 1: INTELLECTUAL PROPERTY & PATENTS (Left Hemisphere)
      {
        id: "sec3p",
        label: "Section 3(p) — Traditional Knowledge Exclusion",
        shortLabel: "Sec 3(p) Traditional Knowledge",
        lobe: "ip_patents",
        statutory_basis: "The Patents Act, 1970 § 3(p) (Amended 2002)",
        authority: "Controller General of Patents, Designs and Trade Marks (CGPDTM)",
        jurisdiction: "India",
        description: "Statutory bar under Indian patent law prohibiting monopolies on traditional Ayurvedic formulations or mere aggregations of traditionally known medicinal properties.",
        legal_standard: "Destructive prior art standard. Codified formulations in classical texts (Charaka, Sushruta, Ashtanga Hridaya) and TKDL cannot be patented.",
        key_implication: "Requires applicant to establish inventive technical novelty beyond classical texts and non-traditional therapeutic efficacy.",
        safe_harbor: "Patentable only if incorporating novel delivery carriers (e.g. liposomes, nanoparticles) or non-traditional technological extraction processes.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/1392",
        sample_query: "Does Section 3(p) of the Patents Act bar patents on traditional Ayurvedic herbal combinations?",
        x: 310,
        y: 170,
        color: "#D97706" // Amber
      },
      {
        id: "sec3e",
        label: "Section 3(e) — Mere Admixture vs Synergy Requirement",
        shortLabel: "Sec 3(e) Synergy / Admixture",
        lobe: "ip_patents",
        statutory_basis: "The Patents Act, 1970 § 3(e)",
        authority: "CGPDTM / Intellectual Property Office",
        jurisdiction: "India",
        description: "Excludes substances obtained by a mere admixture resulting only in the aggregation of properties of the components thereof, or processes for producing such substances.",
        legal_standard: "Synergistic Combination Standard: Requires quantitative pharmacological proof demonstrating a Combination Index (CI) < 1.0 (Chou-Talalay isobologram).",
        key_implication: "Simply combining known Ayurvedic herbs (e.g. Ashwagandha + Turmeric) is deemed an unpatentable mere admixture.",
        safe_harbor: "Must provide validated laboratory synergy data proving the mixture's therapeutic efficacy exceeds the mathematical sum of its individual components.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/1392",
        sample_query: "What is required under Section 3(e) to prove an Ayurvedic herbal formulation is patentable?",
        x: 210,
        y: 250,
        color: "#EA580C" // Ochre Orange
      },
      {
        id: "sec3d",
        label: "Section 3(d) — Enhanced Therapeutic Efficacy",
        shortLabel: "Sec 3(d) Enhanced Efficacy",
        lobe: "ip_patents",
        statutory_basis: "The Patents Act, 1970 § 3(d) (Amended 2005)",
        authority: "CGPDTM / Supreme Court Precedent (Novartis AG)",
        jurisdiction: "India",
        description: "Bars patenting the mere discovery of a new form of a known substance or new use for a known substance without significant enhancement of therapeutic efficacy.",
        legal_standard: "Therapeutic Efficacy Test: Enhanced bioavailability, longer shelf life, or higher solubility alone does not satisfy Section 3(d) unless translating into measurable clinical superiority.",
        key_implication: "Isolating a known bioactive phytochemical from an Ayurvedic herb requires proving unexpected therapeutic disease improvement.",
        safe_harbor: "Demonstrate statistically significant in-vivo therapeutic cure rates over raw botanical extracts.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/1392",
        sample_query: "How does Section 3(d) apply to isolated botanical active compounds from Ayurvedic plants?",
        x: 140,
        y: 160,
        color: "#B45309" // Deep Amber
      },
      {
        id: "sec10_4",
        label: "Section 10(4)(d)(ii) — Origin & Biological Source Disclosure",
        shortLabel: "Sec 10(4) Origin Disclosure",
        lobe: "ip_patents",
        statutory_basis: "The Patents Act, 1970 § 10(4)(d)(ii) & Patents Rules, 2003",
        authority: "Patent Office & National Biodiversity Authority",
        jurisdiction: "India",
        description: "Mandatory statutory duty to fully disclose the source and geographical origin of any biological material used in the invention within the complete patent specification.",
        legal_standard: "Zero-Concealment Mandate. Non-disclosure or wrongful declaration is a direct ground for pre-grant opposition, post-grant opposition, and full patent revocation.",
        key_implication: "Failure to declare Indian harvest origin renders the patent permanently vulnerable to revocation under Section 64(1)(p).",
        safe_harbor: "Include GPS coordinate harvesting certificates, state biodiversity clearance references, and NBA Form III approval numbers in the complete specification.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/1392",
        sample_query: "Do I have to disclose the source and geographical origin of an Indian medicinal plant in my patent application?",
        x: 210,
        y: 360,
        color: "#D97706"
      },
      {
        id: "sec2_1j",
        label: "Section 2(1)(j) — Novel Process & Extraction Technologies",
        shortLabel: "Sec 2(1)(j) Process Patents",
        lobe: "ip_patents",
        statutory_basis: "The Patents Act, 1970 § 2(1)(j) & § 2(1)(ja)",
        authority: "CGPDTM Patent Examination Guidelines (ASU Inventions)",
        jurisdiction: "India",
        description: "Enables patenting novel, non-obvious technological processes for extracting, purifying, or formulating bioactive constituents from Ayurvedic botanicals.",
        legal_standard: "Technical Novelty & Inventive Step: The process must employ non-classical extraction parameters (e.g. supercritical CO2, ultrasonic cavitation, specialized molecular sieves).",
        key_implication: "Allows inventors to protect unique pharmaceutical manufacturing processes even when raw herbs are public domain.",
        safe_harbor: "Claim the exact thermodynamic extraction curve, pressure parameters, and solvent recovery ratios without claiming the traditional herb itself.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/1392",
        sample_query: "Can a novel method of extracting bioactive withanolides from Ashwagandha get a process patent?",
        x: 110,
        y: 260,
        color: "#F59E0B" // Amber-500
      },
      {
        id: "sec25_opp",
        label: "Section 25 — Pre-Grant Opposition on TKDL Citations",
        shortLabel: "Sec 25 Prior Art Opposition",
        lobe: "ip_patents",
        statutory_basis: "The Patents Act, 1970 § 25(1)(k) & § 25(2)(k)",
        authority: "Third Parties, CSIR-TKDL & Competitors",
        jurisdiction: "India",
        description: "Allows any person or public institution to file opposition against a pending patent application on grounds of anticipation by traditional knowledge.",
        legal_standard: "CSIR-TKDL Defensive Shield: Over 200+ global and domestic biopiracy applications have been successfully struck down under this provision.",
        key_implication: "Competitors and regulatory agencies can halt your patent grant before issuance by citing classical Ayurvedic verses.",
        safe_harbor: "Conduct comprehensive pre-filing clearance across InPASS and TKDL database before drafting claims.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/1392",
        sample_query: "Can pre-grant opposition be filed against an Ayurvedic patent based on TKDL citations?",
        x: 290,
        y: 70,
        color: "#C2410C"
      },
      {
        id: "tm_sec9",
        label: "Trade Marks Act § 9(1)(b) — Generic Botanical Bar",
        shortLabel: "TM Sec 9 Generic Herb Bar",
        lobe: "ip_patents",
        statutory_basis: "Trade Marks Act, 1999 § 9(1)(b) & § 9(1)(c)",
        authority: "Trade Marks Registry (CGPDTM)",
        jurisdiction: "India",
        description: "Absolute ground for trademark refusal prohibiting registration of generic botanical names (e.g. 'Ashwagandha', 'Triphala', 'Chyawanprash') as proprietary trademarks.",
        legal_standard: "Publici Juris Principle: Classical herbal names belong to collective cultural heritage and cannot be monopolized by a single corporation.",
        key_implication: "Attempting to trademark pure herb names will result in immediate official examination objections.",
        safe_harbor: "Combine the herbal root with an arbitrary, fanciful, or coined prefix/suffix (e.g. 'Herbocare-Ashwa', 'TriphaMax').",
        external_url: "https://www.indiacode.nic.in/handle/123456789/1993",
        sample_query: "Can I trademark the word 'Triphala' for an Ayurvedic medicine brand?",
        x: 110,
        y: 380,
        color: "#D97706"
      },
      {
        id: "gi_act",
        label: "Geographical Indications Act — Regional Terroir",
        shortLabel: "GI Act Terroir Protection",
        lobe: "ip_patents",
        statutory_basis: "Geographical Indications of Goods Act, 1999 § 2(1)(e) & § 24",
        authority: "Geographical Indications Registry, Chennai",
        jurisdiction: "India",
        description: "Protects Ayurvedic herbs with unique chemical profiles attributable to specific geographical regions (e.g. Kashmir Saffron, Navara Rice, Malabar Pepper).",
        legal_standard: "Collective Producer Protection: Corporations cannot privately own a GI; rights are granted exclusively to regional associations and Authorized Users under Section 17.",
        key_implication: "Criminal penalties up to 3 years imprisonment and ₹2 Lakhs fine for fraudulent use of registered GI heritage marks.",
        safe_harbor: "Procure herbs from certified regional farmer cooperatives and register as an Authorized User with the GI Registry.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/1981",
        sample_query: "Can an Ayurvedic plant variety with unique regional terroir get Geographical Indication (GI) protection?",
        x: 270,
        y: 470,
        color: "#EAB308"
      },

      // LOBE 2: BIODIVERSITY, ABS & SOVEREIGNTY (Right Hemisphere)
      {
        id: "nba_form3",
        label: "NBA Form III — Mandatory Patent Clearance",
        shortLabel: "NBA Form III (Patent ABS)",
        lobe: "biodiversity_abs",
        statutory_basis: "Biological Diversity Act, 2002 § 6(1) & 2023 Amendments",
        authority: "National Biodiversity Authority (NBA), MoEFCC",
        jurisdiction: "India",
        description: "Mandates prior approval from the National Biodiversity Authority before filing or grant of any patent based on Indian biological resources or traditional knowledge.",
        legal_standard: "Pre-Grant Mandatory Approval: Under the 2023 Amendment, applications can be submitted to the Patent Office, but NBA Form III approval MUST be obtained prior to patent grant.",
        key_implication: "Patents granted without Form III are illegal, void ab initio, and subject to automatic revocation proceedings.",
        safe_harbor: "File NBA Form III concurrently with your provisional or complete patent specification via the NBA ABS e-filing portal.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/2046",
        sample_query: "What is the requirement under Section 6 of the Biological Diversity Act for filing a patent?",
        x: 640,
        y: 170,
        color: "#9333EA" // Purple
      },
      {
        id: "sbb_sec7",
        label: "SBB Section 7 — Domestic Commercial Intimation",
        shortLabel: "SBB Sec 7 Prior Intimation",
        lobe: "biodiversity_abs",
        statutory_basis: "Biological Diversity Act, 2002 § 7 & State Biodiversity Rules",
        authority: "State Biodiversity Boards (SBB)",
        jurisdiction: "India",
        description: "Indian companies and commercial manufacturers must give prior intimation to the concerned State Biodiversity Board before accessing biological resources for commercial utilization.",
        legal_standard: "Benefit Sharing Standard: Indian commercial entities must remit 0.1% to 0.5% of annual gross ex-factory sales to SBB and local BMCs under Section 21.",
        key_implication: "Manufacturing Ayurvedic products at commercial scale without SBB Form I intimation triggers severe monetary penalties.",
        safe_harbor: "Submit SBB Form I to the respective State Biodiversity Board and maintain traceable botanical procurement registers.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/2046",
        sample_query: "Does an Indian Ayurvedic drug company need to inform the State Biodiversity Board under Section 7?",
        x: 730,
        y: 250,
        color: "#A855F7" // Purple-500
      },
      {
        id: "nba_sec3",
        label: "Section 3 — Foreign Entity Biological Access Clearance",
        shortLabel: "NBA Sec 3 Foreign Access",
        lobe: "biodiversity_abs",
        statutory_basis: "Biological Diversity Act, 2002 § 3 & Rule 14",
        authority: "National Biodiversity Authority (NBA)",
        jurisdiction: "India",
        description: "Non-Indian citizens, foreign entities, and Indian companies with foreign shareholding or directors must obtain PRIOR NBA approval (Form I) before accessing any Indian biological resource.",
        legal_standard: "Strict Sovereign Gatekeeping: Zero access is permitted to foreign-controlled enterprises without an executed Access and Benefit Sharing (ABS) agreement.",
        key_implication: "MNCs and foreign joint ventures cannot collect, harvest, or research Indian medicinal plants without advance NBA clearance.",
        safe_harbor: "Formulate a formal ABS agreement with NBA, stipulating fair technology transfer and milestone benefit-sharing payments.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/2046",
        sample_query: "When does a foreign entity need NBA Form I approval to access Indian medicinal plants?",
        x: 810,
        y: 160,
        color: "#7E22CE"
      },
      {
        id: "bda_sec55",
        label: "Section 55 — Sanctions & 2023 Penalties Framework",
        shortLabel: "BDA Sec 55 Penal Sanctions",
        lobe: "biodiversity_abs",
        statutory_basis: "Biological Diversity (Amendment) Act, 2023 § 55 & § 55A",
        authority: "Adjudicating Officer & National Green Tribunal",
        jurisdiction: "India",
        description: "Establishes stringent monetary civil penalties and sanctions for unauthorized commercial exploitation of biological resources without NBA/SBB approval.",
        legal_standard: "Decriminalized Financial Liability: Replaced imprisonment with severe financial penalties ranging from ₹1 Lakh up to ₹50 Lakhs, plus continuing penalties up to ₹1 Crore.",
        key_implication: "Non-compliant pharmaceutical firms face heavy fiscal penalties and seizure of biological inventory.",
        safe_harbor: "Regularize biological resource supply chains through voluntary compliance and certified cultivation agreements.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/2046",
        sample_query: "What is the penalty for unauthorized commercial exploitation of bioresources without NBA approval?",
        x: 830,
        y: 260,
        color: "#6B21A8"
      },
      {
        id: "bda_vaid",
        label: "Section 7 Exemption — Local Vaids & Hakims Protection",
        shortLabel: "Vaid / Hakim SBB Exemption",
        lobe: "biodiversity_abs",
        statutory_basis: "Biological Diversity Act, 2002 § 7 Proviso & 2023 Amendment",
        authority: "Local Biodiversity Management Committees (BMCs)",
        jurisdiction: "India",
        description: "Express statutory exemption shielding local communities, traditional folk healers, vaids, and hakims practicing indigenous medicine from SBB prior intimation.",
        legal_standard: "Traditional Practice Exemption: Applies exclusively to bona fide individual traditional healers; does NOT exempt commercial corporate enterprises.",
        key_implication: "Protects traditional healthcare practitioners from bureaucratic interference while enforcing compliance on commercial brands.",
        safe_harbor: "Operate as a certified community practitioner providing personalized, non-mass-manufactured healthcare remedies.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/2046",
        sample_query: "What is the exemption for local vaids and hakims under the Biological Diversity Act?",
        x: 740,
        y: 350,
        color: "#9333EA"
      },
      {
        id: "nagoya",
        label: "Nagoya Protocol on ABS — Prior Informed Consent",
        shortLabel: "Nagoya Protocol (PIC / MAT)",
        lobe: "biodiversity_abs",
        statutory_basis: "Nagoya Protocol to the Convention on Biological Diversity (Articles 5 & 6)",
        authority: "UN Convention on Biological Diversity (CBD) & National Competent Authorities",
        jurisdiction: "International",
        description: "International treaty establishing transparent legal framework for the fair and equitable sharing of benefits arising out of the utilization of genetic resources.",
        legal_standard: "PIC & MAT Requirement: Cross-border transfer of Indian biological resources requires verified Prior Informed Consent and Mutually Agreed Terms.",
        key_implication: "Foreign patent offices require proof of Nagoya compliance before granting international biotechnology patent claims.",
        safe_harbor: "Execute standardized Material Transfer Agreements (MTA) authorized under Biological Diversity Act Sections 19-21.",
        external_url: "https://www.cbd.int/abs/",
        sample_query: "How does the Nagoya Protocol enforce Prior Informed Consent (PIC) for foreign botanical use?",
        x: 830,
        y: 380,
        color: "#581C87"
      },

      // LOBE 3: AYUSH REGULATORY & DRUG LICENSING (Central Limbic Stem)
      {
        id: "rule158b_a",
        label: "Rule 158B(A) — Classical ASU Medicines Pathway",
        shortLabel: "Rule 158B(A) Classical ASU",
        lobe: "ayush_licensing",
        statutory_basis: "Drugs & Cosmetics Rules, 1945 Rule 158B & First Schedule",
        authority: "State Ayush Licensing Authorities (SLA)",
        jurisdiction: "India",
        description: "Authorizes state manufacturing licenses (Form 24-D) for classical Ayurvedic medicines manufactured exactly in accordance with authoritative texts listed in the First Schedule.",
        legal_standard: "Textual Reference Standard: No clinical safety trials or pilot effectiveness trials required if adhering strictly to classical recipes and methods.",
        key_implication: "Accelerated licensing pathway for classical generic remedies (e.g. Triphala Churna, Chyawanprash, Yogaraj Guggulu).",
        safe_harbor: "Cite the specific classical book name, verse, and chapter from the 54 books in the First Schedule on the product label and master formula records.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/2414",
        sample_query: "What is the First Schedule of the Drugs and Cosmetics Act regarding authoritative texts?",
        x: 390,
        y: 380,
        color: "#059669" // Emerald
      },
      {
        id: "rule158b_c",
        label: "Rule 158B(C) — Patent & Proprietary (P&P) Evidence",
        shortLabel: "Rule 158B(C) P&P Trials",
        lobe: "ayush_licensing",
        statutory_basis: "Drugs & Cosmetics Rules, 1945 Rule 158B(Category C)",
        authority: "State Ayush Licensing Authority & CDSCO",
        jurisdiction: "India",
        description: "Mandates safety and pilot effectiveness documentation for non-classical Ayurvedic formulations, proprietary herbal blends, and aqueous plant extracts.",
        legal_standard: "Safety Documentation Mandate: Requires acute oral toxicity studies in animal models and published scientific literature proving safety and effectiveness.",
        key_implication: "Altering classical herbal ratios or creating new polyherbal blends triggers mandatory Category C testing.",
        safe_harbor: "Submit GLP-certified acute oral toxicity reports and double-blind clinical effectiveness data to the State Licensing Authority.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/2414",
        sample_query: "What are the licensing requirements under Rule 158B for patent and proprietary Ayurvedic medicine?",
        x: 560,
        y: 380,
        color: "#10B981"
      },
      {
        id: "sched_t",
        label: "Schedule T — Good Manufacturing Practices (GMP)",
        shortLabel: "Schedule T ASU GMP",
        lobe: "ayush_licensing",
        statutory_basis: "Drugs & Cosmetics Rules, 1945 Schedule T & Part XVI",
        authority: "State Drug Inspectors & Central Ayush Quality Cell",
        jurisdiction: "India",
        description: "Mandates factory layout, hygienic manufacturing conditions, batch processing standards, and in-house quality control testing for all Ayurvedic facilities.",
        legal_standard: "API Pharmacopoeial Standard: Requires batch-wise testing for heavy metals (lead, arsenic, cadmium, mercury), pesticide residues, microbial load, and aflatoxins.",
        key_implication: "Operating without Schedule T GMP compliance results in license suspension and immediate factory seal.",
        safe_harbor: "Establish an accredited QC lab, validate clean-in-place sanitization protocols, and maintain standard Batch Manufacturing Records (BMR).",
        external_url: "https://www.indiacode.nic.in/handle/123456789/2414",
        sample_query: "What is Schedule T under the Drugs and Cosmetics Rules for Ayurvedic manufacturing?",
        x: 475,
        y: 440,
        color: "#047857"
      },
      {
        id: "rule161",
        label: "Rule 161 — Mandatory Labeling & Expiry Dates",
        shortLabel: "Rule 161 Label & Expiry",
        lobe: "ayush_licensing",
        statutory_basis: "Drugs & Cosmetics Rules, 1945 Rule 161 & Gazette Notifications",
        authority: "State Ayush Authorities & Drug Inspectors",
        jurisdiction: "India",
        description: "Governs mandatory labeling requirements including complete ingredient lists, manufacturing license numbers, batch codes, and statutory shelf-life/expiry dates.",
        legal_standard: "Mandatory Shelf-Life Standard: All ASU medicines must display valid expiry dates based on stability studies (tablets: 3-5 years, churnas: 2 years, asavas: 10+ years).",
        key_implication: "Products lacking statutory shelf-life declarations are deemed misbranded under Section 33E.",
        safe_harbor: "Conduct real-time and accelerated stability testing per ICH guidelines and display the full botanical ingredient list on packaging.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/2414",
        sample_query: "Is shelf-life or expiry date mandatory on Ayurvedic medicine labels under Rule 161?",
        x: 370,
        y: 490,
        color: "#065F46"
      },
      {
        id: "sec33eea",
        label: "Section 33EEA — Anti-Adulteration & Pure ASU Integrity",
        shortLabel: "Sec 33EEA Adulteration Bar",
        lobe: "ayush_licensing",
        statutory_basis: "Drugs & Cosmetics Act, 1940 § 33EEA & § 33-I",
        authority: "Central and State Drug Control Agencies",
        jurisdiction: "India",
        description: "Statutory bar declaring any Ayurvedic drug adulterated if it contains synthetic allopathic active ingredients (e.g. steroids, sildenafil, NSAIDs) or toxic contaminants.",
        legal_standard: "Zero Synthetic Adulteration Mandate: Any presence of allopathic APIs converts the drug into an adulterated substance with mandatory criminal prosecution.",
        key_implication: "Carries criminal imprisonment up to 3 years and immediate cancellation of manufacturing licenses.",
        safe_harbor: "Implement mandatory HPLC/LC-MS screening of all raw botanicals to certify total absence of synthetic adulterants.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/2414",
        sample_query: "What constitutes an adulterated Ayurvedic drug under Section 33EEA?",
        x: 580,
        y: 490,
        color: "#0F766E"
      },

      // LOBE 4: AYURVEDA AAHAR & COSMETICS (Lower Frontier)
      {
        id: "cosmetic_3aaa",
        label: "Section 3(aaa) — Ayurvedic Cosmetics (Form 32-A)",
        shortLabel: "Sec 3(aaa) Cosmetic Form 32-A",
        lobe: "ayurveda_aahar",
        statutory_basis: "Drugs & Cosmetics Act, 1940 § 3(aaa) & Form 32-A",
        authority: "State Licensing Authority & Schedule S Standards",
        jurisdiction: "India",
        description: "Regulates Ayurvedic herbal cosmetics (hair oils, shampoos, face washes, skin creams) intended for cleansing, beautifying, and conditioning.",
        legal_standard: "Beautification Standard: Cosmetics CANNOT claim to cure or treat medical diseases (e.g. preventing hair fall is cosmetic; curing alopecia or baldness is a drug).",
        key_implication: "Adding curative medical claims converts the product into an Ayurvedic drug requiring full Rule 158B licensing.",
        safe_harbor: "Restrict claims to cosmetic beautification and obtain a Form 32-A cosmetic manufacturing license.",
        external_url: "https://www.indiacode.nic.in/handle/123456789/2414",
        sample_query: "Can an Ayurvedic herbal hair oil claim to prevent baldness or is it classified as a drug?",
        x: 475,
        y: 530,
        color: "#E11D48" // Rose-600
      },
      {
        id: "fssai_aahar",
        label: "FSSAI Ayurveda Aahar Regulations 2022 — Dietary Food",
        shortLabel: "FSSAI Ayurveda Aahar (2022)",
        lobe: "ayurveda_aahar",
        statutory_basis: "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022",
        authority: "FSSAI & Ministry of Ayush",
        jurisdiction: "India",
        description: "Comprehensive regulatory framework for foods prepared in accordance with classical Ayurvedic authoritative texts, regulated as food supplements.",
        legal_standard: "Zero Synthetic Fortification Standard: Addition of synthetic vitamins, minerals, amino acids, or hormones is strictly prohibited.",
        key_implication: "Products must prominently display the Ayurveda Aahar logo and the mandatory disclaimer: 'NOT FOR MEDICINAL USE'.",
        safe_harbor: "Use only codified botanical ingredients from authoritative texts and secure an FSSAI Central/State License on the FoSCoS portal.",
        external_url: "https://www.fssai.gov.in",
        sample_query: "Which authority regulates Ayurveda Aahar products in India?",
        x: 690,
        y: 470,
        color: "#F43F5E" // Rose-500
      },

      // LOBE 5: DEFENSIVE TREATIES & GLOBAL PRIOR ART (Top Apex)
      {
        id: "tkdl",
        label: "TKDL — Defensive Prior Art Database (360k+ Records)",
        shortLabel: "TKDL Prior-Art Shield",
        lobe: "defensive_treaties",
        statutory_basis: "CSIR & Ministry of Ayush Defensive Publication Trust",
        authority: "Council of Scientific and Industrial Research (CSIR)",
        jurisdiction: "International",
        description: "India's pioneering digital repository containing 360,000+ classical formulations translated into English, German, French, Japanese, and Spanish.",
        legal_standard: "Global Biopiracy Defense: Shared under non-disclosure access agreements with 13 major international patent offices (USPTO, EPO, JPO).",
        key_implication: "Patent examiners query TKDL to automatically reject non-novel Ayurvedic patent filings worldwide.",
        safe_harbor: "Conduct defensive clearance on tkdl.res.in to ensure your claimed formulation contains technological features absent from TKDL prior art.",
        external_url: "https://www.tkdl.res.in",
        sample_query: "What is the role of TKDL in preventing international biopiracy?",
        x: 475,
        y: 100,
        color: "#2563EB" // Blue
      },
      {
        id: "wipo_gratk",
        label: "WIPO GRATK Treaty (May 2024) — Mandatory Origin Disclosure",
        shortLabel: "WIPO GRATK Treaty 2024",
        lobe: "defensive_treaties",
        statutory_basis: "WIPO Treaty on IP, Genetic Resources and Associated Traditional Knowledge (2024)",
        authority: "World Intellectual Property Organization (WIPO)",
        jurisdiction: "International",
        description: "Historic multilateral treaty establishing mandatory disclosure requirements in patent applications based on genetic resources and associated traditional knowledge.",
        legal_standard: "Global Transparency Standard: All contracting patent offices worldwide must compel applicants to disclose country of origin for plant resources.",
        key_implication: "Globalizes India's Section 10(4) disclosure requirement across the US, Europe, and Asian patent systems.",
        safe_harbor: "Explicitly declare the country of origin and indigenous knowledge providers in international PCT patent applications.",
        external_url: "https://www.wipo.int/meetings/en/details.jsp?meeting_id=82348",
        sample_query: "What are the patent disclosure requirements under the new WIPO GRATK Treaty adopted in May 2024?",
        x: 650,
        y: 80,
        color: "#0D9488" // Teal
      },

      // LOBE 6: PHYTOMARKERS & CLINICAL FRONTIER (Top Prefrontal Apex)
      {
        id: "phytopharm_122e",
        label: "Rule 122E — Phytopharmaceutical Drugs (≥4 Markers)",
        shortLabel: "Rule 122E Phytopharmaceuticals",
        lobe: "phytopharmaceutical",
        statutory_basis: "Drugs & Cosmetics Rules, 1945 Rule 122E & CDSCO IND Guidelines",
        authority: "Central Drugs Standard Control Organisation (CDSCO)",
        jurisdiction: "India",
        description: "Regulates purified and standardized fractions of medicinal plant extracts containing a minimum of 4 characterized marker compounds as modern botanical drugs.",
        legal_standard: "Modern Clinical Drug Standard: Requires Investigational New Drug (IND) clearance, preclinical toxicology, and Phase I, II, and III clinical trials.",
        key_implication: "Regulated as modern drugs by CDSCO rather than traditional Ayurvedic formulations by State Ayush.",
        safe_harbor: "Submit Form CT-04 to CDSCO with comprehensive HPLC/LC-MS fingerprinting and multi-center clinical efficacy dossiers.",
        external_url: "https://cdsco.gov.in",
        sample_query: "Can a purified standardized fraction of an Ayurvedic plant with 4 marker compounds be patented?",
        x: 475,
        y: 20,
        color: "#7C3AED" // Violet-600
      }
    ],
    []
  );

  // -------------------------------------------------------------
  // 36 STATUTORY SYNAPTIC CONNECTIONS (Inter-Doctrine Corridors)
  // -------------------------------------------------------------
  const edges: RegulatoryEdge[] = useMemo(
    () => [
      // Core IP to Prior Art
      { from: "sec3p", to: "tkdl", relation: "Prior Art Defense", type: "restricts" },
      { from: "sec3p", to: "sec3e", relation: "Synergy Requirement", type: "mandates" },
      { from: "sec3p", to: "sec3d", relation: "Efficacy Standard", type: "mandates" },
      { from: "sec3p", to: "rule158b_a", relation: "Classical Text Route", type: "clears" },
      { from: "sec3e", to: "rule158b_c", relation: "Proprietary Evidence", type: "mandates" },
      { from: "sec3d", to: "phytopharm_122e", relation: "Marker Efficacy", type: "clears" },
      { from: "sec2_1j", to: "sec3p", relation: "Process Exemption", type: "clears" },
      { from: "sec25_opp", to: "tkdl", relation: "Defensive Citation", type: "restricts" },
      { from: "sec25_opp", to: "sec3p", relation: "Opposition Grounds", type: "restricts" },

      // IP to Biodiversity & ABS
      { from: "sec3p", to: "nba_form3", relation: "Patent Biological Gate", type: "mandates" },
      { from: "sec3e", to: "nba_form3", relation: "Mandatory Form III", type: "mandates" },
      { from: "sec10_4", to: "nba_form3", relation: "Origin Clearance", type: "mandates" },
      { from: "sec10_4", to: "wipo_gratk", relation: "Global Origin Standard", type: "cross_examines" },
      { from: "nba_form3", to: "wipo_gratk", relation: "Treaty Alignment", type: "clears" },
      { from: "nba_form3", to: "bda_sec55", relation: "Non-Compliance Sanctions", type: "restricts" },
      { from: "nba_sec3", to: "nba_form3", relation: "Foreign IP Route", type: "mandates" },
      { from: "sbb_sec7", to: "bda_sec55", relation: "Penalty Enforcement", type: "restricts" },
      { from: "sbb_sec7", to: "bda_vaid", relation: "Vaid Exemption", type: "clears" },
      { from: "nagoya", to: "nba_sec3", relation: "PIC Verification", type: "mandates" },

      // Licensing to IP & Quality
      { from: "rule158b_a", to: "sched_t", relation: "GMP Compliance", type: "mandates" },
      { from: "rule158b_c", to: "sched_t", relation: "GMP Compliance", type: "mandates" },
      { from: "rule158b_a", to: "rule161", relation: "Labeling Standard", type: "mandates" },
      { from: "rule158b_c", to: "rule161", relation: "Shelf-Life Data", type: "mandates" },
      { from: "sched_t", to: "sec33eea", relation: "Purity & Integrity", type: "mandates" },
      { from: "rule158b_a", to: "sbb_sec7", relation: "Commercial Intimation", type: "mandates" },
      { from: "rule158b_c", to: "sbb_sec7", relation: "Commercial Intimation", type: "mandates" },

      // Trademarks & GI
      { from: "tm_sec9", to: "sec3p", relation: "Generic Public Domain", type: "restricts" },
      { from: "gi_act", to: "sec10_4", relation: "Geographic Traceability", type: "clears" },
      { from: "gi_act", to: "tm_sec9", relation: "Collective Exception", type: "clears" },

      // Food & Cosmetics
      { from: "cosmetic_3aaa", to: "rule158b_a", relation: "Curative Distinction", type: "cross_examines" },
      { from: "cosmetic_3aaa", to: "sched_t", relation: "Schedule S / T", type: "mandates" },
      { from: "fssai_aahar", to: "rule158b_a", relation: "Classical Text Basis", type: "cross_examines" },
      { from: "fssai_aahar", to: "rule161", relation: "Non-Medicinal Disclaimer", type: "mandates" },
      { from: "fssai_aahar", to: "sec33eea", relation: "Zero Synthetic Standard", type: "mandates" },

      // Phytopharmaceuticals
      { from: "phytopharm_122e", to: "sec3d", relation: "Efficacy Superiority", type: "mandates" },
      { from: "phytopharm_122e", to: "sec2_1j", relation: "Extraction Isolation", type: "clears" }
    ],
    []
  );

  // -------------------------------------------------------------
  // FORMULATION CLEARANCE SIMULATION SCENARIOS
  // -------------------------------------------------------------
  const scenarios: SimulationScenario[] = [
    {
      id: "polyherbal_patent",
      name: "Polyherbal Ashwagandha + Curcumin Extract",
      product_type: "Therapeutic IP Application",
      description: "Applicant seeks to patent a polyherbal combination of Ashwagandha and Curcumin for synergistic anti-inflammatory joint therapy.",
      active_nodes: ["sec3p", "sec3e", "nba_form3", "sec10_4", "rule158b_c", "tkdl"],
      safe_nodes: ["rule158b_c"],
      warning_nodes: ["nba_form3", "sec10_4"],
      barrier_nodes: ["sec3p", "sec3e", "tkdl"],
      clearance_summary: "High statutory rejection risk under Section 3(p) and 3(e). Both herbs are classical TKDL prior art. Must submit validated Chou-Talalay synergy proof (CI < 1.0) and secure NBA Form III.",
      recommended_strategy: "Pivot to a novel nanocarrier/liposomal delivery system or novel extraction process under Section 2(1)(j) to bypass Section 3(p) prior art objections."
    },
    {
      id: "classical_triphala",
      name: "Classical Triphala Churna as per Charaka Samhita",
      product_type: "Classical Generic ASU Drug",
      description: "Commercial manufacturing of Triphala Churna (equal parts Amalaki, Haritaki, Bibhitaki) exactly conforming to Charaka Samhita formulas.",
      active_nodes: ["rule158b_a", "sched_t", "rule161", "sbb_sec7", "sec3p", "tm_sec9"],
      safe_nodes: ["rule158b_a", "sched_t", "rule161"],
      warning_nodes: ["sbb_sec7"],
      barrier_nodes: ["sec3p", "tm_sec9"],
      clearance_summary: "100% cleared for commercial manufacturing under Rule 158B Category A without clinical trials. Unpatentable under Section 3(p) and un-trademarkable under TM Sec 9(1)(b).",
      recommended_strategy: "Obtain Form 24-D manufacturing license citing Charaka Samhita, ensure Schedule T GMP compliance, file SBB Form I, and market under a coined composite brand name."
    },
    {
      id: "ayurveda_aahar_tea",
      name: "Herbal Green Tea with Tulsi & Ginger (Ayurveda Aahar)",
      product_type: "Nutraceutical Food Preparation",
      description: "Dietary wellness infusion packaged as herbal tea claiming digestive support and immunity nourishment under FSSAI regulations.",
      active_nodes: ["fssai_aahar", "rule161", "sec33eea", "sbb_sec7"],
      safe_nodes: ["fssai_aahar", "sbb_sec7"],
      warning_nodes: ["rule161"],
      barrier_nodes: ["sec33eea"],
      clearance_summary: "Approved under FSSAI Ayurveda Aahar Regulations 2022. Must display 'NOT FOR MEDICINAL USE'. Strictly prohibited from making disease-cure or therapeutic treatment claims.",
      recommended_strategy: "Procure FSSAI Ayurveda Aahar central license via FoSCoS portal, verify absence of synthetic vitamins, and use structure-function wellness claims only."
    },
    {
      id: "herbal_cosmetic",
      name: "Ayurvedic Herbal Hair Oil (Form 32-A)",
      product_type: "Ayurvedic Cosmetic",
      description: "Polyherbal hair conditioning oil formulated with Bhringraj, Amla, and Coconut Oil manufactured under State Licensing Authority cosmetic license.",
      active_nodes: ["cosmetic_3aaa", "sched_t", "rule161", "tm_sec9"],
      safe_nodes: ["cosmetic_3aaa", "sched_t"],
      warning_nodes: ["rule161"],
      barrier_nodes: [],
      clearance_summary: "Fully permitted under Section 3(aaa) via Form 32-A. Must not claim to cure baldness or alopecia. Brand name must not be purely descriptive.",
      recommended_strategy: "File Form 32-A with State Licensing Authority, maintain Schedule S heavy metal limits, and use cosmetic claims (e.g. 'hair nourishment and shine')."
    },
    {
      id: "phytopharm_curcumin",
      name: "Purified 95% Curcumin Fraction (Rule 122E)",
      product_type: "Phytopharmaceutical Modern Botanical Drug",
      description: "Enriched botanical extract containing 4 characterized curcuminoid marker compounds developed for clinical oncological adjuvants.",
      active_nodes: ["phytopharm_122e", "sec3d", "sec2_1j", "nba_form3", "sec10_4"],
      safe_nodes: ["sec2_1j", "phytopharm_122e"],
      warning_nodes: ["sec3d", "nba_form3", "sec10_4"],
      barrier_nodes: [],
      clearance_summary: "High-value patentable botanical drug. Regulated by CDSCO under Rule 122E. Requires IND filing, preclinical toxicology, and Phase I-III clinical trial data.",
      recommended_strategy: "File Form CT-04 with CDSCO for clinical trials, secure NBA Form III clearance before patent grant, and establish fingerprint reproducibility across 3 batches."
    }
  ];

  // -------------------------------------------------------------
  // FILTERING & ACTIVE SELECTION LOGIC
  // -------------------------------------------------------------
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchesLobe = activeLobe === "all" || n.lobe === activeLobe;
      const matchesSearch =
        searchQuery.trim() === "" ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.statutory_basis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.shortLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLobe && matchesSearch;
    });
  }, [nodes, activeLobe, searchQuery]);

  const activeNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  const activeScenario = useMemo(() => {
    return scenarios.find((s) => s.id === activeScenarioId) || null;
  }, [scenarios, activeScenarioId]);

  // Connected nodes for the inspector
  const connectedNodes = useMemo(() => {
    const connectedIds = new Set<string>();
    edges.forEach((e) => {
      if (e.from === activeNode.id) connectedIds.add(e.to);
      if (e.to === activeNode.id) connectedIds.add(e.from);
    });
    return nodes.filter((n) => connectedIds.has(n.id));
  }, [nodes, edges, activeNode.id]);

  const handleCopyCitation = () => {
    const text = `${activeNode.label} — ${activeNode.statutory_basis} (${activeNode.authority})`;
    navigator.clipboard.writeText(text);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleLaunchQuery = (q: string) => {
    if (onQuerySelect) {
      onQuerySelect(q);
    } else {
      navigate(`/ask?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="bg-white dark:bg-forest-900/80 rounded-3xl border border-amber-500/30 dark:border-forest-700/80 p-5 sm:p-7 shadow-elevated-luxury space-y-6 backdrop-blur-xl">
      {/* 1. SUPER BRAIN HEADER & STATUS HUD */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-parchment-200/80 dark:border-forest-800/80">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 text-forest-950 dark:text-amber-300 text-xs font-bold border border-amber-500/30 shadow-sm">
            <Brain className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="font-display tracking-wide">IP-SAKTI Regulatory Neural Super Brain</span>
            <span className="px-1.5 py-0.2 bg-amber-500/30 rounded text-[10px] uppercase font-mono">v2.5 Cortex</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-light text-forest-950 dark:text-parchment-50 tracking-tight">
            Ayurvedic Legal Neural Architecture
          </h3>
          <p className="text-xs sm:text-sm text-forest-900/70 dark:text-parchment-300/80 leading-relaxed max-w-2xl">
            Interactive multi-lobe statutory neural network mapping the complete legal landscape across Patents, Traditional Knowledge, Biodiversity ABS, AYUSH Drug Licensing, and Global Treaties.
          </p>
        </div>

        {/* Live Metrics HUD */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-parchment-100 dark:bg-forest-950 border border-parchment-200 dark:border-forest-800 flex items-center space-x-1.5 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-forest-950 dark:text-parchment-100 font-bold">24</span>
            <span className="text-forest-900/60 dark:text-parchment-400">Nodes</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-parchment-100 dark:bg-forest-950 border border-parchment-200 dark:border-forest-800 flex items-center space-x-1.5 font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-forest-950 dark:text-parchment-100 font-bold">36</span>
            <span className="text-forest-900/60 dark:text-parchment-400">Synapses</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-parchment-100 dark:bg-forest-950 border border-parchment-200 dark:border-forest-800 flex items-center space-x-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-forest-950 dark:text-parchment-100 font-bold">100%</span>
            <span className="text-forest-900/60 dark:text-parchment-400">Grounded</span>
          </div>
        </div>
      </div>

      {/* 2. SUPER BRAIN INTERACTIVE CONTROLS: LOBES & SCENARIOS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        {/* Lobe Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {[
            { id: "all", label: "All Lobes", count: 24, icon: Globe },
            { id: "ip_patents", label: "IP & Patents", count: 8, icon: Scale },
            { id: "biodiversity_abs", label: "Biodiversity & ABS", count: 6, icon: Leaf },
            { id: "ayush_licensing", label: "AYUSH Licensing", count: 5, icon: Building2 },
            { id: "ayurveda_aahar", label: "Ayurveda Aahar", count: 2, icon: Utensils },
            { id: "defensive_treaties", label: "Global Treaties", count: 2, icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeLobe === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveLobe(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all border ${
                  isTabActive
                    ? "bg-forest-900 text-white dark:bg-amber-400 dark:text-forest-950 border-forest-900 dark:border-amber-400 shadow-sm"
                    : "bg-parchment-50 dark:bg-forest-950/80 text-forest-900 dark:text-parchment-200 border-parchment-200 dark:border-forest-800 hover:border-amber-500/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isTabActive
                      ? "bg-white/20 text-white dark:text-forest-950"
                      : "bg-parchment-200 dark:bg-forest-800 text-forest-900 dark:text-parchment-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-amber-600 dark:text-amber-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search neuron by statute or keyword..."
            className="w-full bg-parchment-50 dark:bg-forest-950 border border-parchment-200 dark:border-forest-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-forest-950 dark:text-parchment-50 placeholder:text-forest-900/40 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
      </div>

      {/* 3. SIMULATION HIGH-TECH SCENARIO SELECTOR */}
      <div className="bg-parchment-100/70 dark:bg-forest-950/70 p-3.5 sm:p-4 rounded-2xl border border-amber-500/20 dark:border-forest-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div>
            <span className="font-display font-bold text-forest-950 dark:text-parchment-100">
              Run Super Brain Pathway Simulation:
            </span>
            <span className="text-forest-900/60 dark:text-parchment-400 ml-1.5 hidden sm:inline">
              Trace statutory clearance flow for commercial formulations
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={activeScenarioId}
            onChange={(e) => setActiveScenarioId(e.target.value)}
            className="w-full sm:w-auto bg-white dark:bg-forest-900 border border-parchment-300 dark:border-forest-700 text-xs font-semibold rounded-xl px-3 py-1.5 text-forest-950 dark:text-parchment-50 focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
          >
            <option value="none">Exploration Mode (All Neurons Active)</option>
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                Simulate: {sc.name}
              </option>
            ))}
          </select>

          {activeScenarioId !== "none" && (
            <button
              onClick={() => setActiveScenarioId("none")}
              title="Reset Simulation"
              className="p-1.5 rounded-xl border border-parchment-300 dark:border-forest-700 text-forest-900 dark:text-parchment-300 hover:bg-parchment-200 dark:hover:bg-forest-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. ACTIVE SIMULATION SUMMARY BANNER (When scenario selected) */}
      {activeScenario && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between font-bold">
            <div className="flex items-center space-x-2 text-forest-950 dark:text-amber-300">
              <Compass className="w-4 h-4 text-amber-500" />
              <span className="font-display text-sm">{activeScenario.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-parchment-200 dark:bg-forest-800 text-[10px] uppercase font-mono">
                {activeScenario.product_type}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{activeScenario.safe_nodes.length} Safe</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{activeScenario.warning_nodes.length} Clearance Gates</span>
              </span>
              <span className="flex items-center space-x-1 text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{activeScenario.barrier_nodes.length} Barriers</span>
              </span>
            </div>
          </div>
          <p className="text-forest-900/80 dark:text-parchment-200 leading-relaxed font-sans">
            <strong>Clearance Determination:</strong> {activeScenario.clearance_summary}
          </p>
          <p className="text-forest-900/90 dark:text-parchment-100 leading-relaxed font-sans">
            <strong className="text-amber-700 dark:text-amber-400">Strategic Compliance Pathway:</strong> {activeScenario.recommended_strategy}
          </p>
        </div>
      )}

      {/* 5. DUAL-PANE NEURAL CANVAS + STATUTORY INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Interactive Neural Canvas */}
        <div className="lg:col-span-7 bg-parchment-50/80 dark:bg-forest-950 rounded-3xl border border-parchment-200 dark:border-forest-800 p-3 sm:p-5 relative min-h-[460px] flex items-center justify-center overflow-hidden shadow-inner">
          {/* Canvas Floating Tools */}
          <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5 bg-white/90 dark:bg-forest-900/90 p-1.5 rounded-xl border border-parchment-200 dark:border-forest-800 shadow-sm backdrop-blur-md text-xs">
            <button
              onClick={() => setAnimateSynapses(!animateSynapses)}
              className={`p-1.5 rounded-lg border transition-all ${
                animateSynapses
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300"
                  : "border-transparent text-forest-900/60 dark:text-parchment-400"
              }`}
              title="Toggle Live Synaptic Current Animation"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 1.4))}
              className="p-1.5 rounded-lg hover:bg-parchment-200 dark:hover:bg-forest-800 text-forest-900 dark:text-parchment-200 font-mono font-bold"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.8))}
              className="p-1.5 rounded-lg hover:bg-parchment-200 dark:hover:bg-forest-800 text-forest-900 dark:text-parchment-200 font-mono font-bold"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg hover:bg-parchment-200 dark:hover:bg-forest-800 text-forest-900 dark:text-parchment-200 font-mono"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* SVG Neural Mesh */}
          <svg
            viewBox="0 0 950 580"
            className="w-full h-full max-h-[500px] select-none transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <defs>
              {/* Electric Synaptic Keyframe Animation */}
              <style>{`
                @keyframes neuralCurrent {
                  from { stroke-dashoffset: 24; }
                  to { stroke-dashoffset: 0; }
                }
                @keyframes gyroSpinSlow {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes gyroSpinReverse {
                  from { transform: rotate(360deg); }
                  to { transform: rotate(0deg); }
                }
                @keyframes corePulse {
                  0%, 100% { transform: scale(1); opacity: 0.85; }
                  50% { transform: scale(1.06); opacity: 1; }
                }
                .synapse-active {
                  stroke-dasharray: 6 6;
                  animation: neuralCurrent 1.5s linear infinite;
                }
                .gyro-slow {
                  transform-origin: 475px 280px;
                  animation: gyroSpinSlow 30s linear infinite;
                }
                .gyro-reverse {
                  transform-origin: 475px 280px;
                  animation: gyroSpinReverse 20s linear infinite;
                }
                .core-glow {
                  transform-origin: 475px 280px;
                  animation: corePulse 3s ease-in-out infinite;
                }
              `}</style>

              {/* Gradients */}
              <linearGradient id="neuralCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D97706" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#059669" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0A1C16" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="synapseDormant" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C5A880" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="superGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Hemisphere Watermarks */}
            <text x="180" y="550" fill="currentColor" className="text-xs font-mono fill-forest-900/10 dark:fill-parchment-100/10 select-none pointer-events-none">
              [ LEFT HEMISPHERE: INTELLECTUAL PROPERTY & PATENTS ]
            </text>
            <text x="590" y="550" fill="currentColor" className="text-xs font-mono fill-forest-900/10 dark:fill-parchment-100/10 select-none pointer-events-none">
              [ RIGHT HEMISPHERE: BIODIVERSITY & ABS ]
            </text>

            {/* SYNAPTIC CONNECTIONS (EDGES) */}
            {edges.map((e, idx) => {
              const start = nodes.find((n) => n.id === e.from);
              const end = nodes.find((n) => n.id === e.to);
              if (!start || !end) return null;

              // Visibility check against lobe filter
              const isStartVisible = activeLobe === "all" || start.lobe === activeLobe;
              const isEndVisible = activeLobe === "all" || end.lobe === activeLobe;
              if (!isStartVisible && !isEndVisible) return null;

              // Selection / Hover Highlight
              const isHighlighted =
                selectedNodeId === e.from ||
                selectedNodeId === e.to ||
                hoveredNodeId === e.from ||
                hoveredNodeId === e.to;

              // Simulation Scenario Path Highlight
              let scenarioColor: string | null = null;
              if (activeScenario) {
                const inScenario =
                  activeScenario.active_nodes.includes(e.from) &&
                  activeScenario.active_nodes.includes(e.to);
                if (inScenario) {
                  if (activeScenario.barrier_nodes.includes(e.from) || activeScenario.barrier_nodes.includes(e.to)) {
                    scenarioColor = "#EF4444"; // Red barrier
                  } else if (activeScenario.warning_nodes.includes(e.from) || activeScenario.warning_nodes.includes(e.to)) {
                    scenarioColor = "#F59E0B"; // Amber clearance gate
                  } else {
                    scenarioColor = "#10B981"; // Emerald safe path
                  }
                }
              }

              const strokeColor = scenarioColor || (isHighlighted ? "#10B981" : "url(#synapseDormant)");
              const strokeWidth = scenarioColor ? "3.5" : isHighlighted ? "2.8" : "1.2";

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className={`transition-all duration-300 ${
                      animateSynapses && (isHighlighted || scenarioColor) ? "synapse-active" : ""
                    }`}
                  />
                  {/* Subtle relation label on highlighted synapse */}
                  {isHighlighted && (
                    <text
                      x={(start.x + end.x) / 2}
                      y={(start.y + end.y) / 2 - 4}
                      textAnchor="middle"
                      fill="#10B981"
                      className="text-[9px] font-mono font-bold select-none pointer-events-none drop-shadow-sm"
                    >
                      {e.relation}
                    </text>
                  )}
                </g>
              );
            })}

            {/* CENTRAL SUPER BRAIN NEURAL CORTEX (Holographic Gyro) */}
            <g className="cursor-pointer" onClick={() => setSelectedNodeId("sec3p")}>
              {/* Outer Pulsing Aura */}
              <circle
                cx="475"
                cy="280"
                r="56"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="1"
                strokeDasharray="4 8"
                className="gyro-slow opacity-60"
              />
              <circle
                cx="475"
                cy="280"
                r="44"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                className="gyro-reverse opacity-70"
              />
              {/* Neural Cortex Core */}
              <circle
                cx="475"
                cy="280"
                r="32"
                fill="url(#neuralCoreGrad)"
                stroke="#FAF8F3"
                strokeWidth="2.5"
                filter="url(#superGlow)"
                className="core-glow"
              />
              <Brain className="w-6 h-6 text-white" />
              <text
                x="475"
                y="276"
                textAnchor="middle"
                fill="#FAF8F3"
                fontSize="8"
                fontFamily="Cinzel, serif"
                fontWeight="bold"
                letterSpacing="1.5"
                className="select-none pointer-events-none"
              >
                IP-SAKTI
              </text>
              <text
                x="475"
                y="288"
                textAnchor="middle"
                fill="#D4AF37"
                fontSize="7"
                fontFamily="monospace"
                fontWeight="bold"
                letterSpacing="1"
                className="select-none pointer-events-none"
              >
                CORTEX
              </text>
            </g>

            {/* STATUTORY NEURAL NODES (24 Neurons) */}
            {filteredNodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const isHovered = node.id === hoveredNodeId;

              // Simulation State
              let simulationState: "barrier" | "warning" | "safe" | null = null;
              if (activeScenario) {
                if (activeScenario.barrier_nodes.includes(node.id)) simulationState = "barrier";
                else if (activeScenario.warning_nodes.includes(node.id)) simulationState = "warning";
                else if (activeScenario.safe_nodes.includes(node.id)) simulationState = "safe";
              }

              // Node radius & styling
              const radius = isSelected ? 22 : isHovered ? 19 : 16;
              const borderColor =
                simulationState === "barrier"
                  ? "#EF4444"
                  : simulationState === "warning"
                  ? "#F59E0B"
                  : simulationState === "safe"
                  ? "#10B981"
                  : node.color;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer group"
                  transform={`translate(${node.x}, ${node.y})`}
                >
                  {/* Outer Scenario Pulse Ring */}
                  {simulationState && (
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke={borderColor}
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="animate-spin"
                      style={{ animationDuration: "6s" }}
                    />
                  )}

                  {/* Main Synaptic Neuron Circle */}
                  <circle
                    r={radius}
                    fill={isSelected ? borderColor : "#FAF8F3"}
                    stroke={borderColor}
                    strokeWidth={isSelected ? "3" : "2"}
                    filter={isSelected || isHovered ? "url(#superGlow)" : "none"}
                    className="transition-all duration-300 group-hover:scale-110"
                  />

                  {/* Inner Core Point */}
                  <circle
                    r="4.5"
                    fill={isSelected ? "#FAF8F3" : borderColor}
                    className="transition-transform group-hover:scale-125"
                  />

                  {/* High-Readability Label */}
                  <text
                    y={radius + 15}
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-[10px] font-sans font-bold fill-forest-950 dark:fill-parchment-100 select-none pointer-events-none drop-shadow-sm"
                  >
                    {node.shortLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 6. STATUTORY NODE INSPECTOR DOSSIER (Right Column) */}
        <div className="lg:col-span-5 bg-white dark:bg-forest-900 border border-amber-500/30 dark:border-forest-700 rounded-3xl p-5 sm:p-6 shadow-subtle-luxury space-y-4">
          {/* Header Badge */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-parchment-200 dark:border-forest-800">
            <div className="flex items-center space-x-2">
              <span
                className="w-3.5 h-3.5 rounded-full ring-2 ring-white/50"
                style={{ backgroundColor: activeNode.color }}
              />
              <span className="font-display text-xs font-bold uppercase tracking-wider text-forest-900/60 dark:text-parchment-300/80">
                Statutory Node Dossier
              </span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-parchment-100 dark:bg-forest-950 text-forest-900 dark:text-parchment-300 font-bold border border-parchment-200 dark:border-forest-800">
              {activeNode.jurisdiction}
            </span>
          </div>

          {/* Node Title & Authority */}
          <div className="space-y-1">
            <h4 className="font-display text-lg sm:text-xl font-bold text-forest-950 dark:text-parchment-50 leading-snug">
              {activeNode.label}
            </h4>
            <div className="flex items-center justify-between text-xs text-forest-900/60 dark:text-parchment-400">
              <span>Authority: <strong>{activeNode.authority}</strong></span>
            </div>
          </div>

          {/* Statutory Basis Pill */}
          <div className="p-3 rounded-xl bg-parchment-100/80 dark:bg-forest-950/70 border border-parchment-200 dark:border-forest-800 text-xs font-mono text-amber-800 dark:text-amber-300 font-bold flex items-center justify-between">
            <span className="truncate max-w-[280px]">{activeNode.statutory_basis}</span>
            <button
              onClick={handleCopyCitation}
              className="p-1 hover:bg-parchment-200 dark:hover:bg-forest-800 rounded text-forest-900/70 dark:text-parchment-300 transition-colors"
              title="Copy Statutory Citation"
            >
              {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Detailed Legal Description */}
          <p className="text-xs sm:text-sm text-forest-900/80 dark:text-parchment-200/90 leading-relaxed font-sans">
            {activeNode.description}
          </p>

          {/* Legal Standard Box */}
          <div className="p-3 bg-amber-500/10 dark:bg-amber-500/5 rounded-xl border border-amber-500/20 text-xs space-y-1">
            <span className="font-bold text-amber-900 dark:text-amber-300 font-display uppercase tracking-wider block text-[10px]">
              Evidentiary Legal Standard:
            </span>
            <p className="text-forest-900/90 dark:text-parchment-100 leading-relaxed">
              {activeNode.legal_standard}
            </p>
          </div>

          {/* Core Legal Consequence */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-forest-900/70 dark:text-parchment-300 uppercase tracking-wider block">
              Core Legal Consequence:
            </span>
            <div className="flex items-start space-x-2 text-xs text-forest-900/90 dark:text-parchment-100 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span>{activeNode.key_implication}</span>
            </div>
          </div>

          {/* Safe Harbor Compliance Criteria */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-forest-900/70 dark:text-parchment-300 uppercase tracking-wider block">
              Compliance Safe Harbor:
            </span>
            <div className="flex items-start space-x-2 text-xs text-forest-900/90 dark:text-parchment-100 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>{activeNode.safe_harbor}</span>
            </div>
          </div>

          {/* Interconnected Synapses (Jump to Related Nodes) */}
          {connectedNodes.length > 0 && (
            <div className="pt-2 border-t border-parchment-200 dark:border-forest-800 space-y-2">
              <span className="text-[11px] font-bold text-forest-900/70 dark:text-parchment-400 uppercase tracking-wider block">
                Connected Statutory Synapses ({connectedNodes.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {connectedNodes.map((cn) => (
                  <button
                    key={cn.id}
                    onClick={() => setSelectedNodeId(cn.id)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-parchment-100 dark:bg-forest-950 border border-parchment-200 dark:border-forest-800 text-forest-900 dark:text-parchment-200 hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-300 transition-all flex items-center space-x-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cn.color }} />
                    <span>{cn.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Ribbon */}
          <div className="pt-3 border-t border-parchment-200 dark:border-forest-800 flex items-center justify-between gap-2">
            <button
              onClick={() => handleLaunchQuery(activeNode.sample_query)}
              className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-forest-950 text-xs font-bold shadow-md transition-all group"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 dark:text-forest-950" />
              <span>Query IP-SAKTI on This Statute</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href={activeNode.external_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Read Official Statutory Act Record"
              className="p-2.5 rounded-xl border border-parchment-200 dark:border-forest-700 text-forest-900 dark:text-parchment-200 hover:bg-parchment-100 dark:hover:bg-forest-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegulatoryKnowledgeGraph;
