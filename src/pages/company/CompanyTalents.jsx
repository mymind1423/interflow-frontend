import { useState, useEffect } from "react";
import { format } from "date-fns";
import { companyApi } from "../../api/companyApi";
import { exportToExcel } from "../../utils/excelExporter";
import { Search, MapPin, BookOpen, Briefcase, User, GraduationCap, ArrowRight, Eye, CheckCircle, XCircle, FileText, Check, ExternalLink, Phone, LayoutGrid, List, Download, Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { calculateAge } from "../../utils/dateUtils";
import { useTheme } from "../../context/ThemeContext";
import StudentDetailModal from "../../components/company/StudentDetailModal";

export default function CompanyTalents() {
    const { theme } = useTheme();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("card");
    const [filterDomain, setFilterDomain] = useState("all");
    const [filterGrade, setFilterGrade] = useState("all");
    const [jobOffers, setJobOffers] = useState([]);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState("");
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [studentsData, jobsData] = await Promise.all([
                companyApi.getTalents(),
                companyApi.getJobs()
            ]);
            setStudents(studentsData);
            setJobOffers(jobsData.filter(job =>
                // Allow up to 10 additional invitations even if quota is reached
                (job.interviewQuota + 10) > (job.acceptedCount || 0)
            ));
        } catch (err) {
            toast.error("Erreur lors du chargement des données.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!selectedJobId) {
            toast.error("Veuillez sélectionner une offre.");
            return;
        }

        setInviting(true);
        try {
            await companyApi.inviteStudent(viewingStudent.id, selectedJobId);
            toast.success(`Invitation envoyée à ${viewingStudent.name} !`);
            setShowInviteModal(false);
            setViewingStudent(null);
            loadData(); // Refresh data to show invited status
        } catch (err) {
            toast.error("Erreur lors de l'invitation.");
            console.error(err);
        } finally {
            setInviting(false);
        }
    };

    // Filter Logic
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.domain?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDomain = filterDomain === "all" || student.domain === filterDomain;
        const matchesGrade = filterGrade === "all" || student.grade === filterGrade;
        return matchesSearch && matchesDomain && matchesGrade;
    });

    // Unique Domains & Grades for Filter
    // Unique Domains & Grades for Filter
    const domains = ["all", ...new Set(students.map(s => s.domain).filter(Boolean))];
    const grades = ["all", ...new Set(students.map(s => s.grade).filter(Boolean))];

    const handleExport = () => {
        if (filteredStudents.length === 0) {
            toast.error("Aucun talent à exporter");
            return;
        }

        const columns = [
            { header: "Nom", key: "name", width: 25 },
            { header: "Domaine", key: "domain", width: 25 },
            { header: "Niveau", key: "grade", width: 15 },
            { header: "Établissement", key: "faculty", width: 30 },
            { header: "Statut Invitation", key: "inviteStatus", width: 25 },
        ];

        const data = filteredStudents.map(student => ({
            name: student.name || "",
            domain: student.domain || "",
            grade: student.grade || "",
            faculty: student.faculty || "",
            inviteStatus: student.hasPendingInvite ? "Invitation envoyée" : "Non invité"
        }));

        exportToExcel(`Talents_${format(new Date(), "yyyyMMdd")}`, "Talents", columns, data, `Vivier de Talents - ${format(new Date(), "dd/MM/yyyy")}`);
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                {/* ... */}
            </div>

            {/* Filters Toolbar */}
            <div className="glass-panel border-white/5 dark:border-white/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 shadow-sm items-center">
                {/* ... */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un talent par nom ou compétence..."
                        className="w-full bg-white/50 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-xl pl-10 pr-4 py-3 text-theme-primary font-bold outline-none focus:border-blue-500 transition-colors placeholder-theme-secondary/50 shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    {/* ... select inputs ... */}
                    <select
                        value={filterDomain}
                        onChange={(e) => setFilterDomain(e.target.value)}
                        className="bg-white/50 dark:bg-white/5 border border-white/10 dark:border-white/5 text-theme-secondary font-bold text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 min-w-[160px] outline-none cursor-pointer shadow-sm"
                    >
                        <option value="all" className="font-bold">Tous les domaines</option>
                        {domains.filter(d => d !== "all").map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <select
                        value={filterGrade}
                        onChange={(e) => setFilterGrade(e.target.value)}
                        className="bg-white/50 dark:bg-white/5 border border-white/10 dark:border-white/5 text-theme-secondary font-bold text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 min-w-[150px] outline-none cursor-pointer shadow-sm"
                    >
                        <option value="all" className="font-bold">Tous les niveaux</option>
                        {grades.filter(g => g !== "all").map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>

                {/* View Toggle */}
                <div className="flex bg-white/50 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-lg p-1 gap-1 shrink-0">
                    <button
                        onClick={handleExport}
                        className="p-2 rounded-lg text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all font-bold"
                        title="Exporter en Excel"
                    >
                        <Download size={18} />
                    </button>
                    <div className="w-px bg-white/10 mx-1 my-1"></div>
                    <button
                        onClick={() => setViewMode("card")}
                        className={`p-2 rounded-lg transition-all font-bold ${viewMode === "card" ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 shadow-inner" : "text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all font-bold ${viewMode === "list" ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 shadow-inner" : "text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"}`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={48} className="text-blue-600 animate-spin" />
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="text-center py-20 bg-white/5 border border-white/10 border-dashed rounded-3xl glass-panel">
                    <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-white/10">
                        <User size={32} className="text-theme-secondary" />
                    </div>
                    <h3 className="text-xl font-black text-theme-primary mb-2">Aucun talent trouvé</h3>
                    <p className="text-theme-secondary font-medium max-w-sm mx-auto">
                        Essayez de modifier vos filtres ou effectuez une nouvelle recherche pour trouver la perle rare.
                    </p>
                </div>
            ) : (
                <div className={viewMode === 'card' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-3"}>
                    {filteredStudents.map((student) => {
                        if (viewMode === 'list') {
                            return (
                                <div
                                    key={student.id}
                                    onClick={() => setViewingStudent(student)}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md transition-all cursor-pointer glass-panel border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-white/10 dark:hover:bg-slate-800 shadow-sm hover:shadow-md
                                    ${student.hasPendingInvite ? 'border-purple-200 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-500/10' : ''}`}
                                >
                                    {/* Avatar */}
                                    <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-sm">
                                        {student.photo ? (
                                            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black">
                                                {student.name.substring(0, 2)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-extrabold text-theme-primary text-base truncate">{student.name}</h3>
                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded uppercase tracking-wider">
                                                {student.domain}
                                            </span>
                                        </div>
                                        <div className="text-theme-secondary text-sm truncate flex items-center gap-2 mt-0.5 font-medium">
                                            <span className="text-theme-primary">{student.grade || "N/A"}</span>
                                            <span className="text-theme-secondary">•</span>
                                            <span className="truncate">{student.faculty || "N/A"}</span>
                                            {student.dateOfBirth && (
                                                <>
                                                    <span className="text-theme-secondary">•</span>
                                                    <span className="font-bold text-theme-primary">{calculateAge(student.dateOfBirth)} ans</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status/Action */}
                                    <div className="flex items-center gap-2">
                                        {student.hasPendingInvite ? (
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-600 text-xs font-bold">
                                                <CheckCircle size={14} /> <span className="hidden sm:inline">Invité</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setViewingStudent(student);
                                                    setShowInviteModal(true);
                                                }}
                                                className="p-2 rounded-lg bg-white/5 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shadow-sm font-bold"
                                                title="Convoquer"
                                            >
                                                <Briefcase size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={student.id}
                                onClick={() => setViewingStudent(student)}
                                className={`group relative glass-panel rounded-[2rem] p-5 sm:p-6 cursor-pointer border border-white/10 transition-all duration-300 hover:-translate-y-2 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-blue-200/50 dark:hover:shadow-blue-900/20
                                ${student.hasPendingInvite
                                        ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-500/30'
                                        : 'bg-white/40 dark:bg-slate-900/40 border-white/20 dark:border-white/10'}`}
                            >
                                {/* Background Blob Effect - Lighter for vibrant theme */}
                                <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] opacity-40 dark:opacity-20 transition-colors duration-700 pointer-events-none 
                                ${student.hasPendingInvite ? 'bg-purple-200 dark:bg-purple-500' : 'bg-blue-200 dark:bg-blue-500'}`}>
                                </div>

                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Card Content Top */}
                                    <div className="mb-4 flex-1">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <div className="relative shrink-0">
                                                <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-lg transition-all duration-500 transform group-hover:scale-105 bg-white dark:bg-slate-800
                                                ${student.hasPendingInvite
                                                        ? 'border-purple-200 dark:border-purple-500/30 shadow-purple-100 dark:shadow-none'
                                                        : 'border-blue-200 dark:border-blue-500/30 shadow-blue-100 dark:shadow-none'}`}>
                                                    {student.photo ? (
                                                        <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-xl">
                                                            {student.name.substring(0, 2)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status Icon Indicator */}
                                                <div className={`absolute -bottom-3 -right-3 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110
                                                ${student.hasPendingInvite ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                                                    {student.hasPendingInvite ? (
                                                        <CheckCircle size={14} strokeWidth={3} />
                                                    ) : (
                                                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Text Info */}
                                            <div className="min-w-0 flex flex-col justify-center h-16">
                                                <h3 className="text-xl font-black text-theme-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 truncate">
                                                    {student.name}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider truncate bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded shadow-sm">
                                                        {student.domain}
                                                    </span>
                                                    {student.dateOfBirth && (
                                                        <span className="text-theme-secondary text-xs font-bold flex items-center gap-1">
                                                            • {calculateAge(student.dateOfBirth)} ans
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics Grid - Colorful Boxes */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="bg-white/40 dark:bg-white/5 p-2.5 rounded-xl border border-white/20 dark:border-white/5 shadow-sm backdrop-blur-sm">
                                            <p className="text-[10px] text-theme-secondary font-black uppercase tracking-wider mb-0.5">Niveau</p>
                                            <p className="text-theme-primary text-sm font-extrabold truncate">{student.grade || "N/A"}</p>
                                        </div>
                                        <div className="bg-white/40 dark:bg-white/5 p-2.5 rounded-xl border border-white/20 dark:border-white/5 shadow-sm backdrop-blur-sm">
                                            <p className="text-[10px] text-theme-secondary font-black uppercase tracking-wider mb-0.5">Établissement</p>
                                            <p className="text-theme-primary text-sm font-extrabold break-words leading-tight line-clamp-2" title={student.faculty}>
                                                {student.faculty || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="pt-5 border-t border-white/10 flex items-center gap-3 mt-auto">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingStudent(student);
                                            }}
                                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl
                                            ${student.hasPendingInvite
                                                    ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 cursor-default'
                                                    : 'bg-white/50 dark:bg-slate-800/50 text-theme-primary hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 hover:shadow-blue-500/30'}`}
                                        >
                                            {student.hasPendingInvite ? (
                                                <>
                                                    <CheckCircle size={16} /> Invitation envoyée
                                                </>
                                            ) : (
                                                <>
                                                    Voir le profil <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Student Detail Modal */}
            <StudentDetailModal
                student={viewingStudent}
                onClose={() => setViewingStudent(null)}
            >
                {viewingStudent && (
                    viewingStudent.hasPendingInvite ? (
                        <button
                            disabled
                            className="w-full py-4 bg-purple-50 dark:bg-purple-500/10 text-purple-400 dark:text-purple-300 border border-purple-100 dark:border-purple-500/20 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed uppercase tracking-wider text-sm"
                        >
                            <CheckCircle size={20} /> Invitation déjà envoyée
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                        >
                            <Briefcase size={20} /> Convoquer à un entretien
                        </button>
                    )
                )}
            </StudentDetailModal>

            {/* Invite Modal (Select Job) */}
            {showInviteModal && viewingStudent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className={`border rounded-3xl w-full max-w-md p-8 shadow-2xl relative
                        ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                        <button
                            onClick={() => setShowInviteModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <XCircle size={24} />
                        </button>

                        <div className="text-center mb-8">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                <Briefcase size={32} />
                            </div>
                            <h3 className={`text-xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Convoquer {viewingStudent.name}</h3>
                            <p className={`font-medium text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Sélectionnez l'offre pour laquelle vous souhaitez inviter ce candidat.
                            </p>
                        </div>

                        <div className="space-y-3 mb-8 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                            {jobOffers.length === 0 ? (
                                <div className="text-center p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm font-medium">
                                    Aucune offre active disponible. <br /> Veuillez d'abord créer ou réactiver une offre.
                                </div>
                            ) : (
                                jobOffers.map(job => {
                                    const isFull = (job.acceptedCount + (job.pendingInvitationsCount || 0)) >= (job.interviewQuota + 10);
                                    return (
                                        <div
                                            key={job.id}
                                            onClick={() => !isFull && setSelectedJobId(job.id)}
                                            className={`group p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center relative overflow-hidden font-bold
                                                ${selectedJobId === job.id
                                                    ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/30'
                                                    : isFull
                                                        ? 'bg-slate-100 dark:bg-slate-800/20 border-slate-200 dark:border-white/5 opacity-50 cursor-not-allowed'
                                                        : theme === 'dark'
                                                            ? 'bg-slate-800/50 border-white/10 hover:border-blue-500/50 hover:bg-slate-800'
                                                            : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-white'}`}
                                        >
                                            <div className="relative z-10 text-left">
                                                <p className={`text-sm ${selectedJobId === job.id ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{job.title}</p>
                                                <p className={`text-[10px] mt-1 ${selectedJobId === job.id ? 'text-blue-100' : theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    Quota: {job.acceptedCount}/{job.interviewQuota} {job.pendingInvitationsCount > 0 ? `(+${job.pendingInvitationsCount} en attente)` : ''}
                                                    {isFull && <span className="ml-2 text-red-500 font-bold">PLEIN</span>}
                                                </p>
                                            </div>
                                            {selectedJobId === job.id && (
                                                <div className="bg-white text-blue-600 p-1.5 rounded-full shadow-sm relative z-10">
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <button
                            onClick={handleInvite}
                            disabled={!selectedJobId || inviting || (selectedJobId && (jobOffers.find(j => j.id === selectedJobId)?.acceptedCount + (jobOffers.find(j => j.id === selectedJobId)?.pendingInvitationsCount || 0) >= (jobOffers.find(j => j.id === selectedJobId)?.interviewQuota + 10)))}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 disabled:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                        >
                            {inviting ? <Loader2 size={20} className="animate-spin" /> : (selectedJobId && (jobOffers.find(j => j.id === selectedJobId)?.acceptedCount + (jobOffers.find(j => j.id === selectedJobId)?.pendingInvitationsCount || 0) >= (jobOffers.find(j => j.id === selectedJobId)?.interviewQuota + 10))) ? "Invitation max atteint" : "Envoyer l'invitation"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

