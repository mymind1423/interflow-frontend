
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import { auth } from "../../firebase";
import StepTransition from "../../components/common/StepTransition";
import { signupApi } from "../../api/signupApi";
import {
  ArrowRight, ArrowLeft, Upload, Check, Building2, MapPin,
  Briefcase, Mail, Lock, Globe, Eye, EyeOff
} from "lucide-react";
import { motion } from "framer-motion";
import Recaptcha from "../../components/common/Recaptcha";
import Tooltip from "../../components/ui/Tooltip";
import { Info } from "lucide-react";

const domaines = [
  "Informatique",
  "Industrie",
  "Marketing",
  "Transport",
  "Commerce",
  "Agriculture",
  "Télécoms",
  "Finance",
  "Santé",
  "Énergie",
  "Autre"
];

const isEmail = (value) => /\S+@\S+\.\S+/.test(value);

function SignupCompanyWizard() {
  const navigate = useNavigate();
  const { reloadUser } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    domaine: "",
    phone: "",
    website: "",
    description: "",
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  // Computed progress for custom stepper
  const progress = step === 1 ? '0%' : step === 2 ? '50%' : '100%';

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNextStep1 = async () => {
    setError("");
    if (!form.name || !form.email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!isEmail(form.email)) {
      setError("Adresse email invalide.");
      return;
    }

    try {
      setLoadingStep(true);
      const res = await signupApi.verifyEmail(form.email);
      if (res.exists) {
        setError("Cet email est déjà associé à un compte.");
        return;
      }
      setStep(2);
    } catch (err) {
      setError("Impossible de vérifier l'email. Veuillez réessayer.");
    } finally {
      setLoadingStep(false);
    }
  };

  const handleNextStep2 = () => {
    setError("");
    if (!form.address || !form.domaine) {
      setError("L'adresse et le domaine d'activité sont requis.");
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    setError("");
    if (!logo) {
      setError("Le logo est obligatoire pour votre profil entreprise.");
      return;
    }

    if (!recaptchaToken) {
      setError("Veuillez valider le captcha.");
      return;
    }

    try {
      setLoading(true);

      // 1. Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, form.email, password);
      await updateProfile(auth.currentUser, { displayName: form.name });

      // 2. Upload Logo
      const logoRes = await signupApi.uploadLogo(logo);
      if (!logoRes?.url) throw new Error("Échec de l'upload du logo.");

      // 3. Create Backend Profile
      const payload = {
        id: cred.user.uid,
        email: form.email,
        name: form.name,
        address: form.address,
        domaine: form.domaine,
        phone: form.phone,
        website: form.website,
        description: form.description,
        logoUrl: logoRes.url // Matches backend expectation (mapped to photoUrl/logoUrl)
      };

      await signupApi.signupCompany(payload);

      if (reloadUser) await reloadUser();

      navigate("/pending-approval");
    } catch (err) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-body transition-colors duration-300">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-black text-theme-primary mb-2 flex items-center justify-center gap-3">
            <Building2 className="text-emerald-500" size={32} />
            Espace Recruteur
          </h1>
          <p className="text-theme-secondary">Créez votre profil entreprise en quelques instants.</p>
        </div>

        {/* Custom Stepper */}
        <div className="flex items-center justify-between mb-12 relative max-w-xs mx-auto">
          {/* Track Background */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 dark:bg-slate-800 -z-10 -translate-y-1/2 rounded-full" />
          {/* Progress Bar */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
            style={{ width: progress }}
          />

          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${step >= s
              ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110"
              : "bg-white/10 border-white/10 text-theme-secondary"
              }`}>
              {step > s ? <Check size={18} /> : s}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          layout
          className="glass-panel border border-white/10 rounded-[2rem] p-5 sm:p-10 shadow-xl relative overflow-hidden"
        >
          {/* Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          <StepTransition key={step}>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-bold flex items-center gap-2 animate-pulse">
                ⚠️ {error}
              </div>
            )}

            {/* STEP 1: Account Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-theme-primary flex items-center gap-2">
                  Identification
                  <span className="text-xs font-normal text-theme-secondary ml-auto uppercase tracking-widest">Étape 1/3</span>
                </h2>

                <div className="space-y-4">

                  {/* Company Name */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-theme-secondary uppercase tracking-wide ml-1">Nom de l'entreprise</label>
                      <Tooltip content="Le nom légal de votre structure">
                        <Info size={14} className="text-theme-secondary hover:text-theme-primary cursor-help" />
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        name="name"
                        type="text"
                        placeholder="Ex: Tech Solutions Inc."
                        value={form.name}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 sm:py-3.5 pl-12 pr-4 text-theme-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Email professionnel</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        name="email"
                        type="email"
                        placeholder="contact@entreprise.com"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-theme-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-theme-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Confirmer mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-theme-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                </div>

                <div className="pt-4">
                  <button
                    onClick={handleNextStep1}
                    disabled={loadingStep}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 sm:py-4 font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loadingStep ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Suivant <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              </div>
            )}


            {/* STEP 2: Company Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-theme-primary flex items-center gap-2">
                  Détails & Activité
                  <span className="text-xs font-normal text-theme-secondary ml-auto uppercase tracking-widest">Étape 2/3</span>
                </h2>

                <div className="space-y-4">

                  {/* Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Siège Social</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        name="address"
                        type="text"
                        placeholder="Adresse complète"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-theme-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Téléphone</label>
                    <div className="relative">
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Ex: 05 22 12 34 56"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-theme-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Site Web</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        name="website"
                        type="url"
                        placeholder="https://www.exemple.com"
                        value={form.website}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-theme-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Sector */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Secteur d'activité</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <select
                        name="domaine"
                        value={form.domaine}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-theme-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-900">Sélectionner un secteur...</option>
                        {domaines.map(d => <option key={d} value={d} className="bg-idk text-black dark:text-white dark:bg-slate-900">{d}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                    </div>
                  </div>

                  {/* Description (Optional) */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Brève Description</label>
                      <Tooltip content="Sera visible par les candidats sur votre profil">
                        <Info size={14} className="text-slate-600 hover:text-slate-400 cursor-help" />
                      </Tooltip>
                    </div>
                    <textarea
                      name="description"
                      rows="3"
                      placeholder="Présentez votre entreprise..."
                      value={form.description}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-theme-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>

                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 rounded-xl border border-white/10 text-theme-secondary hover:text-theme-primary hover:bg-white/5 transition-colors font-bold flex items-center gap-2"
                  >
                    <ArrowLeft size={18} /> Retour
                  </button>
                  <button
                    onClick={handleNextStep2}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    Continuer <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}


            {/* STEP 3: Logo & Confirmation */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Image de Marque
                  <span className="text-xs font-normal text-slate-500 ml-auto uppercase tracking-widest">Étape 3/3</span>
                </h2>

                <p className="text-sm text-slate-400 mb-6">Ajoutez votre logo pour être visible par les candidats.</p>

                {/* Logo Upload */}
                <div className="relative group">
                  <label className="block text-xs font-bold text-theme-secondary uppercase tracking-wide mb-2 ml-1">Logo de l'entreprise</label>
                  <div
                    className={`border-2 border-dashed rounded-[1.5rem] p-8 flex flex-col items-center justify-center transition-all cursor-pointer h-48 ${logo ? "border-emerald-500/50 bg-emerald-500/5" : "bg-white/5 border-white/10 hover:border-emerald-500/50 hover:bg-white/10"}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogo(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {logo ? (
                      <div className="relative z-0 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl mb-3">
                          <img src={URL.createObjectURL(logo)} alt="Preview" className="w-full h-full object-contain bg-white" />
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                          <Check size={16} /> Fichier sélectionné
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-theme-secondary group-hover:text-theme-primary transition-colors">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                          <Upload size={24} />
                        </div>
                        <span className="font-bold">Cliquez pour importer</span>
                        <span className="text-xs mt-1 opacity-60">PNG, JPG, SVG (Max 5Mo)</span>
                      </div>
                    )}
                  </div>
                </div>

                <Recaptcha onChange={setRecaptchaToken} />

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3.5 rounded-xl border border-white/10 text-theme-secondary hover:text-theme-primary hover:bg-white/5 transition-colors font-bold flex items-center gap-2"
                  >
                    <ArrowLeft size={18} /> Retour
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Finaliser <Check size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            )}

          </StepTransition>
        </motion.div>
      </div>
    </main>
  );
}

export default SignupCompanyWizard;
