'use client';
import { Title, Text, Stack } from '@mantine/core';
import { useMemo, useEffect, useState } from 'react';
import { useInterval } from '@mantine/hooks';

export default function Page429({
  searchParams,
}: Readonly<{
  searchParams: Readonly<{ [key: string]: string | string[] | undefined }>;
}>) {
  const reset = useMemo(() => {
    if (
      searchParams['reset'] &&
      typeof searchParams['reset'] === 'string' &&
      !isNaN(parseInt(searchParams['reset']))
    ) {
      return parseInt(searchParams['reset']);
    }
    return null;
  }, [searchParams]);

  const [per, totalReset] = useMemo(() => {
    // looks like this: policy=2;w=60
    // means 2 per 60 seconds
    if (searchParams['policy'] && typeof searchParams['policy'] === 'string') {
      const [per, totalReset] = searchParams['policy'].split(';w=');
      // ensure that per and totalReset are numbers
      if (isNaN(parseInt(per)) || isNaN(parseInt(totalReset))) {
        return [null, null];
      }
      return [parseInt(per), parseInt(totalReset)];
    }
    return [null, null];
  }, [searchParams]);

  const [seconds, setSeconds] = useState(reset);
  const interval = useInterval(() => {
    if (reset === null) return;
    setSeconds((s) => {
      if (s === null) return s;
      if (s === 0) window.location.href = '/';
      return s - 1;
    });
  }, 1000);

  useEffect(() => {
    interval.start();
    return interval.stop;
  }, []);

  return (
    <Stack align='center' gap={10} p='lg'>
      <Title>429 Too Many Requests ❄️❄️</Title>
      <Text>Woah there, calm down! You've sent too many requests.</Text>
      {per && totalReset && (
        <Text>
          You can send {per} requests every {totalReset} seconds.
        </Text>
      )}
      {seconds !== null && <Text>Redirecting to homepage in {seconds} seconds.</Text>}
    </Stack>
  );
}
