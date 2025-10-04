import { useState } from "react";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../Components/Footer";
import OTPVerification from "../../Components/OtpVerification";
import { SignupForm } from "../../forms/SignupForm";
import { SigninForm } from "../../forms/SigninForm";
import { useContext, useEffect } from "react";
import AuthContext from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import EventList from "@/Components/common/EventList";
export function AuthPage() {
  const [authView, setAuthView] = useState("signin"); // signup | signin
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();
  const { role, authTokens } = useContext(AuthContext);
  const has_profile = localStorage.getItem('has_profile');


  useEffect(() => {
    console.log("____role", role);
    console.log("____authTokens", authTokens);
    console.log("__hasprofile authpage", has_profile);
    if (authTokens) {
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'USER' && has_profile == "undefined") {
        navigate('/user/setup-profile');
      } else if (role === 'USER') {
        navigate('/user');
      }
    }
  }, [navigate, authTokens, role, has_profile]);


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#8463ba] via-[#57c793] to-[#586275] ">
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-10">
        <Navbar className="" />
      </header>

      {/* Main content */}
      <div className=" ">
        <main className="flex flex-1 min-h-[70dvh] md:min-h-screen  md:w-[90vw] max-lg:justify-center  items-center justify-around max-xl:justify-between px-12 max-md:px-0 py-[64px] md:flex-row gap-8 mx-auto ">
          <section className="flex-[0.5] flex max-lg:hidden ">
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-2 md:space-y-3">
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl 
                 font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 
                 bg-clip-text text-transparent leading-tight  pb-2"
                >
                  Welcome to Our Event Management System
                </h1>
                <div
                  className="w-12 md:w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 
                 mx-auto lg:mx-0 rounded-full"
                ></div>
              </div>

              <p
                className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl 
               text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Plan, organize, and manage events with ease. From ticketing and scheduling to
                real-time updates, our platform empowers organizers and attendees to create
                unforgettable experiences.
              </p>
            </div>

          </section>

          <section className="flex-[0.4] flex  max-md:w-full  mt-6 ">
            <div className=" px-4 py-6 rounded-lg bg-white">

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
        </main>
      </div>

      <EventList />



    </div>
  );
}
