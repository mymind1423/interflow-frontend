import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useState, useRef, useEffect } from "react";
import { auth } from "../../firebase";
import { useAuth } from "../../authContext";
import Notifications from "../common/Notifications";
import { LogOut, User, ChevronDown, LayoutDashboard, Menu, X, Building, FileText, Bookmark, Calendar, CheckSquare, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../../api/client";
import { studentApi } from "../../api/studentApi";
import ConfirmationModal from "../common/ConfirmationModal";

function Navbar() {

  /* ... inside Navbar ... */
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]); // New state for token history
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false); // New state for token dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const tokenDropdownRef = useRef(null); // Ref for token dropdown

  useEffect(() => {
    // Don't fetch profile if we are in the middle of a signup wizard
    if (user && !location.pathname.includes("/signup")) {
      apiFetch("/api/profile/get")
        .then(data => setProfile(data))
        .catch(err => {
          // Ignore 403/404 during potential race conditions in signup
          if (err.status !== 403 && err.status !== 404) {
            console.error("Navbar profile fetch error", err);
          }
        });

      if (user.userType === 'student') {
        studentApi.getApplications()
          .then(data => setApplications(data))
          .catch(err => console.error("Navbar apps fetch error", err));
      }
    }
  }, [user, location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Auto-cancel registration if user leaves the signup flow
  useEffect(() => {
    if (!user) return;

    // Check if user is incomplete (authContext sets userType to 'unknown'/incomplete on 403)
    const isIncomplete = user.userType === 'unknown' || user.incomplete;
    const isSignupPage = location.pathname.startsWith('/signup');
    const isLoginPage = location.pathname.startsWith('/login');

    if (isIncomplete && !isSignupPage && !isLoginPage) {
      // User wandered off -> Kill the temporary account
      const autoCleanup = async () => {
        try {
          if (auth.currentUser) {
            console.log("Cleaning up incomplete account...");
            await auth.currentUser.delete(); // Attempt delete
          }
        } catch (e) {
          console.warn("Account deletion failed (likely requires re-auth), forcing logout.", e);
        } finally {
          await signOut(auth);
          window.location.href = "/"; // Force hard reload to clear all states
        }
      };
      autoCleanup();
    }
  }, [user, location.pathname]);

  // Modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const confirmCancelSignup = () => {
    setConfirmModal({
      isOpen: true,
      title: "Abandonner l'inscription ?",
      message: "Votre compte temporaire sera supprimé et toutes les données perdues.",
      confirmText: "Abandonner",
      isDangerous: true,
      onConfirm: handleCancelSignup
    });
  };

  const handleCancelSignup = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.delete(); // Clean up Firebase User
      }
      await signOut(auth);
      navigate("/");
      // Force reload to clear any cached states
      window.location.reload();
    } catch (err) {
      console.error("Cancellation error", err);
      await signOut(auth);
      navigate("/");
    }
  };

  const displayName = profile?.fullname || profile?.name || user?.displayName || user?.email || "Utilisateur";
  const avatarUrl = profile?.photoUrl || profile?.photo_url || user?.photoURL || "https://ui-avatars.com/api/?name=" + displayName + "&background=random";

  const userType = user?.userType || profile?.userType;

  // Don't show nav links if user is incomplete/unknown (still in signup flow)
  const navLinks = (user && userType !== 'unknown') ? (
    userType === "admin" ? [
      { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/admin/companies", label: "Entreprises", icon: Building },
      { path: "/admin/students", label: "Étudiants", icon: User },
      { path: "/admin/applications", label: "Candidatures", icon: CheckSquare },
      { path: "/admin/interviews", label: "Planning", icon: Calendar },
    ] : userType === "company" ? [
      { path: "/company-dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/company-applications", label: "Candidatures", icon: CheckSquare },
      { path: "/company-talents", label: "Vivier", icon: User },
      { path: "/company-planning", label: "Planning", icon: Calendar },
      { path: "/company/live", label: "Live Manager", icon: Video },
      { path: "/profile", label: "Profil", icon: Building },
    ] : [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/applications", label: "Candidatures", icon: FileText },
      { path: "/interviews", label: "Entretiens", icon: Calendar },
      { path: "/saved-jobs", label: "Favoris", icon: Bookmark },
      { path: "/companies", label: "Entreprises", icon: Building },
      { path: "/live", label: "Espace Live", icon: Video },
    ]
  ) : [];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 glass-card z-50 border-x-0 border-t-0 rounded-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2 z-20">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              I
            </div>
            <span className="text-white hidden md:block">Intern<span className="text-blue-500">Flow</span></span>
          </Link>

          {/* Desktop Navigation (Centered) */}
          {user && (
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive(link.path) ? "text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-slate-800 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <link.icon size={16} />
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-4 text-sm z-20">
            {!user || (userType === 'unknown' && !location.pathname.startsWith('/signup')) ? (
              <div className="hidden md:flex items-center gap-4">


                <Link to="/signup" className="text-slate-400 hover:text-white transition-colors">Inscription</Link>
                <Link to="/login" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-colors shadow-lg shadow-blue-600/20">
                  Connexion
                </Link>
              </div>
            ) : userType === 'unknown' ? (
              // Minimal header for user incomplete registration
              <div className="hidden md:flex items-center gap-4">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider text-right leading-tight">
                  Inscription <br /> En cours...
                </span>
                <button
                  onClick={confirmCancelSignup}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all"
                >
                  <X size={14} /> Annuler
                </button>
              </div>
            ) : (
              <>
                {/* Token Counter for Students (Logged In) */}
                {userType === "student" && profile?.tokensRemaining !== undefined && (
                  <div className="hidden md:flex flex-col items-end mr-2 group relative" ref={tokenDropdownRef}>
                    <button
                      onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-colors"
                    >
                      <span>⚡ {profile.tokensRemaining}/{profile.maxTokens || 5}</span>
                      <ChevronDown size={12} className={`transition-transform ${isTokenDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Token Dropdown */}
                    <AnimatePresence>
                      {isTokenDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full mt-2 right-0 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historique des Jetons</h4>
                          </div>
                          <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {applications.length > 0 ? (
                              <div className="divide-y divide-slate-800/50">
                                {applications.map(app => (
                                  <div key={app.id} className="p-3 hover:bg-white/5 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-xs font-bold text-white line-clamp-1">{app.jobTitle}</span>
                                      <span className="text-xs text-amber-500 font-mono whitespace-nowrap">-1 ⚡</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                                      <span>{app.companyName}</span>
                                      <span className={`px-1.5 py-0.5 rounded border ${app.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {app.status === 'PENDING' ? 'En cours' : app.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 text-center text-slate-500 text-xs">
                                Aucun jeton utilisé.
                              </div>
                            )}
                          </div>
                          <div className="px-4 py-3 bg-slate-950/50 border-t border-slate-800 text-[10px] text-slate-500 text-center">
                            1 Candidature = 1 Jeton. <br /> Remboursé si refusé ou supprimé.
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <Notifications />

                {/* User Dropdown (Visible on all screens now) */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 p-1 pr-0 md:pr-3 rounded-full hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800"
                  >
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover border border-slate-700 bg-slate-800"
                    />
                    <ChevronDown size={14} className={`text-slate-400 transition-transform hidden md:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-slate-800">
                          <p className="text-sm font-medium text-white truncate">{displayName}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                          >
                            <User size={16} />
                            Mon Profil
                          </Link>
                        </div>

                        <div className="border-t border-slate-800 py-1">
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut size={16} />
                            Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white relative z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? null : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Sidebar (Moved Outside Nav for Correct Stacking) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            {/* Sidebar */}
            <motion.div
              key="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-slate-950 border-r border-slate-800 z-[70] flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-800">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                    I
                  </div>
                  <span className="text-white">Intern<span className="text-blue-500">Flow</span></span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                {user ? (
                  <>
                    {/* User Info Capsule */}
                    <div className="mb-6 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center gap-3">
                      <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full bg-slate-800 object-cover" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${isActive(link.path)
                          ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                          : "text-slate-400 hover:bg-slate-900 hover:text-white"
                          }`}
                      >
                        <link.icon size={20} />
                        {link.label}
                      </Link>
                    ))}

                    <div className="h-px bg-slate-800 my-4" />

                    <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium">
                      <LogOut size={20} /> Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3.5 bg-slate-800 text-white rounded-xl text-center font-bold">Connexion</Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3.5 bg-blue-600 text-white rounded-xl text-center font-bold shadow-lg shadow-blue-600/20">Inscription</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDangerous={confirmModal.isDangerous}
        onConfirm={confirmModal.onConfirm}
      />
    </>
  );
}

export default Navbar;
