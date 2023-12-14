'use client';
import { TextInput, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import APIClient from '@/api/api_client';

interface ForgotPasswordProps {
  username: string;
}

export default function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordProps>({
    initialValues: {
      username: '',
    },
    validate: {
      username: (value) => value.length === 0 && 'Username is required',
    },
  });

  const apiClient = new APIClient().instance;

  const handleSubmitStatus = (status: number) => {
    switch (status) {
      case 204:
        notifications.show({
          title: 'Sent!',
          message: `An email has been sent to the email of ${form.values.username} with a link to reset your password.`,
          color: 'green',
        });

        break;
      case 404:
        notifications.show({
          title: 'User not found',
          message: 'The user you are trying to reset the password for does not exist.',
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

  const handleSubmit = async (values: ForgotPasswordProps) => {
    const status = (await apiClient.post('/api/user/password/reset_email', values)).status;
    handleSubmitStatus(status);
  };

  return (
    <div>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label='Username' placeholder='Username' {...form.getInputProps('username')} />

        <Group justify='center'>
          <Button type='submit' mt='sm'>
            Let's Go!
          </Button>
        </Group>
      </form>
    </div>
  );
}
