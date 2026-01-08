import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, FileText, Shield, Upload, MapPin, Phone,
    Briefcase, GraduationCap, Check, Camera, Building, Mail, Lock, AlertCircle, Sparkles, Trash2, Eye, EyeOff, ExternalLink, Loader2, Calendar
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../authContext"; // Adjusted path
import { profileApi } from "../../api/profileApi"; // Adjusted path
import AICoachModal from "../../components/modals/AICoachModal"; // Adjusted path
import { apiFetch } from "../../api/client"; // Adjusted path
import { ProfileHeader, TabItem, SecurityTab, ModernProgressBar, DocumentCard } from "./ProfileComponents"; // Assuming shared components

// --- Student Specific Data ---
const grades = ["BAC", "BAC+2", "Licence", "Master", "Ingénieur", "Doctorat"];

const facultiesData = {
    "Faculté de Droit, d'Économie et de Gestion (FDEG)": [
        "Droit et Gestion des Entreprises (DGE)",
        "Droit (Droit)",
        "Économie et Gestion (EG)",
        "Bachelor in Business Administration, spécialité Finances des entreprises (BBA)"
    ],
    "Faculté des Lettres, Langues et Sciences Humaines (FLLSH)": [
        "Anglais (AS)",
        "Lettres Arabes et Medias (LAM)",
        "Lettres Modernes (LM)",
        "Histoire - Géographie (HG)",
        "Sciences et Techniques de l'Information et de la Communication (STIC)"
    ],
    "Faculté des Sciences (FS)": [
        "Biologie & Géologie (BG)",
        "Mathématiques (Math)",
        "Informatique (Info)",
        "Physique & Chimie (PC)"
    ],
    "Faculté de Médecine (FM)": [
        "Médecine Générale",
        "Soins Infirmiers",
        "Pharmacie"
    ],
    "Faculté d'Ingénieurs (FI)": [
        "Génie Civil",
        "Génie Électrique"
    ],
    "Institut Universitaire de Technologie Tertiaire (IUT-T)": [
        "Logistique & Transport (LALT)",
        "Commerce International (LACI)",
        "Entreprenariat et Innovation (LAEI)",
        "Métiers de la comptabilité, spécialité révision comptable (LPMC)",
        "Gestion Commerciale en Arabe (LAGCA)"
    ],
    "Institut Universitaire de Technologie Industrielle (IUT-I)": [
        "Systèmes d’Information Géographique (SIG)",
        "Énergétique et Énergie Renouvelable (EER)",
        "Maintenance Industrielle (MI)",
        "Bases de Données et Logiciels (BDL)",
        "Réseaux et Télécom (RT)"
    ]
};

export default function StudentProfile({ user, profile, setProfile, isEditing, setIsEditing, reloadUser }) {
    const [activeTab, setActiveTab] = useState("info");

    // AI Coach State
    const [isCoachOpen, setIsCoachOpen] = useState(false);
    const [isCoachLoading, setIsCoachLoading] = useState(false);
    const [coachAnalysis, setCoachAnalysis] = useState(null);

    // Upload State
    const [uploadingType, setUploadingType] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const startCoachAnalysis = () => {
        setIsCoachOpen(true);
        if (!coachAnalysis) {
            setIsCoachLoading(true);
            apiFetch("/api/ai/analyze-profile", { method: "POST" })
                .then((data) => {
                    setCoachAnalysis(data);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("Impossible de lancer l'analyse IA");
                    setIsCoachOpen(false);
                })
                .finally(() => {
                    setIsCoachLoading(false);
                });
        }
    };

    const handleFileUpload = async (type, file) => {
        if (!file) return;
        setUploadingType(type);
        setUploadProgress(0);

        try {
            let data;
            const onProgress = (percent) => setUploadProgress(percent);

            if (type === "cv") data = await profileApi.uploadCv(file, onProgress);
            else if (type === "diploma") data = await profileApi.uploadDiploma(file, onProgress);
            else if (type === "avatar") data = await profileApi.uploadAvatar(file, onProgress);

            const updatePayload = {};
            if (type === "cv") updatePayload.cvUrl = data.url;
            else if (type === "diploma") updatePayload.diplomaUrl = data.url;
            else if (type === "avatar") updatePayload.photoUrl = data.url;

            await profileApi.update(updatePayload);

            setProfile((prev) => {
                const update = { ...prev };
                if (type === "cv") update.cvUrl = data.url;
                else if (type === "diploma") update.diplomaUrl = data.url;
                else if (type === "avatar") update.photo_url = data.url;
                return update;
            });

            if (type === "avatar") await reloadUser();

            toast.success("Fichier envoyé avec succès !");
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de l'upload");
        } finally {
            setUploadingType(null);
            setUploadProgress(0);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?")) return;

        const toastId = toast.loading("Suppression en cours...");
        try {
            await profileApi.update({ photoUrl: null });
            setProfile((prev) => ({ ...prev, photo_url: null }));
            await reloadUser();
            toast.success("Photo supprimée avec succès", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la suppression", { id: toastId });
        }
    };

    const handleUpdateProfile = async (updatedData) => {
        try {
            const newProfile = { ...profile, ...updatedData };
            setProfile(newProfile);
            await profileApi.update(newProfile);
            await reloadUser();
            toast.success("Profil mis à jour avec succès");
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors de la sauvegarde");
        }
    };


    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header Card */}
            <ProfileHeader
                user={user}
                profile={profile}
                isStudent={true}
                onEdit={() => setIsEditing(!isEditing)}
                onCoachClick={startCoachAnalysis}
                onAvatarUpload={(file) => handleFileUpload("avatar", file)}
                onDeleteAvatar={handleDeleteAvatar}
                isUploading={uploadingType === "avatar"}
                progress={uploadProgress}
            />

            <div className="space-y-6">
                {/* Horizontal Navigation Tabs */}
                <div className="flex gap-2 sm:gap-4 border-b border-theme-secondary/20 pb-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    <TabItem id="info" label="Informations" icon={User} active={activeTab} onClick={setActiveTab} />
                    <TabItem id="docs" label="Documents & CV" icon={FileText} active={activeTab} onClick={setActiveTab} />
                    <TabItem id="security" label="Sécurité" icon={Shield} active={activeTab} onClick={setActiveTab} />
                </div>

                {/* Main Content Area */}
                <div>
                    <AnimatePresence mode="wait">
                        {activeTab === "info" && (
                            <motion.div
                                key="info"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="glass-panel p-5 sm:p-8 rounded-3xl relative overflow-hidden shadow-lg border border-white/60">
                                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-theme-primary mb-1">Détails du Profil</h2>
                                            <p className="text-theme-secondary text-sm">Gérez vos informations personnelles et académiques.</p>
                                        </div>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)} className="w-full sm:w-auto px-4 py-2 hover:bg-white/5 text-theme-secondary hover:text-theme-primary rounded-xl text-sm font-bold transition-all border border-theme-secondary/20 shadow-sm hover:shadow-md">
                                                Modifier
                                            </button>
                                        )}
                                    </div>
                                    <StudentForm profile={profile} isEditing={isEditing} onSave={handleUpdateProfile} onCancel={() => setIsEditing(false)} />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "docs" && (
                            <motion.div
                                key="docs"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="grid md:grid-cols-2 gap-6">
                                    <DocumentCard title="Mon CV (PDF)" description="Votre atout principal pour les recruteurs." url={profile?.cvUrl} type="cv" onUpload={handleFileUpload} icon={FileText} isUploading={uploadingType === "cv"} progress={uploadProgress} />
                                    <DocumentCard title="Diplôme / Certificat" description="Prouvez votre niveau académique." url={profile?.diplomaUrl} type="diploma" onUpload={handleFileUpload} icon={GraduationCap} isUploading={uploadingType === "diploma"} progress={uploadProgress} />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "security" && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SecurityTab />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AICoachModal isOpen={isCoachOpen} onClose={() => setIsCoachOpen(false)} loading={isCoachLoading} analysis={coachAnalysis} />
        </div>
    );
}

function StudentForm({ profile, isEditing, onSave, onCancel }) {
    const [formData, setFormData] = useState(profile);
    const [availableDomains, setAvailableDomains] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (formData.faculty && facultiesData[formData.faculty]) {
            setAvailableDomains(facultiesData[formData.faculty]);
        } else {
            setAvailableDomains([]);
        }
    }, [formData.faculty]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === "faculty") setFormData(prev => ({ ...prev, domaine: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(formData);
        setSaving(false);
    };

    // Re-use InputField from ProfileComponents later, inline for now or import
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <InputField label="Nom Complet" name="fullname" value={formData?.fullname} onChange={handleChange} icon={User} disabled={!isEditing} />

                <div className="group">
                    <label className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">Date de Naissance</label>
                    <div className="relative">
                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${!isEditing ? "text-theme-secondary/70" : "text-theme-secondary"}`}>
                            <Calendar size={18} />
                        </div>
                        <input type="date" name="dateOfBirth" value={formData?.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ""} onChange={handleChange} disabled={!isEditing} className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-theme-primary outline-none transition-all text-sm sm:text-base ${!isEditing ? "border-transparent bg-transparent pl-8" : "border-theme-secondary/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"}`} />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">Faculté / Institut</label>
                    <div className="relative">
                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${!isEditing ? "text-theme-secondary/70" : "text-theme-secondary"}`}>
                            <Building size={18} />
                        </div>
                        {isEditing ? (
                            <select name="faculty" value={formData?.faculty || ""} onChange={handleChange} className="w-full bg-white/5 border border-theme-secondary/20 rounded-xl pl-10 pr-4 py-3 text-theme-primary outline-none focus:border-blue-500 appearance-none text-sm sm:text-base cursor-pointer [&>option]:text-slate-900 dark:[&>option]:text-white dark:[&>option]:bg-slate-900">
                                <option value="">Sélectionner une faculté</option>
                                {Object.keys(facultiesData).map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        ) : (
                            <input type="text" value={formData?.faculty || "Non renseigné"} disabled className="w-full bg-transparent border-transparent rounded-xl pl-10 pr-4 py-3 text-theme-primary text-sm sm:text-base" />
                        )}
                    </div>
                </div>

                <div className="group">
                    <label className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">Domaine d'études</label>
                    <div className="relative">
                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${!isEditing ? "text-theme-secondary/70" : "text-theme-secondary"}`}>
                            <Briefcase size={18} />
                        </div>
                        {isEditing ? (
                            <select
                                name="domaine"
                                value={formData?.domaine || ""}
                                onChange={handleChange}
                                disabled={!formData?.faculty}
                                className="w-full bg-white/5 border border-theme-secondary/20 rounded-xl pl-10 pr-4 py-3 text-theme-primary outline-none focus:border-blue-500 appearance-none disabled:opacity-50 text-sm sm:text-base cursor-pointer [&>option]:text-slate-900 dark:[&>option]:text-white dark:[&>option]:bg-slate-900"
                            >
                                <option value="">Sélectionner un parcours</option>
                                {availableDomains.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={formData?.domaine || "Non renseigné"}
                                disabled
                                className="w-full bg-transparent border-transparent rounded-xl pl-10 pr-4 py-3 text-theme-primary text-sm sm:text-base"
                            />
                        )}
                    </div>
                </div>

                <div className="group">
                    <label className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">Niveau d'étude</label>
                    <div className="relative">
                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${!isEditing ? "text-theme-secondary/70" : "text-theme-secondary"}`}>
                            <GraduationCap size={18} />
                        </div>
                        {isEditing ? (
                            <select
                                name="grade"
                                value={formData?.grade || ""}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-theme-secondary/20 rounded-xl pl-10 pr-4 py-3 text-theme-primary outline-none focus:border-blue-500 appearance-none text-sm sm:text-base cursor-pointer [&>option]:text-slate-900 dark:[&>option]:text-white dark:[&>option]:bg-slate-900"
                            >
                                <option value="">Sélectionner un niveau</option>
                                {grades.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={formData?.grade || "Non renseigné"}
                                disabled
                                className="w-full bg-transparent border-transparent rounded-xl pl-10 pr-4 py-3 text-theme-primary text-sm sm:text-base"
                            />
                        )}
                    </div>
                </div>

                <InputField label="Téléphone" name="phone" value={formData?.phone} onChange={handleChange} icon={Phone} disabled={true} />
                <InputField label="Adresse / Ville" name="address" value={formData?.address} onChange={handleChange} icon={MapPin} disabled={!isEditing} />
            </div>

            {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-theme-secondary/10">
                    <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-theme-secondary hover:text-theme-primary hover:bg-white/5 transition-colors">Annuler</button>
                    <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Enregistrer</>}
                    </button>
                </div>
            )}
        </form>
    );
}

function InputField({ label, name, value, onChange, disabled, icon: Icon }) {
    const id = `field-${name}`;
    return (
        <div className="group">
            <label htmlFor={id} className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">{label}</label>
            <div className="relative">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${disabled ? "text-theme-secondary/70" : "text-theme-secondary group-focus-within:text-blue-500"}`}>
                    <Icon size={18} />
                </div>
                <input type="text" id={id} name={name} value={value || ""} onChange={onChange} disabled={disabled} className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-theme-primary outline-none transition-all text-sm sm:text-base ${disabled ? "border-transparent bg-transparent pl-8" : "border-theme-secondary/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"}`} placeholder={!disabled ? `Entrez ${label.toLowerCase()}...` : ""} />
            </div>
        </div>
    );
}
