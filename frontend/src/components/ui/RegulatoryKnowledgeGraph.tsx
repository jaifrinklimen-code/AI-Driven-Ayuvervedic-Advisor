import React, { useState } from "react";
import { Layers, CheckCircle2 } from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  category: "statute" | "herbal" | "international" | "regulatory";
  description: string;
  statutory_basis: string;
  key_implication: string;
  x: number;
  y: number;
  color: string;
}

export const RegulatoryKnowledgeGraph: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>("sec3p");

  const nodes: NodeData[] = [
    {
      id: "sec3p",
      label: "Section 3(p) — Traditional Knowledge Exclusion",
      category: "statute",
      description: "Statutory bar under the Patents Act 1970 preventing patents on traditional knowledge or mere aggregations of traditionally known properties.",
      statutory_basis: "The Patents Act, 1970 § 3(p) (as amended 2002)",
      key_implication: "Direct barrier against classical polyherbal formulas; applicant must prove non-obvious technical processing or synergistic therapeutic effect.",
      x: 220,
      y: 110,
      color: "#D97706", // Amber
    },
    {
      id: "sec3e",
      label: "Section 3(e) — Synergy & Mere Admixture",
      category: "statute",
      description: "Excludes substances formed by a mere admixture resulting only in the aggregation of properties of components.",
      statutory_basis: "The Patents Act, 1970 § 3(e)",
      key_implication: "Requires quantitative in-vitro or in-vivo synergy testing (Combination Index < 1.0) to demonstrate unexpected therapeutic efficacy.",
      x: 160,
      y: 280,
      color: "#EA580C", // Ochre Orange
    },
    {
      id: "nba_form3",
      label: "NBA Form III — Biodiversity Clearance",
      category: "regulatory",
      description: "Mandatory prior approval from National Biodiversity Authority before filing or grant of intellectual property right based on Indian biological resources.",
      statutory_basis: "Biological Diversity Act, 2002 § 6(1) & 2023 Amendments",
      key_implication: "Non-compliance leads to patent invalidation, criminal penal provisions, and export restrictions under Indian law.",
      x: 480,
      y: 90,
      color: "#9333EA", // Purple
    },
    {
      id: "rule158b",
      label: "Rule 158B — ASU Drug Licensing Pathway",
      category: "regulatory",
      description: "Establishes licensing evidentiary standards for Classical vs Patent/Proprietary Ayurvedic Medicines.",
      statutory_basis: "Drugs & Cosmetics Rules, 1945 Rule 158B & First Schedule",
      key_implication: "Determines whether safety trials and textual classical citations are mandatory for commercial drug manufacture.",
      x: 520,
      y: 260,
      color: "#059669", // Emerald
    },
    {
      id: "tkdl",
      label: "TKDL — Defensive Prior-Art Repository",
      category: "herbal",
      description: "500,000+ classical Ayurvedic formulations digitized in 5 international languages accessed by USPTO, EPO, and Indian Patent Office.",
      statutory_basis: "CSIR & Ministry of Ayush Defensive Trust",
      key_implication: "Examiners search TKDL to automatically issue 3(p) objections and reject non-novel Ayurvedic patent applications globally.",
      x: 350,
      y: 350,
      color: "#2563EB", // Blue
    },
    {
      id: "wipo_gratk",
      label: "WIPO GRATK Treaty (2024) — Origin Disclosure",
      category: "international",
      description: "Landmark multilateral treaty obligating worldwide patent applicants to disclose country of origin for genetic resources and traditional knowledge.",
      statutory_basis: "WIPO Treaty on IP, Genetic Resources and Associated TK (Adopted May 2024)",
      key_implication: "Enables India to trace and oppose biopiracy filings in foreign jurisdictions (US, Europe, Japan).",
      x: 350,
      y: 30,
      color: "#0D9488", // Teal
    },
  ];

  const connections = [
    { from: "sec3p", to: "tkdl" },
    { from: "sec3p", to: "sec3e" },
    { from: "sec3p", to: "nba_form3" },
    { from: "nba_form3", to: "wipo_gratk" },
    { from: "nba_form3", to: "rule158b" },
    { from: "rule158b", to: "tkdl" },
    { from: "sec3e", to: "rule158b" },
  ];

  const activeNode = nodes.find((n) => n.id === selectedNode) || nodes[0];

  return (
    <div className="bg-white dark:bg-forest-900/60 rounded-3xl border border-amber-500/20 dark:border-forest-700/60 p-6 sm:p-8 shadow-elevated-luxury">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-parchment-200/80 dark:border-forest-800/60 gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/20">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-display">Interactive Topology</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-forest-950 dark:text-parchment-50">
            Ayurvedic Regulatory Knowledge Graph
          </h3>
        </div>
        <span className="text-xs text-forest-900/70 dark:text-parchment-400/80 font-medium">
          Click nodes to trace legal dependencies & statutory barriers
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Interactive SVG Canvas */}
        <div className="lg:col-span-7 bg-parchment-50/70 dark:bg-forest-950/70 rounded-2xl border border-parchment-200 dark:border-forest-800 p-4 relative min-h-[380px] flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 700 400" className="w-full h-full max-h-[360px]">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C5A880" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
              </linearGradient>
              <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Edges */}
            {connections.map((c, i) => {
              const start = nodes.find((n) => n.id === c.from)!;
              const end = nodes.find((n) => n.id === c.to)!;
              const isSelectedConnection = c.from === selectedNode || c.to === selectedNode;
              return (
                <line
                  key={i}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={isSelectedConnection ? "#10B981" : "url(#lineGrad)"}
                  strokeWidth={isSelectedConnection ? "3" : "1.5"}
                  strokeDasharray={isSelectedConnection ? "none" : "4 3"}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Central Metaphor Core */}
            <circle
              cx="350"
              cy="200"
              r="24"
              fill="#0A1C16"
              stroke="#D4AF37"
              strokeWidth="2"
              className="animate-pulse"
            />
            <text
              x="350"
              y="204"
              textAnchor="middle"
              fill="#FAF8F3"
              fontSize="9"
              fontFamily="Cinzel"
              fontWeight="bold"
            >
              CORE
            </text>

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = node.id === selectedNode;
              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className="cursor-pointer group"
                  transform={`translate(${node.x}, ${node.y})`}
                >
                  <circle
                    r={isSelected ? "24" : "18"}
                    fill={isSelected ? node.color : "#FAF8F3"}
                    stroke={node.color}
                    strokeWidth={isSelected ? "3" : "2"}
                    filter={isSelected ? "url(#nodeGlow)" : "none"}
                    className="transition-all duration-300 group-hover:scale-110"
                  />
                  <circle
                    r="4"
                    fill={isSelected ? "#FAF8F3" : node.color}
                  />
                  <text
                    y="34"
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-xs font-sans font-bold fill-forest-950 dark:fill-parchment-100 select-none pointer-events-none"
                  >
                    {node.label.split("—")[0].trim()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Statutory Dossier */}
        <div className="lg:col-span-5 bg-white dark:bg-forest-900 border border-amber-500/30 rounded-2xl p-6 shadow-subtle-luxury space-y-4">
          <div className="flex items-center space-x-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activeNode.color }}
            />
            <span className="font-display text-xs font-bold uppercase tracking-wider text-forest-900/60 dark:text-parchment-300/60">
              Statutory Node Inspector
            </span>
          </div>

          <h4 className="font-display text-lg font-bold text-forest-950 dark:text-parchment-50 leading-tight">
            {activeNode.label}
          </h4>

          <div className="p-3.5 rounded-xl bg-parchment-100/70 dark:bg-forest-950/60 border border-parchment-200 dark:border-forest-800 text-sm font-mono text-amber-800 dark:text-amber-300 font-semibold">
            {activeNode.statutory_basis}
          </div>

          <p className="text-sm text-forest-900/80 dark:text-parchment-200/80 leading-relaxed">
            {activeNode.description}
          </p>

          <div className="pt-3 border-t border-parchment-200 dark:border-forest-800 space-y-2">
            <span className="text-xs font-bold text-forest-900/70 dark:text-parchment-300/70 uppercase tracking-wider block">
              Core Legal Consequence:
            </span>
            <div className="flex items-start space-x-2 text-sm text-forest-900/90 dark:text-parchment-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>{activeNode.key_implication}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
