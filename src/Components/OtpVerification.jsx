import React, { useState, useEffect, useRef, useContext } from 'react';
import { Button } from './ui/button';
import AuthContext from '@/context/AuthContext';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import { motion } from 'framer-motion'
const OTPVerification = ({ setShowOtp }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef([]);
    const { login } = useContext(AuthContext);
    const email = localStorage.getItem("email");
    const api = useAxiosAuth();

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);



    const handleInputChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (error) setError('');
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pasted.length; i++) {
            newOtp[i] = pasted[i];
        }
        setOtp(newOtp);
        const nextIndex = newOtp.findIndex(val => val === '') ?? 5;
        inputRefs.current[nextIndex]?.focus();
    };

    const isOtpComplete = otp.every(digit => digit !== '');

    const handleVerify = async () => {
        if (!isOtpComplete) {
            setError('Please enter the complete OTP');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            if (!email) return;
            const otpCode = otp.join('');
            console.log('email', email)
            const response = await api.post('/api/account/verify-otp/', {
                email,
                otp: otpCode,
            });

            if (response.status === 200) {
                login(response.data.tokens);
                setShowOtp(false);
            } else {
                setError('Verification failed. Please try again.');
            }
        } catch (err) {
            const msg = err?.response?.data?.detail;
            console.log('msg', msg)
            setError(msg);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOTP = async () => {
        setIsResending(true);
        setError('');

        try {
            const response = await api.post('/api/account/resend-otp/', {
                email
            });

            if (response.status === 200) {
                setTimeLeft(60);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                setError('Failed to resend OTP. Please try again.');
            }
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to resend OTP. Please try again.';
            setError(msg);
        } finally {
            setIsResending(false);
        }
    };

    const onBack = () => {
        setShowOtp(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
        >
            <div className="w-full max-w-md mx-auto animate-fade-in font-sans">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-event-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-event-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Verify Your Account</h2>
                    <p className="text-muted-foreground text-sm">
                        We've sent a 6-digit verification code to your email
                    </p>
                    <p className="text-sm font-medium text-foreground mt-2">{email}</p>
                </div>

                <div className="mb-6">
                    <div className="flex justify-center space-x-3 mb-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-12 text-center text-lg font-semibold border border-input-border rounded-lg bg-input focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                            />
                        ))}
                    </div>
                    {error && <p className="text-destructive text-sm text-center mb-4">{error}</p>}
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={handleVerify}
                        variant="event"
                        size="lg"
                        className="w-full"
                        disabled={!isOtpComplete || isVerifying}
                    >
                        {isVerifying ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            'Verify OTP'
                        )}
                    </Button>

                    <div className="text-center">
                        {timeLeft > 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Resend OTP in <span className="font-medium text-foreground">{formatTime(timeLeft)}</span>
                            </p>
                        ) : (
                            <button
                                onClick={handleResendOTP}
                                disabled={isResending}
                                className="text-sm text-event-blue hover:underline font-medium disabled:opacity-50"
                            >
                                {isResending ? 'Resending...' : 'Resend OTP'}
                            </button>
                        )}
                    </div>

                    <div className="text-center">
                        <button
                            onClick={onBack}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            ← Back to registration
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>

    );
};

export default OTPVerification;
