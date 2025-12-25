import { Video, Megaphone, Clock } from "lucide-react";

export default function ActiveInterview({ activeInterview, timer, formatTime, handleAction }) {
    if (!activeInterview) {
        return (
            <div className="w-full md:w-2/4 flex flex-col">
                <div className="flex-1 bg-gradient-to-br from-slate-900/80 to-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-6 relative shadow-2xl overflow-hidden group hover:border-white/20 transition-all duration-500 w-full">
                    {/* Internal Dynamic Shapes */}
                    <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

                    <div className="text-center text-slate-500 relative z-10 flex flex-col items-center py-10">
                        <div className="w-24 h-24 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border-2 border-slate-800/50 shadow-inner rotate-3 transition-transform hover:rotate-6">
                            <Video size={32} className="text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-300 mb-1">Aucun entretien</h3>
                        <p className="text-xs text-slate-400">La salle est vide.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full md:w-2/4 flex flex-col">
            <div className="flex-1 bg-gradient-to-br from-slate-900/80 to-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-6 relative shadow-2xl overflow-hidden group hover:border-white/20 transition-all duration-500 w-full">
                {/* Internal Dynamic Shapes */}
                <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="absolute top-0 right-0 flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                        <div className={`text-lg font-mono font-black tracking-widest ${timer < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                            {formatTime(timer)}
                        </div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    </div>

                    {/* Avatar Container */}
                    <div className="relative mb-6 mt-4 group-avatar">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 blur-[30px] opacity-40 rounded-[1.8rem] scale-110" />
                        <div className="w-36 h-36 rounded-[1.8rem] bg-slate-800 border-2 border-slate-700/50 shadow-xl overflow-hidden relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            {activeInterview.studentPhoto ? (
                                <img src={activeInterview.studentPhoto} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" alt="Student" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl text-slate-500 font-bold bg-slate-800">
                                    {(activeInterview.studentName || "XX").substring(0, 2)}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 z-20 bg-emerald-500 border-2 border-slate-900 w-7 h-7 rounded-lg flex items-center justify-center shadow-lg rotate-12" title="En ligne">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2 tracking-tight text-center">
                        {activeInterview.studentName}
                    </h2>
                    {activeInterview.studentDomaine && (
                        <p className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                            {activeInterview.studentDomaine}
                        </p>
                    )}
                    <p className="text-blue-400 mb-8 text-sm font-medium bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
                        {activeInterview.title}
                    </p>

                    {/* Buttons Container */}
                    <div className="w-full max-w-md flex flex-col gap-4 px-4">
                        <div className="flex gap-3 w-full">
                            <a href={activeInterview.meetLink} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 border border-white/10 transition-all hover:border-blue-500/50 group-btn text-sm min-w-0">
                                <Video size={18} className="text-blue-400 group-btn-hover:scale-110 transition-transform shrink-0" />
                                <span className="truncate">Rejoindre</span>
                            </a>
                            <button onClick={() => handleAction(activeInterview.id, 'FINISH')} className="flex-1 py-3 bg-red-600/90 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] border border-red-500/20 text-sm min-w-0">
                                <span className="truncate">Terminer</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button
                                onClick={() => handleAction(activeInterview.id, 'NOTIFY_CALL')}
                                className="py-2.5 px-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold min-w-0"
                            >
                                <Megaphone size={14} className="shrink-0" /> <span className="truncate">Rappeler</span>
                            </button>
                            <button
                                onClick={() => handleAction(activeInterview.id, 'NOTIFY_DELAY')}
                                className="py-2.5 px-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/30 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold min-w-0"
                            >
                                <Clock size={14} className="shrink-0" /> <span className="truncate">Retard</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
