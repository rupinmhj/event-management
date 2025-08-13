import { Outlet } from "react-router-dom";
import Navbar from "../components/user/Navbar";
import Footer from "../components/user/Footer";

export default function UserLayout() {
  return (
    <div className="user-layout flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-4 bg-white">
        <Outlet /> {/* Renders the page content */}
      </main>
      <Footer />
    </div>
  );
}
