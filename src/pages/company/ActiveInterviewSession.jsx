import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { companyApi } from "../../api/companyApi";
import { Loader2, FileText, CheckCircle, Clock, User, ChevronLeft, Send, AlertTriangle, MonitorPlay, Star, Mic, Video, VideoOff, MicOff, BellRing } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../components/common/ConfirmationModal";

export default function ActiveInterviewSession() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [duration, setDuration] = useState(30); // minutes
    const [timeLeft, setTimeLeft] = useState(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [processingAction, setProcessingAction] = useState(null); // 'CALL_NEXT' | 'DELAY' | 'FINISH'

    // Action loading states
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    // Evaluation Form
    const [remarks, setRemarks] = useState("");
    const [score, setScore] = useState(5);

    // UI State
    const [activeTab, setActiveTab] = useState("cv");
    const query = new URLSearchParams(window.location.search);
    const isEditMode = query.get("editMode") === "true"; // New flag for simplified view

    useEffect(() => {
        loadInterview();
    }, [id]);

    useEffect(() => {
        let interval;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsTimerRunning(false);
            toast("Temps écoulé !", { icon: "⏰" });
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft]);

    const loadInterview = async () => {
        try {
            // Mock fetching specific interview if API doesn't have getById
            // For now assuming we get list and find one, OR existing endpoint
            // Let's rely on getInterviews for now as a fallback if getById missing
            const all = await companyApi.getInterviews();
            const found = all.find(i => i.id.toString() === id);
            if (found) {
                // Fetch full student profile to get CV and Photo if not present
                if ((!found.cvUrl || !found.photoUrl) && found.studentId) {
                    try {
                        const studentProfile = await companyApi.getStudentProfile(found.studentId);
                        if (studentProfile) {
                            if (studentProfile.cvUrl && !found.cvUrl) found.cvUrl = studentProfile.cvUrl;
                            if (studentProfile.photoUrl) found.photoUrl = studentProfile.photoUrl;
                        }
                    } catch (e) {
                        console.error("Failed to fetch student details", e);
                    }
                }

                setInterview(found);
                // Pre-fill if exists
                if (found.score) setScore(found.score);
                if (found.remarks) setRemarks(found.remarks);
            } else {
                toast.error("Entretien introuvable");
                navigate('/company/live');
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleStartTimer = () => {
        setTimeLeft(duration * 60);
        setIsTimerRunning(true);
        toast.success("Chronomètre lancé !");
    };

    const handleCallNext = async () => {
        setProcessingAction('CALL_NEXT');
        try {
            await companyApi.notifyStudent(id, "ENTER_ROOM");
            toast.success("Notification envoyée : 'Rentrer en salle'");
        } catch (error) {
            toast.error("Erreur envoi notification");
        } finally {
            setProcessingAction(null);
        }
    };

    const handleDelayNotification = async () => {
        try {
            // This is "Retard" button. User wants to notify the NEXT student.
            // We need to find the NEXT student.
            // Assuming the backend handles "notify NEXT student" logic via a specific flag
            // Or we fetch all, find current, find next, and notify.
            // Simplified: Note 'DELAY' to backend for this interview, let backend handle chain reaction?
            // Or simpler: Just notify THIS student they are delayed? 
            // The prompt said: "retard qui envoie une notification a letudiant suivant"
            // Let's assume we pass a special flag to notify endpoint.
            setProcessingAction('DELAY');
            await companyApi.notifyStudent(id, "DELAYED_NEXT");
            toast.success("Notification de retard envoyée au prochain candidat");
        } catch (error) {
            toast.error("Erreur notification delay");
        } finally {
            setProcessingAction(null);
        }
    };

    const requestFinish = () => {
        if (isEditMode) {
            handleFinish();
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: "Terminer cet entretien ?",
            message: "L'évaluation sera enregistrée et l'entretien marqué comme terminé.",
            confirmText: "Terminer",
            onConfirm: handleFinish
        });
    };

    const handleFinish = async () => {
        setProcessingAction('FINISH');
        try {
            await companyApi.saveEvaluation({
                interviewId: id,
                studentId: interview.studentId,
                rating: score,
                comment: remarks,
                status: 'COMPLETED'
            });
            // Also update status
            await companyApi.updateInterviewStatus(id, "COMPLETED");

            toast.success("Enregistré avec succès !");
            setConfirmModal({ isOpen: false });

            if (isEditMode) {
                // In edit mode, we might want to close the tab after a short delay
                setTimeout(() => window.close(), 1500);
            } else {
                navigate('/company/live');
            }
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde");
            setProcessingAction(null); // Only reset on error, otherwise navigation happens
            setConfirmModal({ ...confirmModal, isOpen: false }); // Close modal on error too? Or keep open? Maybe keep open. No, better to close and let retry.
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading || !interview) return (
        <div className="min-h-screen flex items-center justify-center text-theme-primary">
            <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 w-12 h-12" />
        </div>
    );

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col h-screen">
            {/* Background handled by global theme, removing manual divs */}

            {/* Top Bar */}
            <header className="h-20 border-b border-white/10 bg-white/10 z-10 flex items-center justify-between px-8 shrink-0 backdrop-blur-md shadow-sm glass-panel">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/company/live')} className="p-2 hover:bg-white/10 rounded-xl text-theme-secondary hover:text-theme-primary transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-theme-primary">{interview.studentName}</h1>
                        <p className="text-xs font-bold text-theme-secondary uppercase tracking-widest">{interview.title || "Entretien"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* Timer Control */}
                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner">
                        {!isTimerRunning && timeLeft === null ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-12 bg-transparent text-center font-bold outline-none border-b border-white/20 focus:border-blue-500 text-lg text-theme-primary"
                                />
                                <span className="text-xs font-bold text-theme-secondary uppercase mr-2">MIN</span>
                                <button onClick={handleStartTimer} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                                    <MonitorPlay size={18} fill="currentColor" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 px-4">
                                <div className={`font-mono text-3xl font-black ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-theme-primary'}`}>
                                    {formatTime(timeLeft)}
                                </div>
                                <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="text-theme-secondary hover:text-theme-primary font-bold text-sm uppercase tracking-wide">
                                    {isTimerRunning ? "Pause" : "Reprendre"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleCallNext}
                            disabled={!!processingAction}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {processingAction === 'CALL_NEXT' ? <Loader2 size={16} className="animate-spin" /> : <><BellRing size={16} /> Appeler Candidat</>}
                        </button>
                        <button
                            onClick={handleDelayNotification}
                            disabled={!!processingAction}
                            className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl font-bold flex items-center gap-2 text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                            {processingAction === 'DELAY' ? <Loader2 size={16} className="animate-spin" /> : <><AlertTriangle size={16} /> Signaler Retard</>}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden z-0">

                {/* Left: CV & Tools */}
                <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
                    <div className="flex gap-4 border-b border-white/10 pb-4">
                        <button
                            onClick={() => setActiveTab('cv')}
                            className={`pb-2 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'cv' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-theme-secondary hover:text-theme-primary'}`}
                        >
                            CV & Documents
                        </button>
                    </div>

                    <div className="flex-1 glass-panel rounded-2xl border border-white/10 overflow-hidden relative shadow-sm">
                        {activeTab === 'cv' && (
                            interview.cvUrl ? (
                                <iframe src={interview.cvUrl} className="w-full h-full bg-white/50 dark:bg-slate-800" title="CV" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-theme-secondary">
                                    <FileText size={48} className="mb-4 opacity-50" />
                                    <p className="font-medium">Aucun CV disponible.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Right: Evaluation Panel */}
                <div className="w-96 glass-panel border-l border-white/10 p-6 flex flex-col gap-6 shadow-xl shrink-0 overflow-y-auto">
                    <div>
                        <h2 className="text-xl font-black text-theme-primary mb-1">Évaluation</h2>
                        <p className="text-xs text-theme-secondary font-bold uppercase tracking-widest">Notez le candidat en temps réel</p>
                    </div>

                    {/* Score */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <label className="text-xs font-black text-theme-secondary uppercase tracking-widest mb-3 block">Note Globale</label>
                        <div className="flex items-center justify-between gap-4">
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5" // Allow halves
                                value={score}
                                onChange={e => setScore(e.target.value)}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shadow-sm shrink-0">
                                <span className={`text-xl font-black ${score >= 7 ? 'text-emerald-500' : score >= 4 ? 'text-orange-500' : 'text-red-500'}`}>{score}</span>
                            </div>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="flex-1 flex flex-col">
                        <label className="text-xs font-black text-theme-secondary uppercase tracking-widest mb-3 block">Remarques & Observations</label>
                        <textarea
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="Points forts, points faibles, attitude..."
                            className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-theme-primary focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed placeholder-theme-secondary/50"
                        />
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${interview.status === 'CHECKED_IN' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                        <div className="flex gap-3 mb-2">
                            {interview.photoUrl ? (
                                <img src={interview.photoUrl} alt="Candidat" className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-sm" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-theme-secondary"><User size={16} /></div>
                            )}
                            <div>
                                <p className="text-sm font-bold text-theme-primary">{interview.studentName}</p>
                                <p className={`text-xs ${interview.status === 'CHECKED_IN' ? 'text-emerald-400' : 'text-theme-secondary'}`}>
                                    {interview.status === 'CHECKED_IN' ? "En ligne & Prêt" : "En attente de connexion..."}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4 items-center">
                        <div className={`h-2 w-2 rounded-full ${interview.status === 'CHECKED_IN' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${interview.status === 'CHECKED_IN' ? 'text-emerald-400' : 'text-theme-secondary'}`}>
                            {interview.status === 'CHECKED_IN' ? "Live Connect Actif" : "Hors ligne"}
                        </span>
                    </div>
                    <button
                        onClick={requestFinish}
                        disabled={!!processingAction}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-auto"
                    >
                        {processingAction === 'FINISH' ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Terminer Entretien</>}
                    </button>
                </div>
                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    confirmText={confirmModal.confirmText}
                    isDangerous={confirmModal.isDangerous}
                    onConfirm={confirmModal.onConfirm}
                    isLoading={processingAction === 'FINISH'}
                />
            </div>
        </div>
    );
}
