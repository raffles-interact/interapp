'use client';

import { memo, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  IconHome,
  IconLogin,
  IconCheck,
  IconLogin2,
  IconSettings,
  IconUserSquare,
  IconTableOptions,
  IconSpeakerphone,
  IconPlaylistAdd,
  IconMenu2,
  IconQuestionMark,
} from '@tabler/icons-react';
import { Group, Text } from '@mantine/core';

const getNavbarTitle = (pathname: string) => {
  switch (pathname) {
    case '/':
      return {
        title: 'Home',
        Icon: IconHome,
      };
    case '/auth/login':
      return {
        title: 'Login',
        Icon: IconLogin,
      };
    case '/auth/signup':
      return {
        title: 'Sign Up',
        Icon: IconLogin,
      };
    case '/auth/verify_email':
      return {
        title: 'Verify Email',
        Icon: IconCheck,
      };
    default:
      return {
        title: 'Page Not Found',
        Icon: IconQuestionMark,
      };
  }
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
