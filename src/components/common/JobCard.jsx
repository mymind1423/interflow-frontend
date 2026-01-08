import { Building, MapPin, Clock, Bookmark, BookmarkCheck, Loader2, Check, ArrowRight, X, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { fixEncoding } from "../../utils/stringUtils"; // Assuming this exists based on Dashboard usage

export default function JobCard({ job, viewMode = "card", isSaved, isSaving, onToggleSave, onApply, onClick, isLocked, saturatedLimit = 50 }) {
    const isList = viewMode === 'list';

    // Saturation Logic
    const isSaturated = (job.applicationCount || 0) >= saturatedLimit;
    const isClosed = isSaturated || job.status === 'CLOSED';

    // Interaction Handler
    const handleApplyClick = (e) => {
        e.stopPropagation();
        if (isClosed) {
            alert("Offre indisponible : Ce poste a reçu trop de candidatures et ne prend plus de nouveaux dossiers.");
            return;
        }
        onApply();
    };

    const handleCardClick = () => {
        if (isClosed) {
            alert("Offre indisponible : Ce poste a reçu trop de candidatures et ne prend plus de nouveaux dossiers.");
            return;
        }
        onClick();
    };

    // Helper to safely encode strings if fixEncoding fails or if we want soft fallback
    const safeEncode = (str) => {
        try {
            return fixEncoding ? fixEncoding(str) : str;
        } catch (e) {
            return str;
        }
    };

    if (isList) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleCardClick}
                className={`group glass-panel rounded-2xl p-5 flex flex-col md:flex-row gap-6 transition-all hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 cursor-pointer border border-transparent hover:border-blue-300 dark:hover:border-blue-500/50 ${isClosed ? 'grayscale opacity-60' : ''}`}
            >

                {/* Logo */}
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center shrink-0 p-1 shadow-sm border border-slate-100 dark:border-white/5">
                    {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain" />
                    ) : (
                        <Building className="text-slate-400 dark:text-slate-500" size={24} />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-xl font-bold text-theme-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">{safeEncode(job.title)}</h3>
                            <div className="flex items-center gap-2 text-sm text-theme-secondary font-medium">
                                <span className="text-theme-primary font-bold">{safeEncode(job.companyName)}</span>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-xs text-theme-secondary border border-slate-200 dark:border-white/10">{job.type}</span>
                                <span>•</span>
                                <span>{safeEncode(job.location)}</span>
                                {(job.interviewQuota && job.applicationCount !== undefined) && (
                                    <>
                                        <span>•</span>
                                        {isSaturated ? (
                                            <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1">Clôturée</span>
                                        ) : (
                                            <span className="text-blue-600 dark:text-blue-400 font-bold">{Math.max(0, job.interviewQuota - job.applicationCount)} places restantes</span>
                                        )}
                                    </>
                                )}

                            </div>

                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                            disabled={isSaving}
                            className={`p-2 rounded-xl transition-all ${isSaved ? "bg-pink-50 dark:bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20" : "bg-slate-50 dark:bg-white/5 text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-slate-100 dark:border-white/5"}`}
                        >
                            {isSaving ? <Loader2 size={20} className="animate-spin" /> : isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                        </button>

                    </div>

                    <p className="text-theme-secondary text-sm line-clamp-2 mb-4 leading-relaxed">{job.description}</p>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleApplyClick}
                            disabled={isLocked && !job.isApplied}
                            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${job.isApplied
                                ? (job.status === 'ACCEPTED' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-none cursor-default"
                                    : job.status === 'REJECTED' ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 shadow-none cursor-default"
                                        : job.wasInvited ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 shadow-none cursor-default"
                                            : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-none cursor-default")
                                : isClosed
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200"
                                    : isLocked
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200"
                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                                }`}
                        >
                            {job.isApplied ? (
                                job.status === 'ACCEPTED' ? "Accepté" :
                                    job.status === 'REJECTED' ? "Rejeté" :
                                        job.wasInvited ? "Invité" : "Candidaté"
                            ) : isClosed ? "Clôturée" : isLocked ? "Quota Atteint" : job.isInvited ? "Invité" : "Postuler"}
                        </button>


                        <span className="text-xs text-theme-secondary font-medium flex items-center gap-1">
                            <Clock size={12} /> {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr }) : "Récemment"}
                        </span>

                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleCardClick}
            className={`group relative glass-panel rounded-[2rem] p-6 flex flex-col transition-all hover:-translate-y-1 shadow-lg border border-white/50 dark:border-white/10 cursor-pointer ${isClosed ? 'grayscale opacity-60' : ''}`}
        >

            <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center p-1 shadow-sm border border-slate-100 dark:border-white/5">
                    {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain" />
                    ) : (
                        <Building className="text-slate-400 dark:text-slate-500" size={24} />
                    )}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                    disabled={isSaving}
                    className={`p-2.5 rounded-xl transition-all ${isSaved ? "bg-pink-50 dark:bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20" : "bg-slate-50 dark:bg-white/5 text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-slate-100 dark:border-white/5"}`}
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>

            </div>

            <div className="mb-4">
                <h3 className="text-lg font-bold text-theme-primary mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{safeEncode(job.title)}</h3>
                <p className="text-theme-secondary text-sm font-medium mb-3">{safeEncode(job.companyName)}</p>
                <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wide border border-blue-100 dark:border-blue-500/20">
                        {job.type}
                    </span>
                    <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold border border-purple-100 dark:border-purple-500/20">
                        {safeEncode(job.location)}
                    </span>
                    {(job.interviewQuota && job.applicationCount !== undefined) && (
                        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold border border-amber-100 dark:border-amber-500/20">
                            {Math.max(0, job.interviewQuota - job.applicationCount)} places
                        </span>
                    )}
                    {isSaturated && (
                        <span className="px-2.5 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold border border-red-100 dark:border-red-500/20">
                            Clôturée
                        </span>
                    )}

                </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 mb-4">
                <span className="text-xs text-theme-secondary font-medium flex items-center gap-1">
                    <Clock size={12} /> {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr }) : "Récemment"}
                </span>
            </div>


            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center gap-3">
                <button
                    onClick={handleApplyClick}
                    disabled={isLocked && !job.isApplied}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn ${job.isApplied
                        ? (job.status === 'ACCEPTED' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                            : job.status === 'REJECTED' ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                                : job.wasInvited ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                                    : "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 shadow-none cursor-default")
                        : isClosed
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : isLocked
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-slate-100 dark:bg-white/5 text-theme-secondary hover:bg-slate-200 dark:hover:bg-white/10 dark:shadow-none"
                        }`}
                >
                    {job.isApplied ? (
                        job.status === 'ACCEPTED' ? "Candidature Acceptée" :
                            job.status === 'REJECTED' ? "Candidature Rejetée" :
                                job.wasInvited ? "Invitation Reçue" : <><Check size={16} /> Candidature envoyée</>
                    ) : isClosed ? "Clôturée" : isLocked ? "Quota Atteint" : job.isInvited ? "Vous êtes invité" : "Voir l'offre"}
                    {!job.isApplied && !isClosed && !isLocked && <ArrowRight size={16} className="text-current group-hover/btn:translate-x-1 transition-transform" />}
                </button>
            </div>

        </motion.div>
    );
}
