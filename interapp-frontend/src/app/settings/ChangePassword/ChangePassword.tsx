'use client';
import { useState } from 'react';
import { Text, Title, PasswordInput, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import APIClient from '@/api/api_client';
import './styles.css';

interface ChangePasswordFormProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword = () => {
  const form = useForm<ChangePasswordFormProps>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (value) => value.length < 8 && 'Password must be at least 8 characters long',
      newPassword: (value) => {
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (!/\d/.test(value)) return 'Password must include a number';
        if (!/[A-Z]/.test(value)) return 'Password must include an uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must include a lowercase letter';
      },
      confirmPassword: (value, values) => value !== values.newPassword && 'Passwords do not match',
    },
  });

  const [loading, setLoading] = useState(false);
  const apiClient = new APIClient().instance;

  const handlePasswordChange = async (values: ChangePasswordFormProps) => {
    setLoading(true);
    const res = await apiClient.patch('/user/password/change', {
      old_password: values.currentPassword,
      new_password: values.newPassword,
    });
    switch (res.status) {
      case 204:
        notifications.show({
          title: 'Success',
          message: 'Password successfully changed!',
          color: 'green',
        });
        form.reset();
        break;
      case 401:
        notifications.show({
          title: 'Error',
          message: 'Incorrect password!',
          color: 'red',
        });
        break;
      default:
        notifications.show({
          title: 'Error',
          message: 'Error changing password!',
          color: 'red',
        });
    }

    setLoading(false);
  };
  return (
    <>
      <form onSubmit={form.onSubmit(handlePasswordChange)}>
        <div className='change-password-container'>
          <Title order={3}>Change Password</Title>
          <div className='change-password-form'>
            <Text className='change-password-form-label'>Old Password:</Text>
            <PasswordInput {...form.getInputProps('currentPassword')} />
            <Text className='change-password-form-label'>New Password:</Text>
            <PasswordInput {...form.getInputProps('newPassword')} />
            <Text className='change-password-form-label'>Confirm New Password:</Text>
            <PasswordInput {...form.getInputProps('confirmPassword')} />
          </div>
        </div>
        <div className='change-password-button-container'>
          <Button variant='outline' loading={loading} type='submit'>
            Change Password
          </Button>
        </div>
      </form>
    </>
  );
};

export default ChangePassword;
