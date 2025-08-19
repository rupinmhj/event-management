import React, { useEffect, useState } from 'react'

import UserProfile from '@/Components/UserProfile'
import { EventFloat } from '@/Components/user/EventFloat'
import EventRequirement from '@/Components/user/EventRequirement'
import useAxiosAuth from '@/hooks/useAxiosAuth'
export const Dashboard = () => {
  const api = useAxiosAuth();
  useEffect(()=>{
    window.scrollTo({top:0,left:0, behaviour:"smooth"})
  },[])
  return (
    <div>
      <EventFloat />
      <EventRequirement />
      <UserProfile />
    </div>
  )
}
