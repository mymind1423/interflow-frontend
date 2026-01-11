import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext";

export default function ProfileCompletion({ profile }) {
    const { user } = useAuth();
    // Mock calculation - In real app, check profile fields
    // Fields to check: fullname, bio, cvUrl, skills, experience
    let score = 0;
    let nextStep = "Compléter votre profil";
    let link = user?.userType === 'company' ? "/company-profile" : "/profile";

    if (profile) {
        if (profile.fullname) score += 20;
        if (profile.email) score += 20; // assumed
        if (profile.bio) score += 20;
        if (profile.cvUrl) score += 20;
        else nextStep = "Ajouter votre CV";
        if (profile.skills && profile.skills.length > 0) score += 20;
        else if (score >= 60 && !profile.cvUrl) nextStep = "Ajouter vos compétences";
    }

    // Ring calculation
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    if (score === 100) return null; // Don't show if complete? Or show success.

    return (
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group">
            <div className="flex items-center gap-4 z-10">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-slate-100 dark:text-white/10"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="text-blue-500 transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <span className="absolute text-xs font-bold text-blue-600">{score}%</span>
                </div>

                <div>
                    <h4 className="font-bold text-theme-primary text-sm mb-0.5">Niveau de profil</h4>
                    <p className="text-xs text-theme-secondary flex items-center gap-1">
                        🚀 {nextStep}
                    </p>
                </div>
            </div>

            <Link to={link} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors z-10">
                <ChevronRight size={20} />
            </Link>

            {/* Background decoration */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
        </div>
    );
}
