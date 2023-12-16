import { Text, Title } from '@mantine/core';
import ChangeEmail from './ChangeEmail/ChangeEmail';
import ChangePassword from './ChangePassword/ChangePassword';
import './styles.css';

export default function SettingsPage() {
  return (
    <div className='settings-container'>
      <div>
        <Title order={1}>Settings</Title>
        <Text>Update your settings here!</Text>
      </div>

      <hr className='settings-divider' />
      <section className='settings-account'>
        <div>
          <Title order={2}>Account</Title>
          <Text>Update your account.</Text>
        </div>

        <div className='account-container'>
          <ChangeEmail />
          <ChangePassword />
        </div>
      </section>
    </div>
  );
}
