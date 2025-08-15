
import Navbar from "../Components/admin/Navbar"
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
    return (
        <div className="admin-layout">
            <div className="fixed top-0 right-0 left-0 z-40 ">
                <Navbar mode='login' />
            </div>
            <div className="admin-body ">
                <main className="content ">
                    <Outlet /> {/* Dynamic content */}
                </main>
            </div>
        </div>
    );
}
