import LoginForm from './loginForm';
import { Text, Title, Paper, Box } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import './styles.css';

export default function Login() {
  return (
    <div className='login-page'>
      <div className='login-headers'>
        <Box visibleFrom='sm' className='login-logo'>
          <Image src='/interact-logo.png' alt='Interapp Logo' fill={true} />
        </Box>
        <div className='login-headers-text'>
          <Title className='login-title'>Log In</Title>
          <Text className='login-text'>
            Enter your credentials to access all of Interapp's features.
          </Text>
        </div>
      </div>

      <Paper className='login-form-container' shadow='md'>
        <LoginForm />
        <Text className='login-form-already-member'>
          Not a member? <Link href='/auth/signup'>Sign Up</Link>
        </Text>
        <Text className='login-form-forgot-password'>
          Forgot your password? <Link href='/auth/forgot_password'>Reset Password</Link>
        </Text>
      </Paper>
    </div>
  );
}
