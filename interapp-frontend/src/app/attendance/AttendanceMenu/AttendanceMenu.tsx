'use client';
import APIClient from '@/api/api_client';
import { useState, useEffect, useContext } from 'react';
import { Stack, Text, Title } from '@mantine/core';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import AttendanceMenuEntry from './AttendanceMenuEntry/AttendanceMenuEntry';
import QRPage from './QRPage/QRPage';
import { ClientError } from '@/utils';

interface AttendanceMenuProps {
  id?: number;
}

export const fetchActiveServiceSessions = async () => {
  const apiClient = new APIClient().instance;
  const response = await apiClient.get('/service/active_sessions');
  if (response.status !== 200) throw new ClientError({ message: 'Failed to fetch active service sessions', responseStatus: response.status, responseBody: response.data });

  const data: {
    [hash: string]: {
      service_session_id: number;
      ICs?: string[];
    };
  }[] = response.data;
  return data;
};

export type fetchActiveServiceSessionsType = Awaited<ReturnType<typeof fetchActiveServiceSessions>>;

const AttendanceMenu = ({ id }: AttendanceMenuProps) => {
  const [activeSessions, setActiveSessions] = useState<fetchActiveServiceSessionsType>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchActiveServiceSessions().then((data) => {
      setActiveSessions(data);
    });
  }, []);
  if (id === undefined) {
    if (Object.keys(activeSessions).length === 0) {
      return (
        <Stack gap={3} m={20}>
          <Title>Verify Attendance</Title>
          <Text>There are no active service sessions.</Text>
        </Stack>
      );
    }

    const destructuredActiveSessions = activeSessions.map((session) => {
      const hash = Object.keys(session)[0];
      const { service_session_id, ICs } = session[hash];
      return { hash, service_session_id, ICs };
    });

    const visibleActiveSessions = destructuredActiveSessions.filter(({ ICs }) => {
      if (ICs === undefined) return true;
      return ICs.includes(user?.username ?? '');
    });

    return (
      <>
        <Stack gap={3} m={20}>
          <Title>Verify Attendance</Title>
          <Text>
            This page shows all ongoing service sessions. Click on a session to view the QR code.
          </Text>
        </Stack>
        <Stack gap={10} m={20}>
          {visibleActiveSessions.map(({ hash, service_session_id }) => {
            return <AttendanceMenuEntry service_session_id={service_session_id} key={hash} />;
          })}
        </Stack>
      </>
    );
  } else {
    const activeSession = activeSessions.find((session) => {
      const hash = Object.keys(session)[0];
      const { service_session_id } = session[hash];
      return service_session_id === id;
    });

    if (activeSession === undefined) {
      return <Text m='1rem'>Session not found!</Text>;
    }

    const hash = Object.keys(activeSession)[0];

    return (
      <>
        <Stack gap={3} m={20}>
          <Title>Verify Attendance</Title>
          <Text>This page shows the QR code for the selected service session.</Text>
        </Stack>
        <QRPage id={id} hash={hash} />
      </>
    );
  }
};

export default AttendanceMenu;
