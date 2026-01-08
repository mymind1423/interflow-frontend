import { Home, Search, Briefcase, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: "Accueil", icon: Home, path: "/dashboard" },
        { label: "Recherche", icon: Search, path: "/jobs" },
        { label: "Candidatures", icon: Briefcase, path: "/applications" },
        { label: "Profil", icon: User, path: "/profile" },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 z-[100] pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(item.path)
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                    >
                        <item.icon size={20} className={isActive(item.path) ? "fill-current/10" : ""} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
