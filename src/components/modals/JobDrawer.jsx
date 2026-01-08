import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, BookmarkCheck, Bookmark, Briefcase, Clock, DollarSign, Building, Loader2, Send, CheckCircle, Share2, Upload } from "lucide-react";
import Button from "../common/Button";

export default function JobDrawer({ job, isOpen, tokensRemaining, onClose, onApply, onSave, isApplying, isSaving, isLocked, saturatedLimit = 50 }) {
    const isSaturated = job && (job.applicationCount || 0) >= saturatedLimit;
    const isClosed = job && (isSaturated || job.status === 'CLOSED');

    // Logic: 
    // - Specific Job full (interview quota) -> isFull
    // - Global Student Quota -> isLocked
    // - Job Saturated (50 apps) -> isClosed

    const isFull = job && job.acceptedCount !== undefined && job.interviewQuota !== undefined && job.acceptedCount >= job.interviewQuota;
    // const hasTokens = tokensRemaining !== undefined ? tokensRemaining > 0 : true; // Deprecated in favor of isLocked (5 apps limit)

    const canApply = !job?.isApplied && !job?.isInvited && !isFull && !isClosed && !isLocked;


    const handleMainAction = () => {
        if (canApply) {
            onApply(job.id);
        } else if (isLocked && !job?.isApplied) {
            onApply(job.id);
        }
    };

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
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    />

                    {/* Centered Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-2xl glass-panel border-0 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4 bg-slate-50/50 dark:bg-white/5 shrink-0 relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-slate-100 dark:border-white/10">
                                        {(job.logoUrl || job.companyLogo) ? (
                                            <img src={job.logoUrl || job.companyLogo} alt={job.company} className="w-full h-full object-contain" />
                                        ) : (
                                            <Building className="text-slate-300" size={32} />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-theme-primary leading-tight mb-1">{job.title}</h2>
                                        <div className="flex items-center gap-2 text-theme-secondary font-medium">
                                            {job.company || job.companyName}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-theme-secondary hover:text-theme-primary rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="px-8 pb-8 overflow-y-auto scrollbar-hide flex-1 bg-white dark:bg-slate-900/50">

                            <div className="flex flex-wrap gap-3 mb-8 mt-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-sm font-bold">
                                    <MapPin size={16} />
                                    {job.location}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">
                                    <Briefcase size={16} />
                                    {job.type}
                                </div>
                                {job.salary && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-bold">
                                        <DollarSign size={16} />
                                        {job.salary}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 text-sm font-bold">
                                    <Clock size={16} />
                                    {new Date(job.createdAt).toLocaleDateString()}
                                </div>
                                {isClosed && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-bold">
                                        <Loader2 size={16} /> Offre Clôturée
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 mb-20">
                                <h3 className="text-lg font-bold text-theme-primary flex items-center gap-2">
                                    À propos du poste
                                </h3>
                                <div className="prose max-w-none text-theme-secondary leading-relaxed">
                                    {job.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }} />
                                    ) : (
                                        <p className="text-gray-400 italic">Aucune description disponible pour cette offre.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-white/90 backdrop-blur-sm z-20">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={() => onSave(job.id)}
                                    disabled={isSaving}
                                    variant="secondary"
                                    className="flex-1"
                                    isLoading={isSaving}
                                    icon={job.isSaved ? BookmarkCheck : Bookmark}
                                >
                                    {job.isSaved ? "Retirer" : "Sauvegarder"}
                                </Button>

                                <Button
                                    onClick={handleMainAction}
                                    disabled={(!canApply && !isLocked) || isApplying || isClosed}
                                    variant={job.isApplied ? "ghost" : "primary"}
                                    isLoading={isApplying}
                                    className="flex-[2]"
                                    icon={!isApplying && !job.isApplied && !isClosed && Send}
                                >
                                    {job.isApplied ? (
                                        job.status === 'ACCEPTED' ? "Candidature Acceptée" :
                                            job.status === 'REJECTED' ? "Candidature Rejetée" :
                                                job.wasInvited ? "Invitation Reçue" : "Candidature envoyée"
                                    ) : job.isInvited ? (
                                        "Vous êtes invité"
                                    ) : isClosed ? (
                                        "Offre Clôturée (Max 50)"
                                    ) : isFull ? (
                                        "Offre complète (Interview Quota)"
                                    ) : isLocked ? (
                                        "Quota Atteint (Max 5)"
                                    ) : (
                                        "Postuler maintenant"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

        </AnimatePresence>
    );
}
