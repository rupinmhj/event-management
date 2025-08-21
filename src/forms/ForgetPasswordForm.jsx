import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { AiOutlineIdcard } from "react-icons/ai";
import { toast, ToastContainer } from 'react-toastify';
import apiPublic from '../../api';
import { useNavigate } from 'react-router-dom';
export const ForgetPasswordForm = ({ onNext, setUserEmail, onBackToSignIn }) => {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()
    const validate = () => {
        let valid = true;
        setEmailError("");

        if (!email) {
            setEmailError("Email is required");
            valid = false;
        } 

        return valid;
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!validate()) return;
        setLoading(true);

        try {
            const response = await apiPublic.post('/api/account/forgot-password/', {
                email,
            });

            console.log(response.data);
            const { detail } = response.data;
            
            toast.success(detail || 'OTP sent to your email successfully');
            localStorage.setItem('email', email);
            setTimeout(()=>navigate('validation'), 1000);
           

        } catch (error) {
            console.log(error);
            const msg = error?.response?.data?.detail || 
                      error?.response?.data?.email?.[0] || 
                      error?.response?.data?.non_field_errors?.[0] 
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, []);

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
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                                Forgot Password?
                            </h2>
                            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                                Enter your email address and we'll send you an OTP to reset your password
                            </p>
                        </div>

                        <form onSubmit={handleForgotPassword}>
                            <div className="w-full flex flex-col">
                                <div className="relative mb-5">
                                    <AiOutlineIdcard className="dark:invert absolute top-6 text-gray-500 left-4 size-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800 outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-5 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                    />
                                    {emailError && <p className="text-red-500 text-[13px] pl-3">{emailError}</p>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-blue p-4 text-[16px] font-bold text-white rounded-xl mt-6 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Sending OTP..." : "Send OTP"}
                            </button>

                            {onBackToSignIn && (
                                <div onClick={onBackToSignIn} className="flex mt-[35px] justify-center cursor-pointer">
                                    <p className="text-[#71757D] dark:text-gray-400 text-[14px] font-medium">
                                        Remember your password?
                                        <span className="text-[#2869FE]"> Sign In</span>
                                    </p>
                                </div>
                            )}
                        </form>
                    </main>
                </div>
            </div>
            <ToastContainer />
        </motion.div>
    );
};