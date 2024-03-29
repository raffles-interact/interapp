'use client';
import { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { ActiveTabContext } from './utils';

import Overview from './Overview/Overview';
import ServiceSessionsPage from './ServiceSessionsPage/ServiceSessionsPage';
import ServiceCardDisplay from './ServiceCardDisplay/ServiceCardDisplay';

export default function Profile() {
  const activeTab = useContext(ActiveTabContext);

  const { user, updateUser } = useContext(AuthContext);

  switch (activeTab) {
    case 'Overview':
      return <Overview username={user?.username ?? ''} updateUser={updateUser} />;
    case 'Services':
      return <ServiceCardDisplay username={user?.username ?? ''} />;
    case 'Service Sessions':
      return <ServiceSessionsPage username={user?.username ?? ''} />;
  }
}
