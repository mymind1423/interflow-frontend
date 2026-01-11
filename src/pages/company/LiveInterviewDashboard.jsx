import { useState, useEffect, useMemo } from "react";
import { companyApi } from "../../api/companyApi";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { exportToExcel } from "../../utils/excelExporter";
import { useNavigate } from "react-router-dom";
import { Video, Calendar, Clock, User, FileText, CheckCircle, Download, MonitorPlay, Loader2, Star } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import StudentDetailModal from "../../components/company/StudentDetailModal";

export default function LiveInterviewDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("queue"); // 'queue' | 'history' | 'retained'
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingInterview, setEditingInterview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        loadInterviews();
    }, []);

    const loadInterviews = async () => {
        setLoading(true);
        try {
            const data = await companyApi.getInterviews();
            setInterviews(data);
        } catch (error) {
            console.error("Failed to load interviews", error);
            toast.error("Erreur chargement des entretiens");
        } finally {
            setLoading(false);
        }
    };

    const queueList = useMemo(() => {
        return interviews.filter(i => i.status !== 'COMPLETED' && i.status !== 'CANCELLED')
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    }, [interviews]);

    const historyList = useMemo(() => {
        return interviews.filter(i => i.status === 'COMPLETED')
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    }, [interviews]);

    const retainedList = useMemo(() => {
        return interviews.filter(i => i.isRetained)
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    }, [interviews]);

    const handleStartInterview = (id) => {
        navigate(`/company/live/${id}`);
    };

    const handleExportHistory = () => {
        const columns = [
            { header: "Candidat", key: "studentName", width: 25 },
            { header: "Titre Post", key: "jobTitle", width: 30 },
            { header: "Date", key: "date", width: 15 },
            { header: "Note", key: "score", width: 10 },
            { header: "Remarques", key: "remarks", width: 50 },
            { header: "Retenu", key: "isRetained", width: 10 },
        ];

        const data = historyList.map(i => ({
            studentName: i.studentName,
            jobTitle: i.title || i.jobTitle,
            date: format(new Date(i.dateTime), "dd/MM/yyyy"),
            score: i.score ? `${i.score}/10` : 'N/A',
            remarks: i.remarks || "Aucune remarque",
            isRetained: i.isRetained ? "OUI" : "NON"
        }));

        toast.promise(
            new Promise(resolve => {
                setTimeout(() => {
                    exportToExcel("Historique_Entretiens", "Historique", columns, data, "Historique des Entretiens");
                    resolve();
                }, 800); // Fake delay for UX
            }),
            {
                loading: 'Génération du fichier Excel...',
                success: 'Historique exporté !',
                error: "Erreur lors de l'export",
            }
        );
    };

    const handleUpdateEvaluation = async (score, remarks) => {
        setSaving(true);
        try {
            await companyApi.saveEvaluation({
                interviewId: editingInterview.id,
                studentId: editingInterview.studentId,
                rating: score,
                comment: remarks,
                status: 'COMPLETED'
            });
            toast.success("Évaluation mise à jour !");
            setEditingInterview(null);
            loadInterviews();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    const openStudentDetails = (interview) => {
        setSelectedStudent({
            ...interview, // Has studentId, studentName, etc.
            name: interview.studentName,
            photo: interview.studentPhoto,
            domain: interview.studentDomaine,
            grade: interview.studentGrade,
            faculty: interview.studentFaculty,
            dateOfBirth: interview.studentDateOfBirth
            // email, cvUrl, diplomaUrl should be present from backend now
        });
    };

    return (
        <div className="p-8 max-w-screen-2xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-theme-primary tracking-tight flex items-center gap-3">
                        <MonitorPlay className="text-blue-600 dark:text-blue-500" size={40} />
                        Live Manager
                    </h1>
                    <p className="text-theme-secondary mt-2 font-medium text-lg">Gérez vos entretiens en temps réel</p>
                </div>

                {(activeTab === 'history' || activeTab === 'retained') && (
                    <button
                        onClick={handleExportHistory}
                        className="flex items-center gap-2 px-6 py-3 glass-panel border border-white/10 text-theme-primary rounded-2xl font-bold hover:bg-white/10 transition-all shadow-sm active:scale-95"
                    >
                        <Download size={20} /> Exporter Historique
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 glass-panel p-1.5 rounded-2xl border border-white/10 w-fit shadow-sm overflow-x-auto">
                <TabButton
                    active={activeTab === 'queue'}
                    onClick={() => setActiveTab('queue')}
                    label="File d'attente"
                    icon={Clock}
                    count={queueList.length}
                />
                <TabButton
                    active={activeTab === 'history'}
                    onClick={() => setActiveTab('history')}
                    label="Historique"
                    icon={FileText}
                    count={historyList.length}
                />
                <TabButton
                    active={activeTab === 'retained'}
                    onClick={() => setActiveTab('retained')}
                    label="Retenus"
                    icon={Star}
                    count={retainedList.length}
                />
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {activeTab === 'queue' ? (
                        queueList.length === 0 ? (
                            <EmptyState message="Aucun entretien en attente." icon={Calendar} />
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {queueList.map((interview, idx) => (
                                    <QueueItem
                                        key={interview.id}
                                        interview={interview}
                                        onStart={() => handleStartInterview(interview.id)}
                                        onClick={() => openStudentDetails(interview)}
                                        idx={idx}
                                    />
                                ))}
                            </div>
                        )
                    ) : activeTab === 'history' ? (
                        historyList.length === 0 ? (
                            <EmptyState message="Aucun historique disponible." icon={FileText} />
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {historyList.map((interview, idx) => (
                                    <HistoryItem
                                        key={interview.id}
                                        interview={interview}
                                        onModify={() => setEditingInterview(interview)}
                                        onClick={() => openStudentDetails(interview)}
                                        idx={idx}
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        retainedList.length === 0 ? (
                            <EmptyState message="Aucun profil retenu pour le moment." icon={Star} />
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {retainedList.map((interview, idx) => (
                                    <HistoryItem
                                        key={interview.id}
                                        interview={interview}
                                        onModify={() => setEditingInterview(interview)}
                                        onClick={() => openStudentDetails(interview)}
                                        idx={idx}
                                    />
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {editingInterview && (
                    <EditEvaluationModal
                        interview={editingInterview}
                        onClose={() => setEditingInterview(null)}
                        onSave={handleUpdateEvaluation}
                        saving={saving}
                    />
                )}
            </AnimatePresence>

            {/* Student Details Modal */}
            <StudentDetailModal
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
            />
        </div>
    );
}

function EditEvaluationModal({ interview, onClose, onSave, saving }) {
    const [score, setScore] = useState(interview.score || 5);
    const [remarks, setRemarks] = useState(interview.remarks || "");

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="glass-panel border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-theme-secondary hover:text-theme-primary transition-colors"
                >
                    <Video size={20} className="rotate-45" /> {/* Mock close icon */}
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-theme-primary mb-2">Modifier l'Évaluation</h2>
                    <p className="text-theme-secondary font-bold">{interview.studentName}</p>
                </div>

                <div className="space-y-6">
                    {/* Score */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <label className="text-xs font-black text-theme-secondary uppercase tracking-widest mb-3 block">Note Globale</label>
                        <div className="flex items-center justify-between gap-4">
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
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
                    <div>
                        <label className="text-xs font-black text-theme-secondary uppercase tracking-widest mb-3 block">Remarques</label>
                        <textarea
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-theme-primary focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-theme-secondary rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={() => onSave(score, remarks)}
                            disabled={saving}
                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                "Enregistrer"
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function TabButton({ active, onClick, label, icon: Icon, count }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all relative whitespace-nowrap ${active
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-theme-secondary hover:text-theme-primary hover:bg-white/10"
                }`}
        >
            <Icon size={18} />
            {label}
            {count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${active ? "bg-white/20 text-white" : "bg-white/10 text-theme-secondary"}`}>
                    {count}
                </span>
            )}
        </button>
    );
}

function QueueItem({ interview, onStart, onClick, idx }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`group glass-panel border rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:-translate-y-1 transition-all border-l-4 shadow-sm ${interview.status === 'CHECKED_IN' ? 'border-l-emerald-500 border-white/5' : 'border-l-blue-500 border-white/10'}`}
        >
            <div className="flex items-center gap-6 cursor-pointer" onClick={onClick}>
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10 shadow-sm shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                    {interview.status === 'CHECKED_IN' && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white z-10 animate-pulse safe-indicator"></div>
                    )}

                    {interview.studentPhoto ? (
                        <img src={interview.studentPhoto} alt={interview.studentName} className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <span className="text-3xl font-black text-theme-primary">{new Date(interview.dateTime).getDate()}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary">{format(new Date(interview.dateTime), "MMM", { locale: fr })}</span>
                        </>
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-black text-theme-primary group-hover:text-blue-500 transition-colors">{interview.studentName}</h3>
                        {interview.status === 'CHECKED_IN' && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                Présent
                            </span>
                        )}
                    </div>
                    <p className="text-blue-500 font-bold text-sm mb-2 uppercase tracking-wide">{interview.title || "Entretien"}</p>
                    <div className="flex items-center gap-4 text-sm text-theme-secondary font-medium">
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> {format(new Date(interview.dateTime), "HH:mm")}</span>
                        <span className="flex items-center gap-1.5"><User size={14} className="text-indigo-400" /> Candidat</span>
                    </div>
                </div>
            </div>

            <button
                onClick={onStart}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 active:scale-95 transition-all group-hover:scale-105"
            >
                <MonitorPlay size={18} /> Démarrer
            </button>
        </motion.div>
    );
}

function HistoryItem({ interview, idx, onModify, onClick }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-panel border rounded-[2rem] p-6 flex flex-col gap-4 hover:shadow-lg transition-all ${interview.isRetained ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10'}`}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4 cursor-pointer" onClick={onClick}>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 overflow-hidden shrink-0">
                        {interview.studentPhoto ? (
                            <img src={interview.studentPhoto} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <CheckCircle size={24} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-theme-primary group-hover:text-blue-500 transition-colors flex items-center gap-2">
                            {interview.studentName}
                            {interview.isRetained && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest">
                                    Retenu
                                </span>
                            )}
                        </h3>
                        <p className="text-xs text-theme-secondary font-bold uppercase tracking-wider">{format(new Date(interview.dateTime), "dd MMM yyyy • HH:mm", { locale: fr })}</p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-xs text-theme-secondary font-bold uppercase mr-2">Note</span>
                    <span className={`text-lg font-black ${interview.score >= 7 ? 'text-emerald-500' : interview.score >= 4 ? 'text-orange-500' : 'text-red-500'}`}>
                        {interview.score ? interview.score : '-'}<span className="text-theme-secondary text-sm">/10</span>
                    </span>
                </div>
            </div>

            <div className={`bg-white/5 p-4 rounded-xl border ${interview.isRetained ? 'border-emerald-500/20' : 'border-white/10'}`}>
                <p className="text-xs font-black text-theme-secondary uppercase tracking-widest mb-2">Remarques</p>
                <p className="text-theme-primary text-sm leading-relaxed">{interview.remarks || "Aucune remarque enregistrée."}</p>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onModify}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-theme-secondary hover:text-blue-600 hover:bg-white/10 rounded-xl transition-all flex items-center gap-2"
                >
                    <FileText size={14} /> Modifier Note
                </button>
            </div>
        </motion.div>
    );
}

function EmptyState({ message, icon: Icon }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 glass-panel rounded-[3rem] border-2 border-dashed border-white/10 text-theme-secondary">
            <Icon size={48} className="mb-4 opacity-50" />
            <p className="font-bold text-lg">{message}</p>
        </div>
    );
}
