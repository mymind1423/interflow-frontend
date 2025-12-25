import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import Home from "./pages/shared/Home";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/student/Dashboard";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import SignupChoice from "./pages/auth/Signupchoice";
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
import LiveInterviewPage from "./pages/shared/LiveInterviewPage";
import StudentInvitations from "./pages/student/StudentInvitations";
import { AuthProvider } from "./authContext";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
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
              <Route path="/invitations" element={<StudentInvitations />} />
              <Route path="/my-badge" element={<StudentBadge />} />
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
              <Route path="/company/live" element={<LiveInterviewPage />} />
            </Route>
          </Routes>
          <Footer />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

