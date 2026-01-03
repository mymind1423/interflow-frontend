import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Heart, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Column 1: Brand */}
                    <div className="space-y-6">
                        <Link to="/" className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                I
                            </div>
                            <span className="text-white">Intern<span className="text-blue-500">Flow</span></span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            La plateforme numéro 1 pour connecter les étudiants talentueux aux meilleures entreprises. <br />
                            Simplifiez vos recrutements et vos recherches d'emploi.

                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={Facebook} href="#" />
                            <SocialIcon icon={Twitter} href="#" />
                            <SocialIcon icon={Instagram} href="#" />
                            <SocialIcon icon={Linkedin} href="#" />
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Navigation</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Tableau de bord</Link></li>
                            <li><Link to="/companies" className="hover:text-blue-400 transition-colors">Entreprises</Link></li>
                            <li><Link to="/applications" className="hover:text-blue-400 transition-colors">Mes Candidatures</Link></li>
                            <li><Link to="/saved-jobs" className="hover:text-blue-400 transition-colors">Offres Sauvegardées</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Legal / Help */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Aide & Légal</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link to="#" className="hover:text-blue-400 transition-colors">Centre d'aide</Link></li>
                            <li><Link to="#" className="hover:text-blue-400 transition-colors">Conditions d'utilisation</Link></li>
                            <li><Link to="#" className="hover:text-blue-400 transition-colors">Politique de confidentialité</Link></li>
                            <li><Link to="#" className="hover:text-blue-400 transition-colors">Nous contacter</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <Mail size={16} className="mt-1 text-blue-500 shrink-0" />
                                <span>contact@internflow.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone size={16} className="mt-1 text-blue-500 shrink-0" />
                                <span>+253 77 00 00 00</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin size={16} className="mt-1 text-blue-500 shrink-0" />
                                <span>Universite de Djibouti, Campus de Balbala</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-900 mb-8" />

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} InternFlow. Tous droits réservés.</p>
                    <div className="flex items-center gap-2">
                        <span>Fait avec</span>
                        <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" />
                        <span>à Djibouti</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon: Icon, href }) {
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-600/20"
        >
            <Icon size={18} />
        </a>
    );
}
