import { Outlet } from "react-router-dom";
import StudentGuide from "../common/StudentGuide";
import { useAuth } from "../../authContext";

export default function StudentLayout() {
    const { user } = useAuth();
    // Only show guide for students
    const isStudent = user?.role === 'student' || user?.user_type === 'student';

    return (
        <div className="pb-16 font-sans text-slate-200">
            <Outlet />
            <StudentGuide />

        </div>
    );
}
