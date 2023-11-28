'use client';
import { TextInput, PasswordInput, Button, Group } from '@mantine/core';
import { useContext } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  username: string;
  password: string;
}

export default function LoginForm() {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const form = useForm<LoginFormProps>({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => value.length === 0 && 'Username is required',
      password: (value) => value.length === 0 && 'Password is required',
    },
  });

  const handleSubmitStatus = (status: number) => {
    switch (status) {
      case 200:
        notifications.show({
          title: 'Success!',
          message: `You have been logged in as ${form.values.username}. Redirecting you to the dashboard.`,
          color: 'green',
        });
        router.push('/');
        break;
      case 401:
        notifications.show({
          title: 'Error',
          message: 'Invalid password. Please try again.',
          color: 'red',
        });
        break;
      case 404:
        notifications.show({
          title: 'Error',
          message: 'User not found. Please try again.',
          color: 'red',
        });
        break;
      default:
        notifications.show({
          title: 'Error',
          message: 'An unknown error occurred',
          color: 'red',
        });
        break;
    }
  };

  const handleSubmit = async (values: LoginFormProps) => {
    login({
      username: values.username,
      password: values.password,
    }).then(handleSubmitStatus);
  };

  return (
    <div>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label='Name' placeholder='Name' {...form.getInputProps('username')} />
        <PasswordInput
          mt='sm'
          label='Password'
          placeholder='Password'
          type='password'
          {...form.getInputProps('password')}
        />

        <Group justify='center'>
          <Button type='submit' mt='sm'>
            Let's Go!
          </Button>
        </Group>
      </form>
    </div>
  );
}
