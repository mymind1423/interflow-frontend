import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../firebase";
import { authApi } from "../../api/authApi";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, ArrowRight, Mail, Lock, Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Recaptcha from "../../components/common/Recaptcha";

const provider = new GoogleAuthProvider();
const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  // New state for password reset
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Email invalide");
      return;
    }
    if (!password) {
      setError("Mot de passe requis");
      return;
    }

    if (!recaptchaToken) {
      setError("Veuillez valider le captcha.");
      return;
    }

    try {
      setLoading(true);

      const user = await signInWithEmailAndPassword(auth, email, password);
      const pending = await authApi.pendingStatus();

      if (pending.pending) {
        navigate("/pending-approval");
        return;
      }

      const exists = await authApi.profileExists();
      if (exists.exists) {
        const userInfo = await authApi.getUserInfo();
        if (userInfo.user_type === 'company') {
          navigate("/company-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/signup/student");
      }
    } catch (err) {
      const message =
        err.code === "auth/invalid-credential"
          ? "Email ou mot de passe incorrect."
          : err.message || "Impossible de se connecter.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isValidEmail(resetEmail)) {
      toast.error("Veuillez entrer un email valide");
      return;
    }

    try {
      setResetLoading(true);
      // Simulate sending if firebase fails or just use firebase
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Email de réinitialisation envoyé ! Vérifiez vos spams.");
      setIsResetMode(false);
    } catch (err) {
      console.error(err);
      // If firebase isn't fully set up for this, we mock it for the user experience as requested
      if (err.code === 'auth/user-not-found') {
        toast.error("Aucun compte associé à cet email.");
      } else {
        // Mock success if it's a configuration issue, to satisfy the "add feature" request visually
        // toast.success("Email de réinitialisation envoyé ! (Simulation)"); 
        // Better to show real error if possible, but let's stick to standard error handling
        toast.error("Erreur: " + err.message);
      }
    } finally {
      setResetLoading(false);
    }
  };

  // Force strict cleanup
  useEffect(() => {
    // Basic cleanup check logic
  }, []);

  const handleGoogleLogin = async () => {
    setError("");
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const exists = await authApi.profileExists();
      if (exists.exists) {
        const userInfo = await authApi.getUserInfo();
        if (userInfo.user_type === 'company') {
          navigate("/company-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error("Compte inexistant. Veuillez créer un compte.", 4000);
      }
    } catch (err) {
      setError(err.message || "Connexion Google impossible");
      toast.error("Erreur de connexion Google", 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-body transition-colors duration-300">

      {/* Left: Branding & Message */}
      <div className="hidden lg:flex flex-col justify-center p-12 relative overflow-hidden glass-panel border-r border-white/10">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-600/10 blur-[100px]" />

        <div className="relative z-10 max-w-lg mx-auto">
          <h1 className="text-4xl font-bold text-theme-primary mb-6">Bon retour parmi nous ! 👋</h1>
          <p className="text-lg text-theme-secondary mb-8 leading-relaxed">
            Reprenez vos recherches là où vous les aviez laissées. De nouvelles offres vous attendent chaque jour.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-2xl font-bold text-blue-500 mb-1">200+</div>
              <div className="text-sm text-theme-secondary">Nouvelles offres</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-2xl font-bold text-indigo-500 mb-1">95%</div>
              <div className="text-sm text-theme-secondary">Taux de réponse</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {!isResetMode ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary">Connexion</h2>
                  <p className="mt-2 text-theme-secondary">Entrez vos identifiants pour accéder à votre compte.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6" noValidate>
                  <div className="space-y-4">
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input
                        type="email"
                        required
                        className="w-full bg-white border border-gray-200 rounded-xl px-12 py-3 sm:py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        placeholder="votre.email@ecole.com"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full bg-white border border-gray-200 rounded-xl px-12 py-3 sm:py-3.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium pr-12"
                        placeholder="••••••••"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <Recaptcha onChange={setRecaptchaToken} />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" />
                      <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors font-medium">Se souvenir de moi</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 sm:py-4 font-bold text-lg shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Se connecter <ArrowRight size={20} /></>
                    )}
                  </button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-transparent px-2 text-theme-secondary backdrop-blur-sm">Ou continuer avec</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/5 hover:bg-white/10 transition-all text-theme-primary font-medium"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Google
                </button>

                <p className="text-center text-theme-secondary">
                  Pas encore de compte ?{" "}
                  <Link to="/signup" className="text-blue-500 hover:text-blue-400 font-semibold hover:underline">
                    Créer un compte
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center lg:text-left">
                  <button
                    onClick={() => setIsResetMode(false)}
                    className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme-primary mb-4 transition-colors"
                  >
                    <ArrowLeft size={16} /> Retour
                  </button>
                  <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary flex items-center gap-3">
                    <KeyRound className="text-blue-500" />
                    Réinitialisation
                  </h2>
                  <p className="mt-2 text-theme-secondary">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                      type="email"
                      required
                      className="w-full bg-white/5 border border-slate-200 dark:border-slate-800 rounded-xl px-12 py-3 sm:py-3.5 text-theme-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium backdrop-blur-sm"
                      placeholder="votre.email@ecole.com"
                      onChange={(e) => setResetEmail(e.target.value)}
                      value={resetEmail}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 sm:py-4 font-bold text-lg shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? (
                      <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Envoyer le lien <ArrowRight size={20} /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Login;
