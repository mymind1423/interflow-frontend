import { Star, MessageSquare } from "lucide-react";

export default function EvaluationPanel({ scorecardData, setScorecardData, saveNotes }) {
    return (
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900/50">
            <div className="space-y-6 animate-fade-in-up">
                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold mb-3 block">Note Globale (1-10)</label>
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                            <button
                                key={s}
                                onClick={() => setScorecardData(p => ({ ...p, rating: s }))}
                                className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${s <= scorecardData.rating ? 'bg-emerald-500 text-black scale-110 shadow-lg shadow-emerald-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold mb-3 block">Remarques & Points forts</label>
                    <textarea
                        className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm focus:border-emerald-500 outline-none resize-none leading-relaxed"
                        placeholder="Notez vos impressions en temps réel..."
                        value={scorecardData.comment}
                        onChange={e => setScorecardData(p => ({ ...p, comment: e.target.value }))}
                    />
                </div>

                <button
                    onClick={saveNotes}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700"
                >
                    Sauvegarder les notes (Brouillon)
                </button>
            </div>
        </div>
    );
}

// Wrapper for the Right Panel Container to toggle between History and Evaluation
export function RightPanelContainer({ activeInterview, children }) {
    return (
        <div className="w-full md:w-1/4 flex flex-col bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-900/60 border-b border-white/5 font-bold text-slate-200">
                {activeInterview && activeInterview.status === 'IN_PROGRESS' ? (
                    <span className="flex items-center gap-2 text-emerald-400"><Star size={18} /> Points Clés</span>
                ) : (
                    <span className="flex items-center gap-2"> Historique</span>
                )}
            </div>
            {children}
        </div>
    );
}
