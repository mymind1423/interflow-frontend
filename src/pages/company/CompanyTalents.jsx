import { useState, useEffect } from "react";
import { companyApi } from "../../api/companyApi";
import { Search, MapPin, BookOpen, Briefcase, User, GraduationCap, ArrowRight, Eye, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function CompanyTalents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDomain, setFilterDomain] = useState("all");
    const [filterGrade, setFilterGrade] = useState("all");
    const [jobOffers, setJobOffers] = useState([]);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState("");

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

        try {
            await companyApi.inviteStudent(viewingStudent.id, selectedJobId);
            toast.success(`Invitation envoyée à ${viewingStudent.name} !`);
            setShowInviteModal(false);
            setViewingStudent(null);
        } catch (err) {
            toast.error("Erreur lors de l'invitation.");
            console.error(err);
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
    const domains = ["all", ...new Set(students.map(s => s.domain).filter(Boolean))];
    const grades = ["all", ...new Set(students.map(s => s.grade).filter(Boolean))];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <User className="text-blue-500" /> Vivier de Talents
            </h1>
            <p className="text-slate-400 mb-8">Parcourez les profils des étudiants et invitez-les à postuler.</p>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, domaine..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <select
                    value={filterDomain}
                    onChange={(e) => setFilterDomain(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                    <option value="all">Tous les domaines</option>
                    {domains.filter(d => d !== "all").map(domain => (
                        <option key={domain} value={domain}>{domain}</option>
                    ))}
                </select>
                <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                    <option value="all">Tous les niveaux</option>
                    {grades.filter(g => g !== "all").map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                    ))}
                </select>
            </div>

            {/* Students Grid */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Chargement...</div>
            ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 border border-slate-800 border-dashed rounded-2xl">
                    <User size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">Aucun étudiant ne correspond à vos critères.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(student => (
                        <div key={student.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/10 group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                                    {student.photo ? (
                                        <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xl font-bold">
                                            {student.name.substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div className="bg-slate-950 px-2 py-1 rounded text-xs font-mono text-slate-400 border border-slate-800">
                                    {student.grade || "N/A"}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{student.name}</h3>
                            <p className="text-sm text-slate-400 mb-4 flex items-center gap-1.5">
                                <GraduationCap size={14} /> {student.domain}
                            </p>

                            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-4 mt-auto">
                                <span>{student.faculty || "Faculté inconnue"}</span>
                                <span className={student.hasApplied ? "text-blue-500 flex items-center gap-1" : (student.applicationCount > 0 ? "text-emerald-500" : "")}>
                                    {student.hasApplied ? <><CheckCircle size={12} /> A postulé</> : (student.applicationCount > 0 ? "Déjà actif" : "Nouveau")}
                                </span>
                            </div>

                            <button
                                onClick={() => setViewingStudent(student)}
                                className={`w-full mt-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2
                                    ${student.hasApplied
                                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20'
                                        : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                            >
                                <Eye size={16} /> {student.hasApplied ? "Voir Profil & Candidature" : "Voir Profil"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Student Detail Modal */}
            {viewingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                                    {viewingStudent.photo ? (
                                        <img src={viewingStudent.photo} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                                            {viewingStudent.name.substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{viewingStudent.name}</h2>
                                    <p className="text-blue-400">{viewingStudent.domain}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-white"><XCircle size={24} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Niveau</p>
                                    <p className="text-white">{viewingStudent.grade}</p>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Faculté</p>
                                    <p className="text-white">{viewingStudent.faculty}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">Documents</h3>
                                <div className="flex flex-col gap-2">
                                    {viewingStudent.cvUrl ? (
                                        <a href={viewingStudent.cvUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors group">
                                            <span className="flex items-center gap-2 text-slate-300"><BookOpen size={18} className="text-purple-500" /> CV (Curriculum Vitae)</span>
                                            <ArrowRight size={16} className="text-slate-500 group-hover:text-white" />
                                        </a>
                                    ) : (
                                        <div className="p-3 bg-slate-800/50 rounded-xl text-slate-500 italic">CV non disponible</div>
                                    )}

                                    {viewingStudent.diplomaUrl ? (
                                        <a href={viewingStudent.diplomaUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors group">
                                            <span className="flex items-center gap-2 text-slate-300"><GraduationCap size={18} className="text-pink-500" /> Diplôme / Relevé de notes</span>
                                            <ArrowRight size={16} className="text-slate-500 group-hover:text-white" />
                                        </a>
                                    ) : (
                                        <div className="p-3 bg-slate-800/50 rounded-xl text-slate-500 italic">Diplôme non disponible</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-800 bg-slate-950 flex gap-3">
                            <button onClick={() => setViewingStudent(null)} className="flex-1 py-3 text-slate-400 hover:text-white font-medium">Fermer</button>
                            {viewingStudent.hasApplied ? (
                                <button
                                    onClick={() => {
                                        // Redirect to applications page? Or just close and say they are applied.
                                        // The user wanted "voir candidature". I don't have a direct link to a specific app modal easily without complex state in App.jsx.
                                        // For now, I'll redirect to the applications page.
                                        window.location.href = "/company-applications";
                                    }}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={20} className="text-blue-500" /> Voir Candidature
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <Briefcase size={20} /> Convoquer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Modal (Select Job) */}
            {showInviteModal && viewingStudent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
                        <h3 className="text-xl font-bold text-white mb-2">Convoquer {viewingStudent.name}</h3>
                        <p className="text-slate-400 mb-6 text-sm">Sélectionnez l'offre pour laquelle vous souhaitez inviter ce candidat. Cela créera automatiquement un entretien.</p>

                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                            {jobOffers.length === 0 ? (
                                <p className="text-red-400 text-sm text-center">Aucune offre active disponible (ou quota atteint).</p>
                            ) : (
                                jobOffers.map(job => (
                                    <div
                                        key={job.id}
                                        onClick={() => setSelectedJobId(job.id)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center
                                            ${selectedJobId === job.id
                                                ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500'
                                                : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-white">{job.title}</p>
                                            <p className="text-xs text-slate-500">{job.type}</p>
                                        </div>
                                        {selectedJobId === job.id && <CheckCircle size={16} className="text-blue-500" />}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="flex-1 py-2.5 text-slate-400 hover:text-white font-medium bg-slate-800 rounded-xl"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleInvite}
                                disabled={!selectedJobId}
                                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Envoyer l'invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

