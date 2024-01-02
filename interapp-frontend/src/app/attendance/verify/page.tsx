
import VerifyAttendance from './VerifyAttendance/VerifyAttendance';

export default function AttendanceVerifyPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  if (searchParams.hash instanceof Array || searchParams.hash === undefined)
    throw new Error('Invalid hash');

  if (searchParams.id instanceof Array || searchParams.id === undefined)
    throw new Error('Invalid id');

  const hash = searchParams.hash as string;
  const id = searchParams.id as string;

  return (
    <VerifyAttendance hash={hash} id={parseInt(id)} />
  );
}
