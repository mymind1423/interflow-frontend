import { XCircle, GraduationCap, Briefcase, MapPin, Calendar, BookOpen, FileText, ExternalLink } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { calculateAge } from "../../utils/dateUtils";

export default function StudentDetailModal({ student, onClose, children }) {
    const { theme } = useTheme();

    if (!student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className={`border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative
                ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-red-500 rounded-full transition-colors z-10"
                >
                    <XCircle size={24} />
                </button>

                <div className="relative">
                    {/* Cover Background */}
                    <div className={`h-32 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'}`}></div>

                    <div className="px-8 flex items-end -mt-12 relative z-0">
                        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-700 shadow-xl p-1">
                            <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-600 overflow-hidden">
                                {student.photo || student.studentPhoto ? (
                                    <img src={student.photo || student.studentPhoto} className="w-full h-full object-cover" alt={student.name || student.studentName} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-300 font-bold text-2xl">
                                        {(student.name || student.studentName || "?").substring(0, 2)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="ml-4 mb-2">
                            <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{student.name || student.studentName}</h2>
                            <p className={`text-sm font-bold flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                <GraduationCap size={14} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} /> {student.domain || student.studentDomaine}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={`p-8 overflow-y-auto space-y-8 custom-scrollbar ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    {/* Academic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-2xl border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                    <Briefcase size={18} />
                                </div>
                                <span className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Niveau</span>
                            </div>
                            <p className={`font-bold pl-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{student.grade || student.studentGrade}</p>
                        </div>
                        <div className={`p-4 rounded-2xl border shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                                    <MapPin size={18} />
                                </div>
                                <span className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Établissement</span>
                            </div>
                            <p className={`font-bold pl-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{student.faculty || student.studentFaculty}</p>
                        </div>
                        {(student.dateOfBirth || student.studentDateOfBirth) && (
                            <div className={`p-4 rounded-2xl border shadow-sm col-span-2 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-pink-50 rounded-lg text-pink-500">
                                        <Calendar size={18} />
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Âge</span>
                                </div>
                                <p className={`font-bold pl-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{calculateAge(student.dateOfBirth || student.studentDateOfBirth)} ans</p>
                            </div>
                        )}
                        {student.email && (
                            <div className={`p-4 rounded-2xl border shadow-sm col-span-2 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-violet-50 rounded-lg text-violet-500">
                                        <ExternalLink size={18} />
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Email</span>
                                </div>
                                <p className={`font-bold pl-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{student.email}</p>
                            </div>
                        )}
                    </div>

                    {/* Documents Section */}
                    <div>
                        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Documents
                            <div className={`h-px flex-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* CV Section */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className={`font-bold text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                        <BookOpen size={16} className="text-blue-500" /> CV (Curriculum Vitae)
                                    </p>
                                    {student.cvUrl && (
                                        <a href={student.cvUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors">
                                            <ExternalLink size={12} /> Mode Grand
                                        </a>
                                    )}
                                </div>

                                {student.cvUrl ? (
                                    <div className="h-80 w-full bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden relative group shadow-sm">
                                        <iframe
                                            src={student.cvUrl}
                                            className="w-full h-full object-contain bg-white dark:bg-slate-800"
                                            title="CV Preview"
                                        />
                                        <a
                                            href={student.cvUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm"
                                        >
                                            <span className="bg-white text-blue-600 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                <ExternalLink size={16} /> Ouvrir le document
                                            </span>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="h-80 w-full bg-white/5 border border-white/10 border-dashed rounded-xl flex flex-col items-center justify-center text-theme-secondary gap-2">
                                        <BookOpen size={32} className="opacity-20" />
                                        <span className="text-sm font-medium">CV non disponible</span>
                                    </div>
                                )}
                            </div>

                            {/* Diploma Section */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className={`font-bold text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                        <GraduationCap size={16} className="text-pink-500" /> Diplôme / Notes
                                    </p>
                                    {student.diplomaUrl && (
                                        <a href={student.diplomaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-pink-500 hover:text-pink-700 transition-colors">
                                            <ExternalLink size={12} /> Mode Grand
                                        </a>
                                    )}
                                </div>

                                {student.diplomaUrl ? (
                                    <div className="h-80 w-full bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden relative group shadow-sm">
                                        <iframe
                                            src={student.diplomaUrl}
                                            className="w-full h-full object-contain bg-white dark:bg-slate-800"
                                            title="Diploma Preview"
                                        />
                                        <a
                                            href={student.diplomaUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="absolute inset-0 bg-pink-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm"
                                        >
                                            <span className="bg-white text-pink-600 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                <ExternalLink size={16} /> Ouvrir le document
                                            </span>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="h-80 w-full bg-white/5 border border-white/10 border-dashed rounded-xl flex flex-col items-center justify-center text-theme-secondary gap-2">
                                        <FileText size={32} className="opacity-20" />
                                        <span className="text-sm font-medium">Diplôme non disponible</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                {children && (
                    <div className={`p-6 border-t flex gap-4 ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
