import React, { useContext, useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { AiOutlineLock } from "react-icons/ai";
import { toast, ToastContainer } from 'react-toastify';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import AuthContext from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
export const ChangePasswordForm = ({ user }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [oldPasswordError, setOldPasswordError] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { authTokens } = useContext(AuthContext);
    const api = useAxiosAuth();
    const navigate = useNavigate();

    const validate = () => {
        let valid = true;
        setOldPasswordError("");
        setNewPasswordError("");
        setConfirmPasswordError("");

        if (!oldPassword) {
            setOldPasswordError("Current password is required");
            valid = false;
        }

        if (!newPassword) {
            setNewPasswordError("New password is required");
            valid = false;
        } else if (newPassword.length < 8) {
            setNewPasswordError("Password must be at least 8 characters long");
            valid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            setNewPasswordError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
            valid = false;
        }

        if (!confirmNewPassword) {
            setConfirmPasswordError("Please confirm your new password");
            valid = false;
        } else if (newPassword !== confirmNewPassword) {
            setConfirmPasswordError("Passwords do not match");
            valid = false;
        }

        if (oldPassword === newPassword) {
            setNewPasswordError("New password must be different from current password");
            valid = false;
        }

        return valid;
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!validate()) return;
        setLoading(true);

        try {
            const response = await api.post('/api/account/change-password/', {
                old_password: oldPassword,
                new_password: newPassword,
                confirm_new_password: confirmNewPassword,
            });

            console.log(response.data);
            const { detail } = response.data;

            toast.success(detail || 'Password changed successfully');

            // Clear form
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');

            setTimeout(() => {
                navigate('/');
            }, 1000);



        } catch (error) {
            console.log(error.response);

            if (error.response?.data) {
                const errorData = error.response.data;

                // Handle different types of errors
                if (errorData.old_password) {
                    setOldPasswordError(errorData.old_password[0]);
                } else if (errorData.new_password) {
                    setNewPasswordError(errorData.new_password[0]);
                } else if (errorData.confirm_new_password) {
                    setConfirmPasswordError(errorData.confirm_new_password[0]);
                } else if (errorData.non_field_errors) {
                    toast.error(errorData.non_field_errors[0]);
                } else if (errorData.detail) {
                    toast.error(errorData.detail);
                } else {
                    toast.error('Failed to change password. Please try again.');
                }
            } else {
                toast.error('Failed to change password. Please try again.');
            }
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
            <div className={`font-sans dark:bg-bgDark dark:text-textDark  ${user ==='user'?'pt-10':'pt-20'}`}>
                {console.log('      user', user)    }
                <div className="px-6 min-w-[420px] md:max-w-4xl mx-auto">
                    <main className="pt-5">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
                                Change Password
                            </h2>
                            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                                Enter your current password and choose a new one
                            </p>
                        </div>

                        <form onSubmit={handleChangePassword}>
                            {/* Current Password */}
                            <div className="w-full flex flex-col">
                                <div className="relative mb-5">
                                    <AiOutlineLock className="dark:invert absolute top-6 left-4 text-gray-500 size-5" />
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        autoComplete="current-password"
                                        placeholder="Current Password"
                                        className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800 outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-12 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                    />
                                    <span
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-4 top-6 cursor-pointer text-gray-500"
                                    >
                                        {showOldPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                                    </span>
                                    {oldPasswordError && <p className="text-red-500 text-[13px] pl-3">{oldPasswordError}</p>}
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="w-full flex flex-col">
                                <div className="relative mb-5">
                                    <AiOutlineLock className="dark:invert absolute top-6 left-4 text-gray-500 size-5" />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        autoComplete="new-password"
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="New Password"
                                        className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800 outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-12 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                    />
                                    <span
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-6 cursor-pointer text-gray-500"
                                    >
                                        {showNewPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                                    </span>
                                    {newPasswordError && <p className="text-red-500 text-[13px] pl-3">{newPasswordError}</p>}
                                </div>
                            </div>

                            {/* Confirm New Password */}
                            <div className="w-full flex flex-col">
                                <div className="relative mb-5">
                                    <AiOutlineLock className="dark:invert absolute top-6 left-4 text-gray-500 size-5" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmNewPassword}
                                        autoComplete="new-password"
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        placeholder="Confirm New Password"
                                        className="w-full dark:bg-bgDark border border-gray-300 focus:border-blue-800 outline-none text-[12px] shadow-sm rounded-xl mt-3 pl-12 py-3 pr-12 dark:text-white dark:border-gray-600 dark:focus:border-gray-200"
                                    />
                                    <span
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-6 cursor-pointer text-gray-500"
                                    >
                                        {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                                    </span>
                                    {confirmPasswordError && <p className="text-red-500 text-[13px] pl-3">{confirmPasswordError}</p>}
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-[12px] text-gray-600 dark:text-gray-400 mb-2">Password requirements:</p>
                                <ul className="text-[11px] text-gray-500 dark:text-gray-500 space-y-1">
                                    <li className={`${newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                                        • At least 8 characters long
                                    </li>
                                    <li className={`${/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : ''}`}>
                                        • Contains lowercase letter
                                    </li>
                                    <li className={`${/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : ''}`}>
                                        • Contains uppercase letter
                                    </li>
                                    <li className={`${/(?=.*\d)/.test(newPassword) ? 'text-green-600' : ''}`}>
                                        • Contains number
                                    </li>
                                </ul>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-blue p-4 text-[16px] font-bold text-white rounded-xl mt-6 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Changing Password..." : "Change Password"}
                            </button>


                        </form>
                    </main>
                </div>
            </div>
            <ToastContainer />
        </motion.div>
    );
};