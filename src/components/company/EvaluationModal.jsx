
import { useState, useEffect } from "react";
import { companyApi } from "../../api/companyApi";
import { Star, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function EvaluationModal({ studentId, companyId, onClose }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [existingEval, setExistingEval] = useState(null);

    useEffect(() => {
        loadEvaluation();
    }, [studentId]);

    const loadEvaluation = async () => {
        try {
            const data = await companyApi.getEvaluation(studentId);
            if (data) {
                setExistingEval(data);
                setRating(data.rating || 0);
                setComment(data.comment || "");
            }
        } catch (error) {
            console.error("Failed to load evaluation", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await companyApi.saveEvaluation({
                companyId,
                studentId,
                rating,
                comment
            });
            toast.success("Évaluation enregistrée !");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="text-yellow-500" /> Évaluation de l'étudiant
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm font-bold mb-2">Note globale</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setRating(num)}
                                    className={`w-8 h-8 rounded-lg font-bold text-sm transition-all
                                        ${rating >= num ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">De 1 (Faible) à 10 (Excellent)</p>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm font-bold mb-2">Commentaire (Privé)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Vos impressions sur ce candidat..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                        ></textarea>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-slate-400 hover:text-white font-medium bg-slate-800 rounded-xl"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold disabled:opacity-50 transition-all"
                        >
                            {loading ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
