import { useState, useEffect } from "react";
import { studentApi } from "../../api/studentApi";
import { Calendar, MapPin, MessageSquare, Loader2, CheckCircle, Video, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";

export default function StudentInterviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [checkInLoading, setCheckInLoading] = useState(null);

    const filteredInterviews = interviews.filter(int => {
        const matchesSearch = int.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            int.companyName.toLowerCase().includes(searchTerm.toLowerCase());

        const status = int.status ? int.status.toUpperCase() : "";
        const matchesStatus = filterStatus === "ALL" ||
            (filterStatus === "SCHEDULED" && status === "SCHEDULED") ||
            (filterStatus === "COMPLETED" && status === "COMPLETED");
        return matchesSearch && matchesStatus;
    });

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
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 relative pb-24">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-primary mb-2 flex items-center gap-3">
                <Calendar className="text-blue-600 dark:text-blue-400" /> Mes Entretiens
            </h1>
            <p className="text-theme-secondary mb-6 sm:mb-8 text-sm sm:text-base">Consultez vos entretiens et confirmez votre présence.</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8 glass-panel p-2 rounded-2xl shadow-md border border-white/60">
                <input
                    type="text"
                    placeholder="Rechercher un entretien..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-theme-primary placeholder-theme-secondary focus:outline-none focus:border-blue-500 transition-colors"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-theme-primary focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                    <option value="ALL">Tous les statuts</option>
                    <option value="SCHEDULED">Programmés</option>
                    <option value="COMPLETED">Terminés</option>
                </select>
            </div>

            {filteredInterviews.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title="Aucun entretien trouvé"
                    description="Essayez de modifier vos filtres de recherche ou attendez de nouvelles invitations."
                    color="purple"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInterviews.map(int => {
                        const status = int.status ? int.status.toUpperCase() : "";
                        const dateObj = new Date(int.date);
                        const isToday = new Date().toDateString() === dateObj.toDateString();

                        return (
                            <div key={int.id} className="relative overflow-hidden glass-panel border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-1 rounded-3xl p-5 sm:p-6 group transition-all">

                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-sm ${status === 'SCHEDULED'
                                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 shadow-sm"
                                            : status === 'COMPLETED'
                                                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
                                                : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${status === 'SCHEDULED' ? "bg-emerald-500 animate-pulse" : status === 'COMPLETED' ? "bg-blue-500" : "bg-slate-400"}`} />
                                            {status === 'SCHEDULED' ? (isToday ? "Aujourd'hui" : "Programmé") : status === 'COMPLETED' ? 'Terminé' : status}
                                        </span>
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
