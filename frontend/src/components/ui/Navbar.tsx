import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Compass,
  Scale,
  Globe2,
  ShieldCheck,
  BookOpen,
  Monitor,
  Menu,
  X,
  Sparkles,
  User,
  LogOut,
  Sun,
  Moon,
  Activity
} from "lucide-react";
import { AuthModal } from "../auth/AuthModal";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage, SupportedLanguage } from "../../context/LanguageContext";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        const demo = localStorage.getItem("ipsakti_demo_user");
        if (demo) {
          try { setUser(JSON.parse(demo)); } catch {}
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        const demo = localStorage.getItem("ipsakti_demo_user");
        if (demo) {
          try { setUser(JSON.parse(demo)); } catch {}
        } else {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("ipsakti_demo_user");
    setUser(null);
  };

  const navLinks = [
    { name: t("nav_ask"), path: "/ask", icon: <Compass className="w-3.5 h-3.5" /> },
    { name: t("nav_classify"), path: "/classify", icon: <Scale className="w-3.5 h-3.5" /> },
    { name: t("nav_prakruti"), path: "/prakruti", icon: <Activity className="w-3.5 h-3.5 text-emerald-500" /> },
    { name: t("nav_jurisdictions"), path: "/jurisdictions", icon: <Globe2 className="w-3.5 h-3.5" /> },
    { name: t("nav_abs"), path: "/abs-navigator", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { name: t("nav_archive"), path: "/sources", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { name: t("nav_kiosk"), path: "/abs-navigator#kiosk", icon: <Monitor className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-xl bg-parchment-50/90 dark:bg-forest-950/90 border-b border-parchment-200/70 dark:border-forest-900/60 shadow-subtle-luxury">
      {/* Top Ministerial & Institutional Ribbon - Clean Official Design */}
      <div className="bg-forest-950 dark:bg-black/90 text-parchment-100 text-[11px] px-4 sm:px-8 py-1.5 flex justify-between items-center tracking-wide border-b border-forest-900/50">
        <div className="flex items-center space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-display font-semibold text-amber-300/90 text-[11px] tracking-wide">
            {t("portal_subtitle")}
          </span>
          <span className="hidden md:inline text-parchment-400/60 text-[10px]">
            | {t("portal_role")}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-1.5 text-[10px] text-parchment-300/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t("rag_active")}</span>
          </div>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1 rounded-full bg-forest-900/80 dark:bg-forest-900/50 text-amber-300 hover:text-amber-100 border border-amber-500/20 hover:border-amber-400/50 transition-all flex items-center justify-center"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-amber-300 animate-in fade-in" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-amber-200 animate-in fade-in" />
            )}
          </button>

          {/* Language Selector */}
          <div className="flex items-center space-x-1 bg-forest-900/80 dark:bg-forest-900/40 rounded-full px-2.5 py-0.5 border border-amber-500/20">
            <span className="text-[10px] text-amber-300 font-medium">Lang:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-parchment-100 text-[10px] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="en" className="text-slate-900">EN (English)</option>
              <option value="hi" className="text-slate-900">हिंदी (Hindi)</option>
              <option value="ta" className="text-slate-900">தமிழ் (Tamil)</option>
            </select>
          </div>

          {/* User Profile / Auth Action */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-forest-800">
              <span className="hidden sm:inline text-[10px] text-amber-300 font-semibold truncate max-w-[130px]">
                {user.user_metadata?.full_name || user.email?.split("@")[0]}
              </span>
              <button
                onClick={handleSignOut}
                title={t("sign_out")}
                className="p-1 text-parchment-300/60 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center space-x-1 text-[10px] text-amber-300 hover:text-amber-200 font-semibold px-2 py-0.5 rounded border border-amber-500/30 hover:border-amber-400 transition-colors"
            >
              <User className="w-3 h-3" />
              <span>{t("sign_in")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-800 to-forest-950 dark:from-forest-700 dark:to-forest-900 flex items-center justify-center text-amber-300 border border-amber-500/30 shadow-md group-hover:scale-105 transition-all duration-300">
              <Scale className="w-5 h-5 text-amber-300 group-hover:rotate-6 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-display text-lg font-extrabold tracking-wider text-forest-950 dark:text-parchment-50">
                  IP-SAKTI
                </span>
                <span className="font-display text-xs px-2 py-0.5 rounded-full bg-parchment-200/70 text-forest-800 dark:bg-forest-900 dark:text-amber-300/90 border border-amber-500/20 font-medium">
                  Sahayak
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-parchment-800/80 dark:text-parchment-300/60 font-medium">
                Ayurvedic IP & Regulatory Navigator
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-parchment-100/60 dark:bg-forest-900/30 p-1.5 rounded-full border border-parchment-200/70 dark:border-forest-800/40">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path.split("#")[0];
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-forest-900 text-parchment-50 dark:bg-emerald-500/20 dark:text-emerald-300 shadow-sm border border-forest-800/50 dark:border-emerald-500/30 font-semibold"
                      : "text-forest-900/80 dark:text-parchment-200/80 hover:text-forest-950 dark:hover:text-white hover:bg-parchment-200/50 dark:hover:bg-forest-800/50"
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action CTA & Mobile Trigger */}
          <div className="flex items-center space-x-3">
            <Link
              to="/studio"
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold text-parchment-50 bg-gradient-to-r from-forest-800 to-forest-950 hover:from-forest-700 hover:to-forest-900 dark:from-emerald-600 dark:to-teal-700 border border-amber-400/30 shadow-subtle-luxury hover:shadow-glow-gold transition-all duration-300 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>{t("nav_studio")}</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-forest-900 dark:text-parchment-100 hover:bg-parchment-200/60 dark:hover:bg-forest-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-parchment-200 dark:border-forest-900 bg-parchment-50 dark:bg-forest-950 px-5 pt-3 pb-6 space-y-2 shadow-elevated-luxury animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-forest-900 dark:text-parchment-100 hover:bg-parchment-100 dark:hover:bg-forest-900 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-parchment-200/60 dark:bg-forest-800 text-forest-900 dark:text-amber-300">
                {link.icon}
              </div>
              <span className="font-semibold">{link.name}</span>
            </Link>
          ))}
          <div className="pt-3">
            <Link
              to="/studio"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-forest-900 text-parchment-50 text-xs font-bold shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t("nav_studio")}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />
    </header>
  );
};

export default Navbar;