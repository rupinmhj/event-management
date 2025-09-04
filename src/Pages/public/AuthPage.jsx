import { useState } from "react";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../components/Footer";
import OTPVerification from "../../components/OtpVerification";
import { SignupForm } from "../../forms/SignupForm";
import { SigninForm } from "../../forms/SigninForm";
import { useContext, useEffect } from "react";
import AuthContext from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
export function AuthPage() {
  const [authView, setAuthView] = useState("signin"); // signup | signin
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();
  const { role, authTokens } = useContext(AuthContext);
  const has_profile = localStorage.getItem('has_profile');
  // useEffect(() => {
  //   console.log("____", role)
  //   console.log("____", authTokens)
  //   if (authTokens && role === 'ADMIN') {
  //     navigate('/admin')
  //   }
  //   if (authTokens && role === 'USER' && has_profile===false) {
  //     navigate('/user/setup-profile')
  //   }
  //   if (authTokens && role === 'USER') {
  //     navigate('/user')
  //   }
  // }, [navigate, authTokens, role])

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
    <div className="min-h-screen flex flex-col ">
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-10">
        <Navbar className="" />
      </header>

      {/* Main content */}
      <main className="flex flex-1 h-[80vh] items-center justify-around px-12 py-[64px] md:flex-row flex-col-reverse gap-8">
        <section className="flex-1">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Mollitia molestiae blanditiis ipsa.
        </section>

        <section className="flex-1 max-w-md">
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
        </section>
      </main>


    </div>
  );
}
