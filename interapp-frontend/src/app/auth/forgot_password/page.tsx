import ForgotPasswordForm from './forgotPasswordForm';
import { Text, Title, Paper, Box } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import './styles.css';

export default function ForgotPassword() {
  return (
    <div className='forgot-password-page'>
      <div className='forgot-password-headers'>
        <Box visibleFrom='sm' className='forgot-password-logo'>
          <Image src='/oneinteract.png' alt='OneInteract Logo' fill={true} />
        </Box>
        <div className='forgot-password-headers-text'>
          <Title className='forgot-password-title'>Reset Password</Title>
          <Text className='forgot-password-text'>
            Reset your password by entering your username.
          </Text>
        </div>
      </div>

      <Paper className='forgot-password-form-container' shadow='md'>
        <ForgotPasswordForm />
        <Text className='forgot-password-form-already-member'>
          Go back to <Link href='/auth/login'>Log In</Link>
        </Text>
      </Paper>
    </div>
  );
}
