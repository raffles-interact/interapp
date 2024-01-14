import Link from 'next/link';
import { Button } from '@mantine/core';
import { memo, useRef } from 'react';

const GoHomeButton = () => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  return (
    <>
      <Button onClick={() => linkRef.current?.click()} variant='outline' color='green'>
      Go Home
      </Button>
      <Link hidden ref={linkRef} href='/' />
    </>
    
  );
};

export default memo(GoHomeButton);
