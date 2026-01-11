
// src/pages/PendingApproval.jsx
import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { authApi } from "../../api/authApi";
import { Clock, CheckCircle, LogOut, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PendingApproval() {
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check immediatly on load
    checkStatus();

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const res = await authApi.pendingStatus();
      setStatus(res.pending ? "pending" : "approved");
    } catch (err) {
      // Quiet fail on polling, user can see retry button maybe?
      // setError(err.message);
    }
  };

  function logout() {
    auth.signOut();
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  const isApproved = status === "approved";

  return (
    <main className="min-h-screen bg-body flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">

      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-lg border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-center"
      >

        {/* Status Icon */}
        <div className="flex justify-center mb-8">
          <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${isApproved ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
            {isApproved ? (
              <>
                <div className="absolute inset-0 border-2 border-emerald-500 rounded-full animate-ping opacity-20" />
                <CheckCircle size={48} />
              </>
            ) : (
              <>
                <div className="absolute inset-0 border-t-2 border-amber-500 rounded-full animate-spin" />
                <Clock size={48} />
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {/* Content */}
        <h1 className="text-3xl font-black text-theme-primary mb-4 tracking-tight">
          {isApproved ? "Compte Approuvé !" : "Validation en cours"}
        </h1>

        <p className="text-theme-secondary text-lg leading-relaxed mb-8">
          {isApproved
            ? "Excellente nouvelle ! Votre profil entreprise a été validé. Vous pouvez maintenant accéder à votre espace."
            : "Merci de votre inscription. Notre équipe vérifie actuellement vos informations. Vous recevrez un accès dès validation."}
        </p>

        {/* Status Pill */}
        {!isApproved && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-theme-secondary text-sm font-medium mb-8">
            <Loader2 size={14} className="animate-spin" />
            Actualisation automatique...
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          {isApproved && (
            <a
              href="/company-dashboard"
              className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Accéder au Dashboard <ArrowRight size={20} />
            </a>
          )}

          <button
            onClick={logout}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold transition-all ${isApproved ? "text-theme-secondary hover:bg-white/5" : "bg-white/5 hover:bg-white/10 text-theme-secondary hover:text-theme-primary"}`}
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </div>

      </motion.div>
    </main>
  );
}


