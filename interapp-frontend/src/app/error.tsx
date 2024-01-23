'use client';
import GoHomeButton from '@components/GoHomeButton/GoHomeButton';
import { Title, Text, Stack, Button, Code } from '@mantine/core';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  
  return (
    <Stack
      align='center'
      gap={10}
    >
      <Title>Uh Oh!</Title>
      <Text>The application has experienced an error!! 😭😭</Text>
      <Text>Here is the error message:</Text>
      <Code>{error.message}</Code>
      <Code>{error.stack}</Code>
      <Code>{error.digest}</Code>
      <hr style={{ width: '100%', borderTop: '1px solid black' }} />
      <Text>Here are some things you can try:</Text>
      <Stack align='center' gap={5}>
        <Text>
          Please report the error{' '}
          <a href='https://github.com/raffles-interact/interapp/issues'>here</a>, or if you don't
          have a GitHub account, reach out to the relevant people. Please include a description of
          how you produced this error, as well as the error message shown above.
        </Text>
        <Button onClick={reset} variant='outline'>Attempt to recover</Button>
        <GoHomeButton />
      </Stack>
    </Stack>
  );
}
