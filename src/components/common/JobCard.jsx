import { Building, MapPin, Clock, Bookmark, BookmarkCheck, Loader2, Check, ArrowRight, X, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { fixEncoding } from "../../utils/stringUtils"; // Assuming this exists based on Dashboard usage

export default function JobCard({ job, viewMode = "card", isSaved, isSaving, onToggleSave, onApply, onClick, isLocked, saturatedLimit = 50, isApplying }) {
    const isList = viewMode === 'list';

    // Saturation Logic
    const isSaturated = (job.applicationCount || 0) >= saturatedLimit;
    const isClosed = isSaturated || job.isActive === 0 || job.status === 'CLOSED';

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
                className={`group glass-panel rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6 transition-all hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/10 cursor-pointer border border-slate-300 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 ${isClosed ? 'grayscale opacity-60' : ''}`}
            >
                {/* COLUMN 1: Job Info (Flex-1 to take available space) */}
                <div className="flex-1 min-w-0 flex gap-4 h-full items-start self-stretch">
                    {/* Logo */}
                    <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center p-1 shadow-sm border border-slate-100 dark:border-white/5 shrink-0">
                        {job.companyLogo ? (
                            <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain" />
                        ) : (
                            <Building className="text-slate-400 dark:text-slate-500" size={24} />
                        )}
                    </div>

                    {/* Text Info */}
                    <div className="flex flex-col h-full justify-between py-1">
                        <div>
                            <h3 className="text-xl font-bold text-theme-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">{safeEncode(job.title)}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-theme-secondary font-medium">
                                <span className="text-theme-primary font-bold">{safeEncode(job.companyName)}</span>
                                <span>•</span>
                                <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md text-xs border border-slate-200 dark:border-white/10">{job.type}</span>
                                <span>•</span>
                                <span>{safeEncode(job.location)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-theme-secondary font-medium mt-2">
                            <Clock size={12} /> {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr }) : "Récemment"}
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: Urgency Badge (Centered horizontally between info and actions) */}
                {(job.interviewQuota && job.applicationCount !== undefined && !isClosed) && (
                    <div className="hidden md:flex flex-col items-center justify-center shrink-0 mx-2">
                        <div className="w-[120px] h-[90px] rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 [html[data-theme=dark]_&]:from-violet-600 [html[data-theme=dark]_&]:via-fuchsia-600 [html[data-theme=dark]_&]:to-pink-600 text-white flex flex-col items-center justify-center p-2 shadow-xl shadow-red-500/20 [html[data-theme=dark]_&]:shadow-fuchsia-500/20 relative overflow-hidden group/badge transition-all hover:scale-105 border-4 border-white/20 [html[data-theme=dark]_&]:border-white/10">
                            {/* Number Top */}
                            <div className="text-4xl font-black tracking-tighter z-10 leading-none mb-1">
                                {Math.max(0, job.interviewQuota - job.applicationCount).toString().padStart(2, '0')}
                            </div>
                            {/* Text Bottom */}
                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wide leading-none text-center z-10">
                                Places<br />Restantes
                            </span>

                            {/* Decoration */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 blur-xl rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-black/10 blur-lg rounded-full translate-y-1/2 -translate-x-1/2" />
                        </div>
                    </div>
                )}

                {/* COLUMN 3: Actions & Bookmark (Right aligned) */}
                <div className="flex flex-col items-end gap-3 shrink-0 min-w-[140px]">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                        disabled={isSaving}
                        className={`self-end p-2 rounded-xl transition-all ${isSaved ? "bg-pink-50 dark:bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20" : "bg-slate-50 dark:bg-white/5 text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-slate-100 dark:border-white/5"}`}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick(); }}
                            className="px-4 py-2.5 rounded-xl font-bold text-sm bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-theme-secondary transition-colors"
                        >
                            Détails
                        </button>
                        <button
                            onClick={handleApplyClick}
                            disabled={isLocked && !job.isApplied}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${job.isApplied
                                ? (job.applicationStatus === 'ACCEPTED' ? "bg-emerald-100 text-emerald-700 shadow-none cursor-default" : "bg-emerald-100 text-emerald-700 shadow-none cursor-default")
                                : isClosed
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30"
                                }`}
                        >
                            {isApplying ? <Loader2 size={16} className="animate-spin" /> : job.isApplied ? (
                                job.applicationStatus === 'ACCEPTED' ? "Accepté" : job.applicationStatus === 'REJECTED' ? "Refusé" : job.applicationSource === 'INVITATION' ? "Invité (Accepté)" : <><Check size={16} /> Candidaté</>
                            ) : isClosed ? "Terminé" : job.isInvited ? "Invité (En attente)" : "Candidater"}
                        </button>
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
            className={`group relative glass-panel rounded-[2rem] p-6 flex flex-col transition-all hover:-translate-y-1 shadow-lg border border-slate-300 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 cursor-pointer ${isClosed ? 'grayscale opacity-60' : ''}`}
        >

            <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center p-1 shadow-sm border border-slate-100 dark:border-white/5">
                    {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain" />
                    ) : (
                        <Building className="text-slate-400 dark:text-slate-500" size={24} />
                    )}
                </div>

                {/* NEW: Urgency Badge Top Right */}
                {(job.interviewQuota && job.applicationCount !== undefined && !isClosed) ? (
                    <div className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 [html[data-theme=dark]_&]:from-violet-600 [html[data-theme=dark]_&]:via-fuchsia-600 [html[data-theme=dark]_&]:to-pink-600 text-white shadow-lg shadow-red-500/20 [html[data-theme=dark]_&]:shadow-fuchsia-500/20 border-2 border-white/20 [html[data-theme=dark]_&]:border-white/10 flex flex-col items-center leading-none">
                        <span className="text-xl font-black tracking-tighter">
                            {Math.max(0, job.interviewQuota - job.applicationCount)}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wide opacity-90">Places</span>
                    </div>
                ) : <div />}

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
                    {/* Removed old quota chip */}
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


            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    className="px-3 py-3 rounded-xl font-bold text-sm bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-theme-secondary transition-colors"
                >
                    Détails
                </button>

                {/* Candidater - Flexible width but allows bookmark next to it */}
                <button
                    onClick={handleApplyClick}
                    disabled={isLocked && !job.isApplied}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn ${job.isApplied
                        ? (job.applicationStatus === 'ACCEPTED' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                            : job.applicationStatus === 'REJECTED' ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                                : job.applicationSource === 'INVITATION' ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                                    : "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 shadow-none cursor-default")
                        : isClosed
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : isLocked
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                        }`}
                >
                    {isApplying ? <Loader2 size={16} className="animate-spin" /> : job.isApplied ? (
                        job.applicationStatus === 'ACCEPTED' ? "Accepté" :
                            job.applicationStatus === 'REJECTED' ? "Rejeté" :
                                job.applicationSource === 'INVITATION' ? "Invité" : <><Check size={16} /> Candidaté</>
                    ) : isClosed ? "Clôturée" : isLocked ? "Quota Atteint" : job.isInvited ? "Invitation Reçue" : "Candidater"}
                </button>

                {/* Bookmark moved here */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                    disabled={isSaving}
                    className={`p-3 rounded-xl transition-all aspect-square flex items-center justify-center ${isSaved ? "bg-pink-50 dark:bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20" : "bg-slate-50 dark:bg-white/5 text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-slate-100 dark:border-white/5"}`}
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
            </div>

        </motion.div>
    );
}