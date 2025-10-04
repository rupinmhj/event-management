import React, { useContext, useEffect } from 'react'

import UserProfile from '@/Components/UserProfile'
import { EventFloat } from '@/Components/user/EventFloat'
import EventRequirement from '@/Components/user/EventRequirement'
import AuthContext from '@/context/AuthContext'
import EventList from '@/Components/user/EventList'

export const Dashboard = () => {
  const { hasProfile } = useContext(AuthContext);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  console.log('hasProfile', hasProfile);

  return (
    <div>
      {/* <EventFloat />
      <EventRequirement /> */}
      <EventList />
      {/* <UserProfile hasProfile={hasProfile} /> */}
    </div>
  )
}
