'use client';

import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { useContext, useEffect, useState } from 'react';
import APIClient from '@/api/api_client';
import { Title, Text, Button } from '@mantine/core';
import GoHomeButton from '@/components/GoHomeButton/GoHomeButton';
import { User } from '@/providers/AuthProvider/types';
import './styles.css';

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

const verifyAttendanceUser = async (
  hash: string,
  username: string,
): Promise<{ status: 'Success' | 'Error'; message: string }> => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.post('/service/verify_attendance', {
    hash,
  });
  switch (res.status) {
    case 204:
      return {
        status: 'Success',
        message: 'Attendance verified successfully!',
      };
    case 400:
      return {
        status: 'Error',
        message: 'Invalid attendance hash.',
      };
    case 409:
      return {
        status: 'Error',
        message: 'Attendance already verified.',
      };
    case 401:
      return {
        status: 'Error',
        message: 'You must be logged in to verify attendance.',
      };
    default:
      return {
        status: 'Error',
        message: 'An unknown error occurred.',
      };
  }
};

const updateServiceHours = async (newHours: number) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.patch('/user/service_hours', {
    hours: newHours,
  });
  if (res.status !== 204) throw new Error('Failed to update service hours');
};

const VerifyAttendance = ({ id, hash }: VerifyAttendanceProps) => {
  const { user, updateUser, loading } = useContext(AuthContext);

  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'Success' | 'Error'>();
  const [gainedHours, setGainedHours] = useState(0);

  const handleVerify = (user: User) => {
    verifyAttendanceUser(hash, user.username).then(({ status, message }) => {
      setMessage(message);
      setStatus(status);

      if (status === 'Success') {
        fetchDuration(id).then((data) => {
          updateUser({ ...user, service_hours: user.service_hours + data });
          updateServiceHours(user.service_hours + data);

          setGainedHours(data);
        });
      }
    });
  };

  useEffect(() => {
    if (loading) return;
    if (!user) throw new Error('User not logged in');

    handleVerify(user);
  }, [loading]);

  return (
    <div className='verify-attendance'>
      <Title>Verify Attendance</Title>
      <Text>{message}</Text>
      {status === 'Success' && <Text>You have gained {gainedHours} service hours!</Text>}
      {status === 'Success' ? (
        <GoHomeButton />
      ) : (
        <Button onClick={() => user && handleVerify(user)} variant='outline' color='red'>
          Retry
        </Button>
      )}
    </div>
  );
};

export default VerifyAttendance;
