import { useState, useEffect } from "react";
import { studentApi } from "../../api/studentApi";
import { Bookmark, MapPin, Building, Briefcase, DollarSign, Clock, ArrowRight, Trash2, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import EmptyState from "../../components/common/EmptyState";
import JobDrawer from "../../components/modals/JobDrawer";

export default function SavedJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [filterDomaine, setFilterDomaine] = useState("ALL");
    const [unsavingId, setUnsavingId] = useState(null);
    const [applyingId, setApplyingId] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const SATURATION_LIMIT = 50;

    const DOMAINES = [
        "Informatique", "Industrie", "Marketing", "Transport", "Commerce",
        "Agriculture", "Télécoms", "Finance", "Santé", "Énergie", "Autre"
    ];

    const filteredJobs = jobs
        .filter(job => !job.applicationStatus) // Logic Fix: Hide applied/accepted/rejected jobs
        .filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.company.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === "ALL" || job.type === filterType;

            // Robust check for domain property
            const jobDomaine = job.domaine || job.domain || job.sector || (job.companyData && job.companyData.domaine) || "";
            const matchesDomaine = filterDomaine === "ALL" ||
                (jobDomaine && jobDomaine.toLowerCase() === filterDomaine.toLowerCase());

            return matchesSearch && matchesType && matchesDomaine;
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
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-20 relative">
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
            {/* Search & Filter - Unified Glass Panel */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-2 rounded-2xl shadow-sm mb-6">

                {/* Left: Filters */}
                <div className="flex gap-2 bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto border border-slate-200 dark:border-white/10">
                    <select
                        value={filterDomaine}
                        onChange={(e) => setFilterDomaine(e.target.value)}
                        className="bg-transparent border-none text-sm font-bold text-theme-primary focus:ring-0 outline-none cursor-pointer py-2 pl-2 pr-8 hover:bg-white/50 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <option value="ALL">Tous domaines</option>
                        {DOMAINES.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <div className="w-px bg-slate-200 dark:bg-white/10 my-1"></div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-transparent border-none text-sm font-bold text-theme-primary focus:ring-0 outline-none cursor-pointer py-2 pl-2 pr-8 hover:bg-white/50 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <option value="ALL">Tous types</option>
                        <option value="CDI">CDI</option>
                        <option value="CDD">CDD</option>
                        <option value="Stage">Stage</option>
                        <option value="Alternance">Alternance</option>
                    </select>
                </div>

                {/* Right: Search */}
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher une offre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-focus-within:border-blue-500/50 rounded-xl py-3 pl-12 pr-4 text-theme-primary placeholder:text-theme-secondary focus:outline-none transition-all font-medium focus:bg-white dark:focus:bg-slate-800"
                    />
                </div>
            </div>

            {filteredJobs.length > 0 ? (
                <div className="grid gap-4">
                    {filteredJobs.map((job) => {
                        const isSaturated = (job.applicationCount || 0) >= SATURATION_LIMIT;
                        const isClosed = isSaturated || job.isActive === 0 || job.status === 'CLOSED';
                        const isFull = job.acceptedCount !== undefined && job.interviewQuota !== undefined && job.acceptedCount >= job.interviewQuota;

                        const placesRemaining = job.interviewQuota !== undefined ? Math.max(0, job.interviewQuota - (job.applicationCount || 0)) : null;

                        return (
                            <div key={job.id}
                                onClick={() => setSelectedJob(job)}
                                className={`group relative glass-panel rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6 transition-all hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/10 cursor-pointer border border-slate-300 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 ${(isFull || isClosed) ? 'opacity-70 grayscale-[0.5]' : ''}`}
                            >

                                {/* COLUMN 1: Job Info */}
                                <div className="flex-1 min-w-0 flex gap-4 h-full items-start self-stretch">
                                    {/* Logo */}
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center p-1 shadow-sm border border-slate-200 dark:border-white/10 shrink-0">
                                        {(job.logoUrl || job.companyLogo) ? (
                                            <img src={job.logoUrl || job.companyLogo} alt={job.company} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <Building className="text-slate-400 dark:text-slate-500" size={24} />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-col h-full justify-between py-1 flex-1">
                                        <div>
                                            <h3 className="text-xl font-bold text-theme-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">{job.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-theme-secondary font-medium mb-3">
                                                <span className="text-theme-primary font-bold">{job.company}</span>
                                                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                                                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {/* Restored Description */}
                                            {job.description && (
                                                <p className="text-theme-secondary text-sm leading-relaxed line-clamp-2 mb-4">{job.description}</p>
                                            )}

                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md text-xs border border-slate-200 dark:border-white/10 flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
                                                <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md text-xs border border-slate-200 dark:border-white/10 flex items-center gap-1"><Briefcase size={10} /> {job.type}</span>
                                                {/* Restored Salary */}
                                                {job.salary && <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-xs border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1"><DollarSign size={10} /> {job.salary}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* COLUMN 2: Urgency Badge */}
                                {(job.interviewQuota && placesRemaining !== null && !isFull && !isClosed) && (
                                    <div className="hidden md:flex flex-col items-center justify-center shrink-0 mx-2">
                                        <div className="w-[120px] h-[90px] rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 [html[data-theme=dark]_&]:from-violet-600 [html[data-theme=dark]_&]:via-fuchsia-600 [html[data-theme=dark]_&]:to-pink-600 text-white flex flex-col items-center justify-center p-2 shadow-xl shadow-red-500/20 [html[data-theme=dark]_&]:shadow-fuchsia-500/20 relative overflow-hidden group/badge transition-all hover:scale-105 border-4 border-white/20 [html[data-theme=dark]_&]:border-white/10">
                                            {/* Number Top */}
                                            <div className="text-4xl font-black tracking-tighter z-10 leading-none mb-1">
                                                {placesRemaining.toString().padStart(2, '0')}
                                            </div>
                                            {/* Text Bottom */}
                                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wide leading-none text-center z-10">
                                                Places<br />Restantes
                                            </span>

                                            {/* Decoration */}
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 blur-xl rounded-full -translate-y-1/2 translate-x-1/2" />
                                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-black/10 blur-lg rounded-full translate-y-1/2 -translate-x-1/2" />
                                        </div>
                                    </div>
                                )}

                                {/* COLUMN 3: Actions */}
                                <div className="flex flex-col items-end gap-3 shrink-0 min-w-[150px]">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleUnsave(job.id); }}
                                        disabled={unsavingId === job.id}
                                        className="self-end p-2 rounded-xl transition-all bg-pink-50 dark:bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                    >
                                        {unsavingId === job.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); !isFull && !isClosed && !job.applicationStatus && handleApply(job.id); }}
                                        disabled={isFull || isClosed || !!job.applicationStatus || applyingId === job.id}
                                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed ${job.applicationStatus === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 cursor-default shadow-none' :
                                            job.applicationStatus === 'INVITED' ? 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 cursor-default shadow-none' :
                                                job.applicationStatus === 'REJECTED' || job.applicationStatus === 'REJECTED_QUOTA' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 cursor-default shadow-none' :
                                                    job.applicationStatus === 'PENDING' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 cursor-default shadow-none' :
                                                        (isFull || isClosed) ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none' :
                                                            'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 hover:shadow-blue-600/40'
                                            }`}
                                    >
                                        {applyingId === job.id ? <Loader2 size={16} className="animate-spin" /> : <>
                                            {job.applicationStatus === 'ACCEPTED' ? (job.wasInvited ? "Accepté" : "Accepté") :
                                                job.applicationStatus === 'INVITED' ? "Invité" :
                                                    job.applicationStatus === 'REJECTED' || job.applicationStatus === 'REJECTED_QUOTA' ? "Refusé" :
                                                        job.applicationStatus === 'PENDING' ? "Postulé" :
                                                            (isFull || isClosed) ? "Clôturée" : "Postuler"}
                                        </>}
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
            )}

            <JobDrawer
                job={selectedJob}
                isOpen={!!selectedJob}
                onClose={() => setSelectedJob(null)}
                onApply={() => handleApply(selectedJob.id)}
                onSave={() => handleUnsave(selectedJob.id)}
                isApplying={applyingId === (selectedJob?.id)}
                isSaving={unsavingId === (selectedJob?.id)}
                isLocked={false}
                saturatedLimit={50}
            />
        </div>
    );
}

