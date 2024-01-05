'use client';
import { TextInput, NumberInput, PasswordInput, Button, Group } from '@mantine/core';
import { useContext, useState } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

interface SignUpFormProps {
  user_id: number | '';
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpForm() {
  const { registerUserAccount } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<SignUpFormProps>({
    initialValues: {
      user_id: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      user_id: (value) => {
        if (value === '') return 'User ID is required';
        if (Number.isNaN(Number(value))) return 'User ID must be a number';
      },
      email: (value) => {
        if (value.length === 0) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Email must include @ symbol';
        if (
          process.env.NEXT_PUBLIC_SCHOOL_EMAIL_REGEX &&
          new RegExp(process.env.NEXT_PUBLIC_SCHOOL_EMAIL_REGEX).test(value)
        )
          return 'Email cannot be a school email address';
      },
      username: (value) => value.trim().length < 5 && 'Username must be at least 5 characters long',
      password: (value) => {
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (!/\d/.test(value)) return 'Password must include a number';
        if (!/[A-Z]/.test(value)) return 'Password must include an uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must include a lowercase letter';
      },
      confirmPassword: (value, values) => value !== values.password && 'Passwords do not match',
    },
  });

  const handleSubmitStatus = (status: number) => {
    switch (status) {
      case 201:
        notifications.show({
          title: 'Success!',
          message: 'Your account has been created. Please login.',
          color: 'green',
        });
        router.push('/auth/login');
        break;
      case 409:
        notifications.show({
          title: 'Error',
          message: 'An account with that username already exists',
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

  const handleSubmit = async (values: SignUpFormProps) => {
    setLoading(true);
    registerUserAccount({
      user_id: Number(values.user_id),
      email: values.email,
      username: values.username.trim(),
      password: values.password,
    }).then(handleSubmitStatus);
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group className='signup-form-toprow'>
          <NumberInput
            mt='sm'
            label='User ID'
            placeholder='User ID'
            allowDecimal={false}
            allowNegative={false}
            hideControls
            className='signup-form-userid'
            {...form.getInputProps('user_id')}
          />
          <TextInput
            className='signup-form-username'
            mt='sm'
            label='Username'
            placeholder='Username'
            {...form.getInputProps('username')}
          />
        </Group>

        <TextInput mt='sm' label='Email' placeholder='Email' {...form.getInputProps('email')} />
        <PasswordInput
          mt='sm'
          label='Password'
          placeholder='Password'
          type='password'
          {...form.getInputProps('password')}
        />
        <PasswordInput
          mt='sm'
          label='Confirm Password'
          placeholder='Confirm Password'
          type='password'
          disabled={!form.values.password}
          {...form.getInputProps('confirmPassword')}
        />

        <Group justify='center'>
          <Button type='submit' mt='sm' loading={loading}>
            Submit
          </Button>
        </Group>
      </form>
    </div>
  );
}
