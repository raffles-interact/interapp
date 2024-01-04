'use client';
import { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { ActiveTabContext } from './utils';

import UnderConstruction from '@components/UnderConstruction/UnderContruction';
import Overview from './Overview/Overview';
import ServiceSessionsPage from './ServiceSessionsPage/ServiceSessionsPage';

export default function Profile() {
  const activeTab = useContext(ActiveTabContext);

  const { user, updateUser } = useContext(AuthContext);

  switch (activeTab) {
    case 'Overview':
      return <Overview username={user?.username ?? ''} updateUser={updateUser} />;
    case 'Services':
      return <UnderConstruction />;
    case 'Service Sessions':
      return <ServiceSessionsPage username={user?.username ?? ''} />;
    
  }
}
