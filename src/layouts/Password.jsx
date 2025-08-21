import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

export default function Password() {
  return (
    <div className="admin-layout">
      <Navbar />
      <div className="admin-main">
         <main className="flex flex-1 h-[80vh] items-center justify-around px-12 py-[64px] md:flex-row flex-col-reverse gap-8">
        <section className="flex-1">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Mollitia molestiae blanditiis ipsa.
        </section>

        <Outlet/>
      </main>
      </div>
    </div>
  );
}