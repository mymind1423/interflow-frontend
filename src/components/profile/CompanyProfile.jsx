import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Shield, MapPin, Phone, Building, Check, Loader2, Globe
} from "lucide-react";
import toast from "react-hot-toast";
import { profileApi } from "../../api/profileApi"; // Adjust path
import { useAuth } from "../../authContext"; // Adjust path
import { ProfileHeader, TabItem, SecurityTab, InputField } from "./ProfileComponents";

export default function CompanyProfile({ user, profile, setProfile, isEditing, setIsEditing, reloadUser }) {
    const [activeTab, setActiveTab] = useState("info");

    // Company Profile usually doesn't need AI Coach or Doc Uploads in the same way, 
    // but if needed we can add them. For now, focusing on Info & Security.

    // Avatar upload logic is shared via ProfileHeader, we just need the handler
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleAvatarUpload = async (file) => {
        if (!file) return;
        setUploadingAvatar(true);
        setUploadProgress(0);

        try {
            const onProgress = (percent) => setUploadProgress(percent);
            const data = await profileApi.uploadLogo(file, onProgress); // Use uploadLogo for company

            await profileApi.update({ photoUrl: data.url });

            setProfile((prev) => ({ ...prev, photo_url: data.url }));
            await reloadUser();

            toast.success("Logo changé avec succès");
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de l'upload du logo");
        } finally {
            setUploadingAvatar(false);
            setUploadProgress(0);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!confirm("Supprimer le logo de l'entreprise ?")) return;
        try {
            await profileApi.update({ photoUrl: null });
            setProfile((prev) => ({ ...prev, photo_url: null }));
            await reloadUser();
            toast.success("Logo supprimé");
        } catch (err) {
            console.error(err);
            toast.error("Erreur suppression logo");
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
            // Optionally revert state here if needed
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <ProfileHeader
                user={user}
                profile={profile}
                isStudent={false}
                onEdit={() => setIsEditing(!isEditing)}
                onAvatarUpload={handleAvatarUpload}
                onDeleteAvatar={handleDeleteAvatar}
                isUploading={uploadingAvatar}
                progress={uploadProgress}
            />

            <div className="space-y-6">
                <div className="flex gap-2 sm:gap-4 border-b border-theme-secondary/20 pb-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    <TabItem id="info" label="Informations" icon={User} active={activeTab} onClick={setActiveTab} />
                    <TabItem id="security" label="Sécurité" icon={Shield} active={activeTab} onClick={setActiveTab} />
                </div>

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
                                <div className="glass-panel p-5 sm:p-8 rounded-3xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-theme-primary mb-1">Profil Entreprise</h2>
                                            <p className="text-theme-secondary text-sm">Gérez les informations de votre entreprise.</p>
                                        </div>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)} className="w-full sm:w-auto px-4 py-2 hover:bg-white/5 text-theme-secondary hover:text-theme-primary rounded-xl text-sm font-bold transition-all border border-theme-secondary/20 shadow-sm hover:shadow-md">
                                                Modifier
                                            </button>
                                        )}
                                    </div>
                                    <CompanyForm profile={profile} isEditing={isEditing} onSave={handleUpdateProfile} onCancel={() => setIsEditing(false)} />
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
        </div>
    );
}

function CompanyForm({ profile, isEditing, onSave, onCancel }) {
    const [formData, setFormData] = useState(profile);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(formData);
        setSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <InputField label="Nom de l'entreprise" name="name" value={formData?.name} onChange={handleChange} icon={Building} disabled={!isEditing} />
                <InputField label="Site Web" name="website" value={formData?.website} onChange={handleChange} icon={Globe} disabled={!isEditing} />
                <InputField label="Téléphone" name="phone" value={formData?.phone} onChange={handleChange} icon={Phone} disabled={true} />
                <InputField label="Adresse / Ville" name="address" value={formData?.address} onChange={handleChange} icon={MapPin} disabled={!isEditing} />
            </div>

            <div className="col-span-full">
                <label className="block text-sm font-medium text-theme-secondary mb-2">Description</label>
                <textarea
                    name="description"
                    value={formData?.description || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-theme-primary outline-none transition-all resize-none text-sm sm:text-base ${isEditing
                        ? "border-theme-secondary/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                        : "border-transparent bg-transparent px-0 py-0"
                        }`}
                />
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
