import { motion } from "framer-motion";
import { Lock, Zap } from "lucide-react";

export default function ApplicationQuota({ used, limit, loading }) {
    if (loading) return <div className="h-4 bg-slate-100 rounded-full animate-pulse w-32" />;

    const percentage = Math.min((used / limit) * 100, 100);
    const isLocked = used >= limit;

    // Color logic
    let color = "bg-emerald-500";
    let textColor = "text-emerald-600";
    if (percentage >= 80) {
        color = "bg-orange-500";
        textColor = "text-orange-600";
    }
    if (percentage >= 100) {
        color = "bg-red-500";
        textColor = "text-red-600";
    }

    return (
        <div className="flex flex-col gap-1 w-full max-w-[200px]">
            <div className="flex justify-between items-end text-xs font-bold mb-1">
                <span className="text-gray-500 flex items-center gap-1">
                    {isLocked ? <Lock size={12} className="text-red-500" /> : <Zap size={12} className="text-amber-500" />}
                    Jetons
                </span>
                <span className={`${textColor}`}>
                    {used} <span className="text-gray-300">/</span> {limit}
                </span>
            </div>

            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${color} ${isLocked ? 'striped-bar' : ''} relative`}
                >
                    {isLocked && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                </motion.div>
            </div>

            {isLocked && (
                <p className="text-[10px] text-red-500 font-bold mt-0.5 text-right uppercase tracking-wider">Limite atteinte</p>
            )}
        </div>
    );
}
