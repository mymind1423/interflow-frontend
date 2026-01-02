import { useState, useEffect } from "react";
import { studentApi } from "../../api/studentApi";
import { Clock, MapPin, Video, CheckCircle, Bell, MessageSquare, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentLiveSpace() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [checkInLoading, setCheckInLoading] = useState(null);
    const [feedbackLoading, setFeedbackLoading] = useState(null);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const data = await studentApi.getInterviews();
            setInterviews(data);

            const notifs = [];
            data.forEach(i => {
                if (i.status === 'DELAYED_NEXT') notifs.push({ type: 'delay', message: `L'entreprise ${i.companyName} a un peu de retard.`, id: i.id });
                if (i.status === 'CALLING_NEXT' || i.notificationType === 'ENTER_ROOM') notifs.push({ type: 'enter', message: `C'est à vous ! ${i.companyName} vous attend.`, id: i.id });
            });
            setNotifications(notifs);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (id) => {
        setCheckInLoading(id);
        try {
            await studentApi.checkIn(id);
            toast.success("Présence confirmée ! L'entreprise est notifiée.");
            loadData();
        } catch (error) {
            toast.error("Erreur lors du check-in");
        } finally {
            setCheckInLoading(false);
        }
    };

    const getFeedback = async (id) => {
        setFeedbackLoading(id);
        try {
            const feedback = await studentApi.getFeedback(id);
            // Allow empty feedback to show (handle relaxed check)
            if (feedback) {
                toast((t) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="min-w-[300px] bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl relative"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                <MessageSquare size={18} />
                            </div>
                            <h4 className="font-bold text-white">Feedback Entretien</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg">
                                <span className="text-xs font-bold text-slate-500 uppercase">Note</span>
                                <span className="text-lg font-black text-white">{feedback.rating || feedback.score || "?"}/10</span>
                            </div>
                            <p className="text-sm text-slate-300 italic">
                                "{feedback.remarks || feedback.comments || "Aucun commentaire."}"
                            </p>
                        </div>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded-lg transition-colors"
                        >
                            Fermer
                        </button>
                    </motion.div>
                ), { duration: 6000, style: { background: 'transparent', boxShadow: 'none' } });
            } else {
                toast("Aucun feedback disponible", { icon: "ℹ️" });
            }
        } catch (err) {
            toast.error("Impossible de récupérer le feedback.");
        } finally {
            setFeedbackLoading(false);
        }
    };

    const parseDate = (val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    };

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto min-h-screen pb-20">
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                <Video className="text-blue-500" size={32} />
                Espace Live
            </h1>
            <p className="text-slate-400 mb-8">Gérez vos entretiens du jour et recevez les notifications en temps réel.</p>

            {/* Notifications Area */}
            <AnimatePresence>
                {notifications.map(notif => (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={notif.id + notif.type}
                        className={`mb-6 p-4 rounded-2xl border flex items-center gap-4 shadow-xl ${notif.type === 'delay' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}
                    >
                        {notif.type === 'delay' ? <AlertTriangle size={24} /> : <Bell size={24} className="animate-bounce" />}
                        <div>
                            <h4 className="font-black text-lg uppercase tracking-wide">{notif.type === 'delay' ? 'Retard Signalé' : 'Entrez en Salle !'}</h4>
                            <p className="font-medium">{notif.message}</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Interviews List */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {interviews.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 border-dashed">
                            <p className="text-slate-500 font-bold">Aucun entretien programmé.</p>
                        </div>
                    ) : (
                        interviews.map(interview => {
                            const dateObj = parseDate(interview.date || interview.dateTime || interview.date_time);
                            // Normalize status for case-insensitive check
                            const status = interview.status ? interview.status.toUpperCase() : "";

                            return (
                                <div key={interview.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-900 transition-all shadow-lg">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-950 rounded-2xl flex flex-col items-center justify-center border border-slate-800 shadow-inner shrink-0">
                                            <span className="text-2xl font-black text-white">{dateObj ? dateObj.getDate() : "?"}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                {dateObj ? dateObj.toLocaleString('default', { month: 'short' }) : "-"}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white">{interview.companyName}</h3>
                                            <p className="text-blue-400 font-bold text-sm mb-2">{interview.jobTitle || "Entretien"}</p>
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-400 font-medium">
                                                <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-500" /> {dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Heure inconnue"}</span>
                                                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-500" /> {interview.location || "En ligne"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        {status === 'COMPLETED' ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="p-3 bg-slate-800 rounded-xl text-center text-slate-400 font-bold text-sm">Terminé</div>
                                                <button
                                                    onClick={() => getFeedback(interview.id)}
                                                    disabled={feedbackLoading === interview.id}
                                                    className="p-3 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {feedbackLoading === interview.id ? <Loader2 size={16} className="animate-spin" /> : <><MessageSquare size={16} /> Voir Feedback</>}
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {!interview.checkedIn ? (
                                                    <button
                                                        onClick={() => handleCheckIn(interview.id)}
                                                        disabled={checkInLoading === interview.id}
                                                        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {checkInLoading === interview.id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <><CheckCircle size={16} /> Je suis là (Check-in)</>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <div className="w-full py-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl font-bold text-xs text-center uppercase tracking-widest flex items-center justify-center gap-2">
                                                        <CheckCircle size={16} /> Présence Validée
                                                    </div>
                                                )}

                                                {interview.meetLink && (
                                                    <a
                                                        href={interview.meetLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={() => toast.success("Ouverture de la salle virtuelle...")}
                                                        className={`w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 ${!interview.checkedIn ? 'opacity-50 pointer-events-none' : ''}`}
                                                    >
                                                        <Video size={16} /> Rejoindre
                                                    </a>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
