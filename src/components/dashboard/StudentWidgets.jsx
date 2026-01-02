import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Bookmark, MapPin, Briefcase, Clock, Calendar, Video, Sparkles, ArrowRight, Info, Users, AlertCircle, Loader2 } from "lucide-react";

export function StatCard({ label, value, color, bg, icon: Icon, delay }) {
    // Extract color class (e.g. text-blue-500) to get the raw color for shadows if possible, 
    // but for tailwind simplicity we stick to classes.
    // We add a subtle glow based on the 'bg' prop.
    const glowColor = bg.replace('bg-', 'from-').replace('/10', '/20');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="relative bg-slate-900/40 backdrop-blur-xl border border-white/5 p-5 sm:p-6 rounded-3xl flex flex-col justify-between gap-4 hover:border-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 group overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${glowColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2`} />

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">{value}</p>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium">{label}</p>
                </div>
                <div className={`p-3 rounded-2xl ${bg} ${color} ring-1 ring-inset ring-white/10 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
            </div>
        </motion.div>
    );
}

export function SectionHeader({ title, link }) {
    return (
        <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{title}</h2>
            {link && (
                <Link to={link || "#"} className="group flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-blue-400 transition-colors">
                    Voir tout
                    <span className="bg-slate-800 rounded-full p-0.5 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                        <ChevronRight size={14} />
                    </span>
                </Link>
            )}
        </div>
    );
}

export function OfferCard({ role, company, location, type, time, logo, acceptedCount, applicationCount, interviewQuota, description, onApply, applyLoading, onSave, saveLoading, isSaved, isApplied, isInvited, wasInvited, applicationStatus, onClick }) {
    const isFull = acceptedCount !== undefined && interviewQuota !== undefined && acceptedCount >= interviewQuota;
    // Places Remaining now decrements per application (applicationCount) instead of just acceptedCount
    // This creates a sense of "spots left in the queue" or urgency for the student.
    const placesRemaining = interviewQuota !== undefined ? Math.max(0, interviewQuota - (applicationCount || 0)) : null;
    const isUrgent = placesRemaining !== null && placesRemaining < 5 && placesRemaining > 0;

    return (
        <div
            onClick={onClick}
            className={`relative block backdrop-blur-sm border rounded-3xl p-4 sm:p-5 transition-all group cursor-pointer overflow-hidden ${isFull
                ? "bg-slate-900/20 border-white/5 opacity-70 grayscale-[0.5]"
                : "bg-slate-900/40 border-white/5 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-0.5"
                }`}
        >
            <div className={`absolute inset-0 bg-gradient-to-r transition-all duration-700 ${isFull ? "from-red-600/5 to-transparent" : "from-blue-600/0 via-blue-600/0 to-blue-600/0 group-hover:via-blue-600/5"}`} />

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 sm:gap-5 overflow-hidden flex-1 w-full md:w-auto">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform shrink-0 relative">
                        {logo ? (
                            <img src={logo} alt={company} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white font-bold text-xl">{company ? company.substring(0, 2).toUpperCase() : "??"}</span>
                        )}
                        {isFull && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-[8px] sm:text-[10px] font-black text-white uppercase transform -rotate-12 border-2 border-white/20 px-1 py-0.5 rounded">Complet</span>
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-base sm:text-lg truncate">{role}</h3>
                            {isFull && <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-500 text-[10px] font-bold uppercase border border-red-500/20">Saturé</span>}
                            {isUrgent && (
                                <span className="px-2 py-0.5 rounded-lg bg-red-600/20 text-red-500 text-[10px] font-black uppercase border border-red-500/30 flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse">
                                    <AlertCircle size={10} strokeWidth={3} /> URGENT
                                </span>
                            )}
                        </div>
                        <p className="text-slate-400 text-sm mb-2 font-medium truncate">{company}</p>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 font-bold uppercase tracking-wide">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {location}</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span className="flex items-center gap-1"><Briefcase size={12} /> {type}</span>
                            {placesRemaining !== null && (
                                <>
                                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                    <span className={`flex items-center gap-1 font-bold ${isUrgent ? 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.3)] animate-pulse' : 'text-slate-500'}`}>
                                        <Users size={12} strokeWidth={isUrgent ? 2.5 : 2} /> {placesRemaining} Place{placesRemaining > 1 ? 's' : ''} Restante{placesRemaining > 1 ? 's' : ''}
                                    </span>
                                </>
                            )}
                            <span className="hidden sm:block w-1 h-1 bg-slate-700 rounded-full" />
                            <span className="hidden sm:block text-slate-600">{time}</span>
                        </div>
                        {description && (
                            <p className="text-slate-400 text-sm mt-3 line-clamp-2 leading-relaxed font-normal normal-case hidden sm:block">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                    {onApply && (
                        <button
                            disabled={isApplied || isFull || isInvited || applyLoading} // Disable if invited too
                            onClick={(e) => { e.stopPropagation(); if (!isApplied && !isFull && !isInvited && !applyLoading) onApply(); }}
                            className={`flex-1 md:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap flex items-center justify-center gap-2 ${isApplied
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default shadow-none"
                                : isInvited
                                    ? "bg-slate-700/50 text-slate-400 border border-slate-600/30 cursor-default shadow-none" // Grisé pour Invité
                                    : isFull
                                        ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-white/5"
                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 hover:shadow-blue-600/40"
                                } ${applyLoading ? "opacity-80 cursor-wait" : ""}`}
                        >
                            {applyLoading ? <Loader2 size={16} className="animate-spin" /> : (
                                isApplied ? (wasInvited ? "Invitation Acceptée" : applicationStatus === 'ACCEPTED' ? "Accepté" : "Postulé") : isInvited ? "Invité" : isFull ? "Complet" : "Postuler"
                            )}
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); if (onSave && !saveLoading) onSave(); }}
                        disabled={saveLoading}
                        className={`self-end p-2 sm:p-2.5 rounded-xl transition-all border ${isSaved ? "bg-pink-500/10 text-pink-500 border-pink-500/20" : "bg-slate-800/50 text-slate-500 border-transparent hover:bg-slate-800 hover:text-white"}`}
                    >
                        {saveLoading ? <Loader2 size={18} className="animate-spin text-slate-400" /> : <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function InterviewWidget({ nextInterview }) {
    const handleAddToCalendar = () => {
        if (!nextInterview) return;
        const { role, company, date, time } = nextInterview;

        const title = encodeURIComponent(`Entretien avec ${company} - ${role}`);
        const details = encodeURIComponent(`Entretien pour le poste de ${role} chez ${company}.`);
        const location = encodeURIComponent("Universite de djibouti, campus de balbala");

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
        window.open(googleCalendarUrl, '_blank');
    };

    if (!nextInterview) {
        return (
            <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:border-white/10 transition-colors">
                <div>
                    <h3 className="text-white font-bold text-lg mb-1">Aucun entretien prévu</h3>
                    <p className="text-slate-400 text-sm">Postulez aux offres pour décrocher un RDV !</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                    <Calendar size={24} />
                </div>
            </div>
        );
    }

    const isVideo = nextInterview.link && nextInterview.link.startsWith('http');

    return (
        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <Calendar className="text-emerald-500" size={80} strokeWidth={1} style={{ opacity: 0.1, transform: 'rotate(15deg)' }} />
            </div>

            <div className="relative z-10 w-full">
                <div className="flex justify-between items-center mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Prochain Entretien
                    </span>
                    <span className="text-white font-bold font-mono text-lg">{nextInterview.time}</span>
                </div>

                <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden shrink-0 shadow-lg relative bg-white">
                        {nextInterview.logo ? (
                            <img src={nextInterview.logo} alt={nextInterview.company} className="w-full h-full object-contain p-1" />
                        ) : (
                            <span className="text-slate-900 font-bold text-lg">{nextInterview.company ? nextInterview.company.substring(0, 2).toUpperCase() : "??"}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                            Entretien avec <br />
                            <span className="text-emerald-400 text-lg sm:text-xl">{nextInterview.company}</span>
                        </h3>
                        <p className="text-slate-400 text-sm font-medium truncate mt-1">Pour : {nextInterview.role}</p>
                    </div>
                </div>

                <div className="space-y-3 mb-6 bg-slate-900/30 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold leading-tight line-clamp-2">{nextInterview.room ? `Salle ${nextInterview.room}` : "Université de Djibouti, Campus Balbala"}</p>
                            <p className="text-[10px] sm:text-xs truncate text-slate-400">{nextInterview.room ? "Université de Djibouti, Campus de Balbala" : "Salle à confirmer"}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleAddToCalendar}
                        className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        <Calendar size={16} />
                        Mettre dans son calendrier
                    </button>
                    {/* {isVideo && (
                        <a href={nextInterview.link} target="_blank" rel="noreferrer" className="flex-1 py-3 px-4 rounded-xl bg-white text-emerald-900 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors shadow-lg cursor-pointer">
                            <Video size={16} />
                            Visio
                        </a>
                    )} */}
                </div>
            </div>
        </div>
    );
}

export function AIPitchWidget({ onGenerate }) {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white text-center shadow-xl shadow-indigo-900/20 group">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <Sparkles size={28} className="text-yellow-300" />
                </div>

                <h3 className="text-xl font-bold mb-2">Pitch Generator IA</h3>
                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                    Laissez l'IA créer une présentation percutante pour vos entretiens en quelques secondes.
                </p>

                <button
                    onClick={onGenerate}
                    className="group/btn w-full bg-white text-indigo-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
                >
                    Générer mon pitch
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}

export function TokenInfoWidget({ tokens = 5 }) {
    return (
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <Sparkles className="text-amber-500" size={80} strokeWidth={1} style={{ opacity: 0.1, transform: 'rotate(15deg)' }} />
            </div>

            <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 text-sm">⚡</span>
                    Système de Jetons
                </h3>

                <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl font-extrabold text-amber-500">{tokens}</div>
                    <div className="text-sm text-slate-400 font-medium leading-tight">
                        Jetons<br />Disponibles
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="min-w-[24px] h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-500 mt-0.5">1</div>
                        <p className="text-sm text-slate-300"> 1 Candidature = 1 Jeton consommé.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="min-w-[24px] h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-500 mt-0.5">2</div>
                        <p className="text-sm text-slate-300"><strong>Refus = Remboursement</strong> automatique !</p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500 italic text-center">
                    Choisissez bien vos offres pour maximiser vos chances !
                </div>
            </div>
        </div>
    );
}
