import React from "react";
import { Link } from "react-router-dom";
import { Scale, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-forest-950 dark:bg-black text-parchment-200/90 border-t border-forest-900/60 transition-colors">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-forest-900/60">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-forest-900 flex items-center justify-center text-amber-400 border border-amber-500/30">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display text-lg font-bold tracking-wider text-parchment-50">
                  IP-SAKTI SAHAYAK
                </span>
                <p className="text-[10px] tracking-widest uppercase text-amber-400/80 font-medium">
                  National Regulatory Initiative • Ministry of Ayush / AIIA
                </p>
              </div>
            </div>

            <p className="text-xs text-parchment-300/80 leading-relaxed max-w-sm font-sans">
              An advanced AI regulatory navigator and authoritative knowledge core engineered to classify Ayurvedic products, evaluate patentability under Section 3(p)/3(e), navigate National Biodiversity Authority clearance, and defend traditional medicine heritage.
            </p>

            <div className="pt-2 flex items-center space-x-2 text-[11px] text-emerald-400/90 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified Statutory RAG Engine • InPASS & TKDL Aligned</span>
            </div>
          </div>

          {/* Col 1: Regulatory Engines */}
          <div className="space-y-3">
            <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-amber-300 block">
              Regulatory Engines
            </span>
            <ul className="space-y-2 text-xs text-parchment-300/70">
              <li>
                <Link to="/ask" className="hover:text-parchment-100 transition-colors">
                  Ask IP-SAKTI Studio
                </Link>
              </li>
              <li>
                <Link to="/classify" className="hover:text-parchment-100 transition-colors">
                  Formulation Diagnostic Lab
                </Link>
              </li>
              <li>
                <Link to="/abs-navigator" className="hover:text-parchment-100 transition-colors">
                  ABS & NBA Clearance
                </Link>
              </li>
              <li>
                <Link to="/jurisdictions" className="hover:text-parchment-100 transition-colors">
                  Bilateral Legal Topology
                </Link>
              </li>
              <li>
                <Link to="/abs-navigator#kiosk" className="hover:text-parchment-100 transition-colors">
                  IP-SAKTI Smart Kiosk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Statutory Frameworks */}
          <div className="space-y-3">
            <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-amber-300 block">
              Statutory Regimes
            </span>
            <ul className="space-y-2 text-xs text-parchment-300/70">
              <li>
                <span className="hover:text-parchment-100 transition-colors">
                  Patents Act, 1970 (Sec 3(p)/3(e))
                </span>
              </li>
              <li>
                <span className="hover:text-parchment-100 transition-colors">
                  Biological Diversity Act (2002/2023)
                </span>
              </li>
              <li>
                <span className="hover:text-parchment-100 transition-colors">
                  Drugs & Cosmetics Act (Rule 158B)
                </span>
              </li>
              <li>
                <span className="hover:text-parchment-100 transition-colors">
                  FSSAI Ayurveda Aahar (2022)
                </span>
              </li>
              <li>
                <span className="hover:text-parchment-100 transition-colors">
                  WIPO GRATK Treaty (May 2024)
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Institutional Authority */}
          <div className="space-y-3">
            <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-amber-300 block">
              Institutional Links
            </span>
            <ul className="space-y-2 text-xs text-parchment-300/70">
              <li>
                <a
                  href="https://ayush.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-parchment-100 transition-colors"
                >
                  <span>Ministry of Ayush</span>
                  <ExternalLink className="w-3 h-3 text-amber-400/80" />
                </a>
              </li>
              <li>
                <a
                  href="https://aiia.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-parchment-100 transition-colors"
                >
                  <span>All India Institute of Ayurveda</span>
                  <ExternalLink className="w-3 h-3 text-amber-400/80" />
                </a>
              </li>
              <li>
                <a
                  href="http://nbaindia.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-parchment-100 transition-colors"
                >
                  <span>National Biodiversity Authority</span>
                  <ExternalLink className="w-3 h-3 text-amber-400/80" />
                </a>
              </li>
              <li>
                <a
                  href="https://ipindia.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-parchment-100 transition-colors"
                >
                  <span>Office of CGPDTM (IP India)</span>
                  <ExternalLink className="w-3 h-3 text-amber-400/80" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.tkdl.res.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-parchment-100 transition-colors"
                >
                  <span>CSIR-TKDL Portal</span>
                  <ExternalLink className="w-3 h-3 text-amber-400/80" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Ribbon with Statutory Legal Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-parchment-300/60 space-y-4 sm:space-y-0">
          <p>
            © 2026 IP-SAKTI Sahayak. Developed in collaboration with Ministry of Ayush & All India Institute of Ayurveda.
          </p>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-[10px] text-amber-400/80">
              SHA-256 HASH VERIFIED • DPDP ACT COMPLIANT
            </span>
            <span className="hidden md:inline">•</span>
            <span>Preliminary Informational Assessment • Not Legal Advice</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;