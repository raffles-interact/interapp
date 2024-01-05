import AbsenceForm from './AbsenceForm/AbsenceForm';
import { Title, Text, Stack } from '@mantine/core';
import GoHomeButton from '@/components/GoHomeButton/GoHomeButton';

export default function Page({
  searchParams,
}: Readonly<{
  searchParams: { [key: string]: string | string[] | undefined };
}>) {
  if (searchParams.id instanceof Array || searchParams.id === undefined)
    return (
      <div className='error-container'>
        <Text>Invalid ID</Text>
        <GoHomeButton />
      </div>
    );

  return (
    <Stack gap={10} m={20}>
      <Title order={2} className='service-box-info-title'>
        Absence Form
      </Title>
      <Text>Please fill in the form below to apply for absence.</Text>
      <AbsenceForm id={parseInt(searchParams.id)} />
    </Stack>
  );
}
