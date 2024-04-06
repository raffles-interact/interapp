'use client';
import { TextInput, PasswordInput, Button, Group } from '@mantine/core';
import { useContext, useState } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

interface InternalLoginFormProps {
  username: string;
  password: string;
}

type LoginFormProps =
  | {
      redirectTo: string;
      helperText: string;
    }
  | {
      redirectTo?: never;
      helperText?: never;
    };

export default function LoginForm({ redirectTo, helperText }: LoginFormProps) {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<InternalLoginFormProps>({
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
          message: `You have been logged in as ${form.values.username}. ${
            helperText ?? 'Redirecting you to the dashboard.'
          }`,
          color: 'green',
        });
        router.push(redirectTo ?? '/');
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

  const handleSubmit = async (values: InternalLoginFormProps) => {
    setLoading(true);
    login({
      username: values.username,
      password: values.password,
    }).then(handleSubmitStatus);
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label='Username' placeholder='Username' {...form.getInputProps('username')} />
        <PasswordInput
          mt='sm'
          label='Password'
          placeholder='Password'
          type='password'
          {...form.getInputProps('password')}
        />

        <Group justify='center'>
          <Button type='submit' mt='sm' loading={loading}>
            Let's Go!
          </Button>
        </Group>
      </form>
    </div>
  );
}
