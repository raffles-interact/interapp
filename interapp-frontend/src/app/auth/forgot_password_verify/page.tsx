import APIClient from '@/api/api_client';
import './styles.css';
import { Title, Text, Code, Button } from '@mantine/core';
import GoHomeButton from '@/components/GoHomeButton/GoHomeButton';

export default async function ForgotPasswordVerifyPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const apiClient = new APIClient({ useClient: false }).instance;
  const token = searchParams.token as string | undefined;
  if (!token) {
    return (
      <div className='forgot-password-container'>
        <Title>Reset Password</Title>
        <Text>No token provided!</Text>
        <GoHomeButton />
      </div>
    );
  }
  const res = await apiClient.patch(`/user/password/reset`, { token });
  switch (res.status) {
    case 200:
      return (
        <div className='forgot-password-container'>
          <Title>Reset Password</Title>
          <Text>
            Your password was reset successfully! Please use the following password to login next
            time.
          </Text>
          <Code className='forgot-password-new-password'>{res.data.temp_password}</Code>
          <Text>Please change your password as soon as possible in the settings menu.</Text>
          <GoHomeButton />
        </div>
      );
    case 401:
      return (
        <div className='forgot-password-container'>
          <Title>Reset Password</Title>
          <Text>Invalid token provided.</Text>
          <GoHomeButton />
        </div>
      );
    default:
      return (
        <div className='forgot-password-container'>
          <Title>Reset Password</Title>
          <Text>An unknown error occurred.</Text>
          <GoHomeButton />
        </div>
      );
  }
}
