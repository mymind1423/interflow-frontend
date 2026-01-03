import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({
    icon: Icon = Search,
    title = "Aucune donnée trouvée",
    description = "Essayez de modifier vos filtres.",
    actionLabel,
    onAction,
    className = ""
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20 backdrop-blur-sm text-center ${className}`}
        >
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-4 ring-slate-800/20 text-slate-500">
                <Icon size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 max-w-sm mx-auto mb-6">{description}</p>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 hover:border-slate-600 shadow-lg"
                >
                    {actionLabel}
                </button>
            )}
        </motion.div>
    );
}
