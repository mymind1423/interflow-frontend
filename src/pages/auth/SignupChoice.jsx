import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Building2, ArrowRight } from "lucide-react";

function SignupChoice() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950 py-20">
      <div className="max-w-5xl w-full text-center space-y-12">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Bienvenue sur InternFlow</h1>
          <p className="text-xl text-slate-400">Quel type de compte souhaitez-vous créer ?</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Student Card */}
          <Link
            to="/signup/student"
            onClick={() => localStorage.removeItem("signupMethod")}
            className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-10 hover:bg-slate-800/80 hover:border-blue-500/50 transition-all duration-300 text-left hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 blur-2xl group-hover:bg-blue-500/20 transition-all" />

            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <GraduationCap size={32} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">Je suis Étudiant</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Trouvez votre stage de rêve, gérez vos candidatures et boostez votre carrière avec nos outils IA.
            </p>

            <div className="flex items-center text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
              Commencer <ArrowRight size={20} className="ml-2" />
            </div>
          </Link>

          {/* Company Card */}
          <Link
            to="/signup/company"
            className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-10 hover:bg-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 text-left hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 blur-2xl group-hover:bg-emerald-500/20 transition-all" />

            <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Building2 size={32} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">Je suis Recruteur</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Publiez vos offres, gérez les talents et trouvez les meilleurs profils pour votre entreprise.
            </p>

            <div className="flex items-center text-emerald-400 font-bold group-hover:translate-x-2 transition-transform">
              Créer un compte <ArrowRight size={20} className="ml-2" />
            </div>
          </Link>

        </div>

        <p className="text-slate-500">
          Déjà un compte ? {" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  );
}

export default SignupChoice;
