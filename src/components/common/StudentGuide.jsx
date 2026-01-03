import { useState, useEffect } from "react";

import { HelpCircle, X, ChevronRight, BookOpen, User, Briefcase, Calendar, CheckCircle, Ticket } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

// Simple event bus for opening the guide
export const openStudentGuide = () => {
    window.dispatchEvent(new CustomEvent('open-student-guide'));
};

export default function StudentGuide() {
    const [isOpen, setIsOpen] = useState(false);

    // Listen for the custom event
    useEffect(() => {
        console.log("StudentGuide: Component Mounted");
        const handleOpen = () => {
            console.log("StudentGuide: Event received");
            setIsOpen(true);
        };
        window.addEventListener('open-student-guide', handleOpen);
        return () => window.removeEventListener('open-student-guide', handleOpen);
    }, []);


    const [activeTab, setActiveTab] = useState(0);

    const steps = [
        {
            title: "Vos Débuts",
            icon: BookOpen,
            content: "Bienvenue sur InternFlow ! Commencez par compléter votre profil avec votre CV et vos compétences. C'est la première chose que les recruteurs verront."
        },
        {
            title: "Trouver un Emploi",

            icon: Briefcase,
            content: "Rendez-vous sur la page 'Offres' pour explorer les opportunités. Utilisez les filtres pour trouver le poste idéal et postulez en un clic. Vous pouvez aussi sauvegarder des offres pour plus tard."

        },
        {
            title: "Les Jetons",
            icon: Ticket,
            content: "Vous disposez de 5 jetons de candidature. Chaque candidature coûte 1 jeton. Si une entreprise vous répond (Invitation ou Refus), vous récupérez votre jeton ! Choisissez bien."
        },
        {
            title: "Suivre vos Candidatures",
            icon: User,
            content: "Consultez l'état de vos candidatures dans l'onglet 'Candidatures'. Vous verrez si vous êtes retenu pour un entretien ou si votre profil a été consulté."
        },
        {
            title: "Gérer vos Entretiens",
            icon: Calendar,
            content: "Si une entreprise vous invite, l'entretien apparaîtra dans 'Entretiens'. Le jour J, utilisez le bouton 'Je suis là' (Check-in) pour confirmer votre présence."
        },
        {
            title: "Le Jour J",
            icon: CheckCircle,
            content: "Soyez à l'heure ! Présentez votre Badge (QR Code) à l'entrée si nécessaire. Après l'entretien, vous pourrez voir le feedback du recruteur."
        }
    ];

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-blue-600 hover:bg-blue-500 text-white p-3 md:p-4 rounded-full shadow-2xl shadow-blue-600/30 z-[60] flex items-center justify-center group"
            >
                <HelpCircle size={28} />
                <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
                    Guide Étudiant
                </span>
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
                        >
                            {/* Header */}
                            <div className="p-6 bg-gradient-to-r from-blue-900 to-slate-900 border-b border-slate-700 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/10 p-2 rounded-xl">
                                        <BookOpen className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Guide Étudiant</h2>
                                        <p className="text-blue-200 text-sm">Comment réussir sur InternFlow</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex flex-col md:flex-row h-full overflow-hidden">
                                {/* Sidebar Tabs */}
                                <div className="w-full md:w-1/3 bg-slate-950/50 border-r border-slate-800 p-2 overflow-y-auto hidden md:flex flex-col gap-1">
                                    {steps.map((step, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveTab(index)}
                                            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === index
                                                ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                                                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                                                }`}
                                        >
                                            <step.icon size={18} className={activeTab === index ? "text-blue-400" : "text-slate-500"} />
                                            <span className="font-bold text-sm truncate">{step.title}</span>
                                            {activeTab === index && <ChevronRight size={14} className="ml-auto" />}
                                        </button>
                                    ))}
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-900">
                                    {/* Mobile Tabs (Horizontal) */}
                                    <div className="flex md:hidden gap-2 overflow-x-auto pb-4 mb-4 snap-x">
                                        {steps.map((step, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setActiveTab(index)}
                                                className={`snap-center shrink-0 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === index
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                    : "bg-slate-800 text-slate-400"
                                                    }`}
                                            >
                                                {step.title}
                                            </button>
                                        ))}
                                    </div>

                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="h-full flex flex-col justify-center"
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 mx-auto md:mx-0">
                                            {(() => {
                                                const Icon = steps[activeTab].icon;
                                                return <Icon size={32} className="text-white" />;
                                            })()}
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-4 text-center md:text-left">
                                            {steps[activeTab].title}
                                        </h3>
                                        <p className="text-slate-300 text-lg leading-relaxed text-center md:text-left">
                                            {steps[activeTab].content}
                                        </p>

                                        {/* Simplified Navigation Buttons for Content */}
                                        <div className="mt-8 flex justify-between pt-6 border-t border-slate-800">
                                            <button
                                                onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                                                disabled={activeTab === 0}
                                                className="text-slate-500 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 font-bold text-sm flex items-center gap-2"
                                            >
                                                Précédent
                                            </button>

                                            {activeTab < steps.length - 1 ? (
                                                <button
                                                    onClick={() => setActiveTab(Math.min(steps.length - 1, activeTab + 1))}
                                                    className="bg-white text-slate-900 hover:bg-blue-50 px-5 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                                                >
                                                    Suivant <ChevronRight size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setIsOpen(false)}
                                                    className="bg-green-500 hover:bg-green-400 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-green-500/20"
                                                >
                                                    C'est compris !
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
