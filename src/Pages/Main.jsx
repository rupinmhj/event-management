import React, { useState } from 'react'
import Navbar from '../Components/Navbar'
import { Signup } from './Signup'
import { Signin } from './Signin'
import OTPVerification from '@/Components/OtpVerification'
import Footer from '@/Components/Footer'
const Main = () => {
    const [authView, setAuthView] = useState('signup')
    const [showOtp, setShowOtp] = useState(0)
    return (
        <>
            <div className="h-full">
                <div className="fixed top-0 right-0 left-0 z-10 ">
                    <Navbar />
                </div>
                <div className="flex items-center justify-around px-12 py-8 py-[64px]">
                    <section className='flex items-center'>
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Mollitia molestiae blanditiis ipsa.
                    </section>
                    <section  >
                        {
                            showOtp ? (
                                <OTPVerification setShowOtp={setShowOtp} />
                            ) : (
                                authView === 'signup' ? (
                                    <Signup switchToSignin={() => setAuthView('signin')} />
                                ) : (
                                    <Signin setShowOtp={setShowOtp} switchToSignup={() => setAuthView('signup')} />
                                )
                            )
                        }



                    </section>
                </div>
                <div className="  ">
                    <Footer className="h-" />
                </div>
            </div>

        </>
    )
}

export default Main