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
import images from "@/assets/images";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

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

  const banners = [images.banner1, images.banner2, images.banner3, images.banner4];


  return (
    <div className="min-h-screen flex flex-col grad ">
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-10">
        <Navbar className="" />
      </header>

      {/* Main content */}
      <div className=" max-lg:hidden md:min-h-[100vh] 3xl:min-h-[90vh] 3xl:mb-[10vh] pt-20 flex items-center rounded-xl">
        <main className="rounded-xl flex flex-1 h-[680px] 3xl:h-[760px] mt-2 3xl:mt-4   max-lg:justify-center   justify-around max-xl:justify-between px-12 max-md:px-0  md:flex-row  mx-auto ">
          <div className=" rounded-xl flex justify-center h-[600px]  3xl:h-[760px]  bg-white/20 ">
            <Swiper
              className=" w-[600px]  3xl:w-[760px]"
              modules={[Autoplay, Pagination]}
              autoplay={{
                delay: 3000,

              }}
              loop={banners.length > 1}
              spaceBetween={10}
            >
              {
                banners.map((banner, index) => (
                  <SwiperSlide key={index}>
                    <section className=" rounded-xl flex max-lg:hidden h-[600px]  3xl:h-[760px]  ">
                      <img src={banner} className="h-[600px] rounded-l-xl  3xl:h-[760px] object-cover aspect-square" alt="" />


                    </section>
                  </SwiperSlide>
                ))
              }
            </Swiper>
            {/* <section className=" rounded-xl flex max-lg:hidden h-[600px]  3xl:h-[760px]  ">
              <img src={images.banner1} className="h-[600px] rounded-l-xl  3xl:h-[760px] object-cover aspect-square" alt="" />


            </section> */}
            <section className=" flex  max-md:w-full  ">
              <div className=" px-4 py-2 rounded-lg bg-white/20 flex items-center">

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



        </main>
      </div>
      {/* Main content */}
      <div className=" lg:hidden ">
        <main className="flex  flex-1 min-h-[100dvh] md:min-h-screen  md:w-[90vw] max-lg:justify-center  items-center justify-around max-xl:justify-between px-12 max-md:px-0 py-[64px] md:flex-row gap-8 mx-auto ">
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
            <div className=" px-4 py-6 rounded-lg bg-white/20">

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
