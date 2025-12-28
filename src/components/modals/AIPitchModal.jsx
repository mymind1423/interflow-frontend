import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, AlertCircle, Copy, Check } from "lucide-react";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../authContext";

export default function AIPitchModal({ isOpen, onClose }) {
    const { user } = useAuth();
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!jobDescription.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await apiFetch("/api/ai/generate-pitch", {
                method: "POST",
                body: JSON.stringify({
                    studentId: user.uid,
                    jobDescription
                })
            });

            if (data.points) {
                setResult(data.points);
            } else {
                throw new Error("Format de réponse invalide");
            }
        } catch (err) {
            console.error(err);
            setError("Impossible de générer le pitch. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        const text = result.map(p => `• ${p}`).join("\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                                    <Sparkles size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Générateur de Pitch IA</h3>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {!result ? (
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-slate-300">
                                            Collez la description de l'offre (Job Description)
                                        </label>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Ex: Nous recherchons un développeur React passionné..."
                                            className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                            <AlertCircle size={16} />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleGenerate}
                                        disabled={!jobDescription.trim() || loading}
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Analyse en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={18} /> Générer les arguments
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
                                        <h4 className="text-indigo-300 font-bold mb-4 flex items-center gap-2">
                                            <Sparkles size={16} /> Points Clés Suggérés
                                        </h4>
                                        <ul className="space-y-3">
                                            {result.map((point, i) => (
                                                <li key={i} className="flex gap-3 text-slate-200 leading-relaxed">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                                        {i + 1}
                                                    </span>
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setResult(null)}
                                            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                                        >
                                            Nouvelle analyse
                                        </button>
                                        <button
                                            onClick={copyToClipboard}
                                            className="py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                                        >
                                            {copied ? <Check size={18} /> : <Copy size={18} />}
                                            {copied ? "Copié !" : "Copier"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
