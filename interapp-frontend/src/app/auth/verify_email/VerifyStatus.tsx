'use client';

import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import APIClient from '@/api/api_client';
import { Loader, Button } from '@mantine/core';
import { useRouter } from 'next/navigation';

const VerifyStatus = ({ token }: { token: string }) => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const apiClient = new APIClient().instance;
  const router = useRouter();

  const handleUserVerify = () => {
    setSuccess(false);
    if (!user) {
      setMessage('You must be logged in to verify your email!');
      return;
    }
    if (!token) {
      setMessage('No token provided!');
      return;
    }
    if (user.verified) {
      setMessage('Your email is already verified!');
      setSuccess(true);
      return;
    }

    setLoading(true);
    apiClient
      .patch('/api/user/verify', { token })
      .then((res) => {
        switch (res.status) {
          case 204:
            updateUser({ ...user, verified: true });
            setMessage(`${user.email} has been verified! Thanks for using Interapp.`);
            setSuccess(true);
            break;
          case 401:
            setMessage('Invalid token provided');
            break;
          default:
            setMessage('Error verifying email');
            break;
        }
      })
      .catch(() => {
        setMessage('Error verifying email');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    handleUserVerify();
  }, []);

  return (
    <>
      {loading ? <Loader /> : message}
      {success ? (
        <Button onClick={() => router.push('/')} variant='outline' color='green'>
          Go Home
        </Button>
      ) : (
        !loading && (
          <Button onClick={handleUserVerify} variant='outline' color='red'>
            Retry
          </Button>
        )
      )}
    </>
  );
};

export default VerifyStatus;
