import React, { useState } from 'react'
import Navbar from '../Components/Navbar'
import SetupProfile from '../Components/SetupProfile'
import UserProfile from '@/Components/UserProfile'
import Footer from '@/Components/Footer'
const Dashboard = () => {
    const [authView, setAuthView] = useState('signup')
    const [showOtp, setShowOtp] = useState(0)
    
    return (
        <>
            <div className="h-full">
                <div className="fixed top-0 right-0 left-0 z-10 ">
                    <Navbar mode='login' />
                </div>
                <div className="pt-8">
                    <UserProfile />
                </div>
                <div >
                    <Footer />
                </div>
            </div>

        </>
    )
}

export default Dashboard;