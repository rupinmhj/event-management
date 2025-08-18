import React, { useEffect, useState } from 'react'

import UserProfile from '@/Components/UserProfile'
import { EventFloat } from '@/Components/user/EventFloat'
import EventRequirement from '@/Components/user/EventRequirement'
import useAxiosAuth from '@/hooks/useAxiosAuth'
export const Dashboard = () => {
    const api = useAxiosAuth();
    const [events,setEvents]=useState();
      useEffect(() => {
          const fetchEventsAndRequirements = async () => {
              try {
                  setLoading(true);
                  const res = await api.get("/api/event/active-events/");
                  console.log('Events data:', res.data);
                  setEvents(res.data);
              } catch (error) {
                  console.error('Error fetching events:', error);
              } finally {
                  setLoading(false);
              }
          };
  
          fetchEventsAndRequirements();
      }, [api]);
  return (
    <div>
      <EventFloat events={events}/>
      <EventRequirement events={events} />
      <UserProfile />
    </div>
  )
}
