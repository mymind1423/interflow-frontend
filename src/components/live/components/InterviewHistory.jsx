import { User, Star } from "lucide-react";

export default function InterviewHistory({ historyInterviews, setViewingHistory }) {
    return (
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900/50">
            <div className="space-y-3">
                {historyInterviews.length === 0 && <div className="text-center py-10 text-slate-500 text-sm italic">Aucun historique récent.</div>}
                {historyInterviews.map(i => (
                    <div
                        key={i.id}
                        onClick={() => setViewingHistory(i)}
                        className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                    >
                        <div className="flex justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                                    {i.studentPhoto ? <img src={i.studentPhoto} className="w-full h-full object-cover" alt="Student" /> : <User className="w-4 h-4 m-auto mt-2 text-slate-500" />}
                                </div>
                                <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">{i.studentName}</span>
                            </div>
                            {i.rating > 0 && <div className="flex text-emerald-400 text-xs gap-1 font-bold items-center"><Star size={12} fill="currentColor" /> {i.rating}</div>}
                        </div>
                        <div className="flex justify-between text-xs items-center">
                            <span className="text-slate-500 truncate w-24">{i.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${i.status === 'COMPLETED' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-400'}`}>
                                {i.status === 'COMPLETED' ? 'Terminé' : i.status}
                            </span>
                        </div>
                        {i.comment && (
                            <div className="mt-2 text-xs text-slate-400 italic line-clamp-2 border-t border-white/5 pt-2">
                                "{i.comment}"
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
