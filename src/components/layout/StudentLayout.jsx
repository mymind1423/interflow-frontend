import { Outlet } from "react-router-dom";

export default function StudentLayout() {
    return (
        <div className="pb-16 font-sans text-slate-200">
            <Outlet />
        </div>
    );
}
