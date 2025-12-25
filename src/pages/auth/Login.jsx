import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../firebase";
import { authApi } from "../../api/authApi";
import { motion } from "framer-motion";
import { LogIn, ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const provider = new GoogleAuthProvider();
const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
        } else if (userInfo.user_type === 'admin') {
          navigate("/admin/dashboard");
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
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const exists = await authApi.profileExists();
      if (exists.exists) {
        navigate("/dashboard");
      } else {
        localStorage.setItem("signupMethod", "google");
        navigate("/signup/student");
      }
    } catch (err) {
      setError(err.message || "Connexion Google impossible");
      toast.error("Erreur de connexion Google", 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950">

      {/* Left: Branding & Message */}
      <div className="hidden lg:flex flex-col justify-center p-12 relative overflow-hidden bg-slate-900">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-600/10 blur-[100px]" />

        <div className="relative z-10 max-w-lg mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">Bon retour parmi nous ! 👋</h1>
          <p className="text-lg text-slate-400 mb-8 leading-relaxed">
            Reprenez vos recherches là où vous les aviez laissées. De nouvelles offres vous attendent chaque jour.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
              <div className="text-2xl font-bold text-blue-400 mb-1">200+</div>
              <div className="text-sm text-slate-500">Nouvelles offres</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
              <div className="text-2xl font-bold text-indigo-400 mb-1">95%</div>
              <div className="text-sm text-slate-500">Taux de réponse</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Connexion</h2>
            <p className="mt-2 text-slate-400">Entrez vos identifiants pour accéder à votre compte.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-12 py-3 sm:py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                  placeholder="votre.email@ecole.com"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-12 py-3 sm:py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium pr-12"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
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
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-950 px-2 text-slate-500">Ou continuer avec</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-700 transition-all text-white font-medium"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Google
          </button>

          <p className="text-center text-slate-400">
            Pas encore de compte ?{" "}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;


