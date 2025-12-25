import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useRegisterSW } from 'virtual:pwa-register/react'

const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (PWA installed)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');
    setIsStandalone(isInStandaloneMode);

    if (isInStandaloneMode) return; // Don't setup install listeners if already installed

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        setInstallPrompt(null);
      });
    } else {
      setShowInstructions(true);
    }
  };

  const close = () => {
    setNeedRefresh(false)
  }

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isStandalone || !isMobile) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="fixed bottom-6 left-6 z-50 bg-white text-blue-900 border border-blue-200 shadow-2xl rounded-full px-6 py-3 font-bold flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group"
      >
        <div className="bg-blue-600 text-white p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="M6 8h.001" /><path d="M10 8h.001" /><path d="M14 8h.001" /><path d="M18 8h.001" /><path d="M8 12h.001" /><path d="M12 12h.001" /><path d="M16 12h.001" /><path d="M7 20h10" /></svg>
        </div>
        <span className="group-hover:text-blue-600 transition-colors">Installer l'App</span>
      </button>

      {/* Instructions Modal if Auto-Install not available */}
      {showInstructions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setShowInstructions(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
            <h3 className="text-xl font-bold text-white mb-4">Installer InternFlow</h3>

            {isIOS ? (
              <div className="space-y-4">
                <p className="text-slate-300">Sur iOS (iPhone/iPad) :</p>
                <ol className="list-decimal list-inside text-slate-400 space-y-2 text-sm">
                  <li>Appuyez sur le bouton <strong>Partager</strong> <span className="inline-block bg-slate-800 p-1 rounded">⎋</span></li>
                  <li>Faites défiler vers le bas</li>
                  <li>Sélectionnez <strong>"Sur l'écran d'accueil"</strong> <span className="inline-block bg-slate-800 p-1 rounded">➕</span></li>
                </ol>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-300">Si l'installation automatique ne démarre pas :</p>
                <ul className="list-disc list-inside text-slate-400 space-y-2 text-sm">
                  <li>Vérifiez que vous n'avez pas déjà installé l'app.</li>
                  <li>Cherchez l'icône d'installation dans la barre d'adresse de votre navigateur (ordinateur).</li>
                  <li>Ou utilisez le menu du navigateur (3 points) {'>'} <strong>"Installer l'application"</strong>.</li>
                </ul>
              </div>
            )}

            <button onClick={() => setShowInstructions(false)} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold">Compris</button>
          </div>
        </div>
      )}

      {/* Update Prompt Toast */}
      {needRefresh && (
        <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-white">Mise à jour disponible</h3>
            <p className="text-sm text-slate-400">Une nouvelle version de l'application est prête.</p>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex-1 transition-colors"
              onClick={() => updateServiceWorker(true)}
            >
              Mettre à jour
            </button>
            <button
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              onClick={close}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <UpdatePrompt />
  </StrictMode>,
)
