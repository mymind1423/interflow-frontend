
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { companyApi } from "../../api/companyApi";
import { exportToExcel } from "../../utils/excelExporter";
import { CheckCircle, XCircle, Search, FileText, Star, LayoutGrid, List, Download, Loader2, Calendar } from "lucide-react";
import EvaluationModal from "../../components/company/EvaluationModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import toast from "react-hot-toast";
import { calculateAge } from "../../utils/dateUtils";

export default function CompanyApplications() {
    const [applications, setApplications] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("card");
    const [loading, setLoading] = useState(true);
    const [processingAction, setProcessingAction] = useState({ id: null, type: null });
    const [viewingApp, setViewingApp] = useState(null);
    const [evaluatingStudent, setEvaluatingStudent] = useState(null);

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
        } finally {
            setLoading(false);
        }
    };

    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    // ... existing loadApplications ...

    const requestAction = (id, status) => {
        const isAccept = status === "ACCEPTED";
        setConfirmModal({
            isOpen: true,
            title: isAccept ? "Accepter la candidature ?" : "Refuser la candidature ?",
            message: isAccept
                ? "Un entretien sera automatiquement planifié et le candidat sera notifié."
                : "Cette action est irréversible. Le candidat sera notifié du refus.",
            confirmText: isAccept ? "Accepter" : "Refuser",
            isDangerous: !isAccept,
            onConfirm: () => executeAction(id, status)
        });
    };

    const executeAction = async (id, status) => {
        setProcessingAction({ id, type: status });
        try {
            await companyApi.updateApplicationStatus(id, status);
            toast.success(status === "ACCEPTED" ? "Candidature acceptée !" : "Candidature refusée");

            if (viewingApp && viewingApp.id === id) {
                setViewingApp(null);
            }
            loadApplications();
            setConfirmModal({ isOpen: false });
        } catch (error) {
            toast.error("Une erreur est survenue");
            console.error(error);
        } finally {
            setProcessingAction({ id: null, type: null });
        }
    };

    const filteredApps = applications.filter(app => {
        const matchesFilter = filter === "ALL" ? true : app.status === filter;
        const matchesSearch = app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleExport = () => {
        if (filteredApps.length === 0) {
            toast.error("Aucune candidature à exporter");
            return;
        }

        const columns = [
            { header: "Candidat", key: "name", width: 25 },
            { header: "Poste visé", key: "job", width: 30 },
            { header: "Domaine", key: "domain", width: 20 },
            { header: "Niveau", key: "grade", width: 15 },
            { header: "Statut", key: "status", width: 15 },
            { header: "Email", key: "email", width: 30 },
            { header: "Téléphone", key: "phone", width: 20 },
        ];

        const data = filteredApps.map(app => ({
            name: app.applicantName || "",
            job: app.jobTitle || "",
            domain: app.domaine || "",
            grade: app.grade || "",
            status: app.status === 'ACCEPTED' ? 'Acceptée' : app.status === 'REJECTED' ? 'Refusée' : 'En attente',
            email: app.email || "",
            phone: app.phone || ""
        }));

        exportToExcel(`Candidatures_${format(new Date(), "yyyyMMdd")}`, "Candidatures", columns, data, `Liste des Candidatures - ${format(new Date(), "dd/MM/yyyy")}`);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Gestion des Candidatures</h1>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto no-scrollbar">
                    {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === f ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                            {f === "ALL" ? "Toutes" : f === "PENDING" ? "En attente" : f === "ACCEPTED" ? "Acceptées" : "Refusées"}
                        </button>
                    ))}
                </div>

                {/* View Toggle */}
                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1 shrink-0">
                    <button
                        onClick={handleExport}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                        title="Exporter en Excel"
                    >
                        <Download size={18} />
                    </button>
                    <div className="w-px bg-slate-800 mx-1 my-1"></div>
                    <button
                        onClick={() => setViewMode("card")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"}`}
                    >
                        <List size={18} />
                    </button>
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="text" placeholder="Rechercher par nom ou poste..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={48} className="text-blue-500 animate-spin" />
                </div>
            ) : (
                <div className={viewMode === 'card' ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
                    {filteredApps.map(app => {
                        if (viewMode === 'list') {
                            return (
                                <div key={app.id}
                                    onClick={() => setViewingApp(app)}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-sm transition-all cursor-pointer bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700
                                ${app.status === 'ACCEPTED' ? 'hover:border-emerald-500/30' : app.status === 'REJECTED' ? 'hover:border-red-500/30' : 'hover:border-blue-500/30'}`}
                                >
                                    {/* Avatar */}
                                    <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-slate-700">
                                        {app.applicantPhoto ? (
                                            <img src={app.applicantPhoto} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                                                {app.applicantName ? app.applicantName.substring(0, 2) : "??"}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-white text-base truncate">{app.applicantName}</h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider
                                            ${app.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                {app.status === 'ACCEPTED' ? 'Acceptée' : app.status === 'REJECTED' ? 'Refusée' : 'En attente'}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm truncate flex items-center gap-2">
                                            <span className="text-blue-400 font-medium">{app.jobTitle}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                            <span>{app.domaine || "Domaine N/A"}</span>
                                            {app.dateOfBirth && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                                    <span className="text-slate-300 font-bold">{calculateAge(app.dateOfBirth)} ans</span>
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        {app.status === 'PENDING' ? (
                                            <>
                                                <button onClick={() => requestAction(app.id, "ACCEPTED")} disabled={processingAction.id === app.id} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-50" title="Accepter">
                                                    {processingAction.id === app.id && processingAction.type === "ACCEPTED" ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                                </button>
                                                <button onClick={() => requestAction(app.id, "REJECTED")} disabled={processingAction.id === app.id} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50" title="Refuser">
                                                    {processingAction.id === app.id && processingAction.type === "REJECTED" ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                                </button>
                                            </>
                                        ) : (
                                            <div className={`p-2 rounded-full ${app.status === 'ACCEPTED' ? 'text-emerald-500 bg-emerald-500/5' : 'text-red-500 bg-red-500/5'}`}>
                                                {app.status === 'ACCEPTED' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={app.id} onClick={() => setViewingApp(app)}
                                className={`group relative bg-gradient-to-br from-slate-800/60 to-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 sm:p-6 cursor-pointer hover:border-white/20 transition-all duration-300 hover:-translate-y-2 overflow-hidden
                                ${app.status === 'ACCEPTED' ? 'hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]' :
                                        app.status === 'REJECTED' ? 'hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)]' :
                                            'hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]'}`}>
                                <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] opacity-30 transition-colors duration-700 pointer-events-none 
                                ${app.status === 'ACCEPTED' ? 'bg-emerald-500' :
                                        app.status === 'REJECTED' ? 'bg-red-500' : 'bg-blue-600'}`}></div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="mb-6 flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="relative shrink-0">
                                                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-500 transform group-hover:scale-105
                                            ${app.status === 'ACCEPTED' ? 'border-emerald-500/50 shadow-emerald-500/30' :
                                                        app.status === 'REJECTED' ? 'border-red-500/50 shadow-red-500/30' : 'border-blue-500/50 shadow-blue-500/30'}`}>
                                                    {app.applicantPhoto ? (
                                                        <img src={app.applicantPhoto} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xl">
                                                            {app.applicantName ? app.applicantName.substring(0, 2) : "??"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-3 -right-3 w-8 h-8 rounded-full border-4 border-slate-900 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110
                                            ${app.status === 'ACCEPTED' ? 'bg-emerald-500' : app.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'}`}>
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
                                                            {app.dateOfBirth && ` • ${calculateAge(app.dateOfBirth)} ans`}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-6">
                                            {app.cvUrl && (<a href={app.cvUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-xs font-bold bg-slate-800/80 hover:bg-white hover:text-slate-900 px-4 py-2.5 rounded-xl text-slate-300 transition-all border border-white/5 hover:border-white shadow-lg"><FileText size={14} className="text-blue-400 group-hover:text-blue-600" /> CV</a>)}
                                            {app.diplomaUrl && (<a href={app.diplomaUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-xs font-bold bg-slate-800/80 hover:bg-white hover:text-slate-900 px-4 py-2.5 rounded-xl text-slate-300 transition-all border border-white/5 hover:border-white shadow-lg"><FileText size={14} className="text-purple-400 group-hover:text-purple-600" /> Diplôme</a>)}
                                        </div>
                                    </div>
                                    <div className="pt-5 border-t border-white/10 flex items-center gap-3">
                                        {app.status === 'PENDING' ? (
                                            <>
                                                <button onClick={(e) => { e.stopPropagation(); requestAction(app.id, "ACCEPTED"); }} disabled={processingAction.id === app.id} className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {processingAction.id === app.id && processingAction.type === "ACCEPTED" ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} className="group-hover/btn:scale-110 transition-transform" /> Accepter</>}
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); requestAction(app.id, "REJECTED"); }} disabled={processingAction.id === app.id} className="flex-1 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn-reject disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {processingAction.id === app.id && processingAction.type === "REJECTED" ? <Loader2 size={18} className="animate-spin" /> : <><XCircle size={18} className="group-hover/btn-reject:scale-110 transition-transform" /> Refuser</>}
                                                </button>
                                            </>
                                        ) : (
                                            <div className={`w-full py-3 rounded-xl font-black text-sm border flex items-center justify-center gap-3 shadow-lg ${app.status === 'ACCEPTED' ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-gradient-to-r from-red-500/20 to-red-900/20 border-red-500/30 text-red-400'}`}>
                                                {app.status === 'ACCEPTED' ? <CheckCircle size={18} strokeWidth={2.5} /> : <XCircle size={18} strokeWidth={2.5} />}
                                                <span className="uppercase tracking-wide">{app.status === 'ACCEPTED' ? 'Acceptée' : 'Refusée'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {viewingApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row animate-fade-in-up">
                        <div className="w-full md:w-1/3 bg-slate-950 p-6 border-r border-slate-800">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-slate-800 overflow-hidden border-2 border-slate-700 mb-4 shadow-lg shrink-0">
                                    {viewingApp.applicantPhoto ? (<img src={viewingApp.applicantPhoto} alt="" className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-slate-500 text-2xl font-bold">{viewingApp.applicantName ? viewingApp.applicantName.substring(0, 2) : "??"}</div>)}
                                </div>
                                <h2 className="text-xl font-bold text-white">{viewingApp.applicantName}</h2>
                                <p className="text-blue-400 font-medium">{viewingApp.domaine || "Domaine non spécifié"}</p>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div><p className="text-slate-500 font-medium mb-1">Contact</p><p className="text-slate-300 truncate" title={viewingApp.email}>{viewingApp.email}</p><p className="text-slate-300">{viewingApp.phone || "N/A"}</p><p className="text-slate-300 line-clamp-2">{viewingApp.address || "N/A"}</p>
                                    {viewingApp.dateOfBirth && <p className="text-slate-300 mt-1 font-bold flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> {calculateAge(viewingApp.dateOfBirth)} ans</p>}
                                </div>
                                <div><p className="text-slate-500 font-medium mb-1">Faculté / École</p><p className="text-slate-300">{viewingApp.faculty || "N/A"}</p></div>
                                <div><p className="text-slate-500 font-medium mb-1">Niveau</p><p className="text-slate-300">{viewingApp.grade || "N/A"}</p></div>
                            </div>
                            <hr className="my-6 border-slate-800" />
                            <div className="flex flex-col gap-3">
                                {viewingApp.status === 'PENDING' ? (
                                    <>
                                        <button onClick={() => { requestAction(viewingApp.id, "ACCEPTED"); }} disabled={processingAction.id === viewingApp.id} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                            {processingAction.id === viewingApp.id && processingAction.type === "ACCEPTED" ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Accepter</>}
                                        </button>
                                        <button onClick={() => { requestAction(viewingApp.id, "REJECTED"); }} disabled={processingAction.id === viewingApp.id} className="w-full py-2.5 bg-red-500/10 hover:bg-red-600 hover:text-white border border-red-500/20 hover:border-red-600 text-red-500 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 group/btn-reject-modal disabled:opacity-50 disabled:cursor-not-allowed">
                                            {processingAction.id === viewingApp.id && processingAction.type === "REJECTED" ? <Loader2 size={18} className="animate-spin" /> : <><XCircle size={18} className="group-hover/btn-reject-modal:scale-110 transition-transform" /> Refuser</>}
                                        </button>
                                    </>
                                ) : (
                                    <div className={`w-full py-3 rounded-xl font-bold text-base border flex items-center justify-center gap-2 ${viewingApp.status === 'ACCEPTED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                        {viewingApp.status === 'ACCEPTED' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                        {viewingApp.status === 'ACCEPTED' ? 'Candidature Acceptée' : 'Candidature Refusée'}
                                    </div>
                                )}

                            </div>
                            <button onClick={() => setViewingApp(null)} className="mt-4 w-full py-2 text-slate-500 hover:text-white transition-colors">Fermer</button>
                        </div>
                        <div className="flex-1 p-6 bg-slate-900">
                            <div className="mb-6"><h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><FileText size={20} className="text-blue-500" /> Lettre de motivation</h3><div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[100px]">{viewingApp.coverLetter || "Le candidat n'a pas ajouté de lettre de motivation."}</div></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><FileText size={20} className="text-purple-500" /> CV</h3>{viewingApp.cvUrl ? (<iframe src={viewingApp.cvUrl} className="w-full h-64 rounded-xl border border-slate-800 bg-white" title="CV Preview" />) : (<div className="h-64 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 italic">Non disponible</div>)}{viewingApp.cvUrl && (<a href={viewingApp.cvUrl} target="_blank" rel="noreferrer" className="block mt-2 text-center text-sm text-blue-400 hover:underline font-medium">Ouvrir en plein écran</a>)}</div>
                                <div><h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><FileText size={20} className="text-pink-500" /> Diplôme</h3>{viewingApp.diplomaUrl ? (<iframe src={viewingApp.diplomaUrl} className="w-full h-64 rounded-xl border border-slate-800 bg-white" title="Diploma Preview" />) : (<div className="h-64 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 italic">Non disponible</div>)}{viewingApp.diplomaUrl && (<a href={viewingApp.diplomaUrl} target="_blank" rel="noreferrer" className="block mt-2 text-center text-sm text-blue-400 hover:underline font-medium">Ouvrir en plein écran</a>)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {evaluatingStudent && (
                <EvaluationModal
                    studentId={evaluatingStudent}
                    companyId="current"
                    onClose={() => setEvaluatingStudent(null)}
                />
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isDangerous={confirmModal.isDangerous}
                onConfirm={confirmModal.onConfirm}
                isLoading={!!processingAction.id}
            />
        </div>
    );
}
