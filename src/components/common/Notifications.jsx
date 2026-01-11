import { useState, useRef, useEffect } from "react";
import { Bell, Check, X, Info, Briefcase, Calendar, CheckSquare, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../authContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

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

    const getIcon = (type) => {
        switch (type) {
            case "job":
            case "offer": return <Briefcase size={16} className="text-blue-400" />;
            case "interview": return <Calendar size={16} className="text-purple-400" />;
            case "application": return <CheckSquare size={16} className="text-emerald-400" />;
            case "invitation": return <Briefcase size={16} className="text-amber-400" />;
            case "error": return <AlertCircle size={16} className="text-red-400" />;
            default: return <Info size={16} className="text-slate-400" />;
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            await markAsRead(notif.id);
        }

        const { user } = useAuth(); // Import useAuth at top

        const handleNotificationClick = async (notif) => {
            if (!notif.isRead) {
                await markAsRead(notif.id);
            }

            // Navigation Logic
            if (notif.type === 'job' || notif.type === 'offer') {
                navigate('/jobs');
            } else if (notif.type === 'interview') {
                navigate(user?.userType === 'company' ? '/company-planning' : '/interviews');
            } else if (notif.type === 'application') {
                navigate(user?.userType === 'company' ? '/company-applications' : '/applications');
            } else if (notif.type === 'invitation') {
                // Invitations are student-only concept usually, but if Company gets a related notif, it might be about an interview
                // For now, if company gets 'invitation', it usually means 'INVITATION_ACCEPTED' which we mapped to 'interview' type now.
                // But if any 'invitation' type remains:
                navigate(user?.userType === 'company' ? '/company-applications' : '/applications', { state: { tab: 'INVITATIONS' } });
            }

            setIsOpen(false);
        };

        return (
            <div className="relative" ref={wrapperRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 text-theme-secondary hover:text-theme-primary transition-colors rounded-full hover:bg-white/10"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white/10 animate-pulse" />
                    )}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-80 md:w-96 glass-panel rounded-2xl overflow-hidden z-50 origin-top-right ring-1 ring-black/5"
                        >
                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur">
                                <h3 className="font-semibold text-theme-primary">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-blue-500 hover:text-blue-400 font-medium"
                                    >
                                        Tout marquer comme lu
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-theme-secondary">
                                        <Bell size={32} className="mx-auto mb-3 opacity-20" />
                                        <p>Aucune notification pour le moment.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => handleNotificationClick(notif)}
                                                className={`p-4 hover:bg-white/5 transition-colors relative group cursor-pointer ${!notif.isRead ? "bg-blue-500/5" : ""}`}
                                            >
                                                <div className="flex gap-3 items-start">
                                                    <div className={`mt-1 p-2 rounded-lg bg-white/5 border border-white/10 shrink-0`}>
                                                        {getIcon(notif.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start gap-2 mb-1">
                                                            <h4 className={`text-sm font-medium ${notif.isRead ? "text-theme-secondary" : "text-theme-primary"}`}>
                                                                {notif.title}
                                                            </h4>
                                                            <span className="text-xs text-theme-secondary whitespace-nowrap">
                                                                {localStorage.getItem('notification_date_' + notif.id) ||
                                                                    (notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr }) : '')}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-theme-secondary leading-relaxed line-clamp-2">
                                                            {notif.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!notif.isRead && (
                                                    <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-blue-500 rounded-r-full" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-2 border-t border-white/10 bg-white/5 text-center">
                                <button className="text-xs text-theme-secondary hover:text-theme-primary transition-colors py-1">
                                    Voir tout l'historique
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }
}
