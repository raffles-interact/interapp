import NavbarButton from './NavbarButton/NavbarButton';
import NavbarTitle from './NavbarTitle/NavbarTitle';
import NavbarNotifications from './NavbarNotifications/NavbarNotifications';
import { Group } from '@mantine/core';
import './styles.css';

const Navbar = () => {
  return (
    <nav>
      <Group className='navbar' justify='space-between'>
        <NavbarButton />
        <NavbarTitle />
        <NavbarNotifications />
      </Group>
    </nav>
  );
};

export default Navbar;
