import React from 'react'
import UserProfile from '@/Components/UserProfile'
import { EventFloat } from '@/Components/user/EventFloat'
export const Home = () => {
  return (
    <div>
      <EventFloat />
      <UserProfile />
    </div>
  )
}
