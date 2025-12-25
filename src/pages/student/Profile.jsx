import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, FileText, Shield, Upload, MapPin, Phone,
  Briefcase, GraduationCap, Check, Camera, Building, Mail, Lock, AlertCircle, Sparkles, Trash2, Eye, EyeOff, ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../authContext";
import { profileApi } from "../../api/profileApi";
import AICoachModal from "../../components/modals/AICoachModal";
import { apiFetch } from "../../api/client";



export default function ProfilePage() {
  const { reloadUser } = useAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // AI Coach State
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [coachAnalysis, setCoachAnalysis] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileApi.get("/api/profile/get");
      setUser({
        uid: data.id,
        email: data.email,
        userType: data.userType,
        status: data.status,
      });
      setProfile(data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      // Fusionner les nouvelles données
      const newProfile = { ...profile, ...updatedData };
      setProfile(newProfile); // Update UI optimistic
      await profileApi.update(newProfile);
      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la sauvegarde");
      fetchProfile(); // Revert on error
    }
  };

  const handleFileUpload = async (type, file) => {
    if (!file) return;
    const toastId = toast.loading("Upload en cours...");

    try {
      let data;
      if (type === "cv") {
        data = await profileApi.uploadCv(file);
      } else if (type === "diploma") {
        data = await profileApi.uploadDiploma(file);
      } else if (type === "avatar") {
        data = await profileApi.uploadAvatar(file);
      } else if (type === "logo") {
        data = await profileApi.uploadLogo(file);
      }

      const updatePayload = {};
      if (type === "cv") updatePayload.cvUrl = data.url;
      else if (type === "diploma") updatePayload.diplomaUrl = data.url;
      else if (type === "avatar" || type === "logo") updatePayload.photoUrl = data.url;

      await profileApi.update(updatePayload);

      setProfile((prev) => {
        const update = { ...prev };
        if (type === "cv") update.cvUrl = data.url;
        else if (type === "diploma") update.diplomaUrl = data.url;
        else if (type === "avatar" || type === "logo") update.photo_url = data.url;
        return update;
      });

      // Update user in context to refresh Navbar avatar
      if (type === "avatar" || type === "logo") {
        await reloadUser();
      }

      toast.success("Fichier envoyé et enregistré !", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'upload", { id: toastId });
    }
  };

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

  const handleDeleteAvatar = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre photo de profil ?")) {
      return;
    }

    const toastId = toast.loading("Suppression en cours...");
    try {
      await profileApi.update({ photoUrl: null });

      setProfile((prev) => ({ ...prev, photo_url: null }));

      // Update user in context to refresh Navbar avatar
      await reloadUser();

      toast.success("Photo supprimée avec succès", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression", { id: toastId });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isStudent = user?.userType === "student";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-6 sm:space-y-8 mt-4 sm:mt-6 pb-24 relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Header Card */}
      <ProfileHeader
        user={user}
        profile={profile}
        isStudent={isStudent}
        onEdit={() => setIsEditing(!isEditing)}
        onCoachClick={startCoachAnalysis}
        onAvatarUpload={(file) => handleFileUpload(isStudent ? "avatar" : "logo", file)}
        onDeleteAvatar={handleDeleteAvatar}
      />

      <div className="space-y-6">
        {/* Horizontal Navigation Tabs */}
        <div className="flex gap-2 sm:gap-4 border-b border-white/5 pb-1 overflow-x-auto no-scrollbar mask-gradient-r -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabItem
            id="info"
            label="Informations"
            icon={User}
            active={activeTab}
            onClick={setActiveTab}
          />
          {isStudent && (
            <TabItem
              id="docs"
              label="Documents & CV"
              icon={FileText}
              active={activeTab}
              onClick={setActiveTab}
            />
          )}
          <TabItem
            id="security"
            label="Sécurité"
            icon={Shield}
            active={activeTab}
            onClick={setActiveTab}
          />
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
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">Détails du Profil</h2>
                      <p className="text-slate-400 text-sm">Gérez vos informations personnelles et académiques.</p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all border border-white/10 shadow-lg hover:shadow-xl"
                      >
                        Modifier
                      </button>
                    )}
                  </div>

                  <ProfileForm
                    profile={profile}
                    isEditing={isEditing}
                    isStudent={isStudent}
                    onSave={handleUpdateProfile}
                    onCancel={() => setIsEditing(false)}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "docs" && isStudent && (
              <motion.div
                key="docs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <DocumentCard
                    title="Mon CV (PDF)"
                    description="Votre atout principal pour les recruteurs."
                    url={profile?.cvUrl}
                    type="cv"
                    onUpload={handleFileUpload}
                    icon={FileText}
                  />
                  <DocumentCard
                    title="Diplôme / Certificat"
                    description="Prouvez votre niveau académique."
                    url={profile?.diplomaUrl}
                    type="diploma"
                    onUpload={handleFileUpload}
                    icon={GraduationCap}
                  />
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

      <AICoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        loading={isCoachLoading}
        analysis={coachAnalysis}
      />
    </div>
  );
}

// --- Sub-components ---

function ProfileHeader({ user, profile, onEdit, isStudent, onCoachClick, onAvatarUpload, onDeleteAvatar }) {
  const displayName = profile?.fullname || profile?.name || "Utilisateur";
  const userRole = user?.userType === "student" ? "Étudiant" : "Entreprise";
  const avatarUrl = (profile?.photoUrl || profile?.photo_url) || "https://ui-avatars.com/api/?name=" + displayName + "&background=random";
  const hasCustomAvatar = profile?.photoUrl || profile?.photo_url;

  return (
    <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 lg:p-10 shadow-[0_0_50px_-10px_rgba(30,58,138,0.3)] flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 overflow-hidden hover:border-blue-500/30 transition-all duration-500">
      {/* Background Vivid Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-blue-500/30 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />

      <div className="relative group shrink-0">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden bg-slate-800">
          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
        </div>
        {/* Photo Upload Overlay */}
        <label className="absolute bottom-1 right-1 p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 transition-colors cursor-pointer group-hover:scale-110">
          <Camera size={16} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onAvatarUpload(e.target.files[0])}
          />
        </label>
        {/* Delete Button - only show if there's a custom avatar */}
        {hasCustomAvatar && onDeleteAvatar && (
          <button
            onClick={onDeleteAvatar}
            className="absolute bottom-1 left-1 p-2 bg-red-600 rounded-full text-white shadow-lg hover:bg-red-500 transition-colors group-hover:scale-110"
            title="Supprimer la photo"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 text-center md:text-left z-10 w-full">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 justify-center md:justify-start">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{displayName}</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 w-fit mx-auto md:mx-0">
            {userRole}
          </span>
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-slate-400 text-sm mt-3">
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

function TabItem({ id, label, icon: Icon, active, onClick }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive
        ? "border-blue-500 text-blue-400"
        : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
        }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}


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

function ProfileForm({ profile, isEditing, isStudent, onSave, onCancel }) {
  const [formData, setFormData] = useState(profile);
  const [availableDomains, setAvailableDomains] = useState([]);

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

    // Reset domain if faculty changes
    if (name === "faculty") {
      setFormData(prev => ({ ...prev, domaine: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {isStudent ? (
          <>
            <InputField
              label="Nom Complet"
              name="fullname"
              value={formData?.fullname}
              onChange={handleChange}
              icon={User}
              disabled={!isEditing}
            />

            <div className="group">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Faculté / Institut</label>
              <div className="relative">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${!isEditing ? "text-slate-500" : "text-slate-400"}`}>
                  <Building size={18} />
                </div>
                {isEditing ? (
                  <select
                    name="faculty"
                    value={formData?.faculty || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500 appearance-none text-sm sm:text-base"
                  >
                    <option value="">Sélectionner une faculté</option>
                    {Object.keys(facultiesData).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData?.faculty || "Non renseigné"}
                    disabled
                    className="w-full bg-transparent border-transparent rounded-xl pl-10 pr-4 py-3 text-white text-sm sm:text-base"
                  />
                )}
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Domaine d'études</label>
              <div className="relative">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${!isEditing ? "text-slate-500" : "text-slate-400"}`}>
                  <Briefcase size={18} />
                </div>
                {isEditing ? (
                  <select
                    name="domaine"
                    value={formData?.domaine || ""}
                    onChange={handleChange}
                    disabled={!formData?.faculty}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500 appearance-none disabled:opacity-50 text-sm sm:text-base"
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
                    className="w-full bg-transparent border-transparent rounded-xl pl-10 pr-4 py-3 text-white text-sm sm:text-base"
                  />
                )}
              </div>
            </div>

            <InputField
              label="Niveau d'étude"
              name="grade"
              value={formData?.grade}
              onChange={handleChange}
              icon={GraduationCap}
              disabled={!isEditing}
            />
          </>
        ) : (
          <>
            <InputField
              label="Nom de l'entreprise"
              name="name"
              value={formData?.name}
              onChange={handleChange}
              icon={Building}
              disabled={!isEditing}
            />
            <InputField
              label="Site Web"
              name="website"
              value={formData?.website} // Assuming website field exists or user adds it
              onChange={handleChange}
              icon={MapPin}
              disabled={!isEditing}
            />
          </>
        )}

        <InputField
          label="Téléphone"
          name="phone"
          value={formData?.phone}
          onChange={handleChange}
          icon={Phone}
          disabled={!isEditing}
        />
        <InputField
          label="Adresse / Ville"
          name="address"
          value={formData?.address}
          onChange={handleChange}
          icon={MapPin}
          disabled={!isEditing}
        />
      </div>

      {!isStudent && (
        <div className="col-span-full">
          <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
          <textarea
            name="description"
            value={formData?.description || ""}
            onChange={handleChange}
            disabled={!isEditing}
            rows={4}
            className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white outline-none transition-all resize-none text-sm sm:text-base ${isEditing
              ? "border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
              : "border-transparent bg-transparent px-0 py-0"
              }`}
          />
        </div>
      )}

      {isEditing && (
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all font-medium flex items-center gap-2"
          >
            <Check size={18} /> Enregistrer
          </button>
        </div>
      )}
    </form>
  );
}

function InputField({ label, name, value, onChange, disabled, icon: Icon }) {
  if (!value && disabled) return null; // Don't show empty fields in view mode
  const id = `field-${name}`;

  return (
    <div className="group">
      <label htmlFor={id} className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${disabled ? "text-slate-500" : "text-slate-400 group-focus-within:text-blue-400"}`}>
          <Icon size={18} />
        </div>
        <input
          type="text"
          id={id}
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          className={`w-full bg-slate-800/50 border rounded-xl pl-10 pr-4 py-3 text-white outline-none transition-all text-sm sm:text-base ${disabled
            ? "border-transparent bg-transparent pl-8"
            : "border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
            }`}
          placeholder={!disabled ? `Entrez ${label.toLowerCase()}...` : ""}
        />
      </div>
    </div>
  );
}

const DocumentCard = ({ title, description, url, type, onUpload, icon: Icon = FileText }) => {
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      onUpload(type, e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col h-full group hover:border-blue-500/20 transition-all hover:translate-y-[-2px]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-4">
          <div className="p-3.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl text-blue-400 border border-blue-500/10 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>

        {url && (
          <div className="flex gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-700"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        )}
      </div>

      {url ? (
        <div className="mb-6 flex-1">
          <div className="relative w-full h-64 sm:h-80 bg-slate-950/50 rounded-2xl overflow-hidden border border-white/5 shadow-inner group-hover:border-white/10 transition-colors">
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
        <div className="mb-6 flex-1 flex flex-col items-center justify-center p-8 bg-slate-950/30 rounded-2xl border border-white/5 border-dashed">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-3">
            <FileText className="text-slate-600" size={32} />
          </div>
          <p className="text-sm text-slate-500 text-center font-medium">
            Aucun document. <br /> Téléchargez un PDF pour commencer.
          </p>
        </div>
      )}

      <label className={`w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl cursor-pointer transition-all font-bold text-sm ${url
        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600"
        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
        }`}>
        <Upload size={18} />
        <span>{url ? "Remplacer le fichier" : "Importer un document"}</span>
        <input type="file" accept=".pdf" hidden onChange={handleFileChange} />
      </label>
    </div>
  );
};

function SecurityTab() {
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
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl flex flex-col items-center justify-center py-20 text-center">
        <Shield className="w-16 h-16 text-blue-500 mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">Authentification Externe</h3>
        <p className="text-slate-400 max-w-md">
          Vous êtes connecté via <strong>{providerId}</strong> (Google/Autre). Vous n'avez pas besoin de gérer un mot de passe ici.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
          <Lock size={24} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Changer de mot de passe</h2>
          <p className="text-sm text-slate-400">Pour votre sécurité, choisissez un mot de passe fort.</p>
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
            Mot de passe actuel
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 pr-12"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 pr-12"
                placeholder="Minimum 6 caractères"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 pr-12"
                placeholder="Répétez le mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
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
            {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </button>
        </div>
      </form>
    </div>
  );
}



