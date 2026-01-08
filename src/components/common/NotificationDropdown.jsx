import { useState, useRef, useEffect } from "react";
import { Bell, Briefcase, User, Info, CheckCircle, AlertTriangle, Clock, Rocket, ExternalLink, Trash2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const NOTIFICATION_TYPES = {
    // Backend Types
    PROFILE_VIEW: 'view',
    APPLICATION_UPDATE: 'application', // Accepted/Rejected often falls here
    NEW_OFFER: 'job',
    RECOMMENDATION: 'recommendation', // future
    INTERVIEW_REMINDER: 'interview',
    LATE_ALERT: 'error',
    INFO: 'info',
    COMPANY_SIGNUP: 'company_signup',
    STUDENT_SIGNUP: 'student_signup'
};

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleMarkAsRead = (id, event) => {
        event.stopPropagation();
        markAsRead(id);
    };

    const handleDelete = (id, event) => {
        event.stopPropagation();
        deleteNotification(id);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type, title) => {
        // More granular icon selection based on Title keywords if generic type
        const lowerTitle = title?.toLowerCase() || "";

        if (type === 'application' || lowerTitle.includes('candidature')) {
            if (lowerTitle.includes('acceptée') || lowerTitle.includes('accepté')) return <CheckCircle size={18} className="text-emerald-500" />;
            if (lowerTitle.includes('refusée') || lowerTitle.includes('refusé')) return <XCircle size={18} className="text-red-500" />;
            return <Info size={18} className="text-blue-500" />;
        }

        switch (type) {
            case 'view':
                return <User size={18} className="text-blue-500" />;
            case 'job':
            case 'new_offer':
                return <Briefcase size={18} className="text-indigo-500" />;
            case 'recommendation':
                return <Rocket size={18} className="text-purple-500" />;
            case 'interview':
                return <Clock size={18} className="text-amber-500" />;
            case 'error':
            case 'late_alert':
                return <AlertTriangle size={18} className="text-red-500" />;
            case 'company_signup':
                return <Briefcase size={18} className="text-emerald-500" />;
            case 'student_signup':
                return <User size={18} className="text-blue-500" />;
            default:
                return <Info size={18} className="text-gray-500" />;
        }
    };

    const getBgColor = (type, isRead, title) => {
        if (isRead) return '';
        const lowerTitle = title?.toLowerCase() || "";

        if (type === 'error' || lowerTitle.includes('refusée') || lowerTitle.includes('retard')) return 'bg-red-50 dark:bg-red-500/10 border-l-4 border-l-red-500';
        if (lowerTitle.includes('acceptée')) return 'bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-l-emerald-500';

        return 'bg-blue-50 dark:bg-blue-500/10 border-l-4 border-l-blue-500';
    };

    const handleAction = (notif) => {
        if (!notif.isRead) markAsRead(notif.id);

        const type = notif.type;
        const lowerTitle = notif.title?.toLowerCase() || "";

        if (type === 'job' || type === 'new_offer') {
            navigate('/jobs'); // or /jobs/:id if we had it
        } else if (type === 'application') {
            navigate('/applications');
        } else if (type === 'interview') {
            navigate('/interviews');
        } else if (type === 'view') {
            navigate('/profile');
        } else if (type === 'company_signup') {
            navigate('/admin/companies');
        } else if (type === 'student_signup') {
            navigate('/admin/students');
        }

        setIsOpen(false);
    };

    const formatTime = (dateStr) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr });
        } catch (e) {
            return "Récemment";
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all active:scale-95 outline-none"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-slate-900"></span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right ring-1 ring-black/5"
                    >
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
                            <div className="flex gap-3 text-xs">
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                        Tout lu
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-white/5">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleAction(notif)}
                                            className={`p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group relative ${getBgColor(notif.type, notif.isRead, notif.title)}`}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 dark:border-white/5 ${notif.isRead ? 'bg-slate-50 dark:bg-white/5' : 'bg-white dark:bg-slate-800'}`}>
                                                    {getIcon(notif.type, notif.title)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <p className={`text-sm font-bold truncate pr-6 ${notif.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                                            {notif.title}
                                                        </p>
                                                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{formatTime(notif.createdAt)}</span>
                                                    </div>
                                                    <p className={`text-xs leading-relaxed line-clamp-2 ${notif.isRead ? 'text-slate-500 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        {notif.message}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Hover Actions */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                        className="p-1 text-slate-400 hover:text-blue-500 rounded-md transition-colors"
                                                        title="Marquer comme lu"
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleDelete(notif.id, e)}
                                                    className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                                    <Bell size={32} className="mb-3 opacity-20" />
                                    <p className="text-sm">Aucune notification pour le moment.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-2 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 text-center">
                            <button className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                                Voir tout l'historique
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
