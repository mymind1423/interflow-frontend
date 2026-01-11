import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useState, useRef, useEffect } from "react";
import { auth } from "../../firebase";
import { useAuth } from "../../authContext";
import { useTheme } from "../../context/ThemeContext";
import { useProfile } from "../../context/ProfileContext";
import { useNotifications } from "../../context/NotificationContext";
import Notifications from "../common/Notifications";
import NotificationDropdown from "../common/NotificationDropdown";
import { LogOut, User, ChevronDown, LayoutDashboard, Menu, X, Building, FileText, Bookmark, Calendar, CheckSquare, Video, Briefcase, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../../api/client";
import { studentApi } from "../../api/studentApi";
import ConfirmationModal from "../common/ConfirmationModal";

function Navbar() {

  /* ... inside Navbar ... */
  /* ... inside Navbar ... */
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  // const [profile, setProfile] = useState(null); // REMOVED: Using context
  const [applications, setApplications] = useState([]); // New state for token history
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false); // New state for token dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  /* Navbar Logic */
  const tokenDropdownRef = useRef(null);

  // Theme Logic
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Click outside handler
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (tokenDropdownRef.current && !tokenDropdownRef.current.contains(event.target)) {
        setIsTokenDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll effect for Navbar
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Fetch apps history for dropdown
    if (user && !location.pathname.includes("/signup")) {
      /* REMOVED: Profile fetching moved to Context */

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
      { path: "/company-profile", label: "Profil", icon: Building },
    ] : [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/jobs", label: "Offres", icon: Briefcase },
      { path: "/applications", label: "Candidatures", icon: FileText },
      { path: "/interviews", label: "Entretiens", icon: Calendar },
      { path: "/saved-jobs", label: "Favoris", icon: Bookmark },
      { path: "/profile", label: "Profil", icon: User },
    ]
  ) : [];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${scrolled
          ? "glass-panel shadow-sm" // Use generic glass-panel which adapts to theme
          : "bg-transparent border-transparent"
          }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 h-18 md:h-20 flex items-center justify-between gap-4 transition-all duration-300 relative">

          {/* Logo */}
          <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-3 z-20 group">
            <img src="/logo.png" alt="InternFlow Logo" className="w-10 h-10 object-contain relative z-20" />
            {/* Hide brand text when logged in to save space */}
            {!user && (
              <span className="text-theme-primary hidden md:block font-display text-lg">
                Intern<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Flow</span>
              </span>
            )}
          </Link>

          {/* Desktop Navigation (Centered) */}
          {user && (
            <div className="hidden md:flex flex-1 justify-center items-center z-10 shrink-1 min-w-0 mx-4">
              <div className="flex items-center gap-1 glass-panel p-1.5 rounded-full overflow-x-auto no-scrollbar max-w-full">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 lg:px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${isActive(link.path) ? "bg-blue-600 text-white shadow-md" : "text-theme-secondary hover:bg-slate-100 dark:hover:bg-white/10"
                      }`}
                  >
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/25"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {/* Badge logic */}
                    {(() => {
                      let count = 0;
                      if (link.label === "Offres") {
                        count = notifications.filter(n => !n.isRead && (n.type === 'job' || n.type === 'offer')).length;
                      } else if (link.label === "Candidatures") {
                        count = notifications.filter(n => !n.isRead && (n.type === 'application' || n.type === 'invitation')).length;
                      } else if (link.label === "Entretiens") {
                        count = notifications.filter(n => !n.isRead && n.type === 'interview').length;
                      } else if (link.label === "Entreprises") {
                        count = notifications.filter(n => !n.isRead && n.type === 'company_signup').length;
                      } else if (link.label === "Étudiants") {
                        count = notifications.filter(n => !n.isRead && n.type === 'student_signup').length;
                      } else if (link.label === "Planning") {
                        count = notifications.filter(n => !n.isRead && n.type === 'interview').length;
                      }

                      return count > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-slate-900 shadow-md animate-in zoom-in duration-300 z-10">
                          {count > 9 ? '9+' : count}
                        </span>
                      );
                    })()}
                    <span className="relative z-10 flex items-center gap-2">
                      <link.icon size={15} className={isActive(link.path) ? "text-blue-100" : ""} />
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3 lg:gap-4 text-sm z-20 shrink-0">
            {!user || (userType === 'unknown' && !location.pathname.startsWith('/signup')) ? (
              <div className="hidden md:flex items-center gap-4">


                <Link to="/signup" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors font-medium">Inscription</Link>
                <Link to="/login" className="relative group px-6 py-2.5 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative text-white font-bold text-sm">Connexion</span>
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
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-slate-900/50 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider hover:bg-amber-100 dark:hover:bg-amber-500/10 hover:border-amber-300 dark:hover:border-amber-500/40 transition-all shadow-sm"
                    >
                      <span className="text-lg">🪙</span>
                      <span>{profile.tokensRemaining} Jetons</span>
                      <ChevronDown size={12} className={`transition-transform duration-300 ${isTokenDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Token Dropdown */}
                    <AnimatePresence>
                      {isTokenDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full mt-3 right-0 w-80 glass-panel rounded-2xl shadow-xl overflow-hidden z-50"
                        >
                          <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                            <h4 className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Historique des Jetons</h4>
                          </div>
                          <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {applications.length > 0 ? (
                              <div className="divide-y divide-white/5">
                                {applications.map(app => (
                                  <div key={app.id} className="p-3 hover:bg-white/5 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-xs font-bold text-theme-primary line-clamp-1">{app.jobTitle}</span>
                                      <span className="text-xs text-amber-500 font-mono whitespace-nowrap">-1 ⚡</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-theme-secondary">
                                      <span>{app.companyName}</span>
                                      <span className={`px-1.5 py-0.5 rounded border ${app.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        app.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        }`}>
                                        {app.status === 'PENDING' ? 'En cours' : app.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 text-center text-theme-secondary text-xs">
                                Aucun jeton utilisé.
                              </div>
                            )}
                          </div>
                          <div className="px-4 py-3 bg-white/5 border-t border-white/10 text-[10px] text-theme-secondary text-center">
                            1 Candidature = 1 Jeton. <br /> Remboursé si refusé ou supprimé.
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {/* Notifications */}
                <div className="hidden md:block">
                  <NotificationDropdown />
                </div>
                {/* User Dropdown (Visible on all screens now) */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-all outline-none group border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                  >
                    <div className="relative">
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover border-2 border-slate-700 group-hover:border-blue-500 transition-colors shadow-lg"
                      />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 hidden md:block ${isDropdownOpen ? 'rotate-180' : ''} group-hover:text-blue-400`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95, transformOrigin: "top right" }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 glass-panel rounded-2xl shadow-xl py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10">
                          <p className="text-sm font-medium text-theme-primary truncate">{displayName}</p>
                          <p className="text-xs text-theme-secondary truncate">{user.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            to={userType === 'company' ? '/company-profile' : '/profile'}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-theme-secondary hover:bg-slate-100 dark:hover:bg-white/10 hover:text-theme-primary transition-colors"
                          >
                            <User size={16} />
                            Mon Profil
                          </Link>
                        </div>

                        <div className="border-t border-slate-200 dark:border-white/10 py-1">
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-theme-secondary hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile Menu Button - HIDDEN for Mobile First (BottomNav used instead) */}
            {/* <button
              className="md:hidden p-2 text-slate-400 hover:text-white relative z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? null : <Menu size={24} />}
            </button> */}
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
              className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 z-[70] flex flex-col shadow-2xl"
            >
              <div className="flex h-16 items-center justify-between px-4 md:px-8">
                {/* Logo - Only show full logo if NOT logged in, or just icon? 
              User asked to "delete InternFlow when user is connected". 
              Let's keep the Icon maybe? Or hide text. */}
                <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2 relative z-50">
                  {!user && (
                    <>
                      <img src="/logo.png" alt="InternFlow Logo" className="w-8 h-8 object-contain" />
                      <span className="text-theme-primary">Intern<span className="text-blue-600">Flow</span></span>
                    </>
                  )}
                  {user && (
                    /* If user logged in, maybe just show Icon? Or nothing? 
                       "efface InterFlwo... pour quon gagne de lesapce" implies clearing the left side?
                       But we need a home link. Let's keep just the Icon. */
                    <img src="/logo.png" alt="InternFlow Logo" className="w-8 h-8 object-contain" />
                  )}
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors border border-transparent dark:hover:border-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                {user ? (
                  <>
                    {/* User Info Capsule */}
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/5 flex items-center gap-3 shadow-inner relative overflow-hidden">
                      <div className="absolute inset-0 bg-blue-500/5" />
                      <img src={avatarUrl} alt="" className="w-12 h-12 rounded-full bg-slate-800 object-cover border-2 border-slate-800 shadow-lg relative z-10" />
                      <div className="overflow-hidden relative z-10">
                        <p className="text-sm font-bold text-white truncate">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate mb-2">{user.email}</p>
                        {/* Mobile Token Indicator */}
                        {userType === "student" && profile?.tokensRemaining !== undefined && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold">
                            <span>🪙</span> {profile.tokensRemaining} Jetons
                          </div>
                        )}
                      </div>
                    </div>

                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all relative ${isActive(link.path)
                          ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                          : "text-slate-400 hover:bg-slate-900 hover:text-white"
                          }`}
                      >
                        <link.icon size={20} />
                        {link.label}
                        {/* Mobile Badge Logic */}
                        {(() => {
                          let count = 0;
                          if (link.label === "Offres") {
                            count = notifications.filter(n => !n.isRead && (n.type === 'job' || n.type === 'offer')).length;
                          } else if (link.label === "Candidatures") {
                            count = notifications.filter(n => !n.isRead && n.type === 'application').length;
                          } else if (link.label === "Entretiens") {
                            count = notifications.filter(n => !n.isRead && n.type === 'interview').length;
                          } else if (link.label === "Entreprises") {
                            count = notifications.filter(n => !n.isRead && n.type === 'company_signup').length;
                          } else if (link.label === "Étudiants") {
                            count = notifications.filter(n => !n.isRead && n.type === 'student_signup').length;
                          }

                          return count > 0 && (
                            <span className="absolute top-3 right-4 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                              {count > 9 ? '9+' : count}
                            </span>
                          );
                        })()}
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
