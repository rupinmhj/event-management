import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { AiOutlineLock } from "react-icons/ai";
import { toast, ToastContainer } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import apiPublic from '../../api';

export const ResetPasswordForm = ({ onComplete, onBack, mode }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("email") || "";
    const location = useLocation();
    const resetToken = location.state;
    const validate = () => {
        let valid = true;
        setNewPasswordError("");
        setConfirmPasswordError("");

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

        return valid;
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!validate()) return;
        setLoading(true);

        try {
            
            const response = await apiPublic.post('/api/account/reset-password/', {
                reset_token: resetToken,
                new_password: newPassword,
                confirm_new_password: confirmNewPassword,
            });

            console.log(response.data);
            const { detail } = response.data;

            toast.success(detail || 'Password reset successfully! Redirecting to login...');

            // Clear form
            setNewPassword('');
            setConfirmNewPassword('');

            // Redirect to login after success
            setTimeout(() => {
                if (onComplete) {
                    onComplete();
                } else {
                    navigate('/');
                }
            }, 2000);

        } catch (error) {
            console.log(error.response);

            if (error.response?.data) {
                const errorData = error.response.data;

                if (errorData.new_password) {
                    setNewPasswordError(errorData.new_password[0]);
                } else if (errorData.confirm_new_password) {
                    setConfirmPasswordError(errorData.confirm_new_password[0]);
                } else if (errorData.non_field_errors) {
                    toast.error(errorData.non_field_errors[0]);
                } else if (errorData.detail) {
                    toast.error(errorData.detail);
                } else {
                    toast.error('Failed to reset password. Please try again.');
                }
            } else {
                toast.error('Failed to reset password. Please try again.');
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
            <div className="font-sans dark:bg-bgDark dark:text-textDark">
                <div className="px-6 min-w-[420px] mx-auto">
                    <main className="pt-5">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                                Reset Password
                            </h2>
                            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                                Create a new secure password for{' '}
                                <span className="font-medium text-[#2869FE]">{userEmail}</span>
                            </p>
                        </div>

                        <form onSubmit={handleResetPassword}>
                            {/* New Password */}
                            <div className="w-full flex flex-col">
                                <div className="relative mb-5">
                                    <AiOutlineLock className="dark:invert absolute top-6 left-4 text-gray-500 size-5" />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
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
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-[12px] text-gray-600 dark:text-gray-400 mb-3 font-medium">Password requirements:</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className={`flex items-center text-[11px] ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                        <span className="mr-2">{newPassword.length >= 8 ? '✓' : '•'}</span>
                                        At least 8 characters long
                                    </div>
                                    <div className={`flex items-center text-[11px] ${/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                        <span className="mr-2">{/(?=.*[a-z])/.test(newPassword) ? '✓' : '•'}</span>
                                        Contains lowercase letter
                                    </div>
                                    <div className={`flex items-center text-[11px] ${/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                        <span className="mr-2">{/(?=.*[A-Z])/.test(newPassword) ? '✓' : '•'}</span>
                                        Contains uppercase letter
                                    </div>
                                    <div className={`flex items-center text-[11px] ${/(?=.*\d)/.test(newPassword) ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                        <span className="mr-2">{/(?=.*\d)/.test(newPassword) ? '✓' : '•'}</span>
                                        Contains number
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-blue p-4 text-[16px] font-bold text-white rounded-xl mt-6 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Resetting Password..." : "Reset Password"}
                            </button>

                            {onBack && (
                                <div className="flex mt-6 justify-center">
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        className="text-[#2869FE] text-[14px] font-medium hover:underline"
                                    >
                                        ← Back to OTP
                                    </button>
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