import { Text, Title, Skeleton, Stack, Paper, Group, Badge } from '@mantine/core';
import { useMemo } from 'react';

export type FetchAttendanceResponse = {
  service_id: number;
  start_time: string;
  end_time: string;
  name: string;
  promotional_image?: string | null;
  service_session_id: number;
  username: string;
  ad_hoc: boolean;
  attended: 'Absent' | 'Attended' | 'Valid Reason';
  is_ic: boolean;
}[];

const AttendanceBadge = ({ attended }: Pick<FetchAttendanceResponse[0], 'attended'>) => {
  let color = 'gray';
  if (attended === 'Attended') color = 'green';
  else if (attended === 'Valid Reason') color = 'yellow';
  else if (attended === 'Absent') color = 'red';
  return <Badge color={color}>{attended}</Badge>;
};

interface AttendanceListProps {
  attendance: FetchAttendanceResponse | null;
  sessionCount: number;
}
const LoadingAttendanceList = ({ sessionCount }: { sessionCount: number }) => {
  const list = useMemo(() => [...Array(sessionCount)].map(() => Math.random()), [sessionCount]);
  return (
    <Stack gap={5}>
      {list.map((el) => (
        <Skeleton width='100%' height={30} key={el} />
      ))}
    </Stack>
  );
};
export default function AttendanceList({
  attendance,
  sessionCount,
}: Readonly<AttendanceListProps>) {
  if (attendance === null) return <LoadingAttendanceList sessionCount={sessionCount} />;
  return (
    <Stack gap={5}>
      {attendance.map((el) => (
        <Paper shadow='sm' p='md' radius='md' key={el.service_session_id}>
          <Group justify='space-between'>
            <Title order={4}>{el.name}</Title>
            <AttendanceBadge attended={el.attended} />
          </Group>
          <Text c='dimmed'>
            {new Date(el.start_time).toLocaleString('en-GB')} -{' '}
            {new Date(el.end_time).toLocaleString('en-GB')}
          </Text>
        </Paper>
      ))}
    </Stack>
  );
}
