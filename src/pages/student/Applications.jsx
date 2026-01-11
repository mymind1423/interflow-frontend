import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { studentApi } from "../../api/studentApi";
import { invitationApi } from "../../api/invitationApi";
import { useAuth } from "../../authContext";
import { useProfile } from "../../context/ProfileContext";
import { Building, Search, Calendar, Filter, Briefcase, CheckCircle, XCircle, Clock, Trash2, Video, Loader2, Mail, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../context/NotificationContext";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";

export default function Applications() {
    const { user } = useAuth();
    const { incrementTokens } = useProfile();
    const { notifications, markAsRead } = useNotifications();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.tab || "APPLICATIONS"); // "APPLICATIONS" | "INVITATIONS"

    // --- APPLICATIONS STATE ---
    const [applications, setApplications] = useState([]);
    const [appFilter, setAppFilter] = useState("ALL"); // ALL, PENDING, ACCEPTED, REJECTED
    const [appSearch, setAppSearch] = useState("");
    const [appLoading, setAppLoading] = useState(true);
    const [appsLoaded, setAppsLoaded] = useState(false);

    // --- INVITATIONS STATE ---
    const [invitations, setInvitations] = useState([]);
    const [invLoading, setInvLoading] = useState(true);
    const [invsLoaded, setInvsLoaded] = useState(false);

    // --- ACTION STATES ---
    const [deletingId, setDeletingId] = useState(null);
    const [respondingId, setRespondingId] = useState(null);

    // --- INITIAL FETCH ---
    useEffect(() => {
        if (activeTab === "APPLICATIONS" && !appsLoaded) {
            fetchApplications();
        } else if (activeTab === "INVITATIONS" && !invsLoaded) {
            fetchInvitations();
        }
    }, [activeTab, appsLoaded, invsLoaded]);

    const fetchApplications = async () => {
        setAppLoading(true);
        try {
            const data = await studentApi.getApplications();
            setApplications(data);
            setAppsLoaded(true);
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors du chargement des candidatures");
        } finally {
            setAppLoading(false);
        }
    };

    const fetchInvitations = async () => {
        setInvLoading(true);
        try {
            const data = await invitationApi.getInvitations();
            setInvitations(data);
            setInvsLoaded(true);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des invitations");
        } finally {
            setInvLoading(false);
        }
    };

    if (!user) return null;

    // --- HELPERS ---
    const getStatusColor = (status) => {
        switch (status) {
            case "ACCEPTED": return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
            case "REJECTED": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20";
            default: return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20";
        }
    };

    const getStatusBaseColor = (status) => {
        switch (status) {
            case "ACCEPTED": return "bg-emerald-500";
            case "REJECTED": return "bg-red-500";
            default: return "bg-blue-500";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "ACCEPTED": return <CheckCircle size={14} />;
            case "REJECTED": return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "ACCEPTED": return "Accepté";
            case "REJECTED": return "Refusée";
            default: return "En cours";
        }
    };

    // --- APPLICATIONS LOGIC ---
    const filteredApps = applications.filter(app => {
        const matchesSearch = app.jobTitle.toLowerCase().includes(appSearch.toLowerCase()) ||
            app.companyName.toLowerCase().includes(appSearch.toLowerCase());
        const matchesFilter = appFilter === "ALL" || app.status === appFilter;
        return matchesSearch && matchesFilter;
    });

    // --- INVITATIONS LOGIC ---
    // --- MODAL STATE ---
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    // --- INVITATIONS LOGIC ---
    const handleAcceptInv = async (id) => {
        setRespondingId(id);
        try {
            const res = await invitationApi.accept(id);
            if (res.success) {
                toast.success("Invitation acceptée ! Entretien planifié.");
                fetchInvitations();
            } else {
                toast.error("Erreur lors de l'acceptation");
            }
        } catch (error) {
            toast.error("Impossible d'accepter l'invitation");
        } finally {
            setRespondingId(null);
        }
    };

    const confirmRejectInv = (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Refuser cette invitation ?",
            message: "Cette action est irréversible. L'entreprise sera notifiée de votre refus.",
            confirmText: "Refuser l'opportunité",
            isDangerous: true,
            onConfirm: () => handleRejectInv(id)
        });
    };

    const handleRejectInv = async (id) => {
        setRespondingId(id);
        try {
            const res = await invitationApi.reject(id);
            if (res.success) {
                toast.success("Invitation refusée");
                fetchInvitations();
                setConfirmModal({ isOpen: false });
            }
        } catch (error) {
            toast.error("Erreur lors du refus");
        } finally {
            setRespondingId(null);
        }
    };

    const confirmDeleteApp = (app) => {
        setConfirmModal({
            isOpen: true,
            title: "Retirer votre candidature ?",
            message: "Si vous retirez votre candidature, votre jeton vous sera restitué immédiatement.",
            confirmText: "Retirer la candidature",
            isDangerous: true,
            onConfirm: () => handleDeleteApp(app.id)
        });
    };

    const handleDeleteApp = async (id) => {
        setDeletingId(id);
        try {
            const res = await studentApi.deleteApplication(id);
            if (res.success) {
                toast.success("Candidature supprimée");
                incrementTokens(); // Optimistic update
                setApplications(prev => prev.filter(a => a.id !== id));
                setConfirmModal({ isOpen: false });
            } else {
                toast.error(res.error || "Erreur lors de la suppression");
            }
        } catch (e) {
            toast.error("Erreur serveur");
        } finally {
            setDeletingId(null);
        }
    };

    const pendingInvs = invitations.filter(i => i.status === 'PENDING');
    const historyInvs = invitations.filter(i => i.status !== 'PENDING');


    return (
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-20 relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[10%] right-[0%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[128px]" />
            </div>

            {/* HEADER & TABS */}
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-theme-primary mb-2">Mon Espace Candidat</h1>
                    <p className="text-theme-secondary text-base sm:text-lg">Suivez vos candidatures et gérez vos invitations.</p>
                </div>

                {/* Styled Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 w-fit">
                    <button
                        onClick={() => setActiveTab('APPLICATIONS')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'APPLICATIONS'
                            ? "bg-blue-50 text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-blue-500 transition-colors"
                            }`}
                    >
                        <Briefcase size={16} />
                        Candidatures
                    </button>
                    <button
                        onClick={() => setActiveTab('INVITATIONS')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'INVITATIONS'
                            ? "bg-blue-50 text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-blue-500 transition-colors"
                            }`}
                    >
                        <Video size={16} />
                        Invitations
                        {pendingInvs.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                                {pendingInvs.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'APPLICATIONS' ? (
                    <motion.div
                        key="applications"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* CONTROLS */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-2 rounded-2xl shadow-sm">
                            <div className="flex gap-1 bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto border border-slate-200 dark:border-white/10">
                                {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setAppFilter(f)}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${appFilter === f
                                            ? "bg-blue-50 text-blue-600 shadow-sm"
                                            : "text-theme-secondary hover:text-theme-primary hover:bg-slate-50"
                                            }`}
                                    >
                                        {f === "ALL" ? "Toutes" : getStatusLabel(f)}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full md:w-80 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={appSearch}
                                    onChange={(e) => setAppSearch(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-focus-within:border-blue-500/50 rounded-xl py-3 pl-12 pr-4 text-theme-primary placeholder:text-theme-secondary focus:outline-none transition-all font-medium focus:bg-white dark:focus:bg-slate-800"
                                />
                            </div>
                        </div>

                        {/* LIST */}
                        <div className="grid gap-4">
                            {appLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="glass-panel rounded-2xl p-6 flex items-center gap-6">
                                        <Skeleton className="w-16 h-16 rounded-xl" />
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between">
                                                <Skeleton className="w-1/3 h-6 rounded-lg" />
                                                <Skeleton className="w-20 h-6 rounded-full" />
                                            </div>
                                            <div className="flex gap-4">
                                                <Skeleton className="w-1/4 h-4 rounded-lg" />
                                                <Skeleton className="w-1/4 h-4 rounded-lg" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredApps.map((app, index) => (
                                        <ApplicationCard
                                            key={app.id}
                                            app={app}
                                            index={index}
                                            getStatusBaseColor={getStatusBaseColor}
                                            getStatusColor={getStatusColor}
                                            getStatusIcon={getStatusIcon}
                                            getStatusLabel={getStatusLabel}
                                            onDelete={() => confirmDeleteApp(app)}
                                            isDeleting={deletingId === app.id}
                                        />
                                    ))}
                                </AnimatePresence>
                            )}

                            {!appLoading && filteredApps.length === 0 && (
                                <EmptyState
                                    icon={Filter}
                                    title="Aucune candidature trouvée"
                                    description="Modifiez vos filtres ou explorez les offres pour postuler."
                                />
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="invitations"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {invLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {Array(4).fill(0).map((_, i) => (
                                    <Skeleton key={i} className="w-full h-[280px] rounded-[2rem]" />
                                ))}
                            </div>
                        ) : invitations.length === 0 ? (
                            <EmptyState
                                icon={Video}
                                title="Aucune invitation reçue"
                                description="Vos futures invitations apparaîtront ici. Complétez votre profil pour être visible !"
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {invitations.map((inv) => (
                                    <div key={inv.id} className="group relative glass-panel rounded-[2rem] p-6 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all shadow-sm hover:shadow-xl hover:shadow-purple-100 dark:hover:shadow-purple-900/20 hover:-translate-y-1 overflow-hidden flex flex-col min-h-[280px] border border-transparent">
                                        {/* Gradient Bg */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-transparent dark:from-purple-900/20 dark:via-slate-900/50 dark:to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
                                                    {inv.companyLogo ? (
                                                        <img src={inv.companyLogo} alt={inv.companyName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building className="text-slate-400 dark:text-slate-500" size={24} />
                                                    )}
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border flex items-center gap-1 ${inv.status === 'PENDING' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20' :
                                                    inv.status === 'ACCEPTED' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'
                                                    }`}>
                                                    {inv.status === 'PENDING' ? 'Invitation' : inv.status === 'ACCEPTED' ? 'Acceptée' : 'Refusée'}
                                                </span>
                                            </div>

                                            <div className="mb-6">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                                        <p className="text-sm text-theme-primary leading-relaxed">
                                                            <span className="inline-block mr-2">✨</span>
                                                            {inv.status === 'PENDING' ? (
                                                                <>L'entreprise <strong className="text-blue-600 dark:text-blue-400">{inv.companyName}</strong> est intéressée par votre profil et vous invite à un entretien pour le poste <strong className="text-theme-primary">{inv.jobTitle}</strong>.</>
                                                            ) : (
                                                                <>L'entreprise <strong className="text-blue-600 dark:text-blue-400">{inv.companyName}</strong> était intéressée par votre profil et vous a invité à un entretien pour le poste <strong className="text-theme-primary">{inv.jobTitle}</strong>.</>
                                                            )}
                                                        </p>
                                                    </div>
                                                    {inv.status === 'PENDING' && (
                                                        <div className="flex flex-col items-center gap-1 text-red-600 animate-pulse shrink-0" title="Invitation Prioritaire">
                                                            <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-full border border-red-100 dark:border-red-500/20 shadow-sm shadow-red-200 dark:shadow-none">
                                                                <Mail className="fill-red-100 dark:fill-red-900/20 text-red-600" size={18} />
                                                            </div>
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-red-600">Urgent</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 flex gap-3">
                                                {inv.status === 'PENDING' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleAcceptInv(inv.id)}
                                                            disabled={respondingId === inv.id}
                                                            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {respondingId === inv.id ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={18} /> Accepter</>}
                                                        </button>
                                                        <button
                                                            onClick={() => confirmRejectInv(inv.id)}
                                                            disabled={respondingId === inv.id}
                                                            className="px-4 py-3 bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-500/30 rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Refuser"
                                                        >
                                                            {respondingId === inv.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={18} />}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border ${inv.status === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 opacity-70'
                                                        }`}>
                                                        {inv.status === 'ACCEPTED' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                                        {inv.status === 'ACCEPTED' ? "Acceptée" : "Refusée"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isDangerous={confirmModal.isDangerous}
                onConfirm={confirmModal.onConfirm}
                isLoading={!!deletingId || !!respondingId}
            />
        </div>
    );
}

function ApplicationCard({ app, index, getStatusBaseColor, getStatusColor, getStatusIcon, getStatusLabel, onDelete, isDeleting }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            className="group relative glass-panel border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-1 rounded-2xl p-0 overflow-hidden transition-all"
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusBaseColor(app.status)}`} />

            <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-5 sm:gap-6 pl-7 sm:pl-8">
                {/* Logo */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                    {app.companyLogo ? (
                        <img src={app.companyLogo} alt={app.companyName} className="w-full h-full object-cover" />
                    ) : (
                        <Building size={24} className="text-slate-400 dark:text-slate-500" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-theme-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate pr-4">{app.jobTitle}</h3>
                        <div className="flex gap-2">
                            {app.isRetained && (
                                <div className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm border text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 animate-pulse">
                                    <span className="text-lg">🎉</span> PROFIL RETENU
                                </div>
                            )}
                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border ${getStatusColor(app.status)}`}>
                                {getStatusIcon(app.status)}
                                {app.status === 'PENDING' ? 'Postulé' : getStatusLabel(app.status)}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-theme-secondary">
                        <span className="flex items-center gap-2 font-medium text-theme-primary">
                            <Briefcase size={16} className="text-blue-500 dark:text-blue-400" />
                            {app.companyName}
                        </span>
                        <span className="flex items-center gap-2 font-medium">
                            <Calendar size={16} className="text-slate-400" />
                            {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap flex items-center gap-1">
                            <span className="text-amber-500">🪙</span> 1 Jeton consommé
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 md:pt-0 md:pl-6 md:border-l border-slate-100 dark:border-white/10">
                    {app.status === 'PENDING' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            disabled={isDeleting}
                            className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 text-slate-400 dark:text-slate-500 rounded-xl transition-colors tooltip border border-slate-200 dark:border-white/10 hover:border-red-200 dark:hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Retirer ma candidature"
                        >
                            {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
