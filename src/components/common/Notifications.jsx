import { useState, useRef, useEffect } from "react";
import { Bell, Check, X, Info, Briefcase, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../../api/client";

export default function Notifications() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const wrapperRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await apiFetch("/api/notifications");
            setNotifications(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

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

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id) => {
        try {
            await apiFetch(`/api/notifications/${id}/read`, { method: "PUT" });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiFetch("/api/notifications/read-all", { method: "PUT" });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "offer": return <Briefcase size={16} className="text-blue-400" />;
            case "interview": return <Calendar size={16} className="text-purple-400" />;
            default: return <Info size={16} className="text-slate-400" />;
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right ring-1 ring-black/5"
                    >
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                                >
                                    Tout marquer comme lu
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Bell size={32} className="mx-auto mb-3 opacity-20" />
                                    <p>Aucune notification pour le moment.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-800">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 hover:bg-slate-800/50 transition-colors relative group ${!notif.isRead ? "bg-blue-500/5" : ""}`}
                                        >
                                            <div className="flex gap-3 items-start">
                                                <div className={`mt-1 p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0`}>
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-2 mb-1">
                                                        <h4 className={`text-sm font-medium ${notif.isRead ? "text-slate-300" : "text-white"}`}>
                                                            {notif.title}
                                                        </h4>
                                                        <span className="text-xs text-slate-500 whitespace-nowrap">{notif.time}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    {!notif.isRead && (
                                                        <button
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="mt-2 text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                                        >
                                                            <Check size={12} /> Marquer comme lu
                                                        </button>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => deleteNotification(notif.id)}
                                                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            {!notif.isRead && (
                                                <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-blue-500 rounded-r-full" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-2 border-t border-slate-800 bg-slate-900/50 text-center">
                            <button className="text-xs text-slate-500 hover:text-white transition-colors py-1">
                                Voir tout l'historique
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
