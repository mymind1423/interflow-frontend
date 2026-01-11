import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { studentApi } from "../../api/studentApi";
import { useAuth } from "../../authContext";
import { useProfile } from "../../context/ProfileContext";
import {
  Briefcase,
  Calendar,
  Building,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Video,
  Eye,
  CheckCircle2,
  X,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

import SkeletonCard from "../../components/common/SkeletonCard";

import ApplicationQuota from "../../components/common/ApplicationQuota";
import { useApplicationQuota } from "../../hooks/useApplicationQuota";
import JobCard from "../../components/common/JobCard";
import { openStudentGuide } from "../../components/common/StudentGuide";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import JobDrawer from "../../components/modals/JobDrawer";
import Button from "../../components/common/Button";
import Skeleton from "../../components/common/Skeleton";
import QuotaLimitModal from "../../components/modals/QuotaLimitModal";


export default function Dashboard() {
  const { user } = useAuth();
  const { decrementTokens } = useProfile();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ applications: 0, interviews: 0, saved: 0, views: 0, invitations: 0 });
  const [nextInterview, setNextInterview] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [profile, setProfile] = useState(null);

  // Quota System
  const { used, limit, isLocked, loading: quotaLoading } = useApplicationQuota();
  // Drawer State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  // Quota System
  const [showQuotaModal, setShowQuotaModal] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, jobsData, interviewsData, profileData] = await Promise.all([
          studentApi.getStats(),
          studentApi.getRecentJobs(),
          studentApi.getInterviews(),
          studentApi.getProfile()
        ]);

        setStats(statsData);
        setRecentJobs(jobsData.slice(0, 5)); // Show top 5 jobs
        setProfile(profileData);

        // Process Next Interview
        if (interviewsData && interviewsData.length > 0) {
          const upcoming = interviewsData
            .map(i => ({
              ...i,
              dateObj: new Date(i.date || i.dateTime || i.date_time)
            }))
            .filter(i => i.dateObj > new Date())
            .sort((a, b) => a.dateObj - b.dateObj);

          if (upcoming.length > 0) {
            setNextInterview(upcoming[0]);
          }
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApply = async (jobId) => {
    try {
      setApplyingId(jobId);
      await studentApi.apply(jobId);
      decrementTokens(); // Optimistic update
      // Update local state
      setRecentJobs(prev => prev.map(j => j.id === jobId ? { ...j, isApplied: true } : j));
      if (selectedJob?.id === jobId) setSelectedJob(prev => ({ ...prev, isApplied: true }));
      toast.success("Candidature envoyée avec succès ! 🚀");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi de la candidature.");
    } finally {
      setApplyingId(null);
    }
  };

  const handleSave = async (e, jobId) => {
    e.stopPropagation();
    try {
      setSavingId(jobId);
      const job = recentJobs.find(j => j.id === jobId);
      if (job.isSaved) {
        // await studentApi.unsaveJob(jobId); // Assuming API supports toggle or check Api
        // For now assuming toggle logic in store or direct call
        await studentApi.saveJob(jobId);
        toast.success("Retiré des favoris");
      } else {
        await studentApi.saveJob(jobId);
        toast.success("Ajouté aux favoris ❤️");
      }

      setRecentJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSaved: !j.isSaved } : j));
      if (selectedJob?.id === jobId) setSelectedJob(prev => ({ ...prev, isSaved: !prev.isSaved }));
    } catch (e) {
      console.error(e);
      toast.error("Action impossible");
    } finally {
      setSavingId(null);
    }
  };

  // Assuming these are defined elsewhere or need to be added
  const filteredJobs = recentJobs; // Placeholder, replace with actual filtering logic
  const savedJobs = recentJobs.filter(j => j.isSaved).map(j => j.id); // Placeholder
  const toggleSave = async (jobId) => {
    const job = recentJobs.find(j => j.id === jobId);
    if (!job) return;
    await handleSave({ stopPropagation: () => { } }, jobId);
  };
  const viewMode = 'list'; // Placeholder


  if (!user) return null;


  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8 space-y-8">

      {/* 1. Header & Welcome */}
      <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-violet-500 p-6 sm:p-8 md:p-12 shadow-2xl shadow-indigo-500/20">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none mix-blend-overlay animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-400/30 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/20 backdrop-blur-md text-white/90 text-xs sm:text-sm font-medium shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              Prêt pour votre prochaine opportunité ?
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {new Date().getHours() < 18 ? "Bonjour" : "Bonsoir"}, <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
                {profile?.fullname || user.displayName || "Étudiant"}
              </span> 👋
            </h1>

            <p className="text-lg text-indigo-100/90 font-medium max-w-lg leading-relaxed">
              Vous avez <span className="text-white font-bold">{stats.applications} candidatures</span> en cours et <span className="text-white font-bold">{stats.interviews} entretiens</span> prévus. Continuez sur cette lancée !
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              onClick={openStudentGuide}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40 backdrop-blur-md shadow-sm"
              icon={Bookmark}
            >
              Guide
            </Button>
            <Link
              to="/jobs"
              className="px-8 py-3.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold transition-all shadow-xl shadow-indigo-900/10 hover:scale-105 flex items-center justify-center gap-2 group border border-white/50"
            >
              Explorer les offres
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Enhanced KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Candidatures"
          value={stats.applications}
          icon={Briefcase}
          color="text-blue-500"
          bg="bg-blue-500/10"
          loading={loading}
        />
        <KpiCard
          label="Entretiens"
          value={stats.interviews}
          icon={Calendar}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
          loading={loading}
        />
        <KpiCard
          label="Invitations"
          value={stats.invitations}
          icon={CheckCircle2}
          color="text-purple-500"
          bg="bg-purple-500/10"
          loading={loading}
        />
        <KpiCard
          label="Vues Profil"
          value={stats.processedApplications || stats.views || 0}
          icon={Eye}
          color="text-amber-500"
          bg="bg-amber-500/10"
          loading={loading}
        />
        <KpiCard
          label="Favoris"
          value={stats.savedJobs || stats.saved}
          icon={TrendingUp}
          color="text-pink-500"
          bg="bg-pink-500/10"
          loading={loading}
        />
      </div>

      {/* 3. Main Split Layout */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Active Companies / Jobs (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-theme-primary flex items-center gap-2">
              <Building className="text-blue-600 dark:text-blue-400" size={24} />
              Offres Récentes
            </h2>
            <Link to="/jobs" className="text-sm text-theme-secondary hover:text-theme-primary transition-colors">
              Voir tout
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
              recentJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    viewMode={viewMode}
                    isSaved={savedJobs.includes(job.id)}
                    isSaving={savingId === job.id}
                    onToggleSave={() => toggleSave(job.id)}
                    onApply={() => handleApply(job.id)}
                    onClick={() => isLocked ? setShowQuotaModal(true) : setSelectedJob(job)}
                    isLocked={isLocked}
                    isApplying={applyingId === job.id}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-white border border-dashed border-gray-200 rounded-2xl text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <Briefcase size={20} className="text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-bold text-sm mb-1">Aucune offre récente</h3>
                  <Link to="/jobs" className="text-blue-600 font-bold text-xs hover:underline">
                    Explorer les offres
                  </Link>
                </div>
              ))}


          </div>

          {/* Quick Tip or Promo */}


        </div>

        {/* RIGHT COLUMN: Next Interview & Helper (1/3 width) */}
        <div className="space-y-6">



          {/* Quick Tip or Promo */}

          <h2 className="text-xl font-bold text-theme-primary flex items-center gap-2">
            <Video className="text-emerald-500" size={24} />
            Prochain Rendez-vous
          </h2>

          {loading ? (
            <Skeleton className="w-full h-64 rounded-3xl" />
          ) : nextInterview ? (
            <div className="glass-panel rounded-[2rem] p-6 relative overflow-hidden group hover:border-blue-300 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Prochain Live
                  </div>
                  <div className="text-gray-500 text-xs font-mono font-bold">
                    {formatDistanceToNow(new Date(nextInterview.dateObj), { addSuffix: true, locale: fr })}
                  </div>
                </div>

                <div className="mb-6 flex items-start gap-4">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center p-1.5 shadow-sm border border-slate-100 dark:border-white/5 shrink-0">
                    {(nextInterview.companyLogo || nextInterview.logo) ? (
                      <img src={nextInterview.companyLogo || nextInterview.logo} alt={nextInterview.companyName} className="w-full h-full object-contain" />
                    ) : (
                      <Building className="text-slate-400 dark:text-slate-500" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-xl font-black text-theme-primary mb-1 leading-tight line-clamp-2">
                      {nextInterview.jobTitle || nextInterview.title || "Entretien"}
                    </h3>
                    <p className="text-theme-secondary font-medium flex items-center gap-2 text-sm truncate">
                      {nextInterview.companyName || nextInterview.company}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-8 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3 text-theme-primary font-medium">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-blue-600">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">Date</p>
                      <p className="font-bold">{new Date(nextInterview.dateObj).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-theme-primary font-medium">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-blue-600">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">Heure</p>
                      <p className="font-bold">{new Date(nextInterview.dateObj).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>

                <Button
                  to="/interviews"
                  className="w-full shadow-lg shadow-blue-600/20"
                  variant="primary"
                  icon={Video}
                >
                  Rejoindre la salle d'attente
                </Button>
              </div>
            </div>
          ) : (
            <div className="glass-panel border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-gray-400">
                <Calendar size={24} />
              </div>
              <p className="text-gray-500 font-medium text-sm">Aucun entretien programmé.</p>
              <Link to="/jobs" className="text-blue-600 font-bold text-sm mt-2 hover:underline">Postuler maintenant</Link>
            </div>
          )}

          {/* Quick Tip or Promo */}
          <div className="group glass-panel border-indigo-100 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all shadow-sm hover:shadow-md rounded-3xl p-6 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/10 dark:to-blue-900/10 flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10 max-w-[65%]">
              <h3 className="text-xl font-bold text-theme-primary mb-2">Besoin d'un coup de pouce ?</h3>
              <p className="text-theme-secondary text-sm mb-4 leading-relaxed font-medium">
                Retrouvez tous nos conseils pour réussir vos entretiens dans le guide.
              </p>
              <button onClick={openStudentGuide} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
                Ouvrir le guide <ArrowRight size={16} />
              </button>
            </div>
            {/* 3D Illustration Replacement Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-center shrink-0 rotate-3 group-hover:rotate-6 transition-transform">
              <BookOpen size={40} className="text-white drop-shadow-md" />
            </div>
          </div>

          {/* Quick Tip or Promo */}


        </div>

      </div >
      <JobDrawer
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={handleApply}
        onSave={handleSave}
        isApplying={applyingId === selectedJob?.id}
        tokensRemaining={limit - used} // Dynamic calculation
      />

      <QuotaLimitModal isOpen={showQuotaModal} onClose={() => setShowQuotaModal(false)} />
    </div >

  );
}

// Minimal Component Sub-components for Cleanliness
function KpiCard({ label, value, icon: Icon, color, bg, loading }) {
  if (loading) return <Skeleton className="h-32 rounded-3xl" />;

  return (
    <div className="glass-panel hover:-translate-y-1 p-5 rounded-2xl flex flex-col justify-between transition-all group h-32 relative overflow-hidden">
      {/* Glow effect on hover */}
      <div className={`absolute top-0 right-0 p-8 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none translate-x-1/3 -translate-y-1/3 ${bg.replace('/10', '/30')}`} />

      <div className="flex justify-between items-start z-10">
        <div className={`p-2.5 rounded-xl ${bg} ${color} ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="z-10">
        <p className="text-3xl font-black text-theme-primary tracking-tight group-hover:scale-105 transition-transform origin-left">{value}</p>
        <p className="text-theme-secondary font-bold text-xs uppercase tracking-wide mt-1">{label}</p>
      </div>
    </div>
  );
}
