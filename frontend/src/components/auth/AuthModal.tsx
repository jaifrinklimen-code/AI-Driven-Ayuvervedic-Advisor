import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { ShieldCheck, User, Lock, Mail, Sparkles, X, CheckCircle2, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const role = "Ayurvedic Researcher / IP Evaluator";
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || "Ayurvedic Innovator",
              role: role,
            },
          },
        });
        if (error) throw error;
        setSuccessMsg("Account created! Check your email or proceed to sign in.");
        if (data.user) {
          onAuthSuccess?.(data.user);
          setTimeout(onClose, 1200);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg("Signed in successfully to IP-SAKTI Regulatory Portal.");
        if (data.user) {
          onAuthSuccess?.(data.user);
          setTimeout(onClose, 800);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoEvaluatorLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    // Instant Evaluator Demo Session
    try {
      const demoUser = {
        id: "evaluator_demo_001",
        email: "evaluator@ayush.gov.in",
        user_metadata: {
          full_name: "Dr. A. Sharma (Jury Evaluator)",
          role: "Ministry of Ayush / SIH Reviewer",
          organization: "All India Institute of Ayurveda",
        },
      };
      localStorage.setItem("ipsakti_demo_user", JSON.stringify(demoUser));
      setSuccessMsg("Authenticated as Ministry Evaluator / Jury Member.");
      onAuthSuccess?.(demoUser);
      setTimeout(onClose, 600);
    } catch {
      setErrorMsg("Demo login could not initialize.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-forest-950 rounded-3xl border border-amber-500/30 max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-forest-900/60 dark:text-parchment-300/60 hover:bg-parchment-100 dark:hover:bg-forest-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-forest-950 dark:text-parchment-50">
            {isSignUp ? "Create IP-SAKTI Account" : "Access Regulatory Portal"}
          </h3>
          <p className="text-xs text-forest-900/60 dark:text-parchment-300/60">
            Secure authentication powered by Supabase with Row Level Security.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1-Click Competition Evaluator Button */}
        <div className="mb-5 pb-5 border-b border-parchment-200 dark:border-forest-800">
          <button
            type="button"
            onClick={handleDemoEvaluatorLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md hover:shadow-glow-gold transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>1-Click Jury / Evaluator Sign-In</span>
          </button>
          <p className="text-[10px] text-center text-forest-900/50 dark:text-parchment-400/50 mt-1.5">
            Instant verification for competition judges & reviewers
          </p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleAuth} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-bold text-forest-900/70 dark:text-parchment-300/70 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-forest-900/40 dark:text-parchment-400/40 absolute left-3 top-3" />
                <input
                  type="text"
                  required={isSignUp}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Rajesh Vaidya"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-parchment-50 dark:bg-forest-900 border border-parchment-200 dark:border-forest-800 text-forest-950 dark:text-parchment-50 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-forest-900/70 dark:text-parchment-300/70 uppercase tracking-wider mb-1">
              Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-forest-900/40 dark:text-parchment-400/40 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="innovator@ayush-research.in"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-parchment-50 dark:bg-forest-900 border border-parchment-200 dark:border-forest-800 text-forest-950 dark:text-parchment-50 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-forest-900/70 dark:text-parchment-300/70 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-forest-900/40 dark:text-parchment-400/40 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-parchment-50 dark:bg-forest-900 border border-parchment-200 dark:border-forest-800 text-forest-950 dark:text-parchment-50 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all mt-2 disabled:opacity-50"
          >
            {loading ? "Verifying..." : isSignUp ? "Create Verified Account" : "Sign In to Portal"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-semibold"
          >
            {isSignUp ? "Already registered? Sign In" : "Need an account? Register Here"}
          </button>
        </div>
      </div>
    </div>
  );
};
