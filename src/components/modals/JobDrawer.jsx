import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Briefcase, Clock, DollarSign, Building } from "lucide-react";

export default function JobDrawer({ job, isOpen, tokensRemaining, onClose, onApply, onSave }) {
    const isFull = job && job.acceptedCount !== undefined && job.interviewQuota !== undefined && job.acceptedCount >= job.interviewQuota;
    const hasTokens = tokensRemaining !== undefined ? tokensRemaining > 0 : true; // Default to true if not loaded yet to avoid flicker, or handle loading state.
    const canApply = !job?.isApplied && !isFull && hasTokens;

    return (
        <AnimatePresence>
            {isOpen && job && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-900 border-l border-slate-800 shadow-2xl z-[100] overflow-y-auto"
                    >
                        <div className="p-6 space-y-8">
                            {/* Header */}
                            <div className="space-y-6">
                                <button
                                    onClick={onClose}
                                    className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden shadow-lg shrink-0 relative">
                                        {(job.logoUrl || job.companyLogo) ? (
                                            <img src={job.logoUrl || job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold text-white">{job.company?.substring(0, 2).toUpperCase()}</span>
                                        )}
                                        {isFull && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="text-[10px] font-black text-white uppercase transform -rotate-12 border-2 border-white/20 px-1 py-0.5 rounded">Complet</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-bold text-white leading-tight">{job.title}</h2>
                                            {isFull && <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 text-xs font-bold uppercase border border-red-500/20">Saturé</span>}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 text-slate-400 font-medium">
                                            <Building size={16} className="text-blue-500" />
                                            {job.company || job.companyName}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 text-sm font-medium">
                                        <MapPin size={14} className="text-slate-500" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 text-sm font-medium">
                                        <Briefcase size={14} className="text-slate-500" />
                                        {job.type}
                                    </div>
                                    {job.salary && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 text-sm font-medium">
                                            <DollarSign size={14} className="text-emerald-500" />
                                            {job.salary}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 text-sm font-medium">
                                        <Clock size={14} className="text-slate-500" />
                                        Ajouté le {new Date(job.createdAt).toLocaleDateString()}
                                    </div>
                                    {/* Quota Info */}
                                    {job.interviewQuota && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 text-sm font-medium">
                                            <span className={isFull ? "text-red-400" : "text-emerald-400"}>
                                                {isFull ? "Quota atteint" : `${job.applicationCount || 0}/${job.interviewQuota} places prises`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => canApply && onApply(job.id)}
                                        disabled={!canApply}
                                        className={`w-full sm:w-auto flex-1 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${job.isApplied
                                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/50 cursor-not-allowed shadow-none"
                                            : isFull
                                                ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-white/5"
                                                : !hasTokens
                                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                                            }`}
                                    >
                                        {job.isApplied
                                            ? "Candidature envoyée"
                                            : isFull
                                                ? "Offre complète"
                                                : !hasTokens
                                                    ? "Plus de jetons"
                                                    : "Candidater maintenant (1 jeton)"}
                                    </button>
                                    <button
                                        onClick={() => onSave(job.id)}
                                        className={`w-full sm:w-auto px-4 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 border ${job.isSaved
                                            ? "bg-pink-500/10 text-pink-500 border-pink-500/50"
                                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                                            }`}
                                    >
                                        {job.isSaved ? "Sauvegardée" : "Sauvegarder"}
                                    </button>
                                </div>
                                {!hasTokens && !job.isApplied && !isFull && (
                                    <p className="text-red-400 text-sm text-center">
                                        Vous avez utilisé tous vos jetons. Attendez qu'une entreprise vous réponde ou refuse votre candidature pour récupérer un jeton.
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Description du poste</h3>
                                <div className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed">
                                    {/* Handle potential HTML content or plain text */}
                                    {job.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }} />
                                    ) : (
                                        <p className="text-slate-500 italic">Aucune description disponible pour cette offre.</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
