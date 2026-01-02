import { useEffect, useState } from "react";
import { studentApi } from "../../api/studentApi";
import { invitationApi } from "../../api/invitationApi";
import { useAuth } from "../../authContext";
import { Building, Search, Calendar, Filter, Briefcase, CheckCircle, XCircle, Clock, Trash2, Video, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/common/ConfirmationModal";

export default function Applications() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("APPLICATIONS"); // "APPLICATIONS" | "INVITATIONS"

    // --- APPLICATIONS STATE ---
    const [applications, setApplications] = useState([]);
    const [appFilter, setAppFilter] = useState("ALL"); // ALL, PENDING, ACCEPTED, REJECTED
    const [appSearch, setAppSearch] = useState("");
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
        try {
            const data = await studentApi.getApplications();
            setApplications(data);
            setAppsLoaded(true);
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors du chargement des candidatures");
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
            case "ACCEPTED": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            case "INVITED": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
            case "REJECTED": return "text-red-400 bg-red-500/10 border-red-500/20";
            default: return "text-blue-400 bg-blue-500/10 border-blue-500/20";
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
            case "INVITED": return "Invité par l'entreprise";
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-20 relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[10%] right-[0%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[128px]" />
            </div>

            {/* HEADER & TABS */}
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Mon Espace Candidat</h1>
                    <p className="text-slate-400 text-base sm:text-lg">Suivez vos candidatures et gérez vos invitations.</p>
                </div>

                {/* Styled Tabs */}
                <div className="flex p-1 bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/10 w-fit">
                    <button
                        onClick={() => setActiveTab('APPLICATIONS')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'APPLICATIONS'
                            ? "bg-slate-800 text-white shadow-lg shadow-black/20"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <Briefcase size={16} />
                        Candidatures
                    </button>
                    <button
                        onClick={() => setActiveTab('INVITATIONS')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'INVITATIONS'
                            ? "bg-slate-800 text-white shadow-lg shadow-black/20"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <Video size={16} />
                        Invitations
                        {pendingInvs.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">
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
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-xl">
                            <div className="flex gap-1 bg-slate-950/30 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto">
                                {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setAppFilter(f)}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${appFilter === f
                                            ? "bg-slate-800 text-white shadow-lg shadow-black/20"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        {f === "ALL" ? "Toutes" : getStatusLabel(f)}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full md:w-80 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={appSearch}
                                    onChange={(e) => setAppSearch(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800/50 group-focus-within:border-blue-500/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* LIST */}
                        <div className="grid gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredApps.map((app, index) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={app.id}
                                        className="group relative bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-0 overflow-hidden hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-blue-900/5"
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusColor(app.status).split(' ')[0].replace('text-', 'bg-')}`} />

                                        <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-5 sm:gap-6 pl-7 sm:pl-8">
                                            {/* Logo */}
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                                                {app.companyLogo ? (
                                                    <img src={app.companyLogo} alt={app.companyName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building size={24} className="text-slate-500" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate pr-4">{app.jobTitle}</h3>
                                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${getStatusColor(app.status)}`}>
                                                        {getStatusIcon(app.status)}
                                                        {app.status === 'PENDING' ? 'Postulé' : getStatusLabel(app.status)}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                                                    <span className="flex items-center gap-2 font-medium text-slate-300">
                                                        <Briefcase size={16} className="text-blue-500" />
                                                        {app.companyName}
                                                    </span>
                                                    <span className="flex items-center gap-2 font-medium">
                                                        <Calendar size={16} className="text-slate-500" />
                                                        {new Date(app.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {app.status === 'INVITED' ? (
                                                        <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/10 whitespace-nowrap">
                                                            ✨ 0 Jeton (Invitation)
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10 whitespace-nowrap">
                                                            🪙 1 Jeton consommé
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 pt-4 md:pt-0 md:pl-6 md:border-l border-white/5">
                                                {app.status === 'PENDING' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDeleteApp(app);
                                                        }}
                                                        disabled={deletingId === app.id}
                                                        className="p-3 bg-slate-800/50 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-xl transition-colors tooltip border border-transparent hover:border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Retirer ma candidature"
                                                    >
                                                        {deletingId === app.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {filteredApps.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-24 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20 backdrop-blur-sm"
                                >
                                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500 ring-4 ring-slate-800/20">
                                        <Filter size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Aucune candidature trouvée</h3>
                                    <p className="text-slate-400">Modifiez vos filtres ou explorez les offres.</p>
                                </motion.div>
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
                        className="space-y-10"
                    >
                        {invLoading && invitations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 size={48} className="text-blue-500 animate-spin" />
                                <p className="text-slate-500 font-bold animate-pulse">Chargement des invitations...</p>
                            </div>
                        ) : (
                            <>
                                {/* ALL INVITATIONS (Replaced split view) */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                                        <h2 className="text-xl font-bold text-white">Vos Invitations</h2>
                                    </div>

                                    {invitations.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                                                <Video size={24} />
                                            </div>
                                            <p className="text-slate-400 font-medium">Aucune invitation reçue.</p>
                                            <p className="text-slate-600 text-sm mt-1">Vos futures invitations apparaîtront ici.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {invitations.map((inv) => (
                                                <div key={inv.id} className="group relative bg-slate-900/40 backdrop-blur-md border border-purple-500/20 rounded-[2rem] p-6 hover:border-purple-500/40 transition-all shadow-lg hover:shadow-purple-900/10 hover:-translate-y-1 overflow-hidden flex flex-col min-h-[280px]">
                                                    {/* Gradient Bg */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                                                    <div className="relative z-10 flex flex-col h-full">
                                                        <div className="flex items-start justify-between mb-6">
                                                            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 shadow-lg shrink-0">
                                                                {inv.companyLogo ? (
                                                                    <img src={inv.companyLogo} alt={inv.companyName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Building className="text-slate-500" size={24} />
                                                                )}
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border flex items-center gap-1 ${inv.status === 'PENDING' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                                                                inv.status === 'ACCEPTED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                                                                }`}>
                                                                {inv.status === 'PENDING' ? 'Invitation' : inv.status === 'ACCEPTED' ? 'Acceptée' : 'Refusée'}
                                                            </span>
                                                        </div>

                                                        <div className="mb-6">
                                                            <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-snug">{inv.jobTitle}</h3>
                                                            <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                                                                {inv.companyName}
                                                            </p>
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
                                                                        className="px-4 py-3 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/30 rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        title="Refuser"
                                                                    >
                                                                        {respondingId === inv.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={18} />}
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <div className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border ${inv.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-white/5 opacity-70'
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
                                </div>
                            </>
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
