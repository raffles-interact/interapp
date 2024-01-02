import AttendanceMenu from './AttendanceMenu/AttendanceMenu';

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // if there is an id, it must be a number
  if (
    searchParams.id instanceof Array ||
    (searchParams.id && !/^\d+$/.test(searchParams.id as string))
  )
    throw new Error('Invalid id');
  return <AttendanceMenu id={searchParams.id ? parseInt(searchParams.id as string) : undefined} />;
}
