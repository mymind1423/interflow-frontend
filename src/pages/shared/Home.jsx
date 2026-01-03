import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Briefcase, Users, FileText, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">

      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              La plateforme #1 pour votre carrière
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              Trouvez l'emploi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                qui lance votre avenir
              </span>
            </h1>


            <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed">
              Connectez-vous aux meilleures entreprises, gérez vos candidatures et boostez votre profil.
              Simplement. Efficacement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-1 flex items-center gap-2"
              >
                Commencer gratuitement <ArrowRight size={20} />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-white rounded-full font-bold text-lg transition-all backdrop-blur-sm"
              >
                Se connecter
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 grayscale opacity-70">
              {/* Put mock logos here or simply text for now */}
              <span className="font-bold text-xl">TechCorp</span>
              <span className="font-bold text-xl">InnoSoft</span>
              <span className="font-bold text-xl">FutureTech</span>
              <span className="font-bold text-xl">GlobalData</span>
            </div>

          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Briefcase}
              title="Offres ciblées"
              desc="Accédez à des milliers d'offres d'emploi et d'alternance sélectionnées pour vous."
            />

            <FeatureCard
              icon={FileText}
              title="Candidature simplifiée"
              desc="Postulez en un clic avec votre profil complet. Plus besoin de remplir 50 formulaires."
            />
            <FeatureCard
              icon={Users}
              title="Connexion directe"
              desc="Échangez directement avec les recruteurs et suivez l'état de vos demandes."
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-y border-slate-800 bg-slate-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-4 gap-8 text-center">
            <StatItem value="10k+" label="Étudiants" />
            <StatItem value="500+" label="Entreprises" />
            <StatItem value="2k+" label="Offres actives" />
            <StatItem value="95%" label="Satisfaction" />
          </div>
        </section>

      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 transition-colors group">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all">
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}

function StatItem({ value, label }) {
  return (
    <div>
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <div className="text-blue-400 font-medium uppercase tracking-wider text-sm">{label}</div>
    </div>
  )
}
