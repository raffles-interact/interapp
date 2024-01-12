import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { memo } from 'react';

interface GoBackButtonProps {
  href: string;
}

const GoBackButton = ({ href }: GoBackButtonProps) => {
  return (
    <Button component='a' href={href} variant='light' leftSection={<IconArrowLeft />}>
      Go Back
    </Button>
  );
};

export default memo(GoBackButton);
