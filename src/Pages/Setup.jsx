import React, { useState } from 'react'
import Navbar from '../Components/Navbar'
import SetupProfile from '../Components/SetupProfile'
import Footer from '@/Components/Footer'
const Setup = () => {
    const [authView, setAuthView] = useState('signup')
    const [showOtp, setShowOtp] = useState(0)
    return (
        <>
            <div className="h-full">
                <div className="fixed top-0 right-0 left-0 z-10 ">
                    <Navbar />
                </div>
                <div className="flex items-center justify-around px-12 py-8 py-[64px]">
                    <SetupProfile />
                </div>
                <div >
                    <Footer />
                </div>
            </div>

        </>
    )
}

export default Setup;