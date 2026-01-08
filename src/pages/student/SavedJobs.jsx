import { useState, useEffect } from "react";
import { studentApi } from "../../api/studentApi";
import { Bookmark, MapPin, Building, Briefcase, DollarSign, Clock, ArrowRight, Trash2, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import EmptyState from "../../components/common/EmptyState";

export default function SavedJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [unsavingId, setUnsavingId] = useState(null);
    const [applyingId, setApplyingId] = useState(null);

    const filteredJobs = jobs
        .filter(job => !job.applicationStatus) // Logic Fix: Hide applied/accepted/rejected jobs
        .filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.company.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === "ALL" || job.type === filterType;
            return matchesSearch && matchesType;
        });

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const fetchSavedJobs = async () => {
        try {
            const data = await studentApi.getSavedJobs();
            setJobs(data);
        } catch (error) {
            console.error("Failed to fetch saved jobs", error);
            toast.error("Impossible de charger les offres sauvegardées");
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (jobId) => {
        setUnsavingId(jobId);
        try {
            const res = await studentApi.saveJob(jobId);
            if (res.saved === false) {
                toast.success("Offre retirée des favoris");
                setJobs(prev => prev.filter(j => j.id !== jobId));
            }
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setUnsavingId(null);
        }
    };

    const handleApply = async (jobId) => {
        setApplyingId(jobId);
        try {
            const res = await studentApi.apply(jobId);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Candidature envoyée avec succès ! 🚀");
                setJobs(prev => prev.map(job =>
                    job.id === jobId ? { ...job, applicationStatus: 'PENDING' } : job
                ));
            }
        } catch (e) { toast.error("Une erreur est survenue"); }
        finally { setApplyingId(null); }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 size={48} className="text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-20 relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[128px]" />
            </div>

            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Bookmark size={12} /> Favoris
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-theme-primary mb-2 flex items-center gap-3">
                    Offres Sauvegardées
                </h1>
                <p className="text-theme-secondary text-lg">Retrouvez ici toutes les opportunités mises de côté pour plus tard.</p>
            </div>

            {/* Search & Filter */}
            {/* Search & Filter - Soft UI */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher une offre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm rounded-xl pl-12 pr-4 py-3.5 text-theme-primary placeholder-theme-secondary focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm rounded-xl px-6 py-3.5 text-theme-primary font-medium focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                >
                    <option value="ALL">Tous les types</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Alternance">Alternance</option>
                </select>
            </div>

            {filteredJobs.length > 0 ? (
                <div className="grid gap-4">
                    {filteredJobs.map((job) => {
                        const isFull = job.acceptedCount !== undefined && job.interviewQuota !== undefined && job.acceptedCount >= job.interviewQuota;
                        const placesRemaining = job.interviewQuota !== undefined ? Math.max(0, job.interviewQuota - (job.applicationCount || 0)) : null;
                        const isUrgent = placesRemaining !== null && placesRemaining < 5 && placesRemaining > 0;

                        return (
                            <div key={job.id} className={`group relative glass-panel border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-1 rounded-2xl p-6 transition-all flex flex-col md:flex-row gap-6 ${isFull ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                                {/* Glow Effect on Hover */}
                                {!isFull && <div className="absolute inset-0 bg-gradient-to-r from-pink-50/0 via-pink-50/0 to-pink-50/0 group-hover:via-pink-50/30 dark:group-hover:via-pink-500/10 transition-all duration-700 rounded-3xl pointer-events-none" />}

                                <div className="flex-1 relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-sm relative">
                                                {(job.logoUrl || job.companyLogo) ? (
                                                    <img src={job.logoUrl || job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building size={24} className="text-slate-400 dark:text-slate-500" />
                                                )}
                                                {isFull && (
                                                    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center">
                                                        <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase transform -rotate-12 border-2 border-slate-800 dark:border-white px-1 py-0.5 rounded">Complet</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-theme-primary group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">{job.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-theme-secondary font-medium">
                                                        {job.company}
                                                    </p>
                                                    <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                                                    <span className="text-sm text-theme-secondary">{new Date(job.createdAt).toLocaleDateString()}</span>
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    {job.description && (
                                        <div className="mt-4">
                                            <p className="text-theme-secondary text-sm leading-relaxed line-clamp-2">{job.description}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 mt-5">
                                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium flex items-center gap-1.5"><MapPin size={12} /> {job.location}</span>
                                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium flex items-center gap-1.5"><Briefcase size={12} /> {job.type}</span>
                                        {job.salary && <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium flex items-center gap-1.5"><DollarSign size={12} /> {job.salary}</span>}
                                        {job.interviewQuota && (
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${isUrgent
                                                ? 'bg-red-50 text-red-600 animate-pulse'
                                                : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {isFull ? "Complet" : `${placesRemaining} Place${placesRemaining > 1 ? 's' : ''}`}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 justify-center min-w-[160px] relative z-10 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
                                    <button
                                        onClick={() => !isFull && !job.applicationStatus && handleApply(job.id)}
                                        disabled={isFull || !!job.applicationStatus || applyingId === job.id}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed ${job.applicationStatus === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 cursor-default shadow-none' :
                                            job.applicationStatus === 'INVITED' ? 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 cursor-default shadow-none' :
                                                job.applicationStatus === 'REJECTED' || job.applicationStatus === 'REJECTED_QUOTA' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 cursor-default shadow-none' :
                                                    job.applicationStatus === 'PENDING' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 cursor-default shadow-none' :
                                                        isFull ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none' :
                                                            'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 hover:shadow-blue-600/40'
                                            }`}
                                    >
                                        {applyingId === job.id ? <Loader2 size={16} className="animate-spin" /> : <>
                                            {job.applicationStatus === 'ACCEPTED' ? (job.wasInvited ? "Invitation Acceptée" : "Accepté") :
                                                job.applicationStatus === 'INVITED' ? "Invité" :
                                                    job.applicationStatus === 'REJECTED' || job.applicationStatus === 'REJECTED_QUOTA' ? "Refusé" :
                                                        job.applicationStatus === 'PENDING' ? "Postulé" :
                                                            isFull ? "Entreprise complète" : "Postuler"}
                                            {!isFull && !job.applicationStatus && <ArrowRight size={16} />}
                                        </>}
                                    </button>
                                    <button
                                        onClick={() => handleUnsave(job.id)}
                                        disabled={unsavingId === job.id}
                                        className="p-3 rounded-xl transition-all text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed group/trash"
                                        title="Retirer des favoris"
                                    >
                                        {unsavingId === job.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} className="group-hover/trash:scale-110 transition-transform" />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    icon={Bookmark}
                    title="Aucune offre sauvegardée"
                    description="Vous n'avez pas encore ajouté d'offres à vos favoris. Parcourez les entreprises pour en trouver."
                    actionLabel="Explorer les offres"
                    actionLink="/jobs"
                    color="pink"
                />
            )
            }
        </div >
    );
}

