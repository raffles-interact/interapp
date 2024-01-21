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
import Link from 'next/link';
import { Stack, Title, Text, SimpleGrid, Skeleton, Image, Group } from '@mantine/core';
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
  const { user, loading } = useContext(AuthContext);

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

  if (loading) {
    return (
      <div className='homepage'>
        <Skeleton height={200} />
      </div>
    );
  }

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
      <div className='homepage'>
        <Group gap={20} wrap='nowrap' className='homepage-section'>
          <Stack>
            <Title order={1} fw={700}>
              Welcome to Raffles Interact's administrative website!
            </Title>
            <Text>
              This website is used by the Interact Club of Raffles Institution to facilitate admin
              processes in the CCA, allowing them to be carried out more smoothly and in a
              decentralised manner. If you are a member of the club, please log in with your school
              account to access the website.
            </Text>
            <Text>
              If you are not a member of the club, read more about us below! You can also visit our
              official school website{' '}
              <Link
                href='https://www.ri.edu.sg/school-life/co-curricular-activities/year5-6/raffles-interact'
                target='_blank'
              >
                here
              </Link>
              .
            </Text>
          </Stack>
          <Image src='/interact-logo.png' className='homepage-logo' />
        </Group>
        <hr className='homepage-divider' />
        <Group gap={20} wrap='nowrap' className='homepage-section'>
          <Stack align='center'>
            <Image src='/interact-members.jpg' className='homepage-image' />
            <Text c='dimmed' size='sm'>
              Interact Club, 2023
            </Text>
          </Stack>
          <Stack>
            <Title order={2}>What is Interact?</Title>
            <Text>
              Inaugurated in 1963, <span className='homepage-bold'>Raffles Interact</span> is the
              oldest Interact Club in Singapore. As a school-based club, we aspire to inculcate a
              passion for <span className='homepage-bold'>service</span> and{' '}
              <span className='homepage-bold'>volunteerism</span> within school population. Through
              a wide variety of club events and weekly service, we aim to build strong, lasting
              bonds with both the people we serve and serve with. As Interactors, we have
              opportunities to interact with a wide range of social groups including children from
              low-income families, the elderly, persons with disabilities and those in need beyond
              the shores of Singapore. Drawing upon the{' '}
              <span className='homepage-bold'>Rotary Club of Singapore's</span> motto of '
              <span className='homepage-bold'>Service before self</span>', we have the simple wish
              of bringing happiness and warmth to the people around us. Ultimately, we hope your
              service journey will allow you to see that there is much to life beyond yourself, and
              that we all can bring light to others. What unites our family of Interactors is our
              love for the community that we hold so dear to our hearts.
            </Text>
            <Text>
              Every year, Raffles Interacts embarks on multiple projects, including key events and
              service opportunities, to bring about positive change in the community and be of
              service to our beneficiaries.
            </Text>
          </Stack>
        </Group>
        <hr className='homepage-divider' />
        <Stack>
          <Title order={2}>Frequently Asked Questions</Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Stack gap={5}>
              <Title order={3}>What features does the site have?</Title>
              <Text>
                The site has a variety of features that are useful to the club. These include
                attendance taking, announcement sharing, and tracking of service hours.
              </Text>
              <Text>
                If you've got experience with web development and want to contribute to the site,
                check out the{' '}
                <Link href='https://github.com/raffles-interact/interapp'>
                  open-source repository
                </Link>
                !
              </Text>
            </Stack>
            <Stack gap={5}>
              <Title order={3}>Who can access this website?</Title>
              <Text>
                Only members of the Interact Club of Raffles Institution can access this website.
                You must be approved by the relevant admin to be able to access more functionality.
              </Text>
              {user ? (
                <Text>
                  You are currently logged in as{' '}
                  <span className='homepage-bold'>{user.username}</span> (id:{' '}
                  <span className='homepage-bold'>{user.user_id}</span>).
                </Text>
              ) : (
                <Text>
                  You are currently not logged in. Please log in with your school account to access
                  the website.
                </Text>
              )}
            </Stack>
          </SimpleGrid>
        </Stack>
      </div>
    );
  }
}
