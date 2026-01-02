import { Star, XCircle, User, MessageSquare, RefreshCw, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export function ScorecardModal({ showScorecard, scorecardData, setScorecardData, submitScorecard }) {
    if (!showScorecard) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Noter l'entretien</h2>
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                            <button key={s} onClick={() => setScorecardData(p => ({ ...p, rating: s }))} className="hover:scale-110 transition-transform">
                                <Star size={24} className={s <= scorecardData.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-700"} />
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white mb-6 focus:border-blue-500 outline-none"
                        placeholder="Commentaire..."
                        value={scorecardData.comment}
                        onChange={e => setScorecardData(p => ({ ...p, comment: e.target.value }))}
                    />
                    <button onClick={submitScorecard} disabled={scorecardData.rating === 0} className="w-full py-3 bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors">
                        Enregistrer
                    </button>
                </div>
            </div>
        </AnimatePresence>
    );
}

export function HistoryDetailModal({ viewingHistory, setViewingHistory, historyLoading, companyApi, handleRestartInterview, loadInterviews }) {
    if (!viewingHistory) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                >
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                                {viewingHistory.studentPhoto ? <img src={viewingHistory.studentPhoto} className="w-full h-full object-cover" alt="Student" /> : <User className="w-6 h-6 m-auto mt-2 text-slate-500" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{viewingHistory.studentName}</h2>
                                <p className="text-sm text-blue-400">{viewingHistory.title}</p>
                            </div>
                        </div>
                        <button onClick={() => setViewingHistory(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><XCircle size={24} className="text-slate-400" /></button>
                    </div>

                    <div className="p-8 overflow-y-auto space-y-6 bg-slate-900/50">
                        {historyLoading ? (
                            <div className="flex justify-center p-10"><div className="animate-spin w-8 h-8 boundary-blue-500 rounded-full border-2 border-t-transparent" /></div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-2">Note Attribuée</p>
                                        <div className="flex flex-wrap gap-1">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                                                <button key={s} onClick={() => setViewingHistory(p => ({ ...p, rating: s }))}>
                                                    <Star size={20} className={s <= (viewingHistory.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-slate-700"} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Statut Final</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${viewingHistory.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                                            {viewingHistory.status === 'COMPLETED' ? 'Terminé' : viewingHistory.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-3 flex items-center gap-2"><MessageSquare size={14} /> Commentaires (Interne)</p>
                                    <textarea
                                        className="w-full bg-transparent text-slate-300 text-sm leading-relaxed p-0 border-none focus:ring-0 resize-none h-24"
                                        value={viewingHistory.comment || ""}
                                        onChange={(e) => setViewingHistory(p => ({ ...p, comment: e.target.value }))}
                                        placeholder="Ajouter un commentaire..."
                                    />
                                </div>

                                <button
                                    onClick={async () => {
                                        try {
                                            await companyApi.saveEvaluation({
                                                studentId: viewingHistory.studentId,
                                                rating: viewingHistory.rating || null, // FIX: Send null if 0
                                                comment: viewingHistory.comment
                                            });
                                            toast.success("✅ Modifications enregistrées !");
                                            if (loadInterviews) loadInterviews();
                                        } catch (error) {
                                            console.error(error);
                                            toast.error("❌ Erreur lors de la sauvegarde.");
                                        }
                                    }}
                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm border border-slate-700 shadow-lg"
                                >
                                    Sauvegarder les modifications
                                </button>

                                <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-500/20 mt-4">
                                    <h3 className="font-bold text-blue-200 mb-2 flex items-center gap-2"><RefreshCw size={16} /> Refaire l'entretien ?</h3>
                                    <p className="text-xs text-blue-300/70 mb-4">Cela réinitialisera le statut et placera l'étudiant dans la file ou en direct.</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleRestartInterview(viewingHistory.id, "SCHEDULED")}
                                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-blue-600/20"
                                        >
                                            Remettre en File d'Attente
                                        </button>
                                        <button
                                            onClick={() => handleRestartInterview(viewingHistory.id, "IN_PROGRESS")}
                                            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-sm border border-white/10"
                                        >
                                            Relancer le Live
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export function TimeUpModal({ showTimeUpModal, setShowTimeUpModal }) {
    if (!showTimeUpModal) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90">
            <div className="bg-red-900/20 border-2 border-red-500 p-8 rounded-2xl text-center shadow-[0_0_50px_rgba(239,68,68,0.4)]">
                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-3xl font-black text-white mb-4">TEMPS ÉCOULÉ</h2>
                <button onClick={() => setShowTimeUpModal(false)} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-colors">OK</button>
            </div>
        </div>
    );
}
