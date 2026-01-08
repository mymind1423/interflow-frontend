import { Outlet } from "react-router-dom";
import CompanyGuide from "../common/CompanyGuide";
import StudentGuide from "../common/StudentGuide";
import BottomNav from "./BottomNav.jsx";
import { useAuth } from "../../authContext";

export default function StudentLayout() {
    const { user } = useAuth();
    // Check roles
    const isStudent = user?.role === 'student' || user?.user_type === 'student';
    // Debug: Ensure company role is detected
    const isCompany =
        (user?.role && user.role.toLowerCase() === 'company') ||
        (user?.user_type && user.user_type.toLowerCase() === 'company') ||
        (user?.userType && user.userType.toLowerCase() === 'company') ||
        (user?.role && user.role.toLowerCase() === 'employer');

    console.log('Layout Debug:', { user, isStudent, isCompany });

    return (
        <div className="pb-16 font-sans text-slate-200">
            <Outlet />
            {isCompany ? <CompanyGuide /> : <StudentGuide />}
            <BottomNav />
        </div>
    );
}
