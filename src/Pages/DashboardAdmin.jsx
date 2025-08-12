import React, { useContext, useState } from 'react'
import NavbarAdmin from '../Components/NavbarAdmin'
import Footer from '@/Components/Footer'
import EventList from '../Components/EventList'
import { motion } from 'framer-motion'
import GeneralContext from '../context/GeneralContext'
import CreateEvent from '@/Components/CreateEvent'
const Dashboard = () => {
    const [authView, setAuthView] = useState('signup')
    const [showOtp, setShowOtp] = useState(0)
    const { setIsCreateEvent, isCreateEvent } = useContext(GeneralContext)
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
            >
                <div className="h-full">
                    <div className="fixed top-0 right-0 left-0 z-40 ">
                        <NavbarAdmin mode='login' />
                    </div>
                    <div className="pt-20 min-h-screen px-12">
                        {isCreateEvent ? <CreateEvent /> : <EventList />}
                    </div>
                    <div >
                        <Footer />
                    </div>
                </div>
            </motion.div>


        </>
    )
}

export default Dashboard;