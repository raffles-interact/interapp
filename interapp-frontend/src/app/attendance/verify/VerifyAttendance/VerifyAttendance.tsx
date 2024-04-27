'use client';

import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { useContext, useEffect, useState } from 'react';
import APIClient from '@/api/api_client';
import { Title, Text, Button, Loader } from '@mantine/core';
import GoHomeButton from '@/components/GoHomeButton/GoHomeButton';
import { User } from '@/providers/AuthProvider/types';
import { ClientError } from '@utils/.';
import './styles.css';

interface VerifyAttendanceProps {
  hash: string;
}

interface ErrorResponse {
  status: 'Error';
  message: string;
}

interface SuccessResponse {
  status: 'Success';
  data: {
    start_time: string;
    end_time: string;
    service_hours: number;
    name: string;
    ad_hoc: boolean;
  };
}

type VerifyResponse = ErrorResponse | SuccessResponse;

const verifyAttendanceUser = async (hash: string): Promise<VerifyResponse> => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.post('/service/verify_attendance', {
    hash,
  });

  switch (res.status) {
    case 200:
      return {
        status: 'Success',
        data: res.data satisfies {
          start_time: string;
          end_time: string;
          service_hours: number;
          name: string;
          ad_hoc: boolean;
        },
      };
    case 400:
      return {
        status: 'Error',
        message: 'Invalid attendance hash. QR code likely has expired.',
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
    case 404:
      return {
        status: 'Error',
        message: 'Hash does not match any service session that you are in.',
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
  if (res.status !== 204) throw new ClientError({ message: 'Failed to update service hours', responseStatus: res.status, responseBody: res.data });
};

const VerifyAttendance = ({ hash }: VerifyAttendanceProps) => {
  const { user, updateUser, loading } = useContext(AuthContext);

  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'Success' | 'Error'>();
  const [fetching, setFetching] = useState(true);

  const handleVerify = (user: User) => {
    verifyAttendanceUser(hash).then((res) => {
      // error
      setStatus(res.status);

      if (res.status === 'Error') {
        setMessage(res.message);
        return;
      }

      // success
      const { data } = res;
      const message =
        `Checked in for ${data.name} from ${new Date(data.start_time).toLocaleString(
          'en-GB',
        )} to ${new Date(data.end_time).toLocaleString('en-GB')}. Gained ${
          data.service_hours
        } CCA hours.` + (data.ad_hoc ? ' (Ad-hoc)' : '');

      updateServiceHours(user.service_hours + data.service_hours);
      updateUser({ ...user, service_hours: user.service_hours + data.service_hours });

      setMessage(message);
    });
    setFetching(false);
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

  if (fetching) {
    return (
      <div className='verify-attendance'>
        <Title>Verify Attendance</Title>
        <Loader />
      </div>
    );
  }

  return (
    <div className='verify-attendance'>
      <Title>Verify Attendance</Title>

      <Text>{message}</Text>
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
