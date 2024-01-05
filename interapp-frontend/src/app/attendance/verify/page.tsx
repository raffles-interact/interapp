import VerifyAttendance from './VerifyAttendance/VerifyAttendance';
import { Text } from '@mantine/core';
import GoHomeButton from '@/components/GoHomeButton/GoHomeButton';
import './../error-styles.css';

export default function AttendanceVerifyPage({
  searchParams,
}: Readonly<{
  searchParams: { [key: string]: string | string[] | undefined };
}>) {
  if (searchParams.hash instanceof Array || searchParams.hash === undefined)
    return (
      <div className='error-container'>
        <Text>Invalid hash</Text>
        <GoHomeButton />
      </div>
    );

  if (searchParams.id instanceof Array || searchParams.id === undefined)
    return (
      <div className='error-container'>
        <Text>Invalid ID</Text>
        <GoHomeButton />
      </div>
    );

  return <VerifyAttendance hash={searchParams.hash} id={parseInt(searchParams.id)} />;
}
