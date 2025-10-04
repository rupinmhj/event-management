import { useState } from "react";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../components/Footer";
import OTPVerification from "../../components/OtpVerification";
import { SignupForm } from "../../forms/SignupForm";
import { SigninForm } from "../../forms/SigninForm";
import images from "@/assets/images";
export function AuthPage() {
  const [authView, setAuthView] = useState("signup"); // signup | signin
  const [showOtp, setShowOtp] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#8463ba] via-[#57c793] to-[#586275] ">
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-10">
        <Navbar className="" />
      </header>

      {/* Main content */}
      <div className=" max-lg:hidden md:min-h-[100vh] 3xl:min-h-[90vh] pt-20 flex items-center ">

        <main className="flex flex-1 h-[680px] 3xl:h-[760px] mt-2 3xl:mt-4   max-lg:justify-center   justify-around max-xl:justify-between px-12 max-md:px-0  md:flex-row  mx-auto ">
          <div className="  flex justify-center h-[600px]  3xl:h-[760px]  bg-white ">
            <section className="  flex max-lg:hidden h-[600px]  3xl:h-[760px]  ">
              <img src={images.banner1} className="h-[600px]  3xl:h-[760px] object-cover aspect-square" alt="" />


            </section>

            <section className="flex  max-md:w-full  ">
              <div className=" px-4 py-6 rounded-lg bg-gray-200">
                {showOtp ? (
                  <OTPVerification setShowOtp={setShowOtp} />
                ) : authView === "signup" ? (
                  <SignupForm switchToSignin={() => setAuthView("signin")} />
                ) : (
                  <SigninForm
                    setShowOtp={setShowOtp}
                    switchToSignup={() => setAuthView("signup")}
                  />
                )}
              </div>

            </section>
          </div>
        </main >
      </div>

    </div >
  );
}
