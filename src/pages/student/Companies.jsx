import { useState, useEffect } from "react";
import { studentApi } from "../../api/studentApi";
import { Search, MapPin, Building, Globe, Filter, ExternalLink, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import CompanyDrawer from "../../components/modals/CompanyDrawer";

export default function Companies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const data = await studentApi.getCompanies();
            setCompanies(data);
        } catch (error) {
            console.error("Failed to fetch companies", error);
            toast.error("Erreur lors du chargement des entreprises");
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter((company) =>
        company.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.domaine?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col min-h-screen pb-24 relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[128px]" />
            </div>

            {/* Header & Search */}
            <div className="mb-8 sm:mb-10 space-y-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
                        Réseau Entreprises
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Partenaires</h1>
                    <p className="text-slate-400 text-base sm:text-lg mt-2">Découvrez les entreprises qui recrutent et trouvez votre futur chez-vous.</p>
                </div>

                <div className="relative group max-w-2xl">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-purple-600 rounded-2xl opacity-20 blur transition duration-500 group-hover:opacity-40"></div>
                    <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                        <Search className="ml-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="Rechercher une entreprise par nom, domaine..."
                            className="w-full bg-transparent border-none text-white px-3 sm:px-4 py-3 sm:py-4 focus:outline-none font-medium placeholder:text-slate-500 text-base sm:text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 size={48} className="text-sky-500 animate-spin" />
                </div>
            ) : filteredCompanies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map((company) => (
                        <div
                            key={company.id}
                            onClick={() => setSelectedCompany(company)}
                            className="relative group bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-5 sm:p-6 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-900/10 cursor-pointer overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute -inset-px border border-transparent group-hover:border-sky-500/20 rounded-3xl transition-colors duration-500 pointer-events-none" />

                            <div className="relative z-10 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
                                        {company.logoUrl ? (
                                            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building className="text-slate-500" size={32} />
                                        )}
                                    </div>
                                    <div className="bg-slate-800/50 p-2 rounded-full border border-white/5 group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-colors">
                                        <ExternalLink size={20} />
                                    </div>
                                </div>

                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                                    {company.name || company.displayName}
                                </h3>

                                <div className="space-y-3 mt-4 text-sm font-medium text-slate-400 mb-6 flex-1">
                                    {company.domaine && (
                                        <span className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-sky-500 shrink-0">
                                                <Globe size={16} />
                                            </div>
                                            {company.domaine}
                                        </span>
                                    )}
                                    {company.address && (
                                        <span className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-emerald-500 shrink-0">
                                                <MapPin size={16} />
                                            </div>
                                            <span className="truncate">{company.address}</span>
                                        </span>
                                    )}
                                </div>

                                <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-sky-600 text-white font-bold transition-all border border-white/5 hover:border-sky-500/30">
                                    Voir les offres
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-800/50 backdrop-blur-sm">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-4 ring-slate-800/20">
                        <Building size={48} className="opacity-50" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-2">Aucune entreprise trouvée</p>
                    <p className="text-slate-400">Essayez de modifier votre recherche.</p>
                </div>
            )}

            <CompanyDrawer
                company={selectedCompany}
                isOpen={!!selectedCompany}
                onClose={() => setSelectedCompany(null)}
            />
        </div>
    );
}


