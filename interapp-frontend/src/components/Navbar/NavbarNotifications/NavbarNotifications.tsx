'use client';
import {
  IconInbox,
  IconExclamationCircle,
  IconSpeakerphone,
  IconHeart,
  IconMail,
} from '@tabler/icons-react';
import { Drawer, Text, Group, Stack, Indicator, Title } from '@mantine/core';
import { memo, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import NavbarNotificationsBox from './NavbarNotificationsBox/NavbarNotificationsBox';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import APIClient from '@api/api_client';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import './styles.css';
import { Permissions } from '@/app/route_permissions';
import { ClientError } from '@/utils';

const NavbarNotifications = () => {
  const apiClient = new APIClient().instance;
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [opened, setOpened] = useState(false);
  const [userNotifications, setUserNotifications] =
    useState<Awaited<ReturnType<typeof getNotifications>>>();
  const [error, setError] = useState('');

  const getNotifications = useCallback(async () => {
    if (!user) return;
    const res = await apiClient.get('/user/notifications');
    if (res.status !== 200)
      throw new ClientError({
        message: 'Could not get notifications',
        responseStatus: res.status,
        responseBody: res.data,
      });

    const data: {
      unread_announcements: {
        announcement_id: number;
        announcement: {
          title: string;
          description: string;
          creation_date: string;
        };
      }[];
      active_sessions: {
        service_session_id: number;
        service_session: {
          start_time: string;
          end_time: string;
          service: {
            name: string;
          };
        };
      }[];
      verified: boolean;
    } = res.data;

    return data;
  }, [user]);

  const sendVerificationEmail = useCallback(async () => {
    if (!user) return;
    const res = await apiClient.post('/user/verify_email');
    switch (res.status) {
      case 204:
        notifications.show({
          title: 'Success!',
          message: 'Verification email sent.',
          color: 'green',
        });
        break;
      case 400:
        notifications.show({
          title: 'Error!',
          message: 'You are already verified.',
          color: 'red',
        });
        break;
      default:
        notifications.show({
          title: 'Error!',
          message: 'Something went wrong.',
          color: 'red',
        });
        break;
    }
    setOpened(false);
  }, [user]);

  useEffect(() => {
    getNotifications()
      .then((res) => {
        if (!res) return;
        setError('');
        setUserNotifications(res);
      })
      .catch((err) => {
        setError(err.message);
        setUserNotifications(undefined);
      });
  }, [getNotifications, opened]);

  const notificationsDisplay = useMemo(() => {
    if (!userNotifications) return;
    return (
      <>
        {userNotifications?.unread_announcements.length > 0 && (
          <Text size='sm' c='dimmed'>
            New Announcements
          </Text>
        )}
        {userNotifications?.unread_announcements.map((notification) => {
          return (
            <NavbarNotificationsBox
              key={notification.announcement_id}
              title={notification.announcement.title}
              description={notification.announcement.description}
              date={new Date(notification.announcement.creation_date).toLocaleString('en-GB')}
              icon={<IconSpeakerphone color='teal' />}
              onClick={async () => {
                router.push(`/announcements/${notification.announcement_id}`);
                setOpened(false);
              }}
            />
          );
        })}
        {userNotifications?.active_sessions.length > 0 && (
          <Text size='sm' c='dimmed'>
            Active Service Sessions
          </Text>
        )}
        {userNotifications?.active_sessions.map((notification) => {
          return (
            <NavbarNotificationsBox
              key={notification.service_session_id}
              title={notification.service_session.service.name}
              date={new Date(notification.service_session.start_time).toLocaleString('en-GB')}
              icon={<IconHeart color='red' />}
            />
          );
        })}
        {!userNotifications?.verified && (
          <Text size='sm' c='dimmed'>
            Verify Email
          </Text>
        )}
        {userNotifications?.verified ? null : (
          <NavbarNotificationsBox
            title='Verify your account'
            description='Verify your account to gain access to all features.'
            icon={<IconMail color='blue' />}
            onClick={sendVerificationEmail}
          />
        )}
      </>
    );
  }, [userNotifications, router, sendVerificationEmail]);

  const notificationsCount = useMemo(() => {
    if (!userNotifications) return 0;
    const unreadAnnouncements = userNotifications.unread_announcements.length;
    const activeSessions = userNotifications.active_sessions.length;
    const verified = userNotifications.verified ? 0 : 1;
    return unreadAnnouncements + activeSessions + verified;
  }, [userNotifications]);

  if (!user || !user.permissions.includes(Permissions.CLUB_MEMBER)) return <div></div>;
  return (
    <>
      <div
        className='navbar-notifications'
        onClick={() => setOpened(!opened)}
        onKeyDown={(e) => {
          if (e.key === 'F1') setOpened(!opened);
        }}
        role='button'
        tabIndex={0}
      >
        {notificationsCount > 0 ? (
          <Indicator color='blue'>
            <IconInbox className='navbar-notifications-icon' />
          </Indicator>
        ) : (
          <IconInbox className='navbar-notifications-icon' />
        )}
      </div>
      <Drawer position='right' shadow='md' opened={opened} onClose={() => setOpened(false)}>
        <Title order={3} mb='md'>
          Notifications
        </Title>
        {error ? (
          <Group gap={5}>
            <IconExclamationCircle color='red' size={12} />
            <Text c='dimmed' size='sm'>
              {error}
            </Text>
          </Group>
        ) : null}
        <Stack>
          {notificationsCount > 0 && notificationsDisplay ? (
            notificationsDisplay
          ) : (
            <Text c='dimmed' size='sm'>
              No notifications.
            </Text>
          )}
        </Stack>
      </Drawer>
    </>
  );
};

export default memo(NavbarNotifications);
