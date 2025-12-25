import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, CheckCircle2, AlertCircle, Loader2, Bot } from "lucide-react";

export default function AICoachModal({ isOpen, onClose, loading, analysis }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    Coach Carrière IA <Sparkles size={16} className="text-yellow-400" />
                                </h2>
                                <p className="text-sm text-slate-400">Analyse de ton profil & conseils personnalisés</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                                    <Loader2 size={48} className="text-purple-400 animate-spin relative z-10" />
                                </div>
                                <h3 className="text-lg font-medium text-white animate-pulse">Analyse de ton CV en cours...</h3>
                                <p className="text-slate-400 max-w-sm">
                                    Notre IA examine tes compétences, ton expérience et la structure de ton document pour te donner les meilleurs conseils.
                                </p>
                            </div>
                        ) : analysis ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                {/* Score */}
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center gap-6">
                                    <div className="relative w-20 h-20 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                            <path className="text-purple-500" strokeDasharray={`${analysis.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                        </svg>
                                        <span className="absolute text-xl font-bold text-white">{analysis.score}%</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-1">Score du Profil</h4>
                                        <p className="text-slate-400 text-sm">{analysis.summary}</p>
                                    </div>
                                </div>

                                {/* Strengths */}
                                <div>
                                    <h3 className="text-sm font-uppercase tracking-wider text-slate-500 font-semibold mb-3 flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-400" /> POINTS FORTS
                                    </h3>
                                    <div className="grid gap-3">
                                        {analysis.strengths.map((point, index) => (
                                            <div key={index} className="px-4 py-3 bg-green-500/5 border border-green-500/10 rounded-xl text-green-300 text-sm">
                                                {point}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Improvements */}
                                <div>
                                    <h3 className="text-sm font-uppercase tracking-wider text-slate-500 font-semibold mb-3 flex items-center gap-2">
                                        <AlertCircle size={16} className="text-amber-400" /> PISTES D'AMÉLIORATION
                                    </h3>
                                    <div className="grid gap-3">
                                        {analysis.improvements.map((point, index) => (
                                            <div key={index} className="px-4 py-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-amber-300 text-sm flex gap-3">
                                                <span className="font-bold text-amber-500/50">{index + 1}.</span>
                                                {point}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer */}
                    {!loading && analysis && (
                        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                            <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition">
                                Fermer
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
