import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { studentApi } from "../../api/studentApi";
import { useAuth } from "../../authContext";
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
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

import Skeleton from "../../components/common/Skeleton";
import { fixEncoding } from "../../utils/stringUtils";
import { openStudentGuide } from "../../components/common/StudentGuide";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import JobDrawer from "../../components/modals/JobDrawer"; // Add this import


export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ applications: 0, interviews: 0, saved: 0, views: 0, invitations: 0 });
  const [nextInterview, setNextInterview] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [profile, setProfile] = useState(null);

  // Drawer State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [savingId, setSavingId] = useState(null);



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
      // Update local state
      setRecentJobs(prev => prev.map(j => j.id === jobId ? { ...j, isApplied: true } : j));
      if (selectedJob?.id === jobId) setSelectedJob(prev => ({ ...prev, isApplied: true }));
    } catch (error) {
      console.error(error);
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


  if (!user) return null;


  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

      {/* 1. Header & Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Bonjour, <span className="text-blue-400">{profile?.fullname || user.displayName || "Étudiant"}</span> 👋
          </h1>
          <p className="text-slate-400 text-lg">Voici ce qu'il se passe pour vous aujourd'hui.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openStudentGuide}
            className="px-5 py-2.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl font-bold transition-colors border border-white/5"
          >
            Guide
          </button>
          <Link
            to="/jobs"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25"
          >
            Explorer les offres <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* 2. Enhanced KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Candidatures"
          value={stats.applications}
          icon={Briefcase}
          color="text-blue-400"
          bg="bg-blue-400/10"
          loading={loading}
        />
        <KpiCard
          label="Entretiens"
          value={stats.interviews}
          icon={Calendar}
          color="text-emerald-400"
          bg="bg-emerald-400/10"
          loading={loading}
        />
        <KpiCard
          label="Invitations"
          value={stats.invitations}
          icon={CheckCircle2}
          color="text-purple-400"
          bg="bg-purple-400/10"
          loading={loading}
        />
        <KpiCard
          label="Vues Profil"
          value={stats.processedApplications || stats.views || 0}
          icon={Eye}
          color="text-amber-400"
          bg="bg-amber-400/10"
          loading={loading}
        />
        <KpiCard
          label="Favoris"
          value={stats.savedJobs || stats.saved}
          icon={TrendingUp}
          color="text-pink-400"
          bg="bg-pink-400/10"
          loading={loading}
        />
      </div>

      {/* 3. Main Split Layout */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Active Companies / Jobs (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building className="text-blue-400" size={24} />
              Offres Récentes
            </h2>
            <Link to="/jobs" className="text-sm text-slate-400 hover:text-white transition-colors">
              Voir tout
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />) : (
              recentJobs.length > 0 ? recentJobs.map(job => (

                <div key={job.id} className="group bg-slate-900/40 backdrop-blur-sm border border-white/5 p-4 rounded-2xl hover:border-blue-500/30 hover:bg-slate-800/60 transition-all flex items-center gap-4 cursor-pointer" onClick={() => setSelectedJob(job)}>

                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm shrink-0">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain" />
                    ) : (
                      <Building size={24} className="text-slate-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-bold truncate group-hover:text-blue-400 transition-colors text-lg">{fixEncoding(job.title)}</h4>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-0.5 mb-2">
                      <span className="truncate font-medium">{fixEncoding(job.companyName)}</span>
                      <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                      <span className="truncate">{fixEncoding(job.location)}</span>
                      <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                      <span className="text-xs">
                        {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr }) : "Récemment"}
                      </span>
                    </div>

                    {(job.interviewQuota && job.applicationCount !== undefined) && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-amber-500 leading-none">
                          {Math.max(0, job.interviewQuota - job.applicationCount)}
                        </span>
                        <span className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mt-1">
                          Places Restantes
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-3">
                    {job.isApplied ? (
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase border ${job.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        job.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          job.wasInvited ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                        {job.status === 'ACCEPTED' ? "Accepté" :
                          job.status === 'REJECTED' ? "Rejeté" :
                            job.wasInvited ? "Invité" : "Candidaté"}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg uppercase border border-white/5 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all">
                        {fixEncoding(job.type)}
                      </span>
                    )}

                    <button
                      onClick={(e) => handleSave(e, job.id)}
                      disabled={savingId === job.id}
                      className={`p-2 rounded-xl transition-all ${job.isSaved
                        ? "bg-pink-500/10 text-pink-500 border border-pink-500/20"
                        : "bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700 border border-transparent hover:border-slate-600"
                        }`}
                    >
                      {savingId === job.id ? <Loader2 size={18} className="animate-spin" /> : job.isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>

                  <ArrowRight className="text-slate-600 group-hover:text-blue-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all ml-2" />
                </div>
              )) : (
                <div className="text-slate-500 text-center py-12 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                  Aucune offre disponible pour le moment.
                </div>
              )
            )}


          </div>

          {/* Quick Tip or Promo */}
          <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/10 border border-indigo-500/20 rounded-3xl p-6">
            <h3 className="text-white font-bold mb-2">Besoin d'un coup de pouce ?</h3>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Retrouvez tous nos conseils pour réussir vos entretiens dans le guide.
            </p>
            <button onClick={openStudentGuide} className="text-indigo-400 font-bold text-sm hover:text-indigo-300 flex items-center gap-1 transition-colors">
              Ouvrir le guide <ArrowRight size={14} />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Next Interview & Helper (1/3 width) */}
        <div className="space-y-6">

          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Video className="text-emerald-400" size={24} />
            Prochain Rendez-vous
          </h2>

          {loading ? (
            <Skeleton className="w-full h-64 rounded-3xl" />
          ) : nextInterview ? (
            <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Calendar size={100} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl">
                    <Calendar size={20} />
                  </div>
                  <span className="text-emerald-400 font-bold text-sm uppercase tracking-wider">Bientôt</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 leading-snug">
                  {nextInterview.jobTitle || nextInterview.title || "Entretien"}
                </h3>
                <p className="text-slate-400 font-medium mb-6">
                  {nextInterview.companyName || nextInterview.company}
                </p>

                <div className="space-y-3 mb-6 bg-slate-950/30 p-4 rounded-xl border border-black/20">
                  <div className="flex items-center gap-3 text-slate-300 font-medium">
                    <Clock size={16} className="text-emerald-500" />
                    {new Date(nextInterview.dateObj).toLocaleDateString()} à {new Date(nextInterview.dateObj).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {nextInterview.room && (
                    <div className="flex items-center gap-3 text-slate-300 font-medium">
                      <MapPin size={16} className="text-emerald-500" />
                      Salle {nextInterview.room}
                    </div>
                  )}
                </div>

                <Link to="/interviews" className="block w-full text-center py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20">
                  Voir les détails
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-700 rounded-3xl p-8 text-center flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-500">
                <Calendar size={24} />
              </div>
              <p className="text-slate-400 font-medium text-sm">Aucun entretien programmé.</p>
              <Link to="/jobs" className="text-blue-400 font-bold text-sm mt-2 hover:underline">Postuler maintenant</Link>
            </div>
          )}

          {/* Quick Tip or Promo */}


        </div>

      </div>
      <JobDrawer
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={handleApply}
        onSave={handleSave}
        isApplying={applyingId === selectedJob?.id}
        tokensRemaining={profile?.tokensRemaining}
      />
    </div>

  );
}

// Minimal Component Sub-components for Cleanliness
function KpiCard({ label, value, icon: Icon, color, bg, loading }) {
  if (loading) return <Skeleton className="h-28 rounded-2xl" />;

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 p-4 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors group h-28">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg ${bg} ${color}`}>
          <Icon size={20} />
        </div>
        {/* <span className="text-xs text-slate-500 font-mono">+2 this week</span> */}
      </div>
      <div>
        <p className="text-3xl font-extrabold text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
        <p className="text-slate-400 font-medium text-xs uppercase tracking-wide mt-1">{label}</p>
      </div>
    </div>
  );
}
