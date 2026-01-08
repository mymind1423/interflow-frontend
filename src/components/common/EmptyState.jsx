import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionLink,
    onAction,
    color = "blue" // blue, pink, emerald, etc.
}) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        pink: "bg-pink-50 text-pink-600 border-pink-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
    }[color] || "bg-slate-50 text-slate-600 border-slate-100";

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 glass-panel border border-dashed text-center rounded-3xl">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm border ${colorClasses}`}>
                {Icon && <Icon size={32} />}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                {description}
            </p>

            {(actionLabel && (actionLink || onAction)) && (
                actionLink ? (
                    <Link
                        to={actionLink}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:scale-105 flex items-center gap-2"
                    >
                        {actionLabel}
                        <ArrowRight size={18} />
                    </Link>
                ) : (
                    <button
                        onClick={onAction}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:scale-105 flex items-center gap-2"
                    >
                        {actionLabel}
                        <ArrowRight size={18} />
                    </button>
                )
            )}
        </div>
    );
}
