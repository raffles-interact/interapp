'use client';
import { useContext, useState } from 'react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { Text, Title, TextInput, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import APIClient from '@/api/api_client';
import './styles.css';

const ChangeEmail = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const apiClient = new APIClient().instance;
  if (!user) return null;

  const validateEmail = (email: string) => {
    if (!/^\S+@\S+$/.test(email)) setError('Email must include @ symbol');
    else if (
      process.env.NEXT_PUBLIC_SCHOOL_EMAIL_REGEX &&
      new RegExp(process.env.NEXT_PUBLIC_SCHOOL_EMAIL_REGEX).test(email)
    )
      setError('Email cannot be a school email address');
    else setError('');
    return email;
  };

  const handleEmailChange = async () => {
    if (error) {
      notifications.show({ title: 'Error', message: error, color: 'red' });
      return;
    }
    if (newEmail.length === 0) {
      notifications.show({ title: 'Error', message: 'Email cannot be empty', color: 'red' });
      return;
    }
    setLoading(true);

    const res = await apiClient.patch('/user/change_email', { new_email: newEmail });
    if (res.status === 204) {
      notifications.show({
        title: 'Success',
        message: 'Email successfully changed!',
        color: 'green',
      });
      updateUser({ ...user, email: newEmail });
    } else
      notifications.show({
        title: 'Error',
        message: 'Error changing email!',
        color: 'red',
      });

    setLoading(false);
  };
  return (
    <>
      <div className='change-email-container'>
        <Title order={3}>Change Email</Title>
        <div className='change-email-form'>
          <Text className='change-email-form-label'>Current Email:</Text>
          <Text className='change-email-email'>{user.email}</Text>
          <Text className='change-email-form-label'>New Email:</Text>
          <TextInput onChange={(e) => setNewEmail(validateEmail(e.target.value))} error={error} />
          <Text className='change-email-form-label'>Verification status:</Text>
          {user.verified ? (
            <Text className='change-email-verified'>Verified</Text>
          ) : (
            <Text className='change-email-unverified'>Not Verified</Text>
          )}
        </div>
      </div>
      <div className='change-email-button-container'>
        <Button variant='outline' loading={loading} onClick={handleEmailChange}>
          Change Email
        </Button>
      </div>
    </>
  );
};

export default ChangeEmail;
