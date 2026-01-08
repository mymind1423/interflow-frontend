import { useState, useEffect } from "react";
import { HelpCircle, X, ChevronRight, BookOpen, Users, Briefcase, Calendar, CheckCircle, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Simple event bus for opening the company guide
export const openCompanyGuide = () => {
    window.dispatchEvent(new CustomEvent('open-company-guide'));
};

export default function CompanyGuide() {
    const [isOpen, setIsOpen] = useState(false);

    // Listen for the custom event
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-company-guide', handleOpen);
        return () => window.removeEventListener('open-company-guide', handleOpen);
    }, []);


    const [activeTab, setActiveTab] = useState(0);

    const steps = [
        {
            title: "Votre Marque",
            icon: Building,
            content: "Complétez votre profil entreprise avec soin. Logo, description, site web... C'est votre vitrine pour attirer les meilleurs étudiants."
        },
        {
            title: "Publier des Offres",
            icon: Briefcase,
            content: "Créez des offres d'emploi ou de stage détaillées. Précisez les compétences requises. Vous pouvez définir des quotas d'entretien pour limiter le flux."
        },
        {
            title: "Chasser les Talents",
            icon: Users,
            content: "N'attendez pas ! Parcourez la CV-thèque dans l'onglet 'Talents'. Filtrez par compétences et invitez directement les profils qui vous intéressent."
        },
        {
            title: "Gérer les Candidatures",
            icon: BookOpen,
            content: "Traitez les candidatures rapidement. Acceptez, Rejetez ou Invitez les étudiants. Rappel : Répondre aux étudiants leur permet de récupérer leurs jetons !"
        },
        {
            title: "Les Entretiens",
            icon: Calendar,
            content: "Gérez votre calendrier d'entretiens. Le jour J, validez la présence du candidat via son QR Code pour confirmer l'entretien."
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
                    Guide Entreprise
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
                            className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
                        >
                            {/* Header */}
                            <div className="p-6 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 backdrop-blur-md border-b border-theme-secondary/10 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-600 dark:bg-blue-500/20 p-2 rounded-xl">
                                        <Building className="text-white dark:text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-theme-primary">Guide Entreprise</h2>
                                        <p className="text-blue-600 dark:text-blue-300 text-sm">Optimisez votre recrutement</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-theme-secondary hover:text-theme-primary transition-colors bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 p-2 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex flex-col md:flex-row h-full overflow-hidden bg-transparent transition-colors">
                                {/* Sidebar Tabs */}
                                <div className="w-full md:w-1/3 bg-slate-50/50 dark:bg-black/10 border-r border-slate-200/50 dark:border-white/10 p-2 overflow-y-auto hidden md:flex flex-col gap-1">
                                    {steps.map((step, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveTab(index)}
                                            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === index
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                : "text-gray-600 hover:bg-white/50 hover:text-blue-600"

                                                }`}
                                        >
                                            <step.icon size={18} className={activeTab === index ? "text-white" : "text-current opacity-70"} />
                                            <span className="font-bold text-sm truncate">{step.title}</span>
                                            {activeTab === index && <ChevronRight size={14} className="ml-auto" />}
                                        </button>
                                    ))}
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-transparent">
                                    {/* Mobile Tabs (Horizontal) */}
                                    <div className="flex md:hidden gap-2 overflow-x-auto pb-4 mb-4 snap-x no-scrollbar">
                                        {steps.map((step, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setActiveTab(index)}
                                                className={`snap-center shrink-0 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === index
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
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
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 text-center md:text-left">
                                            {steps[activeTab].title}
                                        </h3>
                                        <p className="text-gray-600 text-lg leading-relaxed text-center md:text-left">
                                            {steps[activeTab].content}
                                        </p>

                                        {/* Simplified Navigation Buttons for Content */}
                                        <div className="mt-8 flex justify-between pt-6 border-t border-theme-secondary/10">
                                            <button
                                                onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                                                disabled={activeTab === 0}
                                                className="text-theme-secondary hover:text-theme-primary disabled:opacity-30 disabled:hover:text-theme-secondary font-bold text-sm flex items-center gap-2"
                                            >
                                                Précédent
                                            </button>

                                            {activeTab < steps.length - 1 ? (
                                                <button
                                                    onClick={() => setActiveTab(Math.min(steps.length - 1, activeTab + 1))}
                                                    className="bg-theme-secondary/10 hover:bg-theme-secondary/20 text-theme-primary px-5 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
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
