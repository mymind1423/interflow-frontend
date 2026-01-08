import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, AlertCircle } from "lucide-react";
import Button from "../common/Button";

export default function QuotaLimitModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />

                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>

                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-100 dark:border-red-500/20 shadow-lg shadow-red-500/10">
                            <Lock size={32} />
                        </div>

                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Quota atteint (5/5)</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                            Vous avez atteint votre limite de 5 candidatures actives. <br />
                            <strong>Attendez une réponse ou annulez une candidature pour postuler à nouveau.</strong>
                        </p>

                        <div className="space-y-3">
                            <Button variant="primary" onClick={onClose} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                                Compris
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
