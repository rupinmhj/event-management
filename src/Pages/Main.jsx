import React, { useState } from 'react'
import Navbar from '../Components/Navbar'
import { Signup } from './Signup'
import { Signin } from './Signin'
import OTPVerification from '@/Components/OtpVerification'

const Main = () => {
    const [authView, setAuthView] = useState('signup')
    const [showOtp, setShowOtp] = useState(1)
    return (
        <>
            <Navbar />
            <div className="flex items-center justify-around px-6 ">
                <section className='flex items-center'>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Mollitia molestiae blanditiis ipsa.
                </section>
                <section>
                    {
                        showOtp ? (
                            <OTPVerification setShowOtp={setShowOtp}/>
                        ) : (
                            authView === 'signup' ? (
                                <Signup switchToSignin={() => setAuthView('signin')} />
                            ) : (
                                <Signin setShowOtp={setShowOtp}  switchToSignup={() => setAuthView('signup')} />
                            )
                        )
                    }



                </section>
            </div>
        </>
    )
}

export default Main