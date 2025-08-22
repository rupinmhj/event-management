import React, { useContext, useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { AiOutlineIdcard, AiOutlineLock } from "react-icons/ai";
import { toast, ToastContainer } from 'react-toastify';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import AuthContext from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiPublic from '../../api'
export const SigninForm = ({ switchToSignup, setShowOtp }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, logout, authTokens,setHasProfile } = useContext(AuthContext)
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

      

        return valid;
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
            console.log(response.data)

            const { detail, otp_required, email: returnedEmail, access, refresh, user } = response.data;
            logout();
            if (access) {
                login(access, refresh, user.id, user.email, user.role, user.user_full_name, user.phone_number,user.has_profile);
            }
            else {
                localStorage.setItem('email', returnedEmail);

            }

            if (otp_required) {
                setShowOtp(true);
            }
            if(user.has_profile) {
                setHasProfile(true);
            }


            if (access) {
                user.role === "ADMIN" ? navigate('/admin') :
                    navigate(user.has_profile ? '/user' : 'user/setup-profile');
                toast.success(detail || 'Signed in successfully');


                setEmail('');
                setPassword('');
            }



        } catch (error) {
            // const msg = error.response?.data?.detail || error.response?.data?.message || 'Login failed, try again';
            // toast.error(msg);
            // console.log(error.response);
            const msg = error.response.data.non_field_errors[0];
            console.log(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
        >
            <div className="font-sans dark:bg-bgDark dark:text-textDark">
                <div className="px-6 min-w-[420px] mx-auto">
                    <main className="pt-5">
                        <form onSubmit={handleSignIn}>
                            <div className="w-full flex flex-col">
                                <div className="relative mb-5">
                                    <AiOutlineIdcard className="dark:invert absolute top-6 text-gray-500 left-4 size-5" />
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email or Phone"
                                        className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800 outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-5 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                    />
                                    {emailError && <p className="text-red-500 text-[13px] pl-3">{emailError}</p>}
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
                                        className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800 outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-5 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                    />
                                    <span onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-6 cursor-pointer text-gray-500">
                                        {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                                    </span>
                                    {passwordError && <p className="text-red-500 text-[13px] pl-3">{passwordError}</p>}
                                </div>
                            </div>
                            <div onClick={()=>navigate('/forgot-password')} className=" text-[13px] text-[#71757D] hover:text-[#2869FE] cursor-pointer pl-2 pt-2">
                                Forget Password?
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-blue p-4 text-[16px] font-bold text-white rounded-xl mt-6 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Signing In..." : "Sign In"}
                            </button>

                            <div onClick={switchToSignup} className="flex mt-[35px] justify-center cursor-pointer">
                                <p className="text-[#71757D] dark:text-gray-400 text-[14px] font-medium">
                                    Don’t have an account?
                                    <span className="text-[#2869FE]"> Sign Up</span>
                                </p>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
            <ToastContainer />
        </motion.div>
    );
};
