import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Components/common/Navbar";


export default function AuthLayout() {

  return (

    <div className="admin-layout">
      <Navbar />
      <div className="admin-main bb">alksjdlkdfjlk
        <main >
          <Outlet /> {/* This changes per page */}
        </main>
      </div>
    </div>
  );
}
