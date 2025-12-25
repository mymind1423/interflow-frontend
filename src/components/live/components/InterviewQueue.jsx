import { motion } from "framer-motion";
import { Clock, UserCheck, User } from "lucide-react";

export default function InterviewQueue({ queueInterviews, handleAction }) {
    return (
        <div className="w-full md:w-1/4 flex flex-col bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-900/60 border-b border-white/5 font-bold text-slate-200 flex justify-between items-center">
                <span className="flex items-center gap-2"><Clock size={18} className="text-blue-400" /> File d'attente</span>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-500/30">{queueInterviews.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {queueInterviews.length === 0 && <div className="text-center py-10 text-slate-500 text-sm italic">Aucun candidat en attente.</div>}
                {queueInterviews.map(i => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i.id}
                        className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] cursor-default group relative overflow-hidden ${i.status === 'WAITING' ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-mono text-slate-400 flex items-center gap-1 bg-black/20 px-2 py-1 rounded-md">
                                <Clock size={12} />
                                {(() => {
                                    try {
                                        return new Date(i.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    } catch (e) { return "--:--"; }
                                })()}
                            </span>
                            {i.status === 'WAITING' && <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1"><UserCheck size={10} /> Présent</span>}
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden border-2 border-white/10 group-hover:border-blue-400/50 transition-colors">
                                {i.studentPhoto ? <img src={i.studentPhoto} className="w-full h-full object-cover" alt="Student" /> : <User className="w-6 h-6 m-auto mt-2 text-slate-500" />}
                            </div>
                            <div>
                                <div className="font-bold text-white text-base">{i.studentName}</div>
                                <div className="text-xs text-slate-400 truncate w-40">{i.title}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleAction(i.id, 'CHECKIN')} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-xl text-slate-300 font-medium transition-colors">Check-in</button>
                            <button onClick={() => handleAction(i.id, 'START')} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40">Démarrer</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
