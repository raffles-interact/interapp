import { Text, Title } from '@mantine/core';

import './styles.css';

export default function SettingsPage() {
  return (
    <div className='settings-container'>
      <div>
        <Title order={1}>Settings</Title>
        <Text>Update your settings here!</Text>
      </div>

      <hr className='settings-divider' />
      <section className='account' id='account'>
        <div>
          <Title order={2}>Account</Title>
          <Text>Update your account details here!</Text>
        </div>

        <div className='account-container'>
          <Text className='description bold'>Change Email</Text>
          <p>Not Implemented</p> {/*TODO*/}
          <Text className='description bold'>Change Password</Text>
          <p>Not Implemented</p> {/*TODO*/}
        </div>
      </section>
    </div>
  );
}
