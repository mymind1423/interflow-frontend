import { useState, useEffect } from "react";
import { companyApi } from "../../api/companyApi";
import { Calendar, Clock, Video, User, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

export default function CompanyPlanning() {
    const [interviews, setInterviews] = useState([]);

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
        }
    };

    // Group interviews by date for a nicer layout
    const groupedInterviews = interviews.reduce((acc, curr) => {
        const dateSource = curr.dateTime || curr.date; // Use dateTime primarily
        if (!dateSource) return acc;

        let dateKey;
        // Check if date is string or Date object
        if (typeof dateSource === 'string') {
            // Handle if date is already ISO string or other format
            try {
                dateKey = dateSource.split('T')[0];
            } catch (e) {
                // Fallback if split fails or valid date
                dateKey = new Date(dateSource).toISOString().split('T')[0];
            }
        } else if (dateSource instanceof Date) {
            dateKey = dateSource.toISOString().split('T')[0];
        } else {
            // Last resort fallback
            dateKey = new Date().toISOString().split('T')[0];
        }

        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(curr);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedInterviews).sort();

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 flex items-center gap-3">
                <Calendar className="text-blue-500" /> Planning des Entretiens
            </h1>

            {sortedDates.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl border-dashed">
                    <Calendar size={48} className="mx-auto text-slate-500 mb-4 opacity-50" />
                    <p className="text-slate-400 font-medium">Aucun entretien planifié pour le moment.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedDates.map(date => (
                        <div key={date} className="animate-fade-in-up">
                            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-6 pl-4 border-l-4 border-indigo-500 flex items-center gap-3">
                                {format(new Date(date), "EEEE d MMMM yyyy", { locale: fr })}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupedInterviews[date].map(interview => (
                                    <div key={interview.id} className="group relative bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl hover:border-blue-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                                                    {interview.studentPhoto ? (
                                                        <img src={interview.studentPhoto} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                                                            {(interview.studentName || "XX").substring(0, 2)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white leading-tight">{interview.studentName}</h3>
                                                    <p className="text-xs text-blue-400 font-medium uppercase tracking-wide">{interview.studentDomaine}</p>
                                                </div>
                                            </div>
                                            <span className="bg-slate-950 text-slate-400 px-2 py-1 rounded text-xs font-mono font-bold border border-slate-800">
                                                {format(new Date(interview.dateTime), "HH:mm")}
                                            </span>
                                        </div>

                                        <div className="mb-6 space-y-2">
                                            <p className="text-sm text-slate-300 font-medium line-clamp-1" title={interview.title}>
                                                {interview.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><User size={12} /> {interview.studentGrade || "Niveau non spécifié"}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-slate-800">
                                            {interview.meetLink && interview.meetLink.includes('http') ? (
                                                <a
                                                    href={interview.meetLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                                                >
                                                    <Video size={16} /> Rejoindre Visio
                                                </a>
                                            ) : (
                                                <div className="flex flex-col items-center text-center p-2 bg-slate-800/50 rounded-xl border border-slate-800">
                                                    <p className="text-xs font-bold text-slate-300">
                                                        {interview.room ? `Salle ${interview.room}` : "Salle à confirmer"}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">
                                                        Université de Djibouti, Campus de Balbala
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

