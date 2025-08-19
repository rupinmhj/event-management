import React, { useContext, useEffect } from 'react'
import useAxiosAuth from '@/hooks/useAxiosAuth';
import AuthContext from '@/context/AuthContext';
export const Registration = () => {
  const { authTokens, authReady } = useContext(AuthContext)
  const api = useAxiosAuth();
  useEffect(() => {
    if (!authTokens && !authReady) return;
    const fetchParticipation = async () => {
      const participantRes = await api.get('api/event/own-participation-list/?event=4');
      console.log('ownParticipation-info', participantRes.data);
    }
    fetchParticipation();
  }, [authReady, authTokens])
  return (
    <div>Registration</div>
  )
}
