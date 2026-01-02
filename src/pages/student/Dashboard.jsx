import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../authContext";
import { apiFetch } from "../../api/client";
import { studentApi } from "../../api/studentApi";
import { Briefcase, Video, Calendar, Search, Building, TrendingUp, Bookmark, ChevronRight, QrCode, Trash2, Info, Clock, CheckCircle2, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { StatCard, SectionHeader, OfferCard, InterviewWidget, AIPitchWidget, TokenInfoWidget } from "../../components/dashboard/StudentWidgets";
import JobDrawer from "../../components/modals/JobDrawer";
import AIPitchModal from "../../components/modals/AIPitchModal";
import { fixEncoding } from "../../utils/stringUtils";
import Skeleton from "../../components/common/Skeleton";
import ConfirmationModal from "../../components/common/ConfirmationModal";


import { invitationApi } from "../../api/invitationApi"; // Import

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ applications: 0, interviews: 0, saved: 0, views: 0, completion: 0, invitations: 0 });
  const [profile, setProfile] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [invitations, setInvitations] = useState([]); // State
  const [nextInterview, setNextInterview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isPitchOpen, setIsPitchOpen] = useState(false);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [respondingId, setRespondingId] = useState(null); // State for invitations

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, profileData, jobsData, appsData, interviewsData, invsData] = await Promise.all([
          studentApi.getStats(),
          apiFetch("/api/profile/get"),
          studentApi.getRecentJobs(),
          studentApi.getApplications(),
          studentApi.getInterviews(),
          invitationApi.getInvitations() // Fetch invitations
        ]);

        // Calculate completion
        let completion = 0;
        if (profileData) {
          const fields = ['photoUrl', 'fullname', 'email', 'phone', 'address', 'domaine', 'grade', 'cvUrl', 'diplomaUrl'];
          const filled = fields.filter(f => profileData[f]).length;
          completion = Math.round((filled / fields.length) * 100);
        }

        setStats({
          applications: statsData.applications,
          interviews: statsData.interviews,
          saved: statsData.savedJobs,
          processedApplications: statsData.processedApplications,
          invitations: statsData.invitations,
          completion
        });
        setProfile(profileData);
        setRecentJobs(jobsData);
        setApplications(appsData);
        setInvitations(invsData || []); // Set invitations

        // Find next interview
        if (interviewsData && interviewsData.length > 0) {
          const parseDate = (val) => {
            if (!val) return new Date(0);
            const d = new Date(val);
            return isNaN(d.getTime()) ? new Date() : d;
          };

          // Sort by date closest to now
          const sorted = interviewsData
            .map(i => ({ ...i, dateObj: parseDate(i.date || i.dateTime || i.date_time) }))
            .filter(i => i.dateObj > new Date())
            .sort((a, b) => a.dateObj - b.dateObj);

          if (sorted.length > 0) {
            const next = sorted[0];
            const safeTime = (d) => {
              if (!d || isNaN(d.getTime())) return "Heure inconnue";
              return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            };

            setNextInterview({
              company: next.companyName || next.company || "Entreprise",
              role: next.jobTitle || next.title || "Entretien",
              date: next.dateObj.toLocaleDateString(),
              time: safeTime(next.dateObj),
              link: next.meetLink,
              logo: next.companyLogo || next.logoUrl,
              room: next.room // Mapped room
            });
          }
        }

      } catch (err) {
        console.log(err);
        // Silent error for polling to avoid spamming toast
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Initial fetch

    // Poll for live updates (Token reimbursement, new interviews etc)
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAcceptInv = async (id) => {
    setRespondingId(id);
    try {
      const res = await invitationApi.accept(id);
      if (res.success) {
        toast.success("Invitation acceptée ! Entretien planifié.");
        // Refresh
        const [invsData, statsData] = await Promise.all([invitationApi.getInvitations(), studentApi.getStats()]);
        setInvitations(invsData);
        setStats(prev => ({ ...prev, invitations: statsData.invitations, interviews: statsData.interviews }));
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
        const [invsData, statsData] = await Promise.all([invitationApi.getInvitations(), studentApi.getStats()]);
        setInvitations(invsData);
        setStats(prev => ({ ...prev, invitations: statsData.invitations }));
        setConfirmModal({ isOpen: false });
      }
    } catch (error) {
      toast.error("Erreur lors du refus");
    } finally {
      setRespondingId(null);
    }
  };


  const handleApply = async (jobId) => {
    try {
      setApplyingId(jobId);
      const res = await studentApi.apply(jobId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Candidature envoyée avec succès !");
        setRecentJobs(prev => prev.map(j => j.id === jobId ? { ...j, isApplied: true } : j));
        setStats(prev => ({ ...prev, applications: (prev.applications || 0) + 1 }));
        setProfile(prev => ({ ...prev, tokensRemaining: Math.max(0, (prev?.tokensRemaining || 0) - 1) }));
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la candidature.");
    } finally {
      setApplyingId(null);
    }
  };

  const handleSave = async (jobId) => {
    try {
      setSavingId(jobId);
      const res = await studentApi.saveJob(jobId);
      if (res.saved) {
        toast.success("Offre sauvegardée !");
        setRecentJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSaved: true } : j));
        setStats(prev => ({ ...prev, saved: (prev.saved || 0) + 1 }));
      } else {
        toast.success("Offre retirée des favoris.");
        setRecentJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSaved: false } : j));
        setStats(prev => ({ ...prev, saved: Math.max(0, (prev.saved || 0) - 1) }));
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSavingId(null);
    }
  };

  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const confirmDeleteApplication = (appId) => {
    setConfirmModal({
      isOpen: true,
      title: "Retirer votre candidature ?",
      message: "Si vous retirez votre candidature, votre jeton vous sera restitué immédiatement.",
      confirmText: "Retirer la candidature",
      isDangerous: true,
      onConfirm: () => handleDeleteApplication(appId)
    });
  };

  const handleDeleteApplication = async (appId) => {
    try {
      setDeletingId(appId);
      const res = await studentApi.deleteApplication(appId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Candidature retirée. Jeton restitué ! 🪙");
        setApplications(prev => prev.filter(a => a.id !== appId));
        setStats(prev => ({ ...prev, applications: Math.max(0, prev.applications - 1) }));
        setProfile(prev => ({ ...prev, tokensRemaining: (prev?.tokensRemaining || 0) + 1 }));
        setConfirmModal({ isOpen: false });
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setActiveTab("jobs");
    }
  };

  if (!user) return null;

  const displayName = profile?.fullname || profile?.name || profile?.displayName || user.displayName || "Étudiant";



  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 mt-6 pb-20 relative">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            Dashboard Étudiant
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
            Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{loading ? <Skeleton className="w-40 h-10 inline-block ml-2 rounded-lg" /> : displayName}</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">Votre carrière commence aujourd'hui.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Link to="/my-badge" className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2 backdrop-blur-md whitespace-nowrap min-w-fit">
            <QrCode size={18} /> Badge
          </Link>
          <Link to="/live" className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20 hover:shadow-rose-600/40 whitespace-nowrap min-w-fit flex items-center gap-2">
            <Video size={18} /> Live
          </Link>
          <Link to="/profile" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 whitespace-nowrap min-w-fit">
            Mon Profil
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-900/40 backdrop-blur-sm p-5 rounded-2xl border border-white/5 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="w-16 h-4 mb-2" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard label="Candidatures" value={stats.applications || 0} color="text-blue-400" bg="bg-blue-400/10" icon={Briefcase} delay={0.1} />
            <StatCard label="Invitations" value={stats.invitations || 0} color="text-purple-400" bg="bg-purple-400/10" icon={Video} delay={0.15} />
            <StatCard label="Entretiens" value={stats.interviews || 0} color="text-emerald-400" bg="bg-emerald-400/10" icon={Calendar} delay={0.2} />
            <StatCard label="Sauvegardées" value={stats.saved || 0} color="text-pink-400" bg="bg-pink-400/10" icon={Bookmark} delay={0.3} />
            <StatCard label="Vue Profil" value={stats.processedApplications || 0} color="text-amber-400" bg="bg-amber-400/10" icon={TrendingUp} delay={0.4} />
          </>
        )}
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col sm:flex-row items-center shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/50 transition-all gap-2 sm:gap-0"
      >
        <div className="flex items-center w-full px-2">
          <Search className="ml-2 sm:ml-5 text-slate-500" size={22} />
          <input
            type="text"
            placeholder="Rechercher un stage..."
            className="bg-transparent border-none outline-none text-white px-3 sm:px-5 py-3 w-full placeholder:text-slate-500 text-base sm:text-lg font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 sm:px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
        >
          Rechercher
        </button>
      </motion.div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">

        {/* Left Column: Recent Applications & Offers */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">

          {/* Modern Tabs */}
          <div className="w-full overflow-x-auto no-scrollbar pb-2">
            <div className="bg-slate-900/50 p-1.5 rounded-2xl inline-flex border border-white/5 min-w-fit">
              {['overview', 'jobs', 'applications', 'invitations'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab
                    ? 'bg-slate-700 text-white shadow-lg shadow-black/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {tab === 'overview' ? 'Aperçu' : tab === 'jobs' ? 'Offres' : tab === 'applications' ? 'Candidatures' : 'Invitations'}
                </button>
              ))}
            </div>
          </div>

          {(activeTab === "overview" || activeTab === "jobs") && (
            <motion.div layout>
              <SectionHeader title="Dernières Offres" link="/companies" />
              <div className="space-y-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 w-2/3">
                          <Skeleton className="w-1/2 h-6 rounded-lg" />
                          <Skeleton className="w-1/3 h-4 rounded-lg" />
                        </div>
                        <Skeleton className="w-12 h-12 rounded-xl" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="w-20 h-6 rounded-lg" />
                        <Skeleton className="w-20 h-6 rounded-lg" />
                      </div>
                      <Skeleton className="w-full h-16 rounded-xl" />
                    </div>
                  ))
                ) : recentJobs.filter(job =>
                  job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (job.companyName && job.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
                ).length > 0 ? (
                  recentJobs.filter(job =>
                    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (job.companyName && job.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).map((job) => (
                    <OfferCard
                      key={job.id}
                      role={fixEncoding(job.title)}
                      company={fixEncoding(job.companyName)}
                      location={fixEncoding(job.location)}
                      type={fixEncoding(job.type)}
                      time={new Date(job.createdAt).toLocaleDateString()}
                      logo={job.companyLogo || job.logoUrl || job.logo_url}
                      acceptedCount={job.acceptedCount}
                      applicationCount={job.applicationCount} // New prop
                      interviewQuota={job.interviewQuota}
                      description={fixEncoding(job.description)}

                      isSaved={job.isSaved}
                      isApplied={job.isApplied}
                      isInvited={job.isInvited}
                      wasInvited={job.wasInvited} // New prop for history
                      applicationStatus={job.applicationStatus}
                      onApply={() => handleApply(job.id)}
                      applyLoading={applyingId === job.id}
                      onSave={() => handleSave(job.id)}
                      saveLoading={savingId === job.id}
                      onClick={() => setSelectedJob(job)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-3xl">
                    <p className="text-slate-500 font-medium">Aucune offre ne correspond à votre recherche.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {(activeTab === "overview" || activeTab === "applications") && (
            <motion.div layout className="mt-8">
              <SectionHeader title="Mes Candidatures" link="/applications" />
              <div className="space-y-4">
                {loading ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                      <Skeleton className="w-14 h-14 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="w-1/3 h-5 rounded-lg" />
                        <Skeleton className="w-1/4 h-3 rounded-lg" />
                      </div>
                      <Skeleton className="w-20 h-8 rounded-full" />
                    </div>
                  ))
                ) : (
                  applications.slice(0, activeTab === "overview" ? 3 : undefined).map(app => (
                    <div key={app.id} className="group bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer gap-4 sm:gap-0">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden border border-white/10 shadow-lg shrink-0">
                          {app.companyLogo ? (
                            <img src={app.companyLogo} alt={app.companyName} className="w-full h-full object-cover" />
                          ) : (
                            <Building size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">{app.jobTitle}</p>
                          <p className="text-sm text-slate-400 font-medium truncate">{app.companyName}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded border border-white/10 whitespace-nowrap">
                              📅 {new Date(app.dateApplied || app.createdAt).toLocaleDateString()}
                            </span>
                            {app.status === 'INVITED' ? (
                              <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/10 whitespace-nowrap">
                                ✨ 0 Jeton
                              </span>
                            ) : (
                              <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10 whitespace-nowrap">
                                🪙 1 Jeton
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <span className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border whitespace-nowrap ${app.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          app.status === 'INVITED' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                          {app.status === 'PENDING' ? 'Postulé' :
                            app.status === 'ACCEPTED' ? 'Accepté' :
                              app.status === 'INVITED' ? 'Invité' : app.status}
                        </span>
                        {app.status === 'PENDING' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); confirmDeleteApplication(app.id); }}
                            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                            title="Supprimer la candidature"
                            disabled={deletingId === app.id}
                          >
                            {deletingId === app.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {applications.length === 0 && !loading && <p className="text-slate-500 text-center py-8">Vous n'avez pas encore candidaté.</p>}
              </div>
            </motion.div>
          )}

          {(activeTab === "overview" || activeTab === "invitations") && (
            <motion.div layout className="mt-8">
              <SectionHeader title="Mes Invitations" link="/applications" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {loading ? (
                  Array(2).fill(0).map((_, i) => <Skeleton key={i} className="w-full h-48 rounded-3xl" />)
                ) : (
                  invitations.length > 0 ? (
                    invitations.map(inv => (
                      <div key={inv.id} className="group relative bg-slate-900/40 backdrop-blur-md border border-purple-500/20 rounded-2xl p-4 hover:border-purple-500/40 transition-all shadow-lg hover:shadow-purple-900/10 hover:-translate-y-1 overflow-hidden">
                        {/* Gradient Bg */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 shadow-lg shrink-0">
                              {inv.companyLogo ? (
                                <img src={inv.companyLogo} alt={inv.companyName} className="w-full h-full object-cover" />
                              ) : (
                                <Building className="text-slate-500" size={20} />
                              )}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
                              Invitation
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white mb-0.5 line-clamp-1">{inv.jobTitle}</h3>
                          <p className="text-slate-400 text-xs font-medium mb-3 flex items-center gap-1">
                            {inv.companyName}
                          </p>

                          <div className="mt-auto flex gap-2">
                            {inv.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => handleAcceptInv(inv.id)}
                                  disabled={respondingId === inv.id}
                                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {respondingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> Accepter</>}
                                </button>
                                <button
                                  onClick={() => confirmRejectInv(inv.id)}
                                  disabled={respondingId === inv.id}
                                  className="px-2.5 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/30 rounded-lg font-bold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Refuser"
                                >
                                  {respondingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                              </>
                            ) : (
                              <div className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border ${inv.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-white/5 opacity-70'
                                }`}>
                                {inv.status === 'ACCEPTED' ? <CheckCircle2 size={14} /> : <X size={14} />}
                                {inv.status === 'ACCEPTED' ? "Invitation Acceptée" : "Invitation Refusée"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                      <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                        <Sparkles size={24} />
                      </div>
                      <p className="text-slate-500 font-medium">Aucune invitation en attente pour le moment.</p>
                      <p className="text-slate-600 text-sm mt-1">Complétez votre profil pour être visible !</p>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}

          {/* Token Info Widget (Moved to bottom of Left Column) */}
          <TokenInfoWidget tokens={profile?.tokensRemaining} loading={loading} />

          {/* Processus / How it works */}
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 sm:p-6 overflow-hidden hover:border-blue-500/20 transition-all duration-500 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />

            <h3 className="relative z-10 font-bold text-white mb-6 flex items-center gap-3 text-lg">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <Info size={18} strokeWidth={2.5} />
              </div>
              Comment ça marche ?
            </h3>

            <div className="relative z-10 space-y-0">
              {/* Step 1 */}
              <div className="flex gap-4 relative">
                {/* Connector Line */}
                <div className="absolute left-[15px] top-8 bottom-[-16px] w-0.5 bg-slate-800/50 rounded-full" />

                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 text-blue-400 flex items-center justify-center text-xs font-bold shadow-lg shadow-black/20">1</div>
                </div>
                <div className="pb-6 pt-1">
                  <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                    Candidature
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/10">1 Jeton</span>
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Envoyez votre dossier en un clic. Votre jeton est <span className="text-slate-300">engagé</span> temporairement.
                    <br /><span className="text-amber-500/80 font-medium">Limite : 5 candidatures simultanées.</span>
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 relative">
                {/* Connector Line */}
                <div className="absolute left-[15px] top-8 bottom-[-16px] w-0.5 bg-slate-800/50 rounded-full" />

                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold shadow-lg">2</div>
                </div>
                <div className="pb-6 pt-1">
                  <h4 className="text-gray-200 font-bold text-sm mb-1 flex items-center gap-2">
                    Traitement
                    <Clock size={12} className="text-slate-500" />
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    L'entreprise consulte votre profil. Cela peut prendre quelques heures.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 relative">
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-bold shadow-lg shadow-emerald-500/10">3</div>
                </div>
                <div className="pt-1 w-full">
                  <h4 className="text-white font-bold text-sm mb-3">Résultat final</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 relative z-10" />
                      <span className="text-xs text-slate-300 relative z-10 flex-1">
                        <strong className="text-emerald-300 block mb-0.5">Accepté</strong>
                        Entretien présentiel programmé.
                      </span>
                    </div>
                    <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 relative overflow-hidden">
                      <RotateCcw size={16} className="text-amber-400 shrink-0 relative z-10" />
                      <span className="text-xs text-slate-300 relative z-10 flex-1">
                        <strong className="text-amber-300 block mb-0.5">Refusé</strong>
                        Jeton remboursé automatiquement !
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="relative py-4 flex items-center gap-4">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">OU ALORS</span>
                <div className="h-px bg-slate-800 flex-1"></div>
              </div>

              {/* Scenario 2: Invitation */}
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/5 rounded-2xl p-5 border border-purple-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <h4 className="text-purple-300 font-bold text-sm mb-3 flex items-center gap-2 relative z-10">
                  <Sparkles size={16} /> Invitation Directe
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20">0 Jeton !</span>
                </h4>

                <div className="text-xs text-slate-300 space-y-2 relative z-10 leading-relaxed">
                  <p>Si votre profil est complet (CV, Diplôme), les entreprises peuvent vous repérer dans le <strong>Vivier de Talents</strong>.</p>
                  <div className="flex items-start gap-2 bg-slate-900/40 p-2 rounded-lg border border-purple-500/10">
                    <CheckCircle2 size={14} className="text-purple-400 mt-0.5 shrink-0" />
                    <span>Vous recevez une notification et un créneau d'entretien est <strong className="text-purple-300">automatiquement réservé</strong>.</span>
                  </div>
                  <p className="text-slate-400 italic">Astuce : Soignez votre profil pour multiplier les invitations !</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Profile Status & News */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6 lg:sticky lg:top-24 mt-8 lg:mt-0"
        >
          {/* 1. Interview Widget */}
          <InterviewWidget nextInterview={nextInterview} loading={loading} />

          {/* 2. Profile Completion (Moved up) */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <Skeleton className="w-40 h-40 rounded-full" />
                <Skeleton className="w-1/2 h-8 rounded-lg" />
                <Skeleton className="w-full h-16 rounded-xl" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
            ) : (
              <>
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  {/* Background Circle */}
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                    <circle
                      cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                      strokeDasharray={440} strokeDashoffset={440 - (440 * stats.completion) / 100}
                      className={`text-blue-500 transition-all duration-1000 ease-out`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-white">{stats.completion}%</span>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Complet</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Votre Profil</h3>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed px-4">
                  {stats.completion === 100
                    ? "Votre profil est parfaitement optimisé ! 🚀"
                    : "Complétez votre profil pour débloquer plus d'opportunités."}
                </p>
                <Link to="/profile" className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 hover:border-slate-600 shadow-lg">
                  {stats.completion === 100 ? "Modifier" : "Compléter maintenant"}
                </Link>
              </>
            )}
          </div>

          {/* 3. AI Pitch Widget (Moved down) */}
          <AIPitchWidget onGenerate={() => setIsPitchOpen(true)} />

        </motion.div>
      </div >

      <JobDrawer
        job={selectedJob}
        isOpen={!!selectedJob}
        tokensRemaining={profile?.tokensRemaining}
        onClose={() => setSelectedJob(null)}
        onApply={(id) => {
          handleApply(id);
          setSelectedJob(null);
        }}
        onSave={(id) => {
          handleSave(id);
          setSelectedJob(prev => ({ ...prev, isSaved: !prev.isSaved }));
        }}
        isApplying={applyingId === selectedJob?.id}
        isSaving={savingId === selectedJob?.id}
      />


      <AIPitchModal
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDangerous={confirmModal.isDangerous}
        onConfirm={confirmModal.onConfirm}
        isLoading={!!deletingId}
      />
    </div >
  );
}
export default Dashboard;
