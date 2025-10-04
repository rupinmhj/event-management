import React, { useContext, useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { AiOutlineIdcard, AiOutlineLock } from "react-icons/ai";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import AuthContext from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiPublic from '../../api';

export const SigninForm = ({ switchToSignup, setShowOtp }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, logout, authTokens, setHasProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const validate = () => {
        let valid = true;
        setEmailError("");
        setPasswordError("");

        if (!email) {
            setEmailError("Email or phone number is required");
            valid = false;
        } else if (!/^\d{10}$/.test(email) && !/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError("Enter a valid email or 10-digit phone number");
            valid = false;
        }

        if (!password) {
            setPasswordError("Password is required");
            valid = false;
        }

        return valid;
    };

    const handleNavigation = (role, hasProfile) => {
        if (role === "USER") {
            setTimeout(() => navigate(hasProfile ? "/user" : "/user/setup-profile"), 2500);
        } else if (role === "ADMIN") {
            setTimeout(() => navigate("/admin"), 2500);
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();

        if (!validate()) return;
        setLoading(true);

        try {
            const response = await apiPublic.post('/api/account/login/', {
                email,
                password,
            });

            console.log('Sign in response:', response.data);

            const { detail, otp_required, email: returnedEmail, access, refresh, user } = response.data;

            // Clear any existing auth first
            logout();

            if (access) {
                login(access, refresh, user.id, user.email, user.role, user.user_full_name, user.phone_number, user.has_profile);
            } else {
                localStorage.setItem('email', returnedEmail);
            }

            // Handle OTP requirement
            if (otp_required) {
                toast.info("Please verify your OTP to complete login", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setShowOtp(true);
                return;
            }

            // Handle successful login with access token
            if (access && user) {
                // Clear form fields
                setEmail("");
                setPassword("");

                // Set profile status
                if (user?.has_profile) {
                    setHasProfile(true);
                }

                // Show success toast based on user role
                if (user.role === "USER") {
                    toast.success("Welcome back! Redirecting to your dashboard...", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        onClose: () => handleNavigation(user.role, user.has_profile)
                    });
                } else if (user.role === "ADMIN") {
                    toast.success("Admin login successful! Redirecting...", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        onClose: () => handleNavigation(user.role, user.has_profile)
                    });
                } else {
                    toast.success(detail || "Login successful!", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        onClose: () => handleNavigation(user.role, user.has_profile)
                    });
                }
            }

        } catch (error) {
            console.error("Login error:", error);

            let errorMessage = 'Login failed, please try again';

            if (error.response?.data) {
                if (error.response.data.non_field_errors?.[0]) {
                    errorMessage = error.response.data.non_field_errors[0];
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }

            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, []);

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
            >
                <div className="font-sans dark:bg-bgDark dark:text-textDark">
                    <div className="md:px-6 min-w-[300px] md:min-w-[500px] mx-auto">
                        <main className="pt-5">
                            <form onSubmit={handleSignIn}>
                                <div className="w-full flex flex-col">
                                    <div className="w-full flex justify-center text-[20px] font-bold pb-6 text-blue">
                                        Quick Sign In!
                                    </div>

                                    <div className="relative mb-5">
                                        <AiOutlineIdcard className="dark:invert absolute top-6 text-gray-500 left-4 size-5" />
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email or Phone"
                                            className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800 outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-5 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                        />
                                        {emailError && (
                                            <p className="text-red-500 text-[13px] pl-3 mt-1">
                                                {emailError}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full flex flex-col">
                                    <div className="relative mb-5">
                                        <AiOutlineLock className="dark:invert absolute top-6 left-4 text-gray-500 size-5" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800 outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-12 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-6 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                                        </button>
                                        {passwordError && (
                                            <p className="text-red-500 text-[13px] pl-3 mt-1">
                                                {passwordError}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-[13px] text-[#71757D] hover:text-[#2869FE] cursor-pointer pl-2 pt-2 transition-colors focus:outline-none"
                                >
                                    Forgot Password?
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-blue p-4 text-[16px] font-bold text-white rounded-xl mt-6 transition-all duration-200 ${loading
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5"
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Signing In...
                                        </span>
                                    ) : (
                                        "Sign In"
                                    )}
                                </button>

                                <div onClick={switchToSignup} className="flex mt-[35px] justify-center cursor-pointer">
                                    <p className="text-[#71757D] dark:text-gray-400 text-[14px] font-medium hover:text-gray-600 transition-colors">
                                        Don't have an account?
                                        <span className="text-[#2869FE] hover:underline ml-1">Sign Up</span>
                                    </p>
                                </div>
                            </form>
                        </main>
                    </div>
                </div>
            </motion.div>

            {/* Toast Container with enhanced configuration */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{
                    zIndex: 99999,
                    fontSize: '14px'
                }}
                toastStyle={{
                    borderRadius: '8px',
                }}
            />
        </>
    );
};