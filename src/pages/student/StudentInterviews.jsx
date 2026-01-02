import { useState, useEffect } from "react";
import { studentApi } from "../../api/studentApi";
import { Calendar, MapPin, MessageSquare, Star, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentInterviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

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

    const handleViewFeedback = async (interviewId) => {
        setFeedbackLoading(interviewId);
        try {
            const feedback = await studentApi.getFeedback(interviewId);
            if (feedback) {
                setSelectedFeedback(feedback);
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
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 relative">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Calendar className="text-blue-500" /> Mes Entretiens
            </h1>
            <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">Consultez vos entretiens programmés avec les entreprises.</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Rechercher un entretien..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                    <option value="ALL">Tous les statuts</option>
                    <option value="SCHEDULED">Programmés</option>
                    <option value="COMPLETED">Terminés</option>
                </select>
            </div>

            {filteredInterviews.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} className="text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Aucun entretien trouvé</h3>
                    <p className="text-slate-400">Essayez de modifier vos filtres de recherche.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInterviews.map(int => {
                        const status = int.status ? int.status.toUpperCase() : "";
                        const handleCalendar = () => {
                            const title = encodeURIComponent(`Entretien ${int.companyName} - ${int.title}`);
                            const details = encodeURIComponent(`Entretien pour le poste de ${int.title} chez ${int.companyName}.`);
                            const location = encodeURIComponent("Universite de djibouti, campus de balbala");
                            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
                            window.open(googleCalendarUrl, '_blank');
                            toast.success("Redirection vers Google Agenda...");
                        };

                        return (
                            <div key={int.id} className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm border border-emerald-500/20 rounded-3xl p-5 sm:p-6 group hover:border-emerald-500/40 transition-all hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-1">
                                {/* Background Pattern */}
                                <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none">
                                    <Calendar className="text-emerald-500" size={80} strokeWidth={1} style={{ opacity: 0.1, transform: 'rotate(15deg)' }} />
                                </div>

                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-sm ${status === 'SCHEDULED'
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-900/20"
                                            : status === 'COMPLETED'
                                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                : "bg-slate-700/50 text-slate-400 border-slate-600/50"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${status === 'SCHEDULED' ? "bg-emerald-500 animate-pulse" : status === 'COMPLETED' ? "bg-blue-500" : "bg-slate-400"}`} />
                                            {status === 'SCHEDULED' ? 'Programmé' : status === 'COMPLETED' ? 'Terminé' : status}
                                        </span>
                                        <div className="text-right">
                                            <p className="text-white font-bold font-mono text-base sm:text-lg leading-none">{formatTime(int.date)}</p>
                                            <p className="text-emerald-500/80 text-xs font-bold uppercase tracking-wide mt-1">{formatDate(int.date)}</p>
                                        </div>
                                    </div>

                                    {/* Company Info */}
                                    <div className="flex items-start gap-3 sm:gap-4 mb-6">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white flex items-center justify-center border border-white/10 overflow-hidden shrink-0 shadow-lg p-1">
                                            {int.companyLogo ? (
                                                <img src={int.companyLogo} alt={int.companyName} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-slate-900 font-bold text-lg">{int.companyName ? int.companyName.substring(0, 2).toUpperCase() : "??"}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <h3 className="text-base sm:text-lg font-bold text-white leading-tight mb-1 truncate pr-2">
                                                {int.title}
                                            </h3>
                                            <p className="text-slate-400 text-sm font-medium truncate flex items-center gap-1">
                                                Chez <span className="text-emerald-400 font-bold">{int.companyName}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Location / Room */}
                                    <div className="bg-slate-950/30 rounded-2xl p-4 border border-white/5 mb-6 mt-auto">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-slate-200 text-sm font-bold leading-tight mb-1">
                                                    {int.room ? `Salle ${int.room}` : "Lieu à confirmer"}
                                                </p>
                                                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                                    Université de Djibouti, Campus de Balbala
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        {status === 'COMPLETED' ? (
                                            <button
                                                onClick={() => handleViewFeedback(int.id)}
                                                disabled={feedbackLoading === int.id}
                                                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm border border-blue-500/20 transition-all flex items-center justify-center gap-2 group/btn shadow-lg disabled:opacity-50"
                                            >
                                                {feedbackLoading === int.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <MessageSquare size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                        Voir Feedback
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleCalendar}
                                                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-white/10 transition-all flex items-center justify-center gap-2 group/btn shadow-lg"
                                            >
                                                <Calendar size={16} className="text-slate-400 group-hover/btn:text-white transition-colors" />
                                                Ajouter au calendrier
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Feedback Modal */}
            <AnimatePresence>
                {selectedFeedback && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFeedback(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10"
                        >
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="p-2 bg-slate-800 text-slate-400 rounded-full hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                                    <Star size={40} className="text-blue-400 drop-shadow-md" />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">Feedback</h3>
                                <p className="text-slate-400 font-medium">Poste de {selectedFeedback.jobTitle || "Candidat"}</p>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                        Note Globale
                                    </label>
                                    <div className="flex items-end gap-3">
                                        <span className="text-5xl font-black text-white tracking-tight">{selectedFeedback.rating || selectedFeedback.score || "?"}</span>
                                        <span className="text-xl text-slate-500 font-bold mb-1.5">/ 10</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-900 rounded-full mt-4 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                                            style={{ width: `${((selectedFeedback.rating || selectedFeedback.score || 0) / 10) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">Commentaires</label>
                                    <div className="max-h-40 overflow-y-auto custom-scrollbar">
                                        <p className="text-slate-300 leading-relaxed text-sm font-medium">
                                            "{selectedFeedback.comments || selectedFeedback.remarks || "Aucun commentaire fourni."}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-800">
                                <button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
