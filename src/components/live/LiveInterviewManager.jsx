import { useState, useEffect } from "react";
import { companyApi } from "../../api/companyApi";
import { Video } from "lucide-react";
import toast from "react-hot-toast";

// Sub-components
import InterviewQueue from "./components/InterviewQueue";
import ActiveInterview from "./components/ActiveInterview";
import InterviewHistory from "./components/InterviewHistory";
import EvaluationPanel, { RightPanelContainer } from "./components/EvaluationPanel";
import { ScorecardModal, HistoryDetailModal, TimeUpModal } from "./components/InterviewModals";

export default function LiveInterviewManager({ isFullScreen = false }) {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeInterview, setActiveInterview] = useState(null);
    const [showScorecard, setShowScorecard] = useState(false);
    const [scorecardData, setScorecardData] = useState({ rating: 0, comment: "" });
    const [completingId, setCompletingId] = useState(null);

    // Timer Logic
    const [timer, setTimer] = useState(600); // 10 minutes default
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);

    // History View State
    const [viewingHistory, setViewingHistory] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    // --- 1. DATA LOADING & LOGIC ---
    useEffect(() => {
        loadInterviews();
        const interval = setInterval(loadInterviews, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadInterviews = async () => {
        try {
            const data = await companyApi.getInterviews();
            if (!Array.isArray(data)) return;

            // Normalize data (Crucial fix for display)
            const processedData = data.map(i => ({
                ...i,
                status: (String(i.status || 'SCHEDULED')).toUpperCase().trim()
            }));

            // Debugging Statuses
            const uniqueStatuses = [...new Set(processedData.map(i => i.status))];
            console.log("📝 UNIQUE STATUSES FOUND:", uniqueStatuses);
            console.log("Details:", processedData.map(i => `${i.studentName}: ${i.status}`));

            setInterviews(processedData);

            // --- RECOVERY LOGIC ---
            // 1. Check LocalStorage first (Stickiness)
            let currentActive = null;
            const savedId = localStorage.getItem('inProgressInterviewId');

            if (savedId) {
                const found = processedData.find(i => String(i.id) === String(savedId));
                if (found && found.status === 'IN_PROGRESS') {
                    currentActive = found;
                } else {
                    // Cleanup invalid local state
                    localStorage.removeItem('inProgressInterviewId');
                    localStorage.removeItem('timerStartTime');
                }
            }

            // 2. If no local active session, try to find ANY 'IN_PROGRESS' in DB
            // This fixes "lost" interviews when clearing cache or switching devices
            if (!currentActive) {
                const dbActive = processedData.find(i => i.status === 'IN_PROGRESS');
                if (dbActive) {
                    currentActive = dbActive;
                    // Auto-restore storage keys
                    localStorage.setItem('inProgressInterviewId', dbActive.id);
                    // If no timer start time exists, assume it started now (or leave as is to reset)
                    if (!localStorage.getItem('timerStartTime')) {
                        localStorage.setItem('timerStartTime', Date.now().toString());
                    }
                }
            }

            // 3. Apply State
            if (currentActive) {
                setActiveInterview(currentActive);

                // Timer Sync
                const startTime = localStorage.getItem('timerStartTime');
                if (startTime) {
                    const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
                    const remaining = 600 - elapsed;
                    if (remaining > 0) {
                        setTimer(remaining);
                        setIsTimerRunning(true);
                    } else {
                        setTimer(0);
                        setIsTimerRunning(false);
                    }
                }
            } else {
                setActiveInterview(null);
                setIsTimerRunning(false);
            }

        } catch (error) {
            console.error("Failed to load interviews", error);
        } finally {
            setLoading(false);
        }
    };

    // Load Evaluation for Active Interview
    useEffect(() => {
        if (activeInterview?.id && activeInterview?.studentId) {
            companyApi.getEvaluation(activeInterview.studentId).then(data => {
                if (data) {
                    setScorecardData(prev => {
                        // Only load if local state is empty to avoid overwriting user progress during polling updates
                        if (prev.rating === 0 && prev.comment === "") {
                            return { rating: data.rating || 0, comment: data.comment || "" };
                        }
                        return prev;
                    });
                }
            }).catch(e => console.error("Could not load previous notes", e));
        }
    }, [activeInterview?.id]);

    // --- 2. TIMER ---
    useEffect(() => {
        let timerInterval;
        if (isTimerRunning && timer > 0) {
            timerInterval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0 && isTimerRunning) {
            setIsTimerRunning(false);
            setShowTimeUpModal(true);
        }
        return () => clearInterval(timerInterval);
    }, [isTimerRunning, timer]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // --- 3. ACTIONS ---
    const handleAction = async (id, action) => {
        const interview = interviews.find(i => i.id === id);
        if (!interview) return;

        try {
            if (action === "START") {
                await companyApi.notifyStudent(id, 'CALL'); // Notify student
                await companyApi.updateInterviewStatus(id, "IN_PROGRESS");

                // Optimistic Update
                const updated = { ...interview, status: "IN_PROGRESS" };
                setInterviews(prev => prev.map(i => i.id === id ? updated : i));

                setActiveInterview(updated);
                setIsTimerRunning(true);
                setTimer(600);

                localStorage.setItem('inProgressInterviewId', id);
                localStorage.setItem('timerStartTime', Date.now().toString());

                toast.success("Entretien démarré !");

            } else if (action === "FINISH") {
                setCompletingId(id);
                setShowScorecard(true);
                setIsTimerRunning(false);
            } else if (action === "CHECKIN") {
                await companyApi.updateInterviewStatus(id, "WAITING");
                setInterviews(prev => prev.map(i => i.id === id ? { ...i, status: "WAITING" } : i));
                toast.success("Candidat marqué présent");
            } else if (action === "NOTIFY_CALL") {
                await companyApi.notifyStudent(id, "CALL");
                toast.success("Rappel envoyé !");
            } else if (action === "NOTIFY_DELAY") {
                await companyApi.notifyStudent(id, "DELAY");
                toast.success("Notification retard envoyée !");
            }
        } catch (error) {
            console.error(error);
            toast.error("Action impossible");
        }
    };

    const handleRestartInterview = async (id, targetStatus) => {
        try {
            await companyApi.updateInterviewStatus(id, targetStatus);
            toast.success(targetStatus === 'SCHEDULED' ? "Remis en file d'attente" : "Repris en direct");

            // Clean local state if needed
            if (targetStatus === 'IN_PROGRESS') {
                localStorage.setItem('inProgressInterviewId', id);
                localStorage.setItem('timerStartTime', Date.now().toString());
                setTimer(600);
                setIsTimerRunning(true);
            }

            setViewingHistory(null);
            loadInterviews();
        } catch (error) {
            console.error(error);
            toast.error("Impossible de relancer");
        }
    };

    const submitScorecard = async () => {
        const targetId = completingId || (activeInterview ? activeInterview.id : null);
        const targetInt = interviews.find(i => i.id === targetId);
        if (!targetId || !targetInt) return;

        try {
            await companyApi.saveEvaluation({
                studentId: targetInt.studentId,
                rating: scorecardData.rating,
                comment: scorecardData.comment
            });

            await companyApi.updateInterviewStatus(targetId, "COMPLETED");
            toast.success("Entretien terminé et noté !");

            // Cleanup
            localStorage.removeItem('inProgressInterviewId');
            localStorage.removeItem('timerStartTime');
            setActiveInterview(null);
            setShowScorecard(false);
            setScorecardData({ rating: 0, comment: "" });
            setCompletingId(null);

            loadInterviews();
        } catch (error) {
            console.error(error);
            toast.error("Erreur sauvegarde");
        }
    };

    const saveNotes = async () => {
        if (!activeInterview) return;
        try {
            await companyApi.saveEvaluation({
                studentId: activeInterview.studentId,
                rating: scorecardData.rating,
                comment: scorecardData.comment
            });
            toast.success("Notes sauvegardées (Brouillon)");
        } catch (error) {
            console.error(error);
            toast.error("Erreur sauvegarde notes");
        }
    };

    // Columns Logic
    const queueInterviews = interviews
        .filter(i => ['SCHEDULED', 'WAITING', 'PENDING', 'CONFIRMED', 'ACCEPTED'].includes(i.status))
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    const historyInterviews = interviews
        .filter(i => ['COMPLETED', 'CANCELED'].includes(i.status))
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse">Chargement de l'interface...</div>;

    return (
        <div className={`relative overflow-hidden flex flex-col gap-6 p-6 ${isFullScreen ? 'h-screen' : 'h-[calc(100vh-100px)]'} bg-slate-950`}>
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-3">
                        <Video className="text-blue-500 fill-blue-500/20" size={32} /> Live Interview Manager
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 ml-1">Gérez vos entretiens en temps réel avec fluidité.</p>
                </div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
                <InterviewQueue queueInterviews={queueInterviews} handleAction={handleAction} />
                <ActiveInterview activeInterview={activeInterview} timer={timer} formatTime={formatTime} handleAction={handleAction} />

                <RightPanelContainer activeInterview={activeInterview}>
                    {activeInterview && activeInterview.status === 'IN_PROGRESS' ? (
                        <EvaluationPanel scorecardData={scorecardData} setScorecardData={setScorecardData} saveNotes={saveNotes} />
                    ) : (
                        <InterviewHistory historyInterviews={historyInterviews} setViewingHistory={setViewingHistory} />
                    )}
                </RightPanelContainer>
            </div>

            <ScorecardModal
                showScorecard={showScorecard}
                scorecardData={scorecardData}
                setScorecardData={setScorecardData}
                submitScorecard={submitScorecard}
            />

            <HistoryDetailModal
                viewingHistory={viewingHistory}
                setViewingHistory={setViewingHistory}
                historyLoading={historyLoading}
                companyApi={companyApi}
                handleRestartInterview={handleRestartInterview}
                loadInterviews={loadInterviews}
            />

            <TimeUpModal showTimeUpModal={showTimeUpModal} setShowTimeUpModal={setShowTimeUpModal} />
        </div>
    );
}
