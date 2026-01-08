import Button from "../components/common/Button";
import { Home, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
            {/* Background Blobs */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel max-w-lg w-full p-8 md:p-12 rounded-3xl text-center relative z-10 border border-white/60 shadow-2xl"
            >
                <div className="text-9xl mb-4 transform hover:scale-110 transition-transform cursor-default select-none">
                    🤔
                </div>

                <h1 className="text-4xl font-black text-theme-primary mb-2">404</h1>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Oups, cette page sèche les cours ?</h2>

                <p className="text-gray-500 mb-8 leading-relaxed">
                    Il semblerait que vous soyez perdu dans les couloirs du campus numérique.
                    Revenez en sécurité avant que le surveillant n'arrive !
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button to="/" variant="primary" icon={Home}>
                        Retour à l'accueil
                    </Button>
                    <Button to="/jobs" variant="secondary" icon={Search}>
                        Chercher une offre
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
