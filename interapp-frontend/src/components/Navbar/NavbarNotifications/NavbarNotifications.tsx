import { IconInbox } from '@tabler/icons-react';
import { memo } from 'react';
import './styles.css';

const NavbarNotifications = () => {
  return (
    <div className='navbar-notifications'>
      <IconInbox className='navbar-notifications-icon' />
    </div>
  );
};

export default memo(NavbarNotifications);
