import { Outlet } from "react-router-dom";
import Navbar from "../Components/user/Navbar";
import Footer from "../Components/user/Footer";

export default function UserLayout() {
  return (
    <div className="user-layout flex flex-col min-h-screen">
      <div className="fixed inset-x-0 top-0 bg-white z-50 ">
        <Navbar />
      </div>
      <main className="flex-1 pt-14 min-h-screen grad  ">
        <Outlet /> {/* Renders the page content */}
      </main>
      {/* <Footer /> */}
    </div>
  );
}
