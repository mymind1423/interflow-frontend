import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Briefcase, Clock, DollarSign, Building, Loader2 } from "lucide-react";

export default function JobDrawer({ job, isOpen, tokensRemaining, onClose, onApply, onSave, isApplying, isSaving }) {
    const isFull = job && job.acceptedCount !== undefined && job.interviewQuota !== undefined && job.acceptedCount >= job.interviewQuota;
    const hasTokens = tokensRemaining !== undefined ? tokensRemaining > 0 : true;
    const canApply = !job?.isApplied && !job?.isInvited && !isFull && hasTokens;

    return (
        <AnimatePresence>
            {isOpen && job && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    {/* Centered Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header Image/Gradient */}
                        <div className="h-32 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 relative shrink-0">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all z-10"
                            >
                                <X size={20} />
                            </button>
                            <div className="absolute -bottom-10 left-8">
                                <div className="w-24 h-24 rounded-3xl bg-slate-900 p-1.5 border-4 border-slate-900 shadow-xl">
                                    <div className="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 relative">
                                        {(job.logoUrl || job.companyLogo) ? (
                                            <img src={job.logoUrl || job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-white">{job.company?.substring(0, 2).toUpperCase()}</span>
                                        )}
                                        {isFull && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="text-[10px] font-black text-white uppercase transform -rotate-12 border-2 border-white/20 px-1 py-0.5 rounded">Complet</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 pt-12 pb-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-3xl font-black text-white leading-tight mb-2">{job.title}</h2>
                                    <div className="flex items-center gap-2 text-slate-400 font-medium text-lg">
                                        <Building size={18} className="text-blue-500" />
                                        {job.company || job.companyName}
                                    </div>
                                </div>
                                <div className="hidden sm:flex flex-col items-end gap-2">
                                    {isFull && <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-xs font-black uppercase border border-red-500/20">Complet</span>}
                                    {!hasTokens && !job.isApplied && <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-black uppercase border border-amber-500/20">Pas de jeton</span>}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-8">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 text-sm font-bold">
                                    <MapPin size={16} className="text-slate-500" />
                                    {job.location}
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 text-sm font-bold">
                                    <Briefcase size={16} className="text-slate-500" />
                                    {job.type}
                                </div>
                                {job.salary && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 text-sm font-bold">
                                        <DollarSign size={16} className="text-emerald-500" />
                                        {job.salary}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 text-sm font-bold">
                                    <Clock size={16} className="text-slate-500" />
                                    {new Date(job.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="text-xl font-black text-white flex items-center gap-2">
                                    <div className="w-1 h-6 bg-blue-500 rounded-full" /> Description
                                </h3>
                                <div className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                    {job.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }} />
                                    ) : (
                                        <p className="text-slate-500 italic">Aucune description disponible pour cette offre.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md shrink-0">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => canApply && onApply(job.id)}
                                    disabled={!canApply || isApplying}
                                    className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${job.isApplied
                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/50 cursor-default shadow-none"
                                        : job.isInvited
                                            ? "bg-slate-700/50 text-slate-400 border border-slate-600/30 cursor-default shadow-none"
                                            : isFull
                                                ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-white/5"
                                                : !hasTokens
                                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                                        }`}
                                >
                                    {isApplying ? (
                                        <><Loader2 size={18} className="animate-spin" /> Envoi en cours...</>
                                    ) : job.isApplied ? (
                                        job.wasInvited ? "Invitation Acceptée" : "Candidature envoyée"
                                    ) : job.isInvited ? (
                                        "Vous êtes invité"
                                    ) : isFull ? (
                                        "Offre complète"
                                    ) : !hasTokens ? (
                                        "Plus de jetons"
                                    ) : (
                                        "Postuler maintenant (1 jeton)"
                                    )}
                                </button>
                                <button
                                    onClick={() => onSave(job.id)}
                                    disabled={isSaving}
                                    className={`px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 border ${job.isSaved
                                        ? "bg-pink-500/10 text-pink-500 border-pink-500/50"
                                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white"
                                        }`}
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : job.isSaved ? "Sauvegardée" : "Sauvegarder"}
                                </button>
                            </div>
                            {!hasTokens && !job.isApplied && !isFull && (
                                <p className="text-slate-500 text-xs text-center mt-3 font-medium">
                                    En attente de jetons libérés (réponse ou refus).
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
