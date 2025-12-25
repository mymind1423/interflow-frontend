import { useState, useEffect } from "react";
import { studentApi } from "../../api/studentApi";
import { Calendar, Building, Clock, MapPin, Video, ArrowRight, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function StudentInvitations() {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch all interviews, but we will filter or highlight those that are "invitations"
            // For now, an invitation is basically an interview that was directly accepted or where the application status is ACCEPTED
            // In our system, inviteStudent creates an interview with status 'ACCEPTED'.
            // In a better system, we'd have a flag. We'll show all scheduled interviews here as "Invitations / Entretiens".
            const data = await studentApi.getInterviews();
            // Sort by date upcoming
            const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
            setInvitations(sorted);
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors du chargement des invitations.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                    <UserCheck size={24} className="text-white sm:w-8 sm:h-8" />
                </div>
                Mes Invitations & Entretiens
            </h1>
            <p className="text-slate-400 mb-6 sm:mb-8 ml-0 sm:ml-16 text-sm sm:text-base">
                Retrouvez ici les entretiens programmés et les invitations reçues des entreprises.
            </p>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 mt-4 font-bold">Chargement de vos invitations...</p>
                </div>
            ) : invitations.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
                    <Calendar size={64} className="mx-auto text-slate-700 mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">Aucune invitation pour le moment</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Vous n'avez pas encore d'entretiens programmés. Complétez votre profil pour être visible dans le Vivier des talents !
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {invitations.map((interview) => {
                        const date = new Date(interview.date);
                        const isPast = date < new Date();

                        return (
                            <div
                                key={interview.id}
                                className={`relative group bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 transition-all hover:bg-slate-800/50 hover:border-slate-700 hover:shadow-xl hover:shadow-blue-900/10 ${isPast ? 'opacity-75 grayscale-[0.5]' : ''}`}
                            >
                                <div className="absolute top-6 right-6">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${isPast ? 'bg-slate-800 text-slate-500 border-slate-700' :
                                        interview.status === 'ACCEPTED' || interview.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            interview.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {isPast ? 'Terminé' : (interview.status === 'ACCEPTED' ? 'Confirmé' : interview.status)}
                                    </span>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                                    {/* Date Module */}
                                    <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">{format(date, 'MMM', { locale: fr })}</span>
                                        <span className={`text-xl sm:text-2xl font-black ${isPast ? 'text-slate-400' : 'text-blue-500'}`}>{format(date, 'dd')}</span>
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-500">{format(date, 'HH:mm')}</span>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                                            {interview.companyName}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-4">
                                            <span className="text-slate-500">Pour le poste :</span>
                                            <span className="text-white">{interview.jobTitle}</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                                                <div className="p-2 bg-slate-900 rounded-lg text-indigo-400">
                                                    <Video size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Lieu</p>
                                                    <p className="text-sm font-bold text-white line-clamp-2 leading-tight">{interview.room ? `Salle ${interview.room} - Université de Djibouti, Campus de Balbala` : "Université de Djibouti, Campus de Balbala"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                                                <div className="p-2 bg-slate-900 rounded-lg text-emerald-400">
                                                    <UserCheck size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Statut</p>
                                                    <p className="text-sm font-bold text-white">{interview.status === 'ACCEPTED' ? "Invitation acceptée" : "En attente"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {!isPast && interview.status === 'ACCEPTED' && (interview.room && interview.room.startsWith('http')) && (
                                    <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end">
                                        <a
                                            href={interview.room}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                        >
                                            <Video size={18} /> Rejoindre la réunion <ArrowRight size={16} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

