import { memo } from 'react';
import { Stack, Text } from '@mantine/core';
import './styles.css';

const year = new Date().getFullYear();
const version = process.env.NEXT_PUBLIC_APP_VERSION ? process.env.NEXT_PUBLIC_APP_VERSION : undefined; // check if version is a blank string

const footer = () => {
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
