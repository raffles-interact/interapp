import { memo } from 'react';
import { Stack, Text } from '@mantine/core';
import './styles.css';

const year = new Date().getFullYear();

const footer = async () => {
  const getVersion = async () => {
    'use server';
    return process.env.NEXT_PUBLIC_APP_VERSION;
  };

  const version = await getVersion();

  return (
    <footer>
      <Stack className='footer' align='center' gap={2}>
        <Text>© 2023-{year} Raffles Interact</Text>
        {version && <Text>Version: {version}</Text>}
      </Stack>
    </footer>
  );
};

export default memo(footer);
