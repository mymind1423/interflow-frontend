import { useState, useEffect } from "react";
import { companyApi } from "../../api/companyApi";
import { studentApi } from "../../api/studentApi";
import { Search, MapPin, Briefcase, DollarSign, Clock, Bookmark, BookmarkCheck, LayoutGrid, List, ArrowRight, Building, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import JobDrawer from "../../components/modals/JobDrawer";
import { useAuth } from "../../authContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";



export default function StudentJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("card"); // 'card' or 'list'
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [savedJobs, setSavedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applyingId, setApplyingId] = useState(null);
    const [savingId, setSavingId] = useState(null);



    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [jobsData, savedData] = await Promise.all([
                studentApi.getRecentJobs(),
                studentApi.getSavedJobs()
            ]);
            // Filter only active jobs
            const jobsList = Array.isArray(jobsData) ? jobsData : [];
            setJobs(jobsList.filter(j => j.status !== 'CLOSED'));

            setSavedJobs(savedData.map(s => s.id));
        } catch (error) {
            console.error(error);
            toast.error("Impossible de charger les offres.");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId) => {
        try {
            setApplyingId(jobId);
            await studentApi.apply(jobId);
            toast.success("Candidature envoyée ! 🚀");
            // Update local state to reflect change immediately
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isApplied: true } : j));
            if (selectedJob?.id === jobId) setSelectedJob(prev => ({ ...prev, isApplied: true }));
        } catch (error) {
            toast.error(error.message || "Erreur lors de la candidature.");
        } finally {
            setApplyingId(null);
        }
    };


    const toggleSave = async (jobId) => {
        try {
            setSavingId(jobId);
            if (savedJobs.includes(jobId)) {
                // await studentApi.unsaveJob(jobId); // See previous note
                await studentApi.saveJob(jobId); // Assuming toggle
                setSavedJobs(prev => prev.filter(id => id !== jobId));
                toast.success("Retiré des favoris");
                setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSaved: false } : j));
            } else {
                await studentApi.saveJob(jobId);
                setSavedJobs(prev => [...prev, jobId]);
                toast.success("Ajouté aux favoris ❤️");
                setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSaved: true } : j));
            }
        } catch (error) {
            console.error(error);
            toast.error("Action impossible");
        } finally {
            setSavingId(null);
        }
    };



    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "ALL" || job.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                        <Briefcase className="text-blue-500" /> Offres d'Emploi
                    </h1>

                    <p className="text-slate-400">Découvrez les opportunités qui correspondent à votre profil.</p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
                    <div className="relative flex-1 sm:min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un poste..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                        <option value="ALL">Tous types</option>
                        <option value="Stage PFE">PFE (Projet Fin d'Études)</option>
                        <option value="Stage d'été">Job d'été</option>

                        <option value="Alternance">Alternance</option>
                        <option value="CDI">CDI</option>
                    </select>
                    <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
                        <button
                            onClick={() => setViewMode("card")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl">
                    <Briefcase size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Aucune offre trouvée</h3>
                    <p className="text-slate-400">Essayez d'élargir vos critères de recherche.</p>
                </div>
            ) : (
                <div className={viewMode === 'card' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                    <AnimatePresence>
                        {filteredJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                viewMode={viewMode}
                                isSaved={savedJobs.includes(job.id)}
                                isSaving={savingId === job.id}
                                onToggleSave={() => toggleSave(job.id)}
                                onApply={() => handleApply(job.id)} // This might not be used directly on card anymore if we open drawer
                                onClick={() => setSelectedJob(job)}
                            />

                        ))}
                    </AnimatePresence>
                </div>
            )}

            <JobDrawer
                job={selectedJob}
                isOpen={!!selectedJob}
                onClose={() => setSelectedJob(null)}
                onApply={handleApply}
                onSave={toggleSave}
                isApplying={applyingId === selectedJob?.id}
                isSaving={savingId === selectedJob?.id}
                tokensRemaining={5} // TODO: Fetch real tokens

            />

        </div>
    );
}

function JobCard({ job, viewMode, isSaved, isSaving, onToggleSave, onApply, onClick }) {


    const isList = viewMode === 'list';

    if (isList) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onClick}
                className="group bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 rounded-2xl p-5 flex flex-col md:flex-row gap-6 transition-all hover:bg-slate-900/60 cursor-pointer"
            >

                {/* Logo */}
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0 p-1 shadow-lg">
                    {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain" />
                    ) : (
                        <Building className="text-slate-800" size={24} />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-1">{job.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                                <span className="text-white">{job.companyName}</span>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-slate-800 rounded text-xs">{job.type}</span>
                                <span>•</span>
                                <span>{job.location}</span>
                                {(job.interviewQuota && job.applicationCount !== undefined) && (
                                    <>
                                        <span>•</span>
                                        <span className="text-blue-400">{Math.max(0, job.interviewQuota - job.applicationCount)} places restantes</span>
                                    </>
                                )}

                            </div>

                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                            disabled={isSaving}
                            className={`p-2 rounded-xl transition-all ${isSaved ? "bg-pink-500/10 text-pink-500" : "bg-slate-900 text-slate-500 hover:text-white hover:bg-slate-800"}`}
                        >
                            {isSaving ? <Loader2 size={20} className="animate-spin" /> : isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                        </button>

                    </div>

                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">{job.description}</p>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); onApply(); }}
                            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${job.isApplied
                                ? (job.status === 'ACCEPTED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-none cursor-default"
                                    : job.status === 'REJECTED' ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-none cursor-default"
                                        : job.wasInvited ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-none cursor-default"
                                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-none cursor-default")
                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                                }`}
                        >
                            {job.isApplied ? (
                                job.status === 'ACCEPTED' ? "Accepté" :
                                    job.status === 'REJECTED' ? "Rejeté" :
                                        job.wasInvited ? "Invité" : "Candidaté"
                            ) : job.isInvited ? "Invité" : "Postuler"}
                        </button>


                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Clock size={12} /> {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr }) : "Récemment"}
                        </span>

                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClick}
            className="group relative bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 rounded-[2rem] p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10 cursor-pointer"
        >

            <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg">
                    {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain" />
                    ) : (
                        <Building className="text-slate-800" size={24} />
                    )}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                    disabled={isSaving}
                    className={`p-2.5 rounded-xl transition-all ${isSaved ? "bg-pink-500/10 text-pink-500" : "bg-slate-950 text-slate-500 hover:text-white hover:bg-slate-800"}`}
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>

            </div>

            <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{job.title}</h3>
                <p className="text-slate-400 text-sm font-medium mb-3">{job.companyName}</p>
                <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wide border border-blue-500/20">
                        {job.type}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold border border-slate-700">
                        {job.location}
                    </span>
                    {(job.interviewQuota && job.applicationCount !== undefined) && (
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-xs font-bold border border-amber-500/20">
                            {Math.max(0, job.interviewQuota - job.applicationCount)} places
                        </span>
                    )}

                </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5 mb-4">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock size={12} /> {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr }) : "Récemment"}
                </span>
            </div>


            <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-3">
                <button
                    onClick={(e) => { e.stopPropagation(); onApply(); }}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn ${job.isApplied
                        ? (job.status === 'ACCEPTED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : job.status === 'REJECTED' ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : job.wasInvited ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20")
                        : "bg-white hover:bg-blue-50 text-slate-900"
                        }`}
                >
                    {job.isApplied ? (
                        job.status === 'ACCEPTED' ? "Candidature Acceptée" :
                            job.status === 'REJECTED' ? "Candidature Rejetée" :
                                job.wasInvited ? "Invitation Reçue" : "Candidature envoyée"
                    ) : job.isInvited ? "Vous êtes invité" : "Voir l'offre"}
                    {!job.isApplied && <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />}
                </button>
            </div>

        </motion.div>
    );
}
