import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
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
import Companies from "./pages/student/Companies";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import Applications from "./pages/student/Applications";
import SavedJobs from "./pages/student/SavedJobs";
import StudentInterviews from "./pages/student/StudentInterviews";
import CompanyApplications from "./pages/company/CompanyApplications";
import CompanyPlanning from "./pages/company/CompanyPlanning";
import CompanyTalents from "./pages/company/CompanyTalents";
import StudentBadge from "./pages/student/StudentBadge";
import PublicProfile from "./pages/shared/PublicProfile";
import LiveInterviewDashboard from "./pages/company/LiveInterviewDashboard";
import ActiveInterviewSession from "./pages/company/ActiveInterviewSession";
import StudentLiveSpace from "./pages/student/StudentLiveSpace";
import { AuthProvider } from "./authContext";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignupChoice />} />
            <Route path="/signup/student" element={<SignupStudent />} />
            <Route path="/signup/company" element={<SignupCompany />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* Common Private Routes (must be logged in) */}
            <Route element={<PrivateRoute><StudentLayout /></PrivateRoute>}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Student Specific Routes */}
            <Route element={<PrivateRoute allowedRoles={["student"]}><StudentLayout /></PrivateRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/saved-jobs" element={<SavedJobs />} />
              <Route path="/interviews" element={<StudentInterviews />} />
              <Route path="/my-badge" element={<StudentBadge />} />
              <Route path="/live" element={<StudentLiveSpace />} />
            </Route>

            <Route element={<PrivateRoute><StudentLayout /></PrivateRoute>}>
              <Route path="/p/:studentId" element={<PublicProfile />} />
            </Route>

            {/* Company Specific Routes */}
            <Route element={<PrivateRoute allowedRoles={["company"]}><StudentLayout /></PrivateRoute>}>
              <Route path="/company-dashboard" element={<CompanyDashboard />} />
              <Route path="/company-applications" element={<CompanyApplications />} />
              <Route path="/company-talents" element={<CompanyTalents />} />
              <Route path="/company-planning" element={<CompanyPlanning />} />
              <Route path="/company/live" element={<LiveInterviewDashboard />} />
              <Route path="/company/live/:id" element={<ActiveInterviewSession />} />
            </Route>
          </Routes>
          <Footer />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

