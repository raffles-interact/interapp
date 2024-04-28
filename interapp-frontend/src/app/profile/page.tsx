'use client';
import { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { ActiveTabContext } from './utils';

import Overview from './Overview/Overview';
import ServiceSessionsPage from './ServiceSessionsPage/ServiceSessionsPage';
import ServiceCardDisplay from './ServiceCardDisplay/ServiceCardDisplay';
import PageSkeleton from '@components/PageSkeleton/PageSkeleton';
import { Text } from '@mantine/core';
import GoHomeButton from '@/components/GoHomeButton/GoHomeButton';
import './styles.css';

export default function Profile() {
  const activeTab = useContext(ActiveTabContext);

  const { user, updateUser, loading } = useContext(AuthContext);

  if (loading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return (
      <div className='profile-notfound-container'>
        <Text>User not found. Please log in again.</Text>
        <GoHomeButton />
      </div>
    );
  }

  switch (activeTab) {
    case 'Overview':
      return <Overview username={user.username} updateUser={updateUser} />;
    case 'Services':
      return <ServiceCardDisplay username={user.username} />;
    case 'Service Sessions':
      return <ServiceSessionsPage username={user.username} />;
  }
}
