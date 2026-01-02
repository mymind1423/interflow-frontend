import { useState, useEffect } from "react";
import { studentApi } from "../../api/studentApi";
import { Bookmark, MapPin, Building, Briefcase, DollarSign, Clock, ArrowRight, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SavedJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [unsavingId, setUnsavingId] = useState(null);
    const [applyingId, setApplyingId] = useState(null);

    const filteredJobs = jobs.filter(job => {
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
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-20 relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[128px]" />
            </div>

            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
                    Favoris
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
                    Offres Sauvegardées
                </h1>
                <p className="text-slate-400 text-lg">Retrouvez ici toutes les opportunités mises de côté pour plus tard.</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Rechercher une offre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                            <div key={job.id} className={`group relative bg-slate-900/40 backdrop-blur-sm border border-white/5 p-6 rounded-3xl transition-all flex flex-col md:flex-row gap-6 hover:shadow-2xl hover:shadow-pink-900/5 hover:-translate-y-1 ${isFull ? 'opacity-70 grayscale-[0.5]' : 'hover:border-pink-500/30'}`}>
                                {/* Glow Effect on Hover */}
                                {!isFull && <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/0 to-pink-500/0 group-hover:via-pink-500/5 transition-all duration-700 rounded-3xl" />}

                                <div className="flex-1 relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-lg relative">
                                                {(job.logoUrl || job.companyLogo) ? (
                                                    <img src={job.logoUrl || job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building size={24} className="text-slate-500" />
                                                )}
                                                {isFull && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <span className="text-[10px] font-black text-white uppercase transform -rotate-12 border-2 border-white/20 px-1 py-0.5 rounded">Complet</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">{job.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-slate-400 font-medium">
                                                        {job.company}
                                                    </p>
                                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                                    <span className="text-sm text-slate-500">{new Date(job.createdAt).toLocaleDateString()}</span>
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    {job.description && (
                                        <div className="mt-4">
                                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{job.description}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 mt-5">
                                        <span className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-white/5 text-slate-300 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5"><MapPin size={12} /> {job.location}</span>
                                        <span className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-white/5 text-slate-300 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5"><Briefcase size={12} /> {job.type}</span>
                                        {job.salary && <span className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-white/5 text-emerald-400 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5"><DollarSign size={12} /> {job.salary}</span>}
                                        {job.interviewQuota && (
                                            <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${isUrgent ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800/50 border-white/5 text-slate-300'}`}>
                                                {isFull ? "Complet" : `${placesRemaining} Place${placesRemaining > 1 ? 's' : ''} restante${placesRemaining > 1 ? 's' : ''}`}
                                                {isUrgent && !isFull && " (Urgent)"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 justify-center min-w-[160px] relative z-10 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                                    <button
                                        onClick={() => !isFull && !job.applicationStatus && handleApply(job.id)}
                                        disabled={isFull || !!job.applicationStatus || applyingId === job.id}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed ${job.applicationStatus === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default shadow-none' :
                                            job.applicationStatus === 'INVITED' ? 'bg-slate-700/50 text-slate-400 border border-slate-600/30 cursor-default shadow-none' :
                                                job.applicationStatus === 'REJECTED' || job.applicationStatus === 'REJECTED_QUOTA' ? 'bg-red-500/10 text-red-500 border border-red-500/20 cursor-default shadow-none' :
                                                    job.applicationStatus === 'PENDING' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 cursor-default shadow-none' :
                                                        isFull ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' :
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
                                        className="bg-slate-800/50 hover:bg-pink-500/10 hover:text-pink-400 text-slate-400 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-transparent hover:border-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {unsavingId === job.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        Retirer
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl backdrop-blur-sm text-center px-4">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-500 ring-4 ring-slate-800/20">
                        <Bookmark size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Aucune offre sauvegardée</h3>
                    <p className="text-slate-400 max-w-md mx-auto">Vous n'avez pas encore ajouté d'offres à vos favoris. Parcourez les entreprises pour en trouver.</p>
                </div>
            )
            }
        </div >
    );
}

