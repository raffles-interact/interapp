import { Text, Title, Paper } from '@mantine/core';
import { type FetchAttendanceResponse } from '../AttendanceList/AttendanceList';
import './styles.css';

interface NextAttendanceProps {
  nextSession: FetchAttendanceResponse[0] | null;
}

export default function NextAttendance({ nextSession }: NextAttendanceProps) {
  if (nextSession === null) {
    return (
      <Paper shadow='sm' p='md' radius='md'>
        <Text c='dimmed'>No upcoming services</Text>
      </Paper>
    );
  }
  return (
    <Paper shadow='sm' p='md' radius='md'>
      <Title order={4}>{nextSession.name}</Title>
      <Text c='dimmed'>
        {new Date(nextSession.start_time).toLocaleString('en-GB')} -{' '}
        {new Date(nextSession.end_time).toLocaleString('en-GB')} (
        {new Date(nextSession.start_time).toLocaleString('en-GB', { weekday: 'long' })})
      </Text>
    </Paper>
  );
}
