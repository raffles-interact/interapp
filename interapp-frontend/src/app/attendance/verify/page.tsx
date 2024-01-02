import VerifyAttendance from './VerifyAttendance/VerifyAttendance';
import { Text } from '@mantine/core';
import GoHomeButton from '@/components/GoHomeButton/GoHomeButton';
import './../error-styles.css';

export default function AttendanceVerifyPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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
        <Text>Invalid hash</Text>
        <GoHomeButton />
      </div>
    );

  const hash = searchParams.hash as string;
  const id = searchParams.id as string;

  return <VerifyAttendance hash={hash} id={parseInt(id)} />;
}
