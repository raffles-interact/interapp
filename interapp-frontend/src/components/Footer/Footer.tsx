import { memo } from 'react';
import { Group, Text } from '@mantine/core';
import './styles.css';

const year = new Date().getFullYear();

const footer = () => {
  return (
    <footer>
      <Group className='footer' justify='center'>
        <Text>© 2023-{year} Raffles Interact</Text>
      </Group>
    </footer>
  );
};

export default memo(footer);
