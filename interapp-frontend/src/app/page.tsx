'use client';
import { useContext, useMemo, useState, useEffect } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { Permissions } from '@/app/route_permissions';

import LatestAnnouncement from '@/app/_homepage/LatestAnnouncement/LatestAnnouncement';
import AttendanceList, {
  type FetchAttendanceResponse,
} from '@/app/_homepage/AttendanceList/AttendanceList';
import NextAttendance from '@/app/_homepage/NextAttendance/NextAttendance';

import APIClient from '@api/api_client';
import { remapAssetUrl } from '@api/utils';

import { Stack, Title, Text, SimpleGrid } from '@mantine/core';
import Image from 'next/image';
import './styles.css';

const fetchAttendance = async (username: string, sessionCount: number) => {
  const apiClient = new APIClient().instance;
  const response = await apiClient.get('/service/session_user_bulk?username=' + username);
  if (response.status !== 200) throw new Error('Failed to fetch service sessions');

  const now = new Date();

  const prevSessions = (response.data as FetchAttendanceResponse)
    .filter((session) => {
      const sessionDate = new Date(session.start_time);
      return sessionDate < now;
    })
    .slice(0, sessionCount)
    .sort((a, b) => {
      const aDate = new Date(a.start_time);
      const bDate = new Date(b.start_time);
      return bDate.getTime() - aDate.getTime();
    })
    .map((session) => {
      if (session.promotional_image) {
        session.promotional_image = remapAssetUrl(session.promotional_image);
      }
      return session;
    });

  // get the next session: sort based on start time, filter out all sessions that have already ended, then get the last element
  const nextSession = (response.data as FetchAttendanceResponse)
    .sort((a, b) => {
      const aDate = new Date(a.start_time);
      const bDate = new Date(b.start_time);
      return aDate.getTime() - bDate.getTime();
    })
    .filter((session) => {
      const sessionDate = new Date(session.end_time);
      return sessionDate > now;
    });

  if (nextSession.length === 0) {
    return [prevSessions, null] as const;
  } else {
    return [prevSessions, nextSession[nextSession.length - 1]] as const;
  }
};

const sessionCount = 4;

export default function Home() {
  const { user } = useContext(AuthContext);

  const [attendancelist, setAttendanceList] = useState<FetchAttendanceResponse | null>(null);
  const [nextSession, setNextSession] = useState<FetchAttendanceResponse[0] | null>(null);

  useEffect(() => {
    if (!user) return;
    // fetch the latest 4 attendance sessions
    fetchAttendance(user.username, sessionCount).then(([prev, next]) => {
      setAttendanceList(prev);
      setNextSession(next);
    });
  }, [user]);

  // checks whether user is an interact member or a visitor; true if interact member, false if visitor
  const has_permission = useMemo(() => {
    if (!user) return false;
    return user.permissions.includes(Permissions.CLUB_MEMBER);
  }, [user]);

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
          <Stack gap={5}>
            <Title order={2}>Latest Announcement</Title>
            <LatestAnnouncement />
          </Stack>
          <Stack gap={5}>
            <Title order={2}>Recent Attendance</Title>
            <AttendanceList attendance={attendancelist} sessionCount={sessionCount} />
          </Stack>
        </SimpleGrid>
        <Stack gap={5}>
          <Title order={2}>Next Session to Attend</Title>
          <NextAttendance nextSession={nextSession} />
        </Stack>
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
