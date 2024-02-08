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
  const apiClient = new APIClient().instance;
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
    service_hours: number;
  } = res.data;

  const rounded = parseFloat(sessionDetails.service_hours.toFixed(1));

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
        message: '',
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
    if (user) handleVerify(user);
  }, [loading]);

  if (!loading && !user) {
    return (
      <div className='verify-attendance'>
        <Title>Verify Attendance</Title>
        <Text>You must be logged in to verify attendance.</Text>
        <GoHomeButton />
      </div>
    );
  }

  return (
    <div className='verify-attendance'>
      <Title>Verify Attendance</Title>
      <Text>{message}</Text>
      {status === 'Success' && (
        <Text>Checked in successfully. Added {gainedHours} CCA hours to your account.</Text>
      )}
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
