import AttendanceMenu from './AttendanceMenu/AttendanceMenu';
import { Text } from '@mantine/core';
import GoHomeButton from '@/components/GoHomeButton/GoHomeButton';
import './error-styles.css';

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Readonly<{ [key: string]: string | string[] | undefined }>;
}) {
  // if there is an id, it must be a number
  if (searchParams.id instanceof Array || (searchParams.id && !/^\d+$/.test(searchParams.id)))
    return (
      <div className='error-container'>
        <Text>Invalid id</Text>
        <GoHomeButton />
      </div>
    );
  return <AttendanceMenu id={searchParams.id ? parseInt(searchParams.id) : undefined} />;
}
