import { memo, useMemo } from 'react';
import { Group, Text } from '@mantine/core';
import './styles.css';

const footer = () => {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer>
      <Group className='footer' justify='center'>
        <Text>© 2023-{year} Raffles Interact</Text>
      </Group>
    </footer>
  );
};

export default memo(footer);
