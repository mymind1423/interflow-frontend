import { useState, useEffect } from "react";
import { companyApi } from "../../api/companyApi";
import { Briefcase, Users, Plus, Calendar, MapPin, DollarSign, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle, FileText, Activity, Edit, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import LiveInterviewManager from "../../components/live/LiveInterviewManager";
import Skeleton from "../../components/common/Skeleton";
import { Link } from "react-router-dom";

export default function CompanyDashboard() {
    const [activeTab, setActiveTab] = useState("jobs");
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [showNewJobModal, setShowNewJobModal] = useState(false);
    const [newJob, setNewJob] = useState({ title: "", description: "", location: "", type: "Stage", salary: "" });
    const [viewingApp, setViewingApp] = useState(null);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [jobsData, appsData, profileData] = await Promise.all([
                companyApi.getJobs(),
                companyApi.getApplications(),
                companyApi.getProfile()
            ]);
            setJobs(jobsData);
            setApplications(appsData);
            setProfile(profileData);
        } catch (err) {
            console.error(err);
            toast.error("Erreur de chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            if (newJob.id) {
                await companyApi.updateJob(newJob);
                toast.success("Offre mise à jour !");
            } else {
                await companyApi.createJob(newJob);
                toast.success("Offre créée avec succès !");
            }
            setShowNewJobModal(false);
            setNewJob({ title: "", description: "", location: "", type: "Stage", salary: "" });
            loadData();
        } catch (err) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const toastId = toast.loading("Mise à jour en cours...");
            await companyApi.updateApplicationStatus(id, status);
            toast.dismiss(toastId);
            toast.success("Statut mis à jour");
            loadData();
            if (viewingApp && viewingApp.id === id) {
                setViewingApp(null);
            }
        } catch (err) {
            toast.dismiss();
            toast.error("Erreur lors de la mise à jour");
        }
    };

    // Calculate Stats
    const totalQuota = profile?.quota?.total || jobs.reduce((acc, job) => acc + (job.interviewQuota || 10), 0);
    const placesLeft = Math.max(0, totalQuota - applications.length);

    const stats = [
        { label: "Places disponibles", value: placesLeft, icon: CheckCircle, color: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-500" },
        { label: "Offres Actives", value: jobs.length, icon: Briefcase, color: "blue", bg: "bg-blue-500/10", text: "text-blue-500" },
        { label: "Total Candidatures", value: applications.length, icon: Users, color: "purple", bg: "bg-purple-500/10", text: "text-purple-500" },
        {
            label: "Taux de conversion",
            value: applications.length > 0 ? `${Math.round((applications.filter(a => a.status === 'ACCEPTED').length / applications.length) * 100)}%` : "0%",
            icon: TrendingUp,
            color: "emerald",
            bg: "bg-emerald-500/10",
            text: "text-emerald-500"
        },
        { label: "En attente", value: applications.filter(a => a.status === 'PENDING').length, icon: AlertCircle, color: "amber", bg: "bg-amber-500/10", text: "text-amber-500" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4 md:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Tableau de Bord</h1>
                    <p className="text-slate-400 text-sm sm:text-base">Gérez vos offres et suivez vos recrutements</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                    <Link
                        to="/company/live"
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all border border-slate-700 hover:border-red-500/50 group whitespace-nowrap"
                    >
                        <Activity size={20} className="text-red-500 group-hover:animate-pulse" />
                        Live Manager
                    </Link>
                    {activeTab === "jobs" && !loading && (
                        <button
                            onClick={() => {
                                if (jobs.length > 0) {
                                    setNewJob(jobs[0]);
                                } else {
                                    setNewJob({ title: "", description: "", location: "", type: "Stage", salary: "" });
                                }
                                setShowNewJobModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 whitespace-nowrap"
                        >
                            {jobs.length > 0 ? <Briefcase size={20} /> : <Plus size={20} />}
                            {jobs.length > 0 ? "Modifier l'offre" : "Nouvelle Offre"}
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {loading
                    ? Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
                            <Skeleton className="w-14 h-14 rounded-xl" />
                            <div className="flex-1">
                                <Skeleton className="w-12 h-8 mb-2" />
                                <Skeleton className="w-24 h-4" />
                            </div>
                        </div>
                    ))
                    : stats.map((stat, index) => (
                        <div key={index} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-5 hover:border-slate-700 transition-colors shadow-sm">
                            <div className={`p-4 rounded-xl ${stat.bg} ${stat.text}`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-900/50 rounded-xl w-full md:w-fit mb-8 border border-slate-800 backdrop-blur-sm overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab("jobs")}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === "jobs" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}
                >
                    Mes Offres
                </button>
                <button
                    onClick={() => setActiveTab("applications")}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === "applications" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/20" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}
                >
                    Candidatures
                </button>
            </div>

            {/* Content */}
            {activeTab === "jobs" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 h-[400px] flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1 mr-4">
                                        <Skeleton className="h-8 w-3/4 mb-3" />
                                        <Skeleton className="h-6 w-20 rounded-xl" />
                                    </div>
                                    <Skeleton className="h-16 w-14 rounded-2xl" />
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <Skeleton className="h-12 w-full rounded-2xl" />
                                    <Skeleton className="h-12 w-full rounded-2xl" />
                                </div>
                                <Skeleton className="h-20 w-full mb-6 rounded-xl" />
                                <div className="mt-auto pt-5 border-t border-white/5 flex justify-between items-center">
                                    <Skeleton className="h-10 w-32" />
                                    <div className="flex gap-2">
                                        <Skeleton className="w-10 h-10 rounded-xl" />
                                        <Skeleton className="w-10 h-10 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            {jobs.map(job => (
                                <div key={job.id} className="group relative bg-gradient-to-br from-slate-800/50 to-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 hover:border-indigo-400/50 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] hover:-translate-y-1 flex flex-col h-full overflow-hidden">
                                    {/* Decorative Vivid Blob */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-[60px] group-hover:bg-indigo-400/40 transition-all duration-500 pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] group-hover:bg-blue-400/20 transition-all duration-500 pointer-events-none"></div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex-1 mr-4">
                                                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 group-hover:from-indigo-300 group-hover:to-white transition-all line-clamp-2 mb-3 filter drop-shadow-lg">{job.title}</h3>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                                    <Briefcase size={14} className="stroke-[3]" /> {job.type}
                                                </span>
                                            </div>
                                            <div className="shrink-0 bg-slate-950/60 backdrop-blur-md rounded-2xl p-3 border border-white/10 font-bold text-xs text-slate-300 shadow-xl flex flex-col items-center gap-1">
                                                <span className="text-xl font-black text-indigo-400">{new Date(job.createdAt).getDate()}</span>
                                                <span className="uppercase text-[10px] tracking-wider text-slate-500">{new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short' })}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5 group-hover:border-pink-500/30 group-hover:bg-pink-500/10 transition-all duration-300">
                                                <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 shadow-inner shadow-pink-500/20">
                                                    <MapPin size={18} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] text-pink-300/70 font-bold uppercase tracking-wider">Lieu</p>
                                                    <p className="text-sm font-bold text-white truncate drop-shadow-md">{job.location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all duration-300">
                                                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shadow-inner shadow-emerald-500/20">
                                                    <DollarSign size={18} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] text-emerald-300/70 font-bold uppercase tracking-wider">Salaire</p>
                                                    <p className="text-sm font-bold text-white truncate drop-shadow-md">{job.salary || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-slate-300 text-sm line-clamp-3 mb-6 leading-relaxed font-medium">
                                                {job.description || "Aucune description fournie."}
                                            </p>
                                        </div>

                                        <div className="pt-5 border-t border-white/10 mt-auto flex items-center justify-between gap-4">
                                            <div className="flex flex-col gap-1 w-full max-w-[50%]">
                                                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                                                    <span>Places Restantes</span>
                                                    <span className={`${Math.max(0, (job.interviewQuota || 10) - (job.applicationCount || 0)) <= 2 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                                                        {Math.max(0, (job.interviewQuota || 10) - (job.applicationCount || 0))}
                                                    </span>
                                                </div>

                                                {(job.applicationCount || 0) >= (job.interviewQuota || 10) ? (
                                                    <div className="w-full bg-emerald-500/20 border border-emerald-500/30 rounded-lg py-1 px-2 text-[10px] font-bold text-center text-emerald-400 uppercase tracking-wide">
                                                        Quota atteint
                                                    </div>
                                                ) : (
                                                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${Math.max(0, (job.interviewQuota || 10) - (job.applicationCount || 0)) <= 2 ? 'bg-red-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${Math.min(100, ((job.applicationCount || 0) / (job.interviewQuota || 10)) * 100)}%` }}
                                                        />
                                                    </div>
                                                )}

                                                <div className="text-[10px] text-slate-500 mt-0.5 flex justify-between">
                                                    <span>{job.applicationCount || 0} / {job.interviewQuota || 10} Candidatures</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setNewJob(job); setShowNewJobModal(true); }}
                                                    className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-emerald-500 text-slate-300 hover:text-white transition-all border border-white/10 hover:border-emerald-500 shadow-lg flex items-center justify-center group/edit"
                                                    title="Modifier"
                                                >
                                                    <Edit size={18} className="group-hover/edit:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.')) {
                                                            try {
                                                                setDeletingId(job.id);
                                                                await companyApi.deleteJob(job.id);
                                                                toast.success('Offre supprimée');
                                                                loadData();
                                                            } catch (e) { toast.error('Erreur'); }
                                                            finally { setDeletingId(null); }
                                                        }
                                                    }}
                                                    className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-red-500 text-slate-300 hover:text-white transition-all border border-white/10 hover:border-red-500 shadow-lg flex items-center justify-center group/del"
                                                    title="Supprimer"
                                                    disabled={deletingId === job.id}
                                                >
                                                    {deletingId === job.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Single Offer Constraint: Only show create button if NO jobs exist */}
                            {jobs.length === 0 && (
                                <button
                                    onClick={() => setShowNewJobModal(true)}
                                    className="group border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-indigo-500 hover:bg-indigo-500/5 transition-all min-h-[300px]"
                                >
                                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 group-hover:border-indigo-500/30 flex items-center justify-center transition-colors shadow-lg group-hover:shadow-indigo-500/20">
                                        <Plus size={32} />
                                    </div>
                                    <p className="font-bold">Créer votre offre (Max 1)</p>
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === "applications" && (
                <div className="grid gap-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl h-32 flex items-center gap-4">
                                <Skeleton className="w-16 h-16 rounded-2xl" />
                                <div className="flex-1">
                                    <Skeleton className="w-1/3 h-6 mb-2" />
                                    <Skeleton className="w-1/4 h-4" />
                                </div>
                                <Skeleton className="w-24 h-10 rounded-xl" />
                            </div>
                        ))
                    ) : (
                        <>
                            {applications.map(app => (
                                <div key={app.id}
                                    onClick={() => setViewingApp(app)}
                                    className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 p-5 sm:p-6 rounded-3xl cursor-pointer hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 overflow-hidden"
                                >
                                    {/* Dynamic Background Gradient based on Status */}
                                    <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors duration-500 pointer-events-none 
                        ${app.status === 'ACCEPTED' ? 'bg-emerald-500' :
                                            app.status === 'REJECTED' ? 'bg-red-500' :
                                                'bg-blue-600'}`}>
                                    </div>

                                    <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                                        {/* Left: Profile & Info */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto">
                                            <div className="relative">
                                                <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-lg transition-colors duration-300 
                                    ${app.status === 'ACCEPTED' ? 'border-emerald-500/50 shadow-emerald-500/20' :
                                                        app.status === 'REJECTED' ? 'border-red-500/50 shadow-red-500/20' :
                                                            'border-blue-500/50 shadow-blue-500/20'}`}>
                                                    {app.applicantPhoto ? (
                                                        <img src={app.applicantPhoto} alt="" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xl">
                                                            {app.applicantName ? app.applicantName.substring(0, 2) : "??"}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Status Icon Badge */}
                                                <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-white shadow-sm
                                    ${app.status === 'ACCEPTED' ? 'bg-emerald-500' :
                                                        app.status === 'REJECTED' ? 'bg-red-500' :
                                                            'bg-amber-500'}`}>
                                                    {app.status === 'ACCEPTED' ? <CheckCircle size={12} strokeWidth={3} /> :
                                                        app.status === 'REJECTED' ? <XCircle size={12} strokeWidth={3} /> :
                                                            <Clock size={12} strokeWidth={3} />}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                                                    {app.applicantName}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 font-medium">
                                                        <Briefcase size={12} className="text-blue-400" /> {app.jobTitle}
                                                    </span>
                                                    {app.domaine && (
                                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400">
                                                            {app.domaine}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Quote & Actions */}
                                        <div className="flex flex-col lg:items-end gap-4 w-full lg:w-auto mt-2 lg:mt-0">
                                            {app.coverLetter ? (
                                                <div className="px-4 py-2 bg-slate-800/30 border border-slate-700/30 rounded-r-xl border-l-2 border-l-blue-500 text-slate-400 text-sm italic max-w-full lg:max-w-md truncate">
                                                    "{app.coverLetter.substring(0, 60)}..."
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-600 italic">Aucune lettre de motivation</div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                                {/* Documents */}
                                                <div className="flex gap-2 mr-auto lg:mr-4">
                                                    {app.cvUrl && (
                                                        <a href={app.cvUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors" title="Voir le CV">
                                                            <FileText size={16} />
                                                        </a>
                                                    )}
                                                    {app.diplomaUrl && (
                                                        <a href={app.diplomaUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors" title="Voir le Diplôme">
                                                            <Briefcase size={16} /> {/* Using Briefcase as generic Icon for Diploma if 'GraduationCap' not avail */}
                                                        </a>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 w-full sm:w-auto justify-end">
                                                    {app.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app.id, "ACCEPTED"); }}
                                                                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 text-emerald-500 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn"
                                                            >
                                                                <CheckCircle size={16} className="group-hover/btn:scale-110 transition-transform" /> Accepter
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm('Êtes-vous sûr de vouloir refuser cette candidature ?')) {
                                                                        handleStatusUpdate(app.id, "REJECTED");
                                                                    }
                                                                }}
                                                                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn-reject"
                                                            >
                                                                <XCircle size={16} className="group-hover/btn-reject:scale-110 transition-transform" /> Refuser
                                                            </button>
                                                        </>
                                                    )}
                                                    {app.status !== 'PENDING' && (
                                                        <span className={`px-4 py-2 rounded-xl font-bold text-sm border flex items-center gap-2 whitespace-nowrap
                                            ${app.status === 'ACCEPTED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                                'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                                            {app.status === 'ACCEPTED' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                            {app.status === 'ACCEPTED' ? 'Accepté' : 'Refusé'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {applications.length === 0 && (
                                <div className="text-center py-12 bg-slate-900 border border-slate-800 border-dashed rounded-2xl">
                                    <Users size={48} className="mx-auto text-slate-600 mb-4" />
                                    <p className="text-slate-400 font-medium">Aucune candidature reçue pour le moment.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Application Detail Modal */}
            {viewingApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row animate-fade-in-up">

                        {/* Left Sidebar: Profile Info */}
                        <div className="w-full md:w-1/3 bg-slate-950 p-5 sm:p-6 border-r border-slate-800">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-slate-800 overflow-hidden border-2 border-slate-700 mb-4 shadow-lg shrink-0">
                                    {viewingApp.applicantPhoto ? (
                                        <img src={viewingApp.applicantPhoto} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-2xl font-bold">
                                            {viewingApp.applicantName ? viewingApp.applicantName.substring(0, 2) : "??"}
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-white">{viewingApp.applicantName}</h2>
                                <p className="text-blue-400 font-medium">{viewingApp.domaine || "Domaine non spécifié"}</p>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-slate-500 font-medium mb-1">Contact</p>
                                    <p className="text-slate-300 truncate" title={viewingApp.email}>{viewingApp.email}</p>
                                    <p className="text-slate-300">{viewingApp.phone || "N/A"}</p>
                                    <p className="text-slate-300 line-clamp-2">{viewingApp.address || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 font-medium mb-1">Faculté / École</p>
                                    <p className="text-slate-300">{viewingApp.faculty || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 font-medium mb-1">Niveau</p>
                                    <p className="text-slate-300">{viewingApp.grade || "N/A"}</p>
                                </div>
                            </div>

                            <hr className="my-6 border-slate-800" />

                            <div className="flex flex-col gap-3">
                                {viewingApp.status === 'PENDING' ? (
                                    <>
                                        <button
                                            onClick={() => { handleStatusUpdate(viewingApp.id, "ACCEPTED"); }}
                                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={18} /> Accepter
                                        </button>
                                        <button
                                            onClick={() => { handleStatusUpdate(viewingApp.id, "REJECTED"); }}
                                            className="w-full py-2.5 bg-red-500/10 hover:bg-red-600 hover:text-white border border-red-500/20 hover:border-red-600 text-red-500 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 group/btn-reject-modal"
                                        >
                                            <XCircle size={18} className="group-hover/btn-reject-modal:scale-110 transition-transform" /> Refuser
                                        </button>
                                    </>
                                ) : (
                                    <div className={`w-full py-3 rounded-xl font-bold text-base border flex items-center justify-center gap-2
                                        ${viewingApp.status === 'ACCEPTED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                            'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                        {viewingApp.status === 'ACCEPTED' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                        {viewingApp.status === 'ACCEPTED' ? 'Candidature Acceptée' : 'Candidature Refusée'}
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setViewingApp(null)} className="mt-4 w-full py-2 text-slate-500 hover:text-white transition-colors">Fermer</button>
                        </div>

                        {/* Right Content: Cover Letter & Docs */}
                        <div className="flex-1 p-6 bg-slate-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <FileText size={20} className="text-blue-500" /> Lettre de motivation
                                </h3>
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                                    {viewingApp.coverLetter || "Le candidat n'a pas ajouté de lettre de motivation."}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <FileText size={20} className="text-purple-500" /> CV
                                    </h3>
                                    {viewingApp.cvUrl ? (
                                        <iframe
                                            src={viewingApp.cvUrl}
                                            className="w-full h-64 rounded-xl border border-slate-800 bg-white"
                                            title="CV Preview"
                                        />
                                    ) : (
                                        <div className="h-64 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 italic">
                                            Non disponible
                                        </div>
                                    )}
                                    {viewingApp.cvUrl && (
                                        <a href={viewingApp.cvUrl} target="_blank" rel="noreferrer" className="block mt-2 text-center text-sm text-blue-400 hover:underline font-medium">Ouvrir en plein écran</a>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <FileText size={20} className="text-pink-500" /> Diplôme
                                    </h3>
                                    {viewingApp.diplomaUrl ? (
                                        <iframe
                                            src={viewingApp.diplomaUrl}
                                            className="w-full h-64 rounded-xl border border-slate-800 bg-white"
                                            title="Diploma Preview"
                                        />
                                    ) : (
                                        <div className="h-64 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 italic">
                                            Non disponible
                                        </div>
                                    )}
                                    {viewingApp.diplomaUrl && (
                                        <a href={viewingApp.diplomaUrl} target="_blank" rel="noreferrer" className="block mt-2 text-center text-sm text-blue-400 hover:underline font-medium">Ouvrir en plein écran</a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Job Modal */}
            {showNewJobModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-white">
                                {newJob.id ? "Modifier l'offre" : "Nouvelle Offre"}
                            </h2>
                            <button onClick={() => setShowNewJobModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateJob} className="space-y-4 sm:space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Titre du poste</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-600"
                                    placeholder="ex: Développeur Full Stack"
                                    value={newJob.title}
                                    onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                                    maxLength={50}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Type de contrat</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white appearance-none focus:border-blue-500 outline-none cursor-pointer"
                                            value={newJob.type}
                                            onChange={e => setNewJob({ ...newJob, type: e.target.value })}
                                        >
                                            <option>Stage</option>
                                            <option>Stage PFE</option>
                                            <option>Alternance</option>
                                            <option>CDI</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <Briefcase size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Salaire</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none placeholder-slate-600"
                                        placeholder="ex: 8000 DH"
                                        value={newJob.salary}
                                        onChange={e => setNewJob({ ...newJob, salary: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Lieu</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none placeholder-slate-600"
                                    placeholder="ex: Casablanca, Hybride"
                                    value={newJob.location}
                                    onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description du poste</label>
                                <textarea
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white h-32 focus:border-blue-500 outline-none placeholder-slate-600 resize-none leading-relaxed"
                                    placeholder="Décrivez les missions et responsabilités..."
                                    value={newJob.description}
                                    onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowNewJobModal(false)}
                                    className="px-6 py-2.5 text-slate-400 hover:text-white font-medium transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:scale-105 flex items-center gap-2"
                                >
                                    {saving ? <Loader2 size={20} className="animate-spin" /> : (newJob.id ? "Enregistrer" : "Publier l'offre")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
