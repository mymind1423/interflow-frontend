import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../authContext";

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.status === "pending" && user.userType === "company") {
    return <Navigate to="/pending-approval" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    // Redirect to their respective dashboard based on type
    if (user.userType === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.userType === "company") return <Navigate to="/company-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PrivateRoute;
