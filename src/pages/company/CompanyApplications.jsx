import { useState, useEffect } from "react";
import { companyApi } from "../../api/companyApi";
import { CheckCircle, XCircle, Search, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function CompanyApplications() {
    const [applications, setApplications] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewingApp, setViewingApp] = useState(null);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const data = await companyApi.getApplications();
            setApplications(data);
        } catch (error) {
            console.error(error);
            toast.error("Impossible de charger les candidatures");
        }
    };

    const handleAction = async (id, status) => {
        // Confirmation before action
        const msg = status === "ACCEPTED"
            ? "Voulez-vous accepter cette candidature ? Un entretien sera automatiquement planifié."
            : "Voulez-vous refuser cette candidature ?";

        if (!window.confirm(msg)) return;

        try {
            await companyApi.updateApplicationStatus(id, status);
            toast.success(status === "ACCEPTED" ? "Candidature acceptée et entretien planifié !" : "Candidature refusée");

            // Refresh logic: if viewing this app, close modal or update it?
            // Closing modal seems cleanest + refresh list
            if (viewingApp && viewingApp.id === id) {
                setViewingApp(null);
            }
            loadApplications();
        } catch (error) {
            toast.error("Une erreur est survenue");
            console.error(error);
        }
    };

    const filteredApps = applications.filter(app => {
        const matchesFilter = filter === "ALL" ? true : app.status === filter;
        const matchesSearch = app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Gestion des Candidatures</h1>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto no-scrollbar">
                    {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === f ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                            {f === "ALL" ? "Toutes" : f === "PENDING" ? "En attente" : f === "ACCEPTED" ? "Acceptées" : "Refusées"}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou poste..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.map(app => (
                    <div
                        key={app.id}
                        onClick={() => setViewingApp(app)}
                        className={`group relative bg-gradient-to-br from-slate-800/60 to-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 sm:p-6 cursor-pointer hover:border-white/20 transition-all duration-300 hover:-translate-y-2 overflow-hidden
                            ${app.status === 'ACCEPTED' ? 'hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]' :
                                app.status === 'REJECTED' ? 'hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)]' :
                                    'hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]'}`}
                    >
                        {/* Dynamic Background Gradient Blobs */}
                        <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] opacity-30 transition-colors duration-700 pointer-events-none 
                            ${app.status === 'ACCEPTED' ? 'bg-emerald-500' :
                                app.status === 'REJECTED' ? 'bg-red-500' :
                                    'bg-blue-600'}`}>
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-6 flex-1">
                                <div className="flex items-start gap-4">
                                    <div className="relative shrink-0">
                                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-500 transform group-hover:scale-105
                                                ${app.status === 'ACCEPTED' ? 'border-emerald-500/50 shadow-emerald-500/30' :
                                                app.status === 'REJECTED' ? 'border-red-500/50 shadow-red-500/30' :
                                                    'border-blue-500/50 shadow-blue-500/30'}`}>
                                            {app.applicantPhoto ? (
                                                <img src={app.applicantPhoto} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xl">
                                                    {app.applicantName ? app.applicantName.substring(0, 2) : "??"}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-3 -right-3 w-8 h-8 rounded-full border-4 border-slate-900 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110
                                                ${app.status === 'ACCEPTED' ? 'bg-emerald-500' :
                                                app.status === 'REJECTED' ? 'bg-red-500' :
                                                    'bg-amber-500'}`}>
                                            {app.status === 'ACCEPTED' ? <CheckCircle size={14} strokeWidth={3} /> :
                                                app.status === 'REJECTED' ? <XCircle size={14} strokeWidth={3} /> :
                                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all mb-1">{app.applicantName}</h3>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">{app.jobTitle}</span>
                                            {(app.domaine || app.grade) && (
                                                <span className="text-slate-400 text-xs flex items-center gap-1">
                                                    {app.domaine} {app.grade && `• ${app.grade}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-6">
                                    {app.cvUrl && (
                                        <a
                                            href={app.cvUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-2 text-xs font-bold bg-slate-800/80 hover:bg-white hover:text-slate-900 px-4 py-2.5 rounded-xl text-slate-300 transition-all border border-white/5 hover:border-white shadow-lg"
                                        >
                                            <FileText size={14} className="text-blue-400 group-hover:text-blue-600" /> CV
                                        </a>
                                    )}
                                    {app.diplomaUrl && (
                                        <a
                                            href={app.diplomaUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-2 text-xs font-bold bg-slate-800/80 hover:bg-white hover:text-slate-900 px-4 py-2.5 rounded-xl text-slate-300 transition-all border border-white/5 hover:border-white shadow-lg"
                                        >
                                            <FileText size={14} className="text-purple-400 group-hover:text-purple-600" /> Diplôme
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="pt-5 border-t border-white/10 flex items-center gap-3">
                                {app.status === 'PENDING' ? (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleAction(app.id, "ACCEPTED"); }}
                                            className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                        >
                                            <CheckCircle size={18} className="group-hover/btn:scale-110 transition-transform" /> Accepter
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleAction(app.id, "REJECTED"); }}
                                            className="flex-1 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn-reject"
                                        >
                                            <XCircle size={18} className="group-hover/btn-reject:scale-110 transition-transform" /> Refuser
                                        </button>
                                    </>
                                ) : (
                                    <div className={`w-full py-3 rounded-xl font-black text-sm border flex items-center justify-center gap-3 shadow-lg
                                            ${app.status === 'ACCEPTED' ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-900/20 border-emerald-500/30 text-emerald-400' :
                                            'bg-gradient-to-r from-red-500/20 to-red-900/20 border-red-500/30 text-red-400'}`}>
                                        {app.status === 'ACCEPTED' ? <CheckCircle size={18} strokeWidth={2.5} /> : <XCircle size={18} strokeWidth={2.5} />}
                                        <span className="uppercase tracking-wide">{app.status === 'ACCEPTED' ? 'Acceptée' : 'Refusée'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
                }
            </div >

            {/* Detailed View Modal (No Action Modal anymore, simple confirm) */}
            {
                viewingApp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row animate-fade-in-up">

                            {/* Left Sidebar: Profile Info */}
                            <div className="w-full md:w-1/3 bg-slate-950 p-6 border-r border-slate-800">
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
                                                onClick={() => { handleAction(viewingApp.id, "ACCEPTED"); }}
                                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={18} /> Accepter
                                            </button>
                                            <button
                                                onClick={() => { handleAction(viewingApp.id, "REJECTED"); }}
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
                )
            }
        </div >
    );
}

