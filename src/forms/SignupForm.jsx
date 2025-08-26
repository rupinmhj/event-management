import React, { useContext, useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { FaAngleLeft, FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { toast, ToastContainer } from 'react-toastify';
import { AiOutlineMail, AiOutlinePhone, AiOutlineLock } from "react-icons/ai";
import images from '../assets/images'
import ThemeContext from '@/context/ThemeContext';
import { CgProfile } from "react-icons/cg";
import { useNavigate } from 'react-router-dom';
// import AuthContext from '@/context/AuthContext';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import apiPublic from '../../api'
export const SignupForm = ({ switchToSignin }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("")
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("")
    const [phoneError, setPhoneError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const api = useAxiosAuth();
    const navigate = useNavigate();
    const validate = () => {
        let valid = "true";
        setNameError("");
        setEmailError("");
        setPhoneError("");
        setPasswordError("");
        setConfirmPasswordError("");
        if (!name) {
            setNameError("Name is required");
            valid = false;
        } else if (!/^[A-Za-z\s'-]+$/.test(name)) {
            setNameError("Enter a valid name.");
            valid = false;
        }
        if (!email) {
            setEmailError("Email is required");
            valid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError("Enter a valid email");
            valid = false;
        }
        if (!phone) {
            setPhoneError("Phone number is required");
            valid = false;
        } else if (phone.length !== 10) {
            setPhoneError("Enter a valid phone number");
            valid = false;
        }
        if (!password) {
            setPasswordError("Password is required.");
            valid = false;
        } else if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)
        ) {
            setPasswordError(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            );
            valid = false;
        }

        if (!confirmPassword) {
            setConfirmPasswordError("Confirm Password is required");
            valid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match!");
            valid = false;
        }

        return valid;

    }

    const handleSignUp = async (e) => {
        e.preventDefault();
        console.log('signup')
        if (!validate()) return;
        setLoading(true);
        try {
            const response = await apiPublic.post('/api/account/register/', {
                full_name_en: name,
                email,
                phone_number: phone,
                password,
            });


            toast.success('Signup successful! Please login.');

            setName('');
            setEmail('');
            setPhone('');
            setPassword('');
            setConfirmPassword('');

            if (switchToSignin) switchToSignin();

        } catch (error) {
            const msg =
                 error.response?.data?.email || error.response?.data?.phone_number ||'Signup failed, try again';
            toast.error(String(msg));
            console.error(msg);
            console.error(error);
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
            <div className=" font-sans dark:bg-bgDark dark:text-textDark ">
                <div className="px-6 min-w-[420px] mx-auto">

                    <main className='pt-5'>
                        <form onSubmit={handleSignUp}>
                            {/* Fullname */}
                            <div className=" w-full flex flex-col">
                                <div className="relative mb-[20px]">
                                    <CgProfile
                                        className="dark:invert absolute top-6 text-gray-500 left-4 size-5"
                                    />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800  outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-5 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                        placeholder="Type Full Name "
                                    />
                                    {nameError && <p className="text-red-500 text-[13px] pl-[12px]">{nameError}</p>}
                                </div>
                            </div>
                            {/* Email */}
                            <div className="w-full flex flex-col">
                                <div className="relative mb-5">
                                    < AiOutlineMail className="dark:invert absolute top-6 text-gray-500 left-4 size-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Type your email"
                                        className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800  outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-5 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                    />
                                    {emailError && <p className="text-red-500 text-[13px] pl-3">{emailError}</p>}
                                </div>
                            </div>



                            {/* Phone */}
                            <div className="w-full flex flex-col">
                                <div className="relative mb-5">
                                    <AiOutlinePhone className="dark:invert absolute top-6 text-gray-500 left-4 size-5" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Enter phone number"
                                        className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800 outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-5 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                    />
                                    {phoneError && <p className="text-red-500 text-[13px] pl-3">{phoneError}</p>}
                                </div>
                            </div>



                            {/* Password */}
                            <div className="w-full flex flex-col">
                                <div className="relative mb-5">
                                    <AiOutlineLock alt="Password" className="dark:invert absolute top-6 left-4 text-gray-500 size-5" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Type your password"
                                        className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800 outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-5 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                    />
                                    <span onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-6 cursor-pointer text-gray-500">
                                        {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                                    </span>
                                    {passwordError && <p className="text-red-500 text-[13px] pl-3">{passwordError}</p>}
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="w-full flex flex-col">
                                <div className="relative mb-5">
                                    <AiOutlineLock alt="Confirm Password" className="dark:invert absolute top-6 text-gray-500 left-4 size-5" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your password"
                                        className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800 outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-5 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                    />
                                    <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-6 cursor-pointer text-gray-500">
                                        {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                                    </span>
                                    {confirmPasswordError && <p className="text-red-500 text-[13px] pl-3">{confirmPasswordError}</p>}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-blue p-4 text-[16px] font-bold text-white rounded-xl mt-6 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Signing Up..." : "Sign Up"}
                            </button>
                        </form>
                        <div onClick={switchToSignin} className="flex mt-[35px] justify-center">
                            <p className="text-[#71757D] dark:text-gray-400 text-[14px] font-medium">
                                Already have an account?
                                <span className="text-[#2869FE] cursor-pointer"> Sign In</span>
                            </p>
                        </div>

                    </main>
                </div>
            </div>
            <ToastContainer />
        </motion.div>
    )
}
