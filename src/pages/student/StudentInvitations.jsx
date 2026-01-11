import { useState, useEffect } from "react";
import { invitationApi } from "../../api/invitationApi";
import { studentApi } from "../../api/studentApi";
import { CheckCircle, XCircle, Briefcase, Calendar, Clock, Building, Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";
import JobDrawer from "../../components/modals/JobDrawer";

export default function StudentInvitations() {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [respondingId, setRespondingId] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isFetchingJob, setIsFetchingJob] = useState(false);

    useEffect(() => {
        loadInvitations();
    }, []);

    const loadInvitations = async () => {
        try {
            const data = await invitationApi.getInvitations();
            setInvitations(data);
        } catch (error) {
            console.error(error);
            toast.error("Erreur de chargement des invitations");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        setRespondingId(id);
        try {
            const res = await invitationApi.accept(id);
            if (res.success) {
                toast.success("Invitation acceptée ! Entretien planifié.");
                loadInvitations(); // Reload to update status
            } else {
                toast.error("Erreur lors de l'acceptation");
            }
        } catch (error) {
            toast.error("Impossible d'accepter l'invitation");
        } finally {
            setRespondingId(null);
        }
    };

    const handleReject = async (id) => {
        if (!confirm("Voulez-vous vraiment refuser cette opportunité ?")) return;
        setRespondingId(id);
        try {
            const res = await invitationApi.reject(id);
            if (res.success) {
                toast.success("Invitation refusée");
                loadInvitations(); // Reload to update status
            }
        } catch (error) {
            toast.error("Erreur lors du refus");
        } finally {
            setRespondingId(null);
        }
    };

    const handleJobClick = async (jobId) => {
        if (!jobId) return;
        setIsFetchingJob(true);
        try {
            const job = await studentApi.getJobById(jobId);
            setSelectedJob(job);
        } catch (error) {
            toast.error("Impossible de charger les détails de l'offre");
        } finally {
            setIsFetchingJob(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 size={48} className="text-blue-500 animate-spin" />
        </div>
    );

    const pending = invitations.filter(i => i.status === 'PENDING');
    const history = invitations.filter(i => i.status !== 'PENDING');

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
            {/* PENDING INVITATIONS */}
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-3">
                    <Briefcase className="text-blue-600 dark:text-blue-400" />
                    Invitations reçues
                </h1>
                <p className="text-theme-secondary">Les entreprises qui souhaitent vous rencontrer.</p>

                {pending.length === 0 ? (
                    <div className="text-center py-12 glass-panel rounded-2xl border-dashed border-slate-200 dark:border-white/10 shadow-sm">
                        <p className="text-theme-secondary">Aucune invitation en attente pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pending.map((inv) => (
                            <div key={inv.id}
                                onClick={() => handleJobClick(inv.jobId)}
                                className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-sm hover:shadow-lg cursor-pointer"
                            >
                                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-white/10">
                                    {inv.companyLogo ? (
                                        <img src={inv.companyLogo} alt={inv.companyName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building className="text-slate-400 dark:text-slate-500" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                            <p className="text-sm text-theme-primary leading-relaxed">
                                                <span className="inline-block mr-2">✨</span>
                                                L'entreprise <strong className="text-blue-600 dark:text-blue-400">{inv.companyName}</strong> est intéressée par votre profil et vous invite à un entretien pour le poste <strong className="text-theme-primary">{inv.jobTitle}</strong>.
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 text-red-600 animate-pulse shrink-0" title="Invitation Prioritaire">
                                            <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-full border border-red-100 dark:border-red-500/20 shadow-sm shadow-red-200 dark:shadow-none">
                                                <Mail className="fill-red-100 dark:fill-red-900/20 text-red-600" size={20} />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Urgent</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-theme-secondary">
                                        <span className="flex items-center gap-1"><Clock size={14} /> Reçu le {new Date(inv.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleAccept(inv.id); }}
                                        disabled={respondingId === inv.id}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {respondingId === inv.id ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Accepter</>}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleReject(inv.id); }}
                                        disabled={respondingId === inv.id}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {respondingId === inv.id ? <Loader2 size={18} className="animate-spin" /> : <><XCircle size={18} /> Refuser</>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* HISTORY */}
            {history.length > 0 && (
                <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-white/10">
                    <h2 className="text-2xl font-bold text-theme-primary flex items-center gap-3">
                        <Clock className="text-slate-400 dark:text-slate-500" />
                        Historique
                    </h2>

                    <div className="grid gap-3 opacity-90 hover:opacity-100 transition-opacity">
                        {history.map((inv) => (
                            <div key={inv.id} className="glass-panel p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-white/10">
                                    {inv.companyLogo ? (
                                        <img src={inv.companyLogo} alt={inv.companyName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building className="text-slate-400 dark:text-slate-500" size={20} />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-theme-primary font-bold truncate">{inv.jobTitle}</h4>
                                    <p className="text-theme-secondary text-sm truncate">{inv.companyName} • {new Date(inv.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${inv.status === 'ACCEPTED'
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                                    : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20'
                                    }`}>
                                    {inv.status === 'ACCEPTED' ? 'Accepté' : 'Refusé'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <JobDrawer
                job={selectedJob}
                isOpen={!!selectedJob}
                onClose={() => setSelectedJob(null)}
                onApply={() => { }} // Cannot apply from here, just view
                onSave={() => { }} // Keep simple for now
                isApplying={false}
                isSaving={false}
                isLocked={false}
                saturatedLimit={50}
            />

            {isFetchingJob && (
                <div className="fixed inset-0 z-[110] bg-slate-950/20 backdrop-blur-[2px] flex items-center justify-center">
                    <Loader2 size={48} className="text-blue-500 animate-spin" />
                </div>
            )}
        </div>
    );
}