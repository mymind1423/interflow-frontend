import { useEffect, useState } from "react";
import { studentApi } from "../../api/studentApi";
import { useAuth } from "../../authContext";
import { Building, Search, Calendar, Filter, Briefcase, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function Applications() {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [filter, setFilter] = useState("ALL"); // ALL, PENDING, ACCEPTED, REJECTED
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await studentApi.getApplications();
                setApplications(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    if (!user) return null;

    const filteredApps = applications.filter(app => {
        const matchesSearch = app.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
            app.companyName.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "ALL" || app.status === filter;
        return matchesSearch && matchesFilter;
    });

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
            case "ACCEPTED": return "Invité";
            case "INVITED": return "Invité par l'entreprise";
            case "REJECTED": return "Refusée";
            default: return "En cours";
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-20 relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[10%] right-[0%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[128px]" />
            </div>

            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                        Suivi des demandes
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Mes Candidatures</h1>
                    <p className="text-slate-400 text-base sm:text-lg">Suivez l'état d'avancement de toutes vos demandes.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 text-center min-w-[100px]">
                        <span className="block text-3xl font-extrabold text-white">{applications.length}</span>
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total</span>
                    </div>
                    <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 rounded-2xl px-6 py-3 text-center min-w-[100px]">
                        <span className="block text-3xl font-extrabold text-emerald-400">
                            {applications.filter(a => a.status === 'ACCEPTED').length}
                        </span>
                        <span className="text-xs text-emerald-500/70 uppercase font-bold tracking-wider">Acceptées</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-xl"
            >
                {/* Filter Tabs */}
                <div className="flex gap-1 bg-slate-950/30 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto">
                    {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === f
                                ? "bg-slate-800 text-white shadow-lg shadow-black/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {f === "ALL" ? "Toutes" : getStatusLabel(f)}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher une candidature..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800/50 group-focus-within:border-blue-500/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none transition-all font-medium"
                    />
                </div>
            </motion.div>

            {/* List */}
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
                                            {/* Logic for Status Text */}
                                            {app.status === 'PENDING' ? 'Dossier Envoyé' : getStatusLabel(app.status)}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                                        <span className="flex items-center gap-2 font-medium text-slate-300">
                                            <Briefcase size={16} className="text-blue-500" />
                                            {app.companyName}
                                        </span>
                                        <span className="flex items-center gap-2 font-medium">
                                            <Calendar size={16} className="text-slate-500" />
                                            Postulé le {new Date(app.createdAt).toLocaleDateString()}
                                        </span>
                                        {app.status === 'INVITED' || app.status === 'ACCEPTED' ? (
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
                                    {/* Delete Button - Only shown if Accepted/Rejected logic or if we follow strict rules. User said: "une fois traite, le bouton supprimer nest plus disponble" */}
                                    {app.status === 'PENDING' && (
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (!window.confirm("Supprimer cette candidature ?")) return;
                                                try {
                                                    const res = await studentApi.deleteApplication(app.id);
                                                    if (res.success) {
                                                        toast.success("Candidature supprimée");
                                                        setApplications(prev => prev.filter(a => a.id !== app.id));
                                                    } else {
                                                        toast.error(res.error || "Erreur lors de la suppression");
                                                    }
                                                } catch (e) {
                                                    toast.error("Erreur serveur");
                                                }
                                            }}
                                            className="p-3 bg-slate-800/50 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-xl transition-colors tooltip border border-transparent hover:border-red-500/20"
                                            title="Retirer ma candidature"
                                        >
                                            <Trash2 size={20} />
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
                        <p className="text-slate-400">Modifiez vos filtres ou lancez une nouvelle recherche.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

