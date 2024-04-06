import LoginForm from './loginForm';
import { Text, Title, Paper, Box } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import './styles.css';

const generateRedirectArgs = (url: string | string[] | undefined): readonly [string, string] => {
  const defaultRes = ['/', redirectHelperText['/']] as const;
  if (Array.isArray(url)) return defaultRes;

  if (url === undefined) return defaultRes;

  const validRedirects = Object.keys(redirectHelperText);

  const decodedUrl = decodeURIComponent(url);
  const location = decodedUrl.split('?')[0];

  // check if the url is a valid redirect
  // accept query params
  if (validRedirects.includes(location)) {
    return [decodedUrl, redirectHelperText[location as keyof typeof redirectHelperText]];
  } else {
    return defaultRes;
  }
};

const redirectHelperText = {
  '/': 'Redirecting you to the dashboard.',
  '/attendance/verify': 'Redirecting you to verify your attendance.',
  '/service_sessions': 'Redirecting you to the service sessions page.',
  '/attendance': 'Redirecting you to the attendance page.',
  '/attendance/absence': 'Redirecting you to the absence page.',
  '/admin': 'Redirecting you to the admin page.',
  '/announcements': 'Redirecting you to the announcements page.',
  '/profile': 'Redirecting you to the profile page.',
  '/services': 'Redirecting you to the service page.',
};

export default function Login({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [redirectTo, helperText] = generateRedirectArgs(searchParams.redirectTo);

  return (
    <div className='login-page'>
      <div className='login-headers'>
        <Box visibleFrom='sm' className='login-logo'>
          <Image src='/oneinteract.png' alt='OneInteract Logo' fill={true} />
        </Box>
        <div className='login-headers-text'>
          <Title className='login-title'>Log In</Title>
          <Text className='login-text'>
            Enter your credentials to access all of OneInteract's features.
          </Text>
        </div>
      </div>

      <Paper className='login-form-container' shadow='md'>
        <LoginForm redirectTo={redirectTo} helperText={helperText} />
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
