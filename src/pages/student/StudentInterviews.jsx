import { useState, useEffect } from "react";
import { studentApi } from "../../api/studentApi";
import { Calendar, MapPin, MessageSquare, Loader2, CheckCircle, Video, Clock, Trophy, PartyPopper, Search } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import { getUTCAsLocal } from "../../utils/dateUtils";

export default function StudentInterviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("ALL"); // 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'RETAINED'
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [checkInLoading, setCheckInLoading] = useState(null);

    const filteredInterviews = interviews.filter(int => {
        const matchesSearch = int.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            int.companyName.toLowerCase().includes(searchTerm.toLowerCase());

        const status = int.status ? int.status.toUpperCase() : "";

        let matchesStatus = true;
        if (activeTab === 'SCHEDULED') matchesStatus = (status === 'SCHEDULED' || status === 'ACCEPTED');
        else if (activeTab === 'COMPLETED') matchesStatus = status === 'COMPLETED';
        else if (activeTab === 'RETAINED') matchesStatus = Boolean(int.isRetained);

        return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    useEffect(() => {
        loadInterviews();
        // Optional: polling for live status updates if needed
        const interval = setInterval(loadInterviews, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadInterviews = async () => {
        try {
            const data = await studentApi.getInterviews();
            setInterviews(data);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des entretiens");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (id) => {
        setCheckInLoading(id);
        try {
            await studentApi.checkIn(id);
            toast.success("Présence confirmée ! L'entreprise est notifiée.");
            loadInterviews();
        } catch (error) {
            toast.error("Impossible de confirmer la présence (Trop tôt ?)");
        } finally {
            setCheckInLoading(null);
        }
    };

    const handleViewFeedback = async (interviewId) => {
        setFeedbackLoading(interviewId);
        try {
            const feedback = await studentApi.getFeedback(interviewId);
            if (feedback) {
                toast((t) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="min-w-[300px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-2xl relative"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                <MessageSquare size={18} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Feedback Entretien</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-lg">
                                <span className="text-xs font-bold text-slate-500 uppercase">Note</span>
                                <span className="text-lg font-black text-slate-900 dark:text-white">{feedback.rating || feedback.score || "?"}/10</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                                "{feedback.remarks || feedback.comments || "Aucun commentaire."}"
                            </p>
                        </div>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold uppercase rounded-lg transition-colors"
                        >
                            Fermer
                        </button>
                    </motion.div>
                ), { duration: 6000, style: { background: 'transparent', boxShadow: 'none' } });
            } else {
                toast("Aucun feedback disponible pour le moment", { icon: "ℹ️" });
            }
        } catch (error) {
            console.error(error);
            toast.error("Impossible de récupérer le feedback");
        } finally {
            setFeedbackLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(getUTCAsLocal(dateStr));
        return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        const date = new Date(getUTCAsLocal(dateStr));
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
        </div>
    );

    return (
        <div className="max-w-screen-2xl mx-auto px-4 py-6 sm:py-8 relative pb-24">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-primary mb-2 flex items-center gap-3">
                <Calendar className="text-blue-600 dark:text-blue-400" /> Mes Entretiens
            </h1>
            <p className="text-theme-secondary mb-6 sm:mb-8 text-sm sm:text-base">Consultez vos entretiens et confirmez votre présence.</p>

            {/* Counts Calculation */}
            {(() => {
                const counts = {
                    ALL: interviews.length,
                    SCHEDULED: interviews.filter(i => i.status === 'SCHEDULED' || i.status === 'ACCEPTED').length,
                    COMPLETED: interviews.filter(i => i.status === 'COMPLETED').length,
                    RETAINED: interviews.filter(i => Boolean(i.isRetained)).length
                };

                return (
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-2 rounded-2xl shadow-sm mb-8">
                        {/* Left: Categories with Badges */}
                        <div className="flex gap-1 bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto border border-slate-200 dark:border-white/10 no-scrollbar">
                            <TabButton active={activeTab === 'ALL'} onClick={() => setActiveTab('ALL')} label="Tous" count={counts.ALL} />
                            <TabButton active={activeTab === 'SCHEDULED'} onClick={() => setActiveTab('SCHEDULED')} label="À venir" count={counts.SCHEDULED} />
                            <TabButton active={activeTab === 'COMPLETED'} onClick={() => setActiveTab('COMPLETED')} label="Terminés" count={counts.COMPLETED} />
                            <TabButton
                                active={activeTab === 'RETAINED'}
                                onClick={() => setActiveTab('RETAINED')}
                                label="Mes Réussites"
                                count={counts.RETAINED}
                                icon={Trophy}
                                className={activeTab === 'RETAINED' ? "bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 shadow-lg shadow-yellow-500/20" : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"}
                            />
                        </div>

                        {/* Right: Search Bar */}
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-focus-within:border-blue-500/50 rounded-xl py-3 pl-12 pr-4 text-theme-primary placeholder:text-theme-secondary focus:outline-none transition-all font-medium focus:bg-white dark:focus:bg-slate-800"
                            />
                        </div>
                    </div>
                );
            })()}

            {filteredInterviews.length === 0 ? (
                <EmptyState
                    icon={activeTab === 'RETAINED' ? Trophy : Calendar}
                    title={activeTab === 'RETAINED' ? "Pas encore de résultats" : "Aucun entretien trouvé"}
                    description={activeTab === 'RETAINED' ? "Continuez vos efforts, votre talent finira par payer !" : "Essayez de modifier vos filtres de recherche."}
                    color={activeTab === 'RETAINED' ? "yellow" : "purple"}
                />
            ) : (
                <div className={`grid grid-cols-1 ${activeTab === 'RETAINED' ? 'md:grid-cols-2 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                    {filteredInterviews.map((int, idx) => {
                        // RETAINED CARD DESIGN
                        if (activeTab === 'RETAINED') {
                            return (
                                <motion.div
                                    key={int.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative overflow-hidden glass-panel border border-amber-200 dark:border-amber-500/30 shadow-lg hover:shadow-xl rounded-[2rem] p-8 group transition-all bg-gradient-to-br from-amber-50/50 via-white/50 to-orange-50/50 dark:from-amber-500/5 dark:via-slate-900 dark:to-orange-500/5"
                                >
                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/10 rounded-tr-full -ml-8 -mb-8 z-0"></div>

                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 p-2 shadow-xl mb-6 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center relative">
                                            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white p-2 rounded-full shadow-lg rotate-12">
                                                <Trophy size={20} fill="currentColor" />
                                            </div>
                                            {int.companyLogo ? (
                                                <img src={int.companyLogo} alt={int.companyName} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-2xl font-black text-amber-900 dark:text-amber-100">{int.companyName?.substring(0, 2).toUpperCase()}</span>
                                            )}
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{int.companyName}</h3>
                                        <div className="px-4 py-1.5 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-full font-bold text-xs uppercase tracking-wider mb-6">
                                            {int.title}
                                        </div>

                                        <div className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-2xl border border-amber-100 dark:border-amber-500/10 w-full mb-6 backdrop-blur-sm">
                                            <div className="flex items-center justify-center gap-2 mb-3 text-amber-500">
                                                <PartyPopper size={24} />
                                            </div>
                                            <p className="text-slate-800 dark:text-slate-200 font-bold italic">
                                                "Félicitations ! Votre profil a retenu toute notre attention. Vous faites partie des candidats sélectionnés pour la suite du processus."
                                            </p>
                                        </div>

                                        <a href={`mailto:${int.companyEmail}`} className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center gap-2">
                                            <MessageSquare size={18} /> Contacter l'entreprise
                                        </a>
                                    </div>
                                </motion.div>
                            );
                        }

                        // STANDARD CARD DESIGN
                        const status = int.status ? int.status.toUpperCase() : "";
                        const dateObj = new Date(getUTCAsLocal(int.date));
                        const isToday = new Date().toDateString() === dateObj.toDateString();

                        return (
                            <div key={int.id} className="relative overflow-hidden glass-panel border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-1 rounded-3xl p-5 sm:p-6 group transition-all">

                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex flex-col gap-2">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm w-fit ${status === 'ACCEPTED'
                                                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 text-sm font-black uppercase tracking-widest"
                                                : status === 'SCHEDULED'
                                                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 text-xs font-bold uppercase tracking-wider"
                                                    : status === 'COMPLETED'
                                                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20 text-xs font-bold uppercase tracking-wider"
                                                        : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider"
                                                }`}>
                                                <span className={`rounded-full ${status === 'ACCEPTED' ? "w-2.5 h-2.5 bg-emerald-600 animate-pulse" : status === 'SCHEDULED' ? "w-2 h-2 bg-emerald-500 animate-pulse" : status === 'COMPLETED' ? "w-2 h-2 bg-blue-500" : "w-2 h-2 bg-slate-400"}`} />
                                                {status === 'ACCEPTED' ? "Accepté" : status === 'SCHEDULED' ? (isToday ? "Aujourd'hui" : "Programmé") : status === 'COMPLETED' ? 'Terminé' : status}
                                            </span>

                                            {int.isRetained && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 w-fit">
                                                    🎉 Retenu
                                                </span>
                                            )}
                                            {int.source === 'INVITATION' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20 w-fit">
                                                    ✨ Invitation
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 w-fit">
                                                    📝 Candidature
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-500 font-bold font-mono text-base sm:text-lg leading-none">{formatTime(int.date)}</p>
                                            <p className="text-gray-700 text-xs font-bold uppercase tracking-wide mt-1">{formatDate(int.date)}</p>
                                        </div>
                                    </div>

                                    {/* Company Info */}
                                    <div className="flex items-start gap-3 sm:gap-4 mb-6">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 overflow-hidden shrink-0 shadow-sm p-1">
                                            {int.companyLogo ? (
                                                <img src={int.companyLogo} alt={int.companyName} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-slate-900 dark:text-white font-bold text-lg">{int.companyName ? int.companyName.substring(0, 2).toUpperCase() : "??"}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <h3 className="text-base sm:text-lg font-bold text-theme-primary leading-tight mb-1 truncate pr-2">
                                                {int.title}
                                            </h3>
                                            <p className="text-theme-secondary text-sm font-medium truncate flex items-center gap-1">
                                                Chez <span className="text-blue-900 font-bold">{int.companyName}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Location / Room */}
                                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10 mb-6 mt-auto">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-theme-primary text-sm font-bold leading-tight mb-1">
                                                    {int.room ? `Salle ${int.room}` : "Lieu à confirmer"}
                                                </p>
                                                <p className="text-theme-secondary text-xs font-medium leading-relaxed">
                                                    Université de Djibouti, Campus de Balbala
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-3">
                                        {status === 'COMPLETED' ? (
                                            <Button
                                                onClick={() => handleViewFeedback(int.id)}
                                                isLoading={feedbackLoading === int.id}
                                                className="w-full"
                                                variant="primary"
                                                icon={MessageSquare}
                                            >
                                                Voir Feedback
                                            </Button>
                                        ) : (
                                            <>
                                                {/* CHECK-IN BUTTON */}
                                                {!int.checkedIn ? (
                                                    <Button
                                                        onClick={() => handleCheckIn(int.id)}
                                                        isLoading={checkInLoading === int.id}
                                                        disabled={status !== 'SCHEDULED'}
                                                        className="w-full bg-emerald-500 hover:bg-emerald-400 border-none shadow-lg shadow-emerald-500/20"
                                                        variant="primary" // Custom override via className
                                                        icon={CheckCircle}
                                                    >
                                                        Je suis là (Check-in)
                                                    </Button>
                                                ) : (
                                                    <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs text-center uppercase tracking-widest flex items-center justify-center gap-2">
                                                        <CheckCircle size={16} /> Présence Validée
                                                    </div>
                                                )}

                                                {/* Meet Link */}
                                                {int.meetLink && (
                                                    <Button
                                                        href={int.meetLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={() => toast.success("Ouverture de la salle virtuelle...")}
                                                        className={`w-full ${!int.checkedIn ? 'opacity-50 pointer-events-none' : ''}`}
                                                        variant="primary"
                                                        icon={Video}
                                                    >
                                                        Rejoindre Visio
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function TabButton({ active, onClick, label, count, icon: Icon, className }) {
    // Custom className button (Retained)
    if (className) {
        return (
            <button
                onClick={onClick}
                className={`py-2 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${className}`}
            >
                {Icon && <Icon size={16} />}
                {label}
                {count > 0 && (
                    <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[10px] ml-1">
                        {count}
                    </span>
                )}
            </button>
        )
    }

    // Standard buttons
    return (
        <button
            onClick={onClick}
            className={`py-2 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${active
                ? "bg-white dark:bg-white/10 text-theme-primary shadow-sm"
                : "text-theme-secondary hover:text-theme-primary hover:bg-white/50 dark:hover:bg-white/5"
                }`}
        >
            {label}
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${active ? 'bg-slate-100 dark:bg-white/20' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>
                {count || 0}
            </span>
        </button>
    );
}
