import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import Home from "./pages/shared/Home";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/student/Dashboard";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import SignupChoice from "./pages/auth/SignupChoice";
import SignupStudent from "./pages/auth/SignupStudentWizard";
import SignupCompany from "./pages/auth/SignupCompanyWizard";
import PrivateRoute from "./components/layout/PrivateRoute";
import PendingApproval from "./pages/auth/PendingApproval";
import ProfilePage from "./pages/student/Profile";
import StudentLayout from "./components/layout/StudentLayout";
import CompanyLayout from "./components/layout/CompanyLayout";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import Applications from "./pages/student/Applications";
import SavedJobs from "./pages/student/SavedJobs";
import StudentInterviews from "./pages/student/StudentInterviews";
import CompanyApplications from "./pages/company/CompanyApplications";
import CompanyPlanning from "./pages/company/CompanyPlanning";
import CompanyTalents from "./pages/company/CompanyTalents";
import StudentBadge from "./pages/student/StudentBadge";
import StudentJobs from "./pages/student/StudentJobs";
import PublicProfile from "./pages/shared/PublicProfile";
import LiveInterviewDashboard from "./pages/company/LiveInterviewDashboard";
import ActiveInterviewSession from "./pages/company/ActiveInterviewSession";
import NotFound from "./pages/NotFound";

import Landing from "./templates/saas-theme/Landing";
import StudentDashboard from "./templates/saas-theme/StudentDashboard";
import AdminPanel from "./templates/saas-theme/AdminPanel";

import BentoLanding from "./templates/bento-dark-theme/Landing";
import BentoDashboard from "./templates/bento-dark-theme/StudentDashboard";
import BentoAdmin from "./templates/bento-dark-theme/AdminPanel";

import PopLanding from "./templates/soft-pop-theme/Landing";
import PopDashboard from "./templates/soft-pop-theme/StudentDashboard";
import PopAdmin from "./templates/soft-pop-theme/AdminPanel";

import GlobalSkeletonLoader from "./components/common/GlobalSkeletonLoader";
import { AuthProvider, useAuth } from "./authContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProfileProvider } from "./context/ProfileContext";
import { NotificationProvider } from "./context/NotificationContext";

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <GlobalSkeletonLoader />;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupChoice />} />
        <Route path="/signup/student" element={<SignupStudent />} />
        <Route path="/signup/company" element={<SignupCompany />} />
        <Route path="/pending-approval" element={<PendingApproval />} />



        {/* Student Specific Routes */}
        <Route element={<PrivateRoute allowedRoles={["student"]}><StudentLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/jobs" element={<StudentJobs />} />
          <Route path="/saved-jobs" element={<SavedJobs />} />
          <Route path="/interviews" element={<StudentInterviews />} />
          <Route path="/my-badge" element={<StudentBadge />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<PrivateRoute><StudentLayout /></PrivateRoute>}>
          <Route path="/p/:studentId" element={<PublicProfile />} />
        </Route>

        {/* Company Specific Routes */}
        <Route element={<PrivateRoute allowedRoles={["company"]}><CompanyLayout /></PrivateRoute>}>
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/company-applications" element={<CompanyApplications />} />
          <Route path="/company-talents" element={<CompanyTalents />} />
          <Route path="/company-planning" element={<CompanyPlanning />} />
          <Route path="/company/live" element={<LiveInterviewDashboard />} />
          <Route path="/company/live/:id" element={<ActiveInterviewSession />} />
          <Route path="/company-profile" element={<ProfilePage />} />
        </Route>


        {/* SaaS Template Routes (For Testing) */}
        <Route path="/template/saas/landing" element={<Landing />} />
        <Route path="/template/saas/dashboard" element={<StudentDashboard />} />
        <Route path="/template/saas/admin" element={<AdminPanel />} />


        {/* Bento Template Routes (For Testing) */}
        <Route path="/template/bento/landing" element={<BentoLanding />} />
        <Route path="/template/bento/dashboard" element={<BentoDashboard />} />
        <Route path="/template/bento/admin" element={<BentoAdmin />} />


        {/* Soft Pop Template Routes (For Testing) */}
        <Route path="/template/pop/landing" element={<PopLanding />} />
        <Route path="/template/pop/dashboard" element={<PopDashboard />} />
        <Route path="/template/pop/admin" element={<PopAdmin />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <ToastProvider>
            <NotificationProvider>
              <ProfileProvider>
                <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
                <AppContent />
              </ProfileProvider>
            </NotificationProvider>
          </ToastProvider>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

