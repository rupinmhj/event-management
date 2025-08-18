import { Outlet } from "react-router-dom";
import Navbar from "../components/user/Navbar";
import Footer from "../components/user/Footer";

export default function UserLayout() {
  return (
    <div className="user-layout flex flex-col min-h-screen">
      <div className="fixed inset-x-0 top-0 bg-white z-50">
      <Navbar />
      </div>
      <main className="flex-1 pt-14">
        <Outlet /> {/* Renders the page content */}
      </main>
      <Footer />
    </div>
  );
}
