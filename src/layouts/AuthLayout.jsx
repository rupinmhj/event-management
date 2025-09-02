import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";


export default function AuthLayout() {

  return (

    <div className="admin-layout">
      <Navbar />
      <div className="admin-main">
        <main>
          <Outlet /> {/* This changes per page */}
        </main>
      </div>
    </div>
  );
}
