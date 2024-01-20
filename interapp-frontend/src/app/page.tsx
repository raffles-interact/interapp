'use client';
import { useContext, useMemo } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { useRouter } from 'next/navigation';
import { Permissions } from '@/app/route_permissions';

import LatestAnnouncement from '@/app/_homepage/LatestAnnouncement/LatestAnnouncement';
import ServiceList from '@/app/_homepage/ServiceList/ServiceList';
import AttendanceList from '@/app/_homepage/AttendanceList/AttendanceList';

import { Group, Stack, Title, Text, SimpleGrid } from '@mantine/core';
import Image from 'next/image';
import './styles.css';

export default function Home() {
  const { user, logout } = useContext(AuthContext);

  // checks whether user is an interact member or a visitor; true if interact member, false if visitor
  const has_permission = useMemo(() => {
    if (!user) return false;
    return user.permissions.includes(Permissions.CLUB_MEMBER);
  }, [user]);
  // website will return DIFFERENT pages for interact members and visitors
  // for the Announcement, Service and Attendance lists, I created components that are supposed to return summarised versions of these 3 things respectively
  // but I haven't added API calls to the backend yet
  //
  // page shown to visitors just supposed to be an overview of Interact + a call to join
  if (has_permission) {
    return (
      <div className='homepage'>
        <Stack gap={5}>
          <Title order={1} fw={700}>
            Hello {user?.username}, welcome back to Interapp.
          </Title>
          <Text>Here are your updates for what's happening in Interact today.</Text>
          <hr className='homepage-divider' />
        </Stack>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <div>
            <Title order={2}>Latest Announcement</Title>
            <LatestAnnouncement />
          </div>
          <div>
            <Title order={2}>Recent Attendance</Title>
            <AttendanceList username={user?.username} sessionCount={4} />
          </div>
        </SimpleGrid>
        <ServiceList />
      </div>
    );
  } else {
    return (
      <div className='body'>
        <h1>Welcome to Raffles Interact's official website!</h1>
        <div className='image-container'></div>
        <p>You can...</p>
        <ul>
          <li>View recent announcements</li>
          <li>Check your services</li>
          <li>Log your service session hours</li>
          <li>Mark your attendance (or not, with a valid reason)</li>
        </ul>
      </div>
    );
  }
}
