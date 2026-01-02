import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import { auth } from "../../firebase";
import StepIndicator from "../../components/common/StepIndicator";
import StepTransition from "../../components/common/StepTransition";
import { signupApi } from "../../api/signupApi";
import { authApi } from "../../api/authApi";
import { useToast } from "../../context/ToastContext";
import { ArrowRight, ArrowLeft, Upload, Check, User, MapPin, Briefcase, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import Recaptcha from "../../components/common/Recaptcha";

const provider = new GoogleAuthProvider();
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

const grades = ["BAC", "BAC+2", "Licence", "Master", "Ingénieur", "Doctorat"];
const isEmail = (value) => /\S+@\S+\.\S+/.test(value);
const isPhone = (value) => value && value.length >= 8;

function SignupStudentWizard() {
  const navigate = useNavigate();

  const [signupMethod, setSignupMethod] = useState(
    localStorage.getItem("signupMethod") || null
  );
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    faculty: "",
    domaine: "",
    grade: "",
    dateOfBirth: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [diplomaFile, setDiplomaFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const toast = useToast();

  const { user, reloadUser } = useAuth(); // Destructuring user from useAuth() was missing before line 166

  useEffect(() => {
    // If user is logged in via Google (even on refresh), prefill data
    if (user && (signupMethod === "google" || user.incomplete)) {
      setForm((prev) => ({
        ...prev,
        // Prioritize auth.currentUser because it might have the fresh Google profile data 
        // that context hasn't synced yet (or context has "User" fallback from somewhere else)
        fullname: auth.currentUser?.displayName || user.displayName || prev.fullname,
        email: user.email || prev.email,
        phone: prev.phone, // Keep manual inputs if any
      }));
      if (signupMethod === "google" || user.incomplete) {
        // Only skip to step 2 if we actually have a name.
        // If Google didn't provide a name, let user fill it in Step 1.
        const effectiveName = auth.currentUser?.displayName || user.displayName;

        if (effectiveName) {
          setStep(2);
        } else {
          // Stay on Step 1 but mark method
          setStep(1);
        }

        if (!signupMethod) {
          localStorage.setItem("signupMethod", "google");
          setSignupMethod("google");
        }
      }
    }
  }, [user, signupMethod]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, provider);

      // Check if account already exists
      const check = await authApi.profileExists();
      if (check.exists) {
        toast.success("Compte existant. Connexion en cours...");

        const userInfo = await authApi.getUserInfo();
        if (userInfo.user_type === 'company') navigate("/company-dashboard");
        else if (userInfo.user_type === 'admin') navigate("/admin/dashboard");
        else navigate("/dashboard");
        return;
      }

      localStorage.setItem("signupMethod", "google");
      setSignupMethod("google");
      // The useEffect will pick it up and setStep(2) or 1
    } catch (err) {
      setError(err.message || "Connexion Google impossible");
    }
  };

  const handleNextStep1 = async () => {
    setError("");
    if (!form.fullname || !form.email || (!password && signupMethod !== 'google')) {
      setError("Bas les masques ! Il nous faut au moins un nom et un email.");
      return;
    }
    if (signupMethod !== 'google' && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!isEmail(form.email)) {
      setError("Cet email semble incorrect.");
      return;
    }

    try {
      // Small mock check to avoid blocking if API is strictly checking
      // In real prod, keep this check
      const emailCheck = await signupApi.verifyEmail(form.email);
      if (emailCheck.exists && signupMethod !== "google") {
        setError("Cet email est déjà utilisé. Connectez-vous plutôt.");
        return;
      }
      setStep(2);
    } catch (err) {
      setError("Impossible de vérifier l'email.");
    }
  };

  const handleNextStep2 = async () => {
    setError("");
    if (!isPhone(form.phone)) {
      setError("Numéro de téléphone invalide.");
      return;
    }
    if (!form.address || !form.faculty || !form.domaine || !form.grade || !form.dateOfBirth) {
      setError("Dites-nous en plus sur votre parcours (et votre date de naissance).");
      return;
    }

    try {
      const phoneCheck = await signupApi.verifyPhone(form.phone);
      if (phoneCheck.exists) {
        setError("Ce numéro est déjà lié à un compte.");
        return;
      }
      setStep(3);
    } catch (err) {
      // En cas d'erreur API, on laisse passer pour pas bloquer
      console.warn("Phone check skipped due to error", err);
      setStep(3);
    }
  };



  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 5 * 1024 * 1024; // 5 Mo

    if (!file) return { valid: false, error: "Fichier manquant." };
    if (!allowedTypes.includes(file.type)) return { valid: false, error: `Format non supporté pour ${file.name} (PDF, Word, JPG, PNG uniquement).` };
    if (file.size > maxSize) return { valid: false, error: `Le fichier ${file.name} est trop volumineux (Max 5Mo).` };
    return { valid: true };
  };

  const handleSubmit = async () => {
    setError("");

    // 1. Validate files BEFORE creating any account
    if (!cvFile || !diplomaFile) {
      setError("Votre CV et votre Diplôme sont nécessaires pour valider votre profil.");
      return;
    }

    const cvCheck = validateFile(cvFile);
    if (!cvCheck.valid) {
      setError(cvCheck.error);
      return;
    }

    const diplomaCheck = validateFile(diplomaFile);
    if (!diplomaCheck.valid) {
      setError(diplomaCheck.error);
      return;
    }

    if (!recaptchaToken) {
      setError("Veuillez valider le captcha.");
      return;
    }

    let userCreatedHere = false;
    let user = auth.currentUser;

    try {
      setLoading(true);

      // 2. Create Authentication User if needed
      if (!user) {
        const cred = await createUserWithEmailAndPassword(auth, form.email, password);
        user = cred.user;
        userCreatedHere = true;
        await updateProfile(user, { displayName: form.fullname });
      }

      // 3. Upload Files
      // Note: If connection drops here, we attempt to clean up the user.
      const cvRes = await signupApi.uploadCv(cvFile);
      const diplomaRes = await signupApi.uploadDiploma(diplomaFile);

      if (!cvRes?.url || !diplomaRes?.url) throw new Error("Erreur lors de l'upload des fichiers.");

      // 4. Save Student Profile in Database
      const payload = {
        id: user.uid,
        email: form.email,
        fullname: form.fullname,
        phone: form.phone,
        address: form.address,
        faculty: form.faculty,
        domaine: form.domaine,
        grade: form.grade,
        cvUrl: cvRes.url,
        diplomaUrl: diplomaRes.url,
        dateOfBirth: form.dateOfBirth
      };

      await signupApi.signupStudent(payload);

      if (reloadUser) await reloadUser();

      localStorage.removeItem("signupMethod");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);

      // Cleanup: If we created the user just now and the process failed, delete the user
      // so we don't end up with an orphan account/duplicate email issue next time.
      if (userCreatedHere && user) {
        try {
          await user.delete();
          console.warn("Orphan account deleted successfully due to signup failure.");
        } catch (deleteErr) {
          console.error("Failed to delete orphan account:", deleteErr);
          // If this fails (e.g. network lost completely), the user remains created.
          // This is a known limitation, but we handled the common cases.
        }
      }

      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Inscription Étudiant</h1>
          <p className="text-slate-400">Complétez votre profil en 3 étapes simples.</p>
        </div>

        {/* Custom Stepper */}
        <div className="flex items-center justify-between mb-12 relative max-w-xs mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 -translate-y-1/2 rounded-full" />
          <div className={`absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-out`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />

          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110" : "bg-slate-800 text-slate-500"}`}>
              {step > s ? <Check size={18} /> : s}
            </div>
          ))}
        </div>

        {/* Card */}
        <motion.div
          layout
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-10 shadow-xl"
        >
          <StepTransition key={step}>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}

            {/* STEP 1: Account */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="text-blue-500" /> Identité
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-400">Nom complet</label>
                    <input
                      name="fullname"
                      type="text"
                      placeholder="Jean Dupont"
                      value={form.fullname}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 sm:py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-400">Email</label>
                    <input
                      name="email"
                      type="email"
                      disabled={signupMethod === 'google'}
                      placeholder="jean@etudiant.com"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {signupMethod !== 'google' && (
                  <>
                    <div className="space-y-1 relative">
                      <label className="text-sm font-medium text-slate-400">Mot de passe</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all pr-12"
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
                    <div className="space-y-1 relative">
                      <label className="text-sm font-medium text-slate-400">Confirmer mot de passe</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white focus:ring-2 outline-none transition-all pr-12 ${password !== confirmPassword && confirmPassword ? "border-red-500 focus:ring-red-500/50" : "border-slate-800 focus:ring-blue-500/50"}`}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4">
                  <button
                    onClick={handleNextStep1}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 sm:py-3.5 font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Suivant <ArrowRight size={18} />
                  </button>
                </div>

                {signupMethod !== 'google' && (
                  <>
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                      <div className="relative flex justify-center text-sm"><span className="bg-slate-900 px-2 text-slate-500">Ou</span></div>
                    </div>
                    <button
                      onClick={handleGoogleSignup}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-3.5 font-medium transition-colors flex items-center justify-center gap-3"
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
                      S'inscrire avec Google
                    </button>
                  </>
                )}
              </div>
            )}


            {/* STEP 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="text-blue-500" /> Parcours & Contact
                </h2>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-400">Date de naissance</label>
                  <input
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all [color-scheme:dark]"
                  />
                </div>


                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-400">Téléphone</label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-400">Ville / Adresse</label>
                    <input
                      name="address"
                      type="text"
                      placeholder="Casablanca, Maroc"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-400">Faculté / Institut</label>
                    <select
                      name="faculty"
                      value={form.faculty}
                      onChange={(e) => {
                        setForm({ ...form, faculty: e.target.value, domaine: "" });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
                    >
                      <option value="">Sélectionner...</option>
                      {Object.keys(facultiesData).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-400">Domaine d'études</label>
                    <select
                      name="domaine"
                      value={form.domaine}
                      onChange={handleChange}
                      disabled={!form.faculty}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none disabled:opacity-50"
                    >
                      <option value="">Sélectionner...</option>
                      {form.faculty && facultiesData[form.faculty].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-400">Niveau d'études</label>
                    <select
                      name="grade"
                      value={form.grade}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
                    >
                      <option value="">Sélectionner...</option>
                      {grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium flex items-center gap-2"
                  >
                    <ArrowLeft size={18} /> Retour
                  </button>
                  <button
                    onClick={handleNextStep2}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Continuer <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}


            {/* STEP 3: Documents */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="text-blue-500" /> Documents
                </h2>

                <p className="text-sm text-slate-400">
                  Fichiers acceptés: PDF, Word, JPG, PNG (Max 5Mo).
                </p>

                <div className="space-y-4">
                  {/* CV Upload */}
                  <div className="relative group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Votre CV</label>
                    <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${cvFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50"}`}>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={(e) => setCvFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {cvFile ? (
                        <>
                          <Check size={32} className="text-emerald-500 mb-2" />
                          <span className="text-emerald-400 font-medium truncate max-w-[200px]">{cvFile.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload size={24} className="text-slate-500 mb-2 group-hover:text-blue-400" />
                          <span className="text-slate-400 group-hover:text-slate-200">Cliquez pour ajouter votre CV</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Diploma Upload */}
                  <div className="relative group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Dernier Diplôme (ou certificat)</label>
                    <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${diplomaFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50"}`}>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={(e) => setDiplomaFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {diplomaFile ? (
                        <>
                          <Check size={32} className="text-emerald-500 mb-2" />
                          <span className="text-emerald-400 font-medium truncate max-w-[200px]">{diplomaFile.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload size={24} className="text-slate-500 mb-2 group-hover:text-blue-400" />
                          <span className="text-slate-400 group-hover:text-slate-200">Cliquez pour ajouter un justificatif</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Recaptcha onChange={setRecaptchaToken} />

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium flex items-center gap-2"
                  >
                    <ArrowLeft size={18} /> Retour
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Terminer l'inscription <Check size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </StepTransition>
        </motion.div>
      </div>
    </main >
  );
}

export default SignupStudentWizard;
