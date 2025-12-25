import { useState, useEffect } from "react";
import { studentApi } from "../../api/studentApi";
import { Calendar, MapPin } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentInterviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    const filteredInterviews = interviews.filter(int => {
        const matchesSearch = int.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            int.companyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "ALL" ||
            (filterStatus === "SCHEDULED" && int.status === "SCHEDULED") ||
            (filterStatus === "COMPLETED" && int.status === "COMPLETED"); // Add more statuses if needed
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
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
                        const handleCalendar = () => {
                            const title = encodeURIComponent(`Entretien ${int.companyName} - ${int.title}`);
                            const details = encodeURIComponent(`Entretien pour le poste de ${int.title} chez ${int.companyName}.`);
                            const location = encodeURIComponent("Universite de djibouti, campus de balbala");
                            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
                            window.open(googleCalendarUrl, '_blank');
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
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-sm ${int.status === 'SCHEDULED'
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-900/20"
                                            : "bg-slate-700/50 text-slate-400 border-slate-600/50"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${int.status === 'SCHEDULED' ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                                            {int.status === 'SCHEDULED' ? 'Programmé' : int.status}
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
                                        <button
                                            onClick={handleCalendar}
                                            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-white/10 transition-all flex items-center justify-center gap-2 group/btn shadow-lg"
                                        >
                                            <Calendar size={16} className="text-slate-400 group-hover/btn:text-white transition-colors" />
                                            Ajouter au calendrier
                                        </button>
                                        {/* {int.meetLink && int.meetLink.includes('http') && (
                                            <a href={int.meetLink} target="_blank" rel="noreferrer" className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
                                                <Video size={16} />
                                                Rejoindre
                                            </a>
                                        )} */}
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

