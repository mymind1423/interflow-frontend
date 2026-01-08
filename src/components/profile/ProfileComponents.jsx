import { useState } from "react";
import { motion } from "framer-motion";
import {
    User, FileText, Shield, Upload, MapPin, Phone,
    Briefcase, GraduationCap, Check, Camera, Building, Mail, Lock, AlertCircle, Sparkles, Trash2, Eye, EyeOff, ExternalLink, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from "firebase/auth";
import { auth } from "../../firebase"; // Adjust path if needed
import { useAuth } from "../../authContext"; // Adjust path if needed

// --- UI Components ---

export function ModernProgressBar({ progress, className = "" }) {
    return (
        <div className={`w-full bg-slate-100 dark:bg-white/5 rounded-full h-3 overflow-hidden shadow-inner border border-slate-200 dark:border-white/5 relative group ${className}`}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
                className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full relative"
            >
                <div className="absolute inset-0 bg-white/30 animate-[pulse_2s_infinite]" />
            </motion.div>
        </div>
    );
}

export function TabItem({ id, label, icon: Icon, active, onClick }) {
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive
                ? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                : "border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-secondary/30"
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );
}

export function ProfileHeader({ user, profile, onEdit, isStudent, onCoachClick, onAvatarUpload, onDeleteAvatar, isUploading, progress }) {
    const displayName = profile?.fullname || profile?.name || "Utilisateur";
    const userRole = user?.userType === "student" ? "Étudiant" : "Entreprise";
    const avatarUrl = (profile?.photoUrl || profile?.photo_url) || "https://ui-avatars.com/api/?name=" + displayName + "&background=random";
    const hasCustomAvatar = profile?.photoUrl || profile?.photo_url;

    return (
        <div className="group relative glass-panel rounded-[2.5rem] p-6 lg:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 overflow-hidden hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-500 shadow-lg border border-white/60">
            {/* Background Vivid Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-blue-400/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:bg-indigo-400/20 transition-all duration-700" />

            <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-white/10 ring-1 ring-white/10">
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                </div>
                {/* Photo Upload Overlay - Discreet Camera Button */}
                <label className={`absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 p-2.5 rounded-full shadow-md transition-all cursor-pointer hover:scale-110 border border-slate-100 ${isUploading ? "bg-slate-100 cursor-wait" : "bg-white text-slate-600 hover:text-blue-600"}`}>
                    {isUploading ? (
                        <div className="relative flex items-center justify-center w-4 h-4">
                            <Loader2 className="animate-spin w-4 h-4 text-blue-500" />
                        </div>
                    ) : (
                        <Camera size={18} />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && onAvatarUpload(e.target.files[0])}
                        disabled={isUploading}
                    />
                </label>
            </div>

            <div className="flex-1 text-center md:text-left z-10 w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 justify-center md:justify-start">
                    <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary tracking-tight">{displayName}</h1>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 w-fit mx-auto md:mx-0">
                        {userRole}
                    </span>
                </div>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-theme-secondary text-sm mt-3">
                    <div className="flex items-center gap-1.5">
                        <Mail size={14} />
                        {user?.email}
                    </div>
                    {profile?.phone && (
                        <div className="flex items-center gap-1.5">
                            <Phone size={14} />
                            {profile?.phone}
                        </div>
                    )}
                    {profile?.address && (
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            {profile?.address}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end">
                {isStudent && (
                    <button
                        onClick={onCoachClick}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-900/20 transition-all hover:scale-105 border border-white/10"
                    >
                        <Sparkles size={18} className="text-yellow-300" />
                        Coach IA
                    </button>
                )}
            </div>
        </div >
    );
}

export const DocumentCard = ({ title, description, url, type, onUpload, icon: Icon = FileText, isUploading, progress }) => {
    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            onUpload(type, e.target.files[0]);
        }
    };

    return (
        <div className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col h-full group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-theme-primary text-lg">{title}</h3>
                        <p className="text-sm text-theme-secondary">{description}</p>
                    </div>
                </div>

                {url && (
                    <div className="flex gap-2">
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 text-theme-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20"
                            title="Ouvrir dans un nouvel onglet"
                        >
                            <ExternalLink size={18} />
                        </a>
                    </div>
                )}
            </div>

            {url ? (
                <div className="mb-6 flex-1">
                    <div className="relative w-full h-64 sm:h-80 bg-white/5 rounded-2xl overflow-hidden border border-theme-secondary/10 shadow-inner group-hover:border-theme-secondary/20 transition-colors">
                        <iframe
                            src={url}
                            className="w-full h-full object-cover"
                            title={title}
                        />
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Fichier actuel
                    </div>
                </div>
            ) : (
                <div className="mb-6 flex-1 flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 shadow-sm border border-white/10">
                        <FileText className="text-theme-secondary" size={32} />
                    </div>
                    <p className="text-sm text-theme-secondary text-center font-medium">
                        Aucun document. <br /> Téléchargez un PDF pour commencer.
                    </p>
                </div>
            )}

            {isUploading ? (
                <div className="w-full px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex justify-between text-xs font-semibold text-blue-600 mb-2">
                        <span>Upload en cours...</span>
                        <span>{progress}%</span>
                    </div>
                    <ModernProgressBar progress={progress} />
                </div>
            ) : (
                <label className={`w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl cursor-pointer transition-all font-bold text-sm ${url
                    ? "bg-white/5 hover:bg-white/10 text-theme-secondary hover:text-theme-primary border border-white/10"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                    }`}>
                    <Upload size={18} />
                    <span>{url ? "Remplacer le fichier" : "Importer un document"}</span>
                    <input type="file" accept=".pdf" hidden onChange={handleFileChange} />
                </label>
            )}
        </div>
    );
};

export function SecurityTab() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const providerId = auth.currentUser?.providerData[0]?.providerId;
    const isPasswordUser = providerId === "password";

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validation
        if (newPassword.length < 6) {
            setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Mise à jour du mot de passe...");

        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, currentPassword);

            // 1. Ré-authentification
            await reauthenticateWithCredential(user, credential);

            // 2. Mise à jour
            await updatePassword(user, newPassword);

            const msg = "Mot de passe mis à jour avec succès !";
            setSuccess(msg);
            toast.success(msg, { id: toastId });

            // Reset form
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error(err);
            let msg = "Erreur lors de la mise à jour.";
            if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
                msg = "Le mot de passe actuel est incorrect.";
            } else if (err.code === "auth/weak-password") {
                msg = "Le mot de passe est trop faible.";
            } else if (err.code === "auth/too-many-requests") {
                msg = "Trop de tentatives. Veuillez réessayer plus tard.";
            }
            setError(msg);
            toast.error(msg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (!isPasswordUser) {
        return (
            <div className="glass-panel rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col items-center justify-center py-20 text-center">
                <Shield className="w-16 h-16 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-medium text-theme-primary mb-2">Authentification Externe</h3>
                <p className="text-theme-secondary max-w-md">
                    Vous êtes connecté via <strong>{providerId}</strong> (Google/Autre). Vous n'avez pas besoin de gérer un mot de passe ici.
                </p>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-2xl p-6 lg:p-8 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                    <Lock size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-theme-primary">Changer de mot de passe</h2>
                    <p className="text-sm text-theme-secondary">Pour votre sécurité, choisissez un mot de passe fort.</p>
                </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">
                        Mot de passe actuel
                    </label>
                    <div className="relative">
                        <input
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-theme-secondary/20 rounded-xl px-4 py-3 text-theme-primary outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-theme-secondary/50 pr-12"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary"
                        >
                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">
                            Nouveau mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-white/5 border border-theme-secondary/20 rounded-xl px-4 py-3 text-theme-primary outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-theme-secondary/50 pr-12"
                                placeholder="Minimum 6 caractères"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary"
                            >
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">
                            Confirmer le mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-white/5 border border-theme-secondary/20 rounded-xl px-4 py-3 text-theme-primary outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-theme-secondary/50 pr-12"
                                placeholder="Répétez le mot de passe"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary"
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm shadow-sm">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm shadow-sm">
                        <Check size={16} className="mt-0.5 shrink-0" />
                        <p>{success}</p>
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : "Mettre à jour le mot de passe"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export function InputField({ label, name, value, onChange, disabled, icon: Icon }) {
    const id = `field-${name}`;
    return (
        <div className="group">
            <label htmlFor={id} className="block text-xs font-medium text-theme-secondary uppercase tracking-wider mb-1.5">{label}</label>
            <div className="relative">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${disabled ? "text-theme-secondary/70" : "text-theme-secondary group-focus-within:text-blue-500"}`}>
                    <Icon size={18} />
                </div>
                <input
                    type="text"
                    id={id}
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-theme-primary outline-none transition-all text-sm sm:text-base ${disabled
                        ? "border-transparent bg-transparent pl-8"
                        : "border-theme-secondary/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                        }`}
                    placeholder={!disabled ? `Entrez ${label.toLowerCase()}...` : ""}
                />
            </div>
        </div>
    );
}
