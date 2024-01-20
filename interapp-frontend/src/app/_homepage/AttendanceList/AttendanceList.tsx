'use client';
import { Text, Title, Skeleton, Stack, Paper, Group, Badge } from '@mantine/core';
import APIClient from '@api/api_client';
import { remapAssetUrl } from '@api/utils';
import { useState, useEffect } from 'react';

import './styles.css';

type FetchAttendanceResponse = {
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

const fetchAttendance = async (username: string, sessionCount: number) => {
  const apiClient = new APIClient().instance;
  const response = await apiClient.get('/service/session_user_bulk?username=' + username);
  if (response.status !== 200) throw new Error('Failed to fetch service sessions');

  const data: FetchAttendanceResponse = response.data.slice(0, sessionCount); // get the first 3 service sessions (most recent)

  data.forEach((serviceSession) => {
    if (serviceSession.promotional_image)
      serviceSession.promotional_image = remapAssetUrl(serviceSession.promotional_image);
  });

  return data;
};

const AttendanceBadge = ({ attended }: Pick<FetchAttendanceResponse[0], 'attended'>) => {
  let color = 'gray';
  if (attended === 'Attended') color = 'green';
  else if (attended === 'Valid Reason') color = 'yellow';
  else if (attended === 'Absent') color = 'red';
  return <Badge color={color}>{attended}</Badge>;
};

interface AttendanceListProps {
  username?: string;
  sessionCount: number;
}

export default function AttendanceList({ username, sessionCount }: AttendanceListProps) {
  const [loading, setLoading] = useState(true);
  const [attendancelist, setAttendanceList] = useState<FetchAttendanceResponse>([]);

  useEffect(() => {
    if (!username) return;
    fetchAttendance(username, sessionCount).then((data) => {
      setAttendanceList(data);
      setLoading(false);
    });
  }, []);

  if (!username || loading) {
    return (
      <Stack gap={5}>
        {[...Array(sessionCount)].map((_, i) => (
          <Skeleton width='100%' height={30} key={i} />
        ))}
      </Stack>
    );
  }
  return (
    <Stack gap={5}>
      {attendancelist.map((attendance) => (
        <Paper shadow='sm' p='md' radius='md' key={attendance.service_session_id}>
          <Group justify='space-between'>
            <Title order={4}>{attendance.name}</Title>
            <AttendanceBadge attended={attendance.attended} />
          </Group>
          <Text c='dimmed'>
            {new Date(attendance.start_time).toLocaleString()} -{' '}
            {new Date(attendance.end_time).toLocaleString()}
          </Text>
        </Paper>
      ))}
    </Stack>
  );
}
