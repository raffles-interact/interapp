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
  IconHeart,
  type TablerIconsProps,
  IconCheck,
  IconFileExport,
} from '@tabler/icons-react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { User } from '@providers/AuthProvider/types';
import { Permissions } from '@/app/routePermissions';
import { Menu } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import './styles.css';

export type NavbarCategories = 'Authentication' | 'Settings' | 'Administration' | 'General';
const NavbarCategories = ['Authentication', 'Settings', 'Administration', 'General'];

export type NavbarTab = {
  name: string;
  callback: (() => void) | (() => Promise<void>);
  icon: (props: TablerIconsProps) => JSX.Element;
  category: NavbarCategories;
  show?: boolean;
};

export type NavbarActions = {
  goTo: (href: string) => void;
  logout: () => Promise<number>;
};

const generateNavbarTabs: (user: User | null, actions: NavbarActions) => NavbarTab[] = (
  user,
  { goTo, logout },
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
    callback: async () => {
      const res = await logout();
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
    },

    icon: IconLogin2,
    show: !!user,
    category: 'Authentication',
  },
  {
    name: 'Admin Dashboard',
    callback: () => goTo('/admin'),
    icon: IconTableOptions,
    show: !!user && user.permissions.includes(Permissions.ADMIN),
    category: 'Administration',
  },
  {
    name: 'Services',
    callback: () => goTo('/services'),
    icon: IconHeart,
    show: !!user && user.permissions.includes(Permissions.CLUB_MEMBER),
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
    show: !!user && user.permissions.includes(Permissions.CLUB_MEMBER),
    category: 'Settings',
  },
  {
    name: 'Announcements',
    callback: () => goTo('/announcements'),
    icon: IconSpeakerphone,
    show: !!user && user.permissions.includes(Permissions.CLUB_MEMBER),
    category: 'General',
  },
  {
    name: 'Service Sessions',
    callback: () => goTo('/service_sessions'),
    icon: IconPlaylistAdd,
    show:
      !!user &&
      (user.permissions.includes(Permissions.SERVICE_IC) ||
        user.permissions.includes(Permissions.MENTORSHIP_IC)),
    category: 'Administration',
  },
  {
    name: 'Attendance',
    callback: () => goTo('/attendance'),
    icon: IconCheck,
    show:
      !!user &&
      (user.permissions.includes(Permissions.SERVICE_IC) ||
        user.permissions.includes(Permissions.MENTORSHIP_IC)),
    category: 'Administration',
  },
  {
    name: 'Exports',
    callback: () => goTo('/exports'),
    icon: IconFileExport,
    show: !!user && user.permissions.includes(Permissions.ATTENDANCE_MANAGER),
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

  const tabs = useMemo(() => generateNavbarTabs(user, { goTo, logout }), [user, goTo, logout]);
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
