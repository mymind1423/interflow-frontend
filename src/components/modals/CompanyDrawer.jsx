import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Building, Globe, Mail, Briefcase, DollarSign, Clock, Bookmark, ArrowRight } from "lucide-react";
import { studentApi } from "../../api/studentApi";
import toast from "react-hot-toast";

export default function CompanyDrawer({ company, isOpen, onClose }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (company && isOpen) {
            fetchJobs();
        }
    }, [company, isOpen]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const data = await studentApi.getCompanyJobs(company.id);
            setJobs(data);
        } catch (error) {
            console.error(error);
            toast.error("Impossible de charger les offres");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId) => {
        try {
            const res = await studentApi.apply(jobId);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Candidature envoyée avec succès ! 🚀");
                setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isApplied: true } : j));
            }
        } catch (e) { toast.error("Une erreur est survenue"); }
    };

    const handleSave = async (jobId) => {
        try {
            const res = await studentApi.saveJob(jobId);
            if (res.saved) {
                toast.success("Offre sauvegardée ! 📌");
                setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSaved: true } : j));
            } else {
                toast.success("Offre retirée des favoris");
                setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSaved: false } : j));
            }
        } catch (e) { toast.error("Erreur lors de la sauvegarde"); }
    };

    return (
        <AnimatePresence>
            {isOpen && company && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-950 border-l border-slate-800 shadow-2xl z-50 overflow-y-auto"
                    >
                        <div className="relative">
                            {/* Cover / Header bg */}
                            <div className="h-32 bg-gradient-to-r from-blue-900 to-slate-900"></div>

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all backdrop-blur-md"
                            >
                                <X size={20} />
                            </button>

                            <div className="px-6 pb-6">
                                {/* Company Info */}
                                <div className="relative -mt-12 mb-6">
                                    <div className="w-24 h-24 rounded-2xl bg-slate-900 border-4 border-slate-950 flex items-center justify-center overflow-hidden shadow-2xl">
                                        {company.logoUrl ? (
                                            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building size={32} className="text-slate-500" />
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <h2 className="text-3xl font-bold text-white">{company.name || company.displayName}</h2>
                                        {company.domaine && <p className="text-slate-400 font-medium">{company.domaine}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {company.address && (
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <MapPin size={16} className="text-slate-500" />
                                            {company.address}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Mail size={16} className="text-slate-500" />
                                        Contact vérifié
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm col-span-2">
                                        <Globe size={16} className="text-slate-500" />
                                        Site web officiel
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-slate-800 mb-8" />

                                {/* Offers Section */}
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    Offres Disponibles <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{jobs.length}</span>
                                </h3>

                                {loading ? (
                                    <div className="flex justify-center py-10">
                                        <div className="animate-spin text-blue-500"><Clock size={32} /></div>
                                    </div>
                                ) : jobs.length > 0 ? (
                                    <div className="space-y-4">
                                        {jobs.map(job => (
                                            <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{job.title}</h4>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                                                            <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                                                            <span className="flex items-center gap-1"><Briefcase size={12} /> {job.type}</span>
                                                            <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 mt-4">
                                                    <button
                                                        onClick={() => handleSave(job.id)}
                                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${job.isSaved
                                                            ? "bg-slate-800 text-blue-400 hover:bg-slate-700"
                                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                                            }`}
                                                    >
                                                        <Bookmark size={16} fill={job.isSaved ? "currentColor" : "none"} />
                                                        {job.isSaved ? "Sauvegardé" : "Sauvegarder"}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (!job.isApplied && !job.isInvited) handleApply(job.id);
                                                        }}
                                                        disabled={job.isApplied || job.isInvited}
                                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg ${job.isApplied
                                                            ? "bg-green-600/20 text-green-500 cursor-default shadow-none border border-green-600/20"
                                                            : job.isInvited
                                                                ? "bg-slate-700/50 text-slate-400 border border-slate-600/30 cursor-default shadow-none"
                                                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                                                            }`}
                                                    >
                                                        {job.isApplied ? "Déjà postulé" : job.isInvited ? "Invité" : "Candidater"}
                                                        {!job.isApplied && !job.isInvited && <ArrowRight size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                                        <Briefcase size={32} className="mx-auto mb-3 opacity-50" />
                                        <p>Aucune offre en cours pour le moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
