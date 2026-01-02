import { useState, useEffect } from "react";
import { invitationApi } from "../../api/invitationApi";
import { CheckCircle, XCircle, Briefcase, Calendar, Clock, Building, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentInvitations() {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [respondingId, setRespondingId] = useState(null);

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
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Briefcase className="text-blue-500" />
                    Invitations reçues
                </h1>
                <p className="text-slate-400">Les entreprises qui souhaitent vous rencontrer.</p>

                {pending.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                        <p className="text-slate-500">Aucune invitation en attente pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pending.map((inv) => (
                            <div key={inv.id} className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-blue-500/30 transition-all shadow-lg">
                                <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                                    {inv.companyLogo ? (
                                        <img src={inv.companyLogo} alt={inv.companyName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building className="text-slate-500" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-1">{inv.jobTitle}</h3>
                                    <p className="text-blue-400 font-medium">{inv.companyName}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                        <span className="flex items-center gap-1"><Clock size={14} /> Reçu le {new Date(inv.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                    <button
                                        onClick={() => handleAccept(inv.id)}
                                        disabled={respondingId === inv.id}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {respondingId === inv.id ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Accepter</>}
                                    </button>
                                    <button
                                        onClick={() => handleReject(inv.id)}
                                        disabled={respondingId === inv.id}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="space-y-6 pt-8 border-t border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-300 flex items-center gap-3">
                        <Clock className="text-slate-500" />
                        Historique
                    </h2>

                    <div className="grid gap-3 opacity-70 hover:opacity-100 transition-opacity">
                        {history.map((inv) => (
                            <div key={inv.id} className="bg-slate-900/20 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0 grayscale">
                                    {inv.companyLogo ? (
                                        <img src={inv.companyLogo} alt={inv.companyName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building className="text-slate-500" size={20} />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold truncate">{inv.jobTitle}</h4>
                                    <p className="text-slate-500 text-sm truncate">{inv.companyName} • {new Date(inv.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${inv.status === 'ACCEPTED'
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                    {inv.status === 'ACCEPTED' ? 'Accepté' : 'Refusé'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}