import { useState } from "react";
import Navbar from "../../Components/common/Navbar";
import Footer from "../../components/Footer";
import OTPVerification from "../../components/OtpVerification";
import {SignupForm} from "../../forms/SignupForm";
import {SigninForm} from "../../forms/SigninForm";

export function AuthPage() {
  const [authView, setAuthView] = useState("signup"); // signup | signin
  const [showOtp, setShowOtp] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-10">
        <Navbar className="" />
      </header>

      {/* Main content */}
      <main className="flex flex-1  h-[80vh] items-center justify-around px-12 py-[64px]">
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

      {/* Footer */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
