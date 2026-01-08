import { useState, useEffect } from "react";
import { companyApi } from "../../api/companyApi";
import { studentApi } from "../../api/studentApi";
import { Search, MapPin, Briefcase, DollarSign, Clock, Bookmark, BookmarkCheck, LayoutGrid, List, ArrowRight, Building, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import JobDrawer from "../../components/modals/JobDrawer";
import { useAuth } from "../../authContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useApplicationQuota } from "../../hooks/useApplicationQuota";
import QuotaLimitModal from "../../components/modals/QuotaLimitModal";
import JobCard from "../../components/common/JobCard";


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

    // Quota Logic
    const { used, limit, isLocked, loading: quotaLoading } = useApplicationQuota();
    const [showQuotaModal, setShowQuotaModal] = useState(false);

    // Derived state for saturation
    const SATURATION_LIMIT = 50;



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
            // Check if error is related to quota
            if (error.message && error.message.includes("quota")) {
                setShowQuotaModal(true);
            } else {
                toast.error(error.message || "Erreur lors de la candidature.");
            }
        } finally {
            setApplyingId(null);
        }
    };

    const handleApplyClick = (jobId) => {
        if (isLocked) {
            setShowQuotaModal(true);
            return;
        }
        handleApply(jobId);
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
                    <h1 className="text-3xl font-black text-theme-primary mb-2 flex items-center gap-3">
                        <Briefcase className="text-blue-600 dark:text-blue-400" /> Offres d'Emploi
                    </h1>

                    <p className="text-theme-secondary font-medium">Découvrez les opportunités qui correspondent à votre profil.</p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto glass-panel p-3 rounded-2xl shadow-lg border border-white/40">
                    <div className="relative flex-1 sm:min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un poste..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-theme-primary focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm placeholder:text-theme-secondary focus:bg-white dark:focus:bg-slate-800"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-theme-primary text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800 cursor-pointer"
                    >
                        <option value="ALL">Tous types</option>
                        <option value="Stage PFE">PFE (Projet Fin d'Études)</option>
                        <option value="Stage d'été">Job d'été</option>

                        <option value="Alternance">Alternance</option>
                        <option value="CDI">CDI</option>
                    </select>
                    <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                        <button
                            onClick={() => setViewMode("card")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-blue-600 text-white shadow-md" : "text-theme-secondary hover:text-theme-primary"} `}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-blue-600 text-white shadow-md" : "text-theme-secondary hover:text-theme-primary"} `}
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
                <div className="text-center py-20 glass-panel border border-dashed rounded-3xl">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-white/5">
                        <Briefcase size={28} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-theme-primary mb-2">Aucune offre trouvée</h3>
                    <p className="text-theme-secondary">Essayez d'élargir vos critères de recherche.</p>
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
                                onApply={() => handleApplyClick(job.id)}
                                onClick={() => setSelectedJob(job)}
                                isLocked={isLocked}
                                saturatedLimit={SATURATION_LIMIT}
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
                tokensRemaining={5} // Keep for generic token logic if needed, but rely on isLocked
                isLocked={isLocked}
                saturatedLimit={SATURATION_LIMIT}
            />

            <QuotaLimitModal
                isOpen={showQuotaModal}
                onClose={() => setShowQuotaModal(false)}
            />

        </div>
    );
}
