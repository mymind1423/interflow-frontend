import { Outlet } from "react-router-dom";
import CompanyGuide from "../common/CompanyGuide";

export default function CompanyLayout() {
    return (
        <div className="pb-16 font-sans">
            <Outlet />
            <CompanyGuide />
        </div>
    );
}
