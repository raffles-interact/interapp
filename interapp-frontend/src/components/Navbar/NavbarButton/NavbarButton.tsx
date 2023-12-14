'use client';
import { memo, useContext, useState, useMemo } from 'react';
import {
  IconHome,
  IconLogin,
  IconLogin2,
  IconSettings,
  IconUserSquare,
  IconTableOptions,
  IconSpeakerphone,
  IconPlaylistAdd,
  IconMenu2,
  IconMail,
  type TablerIconsProps,
} from '@tabler/icons-react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { User } from '@/providers/AuthProvider/types';
import { Permissions } from '@/app/route_permissions';
import { Menu } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import APIClient from '@/api/api_client';
import './styles.css';

export type NavbarCategories = 'Authentication' | 'Settings' | 'Administration' | 'General';
const NavbarCategories = ['Authentication', 'Settings', 'Administration', 'General'];

export type NavbarTab = {
  name: string;
  callback: () => void;
  icon: (props: TablerIconsProps) => JSX.Element;
  category: NavbarCategories;
  show?: boolean;
};

export type NavbarActions = {
  goTo: (href: string) => void;
  logout: () => Promise<number>;
  resendVerificationEmail: () => Promise<number>;
};

const generateNavbarTabs: (user: User | null, actions: NavbarActions) => NavbarTab[] = (
  user,
  { goTo, logout, resendVerificationEmail },
) => [
  {
    name: 'Home',
    callback: () => goTo('/'),
    icon: IconHome,
    category: 'General',
  },
  {
    name: 'Login',
    callback: () => goTo('/auth/login'),
    icon: IconLogin,
    show: !user,
    category: 'Authentication',
  },
  {
    name: 'Sign Up',
    callback: () => goTo('/auth/signup'),
    icon: IconLogin,
    show: !user,
    category: 'Authentication',
  },
  {
    name: 'Logout',
    callback: async () =>
      await logout()
        .then((res) => {
          switch (res) {
            case 204:
              notifications.show({
                title: 'Success!',
                message: 'You have been logged out.',
                color: 'green',
              });
              goTo('/');
              break;
            case 401:
              notifications.show({
                title: 'Error!',
                message: 'You are not logged in.',
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
        })
        .catch(() => {
          notifications.show({
            title: 'Error!',
            message: 'Something went wrong.',
            color: 'red',
          });
        }),
    icon: IconLogin2,
    show: !!user,
    category: 'Authentication',
  },
  {
    name: 'Resend Verification Email',
    callback: async () =>
      await resendVerificationEmail()
        .then((res) => {
          switch (res) {
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
        })
        .catch(() => {
          notifications.show({
            title: 'Error!',
            message: 'Something went wrong.',
            color: 'red',
          });
        }),
    icon: IconMail,
    show: !!user && !user.verified && user.permissions.includes(Permissions.CLUB_MEMBER),
    category: 'Authentication',
  },
  {
    name: 'Admin',
    callback: () => goTo('/admin'),
    icon: IconTableOptions,
    show: !!user && user.permissions.includes(Permissions.ADMIN),
    category: 'Administration',
  },
  {
    name: 'Settings',
    callback: () => goTo('/settings'),
    icon: IconSettings,
    show: !!user,
    category: 'Settings',
  },
  {
    name: 'Profile',
    callback: () => goTo('/profile'),
    icon: IconUserSquare,
    show: !!user,
    category: 'Settings',
  },
  {
    name: 'Announcements',
    callback: () => goTo('/announcements'),
    icon: IconSpeakerphone,
    show: !!user,
    category: 'General',
  },
  {
    name: 'Service Sessions',
    callback: () => goTo('/service-sessions'),
    icon: IconPlaylistAdd,
    show: !!user && user.permissions.includes(Permissions.SERVICE_IC),
    category: 'Administration',
  },
];

const catagoriseTabs = (tabs: NavbarTab[]) => {
  const catagorisedTabs = tabs.reduce(
    (acc, tab) => {
      if (tab.show === false) {
        // if show is false, don't show the tab, because it could be undefined which means always show
        return acc;
      }
      if (acc[tab.category] === undefined) {
        acc[tab.category] = [];
      }

      acc[tab.category].push(tab);
      return acc;
    },
    new Object() as { [key in NavbarCategories]: NavbarTab[] },
  );
  return catagorisedTabs;
};

const NavbarButton = () => {
  const router = useRouter();
  const goTo = (href: string) => router.push(href);

  const { user, logout } = useContext(AuthContext);
  const apiClient = new APIClient().instance;
  const resendVerificationEmail = useMemo(
    () => async () =>
      (await apiClient.post('/api/user/verify_email', { username: user?.username })).status,
    [user],
  );

  const tabs = useMemo(
    () => generateNavbarTabs(user, { goTo, logout, resendVerificationEmail }),
    [user, goTo, logout],
  );
  const catagorisedTabs = useMemo(() => catagoriseTabs(tabs), [tabs]);

  const [opened, setOpened] = useState(false);

  return (
    <Menu position='bottom-start'>
      <Menu.Target>
        <IconMenu2 onClick={() => setOpened(!opened)} className='navbar-button' />
      </Menu.Target>
      <Menu.Dropdown>
        {Object.entries(catagorisedTabs).map(([category, tab], idx) => {
          return (
            <div key={category}>
              <Menu.Label>{category}</Menu.Label>
              {tab.map((tab) => {
                return (
                  <Menu.Item
                    key={tab.name}
                    onClick={tab.callback}
                    leftSection={<tab.icon className='navbar-icon' />}
                  >
                    {tab.name}
                  </Menu.Item>
                );
              })}
              {idx !== Object.entries(catagorisedTabs).length - 1 && <Menu.Divider />}
            </div>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};

export default memo(NavbarButton);
