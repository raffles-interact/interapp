'use client';
import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { memo, useRef } from 'react';

interface GoBackButtonProps {
  href: string;
  className?: string;
}

const GoBackButton = ({ href, className }: GoBackButtonProps) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  return (
    <>
      <Button
        onClick={() => linkRef.current?.click()}
        variant='light'
        leftSection={<IconArrowLeft />}
        className={className}
      >
        Go Back
      </Button>
      <Link hidden ref={linkRef} href={href} />
    </>
  );
};

export default memo(GoBackButton);
