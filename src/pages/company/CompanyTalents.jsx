import { useState, useEffect } from "react";
import { format } from "date-fns";
import { companyApi } from "../../api/companyApi";
import { exportToExcel } from "../../utils/excelExporter";
import { Search, MapPin, BookOpen, Briefcase, User, GraduationCap, ArrowRight, Eye, CheckCircle, XCircle, FileText, Check, ExternalLink, Phone, LayoutGrid, List, Download, Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { calculateAge } from "../../utils/dateUtils";

export default function CompanyTalents() {
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
                // Only active jobs with quota remaining
                job.interviewQuota > (job.acceptedCount || 0)
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
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                {/* ... */}
            </div>

            {/* Filters Toolbar */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 shadow-sm backdrop-blur-sm items-center">
                {/* ... */}

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    {/* ... select inputs ... */}
                    <select
                        value={filterDomain}
                        onChange={(e) => setFilterDomain(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 min-w-[160px]"
                    >
                        <option value="all">Tous les domaines</option>
                        {domains.filter(d => d !== "all").map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <select
                        value={filterGrade}
                        onChange={(e) => setFilterGrade(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 min-w-[150px]"
                    >
                        <option value="all">Tous les niveaux</option>
                        {grades.filter(g => g !== "all").map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>

                {/* View Toggle */}
                <div className="flex bg-slate-950 border border-slate-700 rounded-lg p-1 gap-1 shrink-0">
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
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={48} className="text-blue-500 animate-spin" />
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl">
                    <div className="bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <User size={32} className="text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Aucun talent trouvé</h3>
                    <p className="text-slate-400 max-w-sm mx-auto">
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
                                    className={`group flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-sm transition-all cursor-pointer bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700
                                    ${student.hasPendingInvite ? 'hover:border-purple-500/30' : 'hover:border-blue-500/30'}`}
                                >
                                    {/* Avatar */}
                                    <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-slate-700">
                                        {student.photo ? (
                                            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                                                {student.name.substring(0, 2)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-white text-base truncate">{student.name}</h3>
                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 rounded uppercase tracking-wider border border-blue-500/20">
                                                {student.domain}
                                            </span>
                                        </div>
                                        <div className="text-slate-400 text-sm truncate flex items-center gap-2 mt-0.5">
                                            <span className="font-medium text-slate-300">{student.grade || "N/A"}</span>
                                            <span className="text-slate-600">•</span>
                                            <span className="truncate">{student.faculty || "N/A"}</span>
                                            {student.dateOfBirth && (
                                                <>
                                                    <span className="text-slate-600">•</span>
                                                    <span className="font-bold text-slate-300">{calculateAge(student.dateOfBirth)} ans</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status/Action */}
                                    <div className="flex items-center gap-2">
                                        {student.hasPendingInvite ? (
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold">
                                                <CheckCircle size={14} /> <span className="hidden sm:inline">Invitation envoyée</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setViewingStudent(student);
                                                    setShowInviteModal(true);
                                                }}
                                                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-500/20"
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
                                className={`group relative bg-gradient-to-br from-slate-800/60 to-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 sm:p-6 cursor-pointer hover:border-white/20 transition-all duration-300 hover:-translate-y-2 overflow-hidden
                                ${student.hasPendingInvite
                                        ? 'hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)]'
                                        : 'hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]'}`}
                            >
                                {/* Background Blob Effect */}
                                <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] opacity-30 transition-colors duration-700 pointer-events-none 
                                ${student.hasPendingInvite ? 'bg-purple-600' : 'bg-blue-600'}`}>
                                </div>

                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Card Content Top */}
                                    <div className="mb-4 flex-1">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <div className="relative shrink-0">
                                                <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-500 transform group-hover:scale-105
                                                ${student.hasPendingInvite
                                                        ? 'border-purple-500/50 shadow-purple-500/30'
                                                        : 'border-blue-500/50 shadow-blue-500/30'}`}>
                                                    {student.photo ? (
                                                        <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xl">
                                                            {student.name.substring(0, 2)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status Icon Indicator */}
                                                <div className={`absolute -bottom-3 -right-3 w-8 h-8 rounded-full border-4 border-slate-900 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110
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
                                                <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all mb-1 truncate">
                                                    {student.name}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-blue-300 text-xs font-bold uppercase tracking-wider truncate bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                                        {student.domain}
                                                    </span>
                                                    {student.dateOfBirth && (
                                                        <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                                            • {calculateAge(student.dateOfBirth)} ans
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 text-center sm:text-left transition-colors group-hover:border-white/10">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Niveau</p>
                                            <p className="text-slate-200 text-sm font-bold truncate">{student.grade || "N/A"}</p>
                                        </div>
                                        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 text-center sm:text-left transition-colors group-hover:border-white/10">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Établissement</p>
                                            <p className="text-slate-200 text-sm font-bold break-words leading-tight line-clamp-2" title={student.faculty}>
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
                                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn
                                            ${student.hasPendingInvite
                                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 cursor-default'
                                                    : 'bg-white text-slate-900 hover:bg-blue-50 border border-white/10 hover:border-transparent hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]'}`}
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
            {viewingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setViewingStudent(null)}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white/70 hover:text-white rounded-full transition-colors z-10"
                        >
                            <XCircle size={24} />
                        </button>

                        <div className="relative">
                            {/* Cover Background */}
                            <div className="h-32 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-50"></div>

                            <div className="px-8 flex items-end -mt-12 relative z-0">
                                <div className="w-24 h-24 rounded-2xl bg-slate-900 p-1">
                                    <div className="w-full h-full rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                                        {viewingStudent.photo ? (
                                            <img src={viewingStudent.photo} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold bg-slate-800">
                                                {viewingStudent.name.substring(0, 2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4 mb-2">
                                    <h2 className="text-2xl font-bold text-white">{viewingStudent.name}</h2>
                                    <p className="text-slate-400 text-sm flex items-center gap-1.5">
                                        <GraduationCap size={14} className="text-blue-500" /> {viewingStudent.domain}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                            {/* Academic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                            <Briefcase size={18} />
                                        </div>
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Niveau</span>
                                    </div>
                                    <p className="text-white font-medium pl-1">{viewingStudent.grade}</p>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                            <MapPin size={18} />
                                        </div>
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Établissement</span>
                                    </div>
                                    <p className="text-white font-medium pl-1">{viewingStudent.faculty}</p>
                                </div>
                                {viewingStudent.dateOfBirth && (
                                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60 col-span-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                                <Calendar size={18} />
                                            </div>
                                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Âge</span>
                                        </div>
                                        <p className="text-white font-medium pl-1">{calculateAge(viewingStudent.dateOfBirth)} ans</p>
                                    </div>
                                )}
                            </div>

                            {/* Documents Section */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    Documents
                                    <div className="h-px bg-slate-800 flex-1"></div>
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* CV Section */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-white text-sm flex items-center gap-2">
                                                <BookOpen size={16} className="text-blue-500" /> CV (Curriculum Vitae)
                                            </p>
                                            {viewingStudent.cvUrl && (
                                                <a href={viewingStudent.cvUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                                                    <ExternalLink size={12} /> Mode Grand
                                                </a>
                                            )}
                                        </div>

                                        {viewingStudent.cvUrl ? (
                                            <div className="h-80 w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative group">
                                                <iframe
                                                    src={viewingStudent.cvUrl}
                                                    className="w-full h-full object-contain bg-white"
                                                    title="CV Preview"
                                                />
                                                <a
                                                    href={viewingStudent.cvUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                >
                                                    <span className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                        <ExternalLink size={16} /> Ouvrir le document
                                                    </span>
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="h-80 w-full bg-slate-950/50 border border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-500 gap-2">
                                                <BookOpen size={32} className="opacity-20" />
                                                <span className="text-sm italic">CV non disponible</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Diploma Section */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-white text-sm flex items-center gap-2">
                                                <GraduationCap size={16} className="text-pink-500" /> Diplôme / Notes
                                            </p>
                                            {viewingStudent.diplomaUrl && (
                                                <a href={viewingStudent.diplomaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors">
                                                    <ExternalLink size={12} /> Mode Grand
                                                </a>
                                            )}
                                        </div>

                                        {viewingStudent.diplomaUrl ? (
                                            <div className="h-80 w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative group">
                                                <iframe
                                                    src={viewingStudent.diplomaUrl}
                                                    className="w-full h-full object-contain bg-white"
                                                    title="Diploma Preview"
                                                />
                                                <a
                                                    href={viewingStudent.diplomaUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                >
                                                    <span className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                        <ExternalLink size={16} /> Ouvrir le document
                                                    </span>
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="h-80 w-full bg-slate-950/50 border border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-500 gap-2">
                                                <FileText size={32} className="opacity-20" />
                                                <span className="text-sm italic">Diplôme non disponible</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm flex gap-4">
                            {viewingStudent.hasPendingInvite ? (
                                <button
                                    disabled
                                    className="w-full py-4 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed uppercase tracking-wider text-sm"
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
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Modal (Select Job) */}
            {showInviteModal && viewingStudent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
                        <button
                            onClick={() => setShowInviteModal(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <XCircle size={24} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                <Briefcase size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Convoquer {viewingStudent.name}</h3>
                            <p className="text-slate-400 text-sm">
                                Sélectionnez l'offre pour laquelle vous souhaitez inviter ce candidat.
                            </p>
                        </div>

                        <div className="space-y-3 mb-8 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                            {jobOffers.length === 0 ? (
                                <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                                    Aucune offre active disponible. <br /> Veuillez d'abord créer ou réactiver une offre.
                                </div>
                            ) : (
                                jobOffers.map(job => (
                                    <div
                                        key={job.id}
                                        onClick={() => setSelectedJobId(job.id)}
                                        className={`group p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center relative overflow-hidden
                                            ${selectedJobId === job.id
                                                ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20'
                                                : 'bg-slate-950 border-slate-800 hover:border-slate-600 hover:bg-slate-900'}`}
                                    >
                                        <div className="relative z-10">
                                            <p className={`text-sm font-bold ${selectedJobId === job.id ? 'text-white' : 'text-slate-200'}`}>{job.title}</p>
                                            <p className={`text-xs mt-1 ${selectedJobId === job.id ? 'text-blue-100' : 'text-slate-500'}`}>{job.type} • {job.location}</p>
                                        </div>
                                        {selectedJobId === job.id && (
                                            <div className="bg-white text-blue-600 p-1.5 rounded-full shadow-sm relative z-10">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={handleInvite}
                            disabled={!selectedJobId || inviting}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            {inviting ? <Loader2 size={20} className="animate-spin" /> : "Envoyer l'invitation"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

