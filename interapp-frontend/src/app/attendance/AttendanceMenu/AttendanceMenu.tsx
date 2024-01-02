'use client';
import { fetchActiveServiceSessions, type fetchActiveServiceSessionsType } from '../page';
import { useState, useEffect, useContext } from 'react';
import { Stack, Text } from '@mantine/core';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import AttendanceMenuEntry from './AttendanceMenuEntry/AttendanceMenuEntry';

const AttendanceMenu = () => {
  const [activeSessions, setActiveSessions] = useState<fetchActiveServiceSessionsType>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchActiveServiceSessions().then((data) => {
      setActiveSessions(data);
    });
  }, []);

  if (Object.keys(activeSessions).length === 0) {
    return <Text>No active sessions!</Text>;
  }

  const destructuredActiveSessions = activeSessions.map((session) => {
    const hash = Object.keys(session)[0];
    const { service_session_id, ICs } = session[hash];
    return { hash, service_session_id, ICs };
  });

  const visibleActiveSessions = destructuredActiveSessions.filter(({ ICs }) => {
    return ICs.includes(user?.username ?? '');
  });

  return (
    <Stack gap={10} m={10}>
      {visibleActiveSessions.map(({ hash, service_session_id }) => {
        return <AttendanceMenuEntry service_session_id={service_session_id} key={hash} />;
      })}
    </Stack>
  );
};

export default AttendanceMenu;
