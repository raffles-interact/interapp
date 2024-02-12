'use client';

import { memo } from 'react';
import { usePathname } from 'next/navigation';
import {
  IconHome,
  IconLogin,
  IconCheck,
  IconPasswordUser,
  IconRadioactive,
  IconSettings,
  IconUserSquare,
  IconSpeakerphone,
  IconPlaylistAdd,
  IconHomeQuestion,
  IconHeart,
  IconQuestionMark,
  type TablerIconsProps,
  IconPencil,
} from '@tabler/icons-react';
import { Group, Text } from '@mantine/core';
import { wildcardMatcher } from '@api/utils';

interface RouteTitle {
  route: string;
  title: string;
  Icon: (props: TablerIconsProps) => JSX.Element;
}

export const getNavbarTitle = (pathname: string) => {
  const routeTitles: RouteTitle[] = [
    {
      route: '/',
      title: 'Home',
      Icon: IconHome,
    },
    {
      route: '/auth/login',
      title: 'Login',
      Icon: IconLogin,
    },
    {
      route: '/auth/signup',
      title: 'Sign Up',
      Icon: IconLogin,
    },
    {
      route: '/auth/verify_email',
      title: 'Verify Email',
      Icon: IconCheck,
    },
    {
      route: '/auth/forgot_password',
      title: 'Forgot Password',
      Icon: IconPasswordUser,
    },
    {
      route: '/auth/forgot_password_verify',
      title: 'Forgot Password Verify',
      Icon: IconPasswordUser,
    },
    {
      route: '/settings',
      title: 'Settings',
      Icon: IconSettings,
    },
    {
      route: '/admin',
      title: 'Admin Page',
      Icon: IconRadioactive,
    },
    {
      route: '/services',
      title: 'Services',
      Icon: IconHeart,
    },
    {
      route: '/service_sessions',
      title: 'Service Sessions',
      Icon: IconPlaylistAdd,
    },
    {
      route: '/attendance',
      title: 'Attendance',
      Icon: IconCheck,
    },
    {
      route: '/attendance/verify',
      title: 'Verify Attendance',
      Icon: IconCheck,
    },
    {
      route: '/attendance/absence',
      title: 'Request for Absence',
      Icon: IconHomeQuestion,
    },
    {
      route: '/announcements',
      title: 'Announcements',
      Icon: IconSpeakerphone,
    },
    {
      route: '/profile',
      title: 'Profile',
      Icon: IconUserSquare,
    },
    {
      route: '/admin',
      title: 'Admin Page',
      Icon: IconRadioactive,
    },
    {
      route: '/services',
      title: 'Services',
      Icon: IconHeart,
    },
    {
      route: '/service_sessions',
      title: 'Service Sessions',
      Icon: IconPlaylistAdd,
    },
    {
      route: '/attendance',
      title: 'Attendance',
      Icon: IconCheck,
    },
    {
      route: '/attendance/verify',
      title: 'Verify Attendance',
      Icon: IconCheck,
    },
    {
      route: '/attendance/absence',
      title: 'Request for absence',
      Icon: IconHomeQuestion,
    },
    {
      route: '/announcements',
      title: 'Announcements',
      Icon: IconSpeakerphone,
    },
    {
      route: '/announcements/create',
      title: 'Create Announcement',
      Icon: IconPencil,
    },
    {
      route: '/announcements/*',
      title: 'Announcements',
      Icon: IconSpeakerphone,
    },

    {
      route: '/profile',
      title: 'Profile',
      Icon: IconUserSquare,
    },
  ];
  const match = routeTitles.find((routeTitle) => wildcardMatcher(pathname, routeTitle.route));
  if (!match) {
    return {
      route: pathname,
      title: 'Page Not Found',
      Icon: IconQuestionMark,
    };
  }
  return match;
};

const NavbarTitle = () => {
  const pathname = usePathname();
  const { title, Icon } = getNavbarTitle(pathname);

  return (
    <Group>
      <Icon size={24} />
      <Text>{title}</Text>
    </Group>
  );
};

export default memo(NavbarTitle);
