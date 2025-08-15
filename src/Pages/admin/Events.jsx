import React, { useContext, useState } from 'react'
import EventList from '@/Components/admin/EventList'
import { motion } from 'framer-motion'
import GeneralContext from "../../context/GeneralContext"
import CreateEvent from '@/Components/admin/CreateEvent'
export const Events = () => {
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
                    {/* {console.log('event',isCreateEvent)} */}
                    <div className="pt-20 min-h-screen ">
                        {isCreateEvent ? <CreateEvent /> : <EventList />}
                    </div>

                </div>
            </motion.div>


        </>
    )
}

