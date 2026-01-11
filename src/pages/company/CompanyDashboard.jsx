import { useState, useEffect } from "react";
import { companyApi } from "../../api/companyApi";
import { Briefcase, Users, Plus, Calendar, MapPin, DollarSign, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle, FileText, Activity, Edit, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import LiveInterviewManager from "../../components/live/LiveInterviewManager";
import Skeleton from "../../components/common/Skeleton";
import { Link } from "react-router-dom";
import "driver.js/dist/driver.css";
import { driver } from "driver.js";

export default function CompanyDashboard() {
    const [activeTab, setActiveTab] = useState("applications"); // Default to applications since we have single job view
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

    useEffect(() => {
        if (!loading && !localStorage.getItem('company_tour_completed')) {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                doneBtnText: "C'est parti !",
                nextBtnText: "Suivant",
                prevBtnText: "Précédent",
                steps: [
                    {
                        element: '#tour-stats',
                        popover: {
                            title: 'Vos Statistiques',
                            description: 'Suivez en un coup d\'œil vos places restantes, candidatures et taux de conversion.',
                            side: "bottom",
                            align: 'start'
                        }
                    },
                    {
                        element: '#tour-create-offer',
                        popover: {
                            title: 'Gérez vos Offres',
                            description: 'Créez ou modifiez votre offre de stage ici. Vous avez droit à une offre active à la fois.',
                            side: "left",
                            align: 'start'
                        }
                    },
                    {
                        element: jobs.length === 0 ? '#tour-create-offer-empty' : '#tour-create-offer', // Fallback
                        popover: {
                            title: 'Création d\'offre',
                            description: 'C\'est ici que tout commence ! Cliquez pour publier votre annonce.',
                            side: "top",
                            align: 'center'
                        }
                    },
                    {
                        element: '#tour-tabs',
                        popover: {
                            title: 'Navigation',
                            description: 'Basculez entre vos offres et les candidatures reçues.',
                            side: "bottom",
                            align: 'start'
                        }
                    },
                    {
                        element: '#tour-live-manager',
                        popover: {
                            title: 'Live Manager',
                            description: 'Le jour J, cliquez ici pour accéder à vos entretiens en direct !',
                            side: "bottom",
                            align: 'end'
                        }
                    }
                ],
                onDestroyed: () => {
                    localStorage.setItem('company_tour_completed', 'true');
                    toast.success("Bon recrutement ! 🚀");
                    // Force remove overlay in case of glitches
                    document.body.classList.remove("driver-active", "driver-fade");
                }
            });

            // Small delay to ensure DOM is ready
            setTimeout(() => {
                driverObj.drive();
            }, 1000);
        }
    }, [loading]);

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
            value: applications.length > 0 ? `${Math.round((applications.filter(a => a.status === 'ACCEPTED').length / applications.length) * 100)}% ` : "0%",
            icon: TrendingUp,
            color: "emerald",
            bg: "bg-emerald-500/10",
            text: "text-emerald-500"
        },
        { label: "En attente", value: applications.filter(a => a.status === 'PENDING').length, icon: AlertCircle, color: "amber", bg: "bg-amber-500/10", text: "text-amber-500" },
    ];

    // Active Job Helper
    const activeJob = jobs.length > 0 ? jobs[0] : null;

    return (
        <div className="max-w-screen-2xl mx-auto px-4 py-6 sm:py-8">

            {/* SINGLE JOB HERO DASHBOARD */}
            <div className="relative overflow-hidden rounded-[2.5rem] glass-panel border border-blue-100/50 dark:border-blue-500/20 p-8 sm:p-10 mb-10 z-0 shadow-2xl shadow-blue-900/5">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex flex-col xl:flex-row justify-between items-start gap-8">

                        {/* LEFT: JOB INFO */}
                        <div className="flex-1 min-w-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                Offre Active
                            </div>

                            {activeJob ? (
                                <>
                                    <h1 className="text-4xl sm:text-5xl font-black text-theme-primary tracking-tight mb-4 leading-tight">
                                        {activeJob.title}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-bold text-theme-secondary mb-8">
                                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                                            <MapPin size={16} className="text-pink-500" />
                                            {activeJob.location}
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                                            <Briefcase size={16} className="text-blue-500" />
                                            {activeJob.type}
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                                            <DollarSign size={16} className="text-emerald-500" />
                                            {activeJob.salary || "Non spécifié"}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="mb-8">
                                    <h1 className="text-4xl font-black text-theme-primary mb-2">Aucune offre active</h1>
                                    <p className="text-theme-secondary">Commencez par créer une offre pour votre entreprise.</p>
                                </div>
                            )}

                            {/* STATS GRID EMBEDDED */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/5 shadow-sm backdrop-blur-sm flex flex-col justify-between h-28 group hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                            <Users size={18} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-theme-primary">{applications.length}</p>
                                        <p className="text-xs font-bold text-theme-secondary">Candidats</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/5 shadow-sm backdrop-blur-sm flex flex-col justify-between h-28 group hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle size={18} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Quota</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-theme-primary">{placesLeft}</p>
                                        <p className="text-xs font-bold text-theme-secondary">Places Restantes</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/5 shadow-sm backdrop-blur-sm flex flex-col justify-between h-28 group hover:border-amber-300 dark:hover:border-amber-500/30 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                            <Clock size={18} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Action</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-theme-primary">{applications.filter(a => a.status === 'PENDING').length}</p>
                                        <p className="text-xs font-bold text-theme-secondary">En attente</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/5 shadow-sm backdrop-blur-sm flex flex-col justify-between h-28 group hover:border-purple-300 dark:hover:border-purple-500/30 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                            <TrendingUp size={18} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Succès</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-theme-primary">
                                            {applications.length > 0 ? `${Math.round((applications.filter(a => a.status === 'ACCEPTED').length / applications.length) * 100)}%` : "0%"}
                                        </p>
                                        <p className="text-xs font-bold text-theme-secondary">Conversion</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: ACTIONS */}
                        <div className="flex flex-col gap-4 w-full xl:w-auto shrink-0">
                            <div className="flex gap-3">
                                {activeJob ? (
                                    <button
                                        onClick={() => { setNewJob(activeJob); setShowNewJobModal(true); }}
                                        className="flex-1 xl:flex-none h-14 px-6 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-all shadow-sm flex items-center justify-center gap-2 group"
                                    >
                                        <Edit size={18} className="group-hover:scale-110 transition-transform" />
                                        Modifier
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { setNewJob({ title: "", description: "", location: "", type: "Stage", salary: "" }); setShowNewJobModal(true); }}
                                        className="flex-1 xl:flex-none h-14 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Créer l'offre
                                    </button>
                                )}

                                <Link
                                    to="/company/live"
                                    className="flex-1 xl:flex-none h-14 px-6 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    <span className="relative flex h-2.5 w-2.5 mr-1">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                                    </span>
                                    Live Manager
                                </Link>
                            </div>

                            {/* Detailed Funnel Visualization */}
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-center mb-6 relative z-10">
                                    <h3 className="font-bold text-theme-primary flex items-center gap-2">
                                        <TrendingUp size={18} className="text-blue-500" />
                                        Entonnoir
                                    </h3>
                                    <span className="text-xs font-black bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg uppercase tracking-wider">
                                        Temps réel
                                    </span>
                                </div>

                                <div className="space-y-5 relative z-10">
                                    {/* Stage 1: Total */}
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-theme-secondary mb-2">
                                            <span>Total Candidatures</span>
                                            <span className="text-theme-primary">{applications.length}</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full w-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                        </div>
                                    </div>

                                    {/* Stage 2: Traitées */}
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-theme-secondary mb-2">
                                            <span>Candidatures Traitées</span>
                                            <span className="text-theme-primary">{applications.filter(a => a.status !== 'PENDING').length}</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000"
                                                style={{ width: `${applications.length ? (applications.filter(a => a.status !== 'PENDING').length / applications.length) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stage 3: Retenus */}
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-theme-secondary mb-2">
                                            <span>Profils Retenus</span>
                                            <span className="text-theme-primary">{applications.filter(a => a.status === 'ACCEPTED').length}</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                                                style={{ width: `${applications.length ? (applications.filter(a => a.status === 'ACCEPTED').length / applications.length) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Background Decoration */}
                                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CANDIDATES LIST HEADER */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-theme-primary flex items-center gap-3">
                    <Users size={24} className="text-blue-500" />
                    Candidatures
                    <span className="text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-500 px-3 py-1 rounded-full">
                        {applications.length}
                    </span>
                </h2>
            </div>

            {/* Content */}
            {
                (activeTab === "applications" || true) && (
                    <div className="grid gap-4">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="glass-panel p-6 rounded-3xl h-32 flex items-center gap-4">
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
                                        className="group relative glass-panel p-5 sm:p-6 rounded-3xl cursor-pointer hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 hover:-translate-y-1 overflow-hidden"
                                    >
                                        {/* Dynamic Background Gradient based on Status */}
                                        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-10 transition-colors duration-500 pointer-events-none 
                        ${app.status === 'ACCEPTED' ? 'bg-emerald-500' :
                                                app.status === 'REJECTED' ? 'bg-red-500' :
                                                    'bg-blue-600'
                                            }`}>
                                        </div>

                                        <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                                            {/* Left: Profile & Info */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto">
                                                <div className="relative">
                                                    <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-lg transition-colors duration-300 
                                    ${app.status === 'ACCEPTED' ? 'border-emerald-200 dark:border-emerald-500/30 shadow-emerald-100 dark:shadow-none' :
                                                            app.status === 'REJECTED' ? 'border-red-200 dark:border-red-500/30 shadow-red-100 dark:shadow-none' :
                                                                'border-blue-200 dark:border-blue-500/30 shadow-blue-100 dark:shadow-none'
                                                        }`}>
                                                        {app.applicantPhoto ? (
                                                            <img src={app.applicantPhoto} alt="" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-50 dark:bg-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-xl">
                                                                {app.applicantName ? app.applicantName.substring(0, 2) : "??"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Status Icon Badge */}
                                                    <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm
                                    ${app.status === 'ACCEPTED' ? 'bg-emerald-500' :
                                                            app.status === 'REJECTED' ? 'bg-red-500' :
                                                                'bg-amber-500'
                                                        }`}>
                                                        {app.status === 'ACCEPTED' ? <CheckCircle size={12} strokeWidth={3} /> :
                                                            app.status === 'REJECTED' ? <XCircle size={12} strokeWidth={3} /> :
                                                                <Clock size={12} strokeWidth={3} />}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-xl font-bold text-theme-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                                                        {app.applicantName}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">
                                                            <Briefcase size={12} className="text-blue-500" /> {app.jobTitle}
                                                        </span>
                                                        {app.domaine && (
                                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-500 dark:text-slate-400">
                                                                {app.domaine}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Quote & Actions */}
                                            <div className="flex flex-col lg:items-end gap-4 w-full lg:w-auto mt-2 lg:mt-0">
                                                {app.coverLetter ? (
                                                    <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-r-xl border-l-2 border-l-blue-500 text-slate-600 dark:text-slate-400 text-sm italic max-w-full lg:max-w-md truncate">
                                                        "{app.coverLetter.substring(0, 60)}..."
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400 italic">Aucune lettre de motivation</div>
                                                )}

                                                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                                    {/* Documents */}
                                                    <div className="flex gap-2 mr-auto lg:mr-4">
                                                        {app.cvUrl && (
                                                            <a href={app.cvUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                                                className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors shadow-sm" title="Voir le CV">
                                                                <FileText size={16} />
                                                            </a>
                                                        )}
                                                        {app.diplomaUrl && (
                                                            <a href={app.diplomaUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                                                className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 border border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors shadow-sm" title="Voir le Diplôme">
                                                                <Briefcase size={16} />
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                                                        {app.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app.id, "ACCEPTED"); }}
                                                                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-500 border border-emerald-200 hover:border-emerald-500 text-emerald-600 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn shadow-sm hover:shadow-emerald-200"
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
                                                                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-50 hover:bg-red-500 border border-red-200 hover:border-red-500 text-red-500 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn-reject shadow-sm hover:shadow-red-200"
                                                                >
                                                                    <XCircle size={16} className="group-hover/btn-reject:scale-110 transition-transform" /> Refuser
                                                                </button>
                                                            </>
                                                        )}
                                                        {app.status === 'ACCEPTED' && (
                                                            <div
                                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 z-20 cursor-default"
                                                            >
                                                                <CheckCircle size={16} />
                                                                Candidature acceptée
                                                            </div>
                                                        )}
                                                        {app.status === 'REJECTED' && (
                                                            <span className={`px-4 py-2 rounded-xl font-bold text-sm border flex items-center gap-2 whitespace-nowrap shadow-sm
                                            ${app.status === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                                                    'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'
                                                                }`}>
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
                                    <div className="text-center py-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 border-dashed rounded-2xl">
                                        <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Aucune candidature reçue pour le moment.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )
            }

            {/* Application Detail Modal */}
            {
                viewingApp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                        <div className="glass-panel rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row animate-fade-in-up">

                            {/* Left Sidebar: Profile Info */}
                            <div className="w-full md:w-1/3 bg-slate-50/50 dark:bg-slate-900/50 p-5 sm:p-6 border-r border-white/10">
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="w-24 h-24 rounded-full bg-white dark:bg-white/10 overflow-hidden border-4 border-white dark:border-white/5 mb-4 shadow-lg shrink-0">
                                        {viewingApp.applicantPhoto ? (
                                            <img src={viewingApp.applicantPhoto} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-2xl font-bold bg-slate-100 dark:bg-white/5">
                                                {viewingApp.applicantName ? viewingApp.applicantName.substring(0, 2) : "??"}
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-black text-theme-primary">{viewingApp.applicantName}</h2>
                                    <p className="text-blue-600 dark:text-blue-400 font-bold text-sm bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-500/20 inline-block mt-2">{viewingApp.domaine || "Domaine non spécifié"}</p>
                                </div>

                                <div className="space-y-4 text-sm">
                                    <div>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Contact</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium truncate" title={viewingApp.email}>{viewingApp.email}</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">{viewingApp.phone || "N/A"}</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">{viewingApp.address || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Faculté / École</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">{viewingApp.faculty || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Niveau</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">{viewingApp.grade || "N/A"}</p>
                                    </div>
                                </div>

                                <hr className="my-6 border-slate-200 dark:border-white/10" />

                                <div className="flex flex-col gap-3">
                                    {viewingApp.status === 'PENDING' ? (
                                        <>
                                            <button
                                                onClick={() => { handleStatusUpdate(viewingApp.id, "ACCEPTED"); }}
                                                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={18} /> Accepter
                                            </button>
                                            <button
                                                onClick={() => { handleStatusUpdate(viewingApp.id, "REJECTED"); }}
                                                className="w-full py-2.5 bg-white dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 border border-slate-200 dark:border-white/10 hover:border-red-200 dark:hover:border-red-500/30 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={18} /> Refuser
                                            </button>
                                        </>
                                    ) : (
                                        <div className={`w-full py-3 rounded-xl font-bold text-base border flex items-center justify-center gap-2 shadow-sm
                                        ${viewingApp.status === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                                'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'
                                            }`}>
                                            {viewingApp.status === 'ACCEPTED' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                            {viewingApp.status === 'ACCEPTED' ? 'Accepté' : 'Refusé'}
                                        </div>
                                    )}
                                </div>

                                <button onClick={() => setViewingApp(null)} className="mt-4 w-full py-2 text-slate-500 hover:text-slate-800 font-medium transition-colors">Fermer</button>
                            </div>

                            {/* Right Content: Cover Letter & Docs */}
                            <div className="flex-1 p-6 sm:p-8 bg-transparent">
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-theme-primary mb-3 flex items-center gap-2">
                                        <FileText size={20} className="text-blue-500" /> Lettre de motivation
                                    </h3>
                                    <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/10 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[100px] shadow-inner font-medium">
                                        {viewingApp.coverLetter || "Le candidat n'a pas ajouté de lettre de motivation."}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-theme-primary mb-3 flex items-center gap-2">
                                            <FileText size={20} className="text-indigo-500" /> CV
                                        </h3>
                                        {viewingApp.cvUrl ? (
                                            <iframe
                                                src={viewingApp.cvUrl}
                                                className="w-full h-64 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 shadow-sm"
                                                title="CV Preview"
                                            />
                                        ) : (
                                            <div className="h-64 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 italic">
                                                Non disponible
                                            </div>
                                        )}
                                        {viewingApp.cvUrl && (
                                            <a href={viewingApp.cvUrl} target="_blank" rel="noreferrer" className="block mt-2 text-center text-sm text-blue-600 hover:underline font-bold">Ouvrir en plein écran</a>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-theme-primary mb-3 flex items-center gap-2">
                                            <FileText size={20} className="text-pink-500" /> Diplôme
                                        </h3>
                                        {viewingApp.diplomaUrl ? (
                                            <iframe
                                                src={viewingApp.diplomaUrl}
                                                className="w-full h-64 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 shadow-sm"
                                                title="Diploma Preview"
                                            />
                                        ) : (
                                            <div className="h-64 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-theme-secondary/50 italic">
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
                )
            }

            {/* New Job Modal */}
            {
                showNewJobModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="glass-panel border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl animate-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-theme-primary">
                                    {newJob.id ? "Modifier l'offre" : "Nouvelle Offre"}
                                </h2>
                                <button onClick={() => setShowNewJobModal(false)} className="text-theme-secondary hover:text-white transition-colors">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateJob} className="space-y-4 sm:space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-theme-secondary mb-1.5">Titre du poste</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-theme-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-theme-secondary/50"
                                        placeholder="ex: Développeur Full Stack"
                                        value={newJob.title}
                                        onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                                        maxLength={50}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-theme-secondary mb-1.5">Type de contrat</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-theme-primary appearance-none focus:border-blue-500 outline-none cursor-pointer"
                                                value={newJob.type}
                                                onChange={e => setNewJob({ ...newJob, type: e.target.value })}
                                            >
                                                <option className="bg-slate-900 text-white">Stage</option>
                                                <option className="bg-slate-900 text-white">Stage PFE</option>
                                                <option className="bg-slate-900 text-white">Alternance</option>
                                                <option className="bg-slate-900 text-white">CDI</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-theme-secondary">
                                                <Briefcase size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-theme-secondary mb-1.5">Salaire</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-theme-primary focus:border-blue-500 outline-none placeholder-theme-secondary/50"
                                            placeholder="ex: 8000 DH"
                                            value={newJob.salary}
                                            onChange={e => setNewJob({ ...newJob, salary: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-theme-secondary mb-1.5">Lieu</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-theme-primary focus:border-blue-500 outline-none placeholder-theme-secondary/50"
                                        placeholder="ex: Casablanca, Hybride"
                                        value={newJob.location}
                                        onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-theme-secondary mb-1.5">Description du poste</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-theme-primary h-32 focus:border-blue-500 outline-none placeholder-theme-secondary/50 resize-none leading-relaxed"
                                        placeholder="Décrivez les missions et responsabilités..."
                                        value={newJob.description}
                                        onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewJobModal(false)}
                                        className="px-6 py-2.5 text-theme-secondary hover:text-white font-medium transition-colors"
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
                )
            }
        </div >
    );
}
