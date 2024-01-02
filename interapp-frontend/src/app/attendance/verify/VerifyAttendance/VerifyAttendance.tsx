'use client';

import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { useContext, useEffect, useState } from 'react';
import APIClient from '@/api/api_client';
import { notifications } from '@mantine/notifications';

interface VerifyAttendanceProps {
  id: number;
  hash: string;
}

const fetchDuration = async (id: number) => {
  const apiClient = new APIClient({ useClient: false }).instance;
  const res = await apiClient.get('/service/session', {
    params: { service_session_id: id },
  });
  if (res.status !== 200) throw new Error('Failed to fetch session details');

  const sessionDetails: {
    service_id: number;
    start_time: string;
    end_time: string;
    ad_hoc_enabled: boolean;
    service_session_id: number;
  } = res.data;

  const diff =
    new Date(sessionDetails.end_time).getTime() - new Date(sessionDetails.start_time).getTime();

  const diffHours = diff / (1000 * 60 * 60);

  const rounded = parseFloat(diffHours.toFixed(1));

  return rounded;
};

const verifyAttendanceUser = async (hash: string, username: string) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.post('/service/verify_attendance', {
    hash,
    username,
  });
  switch (res.status) {
    case 204:
      return {
        status: 'Success',
        message: 'Attendance verified successfully',
      };
    case 400:
      return {
        status: 'Error',
        message: 'Invalid attendance hash',
      };
    case 409:
      return {
        status: 'Error',
        message: 'Attendance already verified',
      };
    case 401:
      return {
        status: 'Error',
        message: 'You must be logged in to verify attendance',
      };
    default:
      return {
        status: 'Error',
        message: 'An unknown error occurred',
      };
  }
};

const VerifyAttendance = ({ id, hash }: VerifyAttendanceProps) => {
  const { user, updateUser, loading } = useContext(AuthContext);

  

  

  const [duration, setDuration] = useState<string>('');

  useEffect(() => {
    if (loading) return;
    if (!user) throw new Error('User not logged in')

    verifyAttendanceUser(hash, user.username).then(({status, message}) => {
      notifications.show({
        title: status,
        message,
        color: status === 'Success' ? 'green' : 'red',
      });

      if (status === 'Success') {
        fetchDuration(id).then((data) => {
          updateUser({ ...user, service_hours: user.service_hours + data });
          setDuration(data.toString());
        });
      }
    });
    
  }, [loading]);

  return (
    <div>
      <h1>Verify Attendance</h1>
      <p>Duration: {duration} hours</p>
      <p>Hash: {hash}</p>
      <p>ID: {id}</p>
    </div>
  );
};

export default VerifyAttendance;