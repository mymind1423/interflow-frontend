import { useState, useEffect } from "react";
import { companyApi } from "../../api/companyApi";
import { exportToExcel } from "../../utils/excelExporter";
import { Calendar, Clock, Video, User, CheckCircle, Phone, MapPin, GraduationCap, LayoutGrid, List, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { calculateAge, getUTCAsLocal } from "../../utils/dateUtils";

export default function CompanyPlanning() {
    const [interviews, setInterviews] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState("card");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInterviews();
    }, []);

    const loadInterviews = async () => {
        try {
            const data = await companyApi.getInterviews();
            setInterviews(data);
        } catch (err) {
            console.error(err);
            toast.error("Impossible de charger le planning");
        } finally {
            setLoading(false);
        }
    };

    const getCategory = (interview) =>
        interview.source === 'INVITATION' ? 'INVITE' : 'NORMAL';

    const filteredInterviews = interviews.filter(i => {
        if (filter === "ALL") return true;
        return getCategory(i) === filter;
    }).sort((a, b) => new Date(a.dateTime || a.date) - new Date(b.dateTime || b.date));

    // Group interviews by date for a nicer layout
    const groupedInterviews = filteredInterviews.reduce((acc, curr) => {
        const dateSource = curr.dateTime || curr.date;
        if (!dateSource) return acc;

        let dateKey;
        if (typeof dateSource === 'string') {
            try { dateKey = dateSource.split('T')[0]; } catch (e) { dateKey = new Date(dateSource).toISOString().split('T')[0]; }
        } else if (dateSource instanceof Date) {
            dateKey = dateSource.toISOString().split('T')[0];
        } else {
            dateKey = new Date().toISOString().split('T')[0];
        }

        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(curr);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedInterviews).sort();

    const handleExport = () => {
        // Flatten interviews
        const allInterviews = sortedDates.flatMap(date => groupedInterviews[date]);

        if (allInterviews.length === 0) {
            toast.error("Aucune donnée à exporter");
            return;
        }

        const columns = [
            { header: "Date", key: "date", width: 15 },
            { header: "Heure", key: "time", width: 10 },
            { header: "Candidat", key: "name", width: 30 },
            { header: "Téléphone", key: "phone", width: 20 },
            { header: "Domaine", key: "domain", width: 25 },
            { header: "Niveau", key: "grade", width: 15 },
            { header: "Type", key: "type", width: 15 },
            { header: "Lieu / Lien", key: "location", width: 30 },
        ];

        const data = allInterviews.map(interview => ({
            date: format(getUTCAsLocal(interview.dateTime), "dd/MM/yyyy"),
            time: format(getUTCAsLocal(interview.dateTime), "HH:mm"),
            name: interview.studentName || "",
            phone: interview.studentPhone || "",
            domain: interview.studentDomaine || "",
            grade: interview.studentGrade || "",
            type: getCategory(interview) === 'INVITE' ? "Invitation" : "Candidature",
            location: interview.meetLink && interview.meetLink.includes('http') ? "Visio" : `Salle ${interview.room || "?"}`
        }));

        exportToExcel(`Planning_${format(new Date(), "yyyyMMdd")}`, "Planning", columns, data, `Planning des Entretiens - ${format(new Date(), "dd/MM/yyyy")}`);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-6 flex items-center gap-3">
                <Calendar className="text-blue-500" /> Planning des Entretiens
            </h1>

            {/* Controls Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                {/* Filter Tabs */}
                <div className="flex glass-panel !p-1 gap-1 shadow-sm rounded-xl">
                    <button
                        onClick={() => setFilter("ALL")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === "ALL" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md" : "text-theme-secondary hover:text-theme-primary hover:bg-black/5 dark:hover:bg-white/5"}`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setFilter("NORMAL")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filter === "NORMAL" ? "bg-blue-600 shadow-md shadow-blue-200 dark:shadow-blue-900/40 text-white" : "text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5"}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${filter === "NORMAL" ? "bg-white" : "bg-blue-500"}`}></div>
                        Candidatures
                    </button>
                    <button
                        onClick={() => setFilter("INVITE")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filter === "INVITE" ? "bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-purple-900/40" : "text-theme-secondary hover:text-purple-600 dark:hover:text-purple-400 hover:bg-black/5 dark:hover:bg-white/5"}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${filter === "INVITE" ? "bg-white" : "bg-purple-500"}`}></div>
                        Invités (VIP)
                    </button>
                </div>

                {/* View Toggle */}
                <div className="flex glass-panel !p-1 gap-1 shadow-sm rounded-lg">
                    <button
                        onClick={handleExport}
                        className="p-2 rounded-lg text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                        title="Exporter en CSV"
                    >
                        <Download size={18} />
                    </button>
                    <div className="w-px bg-slate-200 dark:bg-white/10 mx-1 my-1"></div>
                    <button
                        onClick={() => setViewMode("card")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm" : "text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5"}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm" : "text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5"}`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={48} className="text-blue-500 animate-spin" />
                </div>
            ) : sortedDates.length === 0 ? (
                <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl border-dashed glass-panel">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200 dark:border-white/10">
                        <Calendar size={32} className="text-theme-secondary" />
                    </div>
                    <p className="text-theme-secondary font-medium">Aucun entretien trouvé pour ce filtre.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedDates.map(date => (
                        <div key={date} className="animate-fade-in-up">
                            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-6 pl-4 border-l-4 border-indigo-500 flex items-center gap-3">
                                {format(getUTCAsLocal(date), "EEEE d MMMM yyyy", { locale: fr })}
                            </h2>
                            <div className={viewMode === 'card' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
                                {groupedInterviews[date].map(interview => {
                                    const isInvite = getCategory(interview) === 'INVITE';

                                    if (viewMode === 'list') {
                                        return (
                                            <div key={interview.id} className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all hover:bg-white/5 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer glass-panel
                                                ${isInvite ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-500/30 hover:border-purple-300 dark:hover:border-purple-500/50' : 'bg-white/20 dark:bg-slate-900 border-white/10 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50'}`}>

                                                {/* Time */}
                                                <div className={`font-mono font-bold px-2 py-1.5 rounded-lg text-xs shadow-sm border
                                                ${isInvite ? 'bg-purple-100 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300' : 'bg-white/10 border-white/10 text-theme-secondary'}`}>
                                                    {format(getUTCAsLocal(interview.dateTime), "HH:mm")}
                                                </div>

                                                {/* Avatar */}
                                                <div className={`w-10 h-10 shrink-0 rounded-full overflow-hidden border-2 shadow-sm ${isInvite ? 'border-purple-200 dark:border-purple-500/30' : 'border-blue-100 dark:border-blue-500/30'}`}>
                                                    {interview.studentPhoto ? <img src={interview.studentPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-theme-secondary font-bold" >{interview.studentName?.substring(0, 2) || "??"}</div>}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-theme-primary text-sm truncate">{interview.studentName}</p>
                                                    <div className="flex items-center gap-2 text-xs text-theme-secondary">
                                                        <span>{interview.studentPhone}</span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span className={`hidden sm:inline font-bold ${isInvite ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>{interview.studentDomaine}</span>
                                                        {interview.studentDateOfBirth && (
                                                            <>
                                                                <span className="hidden sm:inline">•</span>
                                                                <span>{calculateAge(interview.studentDateOfBirth)} ans</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {interview.meetLink && interview.meetLink.includes('http') ? (
                                                        <a href={interview.meetLink} target="_blank" rel="noreferrer" className={`p-2 rounded-lg transition-colors ${isInvite ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20" : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20"}`} title="Rejoindre">
                                                            <Video size={16} />
                                                        </a>
                                                    ) : (
                                                        <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs font-bold text-theme-secondary">
                                                            Salle {interview.room || "?"}
                                                        </div>
                                                    )}
                                                    <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(interview.title || "Entretien")}&dates=${format(new Date(interview.dateTime), "yyyyMMdd'T'HHmmss")}/${format(new Date(new Date(interview.dateTime).getTime() + 30 * 60000), "yyyyMMdd'T'HHmmss")}&details=Entretien+avec+${encodeURIComponent(interview.studentName)}`}
                                                        target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/10 text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border border-white/10" title="Ajouter au calendrier">
                                                        <Calendar size={16} />
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={interview.id} className={`group relative glass-panel border p-4 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col gap-4
                                            ${isInvite
                                                ? 'border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-500/50 shadow-purple-50 dark:shadow-purple-900/10'
                                                : 'border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-blue-50 dark:shadow-blue-900/10'}`}>

                                            {/* Line 1: Header */}
                                            <div className="flex items-center gap-4">
                                                <div className={`relative w-14 h-14 shrink-0 rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-md
                                                    ${isInvite ? 'ring-purple-500' : 'ring-blue-500'}`}>
                                                    {interview.studentPhoto ? (
                                                        <img src={interview.studentPhoto} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className={`w-full h-full flex items-center justify-center font-bold text-lg bg-slate-100 dark:bg-white/10 text-theme-secondary`}>
                                                            {(interview.studentName || "XX").substring(0, 2)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-lg font-black text-theme-primary tracking-tight truncate pr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={interview.studentName}>
                                                            {interview.studentName}
                                                        </h3>
                                                        <div className={`px-2 py-1 rounded-md text-xs font-bold border font-mono
                                                            ${isInvite ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30' : 'bg-white/10 text-theme-secondary border-white/10'}`}>
                                                            {format(getUTCAsLocal(interview.dateTime), "HH:mm")}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-theme-secondary mt-1">
                                                        <Phone size={12} className={isInvite ? "text-purple-500" : "text-blue-500"} />
                                                        <span className="font-mono tracking-wide">{interview.studentPhone || "00 00 00 00"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Line 2: Domain & Level */}
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className={`px-3 py-1.5 rounded-lg font-bold truncate max-w-[65%] shadow-sm
                                                    ${isInvite
                                                        ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                                                        : 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30'}`}>
                                                    {interview.studentDomaine}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-theme-secondary font-medium px-2">
                                                    <GraduationCap size={14} />
                                                    <span>{interview.studentGrade || "N/A"}</span>
                                                    {interview.studentDateOfBirth && <span> • {calculateAge(interview.studentDateOfBirth)} ans</span>}
                                                </div>
                                            </div>

                                            {/* Line 3: Footer */}
                                            <div className={`pt-3 mt-auto border-t flex items-center justify-between gap-3
                                                ${isInvite ? 'border-purple-100 dark:border-purple-500/20' : 'border-white/10'}`}>

                                                <div className="flex-1 truncate">
                                                    {interview.meetLink && interview.meetLink.includes('http') ? (
                                                        <a href={interview.meetLink} target="_blank" rel="noreferrer"
                                                            className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg transition-all
                                                            ${isInvite
                                                                    ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 hover:bg-purple-600 hover:text-white'
                                                                    : 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white'}`}>
                                                            <Video size={14} />
                                                            <span>Rejoindre</span>
                                                        </a>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-xs text-theme-secondary px-2">
                                                            <MapPin size={14} className={isInvite ? "text-purple-500" : "text-theme-secondary"} />
                                                            <span className="font-bold">Salle {interview.room || "?"}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <a
                                                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(interview.title || "Entretien")}&dates=${format(getUTCAsLocal(interview.dateTime), "yyyyMMdd'T'HHmmss")}/${format(getUTCAsLocal(new Date(new Date(interview.dateTime).getTime() + 30 * 60000)), "yyyyMMdd'T'HHmmss")}&details=Entretien+avec+${encodeURIComponent(interview.studentName)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-theme-secondary hover:bg-white/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm border border-white/10"
                                                    title="Ajouter au calendrier"
                                                >
                                                    <Calendar size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

