import { Outlet } from "react-router-dom";
import Navbar from "../Components/common/Navbar";
import images from "@/assets/images";

export default function Password() {
  return (
    <div className="min-h-screen flex flex-col grad">
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-10">
        <Navbar />
      </header>

      {/* Main content (desktop / large screens) */}
      <div className="max-lg:hidden rounded-xl   flex items-center  min-h-screen ">
        <main className="flex flex-1 rounded-xl  mt-2 3xl:mt-4 justify-around max-xl:justify-between px-12 max-md:px-0 md:flex-row mx-auto">
          <div className="flex justify-center rounded-xl  ">
            {/* Left Image Section */}
            <section className="flex max-lg:hidden h-[600px] 3xl:h-[760px]">
              <img
                src={images.banner1}
                className="h-[600px] 3xl:h-[760px] object-cover rounded-l-lg aspect-square"
                alt="Password Banner"
              />
            </section>

            {/* Right Form Section */}
            <section className="flex items-center justify-center max-md:w-full  md:w-[414px] bg-white/20 rounded-r-lg">
              <div className="px-8 py-6 rounded-lg w-full  ">
                <Outlet />
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Mobile / smaller screens */}
      <div className="lg:hidden ">
        <main className="flex flex-1 min-h-screen max-lg:justify-center items-center justify-around max-xl:justify-between px-12  py-[16px]  md:flex-row gap-8 mx-auto">
          {/* Left Image Section */}
          {/* <section className="flex-[0.5] flex max-lg:hidden">
            <img
              src={images.banner1}
              className="h-[400px] md:h-[500px] object-cover aspect-square rounded-lg"
              alt="Password Banner"
            />
          </section> */}

          {/* Right Form Section */}
          <section className=" max-md:w-full bg-white/20 rounded-xl   ">
            <div className="px-4 py-6 rounded-lg ">
              <Outlet />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
