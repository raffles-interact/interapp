'use client';

import { useContext, useState, useEffect, memo } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import APIClient from '@api/api_client';
import { Loader, Button } from '@mantine/core';
import GoHomeButton from '@providers/GoHomeButton/GoHomeButton';

interface VerifyStatusResult {
  message: string;
  success: boolean;
}

const VerifyStatus = ({ token }: { token: string }) => {
  const { user, updateUser } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const apiClient = new APIClient().instance;

  const handleUserVerify: () => Promise<VerifyStatusResult> = async () => {
    if (!user) {
      return {
        message: 'You must be logged in to verify your email!',
        success: false,
      };
    }
    if (!token) {
      return {
        message: 'No token provided!',
        success: false,
      };
    }
    if (user.verified) {
      return {
        message: `${user.email} has already been verified!`,
        success: true,
      };
    }

    const res = await apiClient.patch('/user/verify', { token });

    switch (res.status) {
      case 204:
        updateUser({ ...user, verified: true });
        return {
          message: `${user.email} has been verified!`,
          success: true,
        };
      case 401:
        return {
          message: 'Invalid token provided.',
          success: false,
        };
      case 404:
        return {
          message: 'User not found.',
          success: false,
        };
      default:
        return {
          message: 'An unknown error occurred.',
          success: false,
        };
    }
  };

  const handleUpdateVerifyStatus = () => {
    setLoading(true);
    handleUserVerify().then(({ message, success }) => {
      setMessage(message);
      setSuccess(success);
    });
    setLoading(false);
  };

  useEffect(handleUpdateVerifyStatus, []);

  return (
    <>
      {loading ? <Loader /> : message}
      {success ? (
        <GoHomeButton />
      ) : (
        !loading && (
          <Button onClick={handleUpdateVerifyStatus} variant='outline' color='red'>
            Retry
          </Button>
        )
      )}
    </>
  );
};

export default memo(VerifyStatus);
