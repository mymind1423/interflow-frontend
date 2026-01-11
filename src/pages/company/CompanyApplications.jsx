
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { companyApi } from "../../api/companyApi";
import { settingsApi } from "../../api/settingsApi";
import { exportToExcel } from "../../utils/excelExporter";
import { CheckCircle, XCircle, Search, FileText, Star, LayoutGrid, List, Download, Loader2, Calendar } from "lucide-react";
import EvaluationModal from "../../components/company/EvaluationModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import toast from "react-hot-toast";
import { calculateAge } from "../../utils/dateUtils";

import { useNotifications } from "../../context/NotificationContext";

export default function CompanyApplications() {
    const { notifications, markAsRead } = useNotifications();
    const [applications, setApplications] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [activeSourceTab, setActiveSourceTab] = useState("DIRECT"); // "DIRECT" | "INVITATION"

    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("card");
    const [loading, setLoading] = useState(true);
    const [processingAction, setProcessingAction] = useState({ id: null, type: null });
    const [viewingApp, setViewingApp] = useState(null);
    const [evaluatingStudent, setEvaluatingStudent] = useState(null);
    const [validationEnabled, setValidationEnabled] = useState(true);

    useEffect(() => {
        const unreadAppNotifs = notifications.filter(n => !n.isRead && n.type === 'application');
        if (unreadAppNotifs.length > 0) {
            unreadAppNotifs.forEach(n => markAsRead(n.id));
        }
    }, [notifications]);

    useEffect(() => {
        loadApplications();
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await settingsApi.getSettings();
            setValidationEnabled(settings.workflow?.validationEnabled !== false);
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    };

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
        const matchesSource = app.source === activeSourceTab;
        const matchesFilter = filter === "ALL" ? true : app.status === filter;
        const matchesSearch = app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSource && matchesFilter && matchesSearch;
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
        <div className="max-w-screen-2xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-theme-primary mb-2">Suivi des Candidats</h1>
                    <p className="text-theme-secondary font-medium">Gérez vos candidatures directes et le suivi de vos invitations.</p>
                </div>

                <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 w-fit">
                    <button
                        onClick={() => setActiveSourceTab('DIRECT')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSourceTab === 'DIRECT'
                            ? "bg-blue-50 text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-blue-500"
                            }`}
                    >
                        <FileText size={16} />
                        Candidatures
                    </button>
                    <button
                        onClick={() => setActiveSourceTab('INVITATION')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSourceTab === 'INVITATION'
                            ? "bg-purple-50 text-purple-600 shadow-sm"
                            : "text-slate-500 hover:text-purple-500"
                            }`}
                    >
                        <Star size={16} />
                        Invitations
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex glass-panel !p-1 overflow-x-auto no-scrollbar shadow-sm rounded-xl">
                    {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${filter === f ? "bg-blue-600 shadow-md text-white" : "text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/5"}`}>
                            {f === "ALL" ? "Toutes" : f === "PENDING" ? "En attente" : f === "ACCEPTED" ? "Acceptées" : "Refusées"}
                        </button>
                    ))}
                </div>

                {/* View Toggle */}
                <div className="flex glass-panel !p-1 gap-1 shrink-0 shadow-sm rounded-lg">
                    <button
                        onClick={handleExport}
                        className="p-2 rounded-lg text-theme-secondary hover:text-blue-600 dark:hover:text-white hover:bg-white/5 transition-all"
                        title="Exporter en Excel"
                    >
                        <Download size={18} />
                    </button>
                    <div className="w-px bg-white/10 mx-1 my-1"></div>
                    <button
                        onClick={() => setViewMode("card")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm" : "text-theme-secondary hover:text-blue-600 dark:hover:text-white hover:bg-white/5"}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm" : "text-theme-secondary hover:text-blue-600 dark:hover:text-white hover:bg-white/5"}`}
                    >
                        <List size={18} />
                    </button>
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" size={18} />
                    <input type="text" placeholder="Rechercher par nom ou poste..."
                        className="w-full glass-panel pl-10 pr-4 py-2.5 text-theme-primary font-medium outline-none focus:border-blue-500 rounded-xl transition-all placeholder-theme-secondary/50 shadow-sm"
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
                                    className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer glass-panel hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-none hover:-translate-y-0.5
                                ${app.source === 'INVITATION' ? 'border-purple-100 dark:border-purple-500/20 bg-purple-50/10' : ''}
                                ${app.status === 'ACCEPTED' ? 'hover:border-emerald-300 dark:hover:border-emerald-500/50' : app.status === 'REJECTED' ? 'hover:border-red-300 dark:hover:border-red-500/50' : 'hover:border-blue-300 dark:hover:border-blue-500/50'}`}
                                >
                                    {/* Avatar */}
                                    <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-sm">
                                        {app.applicantPhoto ? (
                                            <img src={app.applicantPhoto} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-theme-secondary font-bold">
                                                {app.applicantName ? app.applicantName.substring(0, 2) : "??"}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-theme-primary text-base truncate">{app.applicantName}</h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border
                                            ${app.status === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' :
                                                    app.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20'}`}>
                                                {app.status === 'ACCEPTED' ? 'Acceptée' : app.status === 'REJECTED' ? 'Refusée' : 'En attente'}
                                            </span>
                                        </div>
                                        <p className="text-theme-secondary text-sm truncate flex items-center gap-2">
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">{app.jobTitle}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                            <span className="text-theme-secondary">{app.domaine || "Domaine N/A"}</span>
                                            {app.dateOfBirth && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                    <span className="text-theme-secondary font-bold">{calculateAge(app.dateOfBirth)} ans</span>
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        {app.status === 'PENDING' ? (
                                            validationEnabled ? (
                                                <>
                                                    <button onClick={() => requestAction(app.id, "ACCEPTED")} disabled={processingAction.id === app.id} className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-colors disabled:opacity-50 border border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-500" title="Accepter">
                                                        {processingAction.id === app.id && processingAction.type === "ACCEPTED" ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                                    </button>
                                                    <button onClick={() => requestAction(app.id, "REJECTED")} disabled={processingAction.id === app.id} className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-colors disabled:opacity-50 border border-red-100 dark:border-red-500/20 hover:border-red-500" title="Refuser">
                                                        {processingAction.id === app.id && processingAction.type === "REJECTED" ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                                    </button>
                                                </>
                                            ) : (
                                                <button onClick={() => requestAction(app.id, "ACCEPTED")} disabled={processingAction.id === app.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-xs" title="Planifier l'entretien">
                                                    {processingAction.id === app.id ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                                                    Planifier l'entretien
                                                </button>
                                            )
                                        ) : (
                                            <div className={`p-2 rounded-full border ${app.status === 'ACCEPTED' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20'}`}>
                                                {app.status === 'ACCEPTED' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={app.id} onClick={() => setViewingApp(app)}
                                className={`group relative glass-panel rounded-[2rem] p-5 sm:p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden hover:shadow-2xl hover:shadow-blue-200/50 dark:hover:shadow-blue-900/20
                                ${app.source === 'INVITATION' ? 'border-purple-200 dark:border-purple-500/30 bg-purple-50/20' : ''}
                                ${app.status === 'ACCEPTED' ? 'hover:border-emerald-300' :
                                        app.status === 'REJECTED' ? 'hover:border-red-300' :
                                            'hover:border-blue-300'}`}>
                                <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] opacity-10 transition-colors duration-700 pointer-events-none 
                                ${app.status === 'ACCEPTED' ? 'bg-emerald-500' :
                                        app.status === 'REJECTED' ? 'bg-red-500' : 'bg-blue-600'}`}></div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="mb-6 flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="relative shrink-0">
                                                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 shadow-lg transition-all duration-500 transform group-hover:scale-105
                                            ${app.status === 'ACCEPTED' ? 'border-emerald-200 dark:border-emerald-500/30 shadow-emerald-100 dark:shadow-emerald-900/20' :
                                                        app.status === 'REJECTED' ? 'border-red-200 dark:border-red-500/30 shadow-red-100 dark:shadow-red-900/20' : 'border-blue-200 dark:border-blue-500/30 shadow-blue-100 dark:shadow-blue-900/20'}`}>
                                                    {app.applicantPhoto ? (
                                                        <img src={app.applicantPhoto} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-theme-secondary font-bold text-xl">
                                                            {app.applicantName ? app.applicantName.substring(0, 2) : "??"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-3 -right-3 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110
                                            ${app.status === 'ACCEPTED' ? 'bg-emerald-500' : app.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'}`}>
                                                    {app.status === 'ACCEPTED' ? <CheckCircle size={14} strokeWidth={3} /> :
                                                        app.status === 'REJECTED' ? <XCircle size={14} strokeWidth={3} /> :
                                                            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-theme-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">{app.applicantName}</h3>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">{app.jobTitle}</span>
                                                    {(app.domaine || app.grade) && (
                                                        <span className="text-theme-secondary text-xs flex items-center gap-1 font-medium">
                                                            {app.domaine} {app.grade && `• ${app.grade}`}
                                                            {app.dateOfBirth && ` • ${calculateAge(app.dateOfBirth)} ans`}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-6">
                                            {app.cvUrl && (<a href={app.cvUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-xs font-bold bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2.5 rounded-xl text-theme-secondary transition-all border border-white/10 hover:border-blue-300 dark:hover:border-blue-500/40 shadow-sm"><FileText size={14} className="text-blue-500 dark:text-blue-400" /> CV</a>)}
                                            {app.diplomaUrl && (<a href={app.diplomaUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-xs font-bold bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 px-4 py-2.5 rounded-xl text-theme-secondary transition-all border border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40 shadow-sm"><FileText size={14} className="text-purple-500 dark:text-purple-400" /> Diplôme</a>)}
                                        </div>
                                    </div>
                                    <div className="pt-5 border-t border-white/10 flex items-center gap-3">
                                        {app.status === 'PENDING' ? (
                                            validationEnabled ? (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); requestAction(app.id, "ACCEPTED"); }} disabled={processingAction.id === app.id} className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                                        {processingAction.id === app.id && processingAction.type === "ACCEPTED" ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} className="group-hover/btn:scale-110 transition-transform" /> Accepter</>}
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); requestAction(app.id, "REJECTED"); }} disabled={processingAction.id === app.id} className="flex-1 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 border border-red-200 dark:border-red-500/20 hover:border-red-500 text-red-600 dark:text-red-400 hover:text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn-reject disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                                                        {processingAction.id === app.id && processingAction.type === "REJECTED" ? <Loader2 size={18} className="animate-spin" /> : <><XCircle size={18} className="group-hover/btn-reject:scale-110 transition-transform" /> Refuser</>}
                                                    </button>
                                                </>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); requestAction(app.id, "ACCEPTED"); }} disabled={processingAction.id === app.id} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                                                    {processingAction.id === app.id ? <Loader2 size={18} className="animate-spin" /> : <><Calendar size={18} /> Planifier l'entretien</>}
                                                </button>
                                            )
                                        ) : (
                                            <div className={`w-full py-3 rounded-xl font-black text-sm border flex items-center justify-center gap-3 shadow-none bg-white/5 ${app.status === 'ACCEPTED' ? 'border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'}`}>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="glass-panel border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row animate-fade-in-up">
                        <div className="w-full md:w-1/3 border-r border-white/10 p-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-white/5 overflow-hidden border-4 border-white/10 mb-4 shadow-sm shrink-0">
                                    {viewingApp.applicantPhoto ? (<img src={viewingApp.applicantPhoto} alt="" className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-theme-secondary font-bold text-2xl bg-white/10">{viewingApp.applicantName ? viewingApp.applicantName.substring(0, 2) : "??"}</div>)}
                                </div>
                                <h2 className="text-xl font-black text-theme-primary">{viewingApp.applicantName}</h2>
                                <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-1">{viewingApp.domaine || "Domaine non spécifié"}</p>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div><p className="text-theme-secondary font-bold text-xs uppercase tracking-wider mb-1">Contact</p><p className="text-theme-primary font-medium truncate" title={viewingApp.email}>{viewingApp.email}</p><p className="text-theme-primary font-medium">{viewingApp.phone || "N/A"}</p><p className="text-theme-primary font-medium line-clamp-2">{viewingApp.address || "N/A"}</p>
                                    {viewingApp.dateOfBirth && <p className="text-theme-secondary mt-1 font-bold flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> {calculateAge(viewingApp.dateOfBirth)} ans</p>}
                                </div>
                                <div><p className="text-theme-secondary font-bold text-xs uppercase tracking-wider mb-1">Faculté / École</p><p className="text-theme-primary font-medium">{viewingApp.faculty || "N/A"}</p></div>
                                <div><p className="text-theme-secondary font-bold text-xs uppercase tracking-wider mb-1">Niveau</p><p className="text-theme-primary font-medium">{viewingApp.grade || "N/A"}</p></div>
                            </div>
                            <hr className="my-6 border-white/10" />
                            <div className="flex flex-col gap-3">
                                {viewingApp.status === 'PENDING' ? (
                                    validationEnabled ? (
                                        <>
                                            <button onClick={() => { requestAction(viewingApp.id, "ACCEPTED"); }} disabled={processingAction.id === viewingApp.id} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20">
                                                {processingAction.id === viewingApp.id && processingAction.type === "ACCEPTED" ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Accepter</>}
                                            </button>
                                            <button onClick={() => { requestAction(viewingApp.id, "REJECTED"); }} disabled={processingAction.id === viewingApp.id} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-red-500 hover:text-red-400 border border-white/10 hover:border-red-500/50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group/btn-reject-modal disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                                                {processingAction.id === viewingApp.id && processingAction.type === "REJECTED" ? <Loader2 size={18} className="animate-spin" /> : <><XCircle size={18} className="group-hover/btn-reject-modal:scale-110 transition-transform" /> Refuser</>}
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => { requestAction(viewingApp.id, "ACCEPTED"); }} disabled={processingAction.id === viewingApp.id} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                                            {processingAction.id === viewingApp.id ? <Loader2 size={18} className="animate-spin" /> : <><Calendar size={18} /> Planifier l'entretien</>}
                                        </button>
                                    )
                                ) : (
                                    <div className={`w-full py-3 rounded-xl font-bold text-base border flex items-center justify-center gap-2 ${viewingApp.status === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'}`}>
                                        {viewingApp.status === 'ACCEPTED' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                        {viewingApp.status === 'ACCEPTED' ? 'Candidature Acceptée' : 'Candidature Refusée'}
                                    </div>
                                )}

                            </div>
                            <button onClick={() => setViewingApp(null)} className="mt-4 w-full py-2 text-theme-secondary hover:text-theme-primary transition-colors font-medium">Fermer</button>
                        </div>
                        <div className="flex-1 p-6 sm:p-8 bg-transparent">
                            <div className="mb-6"><h3 className="text-lg font-bold text-theme-primary mb-3 flex items-center gap-2"><FileText size={20} className="text-slate-500" /> Lettre de motivation</h3><div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-theme-secondary whitespace-pre-wrap leading-relaxed min-h-[100px] shadow-sm font-medium">{viewingApp.coverLetter || "Le candidat n'a pas ajouté de lettre de motivation."}</div></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><h3 className="text-lg font-bold text-theme-primary mb-3 flex items-center gap-2"><FileText size={20} className="text-blue-500" /> CV</h3>{viewingApp.cvUrl ? (<iframe src={viewingApp.cvUrl} className="w-full h-64 rounded-xl border border-white/10 bg-white shadow-sm" title="CV Preview" />) : (<div className="h-64 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-theme-secondary italic">Non disponible</div>)}{viewingApp.cvUrl && (<a href={viewingApp.cvUrl} target="_blank" rel="noreferrer" className="block mt-2 text-center text-sm text-blue-500 font-bold hover:underline">Ouvrir en plein écran</a>)}</div>
                                <div><h3 className="text-lg font-bold text-theme-primary mb-3 flex items-center gap-2"><FileText size={20} className="text-purple-500" /> Diplôme</h3>{viewingApp.diplomaUrl ? (<iframe src={viewingApp.diplomaUrl} className="w-full h-64 rounded-xl border border-white/10 bg-white shadow-sm" title="Diploma Preview" />) : (<div className="h-64 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-theme-secondary italic">Non disponible</div>)}{viewingApp.diplomaUrl && (<a href={viewingApp.diplomaUrl} target="_blank" rel="noreferrer" className="block mt-2 text-center text-sm text-purple-500 font-bold hover:underline">Ouvrir en plein écran</a>)}</div>
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
