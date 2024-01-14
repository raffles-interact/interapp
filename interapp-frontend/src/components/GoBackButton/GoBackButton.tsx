import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { memo, useRef } from 'react';

interface GoBackButtonProps {
  href: string;
}

const GoBackButton = ({ href }: GoBackButtonProps) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  return (
    <>
      <Button
        onClick={() => linkRef.current?.click()}
        variant='light'
        leftSection={<IconArrowLeft />}
      >
        Go Back
      </Button>
      <Link hidden ref={linkRef} href={href} />
    </>
  );
};

export default memo(GoBackButton);
